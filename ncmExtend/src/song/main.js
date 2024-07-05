import { SongDetail } from "./songDetail"
let detailArea = document.querySelector(".cvrwrap")
export const songMain = (songId) => {
    if (detailArea) {
        let songdetail=new SongDetail(songId,detailArea)
        songdetail.start()
    }
}