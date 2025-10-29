import { showTips, createPageJumpInput } from "../utils/common"
import { getBatchFilter, setBatchFilter, getBatchDownloadSettings, getBatchTransUploadSettings, getDownloadSettings, setBatchDownloadSettings, setBatchTransUploadSettings, setDownloadSettings } from "../utils/constant"
import { ncmDownUploadBatch } from "../components/ncmDownUploadBatch"
import { batchDownloadSongs } from "../components/batchDownloadSongs"

// 每页显示数量
const PAGE_SIZE = 50
const liveRegex = /(?:\(|（)[^）\)]*\blive\b[^\)]*(?:\)|）)$/;

export const showBatchManager = (fullSongList = [], defaultConfig = {}) => {
    const songPlayableList = fullSongList.filter(item => item.privilege.plLevel !== 'none');
    if (!songPlayableList || songPlayableList.length === 0) {
        showTips('没有可操作的歌曲', 2)
        return
    }
    //console.log(songPlayableList, defaultConfig)

    // 读取油猴中保存的设置并合并到默认配置（在 state 初始化时完成）
    let _savedBatchDl = {}
    let _savedBatchUp = {}
    let _savedDl = {}
    try {
        _savedBatchDl = getBatchDownloadSettings() || {}
    } catch (e) { console.warn('getBatchDownloadSettings error', e) }
    try {
        _savedBatchUp = getBatchTransUploadSettings() || {}
    } catch (e) { console.warn('getBatchTransUploadSettings error', e) }
    try {
        _savedDl = getDownloadSettings() || {}
    } catch (e) { console.warn('getDownloadSettings error', e) }

    // state
    let state = {
        songs: songPlayableList.map((s, idx) => {
            return Object.assign({ _index: idx, downloadStatus: '', uploadStatus: '', selected: false }, s)
        }),
        filterText: '',
        filterOptions: getBatchFilter(),
        page: 1,
        pageMax: Math.ceil(songPlayableList.length / PAGE_SIZE),
        view: 'songs', // 当前视图：songs / filter / dl / up
        downloadConfig: Object.assign({
            threadCount: (_savedBatchDl.concurrent !== undefined) ? _savedBatchDl.concurrent : 4,
            downloadLyric: !!_savedBatchDl.dllrc || false,
            folder: _savedDl.folder || 'none',
            out: _savedDl.out || 'artist-title',
            level: _savedBatchDl.level || 'jymaster',
            targetLevelOnly: !!_savedBatchUp.levelonly || false,
            appendMeta: _savedDl.appendMeta || 'notAppend',
            // 转存相关设置占位
        }, defaultConfig),
        uploadConfig: Object.assign({
            level: _savedBatchUp.level || 'jymaster',
            targetLevelOnly: !!_savedBatchUp.levelonly || false,
            // 转存相关设置占位
        }, defaultConfig)
    }

    Swal.fire({
        width: '980px',
        showConfirmButton: false,
        showCloseButton: true,
        html: `<div style="display:flex;gap:12px;">
    <div style="width:150px;border-right:1px solid #eee;padding-right:8px;box-sizing:border-box;">
      <ul id="bm-nav" style="list-style:none;padding:0;margin:0;">
        <li><button data-view="songs" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">歌曲列表</button></li>
        <li style="margin-top:6px;"><button data-view="filter" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">过滤条件</button></li>
        <li style="margin-top:6px;"><button data-view="dl" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">下载设置</button></li>
        <li style="margin-top:6px;"><button data-view="up" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">转存设置</button></li>
      </ul>
      <div id="bm-nav-desc" style="margin-top:16px;color:#666;font-size:13px;">仅显示可操作的歌曲</div>
      ${defaultConfig.listType === 'artist' ? '<div style="margin-top:16px;color:#666;font-size:13px;">对歌手歌曲进行了一定的去重。若一首歌的重复版本是云盘歌曲，其也视作云盘歌曲。</div>' : ''}
    </div>
    <div style="flex:1;padding-left:8px;box-sizing:border-box;">
      <div id="bm-toolbar" style="display:flex;gap:8px;margin-bottom:8px;">
        <button id="bm-select-page-all" type="button" class="swal2-styled">本页全选择</button>
        <button id="bm-clear-page-all" type="button" class="swal2-styled">本页全取消</button>
        <button id="bm-select-all" type="button" class="swal2-styled">全部选择</button>
        <button id="bm-clear-select" type="button" class="swal2-styled">全部取消</button>
        <button id="bm-download-all" type="button" class="swal2-styled">下载已选</button>
        <button id="bm-upload-all" type="button" class="swal2-styled">转存已选</button>
      </div>
      <div id="bm-main-content" style="height:520px;overflow:auto;border:1px solid #eee;padding:8px;"></div>
      <div id="bm-pager" style="margin-top:8px;text-align:center"></div>
    </div>
  </div>`,
        didOpen: () => {
            const container = Swal.getHtmlContainer()
            const btnSelectPageAll = container.querySelector('#bm-select-page-all')
            const btnClearPageAll = container.querySelector('#bm-clear-page-all')
            const btnSelectAll = container.querySelector('#bm-select-all')
            const btnClearSelect = container.querySelector('#bm-clear-select')
            const btnDownloadAll = container.querySelector('#bm-download-all')
            const btnUploadAll = container.querySelector('#bm-upload-all')
            const mainContent = container.querySelector('#bm-main-content')
            const pager = container.querySelector('#bm-pager')
            const nav = container.querySelector('#bm-nav')
            const navDesc = container.querySelector('#bm-nav-desc')
            const toolbar = container.querySelector('#bm-toolbar') // 新增 toolbar 引用


            // nav binding
            nav.querySelectorAll('.bm-nav-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const view = e.currentTarget.getAttribute('data-view')
                    state.view = view
                    renderView()
                })
            })
            btnSelectPageAll.addEventListener('click', () => {
                // 仅对当前页的歌曲进行全选
                const filtered = filteredSongs()
                const begin = (state.page - 1) * PAGE_SIZE
                //const pageSongs = filtered.slice(begin, begin + PAGE_SIZE)
                for (let i = begin; i < begin + PAGE_SIZE && i < filtered.length; i++) {
                    filtered[i].selected = true
                }
                renderView()
            })
            btnClearPageAll.addEventListener('click', () => {
                // 仅对当前页的歌曲进行取消选择
                const filtered = filteredSongs()
                const begin = (state.page - 1) * PAGE_SIZE
                for (let i = begin; i < begin + PAGE_SIZE && i < filtered.length; i++) {
                    filtered[i].selected = false
                }
                renderView()
            })
            btnSelectAll.addEventListener('click', () => {
                // 仅对当前过滤条件匹配的歌曲进行全部选择（跨页）
                const filtered = filteredSongs()
                filtered.forEach(s => s.selected = true)
                renderView()
            })
            btnClearSelect.addEventListener('click', () => {
                // 仅对当前过滤条件匹配的歌曲取消选择（跨页）
                const filtered = filteredSongs()
                filtered.forEach(s => s.selected = false)
                renderView()
            })

            btnDownloadAll.addEventListener('click', () => {
                const toDl = state.songs.filter(s => s.selected)
                if (toDl.length === 0) {
                    showTips('未选择歌曲', 2)
                    return
                }
                batchDownloadSongs(toDl, state.downloadConfig)
            })
            btnUploadAll.addEventListener('click', () => {
                const toUp = state.songs.filter(s => s.selected && !s.privilege.cs)
                if (toUp.length === 0) {
                    showTips('未选择歌曲或只选择了云盘歌曲', 2)
                    return
                }
                let ULobj = new ncmDownUploadBatch(toUp, state.uploadConfig)
                ULobj.startUpload()
            })

            // helpers for filtering & paging
            function currentPageSongs() {
                const filtered = filteredSongs()
                const begin = (state.page - 1) * PAGE_SIZE
                const pageSongs = filtered.slice(begin, begin + PAGE_SIZE)
                state.pageMax = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
                return pageSongs
            }

            function filteredSongs() {
                return state.songs.filter(s => {
                    if (s.privilege.fee === 0) {
                        if (!state.filterOptions.free) return false
                    }
                    else if (s.privilege.fee === 1) {
                        if (!state.filterOptions.vip) return false
                    }
                    else if (s.privilege.fee === 4) {
                        if (!state.filterOptions.pay) return false
                    }
                    else if (s.privilege.fee === 8) {
                        if (!state.filterOptions.lowfree) return false
                    }
                    // 纯音乐
                    if (!state.filterOptions.instrumental) {
                        if((s.song.mark & 131072) === 131072) return false
                        if(s.song.additionalTitle){
                            if(s.song.additionalTitle.toLowerCase().includes('instrumental')) return false
                            if(s.song.additionalTitle.includes('伴奏')) return false
                        }
                        else{
                            if(s.title.toLowerCase().includes('instrumental')) return false
                            if(s.title.includes('伴奏')) return false
                        }
                    }
                    // 现场版
                    if (!state.filterOptions.live){
                        if(s.song.album && s.song.album.subType === '现场版') return false
                        if(s.song.additionalTitle){
                            if(s.song.additionalTitle.toLowerCase().includes('live')) return false
                        }
                        else if(liveRegex.test(s.title.toLowerCase())) return false
                    }
                    if (s.privilege.cs && !state.filterOptions.cloud) return false
                    if (!state.filterText) return true
                    const t = state.filterText.toLowerCase()
                    return s.title.toLowerCase().includes(t)
                        || s.artist.toLowerCase().includes(t)
                        || s.album.toLowerCase().includes(t)
                })
            }

            // render view based on state.view
            function renderView() {
                // 显示/隐藏右侧工具栏（按钮）与页码：只有在 songs 视图时显示
                toolbar.style.display = (state.view === 'songs') ? '' : 'none'

                if (state.view === 'songs') {
                    renderSongsView()
                    renderPager()
                } else if (state.view === 'filter') {
                    renderFilterView()
                    pager.innerHTML = '' // 隐藏页码
                } else if (state.view === 'dl') {
                    renderDownloadSettingsView()
                    pager.innerHTML = ''
                } else if (state.view === 'up') {
                    renderUploadSettingsView()
                    pager.innerHTML = ''
                }
            }

            function renderSongsView() {
                // 强制 mainContent 固定宽度为 735px（与请求保持一致）
                mainContent.style.width = '735px'
                mainContent.style.boxSizing = 'border-box'
                const pageSongs = currentPageSongs()
                mainContent.innerHTML = ''
                pageSongs.forEach(s => {
                    const row = document.createElement('div')
                    // 容器为 mainContent 的宽度（735px），各列使用固定/弹性宽度并保证文本溢出省略
                    row.style = 'display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid #f0f0f0;width:100%;box-sizing:border-box;min-width:0;'
                    row.innerHTML = ` 
  <!-- 复选框：固定宽度，居中 -->
  <div style="flex: 0 0 36px; display: flex; align-items: center; justify-content: center;">
    <input type="checkbox" style="width: 25px; height: 25px; " ${s.selected ? 'checked' : ''}>
  </div>
  
  <!-- 封面：固定宽度，居中 -->
  <div style="flex: 0 0 56px; display: flex; align-items: center; justify-content: center;">
    <a href="https://music.163.com/#/album?id=${s.song.al.id}" target="_blank" title="${s.album}" style="display: block;">
      <img src="${s.song.al.picUrl + '?param=50y50&quality=100'}" 
           alt="cover" 
           style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background: #f5f5f5; transition: transform 0.2s ease;">
    </a>
  </div>
  
  <!-- 歌曲信息：弹性伸缩，优先占用空间 -->
  <div style="flex: 2 1 200px; min-width: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
    <div style="font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.2;">
      <a href="https://music.163.com/#/song?id=${s.song.id}" target="_blank" style="color: #000; text-decoration: none; transition: color 0.2s ease;">${s.title}</a>
    </div>
    <div style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.2;">
    ${(s.song.mark & 1048576) === 1048576 ? '🅴 ' : ''}
    ${s.privilege.cs ? '<i class="fa-regular fa-cloud"></i> ': ''}
      ${s.artist}
    </div>
  </div>
  
  <!-- 专辑信息：弹性伸缩，次要占用空间 -->
  <div style="flex: 1 1 120px; min-width: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
    <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.2;">
      <a href="https://music.163.com/#/album?id=${s.song.al.id}" target="_blank" style="color: #000; text-decoration: none; transition: color 0.2s ease;">${s.album}</a>
    </div>
  </div>
                    `
                    const chk = row.querySelector('input[type=checkbox]')
                    chk.addEventListener('change', () => {
                        s.selected = chk.checked
                    })
                    mainContent.appendChild(row)
                })
            }

            function renderFilterView() {
                mainContent.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <input id="bm-filter-input" class="swal2-input" placeholder="过滤：标题/歌手/专辑" value="${state.filterText}">
                    <div>
                        歌曲收费类型：
                      <div>
                      （免费用户）
                      <label style="margin-right:12px"><input id="bm-filter-cb-lowfree" type="checkbox" ${state.filterOptions.lowfree ? 'checked' : ''}> 最高极高音质试听</label>
                      <label style="margin-right:12px"><input id="bm-filter-cb-free" type="checkbox" ${state.filterOptions.free ? 'checked' : ''}> 前者基础上+最高HiRes音质下载</label></div>
                      <div><label style="margin-right:12px"><input id="bm-filter-cb-vip" type="checkbox" ${state.filterOptions.vip ? 'checked' : ''}> VIP</label>
                      <label style="margin-right:12px"><input id="bm-filter-cb-pay" type="checkbox" ${state.filterOptions.pay ? 'checked' : ''}> 数字专辑</label></div>
                    </div>
                    <div>
                      <label style="margin-right:12px"><input id="bm-filter-cb-cloud" type="checkbox" ${state.filterOptions.cloud ? 'checked' : ''}>显示云盘歌曲</label>
                    </div>
                    <div>
                      <label style="margin-right:12px"><input id="bm-filter-cb-instrumental" type="checkbox" ${state.filterOptions.instrumental ? 'checked' : ''}>纯音乐、伴奏</label>
                      <label style="margin-right:12px"><input id="bm-filter-cb-live" type="checkbox" ${state.filterOptions.live ? 'checked' : ''}>歌曲标题含有(Live)或歌曲的专辑类型是现场版</label>
                    </div>
                    <div style="margin-top:16px;color:#666;font-size:13px;">专辑页面无法识别纯音乐</div>
                    <div style="margin-top:16px;color:#666;font-size:13px;">”歌曲的专辑类型是现场版“仅在歌手页面能识别</div>
                  </div>
                `
                const input = mainContent.querySelector('#bm-filter-input')
                input.addEventListener('input', (e) => {
                    state.filterText = e.target.value.trim()
                    state.page = 1
                })

                const checkboxes = mainContent.querySelectorAll('input[type="checkbox"]')
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        state.filterOptions[checkbox.id.split('-').pop()] = checkbox.checked
                        setBatchFilter(state.filterOptions)
                        state.page = 1
                    })
                })
            }

            function renderDownloadSettingsView() {
                mainContent.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <label>同时下载的歌曲数
                        <select id="bm-dl-concurrent" class="swal2-select">
                        <option value=4>4</option><option value=3>3</option><option value="2">2</option><option value=1>1</option>
                        </select></label>
                    <label>优先下载音质
                    <select id="bm-dl-level" class="swal2-select">
                        <option value="jymaster">超清母带</option><option value="dolby">杜比全景声</option><option value="sky">沉浸环绕声</option><option value="jyeffect">高清环绕声</option><option value="hires">Hi-Res</option><option value="lossless">无损</option><option value="exhigh">极高</option>
                    </select></label>
                    <label>文件名格式
                      <select id="bm-dl-out"  class="swal2-select">
                        <option value="artist-title">歌手 - 标题</option><option value="title-artist">标题 - 歌手</option><option value="title">仅标题</option>
                      </select>
                    </label>
                    <label>文件夹格式
                    <select id="bm-dl-folder" class="swal2-select"><option value="none">不建立文件夹</option><option value="artist">建立歌手文件夹</option><option value="artist-album">建立歌手 \\ 专辑文件夹</option></select>
                    </label>
                    <label>音乐元数据
                        <select id="bm-dl-appendMeta" class="swal2-select">
                            <option value="notAppend">不添加</option><option value="skipCloud">云盘歌曲不添加</option><option value="allAppend">全部添加</option>
                        </select>
                    </label>
                    <label><input id="bm-dl-dllrc" type="checkbox"> 下载.lrc歌词文件</label>
                    <label><input id="bm-dl-levelonly" type="checkbox"> 仅获取到目标音质时下载</label>
                  </div>
                `

                // 取控件并初始化为 state.config 的值
                const selConcurrent = mainContent.querySelector('#bm-dl-concurrent')
                const selLevel = mainContent.querySelector('#bm-dl-level')
                const selOut = mainContent.querySelector('#bm-dl-out')
                const selFolder = mainContent.querySelector('#bm-dl-folder')
                const selAppend = mainContent.querySelector('#bm-dl-appendMeta')
                const cbLyric = mainContent.querySelector('#bm-dl-dllrc')
                const cbLevelOnly = mainContent.querySelector('#bm-dl-levelonly')

                selConcurrent.value = state.downloadConfig.threadCount || state.downloadConfig.concurrent || 4
                selLevel.value = state.downloadConfig.level || 'jymaster'
                selOut.value = state.downloadConfig.out || 'artist-title'
                selFolder.value = state.downloadConfig.folder || 'none'
                selAppend.value = state.downloadConfig.appendMeta || 'notAppend'
                cbLyric.checked = !!state.downloadConfig.downloadLyric
                cbLevelOnly.checked = !!state.downloadConfig.levelonly

                // 事件：更新 state 并持久化
                selConcurrent.addEventListener('change', (e) => {
                    const v = parseInt(e.target.value || '4')
                    state.downloadConfig.threadCount = v
                    // 保存批量下载相关设置
                    setBatchDownloadSettings({ concurrent: v, level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly })
                })
                selLevel.addEventListener('change', (e) => {
                    state.downloadConfig.level = e.target.value
                    setBatchDownloadSettings({ concurrent: parseInt(selConcurrent.value || '4'), level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly })
                })
                selOut.addEventListener('change', (e) => {
                    state.downloadConfig.out = e.target.value
                    setDownloadSettings({ out: state.downloadConfig.out, folder: state.downloadConfig.folder, appendMeta: state.downloadConfig.appendMeta })
                })
                selFolder.addEventListener('change', (e) => {
                    state.downloadConfig.folder = e.target.value
                    setDownloadSettings({ out: state.downloadConfig.out, folder: state.downloadConfig.folder, appendMeta: state.downloadConfig.appendMeta })
                })
                selAppend.addEventListener('change', (e) => {
                    state.downloadConfig.appendMeta = e.target.value
                    setDownloadSettings({ out: state.downloadConfig.out, folder: state.downloadConfig.folder, appendMeta: state.downloadConfig.appendMeta })
                })
                cbLyric.addEventListener('change', (e) => {
                    state.downloadConfig.downloadLyric = e.target.checked
                    setBatchDownloadSettings({ concurrent: parseInt(selConcurrent.value || '4'), level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly })
                })
                cbLevelOnly.addEventListener('change', (e) => {
                    state.downloadConfig.targetLevelOnly = e.target.checked
                    setBatchDownloadSettings({ concurrent: parseInt(selConcurrent.value || '4'), level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly })
                })
            }

            function renderUploadSettingsView() {
                mainContent.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <label>优先转存音质
                    <select id="bm-up-level" class="swal2-select">
                        <option value="jymaster" selected="">超清母带</option><option value="dolby">杜比全景声</option><option value="sky">沉浸环绕声</option><option value="jyeffect">高清环绕声</option><option value="hires">Hi-Res</option><option value="lossless">无损</option><option value="exhigh">极高</option>
                    </select></label>
                    <label><input id="bm-up-target-only" type="checkbox" ${state.uploadConfig.targetLevelOnly ? 'checked' : ''}> 仅获取到目标音质时转存</label>
                  </div>
                `
                const selUpLevel = mainContent.querySelector('#bm-up-level')
                const cbUpLevelOnly = mainContent.querySelector('#bm-up-target-only')
                selUpLevel.value = state.uploadConfig.level || 'jymaster'
                cbUpLevelOnly.checked = !!state.uploadConfig.targetLevelOnly

                selUpLevel.addEventListener('change', (e) => {
                    state.uploadConfig.level = e.target.value
                    setBatchTransUploadSettings({ level: state.uploadConfig.level, levelonly: !!state.uploadConfig.targetLevelOnly })
                })
                cbUpLevelOnly.addEventListener('change', (e) => {
                    state.uploadConfig.targetLevelOnly = e.target.checked
                    setBatchTransUploadSettings({ level: state.uploadConfig.level, levelonly: !!state.uploadConfig.targetLevelOnly })
                })
            }

            function renderPager() {
                pager.innerHTML = ''

                let pageIndexs = [1]
                let floor = Math.max(2, state.page - 2);
                let ceil = Math.min(state.pageMax - 1, state.page + 2);
                for (let i = floor; i <= ceil; i++) {
                    pageIndexs.push(i)
                }
                if (state.pageMax > 1) {
                    pageIndexs.push(state.pageMax)
                }
                pageIndexs.forEach(pageIndex => {
                    let pageBtn = document.createElement('button')
                    pageBtn.setAttribute("type", "button")
                    pageBtn.className = "swal2-styled"
                    pageBtn.innerHTML = pageIndex
                    if (pageIndex != state.page) {
                        pageBtn.addEventListener('click', () => { state.page = pageIndex; renderView() })
                    } else {
                        pageBtn.style.background = 'white'
                    }
                    pager.appendChild(pageBtn)
                })
                //页码跳转
                if (pageIndexs.length < state.pageMax) {
                    const jumpToPageInput = createPageJumpInput(state.page, state.pageMax)
                    jumpToPageInput.addEventListener('change', () => {
                        const newPage = parseInt(jumpToPageInput.value)
                        if (newPage >= 1 && newPage <= state.pageMax) {
                            state.page = newPage;
                            renderView()
                        } else {
                            jumpToPageInput.value = state.page
                        }
                    })
                    pager.appendChild(jumpToPageInput)
                }
            }

            // 初始化为歌曲列表视图
            renderView()
        }
    })
}