import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
import { albumDetail } from "./albumDetail"
export const albumMain = (albumId) => {
    let descriptionArea = document.querySelector('.topblk')
    let operationArea = document.querySelector('#content-operation')
    if (operationArea) {
        downloadSongBatch(albumId, operationArea)
        uploadSongBatch(albumId, operationArea)
    }
    if (descriptionArea) {
        albumDetail(albumId, descriptionArea)
    }
}