import { createBigButton, showTips } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { getAlbumTextInSongDetail } from "../utils/descHelper"

export const cloudExport = (uiArea) => {
    //云盘导出
    let btnExport = createBigButton('云盘导出', uiArea, 2)
    btnExport.addEventListener('click', openExportPopup)
    function openExportPopup() {
        Swal.fire({
            title: '云盘导出',
            showCloseButton: true,
            html: `<div><label>歌手<input class="swal2-input" id="text-artist" placeholder="选填"></label></div>
            <div><label>专辑<input class="swal2-input" id="text-album" placeholder="选填"></label></div>
            <div><label>歌名<input class="swal2-input" id="text-song" placeholder="选填"></label></div>
            <div><label>歌单ID<input class="swal2-input" id="text-playlistid" placeholder="选填" type="number"></label></div>`,
            footer: '过滤条件取交集',
            confirmButtonText: '导出',
            preConfirm: () => {
                const container = Swal.getHtmlContainer()
                return [
                    container.querySelector('#text-artist')
                        .value.trim(),
                    container.querySelector('#text-album')
                        .value.trim(),
                    container.querySelector('#text-song')
                        .value.trim(),
                    container.querySelector('#text-playlistid')
                        .value
                ]
            },
        })
            .then((result) => {
                if (result.isConfirmed) {
                    exportCloud(result.value)
                }
            })
    }
    function exportCloud(filter) {
        showTips('开始导出', 1)
        if (filter[3]) {
            exportCloudByPlaylist(filter)
        }
        else {
            exportCloudSub(filter, {
                data: []
            }, 0)
        }
    }
    function exportCloudSub(filter, config, offset) {
        showTips(`正在获取第${offset + 1}到${offset + 1000}首云盘歌曲信息`, 1)
        weapiRequest('/api/v1/cloud/get', {
            data: {
                limit: 1000,
                offset: offset,
            },
            onload: (res) => {
                if (res.code !== 200 || !res.data) {
                    //重试
                    setTimeout(exportCloudSub(filter, config, offset), 1000)
                    return
                }
                let matchSongs = []
                res.data.forEach(song => {
                    if (song.simpleSong.al && song.simpleSong.al.id > 0) {
                        //已关联歌曲
                        if (filter[0].length > 0) {
                            let flag = false
                                for (let i = 0; i < song.simpleSong.ar.length; i++) {
                                if (song.simpleSong.ar[i].name === filter[0]) {
                                    flag = true
                                    break
                                }
                            }
                            if (!flag) {
                                return
                            }
                        }
                        if (filter[1].length > 0 && filter[1] !== getAlbumTextInSongDetail(song.simpleSong)) {
                            return
                        }
                        if (filter[2].length > 0 && filter[2] !== song.simpleSong.name) {
                            return
                        }
                        let songItem = {
                            'id': song.songId,
                            'size': song.fileSize,
                            'ext': song.fileName.split('.')
                                .pop()
                                .toLowerCase(),
                            'bitrate': song.bitrate,
                            'md5': null,
                        }
                        matchSongs.push(songItem)
                    } else {
                        //未关联歌曲
                        if (filter[0].length > 0 && song.artist !== filter[0]) {
                            return
                        }
                        if (filter[1].length > 0 && song.album !== filter[1]) {
                            return
                        }
                        if (filter[2].length > 0 && song.songName !== filter[2]) {
                            return
                        }
                        let songItem = {
                            'id': song.songId,
                            'size': song.fileSize,
                            'ext': song.fileName.split('.')
                                .pop()
                                .toLowerCase(),
                            'bitrate': song.bitrate,
                            'md5': null,
                            'name': song.songName,
                            'al': song.album,
                            'ar': song.artist,
                        }
                        matchSongs.push(songItem)
                    }
                })

                let ids = matchSongs.map(song => song.id)
                if (ids.length > 0) {
                    weapiRequest("/api/song/enhance/player/url/v1", {
                        data: {
                            ids: JSON.stringify(ids),
                            level: 'hires',
                            encodeType: 'mp3',
                        },
                        onload: (res2) => {
                            //console.log(res2)
                            if (res2.code !== 200 || !res2.data) {
                                //重试
                                setTimeout(exportCloudSub(filter, config, offset), 1000)
                                return
                            }
                            matchSongs.forEach(song => {
                                let songId = song.id
                                for (let i = 0; i < res2.data.length; i++) {
                                    if (res2.data[i].id === songId) {
                                        song.md5 = res2.data[i].md5
                                        config.data.push(song)
                                        break
                                    }
                                }
                            })

                            if (res.hasMore) {
                                exportCloudSub(filter, config, offset + 1000)
                            } else {
                                configToFile(config)
                            }
                        }
                    })
                } else {
                    if (res.hasMore) {
                        exportCloudSub(filter, config, offset + 1000)
                    } else {
                        configToFile(config)
                    }
                }
            }
        })
    }
    function exportCloudByPlaylist(filter) {
        weapiRequest('/api/v6/playlist/detail', {
            data: {
                id: filter[3],
                n: 100000,
                s: 8,
            },
            onload: (res) => {
                //console.log(res)
                let trackIds = res.playlist.trackIds.map(item => {
                    return item.id
                })
                exportCloudByPlaylistSub(filter, trackIds, {
                    data: []
                }, 0)
            }
        })
    }
    function exportCloudByPlaylistSub(filter, trackIds, config, offset) {
        let limit = 100
        if (trackIds.length <= offset) {
            configToFile(config)
            return
        }
        showTips(`正在获取第${offset + 1}到${Math.min(offset + limit, trackIds.length)}首云盘歌曲信息`, 1)
        weapiRequest("/api/v1/cloud/get/byids", {
            data: {
                songIds: JSON.stringify(trackIds.slice(offset, offset + limit))
            },

            onload: function (res) {
                //console.log(res)
                let matchSongs = []
                res.data.forEach(song => {
                    if (song.simpleSong.al && song.simpleSong.al.id > 0) {
                        //已关联歌曲
                            if (filter[0].length > 0) {
                            let flag = false
                            for (let i = 0; i < song.simpleSong.ar.length; i++) {
                                if (song.simpleSong.ar[i].name === filter[0]) {
                                    flag = true
                                    break
                                }
                            }
                            if (!flag) {
                                return
                            }
                        }
                        if (filter[1].length > 0 && filter[1] !== getAlbumTextInSongDetail(song.simpleSong)) {
                            return
                        }
                        if (filter[2].length > 0 && filter[2] !== song.simpleSong.name) {
                            return
                        }
                        let songItem = {
                            'id': song.songId,
                            'size': song.fileSize,
                            'ext': song.fileName.split('.')
                                .pop()
                                .toLowerCase(),
                            'bitrate': song.bitrate,
                            'md5': null,
                        }
                        matchSongs.push(songItem)
                    } else {
                        //未关联歌曲
                        if (filter[0].length > 0 && song.artist !== filter[0]) {
                            return
                        }
                        if (filter[1].length > 0 && song.album !== filter[1]) {
                            return
                        }
                        if (filter[2].length > 0 && song.songName !== filter[2]) {
                            return
                        }
                        let songItem = {
                            'id': song.songId,
                            'size': song.fileSize,
                            'ext': song.fileName.split('.')
                                .pop()
                                .toLowerCase(),
                            'bitrate': song.bitrate,
                            'md5': null,
                            'name': song.songName,
                            'al': song.album,
                            'ar': song.artist,
                        }
                        matchSongs.push(songItem)
                    }
                })

                let ids = matchSongs.map(song => song.id)
                if (ids.length > 0) {
                    weapiRequest("/api/song/enhance/player/url/v1", {
                        data: {
                            ids: JSON.stringify(ids),
                            level: 'hires',
                            encodeType: 'mp3',
                        },
                        onload: (res2) => {
                            //console.log(res2)
                            if (res2.code !== 200) {
                                //重试
                                exportCloudByPlaylistSub(filter, trackIds, config, offset)
                                return
                            }
                            matchSongs.forEach(song => {
                                let songId = song.id
                                for (let i = 0; i < res2.data.length; i++) {
                                    if (res2.data[i].id === songId) {
                                        song.md5 = res2.data[i].md5
                                        config.data.push(song)
                                        break
                                    }
                                }
                            })
                            exportCloudByPlaylistSub(filter, trackIds, config, offset + limit)
                        }
                    })
                } else {
                    exportCloudByPlaylistSub(filter, trackIds, config, offset + limit)
                }
            }
        })
    }
    function configToFile(config) {
        let content = JSON.stringify(config)
        let temp = document.createElement('a');
        let data = new Blob([content], {
            type: 'type/plain'
        })
        let fileurl = URL.createObjectURL(data)
        temp.href = fileurl
        temp.download = '网易云云盘信息.json'
        temp.click()
        URL.revokeObjectURL(data);
        showTips(`导出云盘信息完成,共${config.data.length}首歌曲`, 1)
    }
}