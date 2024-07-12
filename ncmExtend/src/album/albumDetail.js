import { weapiRequest } from "../utils/request"
import { songMark } from "../utils/constant"
import { getAlbumTextInSongDetail, getArtistTextInSongDetail } from "../utils/descHelper"
import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
class AlbumDetail {
    constructor() {
        this.domReady = false
        this.dataFetched = false
        this.flag = true
        this.albumSongList = []
        this.albumRes = null
        this.albumDiscList = []
        const params = new URLSearchParams(unsafeWindow.location.search)
        this.playlistId = Number(params.get('id'))
        this._hash = params.get('_hash')
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
                    const discInfos = content.songs[i].cd ? content.songs[i].cd.split(' ') : []
                    if (discInfos.length > 0) {
                        const discIndex = parseInt(discInfos[0])
                        while (this.albumDiscList.length < discIndex) {
                            this.albumDiscList.push(null)
                        }
                        if (this.albumDiscList[discIndex - 1] === null) {
                            let discTitle = `Disc ${discIndex}`
                            if (discInfos.length > 1) discTitle += ' ' + discInfos.slice(1).join(' ')
                            this.albumDiscList[discIndex - 1] = { title: discTitle, songs: [] }
                        }
                        this.albumDiscList[discIndex - 1].songs.push(songItem)
                    }
                }
                this.dataFetched = true
                this.checkStartCreateDom()
            }
        })
    }
    onDomReady() {
        this.domReady = true
        this.descriptionArea = document.querySelector('.topblk')
        this.operationArea = document.querySelector('#content-operation')
        this.checkStartCreateDom()
    }
    checkStartCreateDom() {
        if (this.domReady && this.dataFetched && this.flag) {
            this.flag = false
            this.AppendInfos()
            this.AppendBtns()
            if(this.albumDiscList.length>1) this.createDiscTable()
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
    AppendBtns() {
        downloadSongBatch(this.albumId, this.operationArea)
        uploadSongBatch(this.albumId, this.operationArea)
    }
    createDiscTable() {
        const tableRows = document.querySelectorAll('.m-table-album tr')
        const tableParent = document.querySelector('div:has(> .m-table-album)')
        let isTableCreated = false
        this.albumDiscList.forEach((disc, index) => {
            if (disc === null) return
            isTableCreated = true
            tableParent.innerHTML += `
            <div class="u-title u-title-1 f-cb" style="margin-top: 10px"><h3><span class="f-ff2">${disc.title}</span></h3><span class="sub s-fc3">${disc.songs.length}首歌</span></div>
            <table class="m-table m-table-album">
                <thead><tr><th class="first w1"><div class="wp">&nbsp;</div></th><th><div class="wp">歌曲标题</div></th><th class="w2-1"><div class="wp">时长</div></th><th class="w4"><div class="wp">歌手</div></th></tr></thead>
                <tbody id="ncmextend-disc-${index}"></tbody>
            </table>
            `
            let tbody = tableParent.querySelector(`#ncmextend-disc-${index}`)
            disc.songs.forEach((songItem,songIndex) => {
                tableRows.forEach(tableRow => {
                    if (Number(tableRow.id.slice(0, -13)) === songItem.id) {
                        tableRow.querySelector('.num').innerHTML = songItem.song.no
                        tableRow.className = songIndex % 2 == 0 ? "even " : ""
                        if (songItem.privilege.st < 0) tableRow.className += 'js-dis'
                        tbody.appendChild(tableRow)
                    }
                })
            })
        })
        if (isTableCreated) {
            const originTitle = document.querySelector('.n-songtb .u-title')
            originTitle.parentNode.removeChild(originTitle)
            tableParent.removeChild(tableParent.firstChild)
        }
        //定位到url中的目标歌曲
        if (/^songlist-(\d+)$/.test(this._hash) && tableRows.length > 0) {
            const timestamp = document.querySelector('.m-table > tbody > tr').id.slice(-13)
            const tr = document.querySelector(`[id="${this._hash.slice(9)}${timestamp}"]`)
            if (tr) tr.scrollIntoView();
        }
    }
}
export let albumDetailObj = new AlbumDetail()