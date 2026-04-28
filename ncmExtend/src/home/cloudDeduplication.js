import { createBigButton, showTips, showConfirmBox, isLiveSong, escapeHtml, createPagination } from '../utils/common';
import { weapiRequestSync } from '../utils/request';
import { getMD5 } from '../utils/crypto';
import { fileSizeDesc, duringTimeDesc, dateDesc } from '../utils/descHelper';

export const cloudDeduplication = (uiArea) => {
  const btnDeduplication = createBigButton('云盘去重', uiArea, 2);
  btnDeduplication.addEventListener('click', () => {
    const deduplication = new CloudDeduplication();
    deduplication.showConfigPopUp();
  });
};
class CloudDeduplication {
  constructor() {
    this.cloudCountLimit = 1000;
    this.config = {
      // 是否启用按时长分组（默认启用）
      durationGroupEnabled: true,
      // 时长阈值，单位秒，支持一位小数，默认 1.0 秒
      durationThreshold: 1.0,
      explicitDedup: false,
    };
    this.cloudDeduplicationSongList = [];
    this.cloudSongUniqueMap = {};
    this.deduplication = {
      working: false,
      stopFlag: false,
    };
    this.selectedGroups = new Set();
  }
  showConfigPopUp() {
    Swal.fire({
      title: '云盘去重设置',
      width: '700px',
      showCloseButton: true,
      html: `
            <div>
                <div>是否使用以下属性区分歌曲？</div>
                <div style="margin-top:6px;">
                    <label><input type="checkbox" id="cd-duration-group-enabled" checked> 时长，差值小于<input type="number" id="cd-duration-threshold" step="0.1" min="0" max="60" value="1" style="width:40px;height:25px;margin-left:6px;">秒时，视为时长相同</label>
                </div>
                <div style="margin-top:6px;"><label><input type="checkbox" id="cd-deduplication-explicit" checked> 脏标（如<a href="https://music.163.com/#/song?id=1859245776" target="_blank">STAY(🅴)</a>和<a href="https://music.163.com/#/song?id=1859306637" target="_blank">STAY</a>）</label></div>
            </div>
            `,
      confirmButtonText: '开始查找重复歌曲',
      footer: `<div>手机客户端有回收站功能，误删请从那里恢复。</div><div>live歌曲不去重，因为无法区分是否重复。</div><div></div>一些歌曲无法判断为live版，如<a href="https://music.163.com/#/album?id=280573395" target="_blank">FEAR and DREAMS</a>。</div><div>没有用语言区分，因此如《K歌之王》国粤不同版本的歌曲可能会视为重复。</div>`,
      preConfirm: () => {
        const container = Swal.getHtmlContainer();
        const durationEnabledEl = container.querySelector('#cd-duration-group-enabled');
        const durationThresholdEl = container.querySelector('#cd-duration-threshold');
        const rawThreshold = parseFloat(durationThresholdEl.value);
        try {
          let threshold = rawThreshold;
          if (isNaN(threshold) || threshold < 0) threshold = 1.0;
          // 保留一位小数
          threshold = Math.round(threshold * 10) / 10;
          return {
            durationGroupEnabled: !!(durationEnabledEl && durationEnabledEl.checked),
            durationThreshold: threshold,
            explicitDedup: container.querySelector('#cd-deduplication-explicit').checked,
          };
        } catch {
          return {
            durationGroupEnabled: !!(durationEnabledEl && durationEnabledEl.checked),
            durationThreshold: 1.0,
            explicitDedup: container.querySelector('#cd-deduplication-explicit').checked,
          };
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.config = result.value;
        this.showFetchAllCloudSongPopUp();
      }
    });
  }
  showFetchAllCloudSongPopUp() {
    Swal.fire({
      input: 'textarea',
      inputLabel: '获取云盘歌曲信息',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCloseButton: false,
      showConfirmButton: false,
      inputAttributes: {
        readonly: true,
      },
      didOpen: async () => {
        const textarea = Swal.getInput();
        textarea.style = 'height: 300px;';

        function addLog(log) {
          textarea.value += log + '\n';
          textarea.scrollTop = textarea.scrollHeight;
        }
        let offset = 0;
        const limit = 1000;
        let hasMore = true;
        while (hasMore) {
          const content = await weapiRequestSync('/api/v1/cloud/get', {
            data: {
              limit: this.cloudCountLimit,
              offset: offset,
            },
          });
          if (content.code !== 200) {
            addLog(`获取云盘歌曲信息失败,剩余歌曲不获取`);
            break;
          }
          if (offset === 0) {
            addLog(`总共${content.count}首云盘歌曲`);
          }
          addLog(`获取第${offset + 1}到第${offset + limit}首`);
          for (const song of content.data) {
            if (song.matchType === 'unmatched') {
              continue;
            }
            if (isLiveSong(song)) {
              continue;
            }
            const songItem = {
              id: song.simpleSong.id,
              name: song.simpleSong.name,
              artist: song.simpleSong.ar,
              album: song.simpleSong.al,
              duration: song.simpleSong.dt,
              mark: song.simpleSong.mark,
              publishTime: song.simpleSong.publishTime,
              pop: song.simpleSong.pop,
              fileSize: song.fileSize,
            };
            const item = {
              name: songItem.name,
              artists: songItem.artist ? songItem.artist.map((a) => a.name).sort() : [],
              explicit: !this.config.explicitDedup || (songItem.mark & 1048576) === 1048576,
            };
            const md5 = getMD5(JSON.stringify(item));
            if (!this.cloudSongUniqueMap[md5]) {
              this.cloudSongUniqueMap[md5] = [songItem];
            } else {
              this.cloudSongUniqueMap[md5].push(songItem);
            }
          }
          offset += limit;
          hasMore = content.hasMore;
        }
        addLog(`开始处理数据找重复歌曲`);
        for (const songs of Object.values(this.cloudSongUniqueMap)) {
          if (songs.length > 1) {
            // 如果启用了按时长分组，则根据阈值进行细分；否则不按时长分组
            if (this.config.durationGroupEnabled) {
              const thresholdMs = Math.round((this.config.durationThreshold || 1) * 1000);
              const songDurationMap = {};
              for (const song of songs) {
                let found = false;
                for (const [durationKey, group] of Object.entries(songDurationMap)) {
                  if (Math.abs(parseInt(durationKey) - song.duration) < thresholdMs) {
                    group.push(song);
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  songDurationMap[song.duration] = [song];
                }
              }
              for (const group of Object.values(songDurationMap)) {
                if (group.length > 1) {
                  this.cloudDeduplicationSongList.push(group);
                }
              }
            } else {
              this.cloudDeduplicationSongList.push(songs);
            }
          }
        }

        if (this.cloudDeduplicationSongList.length > 0) {
          console.log(this.cloudDeduplicationSongList);
          this.showDeduplicationSongs();
        } else {
          showConfirmBox(`未找到重复歌曲`);
        }
      },
    });
  }

  showDeduplicationSongs() {
    Swal.fire({
      title: '重复歌曲列表',
      width: '980px',
      showCloseButton: true,
      showConfirmButton: false,
      html: '',
      footer: '<div>去重：对于已勾选的重复组，删除重复歌曲，只保留歌曲收藏量最高的一首。</div>',
      didOpen: () => {
        const container = Swal.getHtmlContainer();
        // 清空容器
        container.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.maxHeight = '60vh';
        wrapper.style.overflow = 'auto';

        // 外层表格：每组重复歌曲占一行，行内放置嵌套表格
        const outerTable = document.createElement('table');
        outerTable.style.width = '100%';
        outerTable.style.borderCollapse = 'collapse';
        outerTable.style.fontSize = '13px';

        function markBtnDeleted(delBtn) {
          if (!delBtn) return;
          delBtn.textContent = '已删除';
          delBtn.disabled = true;
          delBtn.style.opacity = '0.6';
          delBtn.style.cursor = 'not-allowed';
        }

        function updateDeleteButtonState(songId) {
          const delBtn = container.querySelector(`.cd-del-btn[data-song-id="${songId}"]`);
          markBtnDeleted(delBtn);
        }

        // 分页渲染：每页显示 pageLimit 组
        const pageLimit = 20;
        let currentPage = 1;
        const totalGroups = this.cloudDeduplicationSongList.length;
        const pageMax = Math.max(1, Math.ceil(totalGroups / pageLimit));

        const createGroupRow = (group, groupIndex) => {
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid #e6e6e6';
          const td = document.createElement('td');
          td.style.padding = '8px';

          const nestedContainer = document.createElement('div');
          nestedContainer.style.width = '100%';
          nestedContainer.style.boxSizing = 'border-box';

          const rep = group[0];
          const headerRow = document.createElement('div');
          headerRow.style.display = 'flex';
          headerRow.style.alignItems = 'center';
          headerRow.style.padding = '8px';
          headerRow.style.background = '#fafafa';
          headerRow.style.borderBottom = '1px solid #ddd';
          headerRow.style.fontWeight = '600';
          headerRow.style.gap = '8px';
          headerRow.style.boxSizing = 'border-box';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'cd-group-checkbox';
          checkbox.setAttribute('data-group-id', groupIndex);
          checkbox.style.cursor = 'pointer';
          checkbox.style.width = '18px';
          checkbox.style.height = '18px';
          checkbox.style.flexShrink = '0';
          checkbox.checked = this.selectedGroups.has(groupIndex);
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) this.selectedGroups.add(groupIndex);
            else this.selectedGroups.delete(groupIndex);
            updateDeduplicationBtnText();
          });
          headerRow.appendChild(checkbox);

          const artistNames = (rep.artist || []).map((a) => a.name).join('/');
          const titleSpan = document.createElement('span');
          titleSpan.textContent = `${rep.name || ''} — ${artistNames}`;
          headerRow.appendChild(titleSpan);
          nestedContainer.appendChild(headerRow);

          group.forEach((song) => {
            const row = document.createElement('div');
            row.style =
              'display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid #f5f5f5;width:100%;box-sizing:border-box;min-width:0;';

            const coverHtml = `
                              <div style="flex: 0 0 72px; display:flex;align-items:center;justify-content:center;">
                                <a href="https://music.163.com/#/song?id=${song.id}" target="_blank" title="${escapeHtml(song.album && song.album.name ? song.album.name : '')}" style="display:block;">
                                  <img src="${song.album && song.album.picUrl ? song.album.picUrl + '?param=50y50&quality=100' : ''}" alt="cover" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5;">
                                </a>
                              </div>`;
            const albumHtml = `
                              <div style="flex:1 1 160px;min-width:0;overflow:hidden;">
                                <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                  <a href="https://music.163.com/#/album?id=${song.album && song.album.id ? song.album.id : ''}" target="_blank" style="color:#000;text-decoration:none">${escapeHtml(song.album && song.album.name ? song.album.name : '')}</a>
                                </div>
                              </div>`;

            const publishHtml = `<div style="flex:0 0 90px;color:#666;font-size:13px;">${dateDesc(song.publishTime)}</div>`;
            const sizeHtml = `<div style="flex:0 0 110px;color:#666;font-size:13px;">${fileSizeDesc(song.fileSize)}</div>`;
            const durationHtml = `<div style="flex:0 0 70px;color:#666;font-size:13px;">${duringTimeDesc(song.duration)}</div>`;
            const actionsHtml = `<div style="flex:0 0 140px;display:flex;gap:8px;justify-content:flex-end;"> <button class="cd-del-btn swal2-styled" type="button" data-song-id="${song.id}">删除</button></div>`;

            row.innerHTML = coverHtml + albumHtml + publishHtml + sizeHtml + durationHtml + actionsHtml;

            const delBtn = row.querySelector('.cd-del-btn');
            // 初始化时检查歌曲是否已删除
            if (song.deleted) {
              markBtnDeleted(delBtn);
            }
            delBtn.addEventListener('click', () => {
              Swal.fire({
                icon: 'warning',
                title: '确认删除这首歌曲吗？',
                text: `确定要删除《${song.name}》吗？`,
                showCancelButton: true,
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                didClose: () => {
                  this.showDeduplicationSongs();
                },
              }).then(async (res) => {
                if (res.isConfirmed) {
                  try {
                    const deleteRes = await weapiRequestSync('/api/cloud/del', {
                      method: 'POST',
                      data: { songIds: [song.id] },
                    });
                    if (deleteRes.code === 200) {
                      song.deleted = true;
                      updateDeleteButtonState(song.id);
                      showTips('已删除');
                    } else {
                      const msg = deleteRes.message || '删除失败';
                      showTips(msg);
                    }
                  } catch (e) {
                    showTips(`删除出错: ${e.message}`);
                  }
                }
              });
            });
            nestedContainer.appendChild(row);
          });

          td.appendChild(nestedContainer);
          tr.appendChild(td);
          return tr;
        };

        const renderPage = () => {
          outerTable.innerHTML = '';
          const start = (currentPage - 1) * pageLimit;
          const end = Math.min(totalGroups, start + pageLimit);
          for (let idx = start; idx < end; idx++) {
            const group = this.cloudDeduplicationSongList[idx];
            const tr = createGroupRow(group, idx);
            outerTable.appendChild(tr);
          }
          updatePageArea();
        };

        const updatePageArea = () => {
          const footerEl = Swal.getFooter();
          footerEl.style.display = 'block';
          const pageAreaId = 'cd-page-area';
          let pageArea = footerEl.querySelector(`#${pageAreaId}`);
          if (!pageArea) {
            pageArea = document.createElement('div');
            pageArea.id = pageAreaId;
            pageArea.style.cssText = 'display:flex;gap:6px;justify-content:center;flex-wrap:wrap;';
            footerEl.insertBefore(pageArea, footerEl.firstChild);
          }
          createPagination(
            pageArea,
            currentPage,
            pageMax,
            (page) => {
              currentPage = page;
              renderPage();
            },
            this.working
          );
        };

        // 初始渲染第一页
        renderPage();

        // 创建上方控制栏（全选、全取消、本页全选、本页全取消、去重）
        const headerBar = document.createElement('div');
        headerBar.id = 'cd-header-bar';
        headerBar.style.cssText =
          'display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;';

        const btnSelectAll = document.createElement('button');
        btnSelectAll.type = 'button';
        btnSelectAll.className = 'swal2-styled';
        btnSelectAll.id = 'btn-selectall';
        btnSelectAll.textContent = '全部选择';

        const btnCancelAll = document.createElement('button');
        btnCancelAll.type = 'button';
        btnCancelAll.className = 'swal2-styled';
        btnCancelAll.id = 'btn-cancelall';
        btnCancelAll.textContent = '全部取消';

        const btnPageSelectAll = document.createElement('button');
        btnPageSelectAll.type = 'button';
        btnPageSelectAll.className = 'swal2-styled';
        btnPageSelectAll.id = 'btn-page-selectall';
        btnPageSelectAll.textContent = '本页全选';

        const btnPageCancelAll = document.createElement('button');
        btnPageCancelAll.type = 'button';
        btnPageCancelAll.className = 'swal2-styled';
        btnPageCancelAll.id = 'btn-page-cancelall';
        btnPageCancelAll.textContent = '本页全取消';

        const btnDeduplication = document.createElement('button');
        btnDeduplication.type = 'button';
        btnDeduplication.className = 'swal2-styled';
        btnDeduplication.id = 'btn-deduplication';
        btnDeduplication.textContent = '去重已选';

        headerBar.appendChild(btnSelectAll);
        headerBar.appendChild(btnCancelAll);
        headerBar.appendChild(btnPageSelectAll);
        headerBar.appendChild(btnPageCancelAll);
        headerBar.appendChild(btnDeduplication);

        container.appendChild(headerBar);
        wrapper.appendChild(outerTable);
        container.appendChild(wrapper);

        // 定义更新按钮文本的函数（基于 this.selectedGroups，支持跨页选中）
        const updateDeduplicationBtnText = () => {
          let groupCount = 0;
          let songCount = 0;
          for (const groupId of this.selectedGroups) {
            const group = this.cloudDeduplicationSongList[groupId];
            if (group) {
              groupCount++;
              songCount += group.length;
            }
          }
          if (groupCount > 0) {
            btnDeduplication.textContent = `去重${groupCount}组${songCount}首歌曲`;
          } else {
            btnDeduplication.textContent = '去重已选';
          }
        };
        updateDeduplicationBtnText();

        // 绑定"全部选择"按钮（选择所有页面的所有组）
        btnSelectAll.addEventListener('click', () => {
          for (let i = 0; i < totalGroups; i++) {
            this.selectedGroups.add(i);
          }
          // 更新当前页的复选框显示
          const checkboxes = container.querySelectorAll('.cd-group-checkbox');
          checkboxes.forEach((cb) => {
            cb.checked = true;
          });
          updateDeduplicationBtnText();
        });

        // 绑定"全部取消"按钮（取消所有页面的所有组）
        btnCancelAll.addEventListener('click', () => {
          this.selectedGroups.clear();
          // 更新当前页的复选框显示
          const checkboxes = container.querySelectorAll('.cd-group-checkbox');
          checkboxes.forEach((cb) => {
            cb.checked = false;
          });
          updateDeduplicationBtnText();
        });

        // 绑定"本页全选"按钮
        btnPageSelectAll.addEventListener('click', () => {
          const checkboxes = container.querySelectorAll('.cd-group-checkbox');
          checkboxes.forEach((cb) => {
            cb.checked = true;
            const gid = parseInt(cb.getAttribute('data-group-id'));
            this.selectedGroups.add(gid);
          });
          updateDeduplicationBtnText();
        });

        // 绑定"本页全取消"按钮
        btnPageCancelAll.addEventListener('click', () => {
          const checkboxes = container.querySelectorAll('.cd-group-checkbox');
          checkboxes.forEach((cb) => {
            cb.checked = false;
            const gid = parseInt(cb.getAttribute('data-group-id'));
            this.selectedGroups.delete(gid);
          });
          updateDeduplicationBtnText();
        });

        // 绑定"去重已选"按钮
        btnDeduplication.addEventListener('click', async () => {
          // 如果正在进行去重，则设置停止标志
          if (this.deduplication.working) {
            this.deduplication.stopFlag = true;
            btnDeduplication.textContent = '正在停止';
            btnDeduplication.disabled = true;
            return;
          }

          if (this.selectedGroups.size === 0) {
            showTips('请先选择要去重的分组');
            return;
          }

          this.deduplication.working = true;
          this.deduplication.stopFlag = false;
          btnDeduplication.textContent = '停止';
          btnDeduplication.disabled = false;

          const groupsToProcess = Array.from(this.selectedGroups).map((groupId) => {
            return this.cloudDeduplicationSongList[groupId];
          });

          // 对每个选中的分组，删除除了收藏最多外的所有歌曲（跳过已删除的）
          for (const group of groupsToProcess) {
            // 检查是否需要停止
            if (this.deduplication.stopFlag) {
              break;
            }

            // 过滤出未删除的歌曲
            const activeSongs = group.filter((song) => !song.deleted);

            if (activeSongs.length <= 1) continue;

            let errorOccurred = false;
            // 获取每首歌曲的收藏量
            for (const song of activeSongs) {
              try {
                const countRes = await weapiRequestSync('/api/song/red/count', {
                  data: { songId: song.id },
                });
                if (countRes.code === 200 && countRes.data) {
                  song.redCount = countRes.data.count || 0;
                } else {
                  showTips(`获取歌曲 ${song.name} 收藏量出错。${countRes.message || countRes.msg || ''}`, 2);
                  errorOccurred = true;
                }
              } catch (e) {
                showTips(`获取歌曲 ${song.name} 收藏量出错: ${e.message}`, 2);
                errorOccurred = true;
              }
            }
            if (errorOccurred) {
              continue;
            }

            // 多级排序：收藏量 > 发布时间 > id
            const sorted = activeSongs.sort((a, b) => {
              const redCountDiff = (b.redCount || 0) - (a.redCount || 0);
              if (redCountDiff !== 0) return redCountDiff;

              const publishTimeDiff = (a.publishTime || 0) - (b.publishTime || 0);
              if (publishTimeDiff !== 0) return publishTimeDiff;

              return a.id - b.id;
            });
            const toDelete = sorted.slice(1);

            // 检查是否需要停止
            if (this.deduplication.stopFlag) {
              break;
            }

            try {
              const result = await weapiRequestSync('/api/cloud/del', {
                data: { songIds: toDelete.map((song) => song.id) },
              });
              if (result.code !== 200) {
                showTips(`删除 ${toDelete[0].name} 的重复歌曲失败`, 2);
                return;
              } else {
                showTips(`成功删除 ${toDelete.length} 首 ${toDelete[0].name} 的重复歌曲`, 1);
              }

              toDelete.forEach((song) => {
                // 标记为已删除
                song.deleted = true;
                // 更新对应删除按钮的状态
                updateDeleteButtonState(song.id);
              });
            } catch (e) {
              showTips(`删除歌曲 ${toDelete[0].name} 出错: ${e.message}`, 2);
              return;
            }
          }

          // 恢复按钮状态
          this.deduplication.working = false;
          this.deduplication.stopFlag = false;
          btnDeduplication.disabled = false;
          updateDeduplicationBtnText();

          if (!this.deduplication.stopFlag) {
            showTips('去重已完成');
          } else {
            showTips('去重已停止');
          }
        });
      },
      willClose: () => {
        this.deduplication.stopFlag = true;
      },
    });
  }
}
