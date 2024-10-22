
import { weapiRequest } from "../utils/request"
import { levelDesc, fileSizeDesc, nameFileWithoutExt, getAlbumTextInSongDetail, getArtistTextInSongDetail } from "../utils/descHelper"
import { levelWeight, songMark } from "../utils/constant"
import { handleLyric } from "../utils/lyric"
import { ncmDownUpload } from "../components/ncmDownUpload"
import { saveContentAsFile } from "../utils/common"
import { batchDownloadSongs } from "./batchDownloadSongs"
class SongDetail {
    constructor() {
        this.domReady = false
        this.dataFetched = false
        this.flag = true
    };
    fetchSongData(songId) {
        this.songId = songId
        weapiRequest("/api/batch", {
            data: {
                '/api/v3/song/detail': JSON.stringify({ c: JSON.stringify([{ 'id': this.songId }]) }),
                '/api/song/music/detail/get': JSON.stringify({ 'songId': this.songId, 'immerseType': 'ste' }),
                '/api/song/red/count': JSON.stringify({ 'songId': this.songId }),
                '/api/song/lyric/v1': JSON.stringify({ id: this.songId, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0, }),
                '/api/song/play/about/block/page': JSON.stringify({ 'songId': this.songId }),
            },
            onload: (res) => {
                console.log(res)
                this.SongRes = res
                this.dataFetched = true
                this.checkStartCreateDom()
            }
        })
    }
    onDomReady() {
        this.maindDiv = document.querySelector(".cvrwrap")
        this.domReady = true
        this.checkStartCreateDom()
    }
    checkStartCreateDom() {
        if (this.domReady && this.dataFetched && this.flag) {
            this.flag = false
            this.createDoms()
        }
    }
    createDoms() {
        this.songDetailObj = this.SongRes["/api/v3/song/detail"].songs[0]
        this.title = this.songDetailObj.name
        this.album = getAlbumTextInSongDetail(this.songDetailObj)
        this.artist = getArtistTextInSongDetail(this.songDetailObj)
        this.filename = nameFileWithoutExt(this.title, this.artist, 'artist-title')
        this.songDetailObj = this.songDetailObj

        if (this.SongRes["/api/v3/song/detail"].privileges[0].plLevel != 'none') {
            this.createTitle('下载歌曲')
            this.downLoadTableBody = this.createTable().querySelector('tbody')
            let plLevel = this.SongRes["/api/v3/song/detail"].privileges[0].plLevel
            let dlLevel = this.SongRes["/api/v3/song/detail"].privileges[0].dlLevel
            let songPlWeight = levelWeight[plLevel] || 0
            let songDlWeight = levelWeight[dlLevel] || 0
            let songDetail = this.SongRes["/api/song/music/detail/get"].data
            if (this.SongRes["/api/v3/song/detail"].privileges[0].cs) {
                this.createDLRow(`云盘文件 ${this.SongRes["/api/v3/song/detail"].songs[0].pc.br}k`, plLevel, 'pl')
            }
            else {
                this.createTitle('转存云盘')
                this.upLoadTableBody = this.createTable().querySelector('tbody')
                if (songDlWeight > songPlWeight && this.SongRes["/api/v3/song/detail"].privileges[0].fee == 0) {
                    const channel = 'dl'
                    if (songDetail.hr && songDlWeight >= 5 && songPlWeight < 5) { const desc = `${Math.round(songDetail.hr.br / 1000)}k\t${fileSizeDesc(songDetail.hr.size)}\t${songDetail.hr.sr / 1000}kHz`; const level = 'hires'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                    if (songDetail.sq && songDlWeight >= 4 && songPlWeight < 4) { const desc = `${Math.round(songDetail.sq.br / 1000)}k\t${fileSizeDesc(songDetail.sq.size)}\t${songDetail.sq.sr / 1000}kHz`; const level = 'lossless'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                    if (songDetail.h && songDlWeight >= 3 && songPlWeight < 3) { const desc = `${Math.round(songDetail.h.br / 1000)}k\t${fileSizeDesc(songDetail.h.size)}`; const level = 'exhigh'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                    if (songDetail.m && songDlWeight >= 2 && songPlWeight < 2) { const desc = `${Math.round(songDetail.m.br / 1000)}k\t${fileSizeDesc(songDetail.m.size)}`; const level = 'higher'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                }
                const channel = 'pl'
                if (songDetail.jm && songPlWeight >= 7) { const desc = `${Math.round(songDetail.jm.br / 1000)}k\t${fileSizeDesc(songDetail.jm.size)}\t${songDetail.jm.sr / 1000}kHz`; const level = 'jymaster'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.db && songPlWeight >= 7) { const desc = `${Math.round(songDetail.db.br / 1000)}k\t${fileSizeDesc(songDetail.db.size)}\t${songDetail.db.sr / 1000}kHz`; const level = 'dolby'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.sk && songPlWeight >= 7) { const desc = `${Math.round(songDetail.sk.br / 1000)}k\t${fileSizeDesc(songDetail.sk.size)}\t${songDetail.sk.sr / 1000}kHz`; const level = 'sky'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.je && songPlWeight >= 4) { const desc = `${Math.round(songDetail.je.br / 1000)}k\t${fileSizeDesc(songDetail.je.size)}\t${songDetail.je.sr / 1000}kHz`; const level = 'jyeffect'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.hr && songPlWeight >= 4) { const desc = `${Math.round(songDetail.hr.br / 1000)}k\t${fileSizeDesc(songDetail.hr.size)}\t${songDetail.hr.sr / 1000}kHz `; const level = 'hires'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.sq && songPlWeight >= 4) { const desc = `${Math.round(songDetail.sq.br / 1000)}k ${fileSizeDesc(songDetail.sq.size)}\t${songDetail.sq.sr / 1000}kHz`; const level = 'lossless'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.h && songPlWeight >= 3) { const desc = `${Math.round(songDetail.h.br / 1000)}k ${fileSizeDesc(songDetail.h.size)}`; const level = 'exhigh'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.m && songPlWeight >= 2) { const desc = `${Math.round(songDetail.m.br / 1000)}k ${fileSizeDesc(songDetail.m.size)}`; const level = 'higher'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }
                if (songDetail.l && songPlWeight >= 1) { const desc = `${Math.round(songDetail.l.br / 1000)}k ${fileSizeDesc(songDetail.l.size)}`; const level = 'standard'; this.createDLRow(desc, level, channel); this.createULRow(desc, level, channel) }

                this.createHideButtonRow(this.downLoadTableBody)
                this.createHideButtonRow(this.upLoadTableBody)
            }

        }
        this.createTitle('歌曲其他信息')
        this.infoTableBody = this.createTable().querySelector('tbody')
        //lyric

        if (!this.SongRes["/api/song/lyric/v1"].pureMusic) {
            this.lyricObj = handleLyric(this.SongRes["/api/song/lyric/v1"])
            if (this.lyricObj.orilrc.lyric.length > 0) {
                this.lyricBlock = this.createTableRow(this.infoTableBody, '下载歌词')
                if (this.lyricObj.oritlrc) {
                    let btn = this.createButton('原歌词+翻译')
                    btn.addEventListener('click', () => {
                        this.downloadLyric('oritlrc')
                    })
                    this.lyricBlock.appendChild(btn)
                }
                if (this.lyricObj.oriromalrc) {
                    let btn = this.createButton('罗马音+原歌词')
                    btn.addEventListener('click', () => {
                        this.downloadLyric('oriromalrc')
                    })
                    this.lyricBlock.appendChild(btn)
                }
                let btn = this.createButton('原歌词')
                btn.addEventListener('click', () => {
                    this.downloadLyric('orilrc')
                })
                this.lyricBlock.appendChild(btn)
            }
        }

        if (this.songDetailObj.al.picUrl) {
            let btn = this.createButton('专辑封面原图')
            btn.href = this.songDetailObj.al.picUrl
            btn.target = '_blank'
            this.createButtonDescTableRow(this.infoTableBody, btn, null)
        }
        if (this.SongRes["/api/song/red/count"].data.count > 0) {
            let redBlock = this.createTableRow(this.infoTableBody, '红心数量')
            redBlock.innerHTML = `<span>${this.SongRes["/api/song/red/count"].data.count}</span>`
        }
        if (this.songDetailObj.originCoverType > 0) {
            let originCoverTypeBlock = this.createTableRow(this.infoTableBody, '原唱翻唱类型')
            originCoverTypeBlock.innerHTML = `<span>${this.songDetailObj.originCoverType == 1 ? "原唱" : "翻唱"}</span>`
        }
        //脏标
        if ((this.songDetailObj.mark & songMark.explicit) == songMark.explicit) {
            let explicitBlock = this.createTableRow(this.infoTableBody, '🅴')
            explicitBlock.innerHTML = `内容含有不健康因素`
        }
        //wiki
        for (let block of this.SongRes["/api/song/play/about/block/page"].data.blocks) {
            if (block.code == 'SONG_PLAY_ABOUT_MUSIC_MEMORY' && block.creatives.length > 0) {
                for (let creative of block.creatives) {
                    for (let resource of creative.resources) {
                        if (resource.resourceType == "FIRST_LISTEN") {
                            let firstTimeBlock = this.createTableRow(this.infoTableBody, '第一次听')
                            firstTimeBlock.innerHTML = resource.resourceExt.musicFirstListenDto.date
                        }
                        else if (resource.resourceType == "TOTAL_PLAY") {
                            let recordBlock = this.createTableRow(this.infoTableBody, '累计播放')
                            let recordText = ` ${resource.resourceExt.musicTotalPlayDto.playCount}次`
                            if (resource.resourceExt.musicTotalPlayDto.duration > 0) {
                                recordText += ` ${resource.resourceExt.musicTotalPlayDto.duration}分钟`
                            }
                            if (resource.resourceExt.musicTotalPlayDto.text.length > 0) {
                                recordText += ' ' + resource.resourceExt.musicTotalPlayDto.text
                            }
                            recordBlock.innerHTML = recordText
                        }
                    }
                }
            }
            if (block.code == 'SONG_PLAY_ABOUT_SONG_BASIC' && block.creatives.length > 0) {
                for (let creative of block.creatives) {
                    if (creative.creativeType == 'sheet' && creative.resources.length == 0) continue
                    if (!creative?.uiElement?.mainTitle) continue
                    let wikiItemBlock = this.createTableRow(this.infoTableBody, creative.uiElement.mainTitle.title)
                    if (creative.uiElement.descriptions) {
                        let descriptionDiv = document.createElement('div')
                        for (let description of creative.uiElement.descriptions) {
                            let descriptionP = this.createText(description.description)
                            descriptionDiv.appendChild(descriptionP)
                        }
                        wikiItemBlock.appendChild(descriptionDiv)
                    }
                    if (creative.uiElement.textLinks) {
                        for (let textLink of creative.uiElement.textLinks) {
                            let textLinkP = this.createText(textLink.text)
                            wikiItemBlock.appendChild(textLinkP)
                        }
                    }
                    if (creative.resources) {
                        for (let resource of creative.resources) {
                            let resourceDiv = document.createElement('div');
                            resourceDiv.className = "des s-fc3"
                            if (resource.uiElement.mainTitle) {
                                let IsLink = resource.action?.clickAction?.action == 1 && resource.action?.clickAction?.targetUrl.startsWith('https://')
                                let domType = IsLink ? 'a' : 'span'
                                let mainTitleItem = IsLink ? this.createButton(resource.uiElement.mainTitle.title) : this.createText(resource.uiElement.mainTitle.title)
                                if (IsLink) {
                                    mainTitleItem.target = '_blank'
                                    mainTitleItem.href = resource.action?.clickAction?.targetUrl
                                }
                                wikiItemBlock.appendChild(mainTitleItem)
                            }
                            if (resource.uiElement.subTitles) {
                                let subTitleP = this.createText(resource.uiElement.subTitles.map(t => t.title).join(' '))
                                subTitleP.innerHTML = resource.uiElement.subTitles.map(t => t.title).join(' ')
                                wikiItemBlock.appendChild(subTitleP)
                            }
                            if (resource.uiElement.descriptions) {
                                for (let description of resource.uiElement.descriptions) {
                                    let descriptionP = this.createText(description.description)
                                    wikiItemBlock.appendChild(descriptionP)
                                }
                            }
                            if (resource.uiElement.images) {
                                for (let image of resource.uiElement.images) {
                                    let imageA = this.createButton(image.title)
                                    imageA.target = '_blank'
                                    imageA.href = image.imageUrl || image.imageWithoutTextUrl
                                    wikiItemBlock.appendChild(imageA)
                                }
                            }
                            if (resource.uiElement.textLinks) {
                                for (let textLink of resource.uiElement.textLinks) {
                                    if (textLink.text) {
                                        let textLinkP = this.createText(textLink.text)
                                        wikiItemBlock.appendChild(textLinkP)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    createTitle(title) {
        let h3 = document.createElement("h3")
        h3.innerHTML = `<span class="f-fl" style="margin-top: 10px;margin-bottom: 10px;">${title}</span>`
        this.maindDiv.appendChild(h3)
    }
    createTable() {
        let table = document.createElement("table")
        table.className = "m-table"
        let tbody = document.createElement("tbody")
        table.appendChild(tbody)
        this.maindDiv.appendChild(table)
        return table
    }
    createTableRow(tbody, title, needHide = false) {
        let row = document.createElement("tr");
        if (tbody.children.length % 2 == 0) row.className = "even";
        if (needHide && tbody.children.length > 0) row.style.display = 'none'
        row.innerHTML = `<td><div><span>${title || ""}</span></div></td><td><div></div></td>`;
        tbody.appendChild(row);
        return row.querySelector("tr > td:nth-child(2) > div");
    }
    createButtonDescTableRow(tbody, btn, desc, needHide = false) {
        let row = document.createElement("tr");
        if (tbody.children.length % 2 == 0) row.className = "even";
        if (needHide && tbody.children.length > 0) row.style.display = 'none'
        row.innerHTML = `<td ${desc ? 'style="width: 23%;"' : ''}><div></div></td><td><div><span>${desc || ""}</span></div></td>`;
        let firstArea = row.querySelector("tr > td:nth-child(1) > div")
        firstArea.appendChild(btn)
        tbody.appendChild(row);
        return row
    }
    createHideButtonRow(tbody) {
        if (tbody.children.length < 2) return
        let row = document.createElement("tr");
        row.innerHTML = `<td><div><a class="s-fc7">展开<i class="u-icn u-icn-69"></i></a></div></td>`;
        let btn = row.querySelector('a')
        btn.addEventListener('click', () => {
            for (let i = 1; i < tbody.children.length - 1; i++) {
                if (tbody.children[i].style.display == 'none') {
                    tbody.children[i].style.display = ''
                }
                else {
                    tbody.children[i].style.display = 'none'
                }
            }
            if (btn.innerHTML.startsWith('展开')) {
                btn.innerHTML = '收起<i class="u-icn u-icn-70"></i>'
            }
            else {
                btn.innerHTML = '展开<i class="u-icn u-icn-69"></i>'
            }
        })
        tbody.appendChild(row);
    }

    createButton(desc) {
        let btn = document.createElement('a');
        btn.text = desc;
        btn.className = "s-fc7"
        btn.style.marginRight = '10px'
        return btn
    }
    createText(desc) {
        let btn = document.createElement('span');
        btn.innerHTML = desc
        btn.style.marginRight = '10px'
        return btn
    }
    createDLRow(desc, level, channel) {
        let btn = this.createButton(levelDesc(level))
        btn.addEventListener('click', () => {
            this.dwonloadSong(channel, level, btn)
        })
        this.createButtonDescTableRow(this.downLoadTableBody, btn, desc, true)
    }
    createULRow(desc, level, channel) {
        if (!unsafeWindow.GUser.userId) return
        let apiUrl = '/api/song/enhance/player/url/v1'
        if (channel == 'dl') apiUrl = '/api/song/enhance/download/url/v1'
        let data = { ids: JSON.stringify([this.songId]), level: level, encodeType: 'mp3' }
        if (channel == 'dl') data = { id: this.songId, level: level, encodeType: 'mp3' }
        let api = { url: apiUrl, data: data }
        let songItem = { api: api, id: this.songId, title: this.title, artist: this.artist, album: this.album }

        let btn = this.createButton(levelDesc(level))
        btn.addEventListener('click', () => {
            let ULobj = new ncmDownUpload([songItem])
            ULobj.startUpload()
        })
        this.createButtonDescTableRow(this.upLoadTableBody, btn, desc, true)
    }
    dwonloadSong(channel, level, dlbtn) {
        let url = '/api/song/enhance/player/url/v1'
        if (channel == 'dl') url = '/api/song/enhance/download/url/v1'
        let data = { ids: JSON.stringify([this.songId]), level: level, encodeType: 'mp3' }
        if (channel == 'dl') data = { id: this.songId, level: level, encodeType: 'mp3' }
        let songItem = {
            id: this.songId,
            title: this.songDetailObj.name,
            artist: this.artist,
            album: this.album,
            song: this.songDetailObj,
            privilege: this.songDetailObj,
            api: { url, data, }
        }
        const config = {
            out: 'artist-title',
            threadCount: 1,
            folder: 'none',
        }
        batchDownloadSongs([songItem], config)
    }
    downloadLyric(lrcKey) {
        saveContentAsFile(this.lyricObj[lrcKey].lyric, this.filename + '.lrc')
    }
}
export let songDetailObj = new SongDetail()