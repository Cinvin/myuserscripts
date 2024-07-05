
import { weapiRequest } from "../utils/request"
import { levelDesc, fileSizeDesc, nameFileWithoutExt, getAlbumTextInSongDetail, getArtistTextInSongDetail } from "../utils/descHelper"
import { levelWeight, songMark } from "../utils/constant"
import { handleLyric } from "../utils/lyric"
import { ncmDownUpload } from "../ncmDownUpload"
import { showTips, saveContentAsFile } from "../utils/common"
export class SongDetail {
    constructor(songId, maindDiv) {
        this.songId = songId
        this.maindDiv = maindDiv
    };
    start() {
        weapiRequest("/api/batch", {
            data: {
                '/api/v3/song/detail': JSON.stringify({ c: JSON.stringify([{ 'id': this.songId }]) }),
                '/api/song/music/detail/get': JSON.stringify({ 'songId': this.songId, 'immerseType': 'ste' }),
                '/api/song/red/count': JSON.stringify({ 'songId': this.songId }),
                '/api/song/lyric/v1': JSON.stringify({ id: this.songId, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0, }),
                '/api/song/play/about/block/page': JSON.stringify({ 'songId': this.songId }),
            },
            onload: (res) => {
                //example songid:1914447186
                console.log(res)
                this.title = res["/api/v3/song/detail"].songs[0].name
                this.album = getAlbumTextInSongDetail(res["/api/v3/song/detail"].songs[0])
                this.artist = getArtistTextInSongDetail(res["/api/v3/song/detail"].songs[0])
                this.filename = nameFileWithoutExt(this.title, this.artist, 'artist-title')

                if (res["/api/v3/song/detail"].privileges[0].plLevel != 'none') {
                    this.downLoadBlock = this.createBlock('下载歌曲')
                    let plLevel = res["/api/v3/song/detail"].privileges[0].plLevel
                    let dlLevel = res["/api/v3/song/detail"].privileges[0].dlLevel
                    let songPlWeight = levelWeight[plLevel] || 0
                    let songDlWeight = levelWeight[dlLevel] || 0
                    let songDetail = res["/api/song/music/detail/get"].data
                    if (res["/api/v3/song/detail"].privileges[0].cs) {
                        this.createDLButton(`云盘文件(${levelDesc(plLevel)})`, 'standard', 'pl')
                    }
                    else {
                        this.upLoadBlock = this.createBlock('转存云盘')
                        if (songDetail.l && songPlWeight >= 1) { let desc = `标准(${Math.round(songDetail.l.br / 1000)}k/${fileSizeDesc(songDetail.l.size)})`; let level = 'standard'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.m && songPlWeight >= 2) { let desc = `较高(${Math.round(songDetail.m.br / 1000)}k/${fileSizeDesc(songDetail.m.size)})`; let level = 'higher'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.h && songPlWeight >= 3) { let desc = `极高(${Math.round(songDetail.h.br / 1000)}k/${fileSizeDesc(songDetail.h.size)})`; let level = 'exhigh'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.sq && songPlWeight >= 4) { let desc = `无损(${Math.round(songDetail.sq.br / 1000)}k/${fileSizeDesc(songDetail.sq.size)})`; let level = 'lossless'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.hr && songPlWeight >= 4) { let desc = `Hi-Res(${Math.round(songDetail.hr.br / 1000)}k/${songDetail.hr.sr / 1000}kHz/${fileSizeDesc(songDetail.hr.size)})`; let level = 'hires'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.je && songPlWeight >= 4) { let desc = `高清环绕声(${Math.round(songDetail.je.br / 1000)}k/${songDetail.je.sr / 1000}kHz/${fileSizeDesc(songDetail.je.size)})`; let level = 'jyeffect'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.sk && songPlWeight >= 7) { let desc = `沉浸环绕声(${Math.round(songDetail.sk.br / 1000)}k/${songDetail.sk.sr / 1000}kHz/${fileSizeDesc(songDetail.sk.size)})`; let level = 'sky'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDetail.jm && songPlWeight >= 7) { let desc = `超清母带(${Math.round(songDetail.jm.br / 1000)}k/${songDetail.jm.sr / 1000}kHz/${fileSizeDesc(songDetail.jm.size)})`; let level = 'jymaster'; this.createDLButton(desc, level, 'pl'); this.createULButton(desc, level, 'pl') }
                        if (songDlWeight > songPlWeight && res["/api/v3/song/detail"].privileges[0].fee == 0) {
                            if (songDetail.m && songDlWeight >= 2 && songPlWeight < 2) { let desc = `较高(${Math.round(songDetail.m.br / 1000)}k/${fileSizeDesc(songDetail.m.size)})`; let level = 'higher'; this.createDLButton(desc, level, 'dl'); this.createULButton(desc, level, 'dl') }
                            if (songDetail.h && songDlWeight >= 3 && songPlWeight < 3) { let desc = `极高(${Math.round(songDetail.h.br / 1000)}k/${fileSizeDesc(songDetail.h.size)})`; let level = 'exhigh'; this.createDLButton(desc, level, 'dl'); this.createULButton(desc, level, 'dl') }
                            if (songDetail.sq && songDlWeight >= 4 && songPlWeight < 4) { let desc = `无损(${Math.round(songDetail.sq.br / 1000)}k/${fileSizeDesc(songDetail.sq.size)})`; let level = 'lossless'; this.createDLButton(desc, level, 'dl'); this.createULButton(desc, level, 'dl') }
                            if (songDetail.hr && songDlWeight >= 5 && songPlWeight < 5) { let desc = `Hi-Res(${Math.round(songDetail.hr.br / 1000)}k/${songDetail.hr.sr / 1000}kHz/${fileSizeDesc(songDetail.hr.size)})`; let level = 'hires'; this.createDLButton(desc, level, 'dl'); this.createULButton(desc, level, 'dl') }
                        }
                    }

                }
                //lyric
                this.lyricObj = handleLyric(res["/api/song/lyric/v1"])
                if (this.lyricObj.orilrc.parsedLyric.length > 0) {
                    this.lyricBlock = this.createBlock('下载歌词')
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
                if (res["/api/v3/song/detail"].songs[0].al.picUrl) {
                    let CoverBlock = this.createBlock('')
                    let btn = this.createButton('专辑封面原图')
                    btn.href = res["/api/v3/song/detail"].songs[0].al.picUrl
                    btn.target = '_blank'
                    CoverBlock.appendChild(btn)
                }
                if (res["/api/song/red/count"].data.count > 0) {
                    this.createBlock(`红心数量 ${res["/api/song/red/count"].data.count}`)
                }
                if (res["/api/v3/song/detail"].songs[0].originCoverType > 0) {
                    this.createBlock(`原唱翻唱类型 ${res["/api/v3/song/detail"].songs[0].originCoverType == 1 ? "原唱" : "翻唱"}`)
                }
                //脏标
                if ((res["/api/v3/song/detail"].songs[0].mark & songMark.explicit) == songMark.explicit) {
                    this.createBlock('<b>🅴：</b>内容含有不健康因素')
                }
                //wiki
                for (let block of res["/api/song/play/about/block/page"].data.blocks) {
                    if (block.code == 'SONG_PLAY_ABOUT_MUSIC_MEMORY' && block.creatives.length > 0) {
                        let memoryBlock = this.createBlock('回忆坐标')
                        let info = block.creatives[0].resources
                        let firstTimeP = document.createElement('p');
                        firstTimeP.innerHTML = `第一次听:${info[0].resourceExt.musicFirstListenDto.date}`
                        firstTimeP.style.margin = '5px';
                        memoryBlock.appendChild(firstTimeP)
                        let recordP = document.createElement('p');
                        recordP.innerHTML = `累计播放:${info[1].resourceExt.musicTotalPlayDto.playCount}次 ${info[1].resourceExt.musicTotalPlayDto.duration}分钟 ${info[1].resourceExt.musicTotalPlayDto.text}`
                        recordP.style.margin = '5px';
                        memoryBlock.appendChild(recordP)
                    }
                    if (block.code == 'SONG_PLAY_ABOUT_SONG_BASIC' && block.creatives.length > 0) {
                        for (let creative of block.creatives) {
                            if (creative.creativeType == 'sheet' && creative.resources.length == 0) continue
                            let wikiItemBlock = this.createBlock()
                            if (creative.uiElement) {
                                if (creative.uiElement.mainTitle) {
                                    wikiItemBlock.innerHTML = creative.uiElement.mainTitle.title
                                }
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
        })
    }
    createBlock(innerHTML) {
        let blockDiv = document.createElement('div');
        blockDiv.className = "out s-fc3"
        let blockP = document.createElement('p');
        blockP.innerHTML = innerHTML
        blockDiv.appendChild(blockP)
        this.maindDiv.appendChild(blockDiv)
        return blockP
    }
    createButton(desc) {
        let btn = document.createElement('a');
        btn.text = desc;
        btn.className = "s-fc7"
        btn.style.margin = '5px'
        return btn
    }
    createText(desc) {
        let btn = document.createElement('span');
        btn.innerHTML = desc
        btn.style.margin = '5px'
        return btn
    }
    createDLButton(desc, level, channel) {
        let btn = this.createButton(desc)
        btn.addEventListener('click', () => {
            this.dwonloadSong(channel, level, btn)
        })
        this.downLoadBlock.appendChild(btn)
    }
    createULButton(desc, level, channel) {
        if (!unsafeWindow.GUser.userId) return
        let apiUrl = '/api/song/enhance/player/url/v1'
        if (channel == 'dl') apiUrl = '/api/song/enhance/download/url/v1'
        let data = { ids: JSON.stringify([this.songId]), level: level, encodeType: 'mp3' }
        if (channel == 'dl') data = { id: this.songId, level: level, encodeType: 'mp3' }
        let api = { url: apiUrl, data: data }
        let songItem = { api: api, id: this.songId, title: this.title, artist: this.artist, album: this.album }
        let btn = this.createButton(desc)
        btn.addEventListener('click', () => {
            let ULobj = new ncmDownUpload([songItem])
            ULobj.startUpload()
        })
        this.upLoadBlock.appendChild(btn)
    }
    dwonloadSong(channel, level, dlbtn) {
        let api = '/api/song/enhance/player/url/v1'
        if (channel == 'dl') api = '/api/song/enhance/download/url/v1'
        let data = { ids: JSON.stringify([this.songId]), level: level, encodeType: 'mp3' }
        if (channel == 'dl') data = { id: this.songId, level: level, encodeType: 'mp3' }
        weapiRequest(api, {
            data: data,
            onload: (content) => {
                let resData = content.data[0] || content.data
                if (resData.url != null) {
                    //console.log(content)
                    let fileFullName = this.filename + '.' + resData.type.toLowerCase()
                    let url = resData.url
                    let btntext = dlbtn.text
                    GM_download({
                        url: url,
                        name: fileFullName,
                        onprogress: function (e) {
                            dlbtn.text = btntext + ` 正在下载(${fileSizeDesc(e.loaded)})`
                        },
                        onload: function () {
                            dlbtn.text = btntext
                        },
                        onerror: function (e) {
                            console.error(e)
                            dlbtn.text = btntext + ' 下载失败'
                        }
                    });
                }
                else {
                    showTips('下载失败', 2)
                }
            }
        })
    }
    downloadLyric(lrcKey) {
        saveContentAsFile(this.lyricObj[lrcKey].lyric, this.filename + '.lrc')
    }
}