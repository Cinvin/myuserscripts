
import { createBigButton } from "../utils/common"
import { ShowBatchDLPopUp } from "../PopUpUI/ShowBatchDLPopUp"
export const downloadSongBatch = (playlistId, uiArea) => {
    //批量下载
    let btnBatchDownload = createBigButton('批量下载', uiArea, 1)
    btnBatchDownload.addEventListener('click', () => {
        ShowBatchDLPopUp({ listType: 'playlist', listId: playlistId })
    })
}