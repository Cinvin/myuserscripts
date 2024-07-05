//生成 url API
import { batchDownloadSongs } from './batchDownloadSongs'
import { batchUploadSongs } from './batchUploadSongs'
import { levelWeight } from '../utils/constant'
export const createSongsUrlApi = (songList, config) => {
    for (let songItem of songList) {
        let api = { url: '/api/song/enhance/player/url/v1', data: { ids: JSON.stringify([songItem.id]), level: config.level, encodeType: 'mp3' } }
        if (songItem.privilege.fee == 0 && (levelWeight[songItem.privilege.plLevel] || 99) < (levelWeight[songItem.privilege.dlLevel] || -1)) api = { url: '/api/song/enhance/download/url/v1', data: { id: songItem.id, level: config.level, encodeType: 'mp3' } }
        songItem.api = api
    }
    if (config.action == 'batchUpload') {
        batchUploadSongs(songList, config)
    }
    else if (config.action == 'batchDownload') {
        batchDownloadSongs(songList, config)
    }
}