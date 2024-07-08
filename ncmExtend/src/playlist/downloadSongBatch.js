
import { createBigButton } from "../utils/common"
import { ShowBatchDLPopUp } from "../PopUpUI/ShowBatchDLPopUp"
import { filterSongs } from "../song/filterSongs"
import { playlistDetailObj } from "./playlistDetail"
import { createSongsUrlApi } from "../song/createSongsUrlApi"
export const downloadSongBatch = (playlistId, uiArea) => {
    //批量下载
    let btnBatchDownload = createBigButton('批量下载', uiArea, 1)
    btnBatchDownload.addEventListener('click', () => {
        ShowBatchDLPopUp({ listType: 'playlist', listId: playlistId })
    })
}
export const startBatchDownload = (config) => {
    let filtedSongList = filterSongs(playlistDetailObj.playlistSongList, config)
    createSongsUrlApi(filtedSongList, config)
}