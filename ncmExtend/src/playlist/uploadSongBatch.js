
import { createBigButton } from "../utils/common"
import { ShowBatchDLULPopUp } from "../PopUpUI/ShowBatchDLULPopUp"
export const uploadSongBatch=(playlistId,uiArea)=>{
    //批量转存云盘
    let btnBatchUpload = createBigButton('批量转存云盘', uiArea, 1)
    btnBatchUpload.addEventListener('click', () => {
        ShowBatchDLULPopUp({ listType: 'playlist', listId: playlistId })
    })
}