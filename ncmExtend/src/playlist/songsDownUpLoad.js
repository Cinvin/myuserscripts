
import { createBigButton } from "../utils/common"
import { playlistDetailObj } from "./playlistDetail"
import { showBatchManager } from "../components/batchManager"
export const songsDownUpLoad = (playlistId, uiArea) => {
    //批量下载 & 转存
    let btnSongsDownUpLoad = createBigButton('批量下载 & 转存', uiArea, 1)
    btnSongsDownUpLoad.addEventListener('click', () => {
        showBatchManager(playlistDetailObj.playlistSongList, { listType: 'playlist', listId: playlistId })
    })
}