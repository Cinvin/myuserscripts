import { songDetailObj } from "./songDetail"
export const songMain = (songId) => {
    let detailArea = document.querySelector(".cvrwrap")
    if (detailArea) {
        songDetailObj.setFillNode(detailArea)
    }
}