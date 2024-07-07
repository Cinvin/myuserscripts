import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
import { sortSongs } from "./sortSongs"
export const playlistMain = (playlistId) => {
    let operationArea = document.querySelector('#content-operation')
    if (operationArea) {
        downloadSongBatch(playlistId, operationArea)
        uploadSongBatch(playlistId, operationArea)
        const creatorhomeURL = document.head.querySelector("[property~='music:creator'][content]")?.content
        const creatorId = new URLSearchParams(new URL(creatorhomeURL).search).get('id')
        if (creatorId == unsafeWindow.GUser.userId) {
            sortSongs(playlistId, operationArea)
        }
    }
}