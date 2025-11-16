import { createBigButton, showTips, songItemAddToFormat, createPageJumpInput } from "../utils/common"
import { weapiRequest, weapiRequestSync } from "../utils/request"
import { fileSizeDesc, duringTimeDesc, levelDesc } from '../utils/descHelper'

export const cloudMatch = (uiArea) => {
    //匹配纠正
    let btnMatch = createBigButton('云盘匹配纠正', uiArea, 2)
    btnMatch.addEventListener('click', () => {
        let matccher = new Matcher()
        matccher.start()
    })
    class Matcher {
        start() {
            this.cloudCountLimit = 50
            this.currentPage = 1
            this.filter = {
                text: '',
                notMatch: false,
                songs: [],
                filterInput: null,
                notMatchCb: null
            }
            this.controls = {
                tbody: null,
                pageArea: null,
                cloudDesc: null
            }
            this.openCloudList()
        }
        openCloudList() {
            Swal.fire({
                showCloseButton: true,
                showConfirmButton: false,
                width: '980px',
                html: `<style>
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
width: 6%;
}
tr th:nth-child(2){
width: 32%;
}
tr td:nth-child(2){
width: 6%;
}
tr td:nth-child(3){
width: 27%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 18%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 18%;
}
tr th:nth-child(6),tr td:nth-child(7){
width: 15%;
}

  /* 最右边隐藏按钮的容器 */
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

  /* 当鼠标悬停整行时显示 */
  table tbody tr:hover .row-actions {
    opacity: 1;
    pointer-events: auto;
  }

  /* 行相对定位，以便放置右侧按钮 */
  table tbody tr {
    position: relative;
  }

  /* 鼠标悬停时隐藏该行的最后三个单元格 */
  table tbody tr:hover td:nth-last-child(-n + 3) {
    visibility: hidden;
  }
</style>
<input class="swal2-input" value="${this.filter.text}" id="text-filter" placeholder="过滤：标题/歌手/专辑">
<input class="form-check-input" type="checkbox" value="" id="cb-notmatch" ${this.filter.notMatch ? 'checked' : ''}><label class="form-check-label" for="cb-notmatch">未匹配歌曲</label>
`,
                footer: `<div id="page-area"></div><br><div id="cloud-desc">${this.controls.cloudDesc ? this.controls.cloudDesc.innerHTML : ''}</div>`,
                didOpen: () => {
                    let cloudListContainer = Swal.getHtmlContainer()
                    let cloudListFooter = Swal.getFooter()
                    cloudListFooter.style.display = 'block'
                    cloudListFooter.style.textAlign = 'center'

                    let songtb = document.createElement('table')
                    songtb.border = 1
                    songtb.frame = 'hsides'
                    songtb.rules = 'rows'
                    songtb.innerHTML = `<thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>上传日期</th> </tr></thead><tbody></tbody>`
                    let tbody = songtb.querySelector('tbody')
                    this.controls.tbody = tbody
                    this.controls.pageArea = cloudListFooter.querySelector('#page-area')
                    this.controls.cloudDesc = cloudListFooter.querySelector('#cloud-desc')

                    let filterInput = cloudListContainer.querySelector('#text-filter')
                    let notMatchCb = cloudListContainer.querySelector('#cb-notmatch')
                    this.filter.filterInput = filterInput
                    this.filter.notMatchCb = notMatchCb
                    filterInput.addEventListener('change', () => {
                        if (this.filter.text == filterInput.value.trim()) {
                            return
                        }
                        this.filter.text = filterInput.value.trim()
                        this.onCloudInfoFilterChange()
                    })
                    notMatchCb.addEventListener('change', () => {
                        this.filter.notMatch = notMatchCb.checked
                        this.onCloudInfoFilterChange()
                    })
                    cloudListContainer.appendChild(songtb)
                    if (this.filter.text == '' && !this.filter.notMatch) {
                        this.fetchCloudInfoForMatchTable((this.currentPage - 1) * this.cloudCountLimit)
                    } else {
                        this.sepreateFilterCloudListPage(this.currentPage)
                    }
                },
            })
        }
        fetchCloudInfoForMatchTable(offset) {
            this.controls.tbody.innerHTML = '正在获取...'

            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: this.cloudCountLimit,
                    offset: offset,
                },
                onload: (res) => {
                    //console.log(res)
                    this.currentPage = (offset / this.cloudCountLimit) + 1
                    let maxPage = Math.ceil(res.count / this.cloudCountLimit)
                    this.controls.cloudDesc.innerHTML = `云盘容量 ${fileSizeDesc(res.size)}/${fileSizeDesc(res.maxSize)} 共${res.count}首歌曲`
                    let pageIndexs = [1]
                    let floor = Math.max(2, this.currentPage - 2);
                    let ceil = Math.min(maxPage - 1, this.currentPage + 2);
                    for (let i = floor; i <= ceil; i++) {
                        pageIndexs.push(i)
                    }
                    if (maxPage > 1) {
                        pageIndexs.push(maxPage)
                    }
                    this.controls.pageArea.innerHTML = ''
                    pageIndexs.forEach(pageIndex => {
                        let pageBtn = document.createElement('button')
                        pageBtn.setAttribute("type", "button")
                        pageBtn.className = "swal2-styled"
                        pageBtn.innerHTML = pageIndex
                        if (pageIndex != this.currentPage) {
                            pageBtn.addEventListener('click', () => {
                                this.fetchCloudInfoForMatchTable(this.cloudCountLimit * (pageIndex - 1))
                            })
                        } else {
                            pageBtn.style.background = 'white'
                        }
                        this.controls.pageArea.appendChild(pageBtn)
                    })
                    //页码跳转
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
        fillCloudListTable(songs) {
            this.controls.tbody.innerHTML = ''
            if (songs.length == 0) {
                this.controls.tbody.innerHTML = '空空如也'
            }
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
                let dateObj = new Date(song.addTime)
                let addTime = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}-${dateObj.getDate()}`
                let tablerow = document.createElement('tr')
                tablerow.innerHTML = `<td><button type="button" class="swal2-styled btn-match" title="匹配"><i class="fa-solid fa-link"></i></button></td>
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
                    let albumLink = tablerow.querySelector('.album-link')
                    albumLink.href = 'https://music.163.com/album?id=' + song.simpleSong.al.id
                    albumLink.target = "_blank"
                }
                const btnMatch = tablerow.querySelector('.btn-match')
                btnMatch.addEventListener('click', () => {
                    this.openMatchPopup(song)
                })

                const addToFormat = songItemAddToFormat(song.simpleSong)
                const btnPlay = tablerow.querySelector('.btn-play')
                btnPlay.addEventListener('click', () => {
                    unsafeWindow.top.player.addTo([addToFormat], false, true)
                })
                const btnAddPlay = tablerow.querySelector('.btn-addplay')
                btnAddPlay.addEventListener('click', () => {
                    unsafeWindow.top.player.addTo([addToFormat], false, false)
                })
                const btnCollect = tablerow.querySelector('.btn-collect')
                btnCollect.addEventListener('click', () => {
                    this.openAddToPlaylistPopup(song)
                })
                const btnDelete = tablerow.querySelector('.btn-delete')
                btnDelete.addEventListener('click', () => {
                    this.deleteCloudSong(song)
                })

                this.controls.tbody.appendChild(tablerow)
            })
        }
        onCloudInfoFilterChange() {
            this.filter.songs = []
            if (this.filter.text == '' && !this.filter.notMatch) {
                this.fetchCloudInfoForMatchTable(0)
                return
            }
            this.filter.filterInput.setAttribute("disabled", 1)
            this.filter.notMatchCb.setAttribute("disabled", 1)
            this.cloudInfoFilterFetchData(0)
        }
        cloudInfoFilterFetchData(offset) {
            if (offset == 0) {
                this.filter.songs = []
            }
            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: 1000,
                    offset: offset,
                },
                onload: (res) => {
                    this.controls.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1000, res.count)}云盘歌曲`
                    res.data.forEach(song => {
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
                                if (!matchFlag) {
                                    return
                                }
                            }
                        }
                        if (this.filter.notMatch && song.matchType === "matched") {
                            return
                        }
                        this.filter.songs.push(song)
                    })
                    if (res.hasMore) {
                        //if(offset<2001){//testing
                        res = {}
                        this.cloudInfoFilterFetchData(offset + 1000)
                    } else {
                        this.sepreateFilterCloudListPage(1)
                        this.filter.filterInput.removeAttribute("disabled")
                        this.filter.notMatchCb.removeAttribute("disabled")
                    }
                }
            })
        }
        sepreateFilterCloudListPage(currentPage) {
            this.currentPage = currentPage
            let count = this.filter.songs.length
            let maxPage = Math.ceil(count / this.cloudCountLimit)
            this.controls.pageArea.innerHTML = ''
            let pageIndexs = [1]
            let floor = Math.max(2, currentPage - 2);
            let ceil = Math.min(maxPage - 1, currentPage + 2);
            for (let i = floor; i <= ceil; i++) {
                pageIndexs.push(i)
            }
            if (maxPage > 1) {
                pageIndexs.push(maxPage)
            }
            this.controls.pageArea.innerHTML = ''
            pageIndexs.forEach(pageIndex => {
                let pageBtn = document.createElement('button')
                pageBtn.setAttribute("type", "button")
                pageBtn.className = "swal2-styled"
                pageBtn.innerHTML = pageIndex
                if (pageIndex != currentPage) {
                    pageBtn.addEventListener('click', () => {
                        this.sepreateFilterCloudListPage(pageIndex)
                    })
                } else {
                    pageBtn.style.background = 'white'
                }
                this.controls.pageArea.appendChild(pageBtn)
            })
            let songindex = (currentPage - 1) * this.cloudCountLimit
            this.fillCloudListTable(this.filter.songs.slice(songindex, songindex + this.cloudCountLimit))
        }
        openMatchPopup(song) {
            Swal.fire({
                showCloseButton: true,
                width: '980px',
                confirmButtonText: '匹配',
                html: `<style>
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
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th></tr></thead><tbody></tbody></table>
</div>
`,
                footer: '',

                didOpen: () => {
                    const container = Swal.getHtmlContainer()
                    const actions = Swal.getActions()
                    const footer = Swal.getFooter()
                    actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-unmatch" style="display: none;">取消网易云关联</button>`
                    this.targetIdDom = container.querySelector("#target-id")
                    this.searchDom = container.querySelector("#search-text")
                    this.searchBtn = container.querySelector("#btn-search")
                    this.unMatchBtn = actions.querySelector("#btn-unmatch")
                    this.titleDOM = Swal.getTitle()
                    this.tbody = container.querySelector('tbody')
                    this.fileDuringTime = 0

                    if (song.matchType === "matched") {
                        this.unMatchBtn.style.display = 'inline-block'
                        this.unMatchBtn.addEventListener('click', () => {
                            this.matchSong(song.simpleSong.id, 0)
                        })
                    }

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
                            //console.log(content)
                            if (content.code != 200) {
                                return
                            }
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

                    this.searchBtn.addEventListener('click', () => {
                        const searchWord = this.searchDom.value.trim()
                        const isSongId = /^[1-9]\d*$/.test(searchWord)
                        let songId = isSongId ? searchWord : ''
                        //解析URL
                        let URLObj = null
                        if (searchWord.includes('song?')) {
                            try {
                                URLObj = new URL(searchWord)
                            } catch (e) {
                            }
                        }
                        if (URLObj && URLObj.hostname === 'music.163.com') {
                            let urlParamsStr = URLObj.search.length > 0 ? URLObj.search : URLObj.href.slice(URLObj.href.lastIndexOf('?'))
                            songId = new URLSearchParams(urlParamsStr).get('id') || ''
                        }

                        let requestData = {}
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
                                    console.log(content)
                                    if (content.code != 200) {
                                        return
                                    }
                                    const songDetailContent = content["/api/v3/song/detail"]
                                    const searchContent = content["/api/cloudsearch/get/web"] || { result: { songCount: 0, songs: [] } }

                                    if (songDetailContent && songDetailContent.songs && songDetailContent.songs.length > 0) {
                                        songDetailContent.songs[0].privilege = songDetailContent.privileges[0]
                                        if (searchContent.result.songCount > 0) {
                                            searchContent.result.songs.push(songDetailContent.songs[0])
                                        }
                                        else {
                                            searchContent.result.songCount = 1
                                            searchContent.result.songs = songDetailContent.songs
                                        }
                                    }
                                    this.fiilSearchTable(searchContent, song.simpleSong.id)
                                }
                            })
                        }
                        else {
                            this.tbody.innerHTML = '无法解析链接'
                        }
                    })

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
                    if (res.code != 200) {
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
                        this.openCloudList()
                    }
                },
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
                    let tablerow = document.createElement('tr')
                    let songName = resultSong.name
                    const artists = resultSong.ar.map(ar => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${ar.name}</a>`).join()
                    const needHighLight = Math.abs(resultSong.dt - this.fileDuringTime) < 1000
                    const dtstyle = needHighLight ? 'color:SpringGreen;' : ''

                    tablerow.innerHTML = `<td><button type="button" class="swal2-styled selectbtn"><i class="fa-solid fa-link"></i></button></td><td><a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${resultSong.al.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${songName}${resultSong.privilege.cs ? ' <i class="fa-regular fa-cloud"></i>' : ''}</a></td><td>${artists}</td><td style="${dtstyle}">${duringTimeDesc(resultSong.dt)}</td>`
                    let selectbtn = tablerow.querySelector('.selectbtn')
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
                html: `<style>
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
</div>
`,
                footer: '',

                didOpen: async () => {
                    const container = Swal.getHtmlContainer()
                    this.tbody = container.querySelector('tbody')
                    const userPlaylistRes = await weapiRequestSync("/api/user/playlist", {
                        data: {
                            uid: unsafeWindow.GUser.userId,
                            limit: 1001,
                            offset: 0,
                        },
                    })
                    const userPlaylists = []
                    if (userPlaylistRes.code === 200 && userPlaylistRes.playlist.length > 0) {
                        for (const playlist of userPlaylistRes.playlist) {
                            if (!playlist.subscribed) {
                                userPlaylists.push({
                                    id: playlist.id,
                                    name: playlist.name,
                                    html: `<td><button type="button" class="swal2-styled btn-add" title="加入歌单"><i class="fa-solid fa-plus"></i></button></td>
                                                <td><img src="${playlist.coverImgUrl}?param=50y50&quality=100" title="${playlist.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></td>
                                                <td>${playlist.name}</td>`,
                                })
                            }
                        }
                    }
                    for (const playlist of userPlaylists) {
                        const row = document.createElement('tr')
                        row.innerHTML = playlist.html
                        const btnAdd = row.querySelector('.btn-add')
                        btnAdd.addEventListener('click', async () => {
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
                                if (collectRes.message) {
                                    showTips(collectRes.message, 2)
                                } else {
                                    showTips('加入歌单失败', 2)
                                }
                            }
                        })
                        this.tbody.appendChild(row)
                    }
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
                    const deleteRes = await weapiRequestSync("/api/cloud/del", {
                        method: "POST",
                        data: {
                            songIds: [song.simpleSong.id],
                        }
                    })
                    if (deleteRes.code === 200) {
                        showTips('删除成功', 1)
                        if (this.filter.songs.length > 0) {
                            for (let i = 0; i < this.filter.songs.length; i++) {
                                if (this.filter.songs[i].simpleSong.id == song.simpleSong.id) {
                                    this.filter.songs.splice(i, 1)
                                    break
                                }
                            }
                        }
                    } else {
                        if (deleteRes.message) {
                            showTips(deleteRes.message, 2)
                        } else {
                            showTips('删除失败', 2)
                        }
                    }
                    this.openCloudList()
                }
            })
        }
    }
}