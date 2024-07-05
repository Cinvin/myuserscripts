import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
import { albumDetail } from "./albumDetail"
let descriptionArea = document.querySelector('.topblk')
let operationArea = document.querySelector('#content-operation')
export const albumMain = (albumId) => {
    if(operationArea){
        downloadSongBatch(albumId,operationArea)
        uploadSongBatch(albumId,operationArea)
    }
    if(descriptionArea){
        albumDetail(albumId,descriptionArea)
    }
}