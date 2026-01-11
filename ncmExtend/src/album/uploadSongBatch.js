
import { createBigButton } from "../utils/common"
import { ShowBatchDLULPopUp } from "../PopUpUI/ShowBatchDLULPopUp"
export const uploadSongBatch=(albumId,uiArea)=>{
    //批量转存云盘
    const btnBatchUpload = createBigButton('批量转存云盘', uiArea, 1)
    btnBatchUpload.addEventListener('click', () => {
        ShowBatchDLULPopUp({ listType: 'album', listId: albumId })
    })
}