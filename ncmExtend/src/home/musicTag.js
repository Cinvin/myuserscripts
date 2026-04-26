import { showTips, createBigButton, downloadFileSync, sanitizeFilename, escapeHtml, getTableStyles } from "../utils/common"
import { weapiRequest, weapiRequestSync } from "../utils/request"
import { duringTimeDesc, nameFileWithoutExt, dateDesc } from '../utils/descHelper'
import { handleLyric } from "../utils/lyric"
import { MetaFlac } from "../utils/metaflac"
import { detectAudioFormat } from "../utils/file"
export const musicTag = (uiArea) => {
    //音乐标签
    let btnImport = createBigButton('音乐标签', uiArea, 2)
    btnImport.addEventListener('click', openMusicTag)
    function openMusicTag() {
        Swal.fire({
            title: '音乐标签',
            confirmButtonText: '添加元数据',
            showCloseButton: true,
            html: `<div id="my-file">
            <input id='song-file' type="file" accept=".mp3,audio/mpeg,.flac,audio/flac"  aria-label='选择文件' multiple="multiple" class="swal2-file" placeholder="" style="display: flex;">
            </div>
            <div>
            <input class="form-check-input" type="checkbox" value="" id="cb-rename" checked><label class="form-check-label" for="cb-rename">完成时按《歌手 - 歌名》重命名文件</label>
            </div>`,
            footer: `<div>为本地文件添加添加的封面歌词等音乐标签，使得文件上传网易云云盘后，不关联的情况下显示封面以及滚动歌词。</div>
            <div>仅支持MP3/FLAC格式</div>`,
            preConfirm: () => {
                const container = Swal.getHtmlContainer()
                const files = container.querySelector('#song-file').files
                if (files.length == 0) return Swal.showValidationMessage('请选择文件')
                return {
                    files: files,
                    rename: container.querySelector('#cb-rename').checked
                }
            },
        })
            .then((result) => {
                if (result.isConfirmed) {
                    const musicTag = new MusicFile(result.value);
                    musicTag.openFilesDialog()
                }
            })
    }

    class MusicFile {
        constructor(config) {
            this.files = config.files;
            this.rename = config.rename;
            this.fileList = null;
            this.isAutoFillingSong = false;
            this.albumDetailCache = new Map();
        }

        openFilesDialog() {
            let fileList = [];
            Swal.fire({
                width: '980px',
                showCloseButton: true,
                html: `${getTableStyles(['6%', '30%', '6%', '29%', '29%'])}
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>文件名</th><th></th><th>目标歌曲</th><th>歌手</th></tr></thead><tbody></tbody></table>
`,
                didOpen: async () => {
                    const actions = Swal.getActions()
                    const container = Swal.getHtmlContainer()
                    const promises = Array.from(this.files).map(this.getAudioDuration);
                    const results = await Promise.all(promises);
                    if (!this.fileList) {
                        this.fileList = results.map(result => ({
                            file: result.file,
                            fileName: result.file.name,
                            ext: result.file.name.split('.').pop().toLowerCase(),
                            duration: Math.round(result.duration * 1000),
                            mode: 'unfill',
                        }));
                    }

                    actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-auto-fill" style="display: inline-block;">自动填充目标歌曲</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-add-metadata" style="display: inline-block;">添加元数据</button>`

                    this.songListTbody = container.querySelector('tbody');
                    this.refreshSongListTable();

                    const btnAutoFill = actions.querySelector('#btn-auto-fill');
                    btnAutoFill.addEventListener('click', () => {
                        this.autoFillTargetSongs();
                    });

                    const btnAddMetadata = actions.querySelector('#btn-add-metadata');
                    btnAddMetadata.addEventListener('click', () => {
                        if (this.isAutoFillingSong) {
                            showTips('正在自动填充歌曲信息，请稍候...', 1);
                            return
                        }
                        this.handleSongTag();
                    });
                }
            })
        }

        openSongSelectionDialog(file) {
            Swal.fire({
                showCloseButton: true,
                width: '980px',
                html: `${getTableStyles(['6%', '6%', '40%', '40%', '8%'], 'table { height: 400px; }')}
<div><label>关键词/歌曲链接/歌曲ID:<input class="swal2-input" id="search-text" style="width: 400px;" placeholder="关键词/链接/ID"></label><button type="button" class="swal2-confirm swal2-styled" id="btn-search">搜索</button></div>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th></th><th>歌曲标题</th><th>歌手</th><th>时长</th></tr></thead><tbody></tbody></table>
</div>
`,
                footer: `<div>文件时长 ${duringTimeDesc(file.duration)}</div>`,
                didOpen: () => {
                    const container = Swal.getHtmlContainer()
                    const actions = Swal.getActions()
                    actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-unset" style="display: none;">移除设置</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-custom" style="display: inline-block;">自定义标签内容</button>`
                    const tbody = container.querySelector('tbody')
                    const searchText = container.querySelector('#search-text');
                    const btnSearch = container.querySelector('#btn-search');
                    const btnUnset = actions.querySelector('#btn-unset');
                    const btnCustom = actions.querySelector('#btn-custom');

                    if (file.mode !== 'unfill') {
                        btnUnset.style.display = 'inline-block';
                        btnUnset.addEventListener('click', () => {
                            this.unsetSong(file);
                            this.openFilesDialog();
                        });
                    }

                    btnCustom.addEventListener('click', () => {
                        this.openSongCustomDialog(file);
                    });

                    searchText.value = file.fileName.substring(0, file.fileName.lastIndexOf('.'));
                    btnSearch.addEventListener('click', () => {
                        const searchWord = searchText.value.trim();
                        const isSongId = /^[1-9]\d*$/.test(searchWord)
                        let songId = isSongId ? searchWord : ''

                        let URLObj = null
                        if (searchWord.includes('song?')) {
                            try { URLObj = new URL(searchWord) } catch (e) { }
                        }
                        if (URLObj && URLObj.hostname === 'music.163.com') {
                            const urlParamsStr = URLObj.search.length > 0 ? URLObj.search : URLObj.href.slice(URLObj.href.lastIndexOf('?'))
                            songId = new URLSearchParams(urlParamsStr).get('id') || ''
                        }

                        const requestData = {}
                        if (URLObj === null) {
                            requestData["/api/cloudsearch/get/web"] = JSON.stringify({
                                s: searchWord,
                                type: 1,
                                limit: 30,
                                offset: 0,
                                total: true,
                            })
                        }
                        if (songId.length > 0) {
                            requestData["/api/v3/song/detail"] = JSON.stringify({ c: JSON.stringify([{ 'id': songId }]) })
                        }

                        if (requestData["/api/cloudsearch/get/web"] || requestData["/api/v3/song/detail"]) {
                            tbody.innerHTML = '正在搜索...'
                            weapiRequest("/api/batch", {
                                data: requestData,
                                onload: (content) => {
                                    if (content.code !== 200) return
                                    const songDetailContent = content["/api/v3/song/detail"]
                                    const searchContent = content["/api/cloudsearch/get/web"] || { result: { songCount: 0, songs: [] } }
                                    if (songDetailContent && songDetailContent.songs && songDetailContent.songs.length > 0) {
                                        songDetailContent.songs[0].privilege = songDetailContent.privileges[0]
                                        if (searchContent.result.songCount > 0) {
                                            searchContent.result.songs.unshift(songDetailContent.songs[0])
                                        } else {
                                            searchContent.result.songCount = 1
                                            searchContent.result.songs = songDetailContent.songs
                                        }
                                    }

                                    if (searchContent.result.songCount > 0) {
                                        tbody.innerHTML = ''
                                        const timeMatchSongs = []
                                        const timeNoMatchSongs = []
                                        let exactMatchSong = null;
                                        const matchId = (songDetailContent && songDetailContent.songs && songDetailContent.songs.length > 0) ? songDetailContent.songs[0].id : null;
                                        searchContent.result.songs.forEach(resultSong => {
                                            if (matchId && resultSong.id == matchId) {
                                                if (!exactMatchSong) exactMatchSong = resultSong;
                                            } else if (Math.abs(resultSong.dt - file.duration) < 1000)
                                                timeMatchSongs.push(resultSong)
                                            else
                                                timeNoMatchSongs.push(resultSong)
                                        })
                                        const resultSongs = timeMatchSongs.concat(timeNoMatchSongs)
                                        if (exactMatchSong) {
                                            resultSongs.unshift(exactMatchSong);
                                        }
                                        resultSongs.forEach(resultSong => {
                                            let tablerow = document.createElement('tr')
                                            let songName = resultSong.name
                                            const artists = resultSong.ar.map(ar => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${escapeHtml(ar.name)}</a>`).join()
                                            const needHighLight = Math.abs(resultSong.dt - file.duration) < 1000
                                            const dtstyle = needHighLight ? 'color:SpringGreen;' : ''

                                            tablerow.innerHTML = `<td><button type="button" class="swal2-styled selectbtn">选择</button></td><td><a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${escapeHtml(resultSong.al.name)}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${escapeHtml(songName)}</a></td><td>${artists}</td><td style="${dtstyle}">${duringTimeDesc(resultSong.dt)}</td>`
                                            let selectbtn = tablerow.querySelector('.selectbtn')
                                            selectbtn.addEventListener('click', () => {
                                                file.targetSong = resultSong
                                                file.mode = 'netease'
                                                this.openFilesDialog()
                                            })
                                            tbody.appendChild(tablerow)
                                        })
                                    } else {
                                        tbody.innerHTML = '搜索结果为空'
                                    }
                                }
                            })
                        } else {
                            tbody.innerHTML = '无法解析链接'
                        }
                    });
                    btnSearch.click();
                },
                didClose: () => {
                    // 处理模态框关闭事件
                    this.openFilesDialog()
                }
            });
        }

        openSongCustomDialog(file) {
            Swal.fire({
                showCloseButton: true,
                html: `
                <div><label>歌名<input class="swal2-input" id="text-song"></label></div>
                <div><label>歌手<input class="swal2-input" id="text-artist"></label></div>
                <div><label>专辑<input class="swal2-input" id="text-album"></label></div>
                <div><label>封面<input type="file" accept="image/jpeg,image/png" class="swal2-file"  id="text-cover"></label></div>
                <div><label>歌词<textarea id="textarea-lyric" class="swal2-textarea" placeholder="[00:10.000] 第一行..."></textarea></label></div>
                `,
                didOpen: () => {
                    const container = Swal.getHtmlContainer()
                    const actions = Swal.getActions()
                    actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-unset" style="display: none;">移除设置</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-netease" style="display: inline-block;">使用网易云信息</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-confirm" style="display: inline-block;">设置</button>`
                    const songInput = container.querySelector('#text-song')
                    const artistInput = container.querySelector('#text-artist')
                    const albumInput = container.querySelector('#text-album')
                    const coverInput = container.querySelector('#text-cover')
                    const lyricInput = container.querySelector('#textarea-lyric')
                    const btnUnset = actions.querySelector('#btn-unset')
                    const btnNetease = actions.querySelector('#btn-netease')
                    const btnConfirm = actions.querySelector('#btn-confirm')

                    if (file.mode !== 'unfill') {
                        btnUnset.style.display = 'inline-block';
                        btnUnset.addEventListener('click', () => {
                            this.unsetSong(file);
                            this.openFilesDialog();
                        });
                    }

                    if (file.customSong) {
                        songInput.value = file.customSong.name;
                        artistInput.value = file.customSong.artist;
                        albumInput.value = file.customSong.album;
                        if (file.customSong.cover) {
                            const dt = new DataTransfer();
                            dt.items.add(file.customSong.cover.file);
                            coverInput.files = dt.files;
                        }
                        lyricInput.value = file.customSong.lyric;
                    }

                    btnNetease.addEventListener('click', () => {
                        this.openSongSelectionDialog(file)
                    })

                    btnConfirm.addEventListener('click', () => {
                        if (file.customSong?.cover) {
                            URL.revokeObjectURL(file.customSong.cover.url);
                        }
                        file.customSong = {
                            name: songInput.value,
                            artist: artistInput.value,
                            album: albumInput.value,
                            cover: coverInput.files.length > 0 ? { file: new File([coverInput.files[0]], coverInput.files[0].name), url: URL.createObjectURL(coverInput.files[0]) } : null,
                            lyric: lyricInput.value
                        }
                        file.mode = 'custom'
                        this.openFilesDialog()
                    })
                },
                didClose: () => {
                    this.openFilesDialog()
                }
            });
        }

        getAudioDuration(file) {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                const objectUrl = URL.createObjectURL(file);

                audio.addEventListener('loadedmetadata', () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve({
                        duration: audio.duration,
                        file: file
                    });
                });

                audio.addEventListener('error', () => {
                    URL.revokeObjectURL(objectUrl);
                    showTips('无法加载音频文件，请检查文件格式或路径是否正确。', 2)
                    reject(new Error(`无法加载文件: ${file.name}`));
                });

                audio.src = objectUrl;
            });
        }

        refreshSongListTable() {
            this.songListTbody.innerHTML = '';
            this.fileList.forEach(item => {
                let targetSongHtml = '';
                if (item.mode === 'netease' && item.targetSong) {
                    const resultSong = item.targetSong;
                    const artists = resultSong.ar.map(ar => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${escapeHtml(ar.name)}</a>`).join();
                    targetSongHtml = `<td><a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${escapeHtml(resultSong.al.name)}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${escapeHtml(resultSong.name)}</a></td><td>${artists}</td>`;
                } else if (item.mode === 'custom' && item.customSong) {
                    const coverHtml = item.customSong.cover ? `<img src="${item.customSong.cover.url}" height=50 title="${escapeHtml(item.customSong.album)}">` : '';
                    targetSongHtml = `<td>${coverHtml}</td><td>${escapeHtml(item.customSong.name)}</td><td>${escapeHtml(item.customSong.artist)}</td>`;
                } else {
                    targetSongHtml = `<td></td><td>未设置</td><td></td>`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                        <td><button type="button" class="swal2-styled"><i class="fa-solid fa-gear"></i></button></td>
                        <td>${escapeHtml(item.fileName)}</td>
                        ${targetSongHtml}
                    `;
                const selectButton = tr.querySelector('.swal2-styled');
                selectButton.addEventListener('click', () => {
                    if (this.isAutoFillingSong) {
                        showTips('正在自动填充歌曲信息，请稍候...', 1);
                        return
                    }
                    if (item.mode === 'unfill' || item.mode === 'netease') {
                        this.openSongSelectionDialog(item);
                    }
                    else {
                        this.openSongCustomDialog(item);
                    }
                });
                this.songListTbody.appendChild(tr);
            });
        }

        async autoFillTargetSongs() {
            if (this.isAutoFillingSong) return;
            this.isAutoFillingSong = true;
            for (let i = 0; i < this.fileList.length; i++) {
                const file = this.fileList[i];
                if (file.mode === 'unfill') {
                    const searchWord = file.fileName.substring(0, file.fileName.lastIndexOf('.')).normalize('NFC');
                    const response = await weapiRequestSync("/api/cloudsearch/get/web", {
                        data: {
                            s: searchWord,
                            type: 1,
                            limit: 30,
                            offset: 0,
                            total: true,
                        }
                    });
                    if (response && response.code == 200 && response.result.songCount > 0) {
                        for (const resultSong of response.result.songs) {
                            if (Math.abs(resultSong.dt - file.duration) < 1000 && searchWord.toLowerCase().includes(resultSong.name.toLowerCase())) {
                                let songName = resultSong.name
                                const artists = resultSong.ar.map(ar => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${escapeHtml(ar.name)}</a>`).join()
                                file.targetSong = resultSong;
                                file.mode = 'netease';
                                this.refreshSongListTable();
                                break;
                            }
                        }
                    }
                }
                if (i === this.fileList.length - 1) {
                    this.isAutoFillingSong = false;
                }
            }

        }

        unsetSong(file) {
            file.targetSong = null;
            file.customSong = null;
            file.mode = 'unfill';
        }

        async readSongFileBuffer(song) {
            const fileData = new File([song.file], song.file.name, { type: song.file.type })
            const fileBuffer = await fileData.arrayBuffer();
            const fileFormat = detectAudioFormat(fileBuffer)
            if (fileFormat !== 'unknown') {
                song.ext = fileFormat
                return fileBuffer;
            } else {
                song.progressDOM.innerHTML = '不支持该文件格式'
                return null;
            }
        }

        async fetchSongMetadata(song) {
            let title = song.mode === 'netease' ? song.targetSong.name : song.customSong.name;
            let artist = song.mode === 'netease' ? song.targetSong.ar.map(ar => ar.name).join() : song.customSong.artist;
            const album = song.mode === 'netease' ? song.targetSong.al.name : song.customSong.album;
            
            if (this.rename) {
                const nameWithoutExt = nameFileWithoutExt(title, artist, 'artist-title');
                if (nameWithoutExt && nameWithoutExt.length > 0) song.fileName = `${nameWithoutExt}.${song.ext}`;
            }
            if (song.mode === 'netease') {
                artist = song.targetSong.ar.map(ar => ar.name).join('; ');
            }

            let coverBuffer = null;
            let coverFormat = "image/jpeg";
            if (song.mode === 'netease') {
                if (song.targetSong.al.pic > 0) {
                    coverBuffer = await new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "GET",
                            url: song.targetSong.al.picUrl,
                            responseType: "arraybuffer",
                            onload: res => resolve(res.response),
                            onerror: err => reject(err)
                        });
                    });
                    coverBuffer = new Uint8Array(coverBuffer).buffer;
                    song.progressDOM.innerHTML = '已获取图片'
                }
            } else {
                if (song.customSong.cover) {
                    let imgext = song.customSong.cover.file.name.split(".").pop().toLowerCase();
                    if (imgext === "jpg") {
                        imgext = "jpeg";
                    }
                    coverFormat = `image/${imgext}`;
                    coverBuffer = await song.customSong.cover.file.arrayBuffer();
                    coverBuffer = new Uint8Array(coverBuffer).buffer;
                    URL.revokeObjectURL(song.customSong.cover.url);
                }
            }

            let lyricText = '';
            if (song.mode === 'netease') {
                const requestData = {
                    '/api/song/lyric/v1': JSON.stringify({ id: song.targetSong.id, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0, }),
                }
                if (song.targetSong.al.id > 0) {
                    if (this.albumDetailCache[song.targetSong.al.id]) {
                        song.albumDetail = this.albumDetailCache[song.targetSong.al.id]
                    } else {
                        requestData[`/api/v1/album/${song.targetSong.al.id}`] = '{}'
                    }
                }
                const res = await weapiRequestSync('/api/batch', {
                    data: requestData,
                })
                const lyricRes = res['/api/song/lyric/v1'];
                if (lyricRes && !lyricRes.pureMusic) {
                    const LyricObj = handleLyric(lyricRes);
                    if (LyricObj && LyricObj.oritlrc && LyricObj.oritlrc.lyric) {
                        lyricText = LyricObj.oritlrc.lyric;
                        song.progressDOM.innerHTML = '已获取歌词';
                    } else if (LyricObj && LyricObj.orilrc && LyricObj.orilrc.parsedLyric.length > 0) {
                        lyricText = LyricObj.orilrc.lyric;
                        song.progressDOM.innerHTML = '已获取歌词';
                    }
                }

                const albumRes = res[`/api/v1/album/${song.targetSong.al.id}`];
                if (albumRes) {
                    song.albumDetail = {
                        publisher: albumRes.album.company.length > 0 ? albumRes.album.company : null,
                        artists: albumRes.album.artists ? albumRes.album.artists.map(artist => artist.name).join('; ') : null,
                        publishTime: albumRes.album.publishTime > 0 ? dateDesc(albumRes.album.publishTime) : null
                    }
                    this.albumDetailCache[song.targetSong.al.id] = song.albumDetail
                }
            } else {
                lyricText = song.customSong.lyric.trim();
            }

            return { title, artist, album, coverBuffer, coverFormat, lyricText };
        }

        async processMP3Tag(song, fileBuffer, metadata) {
            const { title, artist, album, coverBuffer, coverFormat, lyricText } = metadata;
            const mp3tag = new MP3Tag(fileBuffer);
            mp3tag.read();
            if (mp3tag.error !== ''){
                return `无法解析该文件：${mp3tag.error}`;
            }
            if (!mp3tag.tags || !mp3tag.tags.v2) {
                return '不支持该文件格式';
            }
            mp3tag.tags.title = title;
            mp3tag.tags.artist = artist;
            if (song.mode === 'netease') {
                if (song.targetSong.no && song.targetSong.no > 0) mp3tag.tags.v2.TRCK = String(song.targetSong.no).padStart(2, '0');
                if (song.targetSong.cd && song.targetSong.cd.length > 0) mp3tag.tags.v2.TPOS = song.targetSong.cd;
                if (song.albumDetail) {
                    if (song.albumDetail.publisher) mp3tag.tags.v2.TPUB = song.albumDetail.publisher;
                    if (song.albumDetail.artists) mp3tag.tags.v2.TPE2 = song.albumDetail.artists;
                    if (song.albumDetail.publishTime) mp3tag.tags.v2.TDRC = song.albumDetail.publishTime;
                }
            }
            if (album.length > 0) mp3tag.tags.album = album;
            if (coverBuffer) {
                mp3tag.tags.v2.APIC = [{
                    description: "",
                    data: coverBuffer,
                    type: 3,
                    format: coverFormat,
                }];
            }
            if (lyricText && lyricText.length > 0) {
                mp3tag.tags.v2.TXXX = [{
                    description: "LYRICS",
                    text: lyricText,
                }];
            }
            mp3tag.save();
            if (mp3tag.error) {
                console.error("mp3tag.error", mp3tag.error);
                return `标记时出错：${mp3tag.error}`;
            }
            const blob = new Blob([mp3tag.buffer], { type: "audio/mp3" });
            const url = URL.createObjectURL(blob);
            const downloadRes = await downloadFileSync(url, sanitizeFilename(song.fileName));
            URL.revokeObjectURL(url);
            return downloadRes;
        }

        async processFLACTag(song, fileBuffer, metadata) {
            const { title, artist, album, coverBuffer, coverFormat, lyricText } = metadata;
            const flac = new MetaFlac(fileBuffer);
            flac.removeAllTags();
            flac.removeAllPictures();
            flac.setTag(`TITLE=${title}`);
            flac.setTag(`ARTIST=${artist}`);
            if (song.mode === 'netease') {
                if (song.targetSong.no && song.targetSong.no > 0) flac.setTag(`TRACKNUMBER=${String(song.targetSong.no).padStart(2, '0')}`);
                if (song.targetSong.cd && song.targetSong.cd.length > 0) flac.setTag(`DISCNUMBER=${song.targetSong.cd}`);
                if (song.albumDetail) {
                    if (song.albumDetail.publisher) flac.setTag(`PUBLISHER=${song.albumDetail.publisher}`);
                    if (song.albumDetail.artists) flac.setTag(`ALBUMARTIST=${song.albumDetail.artists}`);
                    if (song.albumDetail.publishTime) flac.setTag(`DATE=${song.albumDetail.publishTime}`);
                }
            }
            if (album.length > 0) flac.setTag(`ALBUM=${album}`);
            if (lyricText.length > 0) flac.setTag(`LYRICS=${lyricText}`);
            if (coverBuffer) await flac.importPictureFromBuffer(coverBuffer, coverFormat);
            const newBuffer = flac.save();
            const blob = new Blob([newBuffer], { type: "audio/flac" });
            const url = URL.createObjectURL(blob);
            const downloadRes = await downloadFileSync(url, sanitizeFilename(song.fileName));
            URL.revokeObjectURL(url);
            return downloadRes;
        }

        handleSongTag() {
            Swal.fire({
                width: '980px',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showCloseButton: false,
                showConfirmButton: false,
                html: `${getTableStyles(['50%', '50%'])}
<table border="1" frame="hsides" rules="rows"><thead><tr><th>文件名</th><th>进度</th></tr></thead><tbody></tbody></table>
`,
                didOpen: async () => {
                    const container = Swal.getHtmlContainer()
                    this.selectedSongs = this.fileList.filter(item => item.mode !== 'unfill');
                    if (this.selectedSongs.length === 0) {
                        this.showFinishBox(0)
                        return;
                    }
                    this.songListTbody = container.querySelector('tbody');
                    this.selectedSongs.forEach(song => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `<td>${escapeHtml(song.fileName)}</td><td>未开始</td>`;
                        this.songListTbody.appendChild(tr);
                        song.progressDOM = tr.querySelector('td:nth-child(2)');
                    });
                    
                    let finishCount = 0;
                    for (const song of this.selectedSongs) {
                        song.progressDOM.innerHTML = '开始处理';
                        const fileBuffer = await this.readSongFileBuffer(song);
                        if (!fileBuffer) continue;

                        const metadata = await this.fetchSongMetadata(song);
                        const downloadRes = song.ext === 'mp3' 
                            ? await this.processMP3Tag(song, fileBuffer, metadata)
                            : await this.processFLACTag(song, fileBuffer, metadata);
                        
                        song.progressDOM.innerHTML = downloadRes;
                        if (downloadRes.endsWith("完成")) {
                            finishCount += 1;
                        }
                    }
                    this.showFinishBox(finishCount)
                },
            })
        }
        showFinishBox(finishCount) {
            Swal.update({
                allowOutsideClick: true,
                allowEscapeKey: true,
                showCloseButton: true,
                showConfirmButton: true,
                html: Swal.getHtmlContainer().innerHTML,
                footer: `已完成。共 ${finishCount} 首文件添加了标签`,
            })
        }
    }
}