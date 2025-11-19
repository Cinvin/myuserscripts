import { createBigButton, showTips, showConfirmBox } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { duringTimeDesc, levelDesc, getAlbumTextInSongDetail, getArtistTextInSongDetail } from '../utils/descHelper'
import { levelWeight } from '../utils/constant'
import { unsafeWindow } from "$"
import { ncmDownUpload } from '../components/ncmDownUpload'

export const cloudUpgrade = (uiArea) => {
    //音质升级
    let btnUpgrade = createBigButton('云盘音质提升', uiArea, 2)
    btnUpgrade.addEventListener('click', ShowCloudUpgradePopUp)
    function ShowCloudUpgradePopUp() {
        Swal.fire({
            title: '云盘音质提升',
            input: 'select',
            inputOptions: { lossless: '无损', hires: '高解析度无损' },
            inputPlaceholder: '选择目标音质',
            confirmButtonText: '下一步',
            showCloseButton: true,
            footer: '<div>寻找网易云音源比云盘音质好的歌曲,然后进行删除并重新上传</div><div>⚠️可能会出现删除了歌曲但上传失败的情况</div><div>因此请自行做好备份</div><div>建议先设置好请求头，以避免上传失败但是文件被删除的情况。</div>',
            inputValidator: (value) => {
                if (!value) {
                    return '请选择目标音质'
                }
            },
        })
            .then(result => {
                if (result.isConfirmed) {
                    checkVIPBeforeUpgrade(result.value)
                }
            })
    }
    function checkVIPBeforeUpgrade(level) {
        weapiRequest(`/api/v1/user/detail/${unsafeWindow.GUser.userId}`, {
            onload: (res) => {
                if (res.profile.vipType <= 10) {
                    showConfirmBox('当前不是会员,无法获取无损以上音源,领取个会员礼品卡再来吧。')
                }
                else {
                    let upgrade = new Upgrader(level)
                    upgrade.start()
                }
            }
        })
    }
    class Upgrader {
        constructor(level) {
            this.targetLevel = level
            this.targetWeight = levelWeight[level]
            this.songs = []
            this.page = {
                current: 1,
                max: 1,
                limitCount: 50
            }
            this.filter = {
                text: '',
                songIndexs: []
            }
            this.batchUpgrade = {
                threadMax: 1,
                threadCount: 1,
                working: false,
                stopFlag: false,
                finnishThread: 0,
                songIndexs: []
            }
        };
        start() {
            this.showPopup()
        }

        showPopup() {
            Swal.fire({
                showCloseButton: true,
                showConfirmButton: false,
                width: '980px',
                html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
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
width: 6%;
}
tr th:nth-child(2){
width: 34%;
}
tr td:nth-child(2){
width: 6%;
}
tr td:nth-child(3){
width: 28%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 28%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 16%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 16%;
}
</style>
<input id="text-filter" class="swal2-input" placeholder="过滤：标题/歌手/专辑">
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upgrade-batch">全部提升音质</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>云盘音源</th><th>目标音源</th> </tr></thead><tbody></tbody></table>
`,
                footer: '<div></div>',
                didOpen: () => {
                    let container = Swal.getHtmlContainer()
                    let tbody = container.querySelector('tbody')
                    let footer = Swal.getFooter()
                    this.popupObj = {
                        container: container,
                        tbody: tbody,
                        footer: footer
                    }
                    let filterInput = container.querySelector('#text-filter')
                    filterInput.addEventListener('change', () => {
                        let filtertext = filterInput.value.trim()
                        if (this.filter.text != filtertext) {
                            this.filter.text = filtertext
                            this.applyFilter()
                        }
                    })
                    let upgrader = this
                    this.btnUpgradeBatch = container.querySelector('#btn-upgrade-batch')
                    this.btnUpgradeBatch.addEventListener('click', () => {
                        if (this.batchUpgrade.working) {
                            this.batchUpgrade.stopFlag = true
                            this.btnUpgradeBatch.innerHTML = "正在停止"
                            return
                        }

                        this.batchUpgrade.songIndexs = []
                        this.filter.songIndexs.forEach(idx => {
                            if (!upgrader.songs[idx].upgraded) {
                                upgrader.batchUpgrade.songIndexs.push(idx)
                            }
                        })

                        if (this.batchUpgrade.songIndexs.length == 0) {
                            showTips('没有需要提升的歌曲', 1)
                            return
                        }
                        this.btnUpgradeBatch.innerHTML = "停止"
                        this.batchUpgrade.working = true
                        this.batchUpgrade.stopFlag = false
                        this.batchUpgrade.finnishThread = 0
                        this.batchUpgrade.threadCount = Math.min(this.batchUpgrade.songIndexs.length, this.batchUpgrade.threadMax)
                        for (let i = 0; i < this.batchUpgrade.threadCount; i++) {
                            this.upgradeSong(this.batchUpgrade.songIndexs[i])
                        }
                    })
                    this.fetchSongInfo()
                },
                willClose: () => {
                    this.batchUpgrade.stopFlag = true
                },
            })
        }
        fetchSongInfo() {
            //获取需上传的song
            this.popupObj.tbody.innerHTML = '正在查找云盘歌曲...'
            this.fetchCloudSongInfoSub(0, [])
        }
        fetchCloudSongInfoSub(offset, songIds) {
            let upgrader = this
            weapiRequest('/api/v1/cloud/get', {
                data: {
                    limit: 1000,
                    offset: offset,
                },
                onload: (res) => {
                    //console.log(res)
                    upgrader.popupObj.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1000, res.count)}云盘歌曲`
                    res.data.forEach(song => {
                        if (song.simpleSong.privilege.toast) return
                        if (song.simpleSong.privilege.fee == 0 && song.simpleSong.privilege.flLevel == "none") return
                        if (song.simpleSong.privilege.fee == 4) return
                        if (song.simpleSong.privilege.playMaxBrLevel == "none") return
                        let cloudWeight = levelWeight[song.simpleSong.privilege.plLevel] || 0
                        if (cloudWeight >= this.targetWeight) return
                        songIds.push({ 'id': song.simpleSong.id })
                        upgrader.popupObj.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1000, res.count)}云盘歌曲 找到${songIds.length}首可能有提升的歌曲`
                    })
                    if (res.hasMore) {
                        //if (offset < 2000) {//testing
                        res = {}
                        upgrader.fetchCloudSongInfoSub(offset + 1000, songIds)
                    } else {
                        upgrader.filterTargetLevelSongSub(0, songIds)
                    }
                }
            })
        }
        filterTargetLevelSongSub(offset, songIds) {
            let upgrader = this
            upgrader.popupObj.tbody.innerHTML = `正在确认${songIds.length}首潜在歌曲是否有目标音质`
            if (offset >= songIds.length) {
                upgrader.createTableRow()
                upgrader.applyFilter()
                return
            }
            weapiRequest("/api/v3/song/detail", {
                data: {
                    c: JSON.stringify(songIds.slice(offset, offset + 1000))
                },
                onload: function (content) {
                    let songlen = content.songs.length
                    let privilegelen = content.privileges.length
                    for (let i = 0; i < songlen; i++) {
                        for (let j = 0; j < privilegelen; j++) {
                            if (content.songs[i].id == content.privileges[j].id) {
                                let songItem = {
                                    id: content.songs[i].id,
                                    name: content.songs[i].name,
                                    album: getAlbumTextInSongDetail(content.songs[i]),
                                    albumid: content.songs[i].al.id || 0,
                                    artists: getArtistTextInSongDetail(content.songs[i]),
                                    tns: content.songs[i].tns ? content.songs[i].tns.join() : '', //翻译
                                    dt: duringTimeDesc(content.songs[i].dt || 0),
                                    picUrl: (content.songs[i].al && content.songs[i].al.picUrl) ? content.songs[i].al.picUrl : 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg',
                                    upgraded: false,
                                }
                                let cloudBr = content.songs[i].pc.br
                                if (upgrader.targetLevel == 'lossless' && content.songs[i].sq) {
                                    songItem.fileinfo = { originalLevel: content.privileges[j].plLevel, originalBr: content.songs[i].pc.br, tagetBr: Math.round(content.songs[i].sq.br / 1000) }
                                    if (songItem.fileinfo.originalBr + 10 <= songItem.fileinfo.tagetBr) {
                                        upgrader.songs.push(songItem)
                                    }
                                }
                                else if (upgrader.targetLevel == 'hires' && content.songs[i].hr) {
                                    songItem.fileinfo = { originalLevel: content.privileges[j].plLevel, originalBr: content.songs[i].pc.br, tagetBr: Math.round(content.songs[i].hr.br / 1000) }
                                    if (songItem.fileinfo.originalBr + 10 <= songItem.fileinfo.tagetBr) {
                                        upgrader.songs.push(songItem)
                                    }
                                }
                                break
                            }
                        }


                    }
                    upgrader.filterTargetLevelSongSub(offset + 1000, songIds)
                }
            })
        }
        createTableRow() {
            let tagetLevelDesc = levelDesc(this.targetLevel)
            for (let i = 0; i < this.songs.length; i++) {
                let song = this.songs[i]
                let tablerow = document.createElement('tr')
                tablerow.innerHTML = `<td><button type="button" class="swal2-styled" title="提升"><i class="fa-solid fa-arrow-up"></i></button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${levelDesc(song.fileinfo.originalLevel)} ${song.fileinfo.originalBr}k</td><td>${tagetLevelDesc} ${song.fileinfo.tagetBr}k</td>`
                let btn = tablerow.querySelector('button')
                btn.addEventListener('click', () => {
                    if (this.batchUpgrade.working) {
                        return
                    }
                    this.upgradeSong(i)
                })
                song.tablerow = tablerow
            }
        }
        applyFilter() {
            this.filter.songIndexs = []
            let filterText = this.filter.text
            for (let i = 0; i < this.songs.length; i++) {
                let song = this.songs[i]
                if (filterText.length > 0 && !song.name.includes(filterText) && !song.album.includes(filterText) && !song.artists.includes(filterText) && !song.tns.includes(filterText)) {
                    continue
                }
                this.filter.songIndexs.push(i)
            }
            this.page.current = 1
            this.page.max = Math.ceil(this.filter.songIndexs.length / this.page.limitCount)
            this.renderData()
            this.renderFilterInfo()
        }
        renderData() {
            if (this.filter.songIndexs.length == 0) {
                this.popupObj.tbody.innerHTML = '内容为空'
                this.popupObj.footer.innerHTML = ''
                return
            }
            //table
            this.popupObj.tbody.innerHTML = ''
            let songBegin = (this.page.current - 1) * this.page.limitCount
            let songEnd = Math.min(this.filter.songIndexs.length, songBegin + this.page.limitCount)
            for (let i = songBegin; i < songEnd; i++) {
                this.popupObj.tbody.appendChild(this.songs[this.filter.songIndexs[i]].tablerow)
            }
            //page
            let pageIndexs = [1]
            let floor = Math.max(2, this.page.current - 2);
            let ceil = Math.min(this.page.max - 1, this.page.current + 2);
            for (let i = floor; i <= ceil; i++) {
                pageIndexs.push(i)
            }
            if (this.page.max > 1) {
                pageIndexs.push(this.page.max)
            }
            let upgrader = this
            this.popupObj.footer.innerHTML = ''
            pageIndexs.forEach(pageIndex => {
                let pageBtn = document.createElement('button')
                pageBtn.setAttribute("type", "button")
                pageBtn.className = "swal2-styled"
                pageBtn.innerHTML = pageIndex
                if (pageIndex != upgrader.page.current) {
                    pageBtn.addEventListener('click', () => {
                        upgrader.page.current = pageIndex
                        upgrader.renderData()
                    })
                } else {
                    pageBtn.style.background = 'white'
                }
                upgrader.popupObj.footer.appendChild(pageBtn)
            })
        }
        renderFilterInfo() {
            let sizeTotal = 0
            let countCanUpgrade = 0
            this.filter.songIndexs.forEach(idx => {
                let song = this.songs[idx]
                if (!song.upgraded) {
                    countCanUpgrade += 1
                    sizeTotal += song.size
                }
            })
            this.btnUpgradeBatch.innerHTML = '全部提升'
            if (countCanUpgrade > 0) {
                this.btnUpgradeBatch.innerHTML += ` (${countCanUpgrade}首)`
            }
        }
        upgradeSong(songIndex) {
            let song = this.songs[songIndex]
            let upgrade = this
            try {
                weapiRequest("/api/cloud/del", {
                    data: {
                        songIds: [song.id],
                    },
                    onload: (content) => {
                        console.log(content)
                        if (content.code == 200) {
                            showTips(`${song.name}删除成功`, 1)
                        }
                        let songItem = { api: { url: '/api/song/enhance/player/url/v1', data: { ids: JSON.stringify([song.id]), level: upgrade.targetLevel, encodeType: 'mp3' } }, id: song.id, title: song.name, artist: song.artists, album: song.album, songIndex: songIndex, Upgrader: this }
                        let ULobj = new ncmDownUpload([songItem], false, this.onUpgradeSucess, this.onUpgradeFail)
                        ULobj.startUpload()
                    },
                })
            } catch (e) {
                console.error(e);
                upgrade.onUpgradeFail(songIndex)
            }
        }
        onUpgradeFail(ULsong) {
            let song = ULsong.Upgrader.songs[ULsong.songIndex]
            showTips(`${song.name} 音质提升失败`, 2)
            ULsong.Upgrader.onUpgradeFinnsh(ULsong.songIndex)
        }
        onUpgradeSucess(ULsong) {
            let song = ULsong.Upgrader.songs[ULsong.songIndex]
            showTips(`${song.name} 音质提升成功`, 1)
            song.upgraded = true
            let btnUpgrade = song.tablerow.querySelector('button')
            btnUpgrade.innerHTML = '<i class="fa-solid fa-check"></i>'
            btnUpgrade.disabled = 'disabled'
            ULsong.Upgrader.onUpgradeFinnsh(ULsong.songIndex)
        }
        onUpgradeFinnsh(songIndex) {
            if (this.batchUpgrade.working) {
                let batchSongIdx = this.batchUpgrade.songIndexs.indexOf(songIndex)
                if (!this.batchUpgrade.stopFlag && batchSongIdx + this.batchUpgrade.threadCount < this.batchUpgrade.songIndexs.length) {
                    this.upgradeSong(this.batchUpgrade.songIndexs[batchSongIdx + this.batchUpgrade.threadCount])
                } else {
                    this.batchUpgrade.finnishThread += 1
                    if (this.batchUpgrade.finnishThread == this.batchUpgrade.threadCount) {
                        this.batchUpgrade.working = false
                        this.batchUpgrade.stopFlag = false
                        this.renderFilterInfo()
                        showTips('歌曲提升完成', 1)
                    }
                }
            } else {
                this.renderFilterInfo()
            }
        }
    }
}