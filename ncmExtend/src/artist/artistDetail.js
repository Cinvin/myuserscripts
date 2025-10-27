import { weapiRequest, weapiRequestSync } from "../utils/request"
import { createBigButton } from "../utils/common"
import { duringTimeDesc, getAlbumTextInSongDetail, getArtistTextInSongDetail } from "../utils/descHelper"
import { getMD5 } from "../utils/crypto"
import { showBatchManager } from "../components/batchManager"

class ArtistDetail {
    constructor() {
        this.dataFetched = false
        this.artistSongList = []
        this.artistSongUniqueMap = {}
        this.artistRes = null
        const params = new URLSearchParams(unsafeWindow.location.search)
        this.artistId = Number(params.get('id'))
    };
    onDomReady() {
        this.AppendBtns()
    }

    AppendBtns() {
        this.operationArea = document.querySelector('#content-operation')
        //批量下载 & 转存
        const btnSongsDownUpLoad = createBigButton('批量下载 & 转存', this.operationArea, 1)
        btnSongsDownUpLoad.addEventListener('click', () => {
            if (!this.dataFetched) {
                this.fetchArtistSongs()
            }
            else {
                showBatchManager(this.artistSongList, { listType: 'artist', listId: this.artistId })
            }
        })
        this.operationArea.appendChild(btnSongsDownUpLoad)
    }
    fetchArtistSongs() {
        Swal.fire({
            input: "textarea",
            inputLabel: "获取歌手歌曲",
            confirmButtonText: '关闭',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCloseButton: false,
            showConfirmButton: false,
            inputAttributes: {
                "readonly": true
            },
            didOpen: async () => {
                const textarea = Swal.getInput()
                textarea.style = 'height: 300px;'

                function addLog(log) {
                    textarea.value += log + '\n'
                    textarea.scrollTop = textarea.scrollHeight;
                }
                let offset = 0
                const limit = 200
                let more = true
                while (more) {
                    const content = await weapiRequestSync("/api/v2/artist/songs", {
                        data: {
                            id: this.artistId,
                            offset: offset,
                            limit: limit,
                        }
                    })
                    if (offset === 0) {
                        addLog(`总共${content.total}首歌`)
                        addLog(`将对获取的歌曲进行一定的去重处理`)
                    }
                    addLog(`获取第${offset + 1}到第${offset + limit}首`)
                    content.songs.forEach(song => {
                        song.al = {
                            id: song.album.id,
                            name: song.album.name,
                            pic: song.album.pic,
                            picUrl: song.album.picUrl,
                            pic_str: song.album.picId_str,
                            tns: song.album.alias,
                        }
                        song.ar = song.artists.map((artist) => {
                            return {
                                id: artist.id,
                                name: artist.name,
                            }
                        })
                        const songItem = {
                            id: song.id,
                            title: song.name,
                            artist: getArtistTextInSongDetail(song),
                            album: getAlbumTextInSongDetail(song),
                            song: song,
                            privilege: song.privilege,
                        }
                        // 歌曲去重
                        const songKey = this.getSongUniqueCode(songItem)
                        if (!this.artistSongUniqueMap[songKey]) {
                            this.artistSongUniqueMap[songKey] = [{ songs: [songItem], duration: songItem.song.duration }]
                            this.artistSongList.push(songItem)
                        }
                        else {
                            let found = false
                            for (const item of this.artistSongUniqueMap[songKey]) {
                                if (Math.abs(songItem.song.duration - item.duration) <= 1000) {
                                    //歌曲时长差小于一秒，视作同一首歌
                                    if (songItem.privilege.cs) {
                                        //不同版本的歌曲共享云盘状态
                                        item.songs[0].privilege.cs = true
                                    }
                                    if (item.songs[0].otherVersions) {
                                        item.songs[0].otherVersions.push(songItem)
                                    }
                                    else {
                                        item.songs[0].otherVersions = [songItem]
                                    }
                                    // 更新平均时长
                                    item.songs.push(songItem)
                                    found = true
                                    break
                                }
                            }
                            if (!found) {
                                this.artistSongUniqueMap[songKey].push({ songs: [songItem], duration: songItem.song.duration })
                                this.artistSongList.push(songItem)
                            }
                        }
                    })
                    offset += limit
                    more = content.more
                }
                this.dataFetched = true
                showBatchManager(this.artistSongList, { listType: 'artist', listId: this.artistId })
            },
        })
    }
    updateSongsCloudStatus(songIds) {
        songIds.forEach(songId => {
            for (let i = 0; i < this.artistSongList.length; i++) {
                if (this.artistSongList[i].id == songId) {
                    this.artistSongList[i].privilege.cs = true
                    break
                }
            }
        })
    }

    getSongUniqueCode(song) {
        const item = {
            name: song.song.name,
            artists: song.song.ar.sort((a, b) => {
                if (a.id === b.id) return a.name.localeCompare(b.name)
                return a.id - b.id
            }),
            instrumental: (song.song.mark & 131072) === 131072,
            explicit: (song.song.mark & 1048576) === 1048576,
        }
        return getMD5(JSON.stringify(item))
    }
}
export const artistDetailObj = new ArtistDetail()