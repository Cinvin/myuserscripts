import { weapiRequest } from "../utils/request"
import { filterSongs } from "../song/filterSongs"
import { getArtistTextInSongDetail, getAlbumTextInSongDetail } from "../utils/descHelper"

export const getAlbumAllSongs = (config) => {
    weapiRequest(`/api/v1/album/${config.listId}`, {
        onload: (content) => {
            //console.log(content)
            let songList = []
            for (let i = 0; i < content.songs.length; i++) {
                let songItem = {
                    id: content.songs[i].id,
                    title: content.songs[i].name,
                    artist: getArtistTextInSongDetail(content.songs[i]),
                    album: getAlbumTextInSongDetail(content.songs[i]),
                    song: content.songs[i],
                    privilege: content.songs[i].privilege,
                }
                songList.push(songItem)
            }
            filterSongs(songList, config)
        }
    })
}