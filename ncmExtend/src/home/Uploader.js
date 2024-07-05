import { weapiRequest } from "../utils/request"
import { getArtistTextInSongDetail, getAlbumTextInSongDetail, duringTimeDesc, nameFileWithoutExt, fileSizeDesc } from "../utils/descHelper"
import { sleep,showTips } from "../utils/common"
export class Uploader {
    constructor(config, showAll = false) {
        this.songs = []
        this.config = config
        this.filter = {
            text: '',
            noCopyright: true,
            vip: true,
            pay: true,
            lossless: false,
            all: showAll,
            songIndexs: []
        }
        this.page = {
            current: 1,
            max: 1,
            limitCount: 50
        }
        this.batchUpload = {
            threadMax: 2,
            threadCount: 2,
            working: false,
            finnishThread: 0,
            songIndexs: []
        }
    };
    start() {
        this.showPopup()
    }

    showPopup() {
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
width: 35%;
}
tr td:nth-child(2){
width: 10%;
}
tr td:nth-child(3){
width: 25%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 20%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 16%;
}
tr th:nth-child(6),tr td:nth-child(7){
width: 8%;
}
</style>
<input id="text-filter" class="swal2-input" type="text" placeholder="歌曲过滤">
<div id="my-cbs">
<input class="form-check-input" type="checkbox" value="" id="cb-copyright" checked><label class="form-check-label" for="cb-copyright">无版权</label>
<input class="form-check-input" type="checkbox" value="" id="cb-vip" checked><label class="form-check-label" for="cb-vip">VIP</label>
<input class="form-check-input" type="checkbox" value="" id="cb-pay" checked><label class="form-check-label" for="cb-pay">数字专辑</label>
<input class="form-check-input" type="checkbox" value="" id="cb-lossless"><label class="form-check-label" for="cb-lossless">无损资源</label>
<input class="form-check-input" type="checkbox" value="" id="cb-all" ${this.filter.all ? "checked" : ""}><label class="form-check-label" for="cb-all">全部歌曲</label>
</div>
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upload-batch">全部上传</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>备注</th> </tr></thead><tbody></tbody></table>
`,
            footer: '<div></div>',
            didOpen: () => {
                let container = Swal.getHtmlContainer()
                let footer = Swal.getFooter()
                let tbody = container.querySelector('tbody')
                this.popupObj = {
                    container: container,
                    tbody: tbody,
                    footer: footer
                }

                //this.filter={text:'',noCopyright:true,vip:true,pay:true,lossless:false,songIds:[]}
                let filterInput = container.querySelector('#text-filter')
                filterInput.addEventListener('change', () => {
                    let filtertext = filterInput.value.trim()
                    if (this.filter.text != filtertext) {
                        this.filter.text = filtertext
                        this.applyFilter()
                    }
                })
                let copyrightInput = container.querySelector('#cb-copyright')
                copyrightInput.addEventListener('change', () => {
                    this.filter.noCopyright = copyrightInput.checked
                    this.applyFilter()
                })
                let vipInput = container.querySelector('#cb-vip')
                vipInput.addEventListener('change', () => {
                    this.filter.vip = vipInput.checked
                    this.applyFilter()
                })
                let payInput = container.querySelector('#cb-pay')
                payInput.addEventListener('change', () => {
                    this.filter.pay = payInput.checked
                    this.applyFilter()
                })
                let losslessInput = container.querySelector('#cb-lossless')
                losslessInput.addEventListener('change', () => {
                    this.filter.lossless = losslessInput.checked
                    this.applyFilter()
                })
                let allInput = container.querySelector('#cb-all')
                allInput.addEventListener('change', () => {
                    this.filter.all = allInput.checked
                    this.applyFilter()
                })
                let uploader = this
                this.btnUploadBatch = container.querySelector('#btn-upload-batch')
                this.btnUploadBatch.addEventListener('click', () => {
                    if (this.batchUpload.working) {
                        return
                    }
                    this.batchUpload.songIndexs = []
                    this.filter.songIndexs.forEach(idx => {
                        if (!uploader.songs[idx].uploaded) {
                            uploader.batchUpload.songIndexs.push(idx)
                        }
                    })
                    if (this.batchUpload.songIndexs.length == 0) {
                        showTips('没有需要上传的歌曲', 1)
                        return
                    }
                    this.batchUpload.working = true
                    this.batchUpload.finnishThread = 0
                    this.batchUpload.threadCount = Math.min(this.batchUpload.songIndexs.length, this.batchUpload.threadMax)
                    for (let i = 0; i < this.batchUpload.threadCount; i++) {
                        this.uploadSong(this.batchUpload.songIndexs[i])
                    }
                })
                this.fetchSongInfo()
            },
        })
    }
    fetchSongInfo() {
        //console.log(songList)
        let ids = this.config.data.map(item => {
            return {
                'id': item.id
            }
        })
        //获取需上传的song
        this.popupObj.tbody.innerHTML = '正在获取歌曲信息...'
        this.fetchSongInfoSub(ids, 0)
    }
    fetchSongInfoSub(ids, startIndex) {
        if (startIndex >= ids.length) {
            if (this.songs.length == 0) {
                this.popupObj.tbody.innerHTML = '没有可以上传的歌曲'
                return
            }
            //排序
            this.songs.sort((a, b) => {
                if (a.albumid != b.albumid) {
                    return b.albumid - a.albumid
                }
                return a.id - b.id
            })
            this.createTableRow()
            this.applyFilter()
            return
        }
        this.popupObj.tbody.innerHTML = `正在获取第${startIndex + 1}到${Math.min(ids.length, startIndex + 1000)}首歌曲信息...`
        let uploader = this
        weapiRequest("/api/v3/song/detail", {
            data: {
                c: JSON.stringify(ids.slice(startIndex, startIndex + 1000))
            },
            onload: function (content) {
                //console.log(content)
                let songslen = content.songs.length
                let privilegelen = content.privileges.length
                for (let i = 0; i < privilegelen; i++) {
                    if (!content.privileges[i].cs) {
                        let config = uploader.config.data.find(item => {
                            return item.id == content.privileges[i].id
                        })
                        let item = {
                            id: content.privileges[i].id,
                            name: '未知',
                            album: '未知',
                            albumid: 0,
                            artists: '未知',
                            tns: '', //翻译
                            dt: duringTimeDesc(0),
                            filename: '未知.' + config.ext,
                            ext: config.ext,
                            md5: config.md5,
                            size: config.size,
                            bitrate: config.bitrate,
                            picUrl: 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg',
                            isNoCopyright: content.privileges[i].st < 0,
                            isVIP: false,
                            isPay: false,
                            uploaded: false,
                            needMatch: config.name == undefined,
                        }
                        for (let j = 0; j < songslen; j++) {
                            if (content.songs[j].id == content.privileges[i].id) {
                                item.name = content.songs[j].name
                                item.album = getAlbumTextInSongDetail(content.songs[j])
                                item.albumid = content.songs[j].al.id || 0
                                item.artists = getArtistTextInSongDetail(content.songs[j])
                                item.tns = content.songs[j].tns ? content.songs[j].tns.join() : '' //翻译
                                item.dt = duringTimeDesc(content.songs[j].dt || 0)
                                item.filename = nameFileWithoutExt(item.name, item.artists, 'artist-title') + '.' + config.ext
                                item.picUrl = (content.songs[j].al && content.songs[j].al.picUrl) ? content.songs[j].al.picUrl : 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
                                item.isVIP = content.songs[j].fee == 1
                                item.isPay = content.songs[j].fee == 4
                                break
                            }
                        }
                        if (config.name) {
                            item.name = config.name
                            item.album = config.al
                            item.artists = config.ar
                            item.filename = nameFileWithoutExt(item.name, item.artists, 'artist-title') + '.' + config.ext
                        }
                        uploader.songs.push(item)
                    }
                }
                uploader.fetchSongInfoSub(ids, startIndex + 1000)
            }
        })
    }
    createTableRow() {
        for (let i = 0; i < this.songs.length; i++) {
            let song = this.songs[i]
            let tablerow = document.createElement('tr')
            tablerow.innerHTML = `<td><button type="button" class="swal2-styled">上传</button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${song.dt}</td><td>${fileSizeDesc(song.size)} ${song.ext.toUpperCase()}</td><td class="song-remark"></td>`
            let songTitle = tablerow.querySelector('.song-remark')
            if (song.isNoCopyright) {
                songTitle.innerHTML = '无版权'
            } else if (song.isVIP) {
                songTitle.innerHTML = 'VIP'
            } else if (song.isPay) {
                songTitle.innerHTML = '数字专辑'
            }
            let btn = tablerow.querySelector('button')
            btn.addEventListener('click', () => {
                if (this.batchUpload.working) {
                    return
                }
                this.uploadSong(i)
            })
            song.tablerow = tablerow
        }
    }
    applyFilter() {
        this.filter.songIndexs = []
        let filterText = this.filter.text
        let isNoCopyright = this.filter.noCopyright
        let isVIP = this.filter.vip
        let isPay = this.filter.pay
        let isLossless = this.filter.lossless
        let isALL = this.filter.all
        for (let i = 0; i < this.songs.length; i++) {
            let song = this.songs[i]
            if (filterText.length > 0 && !song.name.includes(filterText) && !song.album.includes(filterText) && !song.artists.includes(filterText) && !song.tns.includes(filterText)) {
                continue
            }
            if (isALL) {
                this.filter.songIndexs.push(i)
            } else if (isNoCopyright && song.isNoCopyright) {
                this.filter.songIndexs.push(i)
            } else if (isVIP && song.isVIP) {
                this.filter.songIndexs.push(i)
            } else if (isPay && song.isPay) {
                this.filter.songIndexs.push(i)
            } else if (isLossless && song.ext == 'flac') {
                this.filter.songIndexs.push(i)
            }
        }
        this.page.current = 1
        this.page.max = Math.ceil(this.filter.songIndexs.length / this.page.limitCount)
        this.renderData()
        this.renderFilterInfo()
    }
    renderData() {
        if (this.filter.songIndexs.length == 0) {
            this.popupObj.tbody.innerHTML = '空空如也'
            this.popupObj.footer.innerHTML = ''
            return
        }
        //table
        this.popupObj.tbody.innerHTML = ''
        let songBegin = (this.page.current - 1) * this.page.limitCount
        let songEnd = Math.min(this.filter.songIndexs.length, songBegin + this.page.limitCount)
        for (let i = songBegin; i < songEnd; i++) {
            this.popupObj.tbody.appendChild(this.songs[this.filter.songIndexs[i]].tablerow)
        }
        //page
        let pageIndexs = [1]
        let floor = Math.max(2, this.page.current - 2);
        let ceil = Math.min(this.page.max - 1, this.page.current + 2);
        for (let i = floor; i <= ceil; i++) {
            pageIndexs.push(i)
        }
        if (this.page.max > 1) {
            pageIndexs.push(this.page.max)
        }
        let uploader = this
        this.popupObj.footer.innerHTML = ''
        pageIndexs.forEach(pageIndex => {
            let pageBtn = document.createElement('button')
            pageBtn.setAttribute("type", "button")
            pageBtn.className = "swal2-styled"
            pageBtn.innerHTML = pageIndex
            if (pageIndex != uploader.page.current) {
                pageBtn.addEventListener('click', () => {
                    uploader.page.current = pageIndex
                    uploader.renderData()
                })
            } else {
                pageBtn.style.background = 'white'
            }
            uploader.popupObj.footer.appendChild(pageBtn)
        })
    }
    renderFilterInfo() {
        //this.btnUploadBatch
        //this.filter.songs
        let sizeTotal = 0
        let countCanUpload = 0
        this.filter.songIndexs.forEach(idx => {
            let song = this.songs[idx]
            if (!song.uploaded) {
                countCanUpload += 1
                sizeTotal += song.size
            }
        })
        this.btnUploadBatch.innerHTML = '全部上传'
        if (countCanUpload > 0) {
            this.btnUploadBatch.innerHTML += ` (${countCanUpload}首 ${fileSizeDesc(sizeTotal)})`
        }
    }
    uploadSong(songIndex) {
        let song = this.songs[songIndex]
        let uploader = this
        try {
            let songCheckData = [{
                md5: song.md5,
                songId: song.id,
                bitrate: song.bitrate,
                fileSize: song.size,
            }]
            weapiRequest("/api/cloud/upload/check/v2", {
                data: {
                    uploadType: 0,
                    songs: JSON.stringify(songCheckData),
                },
                onload: (res1) => {
                    if (res1.code != 200) {
                        console.error(song.name, '1.检查资源', res1)
                        uploader.onUploadFail(songIndex)
                        return
                    }
                    if (res1.data.length < 1) {
                        if (song.id > 0) {
                            //被**的歌曲要id设为0
                            uploader.songs[songIndex].id = 0
                            uploader.uploadSong(songIndex)
                        }
                        else {
                            console.error(song.name, '1.检查资源', res1)
                            uploader.onUploadFail(songIndex)
                        }
                        return
                    }

                    console.log(song.name, '1.检查资源', res1)
                    song.cloudId = res1.data[0].songId
                    showTips(`(2/6)${song.name} 检查资源`, 1)
                    if (res1.data[0].upload == 1) {
                        uploader.uploadSongWay1Part1(songIndex)
                    }
                    else {
                        uploader.uploadSongWay2Part1(songIndex)
                    }
                },
                onerror: function (res) {
                    console.error(song.name, '1.检查资源', res)
                    uploader.onUploadFail(songIndex)
                }
            })

        } catch (e) {
            console.error(e);
            uploader.onUploadFail(songIndex)
        }
    }
    uploadSongWay1Part1(songIndex) {
        let song = this.songs[songIndex]
        let uploader = this
        let importSongData = [{
            songId: song.cloudId,
            bitrate: song.bitrate,
            song: song.needMatch ? nameFileWithoutExt(song.name, song.artists, 'artist-title') : song.name,
            artist: song.artists,
            album: song.album,
            fileName: song.filename,
        }]
        //step2 导入歌曲
        try {
            weapiRequest("/api/cloud/user/song/import", {
                data: {
                    uploadType: 0,
                    songs: JSON.stringify(importSongData),
                },
                onload: (res) => {
                    if (res.code != 200 || res.data.successSongs.length < 1) {
                        console.error(song.name, '2.导入文件', res)
                        uploader.onUploadFail(songIndex)
                        return
                    }
                    console.log(song.name, '2.导入文件', res)
                    song.cloudSongId = res.data.successSongs[0].song.songId
                    uploader.uploadSongMatch(songIndex)
                },
                onerror: (responses2) => {
                    console.error(song.name, '2.导入歌曲', responses2)
                    uploader.onUploadFail(songIndex)
                }
            })
        }
        catch (e) {
            console.error(e);
            uploader.onUploadFail(songIndex)
        }
    }
    uploadSongWay2Part1(songIndex) {
        let song = this.songs[songIndex]
        let uploader = this
        try {
            weapiRequest("/api/nos/token/alloc", {
                data: {
                    filename: song.filename,
                    length: song.size,
                    ext: song.ext,
                    type: 'audio',
                    bucket: 'jd-musicrep-privatecloud-audio-public',
                    local: false,
                    nos_product: 3,
                    md5: song.md5
                },
                onload: (tokenRes) => {
                    song.token = tokenRes.result.token
                    song.objectKey = tokenRes.result.objectKey
                    song.resourceId = tokenRes.result.resourceId
                    song.expireTime = Date.now() + 60000
                    console.log(song.name, '2.2.开始上传', tokenRes)
                    uploader.uploadSongWay2Part2(songIndex)
                },
                onerror: (responses2) => {
                    console.error(song.name, '2.获取令牌', responses2)
                    uploader.onUploadFail(songIndex)
                }
            })
        }
        catch (e) {
            console.error(e);
            uploader.onUploadFail(songIndex)
        }
    }
    uploadSongWay2Part2(songIndex) {
        let song = this.songs[songIndex]
        let uploader = this
        weapiRequest("/api/upload/cloud/info/v2", {
            data: {
                md5: song.md5,
                songid: song.cloudId,
                filename: song.filename,
                song: song.name,
                album: song.album,
                artist: song.artists,
                bitrate: String(song.bitrate || 128),
                resourceId: song.resourceId,
            },
            onload: (res3) => {
                if (res3.code != 200) {
                    if (song.expireTime < Date.now() || (res3.msg && res3.msg.includes('rep create failed'))) {
                        console.error(song.name, '3.提交文件', res3)
                        uploader.onUploadFail(songIndex)
                    }
                    else {
                        console.log(song.name, '3.正在转码', res3)
                        sleep(1000).then(() => {
                            uploader.uploadSongWay2Part2(songIndex)
                        })
                    }
                    return
                }
                console.log(song.name, '3.提交文件', res3)
                //step4 发布
                weapiRequest("/api/cloud/pub/v2", {
                    data: {
                        songid: res3.songId,
                    },
                    onload: (res4) => {
                        if (res4.code != 200 && res4.code != 201) {
                            console.error(song.name, '4.发布资源', res4)
                            uploader.onUploadFail(songIndex)
                            return
                        }
                        console.log(song.name, '4.发布资源', res4)
                        song.cloudSongId = res4.privateCloud.songId
                        //step5 关联
                        uploader.uploadSongMatch(songIndex)
                    },
                    onerror: function (res) {
                        console.error(song.name, '4.发布资源', res)
                        uploader.onUploadFail(songIndex)
                    }
                })
            },
            onerror: function (res) {
                console.error(song.name, '3.提交文件', res)
                uploader.onUploadFail(songIndex)
            }
        });
    }
    uploadSongMatch(songIndex) {
        let song = this.songs[songIndex]
        let uploader = this
        if (song.cloudSongId != song.id && song.id > 0) {
            weapiRequest("/api/cloud/user/song/match", {
                data: {
                    songId: song.cloudSongId,
                    adjustSongId: song.id,
                },
                onload: (res5) => {
                    if (res5.code != 200) {
                        console.error(song.name, '5.匹配歌曲', res5)
                        uploader.onUploadFail(songIndex)
                        return
                    }
                    console.log(song.name, '5.匹配歌曲', res5)
                    console.log(song.name, '完成')
                    //完成
                    uploader.onUploadSucess(songIndex)
                },
                onerror: function (res) {
                    console.error(song.name, '5.匹配歌曲', res)
                    uploader.onUploadFail(songIndex)
                }
            })
        } else {
            console.log(song.name, '完成')
            //完成
            uploader.onUploadSucess(songIndex)
        }
    }
    onUploadFail(songIndex) {
        let song = this.songs[songIndex]
        showTips(`${song.name} - ${song.artists} - ${song.album} 上传失败`, 2)
        this.onUploadFinnsh(songIndex)
    }
    onUploadSucess(songIndex) {
        let song = this.songs[songIndex]
        showTips(`${song.name} - ${song.artists} - ${song.album} 上传成功`, 1)
        song.uploaded = true
        let btnUpload = song.tablerow.querySelector('button')
        btnUpload.innerHTML = '已上传'
        btnUpload.disabled = 'disabled'
        this.onUploadFinnsh(songIndex)
    }
    onUploadFinnsh(songIndex) {
        if (this.batchUpload.working) {
            let batchSongIdx = this.batchUpload.songIndexs.indexOf(songIndex)
            if (batchSongIdx + this.batchUpload.threadCount < this.batchUpload.songIndexs.length) {
                this.uploadSong(this.batchUpload.songIndexs[batchSongIdx + this.batchUpload.threadCount])
            } else {
                this.batchUpload.finnishThread += 1
                if (this.batchUpload.finnishThread == this.batchUpload.threadCount) {
                    this.batchUpload.working = false
                    this.renderFilterInfo()
                    showTips('上传完成', 1)
                }
            }
        } else {
            this.renderFilterInfo()
        }
    }
}