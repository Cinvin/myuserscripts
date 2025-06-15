import { createBigButton, showTips } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { fileSizeDesc, duringTimeDesc, levelDesc } from '../utils/descHelper'

export const cloudMatch = (uiArea) => {
    //匹配纠正
    let btnMatch = createBigButton('云盘匹配纠正', uiArea, 2)
    btnMatch.addEventListener('click', () => {
        let matcher = new Matcher()
        matcher.start()
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
                width: 800,
                html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
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
width: 8%;
}
tr th:nth-child(2){
width: 32%;
}
tr td:nth-child(2){
width: 8%;
}
tr td:nth-child(3){
width: 25%;
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
</style>
<input class="swal2-input" value="${this.filter.text}" id="text-filter" placeholder="歌曲过滤">
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
                    let matcher = this
                    filterInput.addEventListener('change', () => {
                        if (matcher.filter.text == filterInput.value.trim()) {
                            return
                        }
                        matcher.filter.text = filterInput.value.trim()
                        this.onCloudInfoFilterChange()
                    })
                    notMatchCb.addEventListener('change', () => {
                        matcher.filter.notMatch = notMatchCb.checked
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
            let matcher = this
            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: this.cloudCountLimit,
                    offset: offset,
                },
                onload: (res) => {
                    //console.log(res)
                    matcher.currentPage = (offset / this.cloudCountLimit) + 1
                    let maxPage = Math.ceil(res.count / this.cloudCountLimit)
                    this.controls.cloudDesc.innerHTML = `云盘容量 ${fileSizeDesc(res.size)}/${fileSizeDesc(res.maxSize)} 共${res.count}首歌曲`
                    let pageIndexs = [1]
                    let floor = Math.max(2, matcher.currentPage - 2);
                    let ceil = Math.min(maxPage - 1, matcher.currentPage + 2);
                    for (let i = floor; i <= ceil; i++) {
                        pageIndexs.push(i)
                    }
                    if (maxPage > 1) {
                        pageIndexs.push(maxPage)
                    }
                    matcher.controls.pageArea.innerHTML = ''
                    pageIndexs.forEach(pageIndex => {
                        let pageBtn = document.createElement('button')
                        pageBtn.setAttribute("type", "button")
                        pageBtn.className = "swal2-styled"
                        pageBtn.innerHTML = pageIndex
                        if (pageIndex != matcher.currentPage) {
                            pageBtn.addEventListener('click', () => {
                                matcher.fetchCloudInfoForMatchTable(matcher.cloudCountLimit * (pageIndex - 1))
                            })
                        } else {
                            pageBtn.style.background = 'white'
                        }
                        matcher.controls.pageArea.appendChild(pageBtn)
                    })
                    this.fillCloudListTable(res.data)
                }
            })
        }
        fillCloudListTable(songs) {
            let matcher = this
            matcher.controls.tbody.innerHTML = ''
            if (songs.length == 0) {
                matcher.controls.tbody.innerHTML = '空空如也'
            }
            songs.forEach(function (song) {
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
                tablerow.innerHTML = `<td><button type="button" class="swal2-styled">匹配</button></td><td><a class="album-link"><img src="${picUrl}?param=50y50&quality=100" title="${album}"></a></td><td><a class="song-link" target="_blank" href="https://music.163.com/song?id=${song.simpleSong.id}">${song.simpleSong.name}</a></td><td>${artist}</td><td>${duringTimeDesc(song.simpleSong.dt)}</td><td>${fileSizeDesc(song.fileSize)} ${levelDesc(song.simpleSong.privilege.plLevel)}</td><td>${addTime}</td>`
                if (song.simpleSong.al && song.simpleSong.al.id > 0) {
                    let albumLink = tablerow.querySelector('.album-link')
                    albumLink.href = 'https://music.163.com/album?id=' + song.simpleSong.al.id
                    albumLink.target = "_blank"
                }
                let btn = tablerow.querySelector('button')
                btn.addEventListener('click', () => {
                    matcher.openMatchPopup(song)
                })
                matcher.controls.tbody.appendChild(tablerow)
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
            let matcher = this
            if (offset == 0) {
                this.filter.songs = []
            }
            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: 1000,
                    offset: offset,
                },
                onload: (res) => {
                    matcher.controls.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1000, res.count)}云盘歌曲`
                    res.data.forEach(song => {
                        if (matcher.filter.text.length > 0) {
                            let matchFlag = false
                            if (song.album.includes(matcher.filter.text) ||
                                song.artist.includes(matcher.filter.text) ||
                                song.simpleSong.name.includes(matcher.filter.text) ||
                                (song.simpleSong.al && song.simpleSong.al.id > 0 && song.simpleSong.al.name && song.simpleSong.al.name.includes(matcher.filter.text))) {
                                matchFlag = true
                            }
                            if (!matchFlag && song.simpleSong.ar) {
                                song.simpleSong.ar.forEach(ar => {
                                    if (ar.name && ar.name.includes(matcher.filter.text)) {
                                        matchFlag = true
                                    }
                                })
                                if (!matchFlag) {
                                    return
                                }
                            }
                        }
                        if (matcher.filter.notMatch && song.simpleSong.cd) {
                            return
                        }
                        matcher.filter.songs.push(song)
                    })
                    if (res.hasMore) {
                        //if(offset<2001){//testing
                        res = {}
                        matcher.cloudInfoFilterFetchData(offset + 1000)
                    } else {
                        matcher.sepreateFilterCloudListPage(1)
                        matcher.filter.filterInput.removeAttribute("disabled")
                        matcher.filter.notMatchCb.removeAttribute("disabled")
                    }
                }
            })
        }
        sepreateFilterCloudListPage(currentPage) {
            this.currentPage = currentPage
            let matcher = this
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
            matcher.controls.pageArea.innerHTML = ''
            pageIndexs.forEach(pageIndex => {
                let pageBtn = document.createElement('button')
                pageBtn.setAttribute("type", "button")
                pageBtn.className = "swal2-styled"
                pageBtn.innerHTML = pageIndex
                if (pageIndex != currentPage) {
                    pageBtn.addEventListener('click', () => {
                        matcher.sepreateFilterCloudListPage(pageIndex)
                    })
                } else {
                    pageBtn.style.background = 'white'
                }
                matcher.controls.pageArea.appendChild(pageBtn)
            })
            let songindex = (currentPage - 1) * this.cloudCountLimit
            matcher.fillCloudListTable(matcher.filter.songs.slice(songindex, songindex + this.cloudCountLimit))
        }
        openMatchPopup(song) {
            let matcher = this
            Swal.fire({
                showCloseButton: true,
                title: `${song.simpleSong.name} 匹配纠正`,
                width: 800,
                confirmButtonText: '匹配',
                html: `<style>
    .table-wrapper {
        height: 200px; 
        overflow: auto; 
    }
    table {
        width: 100%;
        height: 400; 
        border-spacing: 0px;
        border-collapse: collapse;
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
width: 8%;
}
tr th:nth-child(2){
width: 52%;
}
tr td:nth-child(2){
width: 10%;
}
tr td:nth-child(3){
width: 42%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 32%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
</style>
<div><label>目标歌曲ID<input class="swal2-input" id="target-id" placeholder="目标歌曲ID" ></label></div>
<div><input class="swal2-input" id="search-text" placeholder="搜索"><button type="button" class="swal2-confirm swal2-styled" id="btn-search">搜索</button></div>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th></tr></thead><tbody></tbody></table>
</div>
`,
                footer: 'ID为0时解除匹配 歌曲页面网址里的数字就是ID',

                preConfirm: () => {
                    const targetId = document.getElementById("target-id").value
                    return targetId
                },
                didOpen: () => {
                    const container = Swal.getHtmlContainer()
                    this.targetIdDom = container.querySelector("#target-id")
                    this.searchDom = container.querySelector("#search-text")
                    this.searchBtn = container.querySelector("#btn-search")
                    this.titleDOM = Swal.getTitle()
                    this.tbody = container.querySelector('tbody')
                    this.fileDuringTime = 0

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
                            this.titleDOM.innerHTML += ' 文件时长' + duringTimeDesc(this.fileDuringTime)

                            this.fiilSearchTable(searchContent)
                        }
                    })

                    this.searchBtn.addEventListener('click',()=>{
                        const searchWord = this.searchDom.value.trim()
                        weapiRequest("/api/cloudsearch/get/web", {
                            data:{
                                s: searchWord,
                                type: 1,
                                limit: 30,
                                offset: 0,
                                total: true,
                            },
                            onload: (searchContent) => {
                                //console.log(searchContent)
                                if (searchContent.code != 200) {
                                    return
                                }
                                this.fiilSearchTable(searchContent)
                            }
                        })
                    })
                },
            })
                .then(result => {
                    if (result.isConfirmed && result.value.length > 0) {
                        let fromId = song.simpleSong.id
                        let toId = result.value
                        weapiRequest("/api/cloud/user/song/match", {
                            data: {
                                songId: fromId,
                                adjustSongId: toId,
                            },
                            onload: (res) => {
                                //console.log(res)
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

                                    if (matcher.filter.songs.length > 0 && res.matchData) {
                                        for (let i = 0; i < matcher.filter.songs.length; i++) {
                                            if (matcher.filter.songs[i].simpleSong.id == fromId) {
                                                //matchData里无privilege
                                                res.matchData.simpleSong.privilege = matcher.filter.songs[i].simpleSong.privilege
                                                matcher.filter.songs[i] = res.matchData
                                                break
                                            }
                                        }
                                    }
                                }
                                matcher.openCloudList()
                            },
                        })
                    } else {
                        matcher.openCloudList()
                    }
                })
        }
        fiilSearchTable(searchContent) {
            this.tbody.innerHTML=''
            if (searchContent.result.songs.length > 0) {
                searchContent.result.songs.forEach(matchSong => {
                    let tablerow = document.createElement('tr')
                    let songName = matchSong.name
                    if ('pc' in matchSong) {
                        songName += ' ☁️'
                    }
                    const artists = matchSong.ar.map(ar => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${ar.name}</a>`).join()
                    const needHighLight = Math.abs(matchSong.dt - this.fileDuringTime) < 1000
                    const dtstyle = needHighLight ? 'color:SpringGreen;' : ''

                    tablerow.innerHTML = `<td><button type="button" class="swal2-styled selectbtn">选择</button></td><td><a href="https://music.163.com/album?id=${matchSong.al.id}" target="_blank"><img src="${matchSong.al.picUrl}?param=50y50&quality=100" title="${matchSong.al.name}"></a></td><td><a href="https://music.163.com/song?id=${matchSong.id}" target="_blank">${songName}</a></td><td>${artists}</td><td style="${dtstyle}">${duringTimeDesc(matchSong.dt)}</td>`
                    let selectbtn = tablerow.querySelector('.selectbtn')
                    selectbtn.addEventListener('click', () => {
                        this.targetIdDom.value = matchSong.id
                    })

                    this.tbody.appendChild(tablerow)
                })
            }
        }
    }
}