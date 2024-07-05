import { showTips, showConfirmBox,sleep } from "./utils/common"
import { weapiRequest } from "./utils/request"
import { uploadChunkSize } from "./utils/constant"
import { nameFileWithoutExt, fileSizeDesc } from "./utils/descHelper"
export class ncmDownUpload {
    constructor(songs, showfinishBox = true, onSongDUSuccess = null, onSongDUFail = null, out = 'artist-title') {
        this.songs = songs
        this.currentIndex = 0
        this.failSongs = []
        this.out = out
        this.showfinishBox = showfinishBox
        this.onSongDUSuccess = onSongDUSuccess
        this.onSongDUFail = onSongDUFail
    };
    startUpload() {
        this.currentIndex = 0
        this.failSongs = []
        if (this.songs.length > 0) {
            this.uploadSong(this.songs[0])
        }
    }
    uploadSong(song) {
        try {
            weapiRequest(song.api.url, {
                data: song.api.data,
                onload: (content) => {
                    showTips(`(1/6)${song.title} 获取文件信息完成`, 1)
                    //console.log(content)
                    let resData = content.data[0] || content.data
                    if (resData.url != null) {
                        song.fileFullName = nameFileWithoutExt(song.title, song.artist, this.out) + '.' + resData.type.toLowerCase()
                        song.dlUrl = resData.url
                        song.md5 = resData.md5
                        song.size = resData.size
                        song.ext = resData.type.toLowerCase()
                        song.bitrate = Math.floor(resData.br / 1000)
                        //是否直接import
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
                                console.log(song.title, '1.检查资源', res1)
                                if (res1.code != 200 || res1.data.length < 1) {
                                    this.uploadSongFail(song)
                                    return
                                }
                                showTips(`(2/6)${song.title} 检查资源`, 1)
                                song.cloudId = res1.data[0].songId
                                if (res1.data[0].upload == 1) {
                                    this.uploadSongWay1Part1(song)
                                }
                                else if (res1.data[0].upload == 2) {
                                    this.uploadSongWay2Part1(song)
                                }
                                else {
                                    this.uploadSongWay3Part1(song)
                                }
                            },
                            onerror: (res) => {
                                console.error(song.title, '1.检查资源', res)
                                this.uploadSongFail(song)
                            }
                        })
                    }
                    else {
                        this.uploadSongFail(song)
                    }
                },
                onerror: (res) => {
                    console.error(song.title, '0.获取URL', res)
                    this.uploadSongFail(song)
                }
            })
        }
        catch (e) {
            console.error(e);
            this.uploadSongFail(song)
        }
    }
    uploadSongWay1Part1(song) {
        let importSongData = [{
            songId: song.cloudId,
            bitrate: song.bitrate,
            song: nameFileWithoutExt(song.title, song.artist, this.out),
            artist: song.artist,
            album: song.album,
            fileName: song.fileFullName
        }]
        //step2 导入歌曲
        try {
            weapiRequest("/api/cloud/user/song/import", {
                data: {
                    uploadType: 0,
                    songs: JSON.stringify(importSongData),
                },
                onload: (res) => {
                    console.log(song.title, '2.导入文件', res)
                    if (res.code != 200 || res.data.successSongs.length < 1) {
                        console.error(song.title, '2.导入文件', res)
                        this.uploadSongFail(song)
                        return
                    }
                    showTips(`(2/6)${song.title} 2.导入文件完成`, 1)
                    song.cloudSongId = res.data.successSongs[0].song.songId
                    this.uploadSongMatch(song)
                },
                onerror: (responses2) => {
                    console.error(song.title, '2.导入歌曲', responses2)
                    this.uploadSongFail(song)
                }
            })
        }
        catch (e) {
            console.error(e);
            this.uploadSongFail(song)
        }
    }
    uploadSongWay2Part1(song) {
        try {
            weapiRequest("/api/nos/token/alloc", {
                data: {
                    filename: song.fileFullName,
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
                        this.uploadSongFail(song)
                        return
                    }
                    song.resourceId = res2.result.resourceId
                    showTips(`(3/6)${song.title} 获取令牌完成`, 1)
                    console.log(song.title, '2.获取令牌', res2)
                    showTips(`(3/6)${song.title} 开始上传文件`, 1)
                    this.uploadSongPart2(song)
                },
                onerror: (res) => {
                    console.error(song.title, '2.获取令牌', res)
                    this.uploadSongFail(song)
                }
            })
        }
        catch (e) {
            console.error(e);
            this.uploadSongFail(song)
        }
    }
    uploadSongPart2(song) {
        //上传文件
        showTips(`(3.1/6)${song.title} 开始下载文件`, 1)
        try {
            GM_xmlhttpRequest({
                method: "GET",
                url: song.dlUrl,
                headers: {
                    "Content-Type": "audio/mpeg"
                },
                responseType: "blob",
                onload: (response) => {
                    showTips(`(3.2/6)${song.title} 文件下载完成`, 1)
                    let buffer = response.response
                    //step2 上传令牌
                    weapiRequest("/api/nos/token/alloc", {
                        data: {
                            filename: song.fileFullName,
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
                            console.log(song.title, '2.2.开始上传', tokenRes)
                            showTips(`(3.3/6)${song.title} 开始上传文件`, 1)
                            this.uploadFile(buffer, song, 0)
                        },
                        onerror: (responses2) => {
                            console.error(song.title, '2.1.获取令牌', responses2)
                            this.uploadSongFail(song)
                        }
                    })
                }
            })
        }
        catch (e) {
            console.error(e);
            this.uploadSongFail(song)
        }
    }
    uploadFile(data, song, offset, context = null) {
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
            data: data.slice(offset, offset + uploadChunkSize),
            onload: (response3) => {
                let res = JSON.parse(response3.response)
                if (complete) {
                    console.log(song.title, '2.5.上传文件完成', res)
                    showTips(`(4/6)${song.title} 上传文件完成`, 1)
                    this.uploadSongPart3(song)
                }
                else {
                    showTips(`(4/6)${song.title} 正在上传${fileSizeDesc(res.offset)}/${fileSizeDesc(song.size)}`, 1)
                    this.uploadFile(data, song, res.offset, res.context)
                }
            },
            onerror: (response3) => {
                console.error(song.title, '文件上传时失败', response3)
                this.uploadSongFail(song)
            },
        });
    }
    uploadSongWay3Part1(song) {
        try {
            weapiRequest("/api/nos/token/alloc", {
                data: {
                    filename: song.fileFullName,
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
                        this.uploadSongFail(song)
                        return
                    }
                    song.resourceId = res2.result.resourceId
                    showTips(`(3/6)${song.title} 获取令牌完成`, 1)
                    console.log(song.title, '2.获取令牌', res2)
                    this.uploadSongPart3(song)
                },
                onerror: (res) => {
                    console.error(song.title, '2.获取令牌', res)
                    this.uploadSongFail(song)
                }
            })
        }
        catch (e) {
            console.error(e);
            this.uploadSongFail(song)
        }
    }
    uploadSongPart3(song) {
        //step3 提交
        try {
            console.log(song)
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
                            this.uploadSongFail(song)
                        }
                        else {
                            console.log(song.title, '3.正在转码', res3)
                            showTips(`(5/6)${song.title} 正在转码...`, 1)
                            sleep(1000).then(() => {
                                this.uploadSongPart3(song)
                            })
                        }
                        return
                    }
                    console.log(song.title, '3.提交文件', res3)
                    showTips(`(5/6)${song.title} 提交文件完成`, 1)
                    //step4 发布
                    weapiRequest("/api/cloud/pub/v2", {
                        data: {
                            songid: res3.songId,
                        },
                        onload: (res4) => {
                            if (res4.code != 200 && res4.code != 201) {
                                console.error(song.title, '4.发布资源', res4)
                                this.uploadSongFail(song)
                                return
                            }
                            console.log(song.title, '4.发布资源', res4)
                            showTips(`(5/6)${song.title} 提交文件完成`, 1)
                            song.cloudSongId = res4.privateCloud.songId
                            this.uploadSongMatch(song)
                        },
                        onerror: (res) => {
                            console.error(song.title, '4.发布资源', res)
                            this.uploadSongFail(song)
                        }
                    })
                },
                onerror: (res) => {
                    console.error(song.title, '3.提交文件', res)
                    this.uploadSongFail(song)
                }
            });
        }
        catch (e) {
            console.error(e);
            this.uploadSongFail(song)
        }
    }
    uploadSongMatch(song) {
        //step5 关联
        if (song.cloudSongId != song.id) {
            weapiRequest("/api/cloud/user/song/match", {
                data: {
                    songId: song.cloudSongId,
                    adjustSongId: song.id,
                },
                onload: (res5) => {
                    if (res5.code != 200) {
                        console.error(song.title, '5.匹配歌曲', res5)
                        this.uploadSongFail(song)
                        return
                    }
                    console.log(song.title, '5.匹配歌曲', res5)
                    console.log(song.title, '完成')
                    //完成
                    showTips(`(6/6)${song.title} 上传完成`, 1)
                    this.uploadSongSuccess(song)
                },
                onerror: (res) => {
                    console.error(song.title, '5.匹配歌曲', res)
                    this.uploadSongFail(song)
                }
            })
        } else {
            console.log(song.title, '完成')
            //完成
            showTips(`(6/6)${song.title} 上传完成`, 1)
            this.uploadSongSuccess(song)
        }
    }
    uploadSongFail(song) {
        showTips(`${song.title} 上传失败`, 2)
        this.failSongs.push(song)
        if (this.onSongDUFail) this.onSongDUFail(song)
        this.uploadNextSong()
    }
    uploadSongSuccess(song) {
        if (this.onSongDUSuccess) this.onSongDUSuccess(song)
        this.uploadNextSong()
    }
    uploadNextSong() {
        this.currentIndex += 1;
        if (this.currentIndex < this.songs.length) {
            this.uploadSong(this.songs[this.currentIndex])
        }
        else {
            let msg = this.failSongs == 0 ? `${this.songs[0].title}上传完成` : `${this.songs[0].title}上传失败`
            if (this.songs.length > 1) msg = this.failSongs == 0 ? '全部上传完成' : `上传完毕,存在${this.failSongs.length}首上传失败的歌曲.它们为:${this.failSongs.map(song => song.title).join()}`
            if (this.showfinishBox) {
                showConfirmBox(msg)
            }
        }
    }
}