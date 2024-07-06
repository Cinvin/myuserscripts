import { showTips, saveContentAsFile, showConfirmBox } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { fileSizeDesc, levelDesc, nameFileWithoutExt } from "../utils/descHelper"
import { handleLyric } from "../utils/lyric"
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
            config.taskCount = songList.length
            config.threadList = threadList
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
            if (config.errorSongs.length > 0) {
                finnshText = `下载完成。以下${config.errorSongs.length}首歌曲下载失败: ${ config.errorSongs.map(song=>`<a href="https://music.163.com/#/song?id=${song.id}">${song.title}</a>`).join()}`
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
                    let fileName = nameFileWithoutExt(song.title, song.artist, config.out).replace('/','／')
                    let fileFullName = fileName + '.' + resData.type.toLowerCase()
                    let folder = ''
                    if (config.folder != 'none' && song.artist.length > 0) {
                        folder = song.artist.replace('/','／') + '/'
                    }
                    if (config.folder == 'artist-album' && song.album.length > 0) {
                        folder += song.album.replace('/','／') + '/'
                    }
                    fileFullName = folder + fileFullName
                    let dlUrl = resData.url
                    levelText.innerHTML = levelDesc(resData.level)
                    sizeText.innerHTML = fileSizeDesc(resData.size)
                    GM_download({
                        url: dlUrl,
                        name: fileFullName,
                        onprogress: function (e) {
                            prText.innerHTML = `${fileSizeDesc(e.loaded)}`
                        },
                        onload: function () {
                            config.finnshCount += 1
                            Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`
                            prText.innerHTML = `完成`
                            if (config.downloadLyric) {
                                downloadSongLyric(song.id, folder + fileName)
                            }
                            downloadSongSub(threadIndex, songList, config)
                        },
                        onerror: function (e) {
                            if (song.retry) {
                                prText.innerHTML = `下载出错`
                                config.errorSongs.push(song)
                            }
                            else {
                                prText.innerHTML = `下载出错\t稍后重试`
                                song.retry = true
                                songList.push(song)
                            }
                            console.error(e,dlUrl,fileFullName)
                            downloadSongSub(threadIndex, songList, config)
                        }
                    });
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
const downloadSongLyric = (songId, fileName) => {
    weapiRequest('/api/song/lyric/v1', {
        data: { id: songId, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0, },
        onload: (content) => {
            const LyricObj = handleLyric(content)
            if (LyricObj.orilrc.parsedLyric.length == 0) return
            const LyricItem = LyricObj.oritlrc || LyricObj.orilrc
            saveContentAsFile(LyricItem.lyric, fileName + '.lrc')
        }
    })
}