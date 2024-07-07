import { weapiRequest } from "../utils/request"
import { songMark } from "../utils/constant"
class AlbumDetail {
    constructor() {
        this.flag = true
    };
    fetchAlbumData(albumId) {
        this.albumId = albumId
        weapiRequest(`/api/v1/album/${albumId}`, {
            onload: (content) => {
                this.albumRes = content
                this.checkStartCreateDom()
            }
        })
    }
    setFillNode(uiArea) {
        this.uiArea = uiArea
        this.checkStartCreateDom()
    }
    checkStartCreateDom() {
        if (this.uiArea && this.albumRes && this.flag) {
            this.flag = false
            this.createDoms()
        }
    }
    createDoms() {
        this.uiArea.innerHTML += `<p class="intr"><b>专辑类型：</b>${this.albumRes.album.type} ${this.albumRes.album.subType}</p>`
        if ((this.albumRes.album.mark & songMark.explicit) == songMark.explicit) {
            this.uiArea.innerHTML += `<p class="intr"><b>🅴：</b>内容含有不健康因素</p>`
        }
        if (this.albumRes.album.blurPicUrl) {
            this.uiArea.innerHTML += `<p class="intr"><a class="s-fc7" href="${this.albumRes.album.blurPicUrl}" target="_blank">专辑封面原图</a></p>`
        }
    }
}
export let albumDetailObj = new AlbumDetail()