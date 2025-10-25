
import { createBigButton } from "../utils/common"
import { albumDetailObj } from "./albumDetail"
import { showBatchManager } from "../components/batchManager"
export const songsDownUpLoad = (albumId, uiArea) => {
    //批量下载 & 转存
    let btnSongsDownUpLoad = createBigButton('批量下载 & 转存', uiArea, 1)
    btnSongsDownUpLoad.addEventListener('click', () => {
        showBatchManager(albumDetailObj.albumSongList, { listType: 'album', listId: albumId })
    })
}