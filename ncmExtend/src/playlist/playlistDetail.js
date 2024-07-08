import { weapiRequest } from "../utils/request"
import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
import { sortSongs } from "./sortSongs"
import { showTips } from "../utils/common"
import { getAlbumTextInSongDetail, getArtistTextInSongDetail } from "../utils/descHelper"


class PlaylistDetail {
    constructor() {
        this.domReady = false
        this.dataFetched = false
        this.flag = true
        this.isBigPlaylist = false
        this.playlistId = Number(new URLSearchParams(unsafeWindow.location.search).get('id'))
        this.playlist = null
        this.playlistSongList = []
        this.playableSongList = []
    };
    fetchPlaylistFullData(playlistId) {
        weapiRequest("/api/v6/playlist/detail", {
            data: {
                id: playlistId,
                n: 100000,
                s: 8,
            },
            onload: (content) => {
                this.playlist = content.playlist
                if (content.playlist.trackCount > content.playlist.tracks.length) {
                    this.isBigPlaylist = true
                    let trackIds = content.playlist.trackIds.map(item => {
                        return {
                            'id': item.id
                        }
                    })
                    this.getPlaylistAllSongsSub(trackIds, 0)
                }
                else {
                    this.addSongInToSongList(content)
                    this.onFetchDatafinnsh()
                }
            }
        })
    }
    getPlaylistAllSongsSub(trackIds, startIndex) {
        if (startIndex >= trackIds.length) {
            this.onFetchDatafinnsh()
            return
        }
        weapiRequest("/api/v3/song/detail", {
            data: {
                c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1000))
            },
            onload: (content) => {
                this.addSongInToSongList(content)
                this.getPlaylistAllSongsSub(trackIds, startIndex + content.songs.length)
            }
        })
    }
    addSongInToSongList(content) {
        const songs = content.songs || content.playlist.tracks
        const privileges = content.privileges
        const songlen = songs.length
        const privilegelen = privileges.length
        for (let i = 0; i < songlen; i++) {
            for (let j = 0; j < privilegelen; j++) {
                if (songs[i].id == privileges[j].id) {
                    let songItem = {
                        id: songs[i].id,
                        title: songs[i].name,
                        artist: getArtistTextInSongDetail(songs[i]),
                        album: getAlbumTextInSongDetail(songs[i]),
                        song: songs[i],
                        privilege: privileges[j],
                    }
                    this.playlistSongList.push(songItem)
                    break
                }
            }
        }
    }
    onFetchDatafinnsh() {
        this.dataFetched = true
        for (const songItem of this.playlistSongList) {
            if (songItem.privilege.plLevel != 'none') {
                let addToFormat = {
                    album: songItem.song.al,
                    alias: songItem.song.alia || songItem.song.ala || [],
                    artists: songItem.song.ar || [],
                    commentThreadId: "R_SO_4_" + songItem.song.id,
                    copyrightId: songItem.song.cp || 0,
                    duration: songItem.song.dt || 0,
                    id: songItem.song.id,
                    mvid: songItem.song.mv || 0,
                    name: songItem.song.name || "",
                    cd: songItem.song.cd,
                    position: songItem.song.no || 0,
                    ringtone: songItem.song.rt,
                    rtUrl: songItem.song.rtUrl,
                    status: songItem.song.st || 0,
                    pstatus: songItem.song.pst || 0,
                    fee: songItem.song.fee || 0,
                    version: songItem.song.v || 0,
                    eq: songItem.song.eq,
                    songType: songItem.song.t || 0,
                    mst: songItem.song.mst,
                    score: songItem.song.pop || 0,
                    ftype: songItem.song.ftype,
                    rtUrls: songItem.song.rtUrls,
                    transNames: songItem.song.tns,
                    privilege: songItem.song.privilege,
                    lyrics: songItem.song.lyrics,
                    alg: songItem.song.alg,
                    source: {
                        fdata: String(this.playlistId),
                        fid: 13,
                        link: `playlist?id=${this.playlistId}&_hash=songlist-${songItem.song.id}`,
                        title: '歌单',
                    },
                }
                this.playableSongList.push(addToFormat)
            }
        }
        this.checkStartInitBtn()
    }
    onDomReady() {
        this.operationArea = document.querySelector('#content-operation')
        this.domReady = true
        this.checkStartInitBtn()
    }
    checkStartInitBtn() {
        if (this.domReady && this.dataFetched && this.flag) {
            this.flag = false
            this.renderPlayAllBtn()
            this.appendBtns()
        }
        else if (!this.dataLoaded && this.isBigPlaylist) {
            showTips('正在获取大型歌单歌曲信息', 1)
        }
    }
    renderPlayAllBtn() {
        console.log(this.playableSongList)
        this.operationArea.innerHTML = `
        <a style="display:none" class="u-btn2 u-btn2-2 u-btni-addply f-fl" hidefocus="true" title="播放"><i><em class="ply"></em>播放全部(${this.playableSongList.length})</i></a>
        <a style="display:none" class="u-btni u-btni-add" hidefocus="true" title="添加到播放列表"></a>
        `+ this.operationArea.innerHTML
        console.log(this.operationArea.children)
        this.operationArea.children[0].addEventListener('click', () => {
            unsafeWindow.top.player.addTo(this.playableSongList, true, true)
        })
        this.operationArea.children[1].addEventListener('click', () => {
            unsafeWindow.top.player.addTo(this.playableSongList, false, false)
        })
        this.operationArea.children[0].style.display = ''
        this.operationArea.children[1].style.display = ''
        this.operationArea.children[2].style.display = 'none'
        this.operationArea.children[3].style.display = 'none'
    }
    appendBtns() {
        downloadSongBatch(this.playlistId, this.operationArea)
        uploadSongBatch(this.playlistId, this.operationArea)
        const creatorhomeURL = document.head.querySelector("[property~='music:creator'][content]")?.content
        const creatorId = new URLSearchParams(new URL(creatorhomeURL).search).get('id')
        if (creatorId == unsafeWindow.GUser.userId) {
            sortSongs(this.playlistId, this.operationArea)
        }
    }
}
export let playlistDetailObj = new PlaylistDetail()