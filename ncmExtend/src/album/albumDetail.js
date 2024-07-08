import { weapiRequest } from "../utils/request"
import { songMark } from "../utils/constant"
import { getAlbumTextInSongDetail,getArtistTextInSongDetail } from "../utils/descHelper"
import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
class AlbumDetail {
    constructor() {
        this.domReady = false
        this.dataFetched = false
        this.flag = true
        this.albumSongList = []
        this.albumRes = null
    };
    fetchAlbumData(albumId) {
        this.albumId = albumId
        weapiRequest(`/api/v1/album/${albumId}`, {
            onload: (content) => {
                this.albumRes = content
                for (let i = 0; i < content.songs.length; i++) {
                    let songItem = {
                        id: content.songs[i].id,
                        title: content.songs[i].name,
                        artist: getArtistTextInSongDetail(content.songs[i]),
                        album: getAlbumTextInSongDetail(content.songs[i]),
                        song: content.songs[i],
                        privilege: content.songs[i].privilege,
                    }
                    this.albumSongList.push(songItem)
                }
                this.dataFetched = true
                this.checkStartCreateDom()
            }
        })
    }
    onDomReady() {
        this.domReady=true
        this.descriptionArea = document.querySelector('.topblk')
        this.operationArea = document.querySelector('#content-operation')
        this.checkStartCreateDom()
    }
    checkStartCreateDom() {
        if (this.domReady && this.dataFetched && this.flag) {
            this.flag = false
            this.AppendInfos()
            this.AppendBtns()
        }
    }
    AppendInfos() {
        this.descriptionArea.innerHTML += `<p class="intr"><b>专辑类型：</b>${this.albumRes.album.type} ${this.albumRes.album.subType}</p>`
        if ((this.albumRes.album.mark & songMark.explicit) == songMark.explicit) {
            this.descriptionArea.innerHTML += `<p class="intr"><b>🅴：</b>内容含有不健康因素</p>`
        }
        if (this.albumRes.album.blurPicUrl) {
            this.descriptionArea.innerHTML += `<p class="intr"><a class="s-fc7" href="${this.albumRes.album.blurPicUrl}" target="_blank">专辑封面原图</a></p>`
        }
    }
    AppendBtns(){
        downloadSongBatch(this.albumId, this.operationArea)
        uploadSongBatch(this.albumId, this.operationArea)
    }
}
export let albumDetailObj = new AlbumDetail()