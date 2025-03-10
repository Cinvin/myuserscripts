import { createBigButton, showTips } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { fileSizeDesc, duringTimeDesc, getAlbumTextInSongDetail, getArtistTextInSongDetail, nameFileWithoutExt } from '../utils/descHelper'
import { ncmDownUpload } from '../components/ncmDownUpload'

export const freeVIPSong = (uiArea) => {
    //限免VIP歌曲
    let btnVIPfreeB = createBigButton('限免VIP歌曲', uiArea, 2)
    btnVIPfreeB.addEventListener('click', VIPfreeB)
    function VIPfreeB() {
        weapiRequest('/api/v6/playlist/detail', {
            data: {
                id: 8402996200,
                n: 100000,
                s: 8,
            },
            onload: (res) => {
                //console.log(res)
                let songList = res.playlist.trackIds.map(item => {
                    return {
                        'id': Number(item.id)
                    }
                })
                openVIPDownLoadPopup(songList, '歌单<a href="https://music.163.com/#/playlist?id=8402996200" target="_blank">「会员雷达」</a>的内容', 22)
            }
        })
    }
    function openVIPDownLoadPopup(songIds, footer, trialMode) {
        Swal.fire({
            title: '限免VIP歌曲',
            showCloseButton: true,
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
width: 16%;
}
tr th:nth-child(2){
width: 48%;
}
tr td:nth-child(2){
width: 10%;
}
tr td:nth-child(3){
width: 38%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 28%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 8%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>大小</th> </tr></thead><tbody></tbody></table>
`,
            footer: footer + '，只有标准(128k)音质<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
            didOpen: () => {
                let container = Swal.getHtmlContainer()
                let footer = Swal.getFooter()
                let tbody = container.querySelector('tbody')
                weapiRequest("/api/v3/song/detail", {
                    data: {
                        c: JSON.stringify(songIds)
                    },
                    onload: function (content) {
                        //console.log(content)
                        let songlen = content.songs.length
                        let privilegelen = content.privileges.length
                        for (let i = 0; i < songlen; i++) {
                            for (let j = 0; j < privilegelen; j++) {
                                if (content.songs[i].id == content.privileges[j].id) {
                                    //生成表格
                                    if (content.privileges[j].cs) {
                                        //移除云盘已存在歌曲
                                        break
                                    }
                                    let songArtist = getArtistTextInSongDetail(content.songs[i])
                                    let songTitle = content.songs[i].name
                                    let filename = nameFileWithoutExt(songTitle, songArtist, 'artist-title')
                                    songArtist = content.songs[i].ar ? content.songs[i].ar.map(ar => `<a target="_blank" href="https://music.163.com/artist?id=${ar.id}">${ar.name}<a>`).join() : ''
                                    let tablerow = document.createElement('tr')
                                    tablerow.innerHTML = `<td><button type="button" class="swal2-styled mydl">下载</button><button type="button" class="swal2-styled myul">上传</button></td><td><a href="https://music.163.com/album?id=${content.songs[i].al.id}" target="_blank"><img src="${content.songs[i].al.picUrl}?param=50y50&quality=100" title="${getAlbumTextInSongDetail(content.songs[i])}"></a></td><td><a href="https://music.163.com/song?id=${content.songs[i].id}" target="_blank">${content.songs[i].name}</a></td><td>${songArtist}</td><td>${duringTimeDesc(content.songs[i].dt || 0)}</td><td>${fileSizeDesc(content.songs[i].l.size)}</td>`
                                    let btnDL = tablerow.querySelector('.mydl')
                                    btnDL.addEventListener('click', () => { TrialDownLoad(content.songs[i].id, trialMode, filename) })
                                    let btnUL = tablerow.querySelector('.myul')
                                    btnUL.addEventListener('click', () => {
                                        let songItem = { api: { url: '/api/song/enhance/player/url/v1', data: { ids: JSON.stringify([content.songs[i].id]), trialMode: trialMode, level: 'exhigh', encodeType: 'mp3' } }, id: content.songs[i].id, title: content.songs[i].name, artist: getArtistTextInSongDetail(content.songs[i]), album: getAlbumTextInSongDetail(content.songs[i]) }
                                        let ULobj = new ncmDownUpload([songItem], false)
                                        ULobj.startUpload()
                                    })
                                    tbody.appendChild(tablerow)
                                    break
                                }
                            }
                        }
                    },
                })
            },
        })
    }
    function TrialDownLoad(songId, trialMode, filename) {
        weapiRequest("/api/song/enhance/player/url/v1", {
            data: {
                immerseType: 'ste',
                trialMode: trialMode,
                ids: JSON.stringify([songId]),
                level: 'exhigh',
                encodeType: 'mp3'
            },
            onload: (content) => {
                //console.log(content)
                if (content.data[0].url != null) {
                    GM_download({
                        url: content.data[0].url,
                        name: filename + '.' + content.data[0].type.toLowerCase(),
                        onload: function () {
                            //
                        },
                        onerror: function (e) {
                            console.error(e)
                            showTips('下载失败', 2)
                        }
                    })
                }
                else {
                    showTips('下载失败', 2)
                }
            }
        })
    }
}