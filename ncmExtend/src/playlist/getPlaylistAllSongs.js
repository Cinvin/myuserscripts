import { weapiRequest } from "../utils/request"
import { filterSongs } from "../song/filterSongs"
import { showTips } from "../utils/common"
import { getArtistTextInSongDetail, getAlbumTextInSongDetail } from "../utils/descHelper"

export const getPlaylistAllSongs = (config) => {
    weapiRequest("/api/v6/playlist/detail", {
        data: {
            id: config.listId,
            n: 100000,
            s: 8,
        },
        onload: (content) => {
            //console.log(content)
            let songList = []
            addSongInToSongList(content, songList)
            if (content.playlist.trackCount > content.playlist.tracks.length) {
                showTips(`大歌单,开始分批获取${content.playlist.trackCount}首歌信息`, 1)
                let trackIds = content.playlist.trackIds.map(item => {
                    return {
                        'id': item.id
                    }
                })
                getPlaylistAllSongsSub(trackIds, 0, [], config)
            }
            else {
                filterSongs(songList, config)
            }
        }
    })
}
const getPlaylistAllSongsSub = (trackIds, startIndex, songList, config) => {
    if (startIndex >= trackIds.length) {
        filterSongs(songList, config)
        return
    }
    weapiRequest("/api/v3/song/detail", {
        data: {
            c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1000))
        },
        onload: function (content) {
            addSongInToSongList(content, songList)
            getPlaylistAllSongsSub(trackIds, startIndex + content.songs.length, songList, config)
        }
    })
}
const addSongInToSongList = (content, songList) => {
    let tracklen = content.playlist.tracks.length
    let privilegelen = content.privileges.length
    for (let i = 0; i < tracklen; i++) {
        for (let j = 0; j < privilegelen; j++) {
            if (content.playlist.tracks[i].id == content.privileges[j].id) {
                let songItem = {
                    id: content.playlist.tracks[i].id,
                    title: content.playlist.tracks[i].name,
                    artist: getArtistTextInSongDetail(content.playlist.tracks[i]),
                    album: getAlbumTextInSongDetail(content.playlist.tracks[i]),
                    song: content.playlist.tracks[i],
                    privilege: content.privileges[j],
                }
                songList.push(songItem)
                break
            }
        }
    }
    return songList
}