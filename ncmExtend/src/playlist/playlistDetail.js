import { weapiRequest } from "../utils/request"
import { downloadSongBatch } from "./downloadSongBatch"
import { uploadSongBatch } from "./uploadSongBatch"
import { sortSongs } from "./sortSongs"
import { getAlbumTextInSongDetail, getArtistTextInSongDetail, escapeHTML, duringTimeDesc } from "../utils/descHelper"

class PlaylistDetail {
    constructor() {
        this.domReady = false
        this.dataFetched = false
        this.flag = true
        const params = new URLSearchParams(unsafeWindow.location.search)
        this.playlistId = Number(params.get('id'))
        this._hash = params.get('_hash')
        this.playlist = null
        this.playlistSongList = []
        this.playableSongList = []
        this.rowHTMLList = []
    };
    fetchPlaylistFullData(playlistId) {
        weapiRequest("/api/v6/playlist/detail", {
            data: {
                id: playlistId,
                n: 100000,
                s: 8,
            },
            onload: (content) => {
                this.playlist = content.playlist
                if (content.playlist.trackCount > content.playlist.tracks.length) {
                    let trackIds = content.playlist.trackIds.map(item => {
                        return {
                            'id': item.id
                        }
                    })
                    this.getPlaylistAllSongsSub(trackIds, 0)
                }
                else {
                    this.addSongInToSongList(content)
                    this.onFetchDatafinnsh()
                }
            }
        })
    }
    getPlaylistAllSongsSub(trackIds, startIndex) {
        if (startIndex >= trackIds.length) {
            this.onFetchDatafinnsh()
            return
        }
        weapiRequest("/api/v3/song/detail", {
            data: {
                c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1000))
            },
            onload: (content) => {
                this.addSongInToSongList(content)
                this.getPlaylistAllSongsSub(trackIds, startIndex + content.songs.length)
            }
        })
    }
    addSongInToSongList(content) {
        const songs = content.songs || content.playlist.tracks
        const privileges = content.privileges
        const songlen = songs.length
        const privilegelen = privileges.length
        for (let i = 0; i < songlen; i++) {
            for (let j = 0; j < privilegelen; j++) {
                if (songs[i].id == privileges[j].id) {
                    let songItem = {
                        id: songs[i].id,
                        title: songs[i].name,
                        artist: getArtistTextInSongDetail(songs[i]),
                        album: getAlbumTextInSongDetail(songs[i]),
                        song: songs[i],
                        privilege: privileges[j],
                    }
                    this.playlistSongList.push(songItem)
                    break
                }
            }
        }
    }
    onFetchDatafinnsh() {
        this.playlistSongList.forEach((songItem) => {
            this.createFormatAddToData(songItem)
        })
        this.dataFetched = true
        this.checkStartInitBtn()
    }
    createFormatAddToData(songItem) {
        if (songItem.privilege.plLevel != 'none') {
            let addToFormat = {
                album: songItem.song.al,
                alias: songItem.song.alia || songItem.song.ala || [],
                artists: songItem.song.ar || [],
                commentThreadId: "R_SO_4_" + songItem.song.id,
                copyrightId: songItem.song.cp || 0,
                duration: songItem.song.dt || 0,
                id: songItem.song.id,
                mvid: songItem.song.mv || 0,
                name: songItem.song.name || "",
                cd: songItem.song.cd,
                position: songItem.song.no || 0,
                ringtone: songItem.song.rt,
                rtUrl: songItem.song.rtUrl,
                status: songItem.song.st || 0,
                pstatus: songItem.song.pst || 0,
                fee: songItem.song.fee || 0,
                version: songItem.song.v || 0,
                eq: songItem.song.eq,
                songType: songItem.song.t || 0,
                mst: songItem.song.mst,
                score: songItem.song.pop || 0,
                ftype: songItem.song.ftype,
                rtUrls: songItem.song.rtUrls,
                transNames: songItem.song.tns,
                privilege: songItem.song.privilege,
                lyrics: songItem.song.lyrics,
                alg: songItem.song.alg,
                source: {
                    fdata: String(this.playlistId),
                    fid: 13,
                    link: `playlist?id=${this.playlistId}&_hash=songlist-${songItem.song.id}`,
                    title: '歌单',
                },
            }
            this.playableSongList.push(addToFormat)
        }
    }
    onDomReady() {
        this.operationArea = document.querySelector('#content-operation')
        this.songListTextDom = document.querySelector('div.u-title.u-title-1.f-cb > h3 > span')
        this.playCount = document.querySelector('#play-count')
        this.songListTextDom.innerHTML = '获取歌单数据中...'
        this.domReady = true
        this.checkStartInitBtn()
    }
    checkStartInitBtn() {
        if (this.domReady && this.dataFetched && this.flag) {
            this.flag = false
            this.renderPlayAllBtn()
            this.appendBtns()
            this.fillTableSong()
            let playlistTrackCount = document.querySelector('#playlist-track-count')
            if (playlistTrackCount) playlistTrackCount.innerHTML = this.playlistSongList.length
            this.songListTextDom.innerHTML = '歌曲列表'
        }
    }
    renderPlayAllBtn() {
        this.operationArea.innerHTML = `
        <a style="display:none" class="u-btn2 u-btn2-2 u-btni-addply f-fl" hidefocus="true" title="播放"><i><em class="ply"></em>播放全部(${this.playableSongList.length})</i></a>
        <a style="display:none" class="u-btni u-btni-add" hidefocus="true" title="添加到播放列表"></a>
        `+ this.operationArea.innerHTML
        this.operationArea.children[0].addEventListener('click', () => {
            unsafeWindow.top.player.addTo(this.playableSongList, true, true)
            weapiRequest('/api/playlist/update/playcount', {
                data: {
                    id: this.playlistId,
                },
                onload: (content) => {
                    if (content.code == 200) this.playCount.innerHTML = Number(this.playCount.innerHTML) + 1
                },
            })
        })
        this.operationArea.children[1].addEventListener('click', () => {
            unsafeWindow.top.player.addTo(this.playableSongList, false, false)
        })
        this.operationArea.children[0].style.display = ''
        this.operationArea.children[1].style.display = ''
        this.operationArea.children[2].style.display = 'none'
        this.operationArea.children[3].style.display = 'none'
    }
    appendBtns() {
        downloadSongBatch(this.playlistId, this.operationArea)
        uploadSongBatch(this.playlistId, this.operationArea)
        const creatorhomeURL = document.head.querySelector("[property~='music:creator'][content]")?.content
        const creatorId = new URLSearchParams(new URL(creatorhomeURL).search).get('id')
        if (creatorId == unsafeWindow.GUser.userId) {
            sortSongs(this.playlistId, this.operationArea)
        }
    }
    fillTableSong() {
        const timestamp = document.querySelector('.m-table > tbody > tr').id.slice(-13)
        this.playlistSongList.forEach((songItem, index) => {
            this.createRowHTML(songItem, index, timestamp)
        })
        const table = document.querySelector('.m-table')
        if (table) {
            const tableStyles = `
            .m-table .ncmextend-playlist-playbtn {
                display: none;
            }
            .m-table tr:hover .ncmextend-playlist-playbtn {
                display: block;
            }
            .m-table .ncmextend-playlist-playbtn:has(.ply-z-slt) {
                display: block;
            }
            .m-table .ncmextend-playlist-songindex:has(+ div > .ply-z-slt) {
                display: none;
            }
            .m-table .ncmextend-playlist-songindex {
                color: #999;
                float: left;
                margin-left: -8px;
                width: 40px;
                text-align: center;
            }
            .m-table tr:hover .ncmextend-playlist-songindex {
                display: none;
            }
            .m-table .ncmextend-playlist-viponly {
                color: #999;
                float: left;
                margin-left: -8px;
                width: 40px;
                text-align: center;
            }
            .m-table .ncmextend-playlist-songtitle {
                height: 20px;
                margin-right: 20px;
                margin-top: 5px;
                font-size: 16px;
            }
            .m-table .ncmextend-playlist-songartist {
                height: 20px;
                margin-right: 20px;
                margin-top: 5px;
            }
            .m-table .ncmextend-playlist-songalbum {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            `
            GM_addStyle(tableStyles)
            table.className = 'm-table m-table-rank'
            table.innerHTML = `
            <thead><tr>
                <th style="width:40px;"><div class="wp">&nbsp;</div></th>
                <th><div class="wp">歌名/歌手</div></th>
                <th class="w4"><div class="wp af3"></div></th>
                <th style="width:90px;"><div class="wp af1"></div></th>
            </tr></thead>
            <tbody>${this.rowHTMLList.join('')}</tbody>
            `
            //设置当前播放的歌曲
            const playing = unsafeWindow.top.player.getPlaying()
            if (playing.track) {
                const plybtn = document.querySelector(`[id="${playing.track.id}${timestamp}"] > td:nth-child(1) > div > div.ncmextend-playlist-playbtn > span`)
                if (plybtn) {
                    plybtn.className = plybtn.className.trimEnd() + ' ply-z-slt'
                }
            }
            //定位到url中的目标歌曲
            if (/^songlist-(\d+)$/.test(this._hash)) {
                const tr = document.querySelector(`[id="${this._hash.slice(9)}${timestamp}"]`)
                if (tr) tr.scrollIntoView();
            }
            this.deleteMoreInfoUI()
        }
    }
    createRowHTML(songItem, index, timestamp) {
        this.bodyId = document.body.className.replace(/\D/g, "")
        const status = songItem.privilege.st < 0
        const deletable = this.playlist.creator.userId === unsafeWindow.GUser.userId
        const needVIP = songItem.privilege.plLevel == 'none' && !status
        const durationText = duringTimeDesc(songItem.song.dt)
        const artistText = escapeHTML(songItem.artist)
        const annotation = escapeHTML(songItem.song.tns ? songItem.song.tns[0] : null || songItem.song.alias ? songItem.song.alias[0] : '')
        const albumName = escapeHTML(songItem.album)
        const songName = escapeHTML(songItem.title)
        let playBtnHTML = `<span data-res-id="${songItem.id}" data-res-type="18" data-res-action="play" data-res-from="13" data-res-data="${this.playlist.id}" class="ply "></span>`
        if (needVIP) playBtnHTML = `<span class='ncmextend-playlist-viponly'>需要VIP</span>`
        let artistContent = ''
        songItem.song.ar.forEach((ar) => {
            if (ar.name) {
                if (ar.id > 0) artistContent += `<a href="#/artist?id=${ar.id}" hidefocus="true">${escapeHTML(ar.name)}</a>/`
                else artistContent += escapeHTML(ar.name) + '/'
            }
        })
        if (artistContent.length > 0) artistContent = artistContent.slice(0, -1)
        else artistContent = artistText
        let albumContent = albumName
        if (songItem.song.al.id > 0) albumContent = `<a href="#/album?id=${songItem.song.al.id}" title="${albumName}">${albumName}</a>`
        const rowHTML = `
				<tr id="${songItem.id}${timestamp}" class="${index % 2 ? '' : 'even'} ${status ? 'js-dis' : ''}">
					<td>
						<div class="hd ">
                            <div class="ncmextend-playlist-songindex">
                                <span>${index + 1}</span>
                            </div>
                            <div class="ncmextend-playlist-playbtn">
                                ${playBtnHTML}
                            </div>
                        </div>
					</td>
					<td class="rank">
						<div class="f-cb">
							<div class="tt">
                                <a href="#/song?id=${songItem.id}" title="${songName}">
                                    <img class="rpic" src="${songItem.song.al.picUrl}?param=50y50&amp;quality=100">
                                </a>
								<div class="ncmextend-playlist-songtitle">
									<span class="txt" style="max-width: 78%;">
										<a href="#/song?id=${songItem.id}"><b title="${songName}${annotation ? ` - (${annotation})` : ''}"><div class="soil"></div>${songName}</b></a>
										${annotation ? `<span title="${annotation}" class="s-fc8">${annotation ? ` - (${annotation})` : ''}</span>` : ''}
										${songItem.song.mv ? `<a href="#/mv?id=${songItem.song.mv}" title="播放mv" class="mv">MV</a>` : ''}
									</span>
								</div>
                                <div title="${artistText}" class="ncmextend-playlist-songartist">
							        <span title="${artistText}" class="txt" style="max-width: 78%;">
								        ${artistContent}
							        </span>
						        </div>
							</div>
						</div>
					</td>
                    <td>
						<div class="ncmextend-playlist-songalbum">
                            ${albumContent}
						</div>
					</td>
					<td class=" s-fc3">
						<span class="u-dur candel">${durationText}</span>
						<div class="opt hshow">
							<a class="u-icn u-icn-81 icn-add" href="javascript:;" title="添加到播放列表" hidefocus="true" data-res-type="18" data-res-id="${songItem.id}" data-res-action="addto" data-res-from="13" data-res-data="${this.playlist.id}"></a>
							<span data-res-id="${songItem.id}" data-res-type="18" data-res-action="fav" class="icn icn-fav" title="收藏"></span>
							<span data-res-id="${songItem.id}" data-res-type="18" data-res-action="share" data-res-name="${albumName}" data-res-author="${artistText}" data-res-pic="${songItem.song.al.picUrl}" class="icn icn-share" title="分享">分享</span>
							${deletable ? `<span data-res-id="${songItem.id}" data-res-type="18" data-res-from="13" data-res-data="${this.playlist.id}" data-res-action="delete" class="icn icn-del" title="删除">删除</span>` : ''}
						</div>
					</td>
				</tr>
			`
        this.rowHTMLList.push(rowHTML)
    }
    deleteMoreInfoUI() {
        const seeMore = document.querySelector('.m-playlist-see-more')
        if (seeMore) seeMore.parentNode.removeChild(seeMore)
    }
}
export let playlistDetailObj = new PlaylistDetail()