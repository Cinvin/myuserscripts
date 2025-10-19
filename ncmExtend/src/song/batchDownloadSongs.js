import { showTips, saveContentAsFile, showConfirmBox } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { fileSizeDesc, levelDesc, nameFileWithoutExt } from "../utils/descHelper"
import { handleLyric } from "../utils/lyric"
import { MetaFlac } from "../utils/metaflac"

export const batchDownloadSongs = (songList, config) => {
    if (songList.length == 0) {
        showConfirmBox('没有可下载的歌曲')
        return
    }
    Swal.fire({
        title: '批量下载',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        showConfirmButton: false,
        width: 800,
        html: `<style>
table {
width: 100%;
border-spacing: 0px;
border-collapse: collapse;
}
table th, table td {
text-align: left;
text-overflow: ellipsis;
}
table tbody {
display: block;
width: 100%;
max-height: 400px;
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
box-sizing: border-box;
table-layout: fixed;
display: table;
width: 100%;
}
table tbody tr td{
border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 26%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 22%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 22%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 10%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 10%;
}
tr th:nth-child(6),tr td:nth-child(6){
width: 10%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>歌曲标题</th><th>歌手</th><th>专辑</th><th>音质</th><th>大小</th><th>进度</th> </tr></thead><tbody></tbody></table>
`,
        footer: '<div></div>',
        didOpen: () => {
            let container = Swal.getHtmlContainer()
            let tbodyDOM = container.querySelector('tbody')
            let threadList = []
            for (let i = 0; i < config.threadCount; i++) {
                let trDOM = document.createElement('tr')
                tbodyDOM.appendChild(trDOM)
                threadList.push({ tableRowDOM: trDOM, working: true })
            }
            config.finnshCount = 0
            config.errorSongs = []
            config.skipSongs = []
            config.taskCount = songList.length
            config.threadList = threadList
            config.appendMeta = JSON.parse(GM_getValue('downloadSettings', '{"appendMeta":"notAppend"}')).appendMeta
            console.log(config);
            for (let i = 0; i < config.threadCount; i++) {
                downloadSongSub(i, songList, config)
            }
        },
    })
}
const downloadSongSub = (threadIndex, songList, config) => {
    let song = songList.shift()
    let tableRowDOM = config.threadList[threadIndex].tableRowDOM
    if (song == undefined) {
        config.threadList[threadIndex].working = false
        let allFinnsh = true
        for (let i = 0; i < config.threadCount; i++) {
            if (config.threadList[i].working) {
                allFinnsh = false
                break
            }
        }
        if (allFinnsh) {
            let finnshText = '下载完成'
            if (config.skipSongs.length > 0) {
                finnshText += '\n' + `有${config.skipSongs.length}首歌曲不是目标音质，未进行下载。`
            }
            if (config.errorSongs.length > 0) {
                finnshText += '\n' + `以下${config.errorSongs.length}首歌曲下载失败: ${config.errorSongs.map(song => `<a href="https://music.163.com/#/song?id=${song.id}">${song.title}</a>`).join()}`
            }
            Swal.update({
                allowOutsideClick: true,
                allowEscapeKey: true,
                showCloseButton: true,
                showConfirmButton: true,
                html: finnshText,
            })
        }
        return
    }
    tableRowDOM.innerHTML = `<td>${song.title}</td><td>${song.artist}</td><td>${song.album}</td><td class='my-level'></td><td class='my-size'></td><td class='my-pr'></td>`
    let levelText = tableRowDOM.querySelector('.my-level')
    let sizeText = tableRowDOM.querySelector('.my-size')
    let prText = tableRowDOM.querySelector('.my-pr')
    try {
        weapiRequest(song.api.url, {
            data: song.api.data,
            onload: (content) => {
                let resData = content.data[0] || content.data
                if (resData.url != null) {
                    //跳过未到达音质的歌曲
                    if (config.targetLevelOnly && config.level != resData.level) {
                        prText.innerHTML = `跳过下载`
                        config.skipSongs.push(song)
                        downloadSongSub(threadIndex, songList, config)
                        return
                    }
                    song.fileNameWithOutExt = nameFileWithoutExt(song.title, song.artist, config.out).replace('/', '／')
                    let fileFullName = song.fileNameWithOutExt + '.' + resData.type.toLowerCase()
                    let folder = ''
                    if (config.folder != 'none' && song.artist.length > 0) {
                        folder = song.artist.replace('/', '／') + '/'
                    }
                    if (config.folder == 'artist-album' && song.album.length > 0) {
                        folder += song.album.replace('/', '／') + '/'
                    }
                    song.fileFullName = folder + fileFullName
                    song.dlUrl = resData.url
                    song.ext = resData.type.toLowerCase()
                    levelText.innerHTML = levelDesc(resData.level)
                    sizeText.innerHTML = fileSizeDesc(resData.size)

                    song.download = {
                        finnnsh: {
                            music: false,
                            lyric: false,
                            cover: false,
                        },
                        musicFile: null,
                        lyricText: null,
                        coverData: null,
                        prText: prText,
                        appendMeta: config.appendMeta == "allAppend" || (config.appendMeta == "skipCloud" && !song.privilege.cs)
                    }
                    song.download.prText.innerHTML = '正在下载'
                    console.log(song, config);
                    downloadSongFile(song, threadIndex, songList, config)
                    downloadSongCover(song, threadIndex, songList, config)
                    downloadSongLyric(song, threadIndex, songList, config)
                }
                else {
                    showTips(`${song.title}\t无法下载`, 2)
                    prText.innerHTML = `无法下载`
                    config.errorSongs.push(song)
                    downloadSongSub(threadIndex, songList, config)
                }
            },
            onerror: (res) => {
                console.error(res)
                if (song.retry) {
                    prText.innerHTML = `下载出错`
                    config.errorSongs.push(song)
                }
                else {
                    prText.innerHTML = `下载出错\t稍后重试`
                    song.retry = true
                    songList.push(song)
                }
                downloadSongSub(threadIndex, songList, config)
            }
        })
    }
    catch (e) {
        console.error(e);
        if (song.retry) {
            prText.innerHTML = `下载出错`
            config.errorSongs.push(song)
        }
        else {
            prText.innerHTML = `下载出错\t稍后重试`
            song.retry = true
            songList.push(song)
        }
        downloadSongSub(threadIndex, songList, config)
    }
}
const downloadSongFile = (songItem, threadIndex, songList, config) => {
    GM_xmlhttpRequest({
        method: "GET",
        url: songItem.dlUrl,
        responseType: "arraybuffer",
        onload: function (response) {
            console.log(response);
            const uint8 = new Uint8Array(response.response);
            songItem.download.musicFile = uint8.buffer
            songItem.download.finnnsh.music = true
            comcombineFile(songItem, threadIndex, songList, config)
        },
        onprogress: function (progress) {
            songItem.download.prText.innerHTML=fileSizeDesc(progress.loaded)
        },
        onerror: function (error) {
            songItem.download.finnnsh.music = true
            comcombineFile(songItem, threadIndex, songList, config)
        }
    });
}
const downloadSongCover = (songItem, threadIndex, songList, config) => {
    if (!songItem.download.appendMeta) {
        songItem.download.finnnsh.cover = true
        comcombineFile(songItem, threadIndex, songList, config)
        return
    }

    if (songItem.song.al.pic > 0) {
        GM_xmlhttpRequest({
            method: "GET",
            url: songItem.song.al.picUrl,
            responseType: "arraybuffer",
            onload: function (response) {
                const uint8 = new Uint8Array(response.response);
                songItem.download.coverData = uint8.buffer
                songItem.download.finnnsh.cover = true
                comcombineFile(songItem, threadIndex, songList, config)
            },
            onerror: function (error) {
                songItem.download.finnnsh.cover = true
                comcombineFile(songItem, threadIndex, songList, config)
            }
        });
    }
    else {
        songItem.download.finnnsh.cover = true
        comcombineFile(songItem, threadIndex, songList, config)
    }

}
const downloadSongLyric = (songItem, threadIndex, songList, config) => {
    if (!songItem.download.appendMeta && !config.downloadLyric) {
        songItem.download.finnnsh.lyric = true
        comcombineFile(songItem, threadIndex, songList, config)
        return
    }
    weapiRequest('/api/song/lyric/v1', {
        data: { id: songItem.id, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0, },
        onload: (content) => {
            songItem.download.finnnsh.lyric = true
            if (content.pureMusic) comcombineFile(songItem, threadIndex, songList, config)
            const LyricObj = handleLyric(content)
            if (LyricObj.orilrc.parsedLyric.length == 0) comcombineFile(songItem, threadIndex, songList, config)
            const LyricItem = LyricObj.oritlrc || LyricObj.orilrc
            songItem.download.lyricText = LyricItem.lyric
            if(config.downloadLyric && LyricItem.lyric.length > 0){
                saveContentAsFile(LyricItem.lyric, songItem.fileNameWithOutExt + '.lrc')
            }
            comcombineFile(songItem, threadIndex, songList, config)
        }
    })
}
const comcombineFile = async (songItem, threadIndex, songList, config) => {
    if (songItem.download.finnnsh.music && songItem.download.finnnsh.cover && songItem.download.finnnsh.lyric) {
        if (songItem.download.musicFile) {
            console.log(songItem);
            if (songItem.download.appendMeta && (songItem.ext == 'mp3' || songItem.ext == 'flac')) {
                if (songItem.ext == 'mp3') {
                    const mp3tag = new MP3Tag(songItem.download.musicFile);
                    mp3tag.read();
                    mp3tag.tags.title = songItem.title;
                    mp3tag.tags.artist = songItem.artist;
                    if (songItem.album.length > 0) mp3tag.tags.album = songItem.album;
                    if (songItem.download.coverData) {
                        mp3tag.tags.v2.APIC = [{
                            description: "",
                            data: songItem.download.coverData,
                            type: 3,
                            format: "image/jpeg",
                        }];
                    }
                    if (songItem.download.lyricText.length > 0) {
                        mp3tag.tags.v2.TXXX = [{
                            description: "LYRICS",
                            text: songItem.download.lyricText,
                        }];
                    }
                    mp3tag.save();
                    if (mp3tag.error) {
                        console.error("mp3tag.error", mp3tag.error);
                    }
                    const blob = new Blob([mp3tag.buffer], { type: "audio/mp3" });
                    const url = URL.createObjectURL(blob);

                    GM_download({
                        url: url,
                        name: songItem.fileFullName,
                        onload: function () {
                            config.finnshCount += 1
                            Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`
                            songItem.download.prText.innerHTML = `完成`
                            downloadSongSub(threadIndex, songList, config)
                        }
                    });
                }
                else if (songItem.ext == 'flac') {
                    const flac = new MetaFlac(songItem.download.musicFile);
                    flac.removeAllTags();
                    flac.setTag(`TITLE=${songItem.title}`);
                    flac.setTag(`ARTIST=${songItem.artist}`);
                    if (songItem.album.length > 0) flac.setTag(`ALBUM=${songItem.album}`);
                    if (songItem.download.lyricText.length > 0) flac.setTag(`LYRICS=${songItem.download.lyricText}`);
                    if (songItem.download.coverData) await flac.importPictureFromBuffer(songItem.download.coverData, "image/jpeg");
                    const newBuffer = flac.save();
                    const blob = new Blob([newBuffer], { type: "audio/flac" });
                    const url = URL.createObjectURL(blob);
                    GM_download({
                        url: url,
                        name: songItem.fileFullName,
                        onload: function () {
                            config.finnshCount += 1
                            Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`
                            songItem.download.prText.innerHTML = `完成`
                            downloadSongSub(threadIndex, songList, config)
                        }
                    });
                }
            }
            else {
                const blob = new Blob([songItem.download.musicFile], { type: `audio/${songItem.ext}` });
                const url = URL.createObjectURL(blob);
                GM_download({
                    url: url,
                    name: songItem.fileFullName,
                    onload: function () {
                        config.finnshCount += 1
                        Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`
                        songItem.download.prText.innerHTML = `完成`
                        downloadSongSub(threadIndex, songList, config)
                    }
                });
            }
        }
        else {
            songItem.download.prText.innerHTML = `下载失败`
            downloadSongSub(threadIndex, songList, config)
        }
    }
}