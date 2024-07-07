import { SongDetail } from "./songDetail"
export const songMain = (songId) => {
    let detailArea = document.querySelector(".cvrwrap")
    if (detailArea) {
        let songdetail = new SongDetail(songId, detailArea)
        songdetail.start()
    }
}