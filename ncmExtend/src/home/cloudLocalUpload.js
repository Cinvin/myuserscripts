import { createBigButton, showTips, showConfirmBox, sleep } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { fileSizeDesc } from '../utils/descHelper'
import { unsafeWindow } from '$'
import { uploadChunkSize } from '../utils/constant'

export const cloudLocalUpload = (uiArea) => {
    //本地上传
    let btnLocalUpload = createBigButton('云盘本地上传', uiArea, 2)
    btnLocalUpload.addEventListener('click', ShowLocalUploadPopUp)
    function ShowLocalUploadPopUp() {
        Swal.fire({
            title: '云盘本地上传',
            html: `<div id="my-file">
            <input id='song-file' type="file" accept="audio/*" multiple="multiple" class="swal2-file" placeholder="" style="display: flex;">
            </div>
            <div id="my-rd">
            <div class="swal2-radio"">
            <label><input type="radio" name="file-info" value="autofill" checked><span class="swal2-label">直接上传</span></label>
            <label><input type="radio" name="file-info" value="needInput" id="need-fill-info-radio"><span class="swal2-label">先填写文件的歌手、专辑信息</span></label>
            </div>
            </div>`,
            confirmButtonText: '上传',
            showCloseButton: true,
            preConfirm: (level) => {
                let files = document.getElementById('song-file').files
                if (files.length == 0) return Swal.showValidationMessage('请选择文件')
                return {
                    files: files,
                    needFillInfo: document.getElementById('need-fill-info-radio').checked,
                }
            },
        })
            .then(result => {
                if (result.isConfirmed) {
                    new LocalUpload().start(result.value)
                }
            })
    }
    class LocalUpload {
        start(config) {
            this.files = config.files
            this.needFillInfo = config.needFillInfo
            this.task = []
            this.currentIndex = 0
            this.failIndexs = []

            for (let i = 0; i < config.files.length; i++) {
                let file = config.files[i]
                let fileName = file.name
                let song = {
                    id: -2,
                    songFile: file,
                    fileFullName: fileName,
                    title: fileName.slice(0, fileName.lastIndexOf('.')),
                    artist: '未知',
                    album: '未知',
                    size: file.size,
                    ext: fileName.slice(fileName.lastIndexOf('.') + 1),
                    bitrate: 128
                }
                this.task.push(song)
            }
            showTips(`开始获取文件中的标签信息`, 1)
            this.readFileTags(0)
        }
        readFileTags(songIndex) {
            if (songIndex >= this.task.length) {
                if (this.needFillInfo) {
                    this.showFillSongInforBox()
                }
                else {
                    this.localUploadPart1(0)
                }
                return
            }
            let fileData = this.task[songIndex].songFile
            new jsmediatags.Reader(fileData)
                .read({
                    onSuccess: (res) => {
                        if (res.tags.title) this.task[songIndex].title = res.tags.title
                        if (res.tags.artist) this.task[songIndex].artist = res.tags.artist
                        if (res.tags.album) this.task[songIndex].album = res.tags.album
                        this.readFileTags(songIndex + 1)
                    },
                    onError: (error) => {
                        this.readFileTags(songIndex + 1)
                    }
                });
        }
        showFillSongInforBox() {
            Swal.fire({
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
width: 16%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 30%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 27%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 27%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>专辑</th></tr></thead><tbody></tbody></table>
`,
                confirmButtonText: '上传',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false,
                didOpen: () => {
                    let container = Swal.getHtmlContainer()
                    let tbody = container.querySelector('tbody')
                    for (let i = 0; i < this.task.length; i++) {
                        let tablerow = document.createElement('tr')
                        tablerow.innerHTML = `<td><button type="button" class="swal2-styled my-edit">编辑</button></td><td>${this.task[i].title}</td><td>${this.task[i].artist}</td><td>${this.task[i].album}</td>`
                        let btnEdit = tablerow.querySelector('.my-edit')
                        btnEdit.addEventListener('click', () => {
                            this.showEditInforBox(i)
                        })
                        tbody.appendChild(tablerow)
                    }
                },
            })
                .then(result => {
                    if (result.isConfirmed) {
                        this.localUploadPart1(0)
                    }
                })
        }
        showEditInforBox(songIndex) {
            Swal.fire({
                title: this.task[songIndex].fileFullName,
                html: `<div><label for="text-title">歌名</label><input class="swal2-input" id="text-title" type="text" value="${this.task[songIndex].title}"></div>
            <div><label for="text-artist">歌手</label><input class="swal2-input" id="text-artist" type="text"  value="${this.task[songIndex].artist}"></div>
            <div><label for="text-album">专辑</label><input class="swal2-input" id="text-album" type="text"  value="${this.task[songIndex].album}"></div>`,
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false,
                confirmButtonText: '确定',
                preConfirm: () => {
                    let songTitle = document.getElementById('text-title').value.trim()
                    if (songTitle.length == 0) return Swal.showValidationMessage('歌名不能为空')
                    return {
                        title: songTitle,
                        artist: document.getElementById('text-artist').value.trim(),
                        album: document.getElementById('text-album').value.trim(),
                    }
                },
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        this.task[songIndex].title = result.value.title
                        this.task[songIndex].artist = result.value.artist
                        this.task[songIndex].album = result.value.album
                        this.showFillSongInforBox()
                    }
                })
        }
        localUploadPart1(songindex) {
            let self = this
            let song = self.task[songindex]
            let reader = new FileReader()
            let chunkSize = 1024 * 1024
            let loaded = 0
            let md5sum = unsafeWindow.CryptoJS.algo.MD5.create()
            showTips(`(1/5)${song.title} 正在获取文件MD5值`, 1)
            reader.onload = function (e) {
                md5sum.update(unsafeWindow.CryptoJS.enc.Latin1.parse(reader.result));
                loaded += e.loaded;
                if (loaded < song.size) {
                    readBlob(loaded);
                } else {
                    showTips(`(1/5)${song.title} 已计算文件MD5值`, 1)
                    song.md5 = md5sum.finalize().toString()
                    try {
                        weapiRequest("/api/cloud/upload/check", {
                            data: {
                                songId: 0,
                                md5: song.md5,
                                length: song.size,
                                ext: song.ext,
                                version: 1,
                                bitrate: song.bitrate,
                            },
                            onload: (res1) => {
                                console.log(song.title, '1.检查资源', res1)
                                if (res1.code != 200) {
                                    console.error(song.title, '1.检查资源', res1)
                                    self.uploadFail()
                                    return
                                }
                                song.cloudId = res1.songId
                                song.needUpload = res1.needUpload
                                weapiRequest("/api/nos/token/alloc", {
                                    data: {
                                        filename: song.title,
                                        length: song.size,
                                        ext: song.ext,
                                        type: 'audio',
                                        bucket: 'jd-musicrep-privatecloud-audio-public',
                                        local: false,
                                        nos_product: 3,
                                        md5: song.md5
                                    },
                                    onload: (res2) => {
                                        if (res2.code != 200) {
                                            console.error(song.title, '2.获取令牌', res2)
                                            self.uploadFail()
                                            return
                                        }
                                        song.resourceId = res2.result.resourceId
                                        song.token = res2.result.token
                                        song.objectKey = res2.result.objectKey
                                        showTips(`(3/5)${song.title} 开始上传文件`, 1)
                                        console.log(song.title, '2.获取令牌', res2)
                                        if (res1.needUpload) {
                                            self.localUploadFile(songindex, 0)
                                        }
                                        else {
                                            song.expireTime = Date.now() + 60000
                                            self.localUploadPart2(songindex)
                                        }
                                    },
                                    onerror: (res) => {
                                        console.error(song.title, '2.获取令牌', res)
                                        self.uploadFail()
                                    }
                                });
                            },
                            onerror: (res) => {
                                console.error(song.title, '1.检查资源', res)
                                self.uploadFail()
                            }
                        })
                    }
                    catch (e) {
                        console.error(e);
                        self.uploadFail()
                    }
                }
            }
            readBlob(0);
            function readBlob(offset) {
                let blob = song.songFile.slice(offset, offset + chunkSize);
                reader.readAsBinaryString(blob);
            }
        }
        localUploadFile(songindex, offset, context = null) {
            let self = this
            let song = self.task[songindex]
            try {
                let complete = offset + uploadChunkSize > song.size
                let url = `http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${encodeURIComponent(song.objectKey)}?offset=${offset}&complete=${String(complete)}&version=1.0`
                if (context) url += `&context=${context}`
                GM_xmlhttpRequest({
                    method: "POST",
                    url: url,
                    headers: {
                        'x-nos-token': song.token,
                        'Content-MD5': song.md5,
                        'Content-Type': 'audio/mpeg',
                    },
                    data: song.songFile.slice(offset, offset + uploadChunkSize),
                    onload: (response3) => {
                        let res = JSON.parse(response3.response)
                        if (complete) {
                            console.log(song.title, '2.5.上传文件完成', res)
                            showTips(`(3.5/5)${song.title} 上传文件完成`, 1)
                            song.expireTime = Date.now() + 60000
                            self.localUploadPart2(songindex)
                        }
                        else {
                            showTips(`(3.4/5)${song.title} 正在上传${fileSizeDesc(res.offset)}/${fileSizeDesc(song.size)}`, 1)
                            self.localUploadFile(songindex, res.offset, res.context)
                        }
                    },
                    onerror: (response3) => {
                        console.error(song.title, '文件上传时失败', response3)
                        self.uploadFail()
                    },
                });
            }
            catch (e) {
                console.error(e);
                self.uploadFail()
            }
        }
        localUploadPart2(songindex) {
            let self = this
            let song = self.task[songindex]
            try {
                weapiRequest("/api/upload/cloud/info/v2", {
                    data: {
                        md5: song.md5,
                        songid: song.cloudId,
                        filename: song.fileFullName,
                        song: song.title,
                        album: song.album,
                        artist: song.artist,
                        bitrate: String(song.bitrate),
                        resourceId: song.resourceId,
                    },
                    onload: (res3) => {
                        if (res3.code != 200) {
                            if (song.expireTime < Date.now() || (res3.msg && res3.msg.includes('rep create failed'))) {
                                console.error(song.title, '3.提交文件', res3)
                                self.uploadFail()
                            }
                            else {
                                console.log(song.title, '3.正在转码', res3)
                                showTips(`(4/5)${song.title} 正在转码...`, 1)
                                sleep(1000).then(() => {
                                    self.localUploadPart2(songindex)
                                })
                            }
                            return
                        }

                        console.log(song.title, '3.提交文件', res3)
                        showTips(`(4/5)${song.title} 提交文件完成`, 1)
                        //step4 发布
                        weapiRequest("/api/cloud/pub/v2", {
                            data: {
                                songid: res3.songId,
                            },
                            onload: (res4) => {
                                if (res4.code != 200 && res4.code != 201) {
                                    console.error(song.title, '4.发布资源', res4)
                                    self.uploadFail()
                                    return
                                }
                                //完成
                                showTips(`(5/5)${song.title} 上传完成`, 1)
                                self.uploadSuccess()
                            },
                            onerror: (res) => {
                                console.error(song.title, '4.发布资源', res)
                                self.uploadFail()
                            }
                        })
                    },
                    onerror: (res) => {
                        console.error(song.title, '3.提交文件', res)
                        self.uploadFail()
                    }
                });
            }
            catch (e) {
                console.error(e);
                self.uploadFail()
            }
        }
        uploadFail() {
            this.failIndexs.push(this.currentIndex)
            showTips(`${this.task[this.currentIndex].title}上传失败`, 2)
            this.uploadNext()
        }
        uploadSuccess() {
            this.uploadNext()
        }
        uploadNext() {
            this.currentIndex += 1
            if (this.currentIndex >= this.task.length) {
                this.uploadFinnsh()
            }
            else {
                this.localUploadPart1(this.currentIndex)
            }
        }
        uploadFinnsh() {
            let msg = '上传完成'
            if (this.failIndexs.length > 0) {
                msg += ',以下文件上传失败：'
                msg += this.failIndexs.map(idx => this.task[idx].fileFullName).join()
            }
            showConfirmBox(msg)
        }
    }
}