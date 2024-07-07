import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
import { albumDetailObj } from "./albumDetail"
export const albumMain = (albumId) => {
    let descriptionArea = document.querySelector('.topblk')
    let operationArea = document.querySelector('#content-operation')
    if (operationArea) {
        downloadSongBatch(albumId, operationArea)
        uploadSongBatch(albumId, operationArea)
    }
    if (descriptionArea) {
        albumDetailObj.setFillNode(descriptionArea)
    }
}