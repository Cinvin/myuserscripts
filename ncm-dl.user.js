// ==UserScript==
// @name			网易云:云盘歌曲快传(含周杰伦)|云盘匹配纠正|听歌量打卡|音乐歌词乐谱下载
// @description		个人主页:云盘歌曲快传、云盘匹配纠正、300首听歌量打卡、云盘导入导出，歌曲页:音乐、歌词、乐谱下载
// @namespace		https://github.com/Cinvin/myuserscripts
// @version			2.1.0
// @author			cinvin
// @license			MIT
// @match			https://music.163.com/*
// @icon			data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALiSURBVHgBpVZLThtBEH3d40WkIGWWSSDSGMw6cAP7BBlOgDkB5gSYE2BOgDlBnBNgToCzDmQmii0iZYEXsRRBPJ1X6R4+Mz3IKLVxT1f1q9/rais8IQmiCLjZNlBNA8O1iqzGpAoqNcAnjfmgjh9pFYbyA7+ODIJjAjSxmPTp6MDnSJfBV3YzBOfPABdp88zpBd7ERcWjDC7xdp9bXfyXZHtruOqVHNjITW8RCGZ3xOSHClnITwaF6KFeQ7XqGA/tGrbmBO9W4E0tIFL33W9g0gmQpWuY9A30XvEAsT4mCMM7B3MEXf6EZUN8ZvM2BVAY47bPyK6QuvNLLCcGWdcTFPVLnX8OJHrWadsHXsOsKeuvWD6lza7ThHWkzEqJw4gRvodXzK5kodn92KNNa5hz/0Uo7BBGicOMtc0b2MA4ZnZ17h34HUgWL9uakX3wKIfCaVe6yDqcNWv4NUrINIkswfKGGK5j3K1yItkp1vEahfpr3GwCwZTRJ25rRxoqNbdlUS2gNspwe02Qdh2TEymj5+6MNDzNreMnDwfNe4ezwQXexS4bksLE0geOC9qhJxkR/ASeMmlUS1ilCIBXdmWm1m5pg/0Y+mzFQVrclIhY11H+zWbFDXwfkDlHjHrAHA7svMKGzWheFcxUmpwWdwWwxhqLgds6FEAyp7OK8Rbwm/3R+3BZBjCjP6hFRRxO4G96DnVWVMi9kBpzmbND6JpII8meYwbAZqu20/WFcQqmXcZRA2Vv5e01SmKH1hesdDXMPjzCQDiPZlvuviRFvdwTbdmAYfm4PpTxKzwXQ2EJ7UbusWE/sq1VTFr5ZfT4d5khH3bBOfzMqXxMeC/a/Dn0nEt5pnXnwBl3nLFXJEsZF7IWmnIdVwQEya6Bq4E7dy9P1XtRoeO9dUzKD04uLpM7Cj5DOGGznTzyXEo3mTOnJ29AxdWvkr59Nx6Di6inTrnmxzJx3a11WT382zIjW6bTKoy/H+Iy6oHlZ+kAAAAASUVORK5CYII=
// @grant			GM_xmlhttpRequest
// @grant			GM_download
// @grant			unsafeWindow
// @require			https://fastly.jsdelivr.net/npm/sweetalert2@11.7.10
// ==/UserScript==

(function() {
	'use strict';

	function getcookie(key) {
		var cookies = document.cookie,
			text = "\\b" + key + "=",
			find = cookies.search(text);
		if (find < 0) {
			return ""
		}
		find += text.length - 2;
		var index = cookies.indexOf(";", find);
		if (index < 0) {
			index = cookies.length
		}
		return cookies.substring(find, index) || ""
	};

	function weapiRequest(url, config) {
		let data = config.data || {}
		data.csrf_token = getcookie("__csrf");
		url = url.replace("api", "weapi");
		config.method = "post";
		config.cookie = 'os=pc;appver=2.9.7'
		delete config.query
		config.headers = {
			"content-type": "application/x-www-form-urlencoded",
		}
		var encRes = unsafeWindow.asrsea(
			JSON.stringify(data),
			"010001",
			"00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7",
			"0CoJUm6Qyw8W8jud");
		config.data = `params=${ encodeURIComponent(encRes.encText) }&encSecKey=${ encodeURIComponent(encRes.encSecKey) }`
		config.url = url + `?csrf_token=${data.csrf_token}`
		//console.log(config)
		GM_xmlhttpRequest(config)
	}

	function showConfirmBox(msg) {
		Swal.fire({
			title: '提示',
			text: msg,
			confirmButtonText: '确定',
		})
	}

	function showTips(tip, type) {
		//type:1 √ 2:!
		unsafeWindow.g_showTipCard({
			tip: tip,
			type: type
		})
	}

	function fileSizeDesc(fileSize) {
		if (fileSize < 1024) {
			return fileSize + 'B'
		} else if (fileSize >= 1024 && fileSize < Math.pow(1024, 2)) {
			return (fileSize / 1024)
				.toFixed(1)
				.toString() + 'K'
		} else if (fileSize >= Math.pow(1024, 2) && fileSize < Math.pow(1024, 3)) {
			return (fileSize / Math.pow(1024, 2))
				.toFixed(1)
				.toString() + 'M';
		} else if (fileSize > Math.pow(1024, 3) && fileSize < Math.pow(1024, 4)) {
			return (fileSize / Math.pow(1024, 3))
				.toFixed(2)
				.toString() + 'G';
		} else if (fileSize > Math.pow(1024, 4)) {
			return (fileSize / Math.pow(1024, 4))
				.toFixed(2)
				.toString() + 'T';
		}
	};

	function duringTimeDesc(dt) {
		let secondTotal = Math.round(dt / 1000)
		let min = Math.floor(secondTotal / 60)
		let sec = secondTotal % 60
		return min.toString()
			.padStart(2, '0') + ':' + sec.toString()
			.padStart(2, '0')
	};

	function levelDesc(level) {
		switch (level) {
			case 'standard':
				return '标准'
			case 'higher':
				return '较高'
			case 'exhigh':
				return '极高'
			case 'lossless':
				return '无损'
			case 'hires':
				return 'Hi-Res'
			case 'jyeffect':
				return '鲸云臻音'
			case 'jymaster':
				return '鲸云母带'
			default:
				return level
		}
	};

	//歌曲页
	if (location.href.includes('song')) {
		let cvrwrap = document.querySelector(".cvrwrap")
		if (cvrwrap) {
			let songId = Number(location.href.match(/\d+$/g));
			let songTitle = document.head.querySelector("[property~='og:title'][content]")
				.content;
			let songArtist = document.head.querySelector("[property~='og:music:artist'][content]")
				.content; //split by /
			let songAlbum = document.head.querySelector("[property~='og:music:album'][content]")
				.content;
			//songdownload
			let songDownloadDiv = document.createElement('div');
			songDownloadDiv.className = "out s-fc3"
			let songDownloadP = document.createElement('p');
			songDownloadP.innerHTML = '歌曲下载:';
			songDownloadDiv.style.display = "none"
			songDownloadDiv.appendChild(songDownloadP)
			cvrwrap.appendChild(songDownloadDiv)

			//lyricDownload
			let lrcDownloadDiv = document.createElement('div');
			lrcDownloadDiv.className = "out s-fc3"
			let lrcDownloadP = document.createElement('p');
			lrcDownloadP.innerHTML = '歌词下载:';
			lrcDownloadDiv.style.display = "none"
			lrcDownloadDiv.appendChild(lrcDownloadP)
			cvrwrap.appendChild(lrcDownloadDiv)
			let lyricObj = {}

			//sheetDownload
			let sheetDownloadDiv = document.createElement('div');
			sheetDownloadDiv.className = "out s-fc3"
			let sheetDownloadP = document.createElement('p');
			sheetDownloadP.innerHTML = '乐谱下载:';
			sheetDownloadDiv.style.display = "none"
			sheetDownloadDiv.appendChild(sheetDownloadP)
			cvrwrap.appendChild(sheetDownloadDiv)

			//wikiMemory
			let wikiMemoryDiv = document.createElement('div');
			wikiMemoryDiv.className = "out s-fc3"
			let wikiMemoryP = document.createElement('p');
			wikiMemoryP.innerHTML = '回忆坐标:';
			wikiMemoryDiv.style.display = "none"
			wikiMemoryDiv.appendChild(wikiMemoryP)
			cvrwrap.appendChild(wikiMemoryDiv)


			//songDownload
			class SongFetch {
				constructor(songId, title, artists, album) {
					this.songId = songId;
					this.title = title;
					this.artists = artists
					this.album = album
				};
				getNCMSource() {
					weapiRequest("/api/v3/song/detail", {
						type: "json",
						data: {
							c: JSON.stringify([{
								'id': songId
							}]),
						},
						onload: (responses) => {
							let songdetail = JSON.parse(responses.response);
							//console.log(songdetail)
							if (songdetail.privileges[0].cs) {
								songDownloadP.innerHTML = '歌曲下载(云盘版本):'
							}
							if (songdetail.privileges[0].plLevel != "none") {
								weapiRequest("/api/song/enhance/player/url/v1", {
									type: "json",
									data: {
										ids: JSON.stringify([songId]),
										level: songdetail.privileges[0].plLevel,
										encodeType: 'flac'
									},
									onload: (responses) => {
										let content = JSON.parse(responses.response);
										if (content.data[0].url != null) {
											//console.log(content)
											let config = {
												filename: songArtist + '-' + songTitle + '.' + content.data[0].type.toLowerCase(),
												url: content.data[0].url,
												size: content.data[0].size,
												desc: levelDesc(songdetail.privileges[0].plLevel)
											}
											if (songdetail.privileges[0].dlLevel != "none" && songdetail.privileges[0].plLevel != songdetail.privileges[0].dlLevel) {
												config.desc = `试听版本(${config.desc})`
											}
											this.createButton(config)
										}
									}
								})
							}
							//example songid:1914447186
							if (songdetail.privileges[0].dlLevel != "none" && songdetail.privileges[0].plLevel != songdetail.privileges[0].dlLevel && unsafeWindow.GUser.userType == 0) {
								weapiRequest("/api/song/enhance/download/url/v1", {
									type: "json",
									data: {
										id: songId,
										level: songdetail.privileges[0].dlLevel,
										encodeType: 'mp3'
									},
									onload: (responses) => {
										let content = JSON.parse(responses.response)
										if (content.data.url != null) {
											//console.log(content)
											let config = {
												filename: songArtist + '-' + songTitle + '.' + content.data.type.toLowerCase(),
												url: content.data.url,
												size: content.data.size,
												desc: `下载版本(${levelDesc(songdetail.privileges[0].dlLevel)})`
											}
											this.createButton(config)
										}
									}
								})
							}
						}
					})
				};

				createButton(config) {
					let btn = document.createElement('a');
					btn.text = config.desc;
					btn.className = "des s-fc7"
					btn.style.margin = '2px';
					btn.addEventListener('click', () => {
						dwonloadSong(config.url, config.filename, btn)
					})
					songDownloadP.appendChild(btn)
					songDownloadDiv.style.display = "inline"
				};
			}

			let songFetch = new SongFetch(songId, songTitle, songArtist, songAlbum)

			//wyy可播放
			if (!document.querySelector(".u-btni-play-dis")) {
				songFetch.getNCMSource()
			}

			//lyric
			weapiRequest("/api/song/lyric", {
				type: "json",
				data: {
					id: songId,
					tv: -1,
					lv: -1,
					rv: -1,
					kv: -1,
				},
				onload: function(responses) {
					let content = JSON.parse(responses.response)
					lyricObj = content
					let lrc = document.createElement('a');
					lrc.text = '下载';
					lrc.className = "des s-fc7"
					lrc.style.margin = '2px';
					lrc.addEventListener('click', () => {
						downloadLyric('lrc', songTitle)
					})
					lrcDownloadP.appendChild(lrc)
					lrcDownloadDiv.style.display = "inline"
				},
			});

			//sheet
			weapiRequest("/api/music/sheet/list/v1", {
				type: "json",
				data: {
					id: songId,
					abTest: 'b',
				},
				onload: (responses) => {
					//console.log(content)
					let content = JSON.parse(responses.response)
					if (content.data.errorCode == null) {
						content.data.musicSheetSimpleInfoVOS.forEach(item => {
							let texts = [item.name, item.playVersion, item.musicKey + "调"]
							if (item.difficulty.length > 0) {
								texts.push("难度" + item.difficulty)
							}
							if (item.chordName.length > 0) {
								texts.push(item.chordName + "和弦")
							}
							if (item.bpm > 0) {
								texts.push(item.bpm + "bpm")
							}
							texts.push(item.totalPageSize + "页")

							let btn = document.createElement('a');
							btn.text = texts.join("-");
							btn.className = "des s-fc7"
							btn.style.margin = '5px';
							btn.addEventListener('click', () => {
								dwonloadSheet(item.id, `${songTitle}-${item.name}-${item.playVersion}`)
							})
							sheetDownloadP.appendChild(btn)
							sheetDownloadDiv.style.display = "inline"
						})
					}
				}
			})

			//wiki
			weapiRequest("/api/song/play/about/block/page", {
				type: "json",
				data: {
					songId: songId,
				},
				onload: function(responses) {
					//console.log(content)
					let content = JSON.parse(responses.response)
					if (content.data.blocks[0].creatives.length > 0) {
						content.data.blocks.forEach(block => {
							if (block.code == 'SONG_PLAY_ABOUT_MUSIC_MEMORY' && block.creatives.length > 0) {
								let info = block.creatives[0].resources
								let firstTimeP = document.createElement('p');
								firstTimeP.innerHTML = `第一次听:${info[0].resourceExt.musicFirstListenDto.date}`;
								firstTimeP.className = "des s-fc3"
								firstTimeP.style.margin = '5px';
								wikiMemoryP.appendChild(firstTimeP)
								let recordP = document.createElement('p');
								recordP.innerHTML = `累计播放:${info[1].resourceExt.musicTotalPlayDto.playCount}次 ${info[1].resourceExt.musicTotalPlayDto.duration}分钟 ${info[1].resourceExt.musicTotalPlayDto.text}`;
								recordP.className = "des s-fc3"
								recordP.style.margin = '5px';
								wikiMemoryP.appendChild(recordP)
								wikiMemoryDiv.style.display = "inline"
							}
						})
					}
				},
			});

			function downloadLyric(type, songTitle) {
				let content = lyricObj.lrc.lyric
				let lrc = document.createElement('a');
				let data = new Blob([content], {
					type: 'type/plain'
				})
				let fileurl = URL.createObjectURL(data)
				lrc.href = fileurl
				lrc.download = songTitle + '.lrc'
				lrc.click()
				URL.revokeObjectURL(data);
			}
		}

		function dwonloadSong(url, fileName, dlbtn) {
			let btntext = dlbtn.text
			GM_download({
				url: url,
				name: fileName,
				onprogress: function(e) {
					dlbtn.text = btntext + ` 正在下载(${Math.round(e.loaded/e.totalSize*10000)/100}%)`
				},
				onload: function() {
					dlbtn.text = btntext
				},
				onerror: function() {
					dlbtn.text = btntext + ' 下载失败'
				}
			});
		}

		function dwonloadSheet(sheetId, desc) {
			//console.log(sheetId,desc)
			weapiRequest("/api//music/sheet/preview/info", {
				type: "json",
				data: {
					id: sheetId,
				},
				onload: (responses) => {
					//console.log(content)
					let content = JSON.parse(responses.response)
					content.data.forEach(sheetPage => {
						let fileName = `${desc}-${sheetPage.pageNumber}.jpg`
						GM_download({
							url: sheetPage.url,
							name: fileName,
						});
					})
				}
			})
		}
	}

	//个人主页
	if (location.href.includes('user')) {
		let urlUserId = Number(location.href.match(/\d+$/g));
		let editArea = document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
		if (editArea && urlUserId == unsafeWindow.GUser.userId) {
			//歌曲快传
			let btnUpload = document.createElement('a')
			btnUpload.id = 'cloudBtn'
			btnUpload.className = 'u-btn2 u-btn2-1'
			let btnUploadDesc = document.createElement('i')
			btnUploadDesc.innerHTML = '加载中'
			btnUpload.appendChild(btnUploadDesc)
			btnUpload.setAttribute("hidefocus", "true");
			btnUpload.style.marginRight = '10px';
			editArea.insertBefore(btnUpload, editArea.lastChild)
			var toplist = []
			var selectOptions = {
				"热门": {},
				"华语男歌手": {},
				"华语女歌手": {},
				"华语组合": {},
				"欧美男歌手": {},
				"欧美女歌手": {},
				"欧美组合": {},
				"日本男歌手": {},
				"日本女歌手": {},
				"日本组合": {},
				"韩国男歌手": {},
				"韩国女歌手": {},
				"韩国组合": {},
			}
			var optionMap = {
				0: "热门",
				1: "华语男歌手",
				2: "华语女歌手",
				3: "华语组合",
				4: "欧美男歌手",
				5: "欧美女歌手",
				6: "欧美组合",
				7: "日本男歌手",
				8: "日本女歌手",
				9: "日本组合",
				10: "韩国男歌手",
				11: "韩国女歌手",
				12: "韩国组合"
			}
			var artistmap = {}
			//https://raw.githubusercontent.com/Cinvin/cdn/main/artist/top.json
			//https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/top.json
			fetch('https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/top.json')
				.then(r => r.json())
				.then(r => {
					toplist = r;
					toplist.forEach(artist => {
						let desc = `${artist.name}(${artist.count}首/${artist.sizeDesc})`;
						let id = artist.id
						selectOptions[optionMap[artist.categroy]][artist.id] = `${artist.name}(${artist.count}首/${artist.sizeDesc})`
						artistmap[artist.id] = artist
					})
					//console.log(selectOptions)
					btnUpload.addEventListener('click', ShowCloudUploadPopUp)
					btnUploadDesc.innerHTML = '快速上传'
				})

			function ShowCloudUploadPopUp() {
				Swal.fire({
						title: '快速上传',
						input: 'select',
						inputOptions: selectOptions,
						inputPlaceholder: '选择歌手',
						confirmButtonText: '下一步',
						showCloseButton: true,
						footer: '<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
						inputValidator: (value) => {
							if (!value) {
								return '请选择歌手'
							}
						},
					})
					.then(result => {
						if (result.isConfirmed) {
							fetchCDNConfig(result.value)
						}
					})
			}

			function fetchCDNConfig(artistId) {
				showTips(`正在获取资源配置...`, 1)
				//https://raw.githubusercontent.com/Cinvin/cdn/main/artist/${artistid}.json
				//https://cdn.jsdelivr.net/gh/Cinvin/cdn/artist/${artistid}.json
				fetch(`https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/${artistId}.json`)
					.then(r => r.json())
					.then(r => {
						let uploader = new Uploader(r)
						uploader.start()
					})
					.catch(`获取资源配置失败`)
			}
			class Uploader {
				constructor(config, showAll = false) {
					this.songs = []
					this.config = config
					this.filter = {
						text: '',
						noCopyright: true,
						vip: true,
						pay: true,
						lossless: false,
						all: showAll,
						songIndexs: []
					}
					this.page = {
						current: 1,
						max: 1,
						limitCount: 50
					}
					this.batchUpload = {
						threadCount: 5,
						working: false,
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
        song-name-text {
            text-align: center;
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
  width: 8%;
}
 tr th:nth-child(2){
  width: 35%;
}
 tr td:nth-child(2){
  width: 10%;
}
tr td:nth-child(3){
  width: 25%;
}
 tr th:nth-child(3),tr td:nth-child(4){
  width: 20%;
}
 tr th:nth-child(4),tr td:nth-child(5){
  width: 8%;
}
 tr th:nth-child(5),tr td:nth-child(6){
  width: 16%;
}
 tr th:nth-child(6),tr td:nth-child(7){
  width: 8%;
}
</style>
<input id="text-filter" class="swal2-input" type="text" placeholder="歌曲过滤">
<div id="my-cbs">
<input class="form-check-input" type="checkbox" value="" id="cb-copyright" checked><label class="form-check-label" for="cb-copyright">无版权</label>
<input class="form-check-input" type="checkbox" value="" id="cb-vip" checked><label class="form-check-label" for="cb-vip">VIP</label>
<input class="form-check-input" type="checkbox" value="" id="cb-pay" checked><label class="form-check-label" for="cb-pay">数字专辑</label>
<input class="form-check-input" type="checkbox" value="" id="cb-lossless"><label class="form-check-label" for="cb-lossless">无损资源</label>
<input class="form-check-input" type="checkbox" value="" id="cb-all" ${this.filter.all?"checked":""}><label class="form-check-label" for="cb-all">全部歌曲</label>
</div>
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upload-batch">全部上传</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>备注</th> </tr></thead><tbody></tbody></table>
`,
						footer: '<div></div>',
						didOpen: () => {
							let container = Swal.getHtmlContainer()
							let footer = Swal.getFooter()
							let tbody = container.querySelector('tbody')
							this.popupObj = {
								container: container,
								tbody: tbody,
								footer: footer
							}

							//this.filter={text:'',noCopyright:true,vip:true,pay:true,lossless:false,songIds:[]}
							let filterInput = container.querySelector('#text-filter')
							filterInput.addEventListener('change', () => {
								let filtertext = filterInput.value.trim()
								if (this.filter.text != filtertext) {
									this.filter.text = filtertext
									this.applyFilter()
								}
							})
							let copyrightInput = container.querySelector('#cb-copyright')
							copyrightInput.addEventListener('change', () => {
								this.filter.noCopyright = copyrightInput.checked
								this.applyFilter()
							})
							let vipInput = container.querySelector('#cb-vip')
							vipInput.addEventListener('change', () => {
								this.filter.vip = vipInput.checked
								this.applyFilter()
							})
							let payInput = container.querySelector('#cb-pay')
							payInput.addEventListener('change', () => {
								this.filter.pay = payInput.checked
								this.applyFilter()
							})
							let losslessInput = container.querySelector('#cb-lossless')
							losslessInput.addEventListener('change', () => {
								this.filter.lossless = losslessInput.checked
								this.applyFilter()
							})
							let allInput = container.querySelector('#cb-all')
							allInput.addEventListener('change', () => {
								this.filter.all = allInput.checked
								this.applyFilter()
							})
							let uploader = this
							this.btnUploadBatch = container.querySelector('#btn-upload-batch')
							this.btnUploadBatch.addEventListener('click', () => {
								if (this.batchUpload.working) {
									return
								}
								this.batchUpload.songIndexs = []
								this.filter.songIndexs.forEach(idx => {
									if (!uploader.songs[idx].uploaded) {
										uploader.batchUpload.songIndexs.push(idx)
									}
								})
								if (this.batchUpload.songIndexs.length == 0) {
									showTips('没有需要上传的歌曲', 1)
									return
								}
								this.batchUpload.working = true
								this.batchUpload.finnishThread = 0
								this.batchUpload.threadCount = Math.min(this.batchUpload.songIndexs.length, 5)
								for (let i = 0; i < this.batchUpload.threadCount; i++) {
									this.uploadSong(this.batchUpload.songIndexs[i])
								}
							})
							this.fetchSongInfo()
						},
					})
				}
				fetchSongInfo() {
					//console.log(songList)
					let ids = this.config.data.map(item => {
						return {
							'id': item.id
						}
					})
					//获取需上传的song
					this.popupObj.tbody.innerHTML = '正在获取歌曲信息...'
					this.fetchSongInfoSub(ids, 0)
				}
				fetchSongInfoSub(ids, startIndex) {
					if (startIndex >= ids.length) {
						if (this.songs.length == 0) {
							this.popupObj.tbody.innerHTML = '没有可以上传的歌曲'
							return
						}
						//排序
						this.songs.sort((a, b) => {
							if (a.albumid != b.albumid) {
								return b.albumid - a.albumid
							}
							return a.id - b.id
						})
						this.createTableRow()
						this.applyFilter()
						return
					}
					this.popupObj.tbody.innerHTML = `正在获取第${startIndex+1}到${Math.min(ids.length,startIndex+1000)}首歌曲信息...`
					let uploader = this
					weapiRequest("/api/v3/song/detail", {
						type: "json",
						method: "post",
						sync: true,
						data: {
							c: JSON.stringify(ids.slice(startIndex, startIndex + 1000))
						},
						onload: function(responses) {
							let content = JSON.parse(responses.response)
							//console.log(content)
							let len = content.songs.length
							for (let i = 0; i < len; i++) {
								if (!content.privileges[i].cs) {
									let config = uploader.config.data.find(item => {
										return item.id == content.songs[i].id
									})
									let item = {
										id: content.songs[i].id,
										name: content.songs[i].name,
										album: content.songs[i].al.name,
										albumid: content.songs[i].al.id || 0,
										artists: content.songs[i].ar.map(ar => ar.name)
											.join(),
										tns: content.songs[i].tns ? content.songs[i].tns.join() : '', //翻译
										dt: duringTimeDesc(content.songs[i].dt || 0),
										filename: content.songs[i].name + '.' + config.ext,
										ext: config.ext,
										md5: config.md5,
										size: config.size,
										picUrl: (content.songs[i].al && content.songs[i].al.picUrl) ? content.songs[i].al.picUrl : 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg',
										isNoCopyright: content.privileges[i].st == -200,
										isVIP: content.songs[i].fee == 1,
										isPay: content.songs[i].fee == 4,
										uploaded: false,
									}
									if (config.name) {
										item.name = config.name
										item.album = config.al
										item.artists = config.ar
										item.filename = config.name + '.' + config.ext
									}
									uploader.songs.push(item)
								}
							}
							uploader.fetchSongInfoSub(ids, startIndex + 1000)
						}
					})
				}
				createTableRow() {
					for (let i = 0; i < this.songs.length; i++) {
						let song = this.songs[i]
						let tablerow = document.createElement('tr')
						tablerow.innerHTML = `<td><button type="button" class="swal2-styled">上传</button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${song.dt}</td><td>${fileSizeDesc(song.size)} ${song.ext.toUpperCase()}</td><td class="song-remark"></td>`
						let songTitle = tablerow.querySelector('.song-remark')
						if (song.isNoCopyright) {
							songTitle.innerHTML = '无版权'
						} else if (song.isVIP) {
							songTitle.innerHTML = 'VIP'
						} else if (song.isPay) {
							songTitle.innerHTML = '数字专辑'
						}
						let btn = tablerow.querySelector('button')
						btn.addEventListener('click', () => {
							if (this.batchUpload.working) {
								return
							}
							this.uploadSong(i)
						})
						song.tablerow = tablerow
					}
				}
				applyFilter() {
					this.filter.songIndexs = []
					let filterText = this.filter.text
					let isNoCopyright = this.filter.noCopyright
					let isVIP = this.filter.vip
					let isPay = this.filter.pay
					let isLossless = this.filter.lossless
					let isALL = this.filter.all
					for (let i = 0; i < this.songs.length; i++) {
						let song = this.songs[i]
						if (filterText.length > 0 && !song.name.includes(filterText) && !song.album.includes(filterText) && !song.artists.includes(filterText) && !song.tns.includes(filterText)) {
							continue
						}
						if (isALL) {
							this.filter.songIndexs.push(i)
						} else if (isNoCopyright && song.isNoCopyright) {
							this.filter.songIndexs.push(i)
						} else if (isVIP && song.isVIP) {
							this.filter.songIndexs.push(i)
						} else if (isPay && song.isPay) {
							this.filter.songIndexs.push(i)
						} else if (isLossless && song.ext == 'flac') {
							this.filter.songIndexs.push(i)
						}
					}
					this.page.current = 1
					this.page.max = Math.ceil(this.filter.songIndexs.length / this.page.limitCount)
					this.renderData()
					this.renderFilterInfo()
				}
				renderData() {
					if (this.filter.songIndexs.length == 0) {
						this.popupObj.tbody.innerHTML = '空空如也'
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
					let uploader = this
					this.popupObj.footer.innerHTML = ''
					pageIndexs.forEach(pageIndex => {
						let pageBtn = document.createElement('button')
						pageBtn.setAttribute("type", "button")
						pageBtn.className = "swal2-styled"
						pageBtn.innerHTML = pageIndex
						if (pageIndex != uploader.page.current) {
							pageBtn.addEventListener('click', () => {
								uploader.page.current = pageIndex
								uploader.renderData()
							})
						} else {
							pageBtn.style.background = 'white'
						}
						uploader.popupObj.footer.appendChild(pageBtn)
					})
				}
				renderFilterInfo() {
					//this.btnUploadBatch
					//this.filter.songs
					let sizeTotal = 0
					let countCanUpload = 0
					this.filter.songIndexs.forEach(idx => {
						let song = this.songs[idx]
						if (!song.uploaded) {
							countCanUpload += 1
							sizeTotal += song.size
						}
					})
					this.btnUploadBatch.innerHTML = '全部上传'
					if (countCanUpload > 0) {
						this.btnUploadBatch.innerHTML += ` (${countCanUpload}首 ${fileSizeDesc(sizeTotal)})`
					}
				}
				uploadSong(songIndex) {
					let song = this.songs[songIndex]
					let uploader = this
					try {
						weapiRequest("/api/cloud/upload/check", {
							method: "POST",
							type: "json",
							data: {
								songId: song.id,
								md5: song.md5,
								length: song.size,
								ext: song.ext,
								version: 1,
								bitrate: song.bitrate,
							},
							onload: (responses1) => {
								let res1 = JSON.parse(responses1.response)
								if (res1.code != 200) {
									if (res1.code == 400 && song.id > 0) {
										//被**的歌曲要id设为0
										uploader.songs[songIndex].id = 0
										uploader.uploadSong(songIndex)
									} else {
										console.error(song.name, '1.检查资源', res1)
										uploader.onUploadFail(songIndex)
									}
									return
								}
								console.log(song.name, '1.检查资源', res1)
								//step2 上传令牌
								weapiRequest("/api/nos/token/alloc", {
									method: "POST",
									type: "json",
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
									onload: (responses2) => {
										let res2 = JSON.parse(responses2.response)
										if (res2.code != 200) {
											console.error(song.name, '2.获取令牌', res2)
											uploader.onUploadFail(songIndex)
											return
										}
										console.log(song.name, '2.获取令牌', res2)
										//step3 提交
										weapiRequest("/api/upload/cloud/info/v2", {
											method: "POST",
											type: "json",
											data: {
												md5: song.md5,
												songid: res1.songId,
												filename: song.filename,
												song: song.name,
												album: song.album,
												artist: song.artists,
												bitrate: '128',
												resourceId: res2.result.resourceId,
											},
											onload: (responses3) => {
												let res3 = JSON.parse(responses3.response)
												if (res3.code != 200) {
													console.error(song.name, '3.提交文件', res3)
													uploader.onUploadFail(songIndex)
													return
												}
												console.log(song.name, '3.提交文件', res3)
												//step4 发布
												weapiRequest("/api/cloud/pub/v2", {
													method: "POST",
													type: "json",
													data: {
														songid: res3.songId,
													},
													onload: (responses4) => {
														let res4 = JSON.parse(responses4.response)
														if (res4.code != 200 && res4.code != 201) {
															console.error(song.name, '4.发布资源', res4)
															uploader.onUploadFail(songIndex)
															return
														}
														console.log(song.name, '4.发布资源', res4)
														//step5 关联
														if (res4.privateCloud.songId != song.id && song.id > 0) {
															weapiRequest("/api/cloud/user/song/match", {
																method: "POST",
																type: "json",
																sync: true,
																data: {
																	songId: res4.privateCloud.songId,
																	adjustSongId: song.id,
																},
																onload: (responses5) => {
																	let res5 = JSON.parse(responses5.response)
																	if (res5.code != 200) {
																		console.error(song.name, '5.匹配歌曲', res5)
																		uploader.onUploadFail(songIndex)
																		return
																	}
																	console.log(song.name, '5.匹配歌曲', res5)
																	console.log(song.name, '完成')
																	//完成
																	uploader.onUploadSucess(songIndex)
																},
																onerror: function(res) {
																	console.error(song.name, '5.匹配歌曲', res)
																	uploader.onUploadFail(songIndex)
																}
															})
														} else {
															console.log(song.name, '完成')
															//完成
															uploader.onUploadSucess(songIndex)
														}
													},
													onerror: function(res) {
														console.error(song.name, '4.发布资源', res)
														uploader.onUploadFail(songIndex)
													}
												})
											},
											onerror: function(res) {
												console.error(song.name, '3.提交文件', res)
												uploader.onUploadFail(songIndex)
											}
										});
									},
									onerror: function(res) {
										console.error(song.name, '2.获取令牌', res)
										uploader.onUploadFail(songIndex)
									}
								});
							},
							onerror: function(res) {
								console.error(song.name, '1.检查资源', res)
								uploader.onUploadFail(songIndex)
							}
						})

					} catch (e) {
						console.error(e);
						uploader.onUploadFail(songIndex)
					}
				}
				onUploadFail(songIndex) {
					let song = this.songs[songIndex]
					showTips(`${song.name} - ${song.artists} - ${song.album} 上传失败`, 2)
					this.onUploadFinnsh(songIndex)
				}
				onUploadSucess(songIndex) {
					let song = this.songs[songIndex]
					showTips(`${song.name} - ${song.artists} - ${song.album} 上传成功`, 1)
					song.uploaded = true
					let btnUpload = song.tablerow.querySelector('button')
					btnUpload.innerHTML = '已上传'
					btnUpload.disabled = 'disabled'
					this.onUploadFinnsh(songIndex)
				}
				onUploadFinnsh(songIndex) {
					if (this.batchUpload.working) {
						let batchSongIdx = this.batchUpload.songIndexs.indexOf(songIndex)
						if (batchSongIdx + this.batchUpload.threadCount < this.batchUpload.songIndexs.length) {
							this.uploadSong(this.batchUpload.songIndexs[batchSongIdx + this.batchUpload.threadCount])
						} else {
							this.batchUpload.finnishThread += 1
							if (this.batchUpload.finnishThread == this.batchUpload.threadCount) {
								this.batchUpload.working = false
								this.renderFilterInfo()
								showTips('上传完成', 1)
							}
						}
					} else {
						this.renderFilterInfo()
					}
				}
			}

			//匹配纠正
			let btnMatch = document.createElement('a')
			btnMatch.id = 'matchBtn'
			btnMatch.className = 'u-btn2 u-btn2-1'
			let btnMatchDesc = document.createElement('i')
			btnMatchDesc.innerHTML = '匹配纠正'
			btnMatch.appendChild(btnMatchDesc)
			btnMatch.setAttribute("hidefocus", "true");
			btnMatch.style.marginRight = '10px';
			editArea.insertBefore(btnMatch, editArea.lastChild)
			btnMatch.addEventListener('click', () => {
				let matcher = new Matcher()
				matcher.start()
			})
			class Matcher {
				start() {
					this.cloudCountLimit = 50
					this.currentPage = 1
					this.filter = {
						text: '',
						notMatch: false,
						songs: [],
						filterInput: null,
						notMatchCb: null
					}
					this.controls = {
						tbody: null,
						pageArea: null,
						cloudDesc: null
					}
					this.openCloudList()
				}
				openCloudList() {
					Swal.fire({
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
        song-name-text {
            text-align: center;
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
  width: 8%;
}
 tr th:nth-child(2){
  width: 32%;
}
 tr td:nth-child(2){
  width: 8%;
}
tr td:nth-child(3){
  width: 25%;
}
 tr th:nth-child(3),tr td:nth-child(4){
  width: 18%;
}
 tr th:nth-child(4),tr td:nth-child(5){
  width: 8%;
}
 tr th:nth-child(5),tr td:nth-child(6){
  width: 18%;
}
 tr th:nth-child(6),tr td:nth-child(7){
  width: 15%;
}
</style>
<input class="swal2-input" type="text" value="${this.filter.text}" id="text-filter" placeholder="歌曲过滤">
<input class="form-check-input" type="checkbox" value="" id="cb-notmatch" ${this.filter.notMatch?'checked':''}><label class="form-check-label" for="cb-notmatch">未匹配歌曲</label>
`,
						footer: `<div id="page-area"></div><br><div id="cloud-desc">${this.controls.cloudDesc?this.controls.cloudDesc.innerHTML:''}</div>`,
						didOpen: () => {
							let cloudListContainer = Swal.getHtmlContainer()
							let cloudListFooter = Swal.getFooter()
							cloudListFooter.style.display = 'block'
							cloudListFooter.style.textAlign = 'center'

							let songtb = document.createElement('table')
							songtb.border = 1
							songtb.frame = 'hsides'
							songtb.rules = 'rows'
							songtb.innerHTML = `<thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>上传日期</th> </tr></thead><tbody></tbody>`
							let tbody = songtb.querySelector('tbody')
							this.controls.tbody = tbody
							this.controls.pageArea = cloudListFooter.querySelector('#page-area')
							this.controls.cloudDesc = cloudListFooter.querySelector('#cloud-desc')

							let filterInput = cloudListContainer.querySelector('#text-filter')
							let notMatchCb = cloudListContainer.querySelector('#cb-notmatch')
							this.filter.filterInput = filterInput
							this.filter.notMatchCb = notMatchCb
							let matcher = this
							filterInput.addEventListener('change', () => {
								if (matcher.filter.text == filterInput.value.trim()) {
									return
								}
								matcher.filter.text = filterInput.value.trim()
								this.onCloudInfoFilterChange()
							})
							notMatchCb.addEventListener('change', () => {
								matcher.filter.notMatch = notMatchCb.checked
								this.onCloudInfoFilterChange()
							})
							cloudListContainer.appendChild(songtb)
							if (this.filter.text == '' && !this.filter.notMatch) {
								this.fetchCloudInfoForMatchTable((this.currentPage - 1) * this.cloudCountLimit)
							} else {
								this.sepreateFilterCloudListPage(this.currentPage)
							}
						},
					})
				}
				fetchCloudInfoForMatchTable(offset) {
					this.controls.tbody.innerHTML = '正在获取...'
					let matcher = this
					weapiRequest('/api/v1/cloud/get', {
						method: "POST",
						type: "json",
						data: {
							limit: this.cloudCountLimit,
							offset: offset,
						},
						onload: (responses) => {
							let res = JSON.parse(responses.response)
							matcher.currentPage = (offset / this.cloudCountLimit) + 1
							let maxPage = Math.ceil(res.count / this.cloudCountLimit)
							this.controls.cloudDesc.innerHTML = `云盘容量 ${fileSizeDesc(res.size)}/${fileSizeDesc(res.maxSize)} 共${res.count}首歌曲`
							let pageIndexs = [1]
							let floor = Math.max(2, matcher.currentPage - 2);
							let ceil = Math.min(maxPage - 1, matcher.currentPage + 2);
							for (let i = floor; i <= ceil; i++) {
								pageIndexs.push(i)
							}
							if (maxPage > 1) {
								pageIndexs.push(maxPage)
							}
							matcher.controls.pageArea.innerHTML = ''
							pageIndexs.forEach(pageIndex => {
								let pageBtn = document.createElement('button')
								pageBtn.setAttribute("type", "button")
								pageBtn.className = "swal2-styled"
								pageBtn.innerHTML = pageIndex
								if (pageIndex != matcher.currentPage) {
									pageBtn.addEventListener('click', () => {
										matcher.fetchCloudInfoForMatchTable(matcher.cloudCountLimit * (pageIndex - 1))
									})
								} else {
									pageBtn.style.background = 'white'
								}
								matcher.controls.pageArea.appendChild(pageBtn)
							})
							this.fillCloudListTable(res.data)
						}
					})
				}
				fillCloudListTable(songs) {
					let matcher = this
					matcher.controls.tbody.innerHTML = ''
					if (songs.length == 0) {
						matcher.controls.tbody.innerHTML = '空空如也'
					}
					songs.forEach(function(song) {
						let album = song.album
						let picUrl = 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
						if (song.simpleSong.al && song.simpleSong.al.id > 0) {
							album = song.simpleSong.al.name
							picUrl = song.simpleSong.al.picUrl
						}
						let artist = song.artist
						if (song.simpleSong.ar) {
							let artist2 = ''
							let arcount = 0
							song.simpleSong.ar.forEach(ar => {
								if (ar.name) {
									artist2 += ar.name + ','
									arcount += 1
								}
							})
							if (arcount > 0) {
								artist = artist2.substring(0, artist2.length - 1)
							}
						}
						let dateObj = new Date(song.addTime)
						let addTime = `${dateObj.getFullYear()}-${dateObj.getMonth()+1}-${dateObj.getDate()}`
						let tablerow = document.createElement('tr')
						tablerow.innerHTML = `<td><button type="button" class="swal2-styled">匹配</button></td><td><a class="album-link"><img src="${picUrl}?param=50y50&quality=100" title="${album}"></a></td><td><a class="song-link">${song.simpleSong.name}</a></td><td>${artist}</td><td>${duringTimeDesc(song.simpleSong.dt)}</td><td>${fileSizeDesc(song.fileSize)} ${levelDesc(song.simpleSong.privilege.plLevel)}</td><td>${addTime}</td>`
						if (song.simpleSong.al && song.simpleSong.al.id > 0) {
							let albumLink = tablerow.querySelector('.album-link')
							albumLink.href = 'https://music.163.com/album?id=' + song.simpleSong.al.id
							albumLink.target = "_blank"
							let songLink = tablerow.querySelector('.song-link')
							songLink.href = 'https://music.163.com/song?id=' + song.simpleSong.id
							songLink.target = "_blank"
						}
						let btn = tablerow.querySelector('button')
						btn.addEventListener('click', () => {
							matcher.openMatchPopup(song)
						})
						matcher.controls.tbody.appendChild(tablerow)
					})
				}
				onCloudInfoFilterChange() {
					this.filter.songs = []
					if (this.filter.text == '' && !this.filter.notMatch) {
						this.fetchCloudInfoForMatchTable(0)
						return
					}
					this.filter.filterInput.setAttribute("disabled", 1)
					this.filter.notMatchCb.setAttribute("disabled", 1)
					this.cloudInfoFilterFetchData(0)
				}
				cloudInfoFilterFetchData(offset) {
					let matcher = this
					if (offset == 0) {
						this.filter.songs = []
					}
					weapiRequest('/api/v1/cloud/get', {
						method: "POST",
						type: "json",
						data: {
							limit: 1000,
							offset: offset,
						},
						onload: (responses) => {
							let res = JSON.parse(responses.response)
							responses = {}
							matcher.controls.tbody.innerHTML = `正在搜索第${offset+1}到${Math.min(offset+1000,res.count)}云盘歌曲`
							res.data.forEach(song => {
								if (matcher.filter.text.length > 0) {
									let matchFlag = false
									if (song.album.includes(matcher.filter.text) ||
										song.artist.includes(matcher.filter.text) ||
										song.simpleSong.name.includes(matcher.filter.text) ||
										(song.simpleSong.al && song.simpleSong.al.id > 0 && song.simpleSong.al.name && song.simpleSong.al.name.includes(matcher.filter.text))) {
										matchFlag = true
									}
									if (!matchFlag && song.simpleSong.ar) {
										song.simpleSong.ar.forEach(ar => {
											if (ar.name && ar.name.includes(matcher.filter.text)) {
												matchFlag = true
											}
										})
										if (!matchFlag) {
											return
										}
									}
								}
								if (matcher.filter.notMatch && song.simpleSong.al && song.simpleSong.al.id > 0) {
									return
								}
								matcher.filter.songs.push(song)
							})
							if (res.hasMore) {
								//if(offset<2001){//testing
								res = {}
								matcher.cloudInfoFilterFetchData(offset + 1000)
							} else {
								matcher.sepreateFilterCloudListPage(1)
								matcher.filter.filterInput.removeAttribute("disabled")
								matcher.filter.notMatchCb.removeAttribute("disabled")
							}
						}
					})
				}
				sepreateFilterCloudListPage(currentPage) {
					this.currentPage = currentPage
					let matcher = this
					let count = this.filter.songs.length
					let maxPage = Math.ceil(count / this.cloudCountLimit)
					this.controls.pageArea.innerHTML = ''
					let pageIndexs = [1]
					let floor = Math.max(2, currentPage - 2);
					let ceil = Math.min(maxPage - 1, currentPage + 2);
					for (let i = floor; i <= ceil; i++) {
						pageIndexs.push(i)
					}
					if (maxPage > 1) {
						pageIndexs.push(maxPage)
					}
					matcher.controls.pageArea.innerHTML = ''
					pageIndexs.forEach(pageIndex => {
						let pageBtn = document.createElement('button')
						pageBtn.setAttribute("type", "button")
						pageBtn.className = "swal2-styled"
						pageBtn.innerHTML = pageIndex
						if (pageIndex != currentPage) {
							pageBtn.addEventListener('click', () => {
								matcher.sepreateFilterCloudListPage(pageIndex)
							})
						} else {
							pageBtn.style.background = 'white'
						}
						matcher.controls.pageArea.appendChild(pageBtn)
					})
					let songindex = (currentPage - 1) * this.cloudCountLimit
					matcher.fillCloudListTable(matcher.filter.songs.slice(songindex, songindex + this.cloudCountLimit))
				}
				openMatchPopup(song) {
					let matcher = this
					Swal.fire({
							showCloseButton: true,
							title: `歌曲 ${song.simpleSong.name} 匹配纠正`,
							input: 'number',
							inputLabel: '目标歌曲ID',
							footer: 'ID为0时解除匹配 歌曲页面网址里的数字就是ID',
							inputValidator: (value) => {
								if (!value) {
									return '内容为空'
								}
							},
						})
						.then(result => {
							if (result.isConfirmed) {
								let fromId = song.simpleSong.id
								let toId = result.value
								weapiRequest("/api/cloud/user/song/match", {
									method: "POST",
									type: "json",
									sync: true,
									data: {
										songId: fromId,
										adjustSongId: toId,
									},
									onload: (responses) => {
										let res = JSON.parse(responses.response)
										console.log(res)
										if (res.code != 200) {
											showTips(res.message || res.msg || '匹配失败', 2)
										} else {
											let msg = '解除匹配成功'
											if (toId > 0) {
												msg = '匹配成功'
												if (res.matchData) {
													msg = `${res.matchData.songName} 成功匹配到 ${res.matchData.simpleSong.name} `
												}
											}
											showTips(msg, 1)

											if (matcher.filter.songs.length > 0 && res.matchData) {
												for (let i = 0; i < matcher.filter.songs.length; i++) {
													if (matcher.filter.songs[i].simpleSong.id == fromId) {
														//matchData里无privilege
														res.matchData.simpleSong.privilege = matcher.filter.songs[i].simpleSong.privilege
														matcher.filter.songs[i] = res.matchData
														break
													}
												}
											}
										}
										matcher.openCloudList()
									},
								})
							} else {
								matcher.openCloudList()
							}
						})
				}
			}

			//听歌量打卡
			let btnListen = document.createElement('a')
			btnListen.id = 'listenBtn'
			btnListen.className = 'u-btn2 u-btn2-1'
			let btnListenDesc = document.createElement('i')
			btnListenDesc.innerHTML = '听歌量打卡'
			btnListen.appendChild(btnListenDesc)
			btnListen.setAttribute("hidefocus", "true");
			btnListen.style.marginRight = '10px';
			btnListen.addEventListener('click', listenDaily)
			editArea.insertBefore(btnListen, editArea.lastChild)

			function listenDaily() {
				weapiRequest(`/api/v1/user/detail/${unsafeWindow.GUser.userId}`, {
					type: "json",
					method: "POST",
					onload: (responses) => {
						let res = JSON.parse(responses.response)
						//console.log(res)
						let begin = Math.floor(new Date().getTime() / 1000)
						let logs = []
						for (let i = begin; i < begin + 300; i++) {
							logs.push({
								action: 'play',
								json: {
									download: 0,
									end: 'playend',
									id: i,
									sourceId: '',
									time: 300,
									type: 'song',
									wifi: 0,
									source: 'list'
								}
							})
						}
						weapiRequest('/api/feedback/weblog', {
							type: "json",
							method: "POST",
							data: {
								logs: JSON.stringify(logs)
							},
							onload: (responses1) => {
								let res1 = JSON.parse(responses1.response)
								//console.log(res1)
								if (res1.code = 200) {
									showConfirmBox('今日听歌量+300首完成')
								}
							}
						})
					}
				})
			}

			//云盘导出
			let btnExport = document.createElement('a')
			btnExport.id = 'exportBtn'
			btnExport.className = 'u-btn2 u-btn2-1'
			let btnExportDesc = document.createElement('i')
			btnExportDesc.innerHTML = '云盘导出'
			btnExport.appendChild(btnExportDesc)
			btnExport.setAttribute("hidefocus", "true");
			btnExport.style.marginRight = '10px';
			btnExport.addEventListener('click', openExportPopup)
			editArea.insertBefore(btnExport, editArea.lastChild)

			function openExportPopup() {
				Swal.fire({
						title: '云盘导出',
						showCloseButton: true,
						html: `<input class="swal2-input" id="text-artist" placeholder="歌手名" type="text"><input class="swal2-input" id="text-album" placeholder="专辑名" type="text"><input class="swal2-input" id="text-song" placeholder="歌曲名" type="text">`,
						footer: '过滤条件取交集',
						confirmButtonText: '导出',
						preConfirm: () => {
							return [
								document.getElementById('text-artist')
								.value.trim(),
								document.getElementById('text-album')
								.value.trim(),
								document.getElementById('text-song')
								.value.trim()
							]
						},
					})
					.then((result) => {
						if (result.isConfirmed) {
							exportCloud(result.value)
						}
					})
			}

			function exportCloud(filter) {
				showTips('开始导出', 1)
				exportCloudSub(filter, {
					data: []
				}, 0)
			}

			function exportCloudSub(filter, config, offset) {
				weapiRequest('/api/v1/cloud/get', {
					method: "POST",
					type: "json",
					data: {
						limit: 1000,
						offset: offset,
					},
					onload: (responses) => {
						let res = JSON.parse(responses.response)
						showTips(`正在获取第${offset+1}到${Math.min(offset+1000,res.count)}首云盘歌曲信息`, 1)
						let matchSongs = []
						res.data.forEach(song => {
							if (song.simpleSong.al && song.simpleSong.al.id > 0) {
								//已关联歌曲
								if (filter[0].length > 0) {
									let flag = false
									for (let i = 0; i < song.simpleSong.ar.length; i++) {
										if (song.simpleSong.ar[i].name == filter[0]) {
											flag = true
											break
										}
									}
									if (!flag) {
										return
									}
								}
								if (filter[1].length > 0 && filter[1] != song.simpleSong.al.name) {
									return
								}
								if (filter[2].length > 0 && filter[2] != song.simpleSong.name) {
									return
								}
								let songItem = {
									'id': song.songId,
									'size': song.fileSize,
									'ext': song.fileName.split('.')
										.pop()
										.toLowerCase(),
									'bitrate': song.bitrate,
									'md5': null,
								}
								matchSongs.push(songItem)
							} else {
								//未关联歌曲
								if (filter[0].length > 0 && song.artist != filter[0]) {
									return
								}
								if (filter[1].length > 0 && song.album != filter[1]) {
									return
								}
								if (filter[2].length > 0 && song.songName != filter[2]) {
									return
								}
								let songItem = {
									'id': song.songId,
									'size': song.fileSize,
									'ext': song.fileName.split('.')
										.pop()
										.toLowerCase(),
									'bitrate': song.bitrate,
									'md5': null,
									'name': song.songName,
									'al': song.album,
									'ar': song.artist,
								}
								matchSongs.push(songItem)
							}
						})

						let ids = matchSongs.map(song => song.id)
						if (ids.length > 0) {
							weapiRequest("/api/song/enhance/player/url/v1", {
								type: "json",
								method: "POST",
								data: {
									ids: JSON.stringify(ids),
									level: 'hires',
									encodeType: 'flac',
								},
								onload: (responses2) => {
									let res2 = JSON.parse(responses2.response)
									//console.log(res2)
									if (res2.code != 200) {
										//重试
										exportCloudSub(filter, config, offset)
										return
									}
									matchSongs.forEach(song => {
										let songId = song.id
										for (let i = 0; i < res2.data.length; i++) {
											if (res2.data[i].id == songId) {
												song.md5 = res2.data[i].md5
												config.data.push(song)
												break
											}
										}
									})

									if (res.hasMore) {
										exportCloudSub(filter, config, offset + 1000)
									} else {
										configToFile(config)
									}
								}
							})
						} else {
							if (res.hasMore) {
								exportCloudSub(filter, config, offset + 1000)
							} else {
								configToFile(config)
							}
						}
					}
				})
			}

			function configToFile(config) {
				let content = JSON.stringify(config)
				let temp = document.createElement('a');
				let data = new Blob([content], {
					type: 'type/plain'
				})
				let fileurl = URL.createObjectURL(data)
				temp.href = fileurl
				temp.download = '网易云云盘信息.json'
				temp.click()
				URL.revokeObjectURL(data);
				showTips(`导出云盘信息完成,共${config.data.length}首歌曲`, 1)
			}

			//云盘导入
			let btnImport = document.createElement('a')
			btnImport.id = 'importBtn'
			btnImport.className = 'u-btn2 u-btn2-1'
			let btnImportDesc = document.createElement('i')
			btnImportDesc.innerHTML = '云盘导入'
			btnImport.appendChild(btnImportDesc)
			btnImport.setAttribute("hidefocus", "true");
			btnImport.style.marginRight = '10px';
			btnImport.addEventListener('click', openImportPopup)
			editArea.insertBefore(btnImport, editArea.lastChild)

			function openImportPopup() {
				Swal.fire({
						title: '云盘导入',
						input: 'file',
						inputAttributes: {
							'accept': 'application/json',
							'aria-label': '选择文件'
						},
						confirmButtonText: '导入'
					})
					.then((result) => {
						if (result.isConfirmed) {
							importCloud(result.value)
						}
					})
			}

			function importCloud(file) {
				let reader = new FileReader();
				reader.readAsText(file);
				reader.onload = (e) => {
					let uploader = new Uploader(JSON.parse(e.target.result), true)
					uploader.start()
				}
			}
		}
	}
})();