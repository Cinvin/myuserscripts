import { weapiRequest } from "../utils/request"
import { getArtistTextInSongDetail, getAlbumTextInSongDetail, duringTimeDesc, nameFileWithoutExt, fileSizeDesc } from "../utils/descHelper"
import { sleep, showTips } from "../utils/common"
import { CheckAPIDataLimit, importAPIDataLimit } from "../components/ncmDownUploadBatch"
import { liveRegex } from "../utils/constant"

// ========== 常量定义 ==========
const API_ENDPOINTS = {
    songDetail: '/api/v3/song/detail',
    uploadCheck: '/api/cloud/upload/check/v2',
    songImport: '/api/cloud/user/song/import',
    songMatch: '/api/cloud/user/song/match',
    tokenAlloc: '/api/nos/token/alloc',
    uploadInfo: '/api/upload/cloud/info/v2',
    cloudPub: '/api/cloud/pub/v2'
}

const UPLOAD_TYPE = {
    needUpload: 1,
    alreadyInCloud: 0,
    cannotUpload: 2
}

const DEFAULT_PIC_URL = 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
const TOKEN_EXPIRE_TIME = 60000
const BATCH_FETCH_SIZE = 1000
const PAGINATION_LIMIT = 50
const MATCH_OFFSET_BASE = 131072

const UI_CLASSES = {
    uploadBtn: '.uploadbtn',
    reuploadBtn: '.reuploadbtn',
    songRemark: '.song-remark',
    filterInput: '#text-filter',
    unmatchCheckbox: '#cb-unmatch',
    copyrightCheckbox: '#cb-copyright',
    freeCheckbox: '#cb-free',
    vipCheckbox: '#cb-vip',
    payCheckbox: '#cb-pay',
    instrumentalCheckbox: '#cb-instrumental',
    liveCheckbox: '#cb-live',
    losslessCheckbox: '#cb-lossless',
    uploadBatchBtn: '#btn-upload-batch'
}

const UPLOAD_MESSAGES = {
    checkResource: '1.检查资源',
    importFile: '2.导入文件',
    submitFile: '3.提交文件',
    encoding: '3.正在转码',
    publishResource: '4.发布资源',
    matchSong: '5.匹配歌曲',
    cannotUpload: '文件无法上传',
    uploadSuccess: '上传成功',
    uploadFail: '上传失败',
    noSongs: '没有需要上传的歌曲',
    batchComplete: '批量上传完成',
    associateFail: '文件关联失败',
    interfaceFail: '接口调用失败，1秒后重试'
}

export class Uploader {
    constructor(config, showAll = false) {
        this.config = config
        this.songs = []
        this.popupObj = null
        this.btnUploadBatch = null
        this.initFilterState()
        this.initPageState()
        this.initBatchUploadState()
    }

    initFilterState() {
        this.filter = {
            text: '',
            unmatch: true,
            noCopyright: true,
            free: true,
            vip: true,
            pay: true,
            instrumental: true,
            live: true,
            lossless: false,
            songIndexs: []
        }
    }

    initPageState() {
        this.page = {
            current: 1,
            max: 1,
            limitCount: PAGINATION_LIMIT
        }
    }

    initBatchUploadState() {
        this.batchUpload = {
            working: false,
            stopFlag: false,
            songIndexs: [],
            checkOffset: 0,
            importOffset: 0,
            matchOffset: 0
        }
    }

    start() {
        this.showPopup()
    }

    showPopup() {
        Swal.fire({
            showCloseButton: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            width: '980px',
            html: this.getPopupHtml(),
            footer: '<div></div>',
            didOpen: () => this.onPopupOpen(),
            willClose: () => { this.batchUpload.stopFlag = true }
        })
    }

    getPopupHtml() {
        const tableStyles = this.getTableStyles()
        const filterCheckboxes = this.getFilterCheckboxesHtml()
        return `<style>${tableStyles}</style>
<input id="text-filter" class="swal2-input" placeholder="过滤：标题/歌手/专辑">
<div id="my-cbs">${filterCheckboxes}</div>
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upload-batch">全部上传</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>备注</th></tr></thead><tbody></tbody></table>`
    }

    getTableStyles() {
        return `
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
    table tbody tr td { border-bottom: none; }
    tr th:nth-child(1), tr td:nth-child(1) { width: 6%; }
    tr th:nth-child(2) { width: 31%; }
    tr td:nth-child(2) { width: 6%; }
    tr td:nth-child(3) { width: 25%; }
    tr th:nth-child(3), tr td:nth-child(4) { width: 25%; }
    tr th:nth-child(4), tr td:nth-child(5) { width: 8%; }
    tr th:nth-child(5), tr td:nth-child(6) { width: 15%; }
    tr th:nth-child(6), tr td:nth-child(7) { width: 15%; }
        `
    }

    getFilterCheckboxesHtml() {
        const filters = [
            { id: 'cb-unmatch', label: '未关联' },
            { id: 'cb-copyright', label: '无版权' },
            { id: 'cb-free', label: '免费' },
            { id: 'cb-vip', label: 'VIP' },
            { id: 'cb-pay', label: '数字专辑' },
            { id: 'cb-instrumental', label: '纯音乐' },
            { id: 'cb-live', label: 'live版' },
            { id: 'cb-lossless', label: '仅显示flac文件', checked: false }
        ]
        return filters.map(f => 
            `<input class="form-check-input" type="checkbox" value="" id="${f.id}" ${f.checked !== false ? 'checked' : ''}><label class="form-check-label" for="${f.id}">${f.label}</label>`
        ).join('')
    }

    onPopupOpen() {
        const container = Swal.getHtmlContainer()
        const footer = Swal.getFooter()
        const tbody = container.querySelector('tbody')
        
        this.popupObj = { container, tbody, footer }
        this.setupFilterListeners(container)
        this.btnUploadBatch = container.querySelector(UI_CLASSES.uploadBatchBtn)
        this.setupBatchUploadListener()
        this.fetchSongInfo()
    }

    setupFilterListeners(container) {
        const filterInput = container.querySelector(UI_CLASSES.filterInput)
        filterInput.addEventListener('change', () => {
            const filtertext = filterInput.value.trim()
            if (this.filter.text !== filtertext) {
                this.filter.text = filtertext
                this.applyFilter()
            }
        })

        const filterMap = [
            { selector: UI_CLASSES.unmatchCheckbox, property: 'unmatch' },
            { selector: UI_CLASSES.copyrightCheckbox, property: 'noCopyright' },
            { selector: UI_CLASSES.freeCheckbox, property: 'free' },
            { selector: UI_CLASSES.vipCheckbox, property: 'vip' },
            { selector: UI_CLASSES.payCheckbox, property: 'pay' },
            { selector: UI_CLASSES.instrumentalCheckbox, property: 'instrumental' },
            { selector: UI_CLASSES.liveCheckbox, property: 'live' },
            { selector: UI_CLASSES.losslessCheckbox, property: 'lossless' }
        ]

        filterMap.forEach(({ selector, property }) => {
            const input = container.querySelector(selector)
            input.addEventListener('change', () => {
                this.filter[property] = input.checked
                this.applyFilter()
            })
        })
    }

    setupBatchUploadListener() {
        this.btnUploadBatch.addEventListener('click', () => {
            if (this.batchUpload.working) {
                this.batchUpload.stopFlag = true
                this.btnUploadBatch.innerHTML = "正在停止"
                return
            }

            const uploadIndexes = this.getUploadableIndexes()
            if (uploadIndexes.length === 0) {
                showTips(UPLOAD_MESSAGES.noSongs, 1)
                return
            }

            this.startBatchUpload(uploadIndexes)
        })
    }

    getUploadableIndexes() {
        const indexes = []
        this.filter.songIndexs.forEach(idx => {
            const song = this.songs[idx]
            if (!song.uploaded && song.uploadType !== UPLOAD_TYPE.alreadyInCloud) {
                indexes.push(idx)
            }
        })
        return indexes
    }

    startBatchUpload(uploadIndexes) {
        this.batchUpload.songIndexs = uploadIndexes
        this.batchUpload.working = true
        this.batchUpload.stopFlag = false
        this.batchUpload.checkOffset = 0
        this.batchUpload.importOffset = 0
        this.batchUpload.matchOffset = 0
        this.btnUploadBatch.innerHTML = "停止"
        this.uploadSongBatch()
    }
    fetchSongInfo() {
        const ids = this.config.data.map(item => ({ id: item.id }))
        this.popupObj.tbody.innerHTML = '<div>正在获取歌曲信息</div><div>并排除已上传的歌曲</div>'
        this.fetchSongInfoSub(ids, 0)
    }

    fetchSongInfoSub(ids, startIndex) {
        if (startIndex >= ids.length) {
            this.onSongInfoFetched()
            return
        }

        this.updateFetchProgress(startIndex, ids.length)
        
        const batchIds = ids.slice(startIndex, startIndex + BATCH_FETCH_SIZE)
        weapiRequest(API_ENDPOINTS.songDetail, {
            data: { c: JSON.stringify(batchIds) },
            onload: (content) => this.onSongDetailResponse(content, ids, startIndex),
            onerror: () => this.fetchSongInfoSub(ids, startIndex)
        })
    }

    updateFetchProgress(startIndex, totalLength) {
        const endIndex = Math.min(totalLength, startIndex + BATCH_FETCH_SIZE)
        this.popupObj.tbody.innerHTML = `<div>正在获取第${startIndex + 1}到${endIndex}首歌曲信息</div><div>并排除已上传的歌曲</div>`
    }

    onSongDetailResponse(content, ids, startIndex) {
        if (content.code !== 200 || !content.songs) {
            setTimeout(() => this.fetchSongInfoSub(ids, startIndex), 1000)
            return
        }

        const songMap = this.buildSongMap(content.songs)
        content.privileges.forEach(privilege => {
            if (!privilege.cs) {
                const config = this.config.data.find(item => item.id === privilege.id)
                const song = this.buildSongItem(privilege, config, songMap)
                this.songs.push(song)
            }
        })

        this.fetchSongInfoSub(ids, startIndex + BATCH_FETCH_SIZE)
    }

    buildSongMap(songs) {
        const map = {}
        songs.forEach(song => {
            map[song.id] = song
        })
        return map
    }

    buildSongItem(privilege, config, songMap) {
        const songId = privilege.id
        const songDetail = songMap[songId]

        const item = {
            id: songId,
            name: '未知',
            album: '未知',
            albumid: 0,
            artists: '未知',
            tns: '',
            dt: duringTimeDesc(0),
            filename: '未知.' + config.ext,
            ext: config.ext,
            md5: config.md5,
            size: config.size,
            bitrate: config.bitrate,
            picUrl: DEFAULT_PIC_URL,
            isNoCopyright: privilege.st < 0,
            isVIP: false,
            isPay: false,
            isLive: config.name ? liveRegex.test(config.name.toLowerCase()) : false,
            isInstrumental: false,
            uploaded: false,
            needMatch: config.name === undefined && songDetail
        }

        if (songDetail) {
            this.enrichSongItemFromDetail(item, songDetail, config)
        }

        if (config.name) {
            item.name = config.name
            item.album = config.al
            item.artists = config.ar
            item.filename = nameFileWithoutExt(item.name, item.artists, 'artist-title') + '.' + config.ext
        }

        return item
    }

    enrichSongItemFromDetail(item, songDetail, config) {
        item.name = songDetail.name || item.name
        item.album = getAlbumTextInSongDetail(songDetail)
        item.albumid = songDetail.al?.id || 0
        item.artists = getArtistTextInSongDetail(songDetail)
        item.tns = songDetail.tns ? songDetail.tns.join() : ''
        item.dt = duringTimeDesc(songDetail.dt || 0)
        item.filename = nameFileWithoutExt(item.name, item.artists, 'artist-title') + '.' + config.ext
        item.picUrl = songDetail.al?.picUrl || DEFAULT_PIC_URL
        item.isVIP = songDetail.fee === 1
        item.isPay = songDetail.fee === 4
        item.isLive = item.name ? liveRegex.test(item.name.toLowerCase()) : false
        item.isInstrumental = (songDetail.mark & MATCH_OFFSET_BASE) === MATCH_OFFSET_BASE 
            || (item.name && item.name.includes('伴奏'))
            || (item.name && item.name.toLowerCase().includes('Instrumental'))
    }

    onSongInfoFetched() {
        if (this.songs.length === 0) {
            this.popupObj.tbody.innerHTML = '没有可以上传的歌曲'
            return
        }

        this.songs.sort((a, b) => {
            if (a.albumid !== b.albumid) {
                return b.albumid - a.albumid
            }
            return a.id - b.id
        })

        this.createTableRows()
        this.applyFilter()
    }

    createTableRows() {
        this.songs.forEach((song, i) => {
            song.tablerow = this.createSingleTableRow(song, i)
        })
    }

    createSingleTableRow(song, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = this.getSongTableRowHtml(song)
        
        const uploadBtn = tr.querySelector(UI_CLASSES.uploadBtn)
        uploadBtn.addEventListener('click', () => {
            if (!this.batchUpload.working) {
                this.uploadSong(index)
            }
        })

        const reuploadBtn = tr.querySelector(UI_CLASSES.reuploadBtn)
        reuploadBtn.addEventListener('click', () => {
            if (!this.batchUpload.working) {
                this.uploadSongWay2Part1(index)
            }
        })

        this.setSongRemarkHtml(tr, song)
        return tr
    }

    getSongTableRowHtml(song) {
        return `<td><button type="button" class="swal2-styled uploadbtn"><i class="fa-solid fa-cloud-arrow-up"></i></button><button type="button" class="swal2-styled reuploadbtn" style="display: none" title="重新上传并关联到此歌曲"><i class="fa-solid fa-repeat"></i></button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${song.dt}</td><td>${fileSizeDesc(song.size)} ${song.ext.toUpperCase()}</td><td class="song-remark"></td>`
    }

    setSongRemarkHtml(tr, song) {
        const remarkElement = tr.querySelector(UI_CLASSES.songRemark)
        if (song.isNoCopyright) {
            remarkElement.innerHTML = '无版权'
        } else if (song.isVIP) {
            remarkElement.innerHTML = 'VIP'
        } else if (song.isPay) {
            remarkElement.innerHTML = '数字专辑'
        }
    }

    applyFilter() {
        this.filter.songIndexs = []
        const { text, unmatch, noCopyright, free, vip, pay, instrumental, live, lossless } = this.filter

        for (let i = 0; i < this.songs.length; i++) {
            const song = this.songs[i]

            // 文本过滤
            if (text.length > 0 && !this.matchesSearchText(song, text)) {
                continue
            }

            // 音质过滤
            if (lossless && song.ext !== 'flac') {
                continue
            }

            // 纯音乐和Live版过滤
            if (!instrumental && song.isInstrumental) continue
            if (!live && song.isLive) continue

            // 歌曲类型过滤
            if (this.matchesSongTypeFilter(song, unmatch, noCopyright, free, vip, pay)) {
                this.filter.songIndexs.push(i)
            }
        }

        this.page.current = 1
        this.page.max = Math.ceil(this.filter.songIndexs.length / this.page.limitCount)
        this.renderData()
        this.renderFilterInfo()
    }

    matchesSearchText(song, searchText) {
        return song.name.includes(searchText) 
            || song.album.includes(searchText) 
            || song.artists.includes(searchText) 
            || song.tns.includes(searchText)
    }

    matchesSongTypeFilter(song, unmatch, noCopyright, free, vip, pay) {
        if (unmatch && !song.needMatch) return true
        if (noCopyright && song.isNoCopyright) return true
        if (free && !song.isVIP && !song.isPay) return true
        if (vip && song.isVIP) return true
        if (pay && song.isPay) return true
        return false
    }
    renderData() {
        if (this.filter.songIndexs.length === 0) {
            this.popupObj.tbody.innerHTML = '空空如也'
            this.popupObj.footer.innerHTML = ''
            return
        }

        this.renderTable()
        this.renderPagination()
    }

    renderTable() {
        this.popupObj.tbody.innerHTML = ''
        const songBegin = (this.page.current - 1) * this.page.limitCount
        const songEnd = Math.min(this.filter.songIndexs.length, songBegin + this.page.limitCount)

        for (let i = songBegin; i < songEnd; i++) {
            this.popupObj.tbody.appendChild(this.songs[this.filter.songIndexs[i]].tablerow)
        }
    }

    renderPagination() {
        const pageIndexs = this.getPageIndexes()
        this.popupObj.footer.innerHTML = ''

        pageIndexs.forEach(pageIndex => {
            const btn = document.createElement('button')
            btn.type = 'button'
            btn.className = 'swal2-styled'
            btn.innerHTML = pageIndex

            if (pageIndex === this.page.current) {
                btn.style.background = 'white'
            } else {
                btn.addEventListener('click', () => {
                    this.page.current = pageIndex
                    this.renderData()
                })
            }

            this.popupObj.footer.appendChild(btn)
        })
    }

    getPageIndexes() {
        const pageIndexs = [1]
        const floor = Math.max(2, this.page.current - 2)
        const ceil = Math.min(this.page.max - 1, this.page.current + 2)

        for (let i = floor; i <= ceil; i++) {
            pageIndexs.push(i)
        }

        if (this.page.max > 1) {
            pageIndexs.push(this.page.max)
        }

        return pageIndexs
    }
    renderFilterInfo() {
        let sizeTotal = 0
        let countCanUpload = 0
        this.filter.songIndexs.forEach(idx => {
            const song = this.songs[idx]
            if (!song.uploaded && song.uploadType !== UPLOAD_TYPE.alreadyInCloud) {
                countCanUpload += 1
                sizeTotal += song.size
            }
        })
        this.btnUploadBatch.innerHTML = '全部上传'
        if (countCanUpload > 0) {
            this.btnUploadBatch.innerHTML += ` (${countCanUpload}首 ${fileSizeDesc(sizeTotal)})`
        }
    }

    setReUploadButtonViewable(songIndex) {
        const song = this.songs[songIndex]
        const uploadBtn = song.tablerow.querySelector(UI_CLASSES.uploadBtn)
        const reuploadBtn = song.tablerow.querySelector(UI_CLASSES.reuploadBtn)
        uploadBtn.style.display = 'none'
        reuploadBtn.style.display = ''
        this.setSongRemark(song, '文件已在云盘但没有关联到目标歌曲，点击按钮重新上传并关联。')
    }

    setSongUploaded(song) {
        song.uploaded = true
        const btnSelector = song.uploadType === UPLOAD_TYPE.alreadyInCloud ? UI_CLASSES.reuploadBtn : UI_CLASSES.uploadBtn
        const btn = song.tablerow.querySelector(btnSelector)
        btn.innerHTML = '<i class="fa-solid fa-check"></i>'
        btn.disabled = true
    }

    setSongRemark(song, remark) {
        const markElement = song.tablerow.querySelector(UI_CLASSES.songRemark)
        if (markElement) {
            markElement.innerHTML = remark
        }
    }
    // ========== 单曲上传相关 ==========
    uploadSong(songIndex) {
        const song = this.songs[songIndex]

        if (song.cloudId) {
            if (song.uploadType === UPLOAD_TYPE.needUpload) {
                this.uploadSongImport(songIndex)
            } else if (song.uploadType === UPLOAD_TYPE.alreadyInCloud) {
                this.uploadSongWay2Part1(songIndex)
            }
            return
        }

        try {
            const songCheckData = [{
                md5: song.md5,
                songId: song.id,
                bitrate: song.bitrate,
                fileSize: song.size
            }]

            weapiRequest(API_ENDPOINTS.uploadCheck, {
                data: {
                    uploadType: 0,
                    songs: JSON.stringify(songCheckData)
                },
                onload: (res) => this.onUploadCheckResponse(res, songIndex),
                onerror: () => this.onUploadFail(songIndex)
            })
        } catch (e) {
            console.error(e)
            this.onUploadFail(songIndex)
        }
    }

    onUploadCheckResponse(res, songIndex) {
        const song = this.songs[songIndex]

        if (res.code !== 200 || res.data.length < 1) {
            if (res.code !== 200) {
                console.error(song.name, UPLOAD_MESSAGES.checkResource, res)
                this.onUploadFail(songIndex)
            } else if (song.id > 0) {
                song.id = 0
                this.uploadSong(songIndex)
            } else {
                console.error(song.name, UPLOAD_MESSAGES.checkResource, res)
                this.onUploadFail(songIndex)
            }
            return
        }

        console.log(song.name, UPLOAD_MESSAGES.checkResource, res)
        song.uploadType = res.data[0].upload

        if (song.uploadType === UPLOAD_TYPE.needUpload) {
            showTips(`(1/3)${song.name} ${UPLOAD_MESSAGES.checkResource}`, 1)
            song.cloudId = res.data[0].songId
            this.uploadSongImport(songIndex)
        } else if (song.uploadType === UPLOAD_TYPE.alreadyInCloud) {
            this.setReUploadButtonViewable(songIndex)
            song.cloudId = res.data[0].songId
            this.onUploadFinish()
        } else {
            console.error(song.name, UPLOAD_MESSAGES.checkResource, res)
            showTips(`(1/3)${song.name} ${UPLOAD_MESSAGES.cannotUpload}`, 2)
            song.uploaded = true
            const btnUpload = song.tablerow.querySelector(UI_CLASSES.uploadBtn)
            btnUpload.innerHTML = '<i class="fa-solid fa-xmark"></i>'
            btnUpload.disabled = true
            this.setSongRemark(song, UPLOAD_MESSAGES.cannotUpload)
            this.onUploadFinish()
        }
    }
    uploadSongImport(songIndex) {
        const song = this.songs[songIndex]

        if (song.cloudSongId) {
            this.uploadSongMatch(songIndex)
            return
        }

        const importSongData = [{
            songId: song.cloudId,
            bitrate: song.bitrate,
            song: song.name,
            artist: song.artists,
            album: song.album,
            fileName: song.filename
        }]

        try {
            weapiRequest(API_ENDPOINTS.songImport, {
                data: {
                    uploadType: 0,
                    songs: JSON.stringify(importSongData)
                },
                onload: (res) => this.onSongImportResponse(res, songIndex),
                onerror: () => this.onUploadFail(songIndex)
            })
        } catch (e) {
            console.error(e)
            this.onUploadFail(songIndex)
        }
    }

    onSongImportResponse(res, songIndex) {
        const song = this.songs[songIndex]

        if (res.code !== 200 || res.data.successSongs.length < 1) {
            console.error(song.name, UPLOAD_MESSAGES.importFile, res)
            this.onUploadFail(songIndex)
            return
        }

        console.log(song.name, UPLOAD_MESSAGES.importFile, res)
        song.cloudSongId = res.data.successSongs[0].song.songId
        this.uploadSongMatch(songIndex)
    }
    uploadSongMatch(songIndex) {
        const song = this.songs[songIndex]

        if (song.cloudSongId === song.id || song.id <= 0) {
            this.onUploadSuccess(songIndex)
            return
        }

        weapiRequest(API_ENDPOINTS.songMatch, {
            data: {
                songId: song.cloudSongId,
                adjustSongId: song.id
            },
            onload: (res) => this.onSongMatchResponse(res, songIndex),
            onerror: () => this.onUploadFail(songIndex)
        })
    }

    onSongMatchResponse(res, songIndex) {
        const song = this.songs[songIndex]

        if (res.code !== 200) {
            console.error(song.name, UPLOAD_MESSAGES.matchSong, res)
            showTips(`${song.name}${UPLOAD_MESSAGES.uploadSuccess}，但是${UPLOAD_MESSAGES.associateFail}`, 2)
            this.setSongUploaded(song)
            this.setSongRemark(song, UPLOAD_MESSAGES.associateFail)
            this.onUploadFinish()
            return
        }

        console.log(song.name, UPLOAD_MESSAGES.matchSong, res)
        this.onUploadSuccess(songIndex)
    }
    uploadSongWay2Part1(songIndex) {
        const song = this.songs[songIndex]

        try {
            weapiRequest(API_ENDPOINTS.tokenAlloc, {
                data: {
                    filename: song.filename,
                    length: song.size,
                    ext: song.ext,
                    type: 'audio',
                    bucket: 'jd-musicrep-privatecloud-audio-public',
                    local: false,
                    nos_product: 3,
                    md5: song.md5
                },
                onload: (tokenRes) => this.onTokenAllocResponse(tokenRes, songIndex),
                onerror: () => this.onUploadFail(songIndex)
            })
        } catch (e) {
            console.error(e)
            this.onUploadFail(songIndex)
        }
    }

    onTokenAllocResponse(tokenRes, songIndex) {
        const song = this.songs[songIndex]
        song.token = tokenRes.result.token
        song.objectKey = tokenRes.result.objectKey
        song.resourceId = tokenRes.result.resourceId
        song.expireTime = Date.now() + TOKEN_EXPIRE_TIME
        console.log(song.name, '2.2.开始上传', tokenRes)
        this.uploadSongWay2Part2(songIndex)
    }

    uploadSongWay2Part2(songIndex) {
        const song = this.songs[songIndex]

        weapiRequest(API_ENDPOINTS.uploadInfo, {
            data: {
                md5: song.md5,
                songid: song.cloudId,
                filename: song.filename,
                song: song.name,
                album: song.album,
                artist: song.artists,
                bitrate: String(song.bitrate || 128),
                resourceId: song.resourceId
            },
            onload: (res3) => this.onUploadInfoResponse(res3, songIndex),
            onerror: () => this.onUploadFail(songIndex)
        })
    }

    onUploadInfoResponse(res3, songIndex) {
        const song = this.songs[songIndex]

        if (res3.code !== 200) {
            if (song.expireTime < Date.now() || (res3.msg && res3.msg.includes('rep create failed'))) {
                console.error(song.name, UPLOAD_MESSAGES.submitFile, res3)
                this.onUploadFail(songIndex)
            } else {
                console.log(song.name, UPLOAD_MESSAGES.encoding, res3)
                sleep(1000).then(() => this.uploadSongWay2Part2(songIndex))
            }
            return
        }

        console.log(song.name, UPLOAD_MESSAGES.submitFile, res3)

        weapiRequest(API_ENDPOINTS.cloudPub, {
            data: { songid: res3.songId },
            onload: (res4) => this.onCloudPublishResponse(res4, songIndex),
            onerror: () => this.onUploadFail(songIndex)
        })
    }

    onCloudPublishResponse(res4, songIndex) {
        const song = this.songs[songIndex]

        if (res4.code !== 200 && res4.code !== 201) {
            console.error(song.name, UPLOAD_MESSAGES.publishResource, res4)
            this.onUploadFail(songIndex)
            return
        }

        console.log(song.name, UPLOAD_MESSAGES.publishResource, res4)
        song.cloudSongId = res4.privateCloud.songId
        this.uploadSongMatch(songIndex)
    }

    onUploadSuccess(songIndex) {
        const song = this.songs[songIndex]
        showTips(`${song.name} - ${song.artists} - ${song.album} ${UPLOAD_MESSAGES.uploadSuccess}`, 1)
        this.setSongUploaded(song)
        this.onUploadFinish()
    }

    onUploadFail(songIndex) {
        const song = this.songs[songIndex]
        showTips(`${song.name} - ${song.artists} - ${song.album} ${UPLOAD_MESSAGES.uploadFail}`, 2)
        this.onUploadFinish()
    }

    onUploadFinish() {
        this.renderFilterInfo()
    }

    // ========== 批量上传相关 ==========
    uploadSongBatch(retry = false) {
        if (this.batchUpload.checkOffset >= this.batchUpload.songIndexs.length) {
            this.onBatchUploadFinish()
            showTips(UPLOAD_MESSAGES.batchComplete, 1)
            return
        }

        if (this.batchUpload.stopFlag) {
            this.onBatchUploadFinish()
            return
        }

        const { songCheckDatas, songMD5IndexMap, endIndex } = this.buildBatchCheckData()

        weapiRequest(API_ENDPOINTS.uploadCheck, {
            data: {
                uploadType: 0,
                songs: JSON.stringify(songCheckDatas)
            },
            onload: (content) => this.onBatchCheckResponse(content, songMD5IndexMap, endIndex, retry),
            onerror: () => this.onBatchCheckError(endIndex, retry)
        })
    }

    buildBatchCheckData() {
        const songMD5IndexMap = {}
        const songCheckDatas = []
        let indexOfSongIndexs = this.batchUpload.checkOffset
        const endIndex = Math.min(this.batchUpload.songIndexs.length, this.batchUpload.checkOffset + CheckAPIDataLimit)

        while (indexOfSongIndexs < endIndex) {
            const songIndex = this.batchUpload.songIndexs[indexOfSongIndexs]
            const song = this.songs[songIndex]
            songCheckDatas.push({
                md5: song.md5,
                songId: song.id,
                bitrate: song.bitrate,
                fileSize: song.size
            })
            songMD5IndexMap[song.md5] = songIndex
            indexOfSongIndexs += 1
        }

        return { songCheckDatas, songMD5IndexMap, endIndex }
    }

    onBatchCheckResponse(content, songMD5IndexMap, endIndex, retry) {
        if (content.code !== 200 || content.data.length === 0) {
            console.error('获取文件云盘ID接口', content)
            if (!retry) {
                showTips(UPLOAD_MESSAGES.interfaceFail, 2)
                sleep(1000).then(() => this.uploadSongBatch(true))
            } else {
                this.batchUpload.checkOffset = endIndex
                this.uploadSongBatch()
            }
            return
        }

        showTips(`获取第 ${this.batchUpload.checkOffset + 1} 到 第 ${endIndex} 首歌曲云盘ID`, 1)
        console.log('获取文件云盘ID接口', content)

        content.data.forEach(fileData => {
            const songIndex = songMD5IndexMap[fileData.md5]
            this.songs[songIndex].uploadType = fileData.upload
            this.songs[songIndex].cloudId = fileData.songId

            if (fileData.upload === UPLOAD_TYPE.alreadyInCloud) {
                this.setReUploadButtonViewable(songIndex)
            } else if (fileData.upload > UPLOAD_TYPE.needUpload) {
                this.songs[songIndex].uploaded = true
                const btnUpload = this.songs[songIndex].tablerow.querySelector(UI_CLASSES.uploadBtn)
                btnUpload.innerHTML = '<i class="fa-solid fa-xmark"></i>'
                this.setSongRemark(this.songs[songIndex], UPLOAD_MESSAGES.cannotUpload)
                btnUpload.disabled = true
            }
        })

        this.batchUpload.checkOffset = endIndex
        this.uploadSongImportBatch()
    }

    onBatchCheckError(endIndex, retry) {
        console.error('获取文件云盘ID接口错误')
        if (!retry) {
            showTips(UPLOAD_MESSAGES.interfaceFail, 2)
            sleep(1000).then(() => this.uploadSongBatch(true))
        } else {
            this.batchUpload.checkOffset = endIndex
            this.uploadSongBatch()
        }
    }

    uploadSongImportBatch(retry = false) {
        if (this.batchUpload.importOffset >= this.batchUpload.checkOffset) {
            this.uploadSongBatch()
            return
        }

        if (this.batchUpload.stopFlag) {
            this.onBatchUploadFinish()
            return
        }

        const { importSongDatas, songCloudIdIndexMap, maxIndex } = this.buildBatchImportData()

        weapiRequest(API_ENDPOINTS.songImport, {
            data: {
                uploadType: 0,
                songs: JSON.stringify(importSongDatas)
            },
            onload: (content) => this.onBatchImportResponse(content, songCloudIdIndexMap, maxIndex, retry),
            onerror: () => this.onBatchImportError(maxIndex, retry)
        })
    }

    buildBatchImportData() {
        const songCloudIdIndexMap = {}
        const importSongDatas = []
        let indexOfSongIndexs = this.batchUpload.importOffset
        const maxIndex = Math.min(this.batchUpload.checkOffset, this.batchUpload.importOffset + importAPIDataLimit)

        while (indexOfSongIndexs < maxIndex) {
            const songIndex = this.batchUpload.songIndexs[indexOfSongIndexs]
            const song = this.songs[songIndex]

            if ('cloudId' in song) {
                importSongDatas.push({
                    songId: song.cloudId,
                    bitrate: song.bitrate,
                    song: song.name,
                    artist: song.artists,
                    album: song.album,
                    fileName: song.filename
                })
                songCloudIdIndexMap[song.cloudId] = songIndex
            }
            indexOfSongIndexs += 1
        }

        return { importSongDatas, songCloudIdIndexMap, maxIndex }
    }

    onBatchImportResponse(content, songCloudIdIndexMap, maxIndex, retry) {
        if (content.code !== 200) {
            console.error('歌曲导入云盘接口', content)
            if (!retry) {
                showTips(UPLOAD_MESSAGES.interfaceFail, 1)
                sleep(1000).then(() => this.uploadSongImportBatch(true))
            } else {
                this.batchUpload.importOffset = maxIndex
                this.uploadSongImportBatch()
            }
            return
        }

        console.log('歌曲导入云盘接口', content)

        if (content.data.successSongs.length > 0) {
            const successSongNames = []
            content.data.successSongs.forEach(successSong => {
                const song = this.songs[songCloudIdIndexMap[successSong.songId]]
                song.cloudSongId = successSong.song.songId
                if (song.cloudSongId === song.id) {
                    this.setSongUploaded(song)
                    successSongNames.push(song.name)
                }
            })
            showTips(`成功上传${successSongNames.length}首:${successSongNames.join('、')}`, 1)
        }

        this.batchUpload.importOffset = maxIndex
        this.uploadSongMatchBatch()
    }

    onBatchImportError(maxIndex, retry) {
        console.error('歌曲导入云盘错误')
        if (!retry) {
            showTips(UPLOAD_MESSAGES.interfaceFail, 1)
            sleep(1000).then(() => this.uploadSongImportBatch(true))
        } else {
            this.batchUpload.importOffset = maxIndex
            this.uploadSongImportBatch()
        }
    }

    uploadSongMatchBatch(retry = false) {
        if (this.batchUpload.matchOffset >= this.batchUpload.importOffset) {
            this.uploadSongImportBatch()
            return
        }

        const songIndex = this.batchUpload.songIndexs[this.batchUpload.matchOffset]
        const song = this.songs[songIndex]

        if (!('cloudSongId' in song) || song.cloudSongId === song.id || song.id <= 0) {
            this.batchUpload.matchOffset += 1
            this.uploadSongMatchBatch()
            return
        }

        weapiRequest(API_ENDPOINTS.songMatch, {
            data: {
                songId: song.cloudSongId,
                adjustSongId: song.id
            },
            onload: (res5) => this.onBatchMatchResponse(res5, songIndex, retry),
            onerror: () => this.onBatchMatchError(songIndex, retry)
        })
    }

    onBatchMatchResponse(res5, songIndex, retry) {
        const song = this.songs[songIndex]

        if (res5.code !== 200) {
            console.error(song.name, UPLOAD_MESSAGES.matchSong, res5)
            if (res5.code === 400 || !retry) {
                showTips(`${song.name}${UPLOAD_MESSAGES.uploadSuccess}，但是${UPLOAD_MESSAGES.associateFail}`, 2)
                this.setSongUploaded(song)
                this.setSongRemark(song, UPLOAD_MESSAGES.associateFail)
                this.batchUpload.matchOffset += 1
                this.uploadSongMatchBatch()
            } else {
                sleep(1000).then(() => this.uploadSongMatchBatch(true))
            }
            return
        }

        console.log(song.name, UPLOAD_MESSAGES.matchSong, res5)
        this.setSongUploaded(song)
        showTips(`成功上传1首歌曲`, 1)
        this.batchUpload.matchOffset += 1
        this.uploadSongMatchBatch()
    }

    onBatchMatchError(songIndex, retry) {
        const song = this.songs[songIndex]
        console.error(song.name, UPLOAD_MESSAGES.matchSong, '网络错误')
        if (!retry) {
            showTips(UPLOAD_MESSAGES.interfaceFail, 1)
            sleep(1000).then(() => this.uploadSongMatchBatch(true))
        } else {
            this.batchUpload.matchOffset += 1
            this.uploadSongMatchBatch()
        }
    }

    onBatchUploadFinish() {
        this.batchUpload.working = false
        this.renderFilterInfo()
    }
}