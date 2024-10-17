import { showTips, showConfirmBox } from "../utils/common"
import { ncmDownUploadBatch } from "../components/ncmDownUploadBatch"
export const batchUploadSongs = (songList, config) => {
    if (songList.length == 0) {
        showConfirmBox('没有可上传的歌曲')
        return
    }
    showTips(`开始下载上传${songList.length}首歌曲`, 1)
    let ULobj = new ncmDownUploadBatch(songList, config)
    ULobj.startUpload()
}