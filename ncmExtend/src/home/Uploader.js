import { weapiRequest } from "../utils/request"
import { getArtistTextInSongDetail, getAlbumTextInSongDetail, duringTimeDesc, nameFileWithoutExt, fileSizeDesc } from "../utils/descHelper"
import { sleep, showTips } from "../utils/common"
import { CheckAPIDataLimit, importAPIDataLimit } from "../components/ncmDownUploadBatch"
import { liveRegex } from "../utils/constant";

export class Uploader {
    constructor(config, showAll = false) {
        this.songs = []
        this.config = config
        this.filter = {
            text: '',
            unmatch: true,
            noCopyright: true,
            free: true,
            vip: true,
            pay: true,
            instrumental:true,
            live:true,
            lossless: false,
            songIndexs: []
        }
        this.page = {
            current: 1,
            max: 1,
            limitCount: 50
        }
        this.batchUpload = {
            working: false,
            stopFlag: false,
            songIndexs: [],
            checkOffset: 0,
            importOffset: 0,
            matchOffset: 0,
        }
    };
    start() {
        this.showPopup()
    }

    showPopup() {
        Swal.fire({
            showCloseButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
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
width: 31%;
}
tr td:nth-child(2){
width: 6%;
}
tr td:nth-child(3){
width: 25%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 25%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 15%;
}
tr th:nth-child(6),tr td:nth-child(7){
width: 15%;
}
</style>
<input id="text-filter" class="swal2-input" placeholder="过滤：标题/歌手/专辑">
<div id="my-cbs">
<input class="form-check-input" type="checkbox" value="" id="cb-unmatch" checked><label class="form-check-label" for="cb-unmatch">未关联</label>
<input class="form-check-input" type="checkbox" value="" id="cb-copyright" checked><label class="form-check-label" for="cb-copyright">无版权</label>
<input class="form-check-input" type="checkbox" value="" id="cb-free" checked><label class="form-check-label" for="cb-free">免费</label>
<input class="form-check-input" type="checkbox" value="" id="cb-vip" checked><label class="form-check-label" for="cb-vip">VIP</label>
<input class="form-check-input" type="checkbox" value="" id="cb-pay" checked><label class="form-check-label" for="cb-pay">数字专辑</label>
<input class="form-check-input" type="checkbox" value="" id="cb-instrumental" checked><label class="form-check-label" for="cb-instrumental">纯音乐</label>
<input class="form-check-input" type="checkbox" value="" id="cb-live" checked><label class="form-check-label" for="cb-live">live版</label>
<input class="form-check-input" type="checkbox" value="" id="cb-lossless"><label class="form-check-label" for="cb-lossless">仅显示flac文件</label>
</div>
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upload-batch">全部上传</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>备注</th> </tr></thead><tbody></tbody></table>
`,
            footer: '<div></div>',
            didOpen: () => {
                const container = Swal.getHtmlContainer()
                const footer = Swal.getFooter()
                const tbody = container.querySelector('tbody')
                this.popupObj = {
                    container: container,
                    tbody: tbody,
                    footer: footer
                }

                //this.filter={text:'',noCopyright:true,vip:true,pay:true,lossless:false,songIds:[]}
                const filterInput = container.querySelector('#text-filter')
                filterInput.addEventListener('change', () => {
                    const filtertext = filterInput.value.trim()
                    if (this.filter.text != filtertext) {
                        this.filter.text = filtertext
                        this.applyFilter()
                    }
                })
                const unmatchInput = container.querySelector('#cb-unmatch')
                unmatchInput.addEventListener('change', () => {
                    this.filter.unmatch = unmatchInput.checked
                    this.applyFilter()
                })
                const copyrightInput = container.querySelector('#cb-copyright')
                copyrightInput.addEventListener('change', () => {
                    this.filter.noCopyright = copyrightInput.checked
                    this.applyFilter()
                })
                const freeInput = container.querySelector('#cb-free')
                freeInput.addEventListener('change', () => {
                    this.filter.free = freeInput.checked
                    this.applyFilter()
                })
                const vipInput = container.querySelector('#cb-vip')
                vipInput.addEventListener('change', () => {
                    this.filter.vip = vipInput.checked
                    this.applyFilter()
                })
                const payInput = container.querySelector('#cb-pay')
                payInput.addEventListener('change', () => {
                    this.filter.pay = payInput.checked
                    this.applyFilter()
                })
                const losslessInput = container.querySelector('#cb-lossless')
                losslessInput.addEventListener('change', () => {
                    this.filter.lossless = losslessInput.checked
                    this.applyFilter()
                })
                const instrumentalInput = container.querySelector('#cb-instrumental')
                instrumentalInput.addEventListener('change', () => {
                    this.filter.instrumental = instrumentalInput.checked
                    this.applyFilter()
                })
                const liveInput = container.querySelector('#cb-live')
                liveInput.addEventListener('change', () => {
                    this.filter.live = liveInput.checked
                    this.applyFilter()
                })
                let uploader = this
                this.btnUploadBatch = container.querySelector('#btn-upload-batch')
                this.btnUploadBatch.addEventListener('click', () => {
                    if (this.batchUpload.working) {
                        this.batchUpload.stopFlag = true
                        this.btnUploadBatch.innerHTML = "正在停止"
                        return
                    }
                    this.batchUpload.songIndexs = []
                    this.filter.songIndexs.forEach(idx => {
                        const song = uploader.songs[idx]
                        if (!song.uploaded && song.uploadType != 0) {
                            uploader.batchUpload.songIndexs.push(idx)
                        }
                    })
                    if (this.batchUpload.songIndexs.length == 0) {
                        showTips('没有需要上传的歌曲', 1)
                        return
                    }
                    this.batchUpload.working = true
                    this.batchUpload.stopFlag = false
                    this.batchUpload.checkOffset = 0
                    this.batchUpload.importOffset = 0
                    this.batchUpload.matchOffset = 0
                    this.btnUploadBatch.innerHTML = "停止"
                    this.uploadSongBatch()
                })
                this.fetchSongInfo()
            },
            willClose: () => {
                this.batchUpload.stopFlag = true
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
        this.popupObj.tbody.innerHTML = '<div>正在获取歌曲信息</div><div>并排除已上传的歌曲</div>'
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
        this.popupObj.tbody.innerHTML = `<div>正在获取第${startIndex + 1}到${Math.min(ids.length, startIndex + 1000)}首歌曲信息</div><div>并排除已上传的歌曲</div>`
        let uploader = this
        weapiRequest("/api/v3/song/detail", {
            data: {
                c: JSON.stringify(ids.slice(startIndex, startIndex + 1000))
            },
            onload: function (content) {
                //console.log(content)
                if (content.code != 200 || !content.songs) {
                    //重试
                    setTimeout(uploader.fetchSongInfoSub(ids, startIndex), 1000)
                    return
                }
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
                            isLive: config.name ? liveRegex.test(config.name.toLowerCase()) : false,
                            isInstrumental: false,
                            uploaded: false,
                            needMatch: config.name === undefined,
                        }
                        let foundFlag = false
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
                                item.isLive = liveRegex.test(item.name.toLowerCase())
                                item.isInstrumental = (content.songs[j].mark & 131072) === 131072 || item.name.includes('伴奏') || item.name.toLowerCase().includes('Instrumental')
                                foundFlag = true
                                break
                            }
                        }
                        if (!foundFlag) {
                            item.needMatch = false
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
            tablerow.innerHTML = `<td><button type="button" class="swal2-styled uploadbtn"><i class="fa-solid fa-cloud-arrow-up"></i></button><button type="button" class="swal2-styled reuploadbtn" style="display: none" title="重新上传并关联到此歌曲"><i class="fa-solid fa-repeat"></i></button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${song.dt}</td><td>${fileSizeDesc(song.size)} ${song.ext.toUpperCase()}</td><td class="song-remark"></td>`
            let songTitle = tablerow.querySelector('.song-remark')
            if (song.isNoCopyright) {
                songTitle.innerHTML = '无版权'
            } else if (song.isVIP) {
                songTitle.innerHTML = 'VIP'
            } else if (song.isPay) {
                songTitle.innerHTML = '数字专辑'
            }
            let uploadbtn = tablerow.querySelector('.uploadbtn')
            uploadbtn.addEventListener('click', () => {
                if (this.batchUpload.working) {
                    return
                }
                this.uploadSong(i)
            })
            let reuploadbtn = tablerow.querySelector('.reuploadbtn')
            reuploadbtn.addEventListener('click', () => {
                if (this.batchUpload.working) {
                    return
                }
                this.uploadSongWay2Part1(i)
            })
            song.tablerow = tablerow
        }
    }
    applyFilter() {
        this.filter.songIndexs = []
        const filterText = this.filter.text
        const isUnmatch = this.filter.unmatch
        const isNoCopyright = this.filter.noCopyright
        const isFree = this.filter.free
        const isVIP = this.filter.vip
        const isPay = this.filter.pay
        const isLossless = this.filter.lossless
        for (let i = 0; i < this.songs.length; i++) {
            let song = this.songs[i]
            if (filterText.length > 0 && !song.name.includes(filterText) && !song.album.includes(filterText) && !song.artists.includes(filterText) && !song.tns.includes(filterText)) {
                continue
            }
            if (isLossless && song.ext !== 'flac') {
                continue;
            }
            if (!this.filter.instrumental && song.isInstrumental) {
                continue;
            }
            if (!this.filter.live && song.isLive) {
                continue;
            }
            if (isUnmatch && !song.needMatch) {
                this.filter.songIndexs.push(i)
            } else if (isNoCopyright && song.isNoCopyright) {
                this.filter.songIndexs.push(i)
            } else if (isFree && !song.isVIP && !song.isPay) {
                this.filter.songIndexs.push(i)
            } else if (isVIP && song.isVIP) {
                this.filter.songIndexs.push(i)
            } else if (isPay && song.isPay) {
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
            if (!song.uploaded && song.uploadType != 0) {
                countCanUpload += 1
                sizeTotal += song.size
            }
        })
        this.btnUploadBatch.innerHTML = '全部上传'
        if (countCanUpload > 0) {
            this.btnUploadBatch.innerHTML += ` (${countCanUpload}首 ${fileSizeDesc(sizeTotal)})`
        }
    }
    setReUploadButtonViewable(songIndex) {
        let uploadbtn = this.songs[songIndex].tablerow.querySelector('.uploadbtn')
        uploadbtn.style.display = 'none'
        let reuploadbtn = this.songs[songIndex].tablerow.querySelector('.reuploadbtn')
        reuploadbtn.style.display = ''
        this.setSongRemark(this.songs[songIndex], '文件已在云盘但没有关联到目标歌曲，点击按钮重新上传并关联。')
    }
    uploadSong(songIndex) {
        let song = this.songs[songIndex]
        if (song.cloudId) {
            if (song.uploadType == 1) {
                this.uploadSongImport(songIndex)
            }
            else if (song.uploadType == 0) {
                this.uploadSongWay2Part1(songIndex)
            }
            return
        }
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
                    song.uploadType = res1.data[0].upload
                    if (song.uploadType == 1) {
                        console.log(song.name, '1.检查资源', res1)
                        showTips(`(1/3)${song.name} 检查资源`, 1)
                        song.cloudId = res1.data[0].songId
                        uploader.uploadSongImport(songIndex)
                    }
                    else if (song.uploadType == 0) {
                        uploader.setReUploadButtonViewable(songIndex)
                        song.cloudId = res1.data[0].songId
                        uploader.onUploadFinnsh()
                    }
                    else {
                        console.error(song.name, '1.检查资源', res1)
                        showTips(`(1/3)${song.name} 文件无法上传`, 2)
                        song.uploaded = true
                        let btnUpload = song.tablerow.querySelector('.uploadbtn')
                        btnUpload.innerHTML = '<i class="fa-solid fa-xmark"></i>'
                        btnUpload.disabled = 'disabled'
                        uploader.setSongRemark(song, '文件无法上传')
                        uploader.onUploadFinnsh()
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
    uploadSongImport(songIndex) {
        let song = this.songs[songIndex]
        if (song.cloudSongId) {
            this.uploadSongMatch(songIndex)
            return
        }
        let uploader = this
        let importSongData = [{
            songId: song.cloudId,
            bitrate: song.bitrate,
            song: song.name,
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
                        showTips(`${song.name}上传成功，但是关联失败`, 2)
                        this.setSongUploaded(song)
                        this.setSongRemark(song, '文件关联失败')
                        this.onUploadFinish()
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
    onUploadFail(songIndex) {
        let song = this.songs[songIndex]
        showTips(`${song.name} - ${song.artists} - ${song.album} 上传失败`, 2)
        this.onUploadFinnsh()
    }
    onUploadSucess(songIndex) {
        let song = this.songs[songIndex]
        showTips(`${song.name} - ${song.artists} - ${song.album} 上传成功`, 1)
        this.setSongUploaded(song)
        this.onUploadFinnsh()
    }
    onUploadFinnsh() {
        this.renderFilterInfo()
    }

    setSongUploaded(song) {
        song.uploaded = true
        let btnSelect = '.uploadbtn'
        if (song.uploadType == 0) {
            btnSelect = '.reuploadbtn'
        }
        let btnUpload = song.tablerow.querySelector(btnSelect)
        btnUpload.innerHTML = '<i class="fa-solid fa-check"></i>'
        btnUpload.disabled = 'disabled'
    }

    setSongRemark(song, remark) {
        let markElement = song.tablerow.querySelector('.song-remark')
        if (markElement) {
            markElement.innerHTML = remark
        }
    }

    uploadSongBatch(retry = false) {
        if (this.batchUpload.checkOffset >= this.batchUpload.songIndexs.length) {
            this.onBatchUploadFinnsh()
            showTips('批量上传完成', 1)
            return
        }
        if (this.batchUpload.stopFlag) {
            this.onBatchUploadFinnsh()
            return
        }
        let songMD5IndexMap = {}
        let songCheckDatas = []
        let indexOfSongIndexs = this.batchUpload.checkOffset
        let endIndex = Math.min(this.batchUpload.songIndexs.length, this.batchUpload.checkOffset + CheckAPIDataLimit)
        while (indexOfSongIndexs < endIndex) {
            let songIndex = this.batchUpload.songIndexs[indexOfSongIndexs]
            let song = this.songs[songIndex]
            songCheckDatas.push({
                md5: song.md5,
                songId: song.id,
                bitrate: song.bitrate,
                fileSize: song.size,
            })
            songMD5IndexMap[song.md5] = songIndex

            indexOfSongIndexs += 1
        }

        weapiRequest("/api/cloud/upload/check/v2", {
            data: {
                uploadType: 0,
                songs: JSON.stringify(songCheckDatas),
            },
            onload: (content) => {
                if (content.code != 200 || content.data.length == 0) {
                    console.error('获取文件云盘ID接口', content)
                    if (!retry) {
                        showTips('接口调用失败，1秒后重试', 2)
                        this.addLog('接口调用失败，1秒后重试')
                        sleep(1000).then(() => {
                            this.uploadSongBatch(retry = true)
                        })
                    }
                    else {
                        //跳过
                        this.batchUpload.checkOffset = endIndex
                        this.uploadSongBatch()
                    }
                    return
                }
                showTips(`获取第 ${this.batchUpload.checkOffset + 1} 到 第 ${indexOfSongIndexs} 首歌曲云盘ID`, 1)
                console.log('获取文件云盘ID接口', content)
                content.data.forEach(fileData => {
                    const songIndex = songMD5IndexMap[fileData.md5]
                    this.songs[songIndex].uploadType = fileData.upload
                    this.songs[songIndex].cloudId = fileData.songId
                    if (fileData.upload == 0) {
                        this.setReUploadButtonViewable(songIndex)
                    }
                    else if (fileData.upload > 1) {
                        this.songs[songIndex].uploaded = true
                        let btnUpload = this.songs[songIndex].tablerow.querySelector('.uploadbtn')
                        btnUpload.innerHTML = '<i class="fa-solid fa-xmark"></i>'
                        this.setSongRemark(this.songs[songIndex], '文件无法上传')
                        btnUpload.disabled = 'disabled'
                    }
                })
                this.batchUpload.checkOffset = endIndex
                this.uploadSongImportBatch()
            },
            onerror: (content) => {
                console.error('获取文件云盘ID接口', content)
                if (!retry) {
                    showTips('接口调用失败，1秒后重试', 2)
                    sleep(1000).then(() => {
                        this.uploadSongBatch(retry = true)
                    })
                }
                else {
                    //跳过
                    this.batchUpload.checkOffset = endIndex
                    this.uploadSongBatch()
                }
            }
        })
    }
    uploadSongImportBatch(retry = false) {
        if (this.batchUpload.importOffset >= this.batchUpload.checkOffset) {
            this.uploadSongBatch()
            return
        }
        if (this.batchUpload.stopFlag) {
            this.onBatchUploadFinnsh()
            return
        }
        let songCloudIdIndexMap = {}
        let importSongDatas = []
        let indexOfSongIndexs = this.batchUpload.importOffset
        let maxIndex = Math.min(this.batchUpload.checkOffset, this.batchUpload.importOffset + importAPIDataLimit)
        while (indexOfSongIndexs < maxIndex) {
            let songIndex = this.batchUpload.songIndexs[indexOfSongIndexs]
            let song = this.songs[songIndex]
            if ('cloudId' in song) {
                importSongDatas.push({
                    songId: song.cloudId,
                    bitrate: song.bitrate,
                    song: song.name,
                    artist: song.artists,
                    album: song.album,
                    fileName: song.filename
                })
                songCloudIdIndexMap[song.cloudId] = songIndex
            }
            indexOfSongIndexs += 1
        }
        weapiRequest("/api/cloud/user/song/import", {
            data: {
                uploadType: 0,
                songs: JSON.stringify(importSongDatas),
            },
            onload: (content) => {
                if (content.code != 200) {
                    console.error('歌曲导入云盘接口', content)
                    if (!retry) {
                        showTips('接口调用失败，1秒后重试', 1)
                        sleep(1000).then(() => {
                            this.uploadSongImportBatch(retry = true)
                        })
                    }
                    else {
                        //跳过
                        this.batchUpload.importOffset = indexOfSongIndexs
                        this.uploadSongImportBatch()
                    }
                }
                console.log('歌曲导入云盘接口', content)
                if (content.data.successSongs.length > 0) {
                    let successSongNames = []
                    content.data.successSongs.forEach(successSong => {
                        let song = this.songs[songCloudIdIndexMap[successSong.songId]]
                        song.cloudSongId = successSong.song.songId
                        if (song.cloudSongId == song.id) {
                            this.setSongUploaded(song)
                            successSongNames.push(song.name)
                        }
                    })
                    showTips(`成功上传${successSongNames.length}首:${successSongNames.join('、')}`, 1)
                }
                this.batchUpload.importOffset = indexOfSongIndexs
                this.uploadSongMatchBatch()
            },
            onerror: (content) => {
                console.error('歌曲导入云盘', content)
                if (!retry) {
                    showTips('接口调用失败，1秒后重试', 1)
                    sleep(1000).then(() => {
                        this.uploadSongImportBatch(retry = true)
                    })
                }
                else {
                    //跳过
                    this.batchUpload.importOffset = indexOfSongIndexs
                    this.uploadSongImportBatch()
                }
            }
        })
    }
    uploadSongMatchBatch(retry = false) {
        if (this.batchUpload.matchOffset >= this.batchUpload.importOffset) {
            this.uploadSongImportBatch()
            return
        }
        let songIndex = this.batchUpload.songIndexs[this.batchUpload.matchOffset]
        let song = this.songs[songIndex]

        if (!('cloudSongId' in song) || song.cloudSongId == song.id || song.id <= 0) {
            this.batchUpload.matchOffset += 1
            this.uploadSongMatchBatch()
            return
        }
        weapiRequest("/api/cloud/user/song/match", {
            data: {
                songId: song.cloudSongId,
                adjustSongId: song.id,
            },
            onload: (res5) => {
                if (res5.code != 200) {
                    console.error(song.name, '匹配歌曲', res5)
                    if (res5.code == 400) {
                        showTips(`${song.name}上传成功，但是关联失败`, 2)
                        this.setSongUploaded(song)
                        this.setSongRemark(song, '文件关联失败')
                        this.batchUpload.matchOffset += 1
                        this.uploadSongMatchBatch()
                    }
                    else if (!retry) {
                        sleep(1000).then(() => {
                            this.uploadSongMatchBatch(retry = true)
                        })
                    }
                    else {
                        showTips(`${song.name}上传成功，但是关联失败`, 2)
                        this.setSongUploaded(song)
                        this.setSongRemark(song, '文件关联失败')
                        this.batchUpload.matchOffset += 1
                        this.uploadSongMatchBatch()
                    }
                    return
                }
                console.log(song.name, '匹配歌曲', res5)
                this.setSongUploaded(song)
                showTips(`成功上传1首歌曲`, 1)
                this.batchUpload.matchOffset += 1
                this.uploadSongMatchBatch()
            },
            onerror: function (res) {
                console.error(song.name, '匹配歌曲', res)
                if (!retry) {
                    showTips('接口调用失败，1秒后重试', 1)
                    sleep(1000).then(() => {
                        this.uploadSongMatchBatch(retry = true)
                    })
                }
                else {
                    //跳过
                    this.batchUpload.matchOffset += 1
                    this.uploadSongMatchBatch()
                }
            }
        })
    }
    onBatchUploadFinnsh() {
        this.batchUpload.working = false
        this.renderFilterInfo()
    }
}