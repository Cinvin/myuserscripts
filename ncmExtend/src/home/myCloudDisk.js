import { createBigButton, showTips, songItemAddToFormat, createPageJumpInput } from "../utils/common"
import { weapiRequest, weapiRequestSync } from "../utils/request"
import { fileSizeDesc, duringTimeDesc, levelDesc } from '../utils/descHelper'
import { liveRegex } from "../utils/constant"

export const myCloudDisk = (uiArea) => {
    const btnMyCloudDisk = createBigButton('我的云盘', uiArea, 2)
    btnMyCloudDisk.addEventListener('click', () => {
        const cloudDiskManager = new CloudDiskManager()
        cloudDiskManager.start()
    })
    class CloudDiskManager {
        /**
         * 启动云盘管理器
         * 初始化属性并打开主列表
         */
        start() {
            this.cloudCountLimit = 50
            this.currentPage = 1
            this.filter = {
                text: '',
                matchStatus: 'all', // all, matched, unmatched
                pureMusic: 'all', // all, pure, noPure
                liveVersion: 'all', // all, live, noLive
                allSongs: [], // 所有云盘歌曲（用于二次过滤及更新）

                songs: [],
                filterInput: null,
                filterControls: {
                    matchStatusRadios: null,
                    pureMusicRadios: null,
                    liveVersionRadios: null,
                    filterBtn: null
                }
            }

            this.controls = {
                tbody: null,
                pageArea: null,
                cloudDesc: null,
                filterPanel: null,
                filterToggleBtn: null,
                selectAllCheckbox: null,
                batchPanel: null,
                batchOpsBtn: null,
                batchDeleteBtn: null,
                batchCollectBtn: null,
                baseTableMaxHeight: 400
            }

            this.selectedSongIds = new Set()
            this.currentDisplaySongs = [] // 当前显示的歌曲列表（用于全选当前页）
            this.openCloudList()
        }

        /**
         * 打开云盘歌曲列表弹窗
         */
        openCloudList() {
            Swal.fire({
                showCloseButton: true,
                showConfirmButton: false,
                width: '980px',
                html: this._getCloudListHTML(),
                footer: `<div id="page-area"></div><br><div id="cloud-desc">${this.controls.cloudDesc ? this.controls.cloudDesc.innerHTML : ''}</div>`,
                didOpen: () => {
                    this._handleCloudListOpen(Swal.getHtmlContainer(), Swal.getFooter())
                }
            })
        }

        /**
         * 获取云盘列表数据（带分页）
         * @param {number} offset 偏移量
         */
        fetchCloudInfoForMatchTable(offset) {
            this.controls.tbody.innerHTML = '正在获取...'

            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: this.cloudCountLimit,
                    offset: offset,
                },
                onload: (res) => {
                    this.currentPage = (offset / this.cloudCountLimit) + 1
                    const maxPage = Math.ceil(res.count / this.cloudCountLimit)
                    this.controls.cloudDesc.innerHTML = `云盘容量 ${fileSizeDesc(res.size)}/${fileSizeDesc(res.maxSize)} 共${res.count}首歌曲`

                    // 生成页码
                    const pageIndexs = [1]
                    const floor = Math.max(2, this.currentPage - 2)
                    const ceil = Math.min(maxPage - 1, this.currentPage + 2)
                    for (let i = floor; i <= ceil; i++) {
                        pageIndexs.push(i)
                    }
                    if (maxPage > 1) {
                        pageIndexs.push(maxPage)
                    }

                    this.controls.pageArea.innerHTML = ''
                    pageIndexs.forEach(pageIndex => {
                        const pageBtn = document.createElement('button')
                        pageBtn.setAttribute("type", "button")
                        pageBtn.className = "swal2-styled"
                        pageBtn.innerHTML = pageIndex
                        if (pageIndex !== this.currentPage) {
                            pageBtn.addEventListener('click', () => {
                                this.fetchCloudInfoForMatchTable(this.cloudCountLimit * (pageIndex - 1))
                            })
                        } else {
                            pageBtn.style.background = 'white'
                        }
                        this.controls.pageArea.appendChild(pageBtn)
                    })

                    // 页码跳转输入框
                    if (pageIndexs.length < maxPage) {
                        const jumpToPageInput = createPageJumpInput(this.currentPage, maxPage)
                        jumpToPageInput.addEventListener('change', () => {
                            const newPage = parseInt(jumpToPageInput.value)
                            if (newPage >= 1 && newPage <= maxPage) {
                                this.fetchCloudInfoForMatchTable(this.cloudCountLimit * (newPage - 1))
                            } else {
                                jumpToPageInput.value = this.currentPage
                            }
                        })
                        this.controls.pageArea.appendChild(jumpToPageInput)
                    }
                    this.fillCloudListTable(res.data)
                }
            })
        }

        /**
         * 填充歌曲列表表格
         * @param {Array} songs 歌曲数据列表
         */
        fillCloudListTable(songs) {
            this.currentDisplaySongs = songs
            this.controls.tbody.innerHTML = ''
            if (songs.length === 0) {
                this.controls.tbody.innerHTML = '空空如也'
            }
            this.updateSelectAllCheckboxState()

            songs.forEach((song) => {
                let album = song.album
                let picUrl = 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
                if (song.simpleSong.al && song.simpleSong.al.picUrl) {
                    picUrl = song.simpleSong.al.picUrl
                }
                if (song.simpleSong.al && song.simpleSong.al.name && song.simpleSong.al.name.length > 0) {
                    album = song.simpleSong.al.name
                }
                let artist = song.artist
                if (song.simpleSong.ar) {
                    let artist2 = ''
                    let arcount = 0
                    song.simpleSong.ar.forEach(ar => {
                        if (ar.name) {
                            if (ar.id > 0) artist2 += `<a target="_blank" href="https://music.163.com/artist?id=${ar.id}">${ar.name}<a>,`
                            else artist2 += ar.name + ','
                            arcount += 1
                        }
                    })
                    if (arcount > 0) {
                        artist = artist2.substring(0, artist2.length - 1)
                    }
                }
                const dateObj = new Date(song.addTime)
                const addTime = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`
                const tablerow = document.createElement('tr')
                const isChecked = this.selectedSongIds.has(song.simpleSong.id) ? 'checked' : ''

                tablerow.innerHTML = `<td class="song-checkbox-cell"><input type="checkbox" class="song-checkbox" value="${song.simpleSong.id}" ${isChecked}></td>
                <td><button type="button" class="swal2-styled btn-match" title="匹配"><i class="fa-solid fa-link"></i></button></td>
                <td><a class="album-link"><img src="${picUrl}?param=50y50&quality=100" title="${album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td>
                <td><a class="song-link" target="_blank" href="https://music.163.com/song?id=${song.simpleSong.id}">${song.simpleSong.name}</a></td>
                <td>${artist}</td><td>${duringTimeDesc(song.simpleSong.dt)}</td><td>${fileSizeDesc(song.fileSize)} ${levelDesc(song.simpleSong.privilege.plLevel)}</td>
                <td>${addTime}</td>
                <div class="row-actions">
                    <button type="button" class="swal2-styled btn-play"  title="播放"><i class="fa-solid fa-play"></i></button>
                    <button type="button" class="swal2-styled btn-addplay"  title="添加至播放列表"><i class="fa-solid fa-plus"></i></button>
                    <button type="button" class="swal2-styled btn-collect"  title="收藏"><i class="fa-solid fa-folder-plus"></i></button>
                    <button type="button" class="swal2-styled btn-delete"  title="删除"><i class="fa-solid fa-trash"></i></button>
                </div>`

                if (song.simpleSong.al && song.simpleSong.al.id > 0) {
                    const albumLink = tablerow.querySelector('.album-link')
                    albumLink.href = 'https://music.163.com/album?id=' + song.simpleSong.al.id
                    albumLink.target = "_blank"
                }

                // 绑定按钮事件
                tablerow.querySelector('.btn-match').addEventListener('click', () => this.openMatchPopup(song))

                tablerow.querySelector('.song-checkbox').addEventListener('change', (e) => {
                    this.toggleSelection(song.simpleSong.id, e.target.checked)
                })

                const addToFormat = songItemAddToFormat(song.simpleSong)
                tablerow.querySelector('.btn-play').addEventListener('click', () => {
                    unsafeWindow.top.player.addTo([addToFormat], false, true)
                })
                tablerow.querySelector('.btn-addplay').addEventListener('click', () => {
                    unsafeWindow.top.player.addTo([addToFormat], false, false)
                })
                tablerow.querySelector('.btn-collect').addEventListener('click', () => {
                    this.openAddToPlaylistPopup(song)
                })
                tablerow.querySelector('.btn-delete').addEventListener('click', () => {
                    this.deleteCloudSong(song)
                })

                this.controls.tbody.appendChild(tablerow)
            })
        }

        updateFilterButtonText() {
            if (this.controls.filterToggleBtn) {
                const isDefault = this.filter.text === '' && this.filter.matchStatus === 'all' &&
                    this.filter.pureMusic === 'all' && this.filter.liveVersion === 'all'
                if (isDefault) {
                    this.controls.filterToggleBtn.innerHTML = '筛选歌曲<i class="fa-solid fa-arrow-down filter-icon"></i>'
                } else {
                    const count = this.filter.songs.length
                    this.controls.filterToggleBtn.innerHTML = `已筛选（${count}）<i class="fa-solid fa-arrow-down filter-icon"></i>`
                }
            }
        }

        onCloudInfoFilterChange() {
            this.filter.songs = []
            // 如果已经有缓存的 allSongs，直接在内存中过滤，否则去服务器拉取全部云盘数据
            if (this.filter.allSongs && this.filter.allSongs.length > 0) {
                this.applyFiltersToAllSongs()
                return
            }
            this.filter.filterInput.setAttribute("disabled", 1)
            this.filter.filterControls.filterBtn.setAttribute("disabled", 1)
            this.controls.batchOpsBtn.disabled = true // Disable batch ops while fetching
            this.cloudInfoFilterFetchData(0)
        }

        /**
         * 检查歌曲是否符合当前过滤条件
         */
        checkSongMatchesFilters(song) {
            // 检查关键词
            if (this.filter.text.length > 0) {
                let matchFlag = false
                if (song.album.includes(this.filter.text) ||
                    song.artist.includes(this.filter.text) ||
                    song.simpleSong.name.includes(this.filter.text) ||
                    (song.simpleSong.al && song.simpleSong.al.id > 0 && song.simpleSong.al.name && song.simpleSong.al.name.includes(this.filter.text))) {
                    matchFlag = true
                }
                if (!matchFlag && song.simpleSong.ar) {
                    song.simpleSong.ar.forEach(ar => {
                        if (ar.name && ar.name.includes(this.filter.text)) {
                            matchFlag = true
                        }
                    })
                }
                if (!matchFlag) {
                    return false
                }
            }

            // 检查匹配状态
            if (this.filter.matchStatus !== 'all') {
                if (this.filter.matchStatus === 'matched' && song.matchType === "unmatched") {
                    return false
                }
                if (this.filter.matchStatus === 'unmatched' && song.matchType === "matched") {
                    return false
                }
            }

            // 检查纯音
            if (this.filter.pureMusic !== 'all') {
                const titleLower = (song.simpleSong.name || '').toLowerCase()
                const isPureMusic = (song.simpleSong.mark & 131072) === 131072 ||
                    titleLower.includes('伴奏') || titleLower.includes('纯音乐') || titleLower.includes('instrumental')
                if (this.filter.pureMusic === 'pure' && !isPureMusic) return false
                if (this.filter.pureMusic === 'noPure' && isPureMusic) return false
            }

            // 检查Live版本
            if (this.filter.liveVersion !== 'all') {
                const nameLower = (song.simpleSong.name || '').toLowerCase()
                const isLive = liveRegex.test(nameLower)
                if (this.filter.liveVersion === 'live' && !isLive) return false
                if (this.filter.liveVersion === 'noLive' && isLive) return false
            }

            return true
        }

        applyFiltersToAllSongs() {
            if (!this.filter.allSongs) this.filter.allSongs = []
            this.filter.songs = this.filter.allSongs.filter(song => this.checkSongMatchesFilters(song))
            this.updateFilterButtonText()
            this.sepreateFilterCloudListPage(1)
        }

        /**
         * 递归获取所有云盘数据用于筛选
         */
        cloudInfoFilterFetchData(offset) {
            if (offset === 0) {
                this.filter.allSongs = []
                // 隐藏页码区域，以免点击页码按钮干扰列表加载
                if (this.controls.pageArea) {
                    this.controls.pageArea.style.display = 'none'
                }
            }
            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: 1000,
                    offset: offset,
                },
                onload: (res) => {
                    this.controls.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1000, res.count)}云盘歌曲`
                    res.data.forEach(song => {
                        this.filter.allSongs.push(song)
                    })
                    if (res.hasMore) {
                        // 递归调用
                        this.cloudInfoFilterFetchData(offset + 1000)
                    } else {
                        // 所有云盘歌曲已获取完成，应用筛选并恢复控件和页码区域
                        this.applyFiltersToAllSongs()
                        this.filter.filterInput.removeAttribute("disabled")
                        this.filter.filterControls.filterBtn.removeAttribute("disabled")
                        this.controls.batchOpsBtn.disabled = false // Re-enable batch ops
                        // 恢复页码区域显示
                        if (this.controls.pageArea) {
                            this.controls.pageArea.style.display = 'block'
                        }
                    }
                }
            })
        }

        /**
         * 分页显示筛选后的数据
         */
        sepreateFilterCloudListPage(currentPage) {
            this.currentPage = currentPage
            const count = this.filter.songs.length
            const maxPage = Math.ceil(count / this.cloudCountLimit)
            this.controls.pageArea.innerHTML = ''

            const pageIndexs = [1]
            const floor = Math.max(2, currentPage - 2)
            const ceil = Math.min(maxPage - 1, currentPage + 2)
            for (let i = floor; i <= ceil; i++) {
                pageIndexs.push(i)
            }
            if (maxPage > 1) {
                pageIndexs.push(maxPage)
            }

            pageIndexs.forEach(pageIndex => {
                const pageBtn = document.createElement('button')
                pageBtn.setAttribute("type", "button")
                pageBtn.className = "swal2-styled"
                pageBtn.innerHTML = pageIndex
                if (pageIndex !== currentPage) {
                    pageBtn.addEventListener('click', () => {
                        this.sepreateFilterCloudListPage(pageIndex)
                    })
                } else {
                    pageBtn.style.background = 'white'
                }
                this.controls.pageArea.appendChild(pageBtn)
            })
            const songindex = (currentPage - 1) * this.cloudCountLimit
            this.fillCloudListTable(this.filter.songs.slice(songindex, songindex + this.cloudCountLimit))
        }

        openMatchPopup(song) {
            Swal.fire({
                showCloseButton: true,
                width: '980px',
                confirmButtonText: '匹配',
                html: this._getMatchPopupHTML(),
                footer: '',
                didOpen: () => {
                    this._handleMatchPopupOpen(song, Swal.getHtmlContainer(), Swal.getActions(), Swal.getFooter(), Swal.getTitle())
                },
                didClose: () => {
                    this.openCloudList()
                }
            })
        }

        matchSong(fromId, toId) {
            weapiRequest("/api/cloud/user/song/match", {
                data: {
                    songId: fromId,
                    adjustSongId: toId,
                },
                onload: (res) => {
                    if (res.code !== 200) {
                        showTips(res.message || res.msg || '匹配失败', 2)
                    } else {
                        let msg = '解除匹配成功'
                        if (toId > 0) {
                            msg = '匹配成功'
                            if (res.matchData) {
                                msg = `${res.matchData.songName} 成功匹配到 ${res.matchData.simpleSong.name} `
                            }
                        }
                        showTips(msg, 1)
                        if (this.filter.songs.length > 0 && res.matchData) {
                            for (let i = 0; i < this.filter.songs.length; i++) {
                                if (this.filter.songs[i].simpleSong.id == fromId) {
                                    //matchData里无privilege
                                    res.matchData.simpleSong.privilege = this.filter.songs[i].simpleSong.privilege
                                    this.filter.songs[i] = res.matchData
                                    break
                                }
                            }
                        }
                        // 同步更新缓存的 allSongs（如果存在）
                        if (this.filter.allSongs && this.filter.allSongs.length > 0 && res.matchData) {
                            for (let i = 0; i < this.filter.allSongs.length; i++) {
                                if (this.filter.allSongs[i].simpleSong && this.filter.allSongs[i].simpleSong.id == fromId) {
                                    res.matchData.simpleSong.privilege = this.filter.allSongs[i].simpleSong.privilege || res.matchData.simpleSong.privilege
                                    this.filter.allSongs[i] = res.matchData
                                    break
                                }
                            }
                        }
                        this.openCloudList()
                    }
                }
            })
        }

        fiilSearchTable(searchContent, cloudSongId) {
            if (searchContent.result.songCount > 0) {
                this.tbody.innerHTML = ''

                const timeMatchSongs = []
                const timeNoMatchSongs = []
                searchContent.result.songs.forEach(resultSong => {
                    if (Math.abs(resultSong.dt - this.fileDuringTime) < 1000)
                        timeMatchSongs.push(resultSong)
                    else
                        timeNoMatchSongs.push(resultSong)
                })
                const resultSongs = timeMatchSongs.concat(timeNoMatchSongs)
                resultSongs.forEach(resultSong => {
                    const tablerow = document.createElement('tr')
                    const songName = resultSong.name
                    const artists = resultSong.ar.map(ar => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${ar.name}</a>`).join()
                    const needHighLight = Math.abs(resultSong.dt - this.fileDuringTime) < 1000
                    const dtstyle = needHighLight ? 'color:SpringGreen;' : ''

                    tablerow.innerHTML = `<td><button type="button" class="swal2-styled selectbtn"><i class="fa-solid fa-link"></i></button></td><td><a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${resultSong.al.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${songName}${resultSong.privilege.cs ? ' <i class="fa-regular fa-cloud"></i>' : ''}</a></td><td>${artists}</td><td style="${dtstyle}">${duringTimeDesc(resultSong.dt)}</td>`
                    const selectbtn = tablerow.querySelector('.selectbtn')
                    selectbtn.addEventListener('click', () => {
                        this.matchSong(cloudSongId, resultSong.id)
                    })

                    this.tbody.appendChild(tablerow)
                })
            } else {
                this.tbody.innerHTML = '搜索结果为空'
            }
        }

        openAddToPlaylistPopup(song) {
            Swal.fire({
                showCloseButton: true,
                showConfirmButton: false,
                html: this._getPlaylistPopupHTML(),
                footer: '',
                didOpen: () => {
                    this._handlePlaylistPopupOpen(song, Swal.getHtmlContainer())
                },
                didClose: () => {
                    this.openCloudList()
                }
            })
        }

        deleteCloudSong(song) {
            Swal.fire({
                icon: 'warning',
                title: '确认删除',
                text: `确定要删除《${song.simpleSong.name}》吗？`,
                showCancelButton: true,
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                didClose: () => {
                    this.openCloudList()
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await this.executeDelete([song.simpleSong.id])
                }
            })
        }

        async executeDelete(songIds) {
            const deleteRes = await weapiRequestSync("/api/cloud/del", {
                method: "POST",
                data: {
                    songIds: songIds,
                }
            })
            if (deleteRes.code === 200) {
                showTips('删除成功', 1)
                // 从选中列表中移除
                songIds.forEach(id => this.selectedSongIds.delete(id))

                // 从当前列表中移除
                if (this.filter.songs.length > 0) {
                    this.filter.songs = this.filter.songs.filter(s => !songIds.includes(s.simpleSong.id))
                }

                // 从缓存 allSongs 中移除
                if (this.filter.allSongs && this.filter.allSongs.length > 0) {
                    this.filter.allSongs = this.filter.allSongs.filter(s => !songIds.includes(s.simpleSong.id))
                }
            } else {
                if (deleteRes.message) {
                    showTips(deleteRes.message, 2)
                } else {
                    showTips('删除失败', 2)
                }
            }
        }

        toggleSelection(songId, checked) {
            if (checked) {
                this.selectedSongIds.add(parseInt(songId))
            } else {
                this.selectedSongIds.delete(parseInt(songId))
            }
            this.updateSelectAllCheckboxState()
            this.updateBatchOpsButtonText()
        }

        toggleSelectAll(checked) {
            // 即使在筛选模式下，表头全选也只控制当前页显示
            // "全选所有筛选结果" 由 batch panel 中的按钮单独负责

            const targetSongs = this.currentDisplaySongs

            targetSongs.forEach(song => {
                if (checked) {
                    this.selectedSongIds.add(song.simpleSong.id)
                } else {
                    this.selectedSongIds.delete(song.simpleSong.id)
                }
            })

            // 更新当前页面的 checkbox 状态
            const checkboxes = this.controls.tbody.querySelectorAll('.song-checkbox')
            checkboxes.forEach(cb => {
                cb.checked = checked
            })
            this.updateBatchOpsButtonText()
        }

        updateSelectAllCheckboxState() {
            if (!this.controls.selectAllCheckbox) return

            // 检查当前显示区域
            // 如果所有显示的都在 selectedSongIds 中，则勾选
            const visibleSongs = this.currentDisplaySongs // 当前页展示的歌曲
            if (visibleSongs.length === 0) {
                this.controls.selectAllCheckbox.checked = false
                return
            }

            const allSelected = visibleSongs.every(song => this.selectedSongIds.has(song.simpleSong.id))
            this.controls.selectAllCheckbox.checked = allSelected
        }

        toggleBatchPanel() {
            // Mutual exclusivity: Close filter panel if open
            if (this.controls.filterPanel.classList.contains('show')) {
                this.controls.filterPanel.classList.remove('show')
                const filterIconEl = this.controls.filterToggleBtn.querySelector('.filter-icon')
                filterIconEl.className = 'fa-solid fa-arrow-down filter-icon'
            }

            this.controls.batchPanel.classList.toggle('show')
            const isShow = this.controls.batchPanel.classList.contains('show')
            const batchIconEl = this.controls.batchOpsBtn.querySelector('.batch-icon')
            const container = Swal.getHtmlContainer()

            if (isShow) {
                batchIconEl.className = 'fa-solid fa-arrow-up batch-icon'
                container.classList.add('batch-mode')
                // Reset selection when opening
                this.selectedSongIds.clear()
                this.updateSelectAllCheckboxState()
                this.currentDisplaySongs.forEach(song => {
                    const cb = this.controls.tbody.querySelector(`.song-checkbox[value="${song.simpleSong.id}"]`)
                    if (cb) cb.checked = false
                })
                this.updateBatchOpsButtonText()
                this.updateBatchButtonVisibility()
            } else {
                batchIconEl.className = 'fa-solid fa-arrow-down batch-icon'
                container.classList.remove('batch-mode')
                this.controls.batchOpsBtn.innerHTML = '批量操作 <i class="fa-solid fa-arrow-down batch-icon"></i>'
            }

            // Adjust table height
            if (this.controls.tbody) {
                const base = this.controls.baseTableMaxHeight || 400
                const panelH = isShow ? this.controls.batchPanel.offsetHeight : 0
                // Also account for filter panel if open? Assuming mutual exclusivity, only one is open.
                const filterPanelH = this.controls.filterPanel.classList.contains('show') ? this.controls.filterPanel.offsetHeight : 0
                const newMax = Math.max(80, base - panelH - filterPanelH)
                this.controls.tbody.style.maxHeight = newMax + 'px'
            }
        }

        updateBatchOpsButtonText() {
            const count = this.selectedSongIds.size
            const iconClass = this.controls.batchPanel.classList.contains('show') ? 'fa-arrow-up' : 'fa-arrow-down'

            if (count > 0) {
                this.controls.batchOpsBtn.innerHTML = `批量操作（已选择${count}首） <i class="fa-solid ${iconClass} batch-icon"></i>`
            } else {
                this.controls.batchOpsBtn.innerHTML = `批量操作 <i class="fa-solid ${iconClass} batch-icon"></i>`
            }

            if (this.controls.batchDeleteBtn) this.controls.batchDeleteBtn.disabled = count === 0
            if (this.controls.batchCollectBtn) this.controls.batchCollectBtn.disabled = count === 0
        }

        updateBatchButtonVisibility() {
            const isFiltered = this.filter.songs.length > 0 &&
                !(this.filter.text === '' && this.filter.matchStatus === 'all' && this.filter.pureMusic === 'all' && this.filter.liveVersion === 'all')

            const batchSelectAllFilteredBtn = this.controls.batchPanel.querySelector('#btn-batch-select-all-filtered')
            const batchDeselectAllBtn = this.controls.batchPanel.querySelector('#btn-batch-deselect-all')

            if (isFiltered) {
                batchSelectAllFilteredBtn.style.display = 'inline-block'
                batchDeselectAllBtn.style.display = 'inline-block'
            } else {
                batchSelectAllFilteredBtn.style.display = 'none'
                batchDeselectAllBtn.style.display = 'none'
            }
        }

        selectAllFiltered() {
            if (this.filter.songs.length > 0) {
                this.filter.songs.forEach(song => {
                    this.selectedSongIds.add(song.simpleSong.id)
                })
                this.updateSelectAllCheckboxState()
                // Update visible checkboxes
                const checkboxes = this.controls.tbody.querySelectorAll('.song-checkbox')
                checkboxes.forEach(cb => cb.checked = true)
                this.updateBatchOpsButtonText()
            }
        }

        deselectAllFiltered() {
            this.selectedSongIds.clear()
            this.updateSelectAllCheckboxState()
            const checkboxes = this.controls.tbody.querySelectorAll('.song-checkbox')
            checkboxes.forEach(cb => cb.checked = false)
            this.updateBatchOpsButtonText()
        }

        batchDelete() {
            Swal.fire({
                icon: 'warning',
                title: '确认批量删除',
                text: `确定要删除选中的 ${this.selectedSongIds.size} 首歌曲吗？`,
                showCancelButton: true,
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                didClose: () => {
                    this.openCloudList()
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await this.executeDelete(Array.from(this.selectedSongIds))
                    this.updateBatchOpsButtonText() // Update count after delete
                }
            })
        }

        batchAddToPlaylist() {
            Swal.fire({
                showCloseButton: true,
                showConfirmButton: false,
                html: this._getPlaylistPopupHTML(),
                didOpen: () => {
                    this._handleBatchAddToPlaylistOpen(Swal.getHtmlContainer())
                },
                didClose: () => {
                    this.openCloudList() // Reopen list
                }
            })
        }

        // --- Private Helper Methods (Refactoring Code) ---

        /**
         * 获取云盘列表的 HTML 模板
         * @private
         */
        _getCloudListHTML() {
            return `<style>
.controls-area {
    margin-bottom: 15px;
    text-align: left;
}
.control-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}
.filter-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
}
.filter-icon {
    display: inline-block;
    margin-left: 5px;
}
.filter-panel {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #f9f9f9;
    display: none;
}
.filter-panel.show {
    display: block;
}
.batch-panel {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #fff9e6;
    display: none;
}
.batch-panel.show {
    display: block;
}
.batch-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}
/* Checkbox visibility control */
.song-checkbox-cell, .song-checkbox-header {
    display: none;
}
.cloud-list-container.batch-mode .song-checkbox-cell,
.cloud-list-container.batch-mode .song-checkbox-header {
    display: table-cell;
}
.filter-row {
    margin-bottom: 12px;
}
.filter-row label {
    display: inline-block;
    min-width: 120px;
    font-weight: 500;
    margin-right: 10px;
}
.filter-row input[type="text"] {
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 8px;
    box-sizing: border-box;
    background: #fff;
}
.radio-group {
    display: inline-flex;
    gap: 15px;
}
.radio-group label {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: auto;
    margin-right: 0;
    font-weight: normal;
}
.filter-buttons {
    display: flex;
    gap: 10px;
    margin-top: 12px;
}
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 4%;
text-align: center;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 6%;
}
tr th:nth-child(3){
width: 32%;
}
tr td:nth-child(3){
width: 6%;
}
tr td:nth-child(4){
width: 26%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 16%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 8%;
}
tr th:nth-child(6),tr td:nth-child(7){
width: 18%;
}
tr th:nth-child(7),tr td:nth-child(8){
width: 15%;
}
.row-actions {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
}
table tbody tr:hover .row-actions {
    opacity: 1;
    pointer-events: auto;
}
table tbody tr {
    position: relative;
}
table tbody tr:hover td:nth-last-child(-n + 3) {
    visibility: hidden;
}
.cloud-list-container.batch-mode .row-actions {
    display: none !important;
}  
.cloud-list-container.batch-mode table tbody tr:hover td:nth-last-child(-n + 3) {
     visibility: visible !important;
}
</style>
<div class="controls-area">
    <div class="control-buttons">
        <button type="button" class="swal2-styled swal2-styled filter-toggle-btn" id="btn-filter-toggle">
            筛选歌曲
            <i class="fa-solid fa-arrow-down filter-icon"></i>
        </button>
        <button type="button" class="swal2-styled filter-toggle-btn" id="btn-batch-ops">
            批量操作
            <i class="fa-solid fa-arrow-down batch-icon"></i>
        </button>
    </div>
    <div class="batch-panel" id="batch-panel">
        <div class="batch-actions">
           <button type="button" class="swal2-styled" id="btn-batch-delete">删除</button>
           <button type="button" class="swal2-styled" id="btn-batch-collect">收藏</button>
           <button type="button" class="swal2-styled" style="display:none;" id="btn-batch-select-all-filtered">选择全部已筛选</button>
           <button type="button" class="swal2-styled" style="display:none;" id="btn-batch-deselect-all">取消所有选择</button>
        </div>
    </div>
    <div class="filter-panel" id="filter-panel">
        <div class="filter-row">
            <label>关键词：</label>
            <input class="swal2-input" type="text" id="text-filter" placeholder="过滤：标题/歌手/专辑">
        </div>
        <div class="filter-row">
            <label>匹配状态：</label>
            <div class="radio-group">
                <label><input type="radio" name="match-status" value="all" checked> 全部</label>
                <label><input type="radio" name="match-status" value="matched"> 已匹配</label>
                <label><input type="radio" name="match-status" value="unmatched"> 未匹配</label>
            </div>
        </div>
        <div class="filter-row">
            <label>纯音乐：</label>
            <div class="radio-group">
                <label><input type="radio" name="pure-music" value="all" checked> 全部</label>
                <label><input type="radio" name="pure-music" value="pure"> 仅纯音乐</label>
                <label><input type="radio" name="pure-music" value="noPure"> 排除纯音乐</label>
            </div>
        </div>
        <div class="filter-row">
            <label>Live版本：</label>
            <div class="radio-group">
                <label><input type="radio" name="live-version" value="all" checked> 全部</label>
                <label><input type="radio" name="live-version" value="live"> 仅Live</label>
                <label><input type="radio" name="live-version" value="noLive"> 排除Live</label>
            </div>
        </div>
        <div class="filter-buttons">
            <button type="button" class="swal2-confirm swal2-styled" id="btn-apply-filter">过滤</button>
        </div>
    </div>
</div>`
        }

        /**
         * 处理云盘列表打开时的事件绑定
         * @private
         */
        _handleCloudListOpen(cloudListContainer, cloudListFooter) {
            cloudListContainer.classList.add('cloud-list-container')
            cloudListFooter.style.display = 'block'
            cloudListFooter.style.textAlign = 'center'

            // 获取 DOM 引用
            this.controls.filterPanel = cloudListContainer.querySelector('#filter-panel')
            this.controls.filterToggleBtn = cloudListContainer.querySelector('#btn-filter-toggle')
            this.controls.batchPanel = cloudListContainer.querySelector('#batch-panel')
            this.controls.batchOpsBtn = cloudListContainer.querySelector('#btn-batch-ops')

            this.controls.batchDeleteBtn = cloudListContainer.querySelector('#btn-batch-delete')
            this.controls.batchCollectBtn = cloudListContainer.querySelector('#btn-batch-collect')
            const batchDeleteBtn = this.controls.batchDeleteBtn
            const batchCollectBtn = this.controls.batchCollectBtn
            const batchSelectAllFilteredBtn = cloudListContainer.querySelector('#btn-batch-select-all-filtered')
            const batchDeselectAllBtn = cloudListContainer.querySelector('#btn-batch-deselect-all')
            const applyFilterBtn = cloudListContainer.querySelector('#btn-apply-filter')

            // 获取输入控件
            this.filter.filterInput = cloudListContainer.querySelector('#text-filter')
            this.filter.filterControls.matchStatusRadios = cloudListContainer.querySelectorAll('input[name="match-status"]')
            this.filter.filterControls.pureMusicRadios = cloudListContainer.querySelectorAll('input[name="pure-music"]')
            this.filter.filterControls.liveVersionRadios = cloudListContainer.querySelectorAll('input[name="live-version"]')
            this.filter.filterControls.filterBtn = applyFilterBtn

            // 筛选面板事件
            this.controls.filterToggleBtn.addEventListener('click', () => {
                if (this.controls.batchPanel.classList.contains('show')) {
                    this.toggleBatchPanel()
                }

                this.controls.filterPanel.classList.toggle('show')
                const isShow = this.controls.filterPanel.classList.contains('show')
                const filterIconEl = this.controls.filterToggleBtn.querySelector('.filter-icon')

                if (isShow) {
                    filterIconEl.className = 'fa-solid fa-arrow-up filter-icon'
                    // 同步控件值
                    this.filter.filterInput.value = this.filter.text
                    cloudListContainer.querySelector(`input[name="match-status"][value="${this.filter.matchStatus}"]`).checked = true
                    cloudListContainer.querySelector(`input[name="pure-music"][value="${this.filter.pureMusic}"]`).checked = true
                    cloudListContainer.querySelector(`input[name="live-version"][value="${this.filter.liveVersion}"]`).checked = true
                } else {
                    filterIconEl.className = 'fa-solid fa-arrow-down filter-icon'
                }

                // 动态调整表格高度
                if (this.controls.tbody) {
                    const base = this.controls.baseTableMaxHeight || 400
                    const panelH = isShow ? this.controls.filterPanel.offsetHeight : 0
                    const newMax = Math.max(80, base - panelH)
                    this.controls.tbody.style.maxHeight = newMax + 'px'
                }
            })

            // 批量操作事件
            this.controls.batchOpsBtn.addEventListener('click', () => this.toggleBatchPanel())
            batchDeleteBtn.addEventListener('click', () => this.batchDelete())
            batchCollectBtn.addEventListener('click', () => this.batchAddToPlaylist())
            batchSelectAllFilteredBtn.addEventListener('click', () => {
                this.selectAllFiltered()
                this.updateBatchButtonVisibility()
            })
            batchDeselectAllBtn.addEventListener('click', () => {
                this.deselectAllFiltered()
                this.updateBatchButtonVisibility()
            })

            // 过滤确认事件
            applyFilterBtn.addEventListener('click', () => {
                this.filter.text = this.filter.filterInput.value.trim()
                this.filter.matchStatus = this.controls.filterPanel.querySelector('input[name="match-status"]:checked').value
                this.filter.pureMusic = this.controls.filterPanel.querySelector('input[name="pure-music"]:checked').value
                this.filter.liveVersion = this.controls.filterPanel.querySelector('input[name="live-version"]:checked').value

                this.onCloudInfoFilterChange()

                this.controls.filterPanel.classList.remove('show')
                const filterIconEl = this.controls.filterToggleBtn.querySelector('.filter-icon')
                filterIconEl.className = 'fa-solid fa-arrow-down filter-icon'
                if (this.controls.tbody) {
                    this.controls.tbody.style.maxHeight = this.controls.baseTableMaxHeight + 'px'
                }
            })

            // 初始化表格 DOM
            const songtb = document.createElement('table')
            songtb.border = 1
            songtb.frame = 'hsides'
            songtb.rules = 'rows'
            songtb.innerHTML = `<thead><tr><th class="song-checkbox-header"><input type="checkbox" id="select-all-header"></th><th>匹配</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>上传日期</th> </tr></thead><tbody></tbody>`

            this.controls.tbody = songtb.querySelector('tbody')
            this.controls.selectAllCheckbox = songtb.querySelector('#select-all-header')
            this.controls.selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked)
            })

            this.controls.baseTableMaxHeight = 400
            this.controls.tbody.style.maxHeight = this.controls.baseTableMaxHeight + 'px'
            this.controls.pageArea = cloudListFooter.querySelector('#page-area')
            this.controls.cloudDesc = cloudListFooter.querySelector('#cloud-desc')

            cloudListContainer.appendChild(songtb)
            this.updateFilterButtonText()

            // 初始数据加载
            if (this.filter.text === '' && this.filter.matchStatus === 'all' && this.filter.pureMusic === 'all' &&
                this.filter.liveVersion === 'all') {
                this.fetchCloudInfoForMatchTable((this.currentPage - 1) * this.cloudCountLimit)
            } else {
                this.sepreateFilterCloudListPage(this.currentPage)
            }
        }

        /**
         * 获取匹配弹窗 HTML
         * @private
         */
        _getMatchPopupHTML() {
            return `<style>
    table {
        width: 100%;
        height: 400px; 
        border-spacing: 0px;
        border-collapse: collapse;
        border: 2px solid #f0f0f0;
    }
    table th, table td {
        text-align: left;
        text-overflow: ellipsis;
    }
    table tbody {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    table thead tr, table tbody tr, table tfoot tr {
        box-sizing: border-box;
        table-layout: fixed;
        display: table;
        width: 100%;
    }
    table tbody tr td{
        border-bottom: none;
    }
tr th:nth-child(1),tr td:nth-child(1){
width: 6%;
}
tr th:nth-child(2){
width: 46%;
}
tr td:nth-child(2){
width: 6%;
}
tr td:nth-child(3){
width: 40%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 40%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
</style>
<div><label>关键词/歌曲链接/歌曲ID:<input class="swal2-input" id="search-text" style="width: 400px;" placeholder="关键词/链接/ID"></label><button type="button" class="swal2-confirm swal2-styled" id="btn-search">搜索</button></div>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>匹配</th><th>歌曲标题</th><th>歌手</th><th>时长</th></tr></thead><tbody></tbody></table>
</div>`
        }

        /**
         * 处理匹配弹窗打开
         * @private
         */
        _handleMatchPopupOpen(song, container, actions, footer, title) {
            actions.innerHTML = `<div class="swal2-loader"></div>
            <button type="button" class="swal2-styled" aria-label="" id="btn-unmatch" style="display: none;">取消网易云关联</button>`

            this.targetIdDom = container.querySelector("#target-id")
            this.searchDom = container.querySelector("#search-text")
            this.searchBtn = container.querySelector("#btn-search")
            this.unMatchBtn = actions.querySelector("#btn-unmatch")
            this.titleDOM = title
            this.tbody = container.querySelector('tbody')
            this.fileDuringTime = 0

            if (song.matchType === "matched") {
                this.unMatchBtn.style.display = 'inline-block'
                this.unMatchBtn.addEventListener('click', () => {
                    this.matchSong(song.simpleSong.id, 0)
                })
            }

            // 预填搜索关键词
            let songTitle = song.songName
            let songAlbum = song.album
            let songArtist = song.artist
            const pointIndex = songTitle.lastIndexOf('.')
            if (pointIndex > 0) {
                songTitle = songTitle.substring(0, pointIndex)
            }
            const hyphenIndex = songTitle.lastIndexOf('-')
            if (hyphenIndex > 0) {
                songArtist = songTitle.substring(0, hyphenIndex).trim()
                songTitle = songTitle.substring(hyphenIndex + 1).trim()
            }
            if (songArtist === '未知' || songArtist === '未知歌手') songArtist = ''
            if (songAlbum === '未知' || songAlbum === '未知专辑') songAlbum = ''
            const keyword = `${songTitle}   ${songArtist}   ${songAlbum}`.trim()
            this.searchDom.value = keyword

            // 初始搜索
            weapiRequest("/api/batch", {
                data: {
                    "/api/song/enhance/player/url/v1": JSON.stringify({
                        immerseType: 'ste',
                        ids: JSON.stringify([song.simpleSong.id]),
                        level: 'standard',
                        encodeType: 'mp3'
                    }),
                    "/api/cloudsearch/get/web": JSON.stringify({
                        s: keyword,
                        type: 1,
                        limit: 30,
                        offset: 0,
                        total: true,
                    })
                },
                onload: (content) => {
                    if (content.code !== 200) return

                    const playerContent = content["/api/song/enhance/player/url/v1"]
                    const searchContent = content["/api/cloudsearch/get/web"]
                    this.fileDuringTime = playerContent.data[0].time
                    let songDetailText = '文件时长：' + duringTimeDesc(this.fileDuringTime)
                    if (song.matchType === "unmatched") {
                        songDetailText += '，目前未关联到网易云。'
                    }
                    footer.innerHTML = `<div>${songDetailText}</div>` + footer.innerHTML
                    this.fiilSearchTable(searchContent, song.simpleSong.id)
                }
            })

            // 搜索按钮事件
            this.searchBtn.addEventListener('click', () => {
                const searchWord = this.searchDom.value.trim()
                const isSongId = /^[1-9]\d*$/.test(searchWord)
                let songId = isSongId ? searchWord : ''

                let URLObj = null
                if (searchWord.includes('song?')) {
                    try { URLObj = new URL(searchWord) } catch (e) { }
                }
                if (URLObj && URLObj.hostname === 'music.163.com') {
                    const urlParamsStr = URLObj.search.length > 0 ? URLObj.search : URLObj.href.slice(URLObj.href.lastIndexOf('?'))
                    songId = new URLSearchParams(urlParamsStr).get('id') || ''
                }

                const requestData = {}
                if (URLObj === null) {
                    requestData["/api/cloudsearch/get/web"] = JSON.stringify({
                        s: searchWord,
                        type: 1,
                        limit: 30,
                        offset: 0,
                        total: true,
                    })
                }
                if (songId.length > 0) {
                    requestData["/api/v3/song/detail"] = JSON.stringify({ c: JSON.stringify([{ 'id': songId }]) })
                }

                if (requestData["/api/cloudsearch/get/web"] || requestData["/api/v3/song/detail"]) {
                    this.tbody.innerHTML = '正在搜索...'
                    weapiRequest("/api/batch", {
                        data: requestData,
                        onload: (content) => {
                            if (content.code !== 200) return
                            const songDetailContent = content["/api/v3/song/detail"]
                            const searchContent = content["/api/cloudsearch/get/web"] || { result: { songCount: 0, songs: [] } }

                            if (songDetailContent && songDetailContent.songs && songDetailContent.songs.length > 0) {
                                songDetailContent.songs[0].privilege = songDetailContent.privileges[0]
                                if (searchContent.result.songCount > 0) {
                                    searchContent.result.songs.push(songDetailContent.songs[0])
                                } else {
                                    searchContent.result.songCount = 1
                                    searchContent.result.songs = songDetailContent.songs
                                }
                            }
                            this.fiilSearchTable(searchContent, song.simpleSong.id)
                        }
                    })
                } else {
                    this.tbody.innerHTML = '无法解析链接'
                }
            })
        }

        /**
         * 获取歌单弹窗 HTML
         * @private
         */
        _getPlaylistPopupHTML() {
            return `<style>
    table {
        width: 100%;
        height: 400px; 
        border-spacing: 0px;
        border-collapse: collapse;
        border: 2px solid #f0f0f0;
    }
    table th, table td {
        text-align: left;
        text-overflow: ellipsis;
    }
    table tbody {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    table thead tr, table tbody tr, table tfoot tr {
        box-sizing: border-box;
        table-layout: fixed;
        display: table;
        width: 100%;
    }
    table tbody tr td{
        border-bottom: none;
    }
tr th:nth-child(1),tr td:nth-child(1){
width: 14%;
}
tr th:nth-child(2){
width: 86%;
}
tr td:nth-child(2){
width: 16%;
}
tr td:nth-child(3){
width: 70%;
}
</style>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌单</th></tr></thead><tbody></tbody></table>
</div>`
        }

        /**
         * 处理歌单弹窗打开
         * @private
         */
        async _handlePlaylistPopupOpen(song, container) {
            this.tbody = container.querySelector('tbody')
            const userPlaylistRes = await weapiRequestSync("/api/user/playlist", {
                data: {
                    uid: unsafeWindow.GUser.userId,
                    limit: 1001,
                    offset: 0,
                }
            })

            if (userPlaylistRes.code === 200 && userPlaylistRes.playlist.length > 0) {
                userPlaylistRes.playlist.filter(p => !p.subscribed).forEach(playlist => {
                    const row = document.createElement('tr')
                    row.innerHTML = `<td><button type="button" class="swal2-styled btn-add" title="加入歌单"><i class="fa-solid fa-plus"></i></button></td>
                                    <td><img src="${playlist.coverImgUrl}?param=50y50&quality=100" title="${playlist.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></td>
                                    <td>${playlist.name}</td>`

                    row.querySelector('.btn-add').addEventListener('click', async () => {
                        const collectRes = await weapiRequestSync("/api/playlist/manipulate/tracks", {
                            method: "POST",
                            data: {
                                op: "add",
                                pid: playlist.id,
                                tracks: song.simpleSong.id,
                                trackIds: JSON.stringify([song.simpleSong.id])
                            }
                        })
                        if (collectRes.code === 200) {
                            showTips('加入歌单成功', 1)
                            this.openCloudList()
                        } else {
                            showTips(collectRes.message || '加入歌单失败', 2)
                        }
                    })
                    this.tbody.appendChild(row)
                })
            }
        }

        async _handleBatchAddToPlaylistOpen(container) {
            const tbody = container.querySelector('tbody')
            const userPlaylistRes = await weapiRequestSync("/api/user/playlist", {
                data: {
                    uid: unsafeWindow.GUser.userId,
                    limit: 1001,
                    offset: 0,
                }
            })

            if (userPlaylistRes.code === 200 && userPlaylistRes.playlist.length > 0) {
                userPlaylistRes.playlist.filter(p => !p.subscribed).forEach(playlist => {
                    const row = document.createElement('tr')
                    row.innerHTML = `<td><button type="button" class="swal2-styled btn-add" title="加入歌单"><i class="fa-solid fa-plus"></i></button></td>
                                    <td><img src="${playlist.coverImgUrl}?param=50y50&quality=100" title="${playlist.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></td>
                                    <td>${playlist.name}</td>`

                    row.querySelector('.btn-add').addEventListener('click', async () => {
                        const songIds = Array.from(this.selectedSongIds)
                        const collectRes = await weapiRequestSync("/api/playlist/manipulate/tracks", {
                            method: "POST",
                            data: {
                                op: "add",
                                pid: playlist.id,
                                trackIds: JSON.stringify(songIds),
                                immutable: true
                            }
                        })
                        if (collectRes.code === 200) {
                            showTips(`成功将 ${songIds.length} 首歌曲加入歌单`, 1)
                            this.selectedSongIds.clear()
                            this.updateBatchOpsButtonText()
                            this.openCloudList()
                        } else {
                            showTips(collectRes.message || '加入歌单失败', 2)
                        }
                    })
                    tbody.appendChild(row)
                })
            }
        }
    }
}
