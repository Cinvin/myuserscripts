//歌曲批量转存云盘 歌单页、专辑页
import { sleep } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { nameFileWithoutExt, levelDesc } from "../utils/descHelper"

import { albumDetailObj } from '../album/albumDetail'
import { playlistDetailObj } from '../playlist/playlistDetail'

const PlayAPIDataLimit = 1000
const CheckAPIDataLimit = 100
const importAPIDataLimit = 10
export class ncmDownUploadBatch {
    constructor(songs, config) {
        this.hasError = false
        this.songs = songs
        this.songIdIndexsMap = {}
        this.playerApiSongIds = []
        this.downloadApiSongIds = []
        for (let i = 0; i < songs.length; i++) {
            const songId = songs[i].id
            this.songIdIndexsMap[songId] = i
            if (songs[i].api.url === '/api/song/enhance/player/url/v1') {
                this.playerApiSongIds.push(songId)
            }
            else {
                this.downloadApiSongIds.push(songId)
            }
        }
        this.successSongsId = []
        this.skipSongs = []
        this.failSongs = []
        this.config = config
        this.log = ''
    };
    startUpload() {
        Swal.fire({
            input: "textarea",
            inputLabel: "批量转存云盘",
            confirmButtonText: '关闭',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: false,
            showConfirmButton: true,
            inputAttributes: {
                "readonly": true
            },
            footer: '浏览器F12控制台中可查看所有的接口返回内容，出错时可进行检查。',
            didOpen: () => {
                this.textarea = Swal.getInput()
                this.textarea.style = 'height: 300px;'
                this.comfirmBtn = Swal.getConfirmButton()
                this.comfirmBtn.style = 'display: none;'
                this.fetchFileDetail()
            },
        })
    }
    fetchFileDetail() {
        this.addLog(`将上传 ${this.songs.length} 首歌`)
        this.addLog('第一步：获取歌曲文件信息')
        if (this.playerApiSongIds.length > 0) {
            this.addLog('通过试听接口获取歌曲文件信息')
            this.fetchFileDetailByPlayerApi(0)
        }
        else {
            this.fetchFileDetailByDownloadApi()
        }

    }
    fetchFileDetailByPlayerApi(offset, retry = false) {
        if (offset >= this.playerApiSongIds.length) {
            this.addLog('通过试听接口获取歌曲文件信息完成')
            this.fetchFileDetailByDownloadApi()
            return
        }
        this.addLog(`正在获取第 ${offset + 1} 到 第 ${Math.min(offset + PlayAPIDataLimit, this.playerApiSongIds.length)} 首歌曲`)
        const ids = this.playerApiSongIds.slice(offset, offset + PlayAPIDataLimit)
        weapiRequest("/api/song/enhance/player/url/v1", {
            data: {
                ids: JSON.stringify(ids),
                level: this.config.level,
                encodeType: 'mp3'
            },
            onload: (content) => {
                if (content.code != 200) {
                    console.error('试听接口', content)
                    if (!retry) {
                        this.addLog('接口调用失败，1秒后重试')
                        sleep(1000).then(() => {
                            this.fetchFileDetailByPlayerApi(offset, retry = true)
                        })
                    }
                    else {
                        this.addLog('接口调用失败，将跳过出错歌曲')
                        this.hasError = true
                        sleep(1000).then(() => {
                            this.fetchFileDetailByPlayerApi(offset + PlayAPIDataLimit)
                        })
                    }
                    return
                }
                console.log('试听接口', content)
                content.data.forEach(songFileData => {
                    let songIndex = this.songIdIndexsMap[songFileData.id]
                    if (this.config.targetLevelOnly && this.config.level != songFileData.level) {
                        if (this.songs[songIndex].api.url === '/api/song/enhance/player/url/v1') {
                            this.skipSongs.push(this.songs[songIndex].title)
                        }
                    }
                    else {
                        this.songs[songIndex].fileFullName = nameFileWithoutExt(this.songs[songIndex].title, this.songs[songIndex].artist, this.config.out) + '.' + songFileData.type.toLowerCase()
                        this.songs[songIndex].md5 = songFileData.md5
                        this.songs[songIndex].size = songFileData.size
                        this.songs[songIndex].level = songFileData.level
                        this.songs[songIndex].ext = songFileData.type.toLowerCase()
                        this.songs[songIndex].bitrate = Math.floor(songFileData.br / 1000)
                    }
                });
                this.fetchFileDetailByPlayerApi(offset + PlayAPIDataLimit)
            },
            onerror: (content) => {
                console.error('试听接口', content)
                if (!retry) {
                    this.addLog('试听接口调用时报错，1秒后重试')
                    sleep(1000).then(() => {
                        this.fetchFileDetailByPlayerApi(offset, retry = true)
                    })
                }
                else {
                    this.addLog('试听接口调用时报错，将跳过出错歌曲')
                    this.hasError = true
                    sleep(1000).then(() => {
                        this.fetchFileDetailByPlayerApi(offset + PlayAPIDataLimit)
                    })
                }
            }
        })
    }
    fetchFileDetailByDownloadApi() {
        if (this.downloadApiSongIds.length > 0) {
            this.addLog('通过下载接口获取更好音质(非vip用户少数歌曲可获取到无损、HiRes音质)')
            this.fetchFileDetailByDownloadApiSub(0)
        }
        else {
            this.fetchCloudId()
        }
    }
    fetchFileDetailByDownloadApiSub(offset, retry = false) {
        if (offset >= this.downloadApiSongIds.length) {
            this.addLog('通过下载接口获取歌曲文件信息完成')
            this.fetchCloudId()
            return
        }
        let songId = this.downloadApiSongIds[offset]
        let songIndex = this.songIdIndexsMap[songId]
        weapiRequest('/api/song/enhance/download/url/v1', {
            data: this.songs[songIndex].api.data,
            onload: (content) => {
                if (content.code != 200) {
                    console.error('下载接口', content)
                    if (!retry) {
                        this.addLog('接口调用失败，1秒后重试')
                        sleep(1000).then(() => {
                            this.fetchFileDetailByDownloadApiSub(offset, retry = true)
                        })
                    }
                    else {
                        this.addLog(`歌曲 ${this.songs[songIndex].title} 下载接口调用失败，跳过`)
                        this.failSongs.push(this.songs[songIndex].title + '：通过下载接口获取文件信息失败')
                        this.hasError = true
                        sleep(1000).then(() => {
                            this.fetchFileDetailByDownloadApiSub(offset + 1)
                        })
                    }
                    return
                }
                console.log('下载接口', content)
                if (this.config.targetLevelOnly && this.config.level != content.data.level) {
                    this.skipSongs.push(this.songs[songIndex].title)
                }
                else if (content.data.url) {
                    this.songs[songIndex].fileFullName = nameFileWithoutExt(this.songs[songIndex].title, this.songs[songIndex].artist, this.config.out) + '.' + content.data.type.toLowerCase()
                    this.songs[songIndex].md5 = content.data.md5
                    this.songs[songIndex].size = content.data.size
                    this.songs[songIndex].level = content.data.level
                    this.songs[songIndex].ext = content.data.type.toLowerCase()
                    this.songs[songIndex].bitrate = Math.floor(content.data.br / 1000)
                    this.addLog(`${this.songs[songIndex].title} 通过下载接口获取到 ${levelDesc(content.data.level)} 音质文件信息`)
                }
                else {
                    this.failSongs.push(this.songs[songIndex].title + '：通过下载接口获取文件信息失败')
                }
                this.fetchFileDetailByDownloadApiSub(offset + 1)
            },
            onerror: (content) => {
                console.error('下载接口', content)
                if (!retry) {
                    this.addLog('下载接口调用时报错，1秒后重试')
                    sleep(1000).then(() => {
                        this.fetchFileDetailByDownloadApiSub(offset, retry = true)
                    })
                }
                else {
                    this.addLog(`歌曲 ${this.songs[songIndex].title} 下载接口调用失败，跳过`)
                    this.failSongs.push(this.songs[songIndex].title + '：通过下载接口获取文件信息失败')
                    this.hasError = true
                    sleep(1000).then(() => {
                        this.fetchFileDetailByDownloadApiSub(offset + 1)
                    })
                }
            }
        }
        )
    }
    fetchCloudId() {
        this.addLog('第二步：获取文件的云盘ID')
        this.fetchCloudIdSub(0)
    }
    fetchCloudIdSub(offset, retry = false) {
        if (offset >= this.songs.length) {
            this.addLog('获取文件的云盘ID完成')
            this.importSongs()
            return
        }
        let songMD5Map = {}
        let songCheckDatas = []
        let index = offset
        while (index < this.songs.length && songCheckDatas.length < CheckAPIDataLimit) {
            let song = this.songs[index]
            if (song.md5) {
                songCheckDatas.push({
                    md5: song.md5,
                    songId: song.id,
                    bitrate: song.bitrate,
                    fileSize: song.size,
                })
                songMD5Map[song.md5] = song.id
            }
            index += 1
        }
        this.addLog(`正在获取第 ${offset + 1} 到 第 ${index} 首歌曲`)
        if (songCheckDatas.length == 0) {
            this.fetchCloudIdSub(index)
            return
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
                        this.addLog('接口调用失败，1秒后重试')
                        sleep(1000).then(() => {
                            this.fetchCloudIdSub(offset, retry = true)
                        })
                    }
                    else {
                        this.addLog('接口调用失败，将跳过出错歌曲')
                        this.hasError = true
                        sleep(1000).then(() => {
                            this.fetchCloudIdSub(index)
                        })
                    }
                    return
                }
                console.log('获取文件云盘ID接口', content)
                let hasFail = false
                content.data.forEach(fileData => {
                    const songId = songMD5Map[fileData.md5]
                    const songIndex = this.songIdIndexsMap[songId]
                    if (fileData.upload == 1) {
                        this.songs[songIndex].cloudId = fileData.songId
                    }
                    else {
                        this.failSongs.push(this.songs[songIndex].title)
                        hasFail = true
                    }
                })
                if (hasFail) {
                    console.error('获取文件云盘ID api', content)
                }
                this.fetchCloudIdSub(index)
            },
            onerror: (content) => {
                console.error('获取文件云盘ID接口', content)
                if (!retry) {
                    this.addLog('调用接口时报错，1秒后重试')
                    sleep(1000).then(() => {
                        this.fetchCloudIdSub(offset, retry = true)
                    })
                }
                else {
                    this.addLog('调用接口时报错，将跳过出错歌曲')
                    this.hasError = true
                    sleep(1000).then(() => {
                        this.fetchCloudIdSub(index)
                    })
                }
            }
        })
    }

    importSongs() {
        this.addLog('第三步：文件导入云盘')
        this.importSongsSub(0)
    }
    importSongsSub(offset, retry = false) {
        if (offset >= this.songs.length) {
            this.final()
            return
        }
        let songCloudIdMap = {}
        let importSongDatas = []
        let index = offset
        while (index < this.songs.length && importSongDatas.length < importAPIDataLimit) {
            let song = this.songs[index]
            if (song.cloudId) {
                importSongDatas.push({
                    songId: song.cloudId,
                    bitrate: song.bitrate,
                    song: song.fileFullName,
                    artist: song.artist,
                    album: song.album,
                    fileName: song.fileFullName
                })
                songCloudIdMap[song.cloudId] = song.id
            }
            index += 1
        }
        if (importSongDatas.length == 0) {
            this.importSongsSub(index)
            return
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
                        this.addLog('接口调用失败，1秒后重试')
                        sleep(1000).then(() => {
                            this.importSongsSub(offset, retry = true)
                        })
                    }
                    else {
                        this.addLog('接口调用失败，将跳过出错歌曲')
                        this.hasError = true
                        sleep(1000).then(() => {
                            this.importSongsSub(index)
                        })
                    }
                }
                console.log('歌曲导入云盘接口', content)
                if (content.data.successSongs.length > 0) {
                    let successSongs = []
                    content.data.successSongs.forEach(successSong => {
                        let songId = songCloudIdMap[successSong.songId]
                        this.successSongsId.push(songId)
                        successSongs.push(this.songs[this.songIdIndexsMap[songId]].title)
                    })
                    this.addLog(`以下歌曲上传成功：${successSongs.join()}`)
                }
                if (content.data.failed.length > 0) {
                    console.error('导入歌曲接口，存在上传失败歌曲。', content.data.failed)
                    content.data.failed.forEach(failSong => {
                        let songId = songCloudIdMap[failSong.songId]
                        let songTItle = this.songs[this.songIdIndexsMap[songId]].title
                        if (failSong.msg) {
                            songTItle += '：' + failSong.msg
                        }
                        this.failSongs.push(songTItle)
                    })
                }
                this.importSongsSub(index)
            },
            onerror: (content) => {
                console.error('歌曲导入云盘', content)
                if (!retry) {
                    this.addLog('调用接口时报错，1秒后重试')
                    sleep(1000).then(() => {
                        this.importSongsSub(offset, retry = true)
                    })
                }
                else {
                    this.addLog('调用接口时报错，将跳过出错歌曲')
                    this.hasError = true
                    sleep(1000).then(() => {
                        this.importSongsSub(index)
                    })
                }
            }
        })
    }
    final() {
        this.addLog('上传结束')
        if (this.hasError) {
            this.addLog('调用接口时存在报错，跳过了部分歌曲。请尝试重新上传')
        }
        if (this.skipSongs.length > 0) {
            this.addLog(`有${this.skipSongs.length}首歌不是目标音质不进行上传`)
        }
        if (this.failSongs.length > 0) {
            this.addLog(`以下${this.failSongs.length}首歌上传失败：${this.failSongs.join()}`)
        }
        this.updateSongCloudStatus()
        this.comfirmBtn.style = 'display: inline-block;'
    }
    addLog(log) {
        this.log += log + '\n'
        this.textarea.value = this.log
        this.textarea.scrollTop = this.textarea.scrollHeight;
    }
    //更新缓存歌曲的云盘状态
    updateSongCloudStatus() {
        if (this.successSongsId.length > 0) {
            if (this.config.listType == 'playlist') {
                playlistDetailObj.updateSongsCloudStatus(this.successSongsId)
            }
            else if (this.config.listType == 'album') {
                albumDetailObj.updateSongsCloudStatus(this.successSongsId)
            }
        }
    }
}