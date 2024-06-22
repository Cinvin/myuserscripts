// ==UserScript==
// @name			网易云音乐:云盘快传(含周杰伦)|歌曲下载&转存云盘|云盘匹配纠正|听歌量打卡|高音质试听
// @description		无需文件云盘快传歌曲(含周杰伦)、歌曲下载&转存云盘(可批量)、云盘匹配纠正、快速完成300首听歌量打卡任务、选择更高音质试听(支持超清母带,默认无损)、歌单歌曲排序(时间、红心数、评论数)、限免VIP歌曲下载上传、云盘音质提升、本地文件上传云盘、云盘导入导出。
// @namespace	https://github.com/Cinvin/myuserscripts
// @version			3.5.1
// @author			cinvin
// @license			MIT
// @match			https://music.163.com/*
// @icon			data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALiSURBVHgBpVZLThtBEH3d40WkIGWWSSDSGMw6cAP7BBlOgDkB5gSYE2BOgDlBnBNgToCzDmQmii0iZYEXsRRBPJ1X6R4+Mz3IKLVxT1f1q9/rais8IQmiCLjZNlBNA8O1iqzGpAoqNcAnjfmgjh9pFYbyA7+ODIJjAjSxmPTp6MDnSJfBV3YzBOfPABdp88zpBd7ERcWjDC7xdp9bXfyXZHtruOqVHNjITW8RCGZ3xOSHClnITwaF6KFeQ7XqGA/tGrbmBO9W4E0tIFL33W9g0gmQpWuY9A30XvEAsT4mCMM7B3MEXf6EZUN8ZvM2BVAY47bPyK6QuvNLLCcGWdcTFPVLnX8OJHrWadsHXsOsKeuvWD6lza7ThHWkzEqJw4gRvodXzK5kodn92KNNa5hz/0Uo7BBGicOMtc0b2MA4ZnZ17h34HUgWL9uakX3wKIfCaVe6yDqcNWv4NUrINIkswfKGGK5j3K1yItkp1vEahfpr3GwCwZTRJ25rRxoqNbdlUS2gNspwe02Qdh2TEymj5+6MNDzNreMnDwfNe4ezwQXexS4bksLE0geOC9qhJxkR/ASeMmlUS1ilCIBXdmWm1m5pg/0Y+mzFQVrclIhY11H+zWbFDXwfkDlHjHrAHA7svMKGzWheFcxUmpwWdwWwxhqLgds6FEAyp7OK8Rbwm/3R+3BZBjCjP6hFRRxO4G96DnVWVMi9kBpzmbND6JpII8meYwbAZqu20/WFcQqmXcZRA2Vv5e01SmKH1hesdDXMPjzCQDiPZlvuviRFvdwTbdmAYfm4PpTxKzwXQ2EJ7UbusWE/sq1VTFr5ZfT4d5khH3bBOfzMqXxMeC/a/Dn0nEt5pnXnwBl3nLFXJEsZF7IWmnIdVwQEya6Bq4E7dy9P1XtRoeO9dUzKD04uLpM7Cj5DOGGznTzyXEo3mTOnJ29AxdWvkr59Nx6Di6inTrnmxzJx3a11WT382zIjW6bTKoy/H+Iy6oHlZ+kAAAAASUVORK5CYII=
// @grant			GM_xmlhttpRequest
// @grant			GM_download
// @grant			GM_setValue
// @grant			GM_getValue
// @grant			GM_registerMenuCommand
// @grant			unsafeWindow
// @require			https://fastly.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js
// @require			https://fastly.jsdelivr.net/npm/ajax-hook@3.0.1/dist/ajaxhook.min.js
// @require			https://fastly.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js
// @connect 45.127.129.8
// @connect 126.net
// ==/UserScript==

(function() {
    'use strict';
    // 备用CDN
    // https://raw.githubusercontent.com/Cinvin/cdn/main/artist/
    // https://gcore.jsdelivr.net/gh/Cinvin/cdn@latest/artist/
    const baseCDNURL='https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/'
    //svip:超清母带,沉浸环绕声,vip:高清环绕声,Hi-Res,无损
    const levelOptions={jymaster:'超清母带',sky:'沉浸环绕声',jyeffect:'高清环绕声',hires:'Hi-Res',lossless:'无损',exhigh:'极高',higher:'较高',standard:'标准'}
    const levelWeight={jymaster:8,sky:7,jyeffect:6,hires:5,lossless:4,exhigh:3,higher:2,standard:1,none:0}
    const defaultOfDEFAULT_LEVEL='jymaster'
    const uploadChunkSize=8*1024*1024
    const player=unsafeWindow.top.player
    const songMark={explicit:1048576}

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
        if(!config.cookie) config.cookie = 'os=android;appver=8.20.30'
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
        let secondTotal = Math.floor(dt / 1000)
        let min = Math.floor(secondTotal / 60)
        let sec = secondTotal % 60
        return min.toString()
            .padStart(2, '0') + ':' + sec.toString()
            .padStart(2, '0')
    };
    function levelDesc(level) {
        return levelOptions[level]||level
    };
    function sleep(millisec) {
        return new Promise(resolve => setTimeout(resolve, millisec));
    };

    function getArtistTextInSongDetail(song){
        let artist=''
        if(song.ar&&song.ar[0].name&&song.ar[0].name.length>0){
            artist=song.ar.map(ar => ar.name).join()
        }
        else if(song.pc&&song.pc.ar&&song.pc.ar.length>0){
            artist=song.pc.ar
        }
        return artist
    }
    function getAlbumTextInSongDetail(song){
        let album=''
        if(song.al&&song.al.name&&song.al.name.length>0){
            album=song.al.name
        }
        else if(song.pc&&song.pc.alb&&song.pc.alb.length>0){
            album=song.pc.alb
        }
        return album
    }
    function nameFileWithoutExt(title,artist,out){
        if(out=='title'||!artist||artist.length==0){
            return title
        }
        if(out=='artist-title'){
            return `${artist} - ${title}`
        }
        if(out=='title-artist'){
            return `${title} - ${artist}`
        }
    }

    //下载后上传
    class ncmDownUpload{
        constructor(songs,showfinishBox=true,onSongDUSuccess=null,onSongDUFail=null,out='artist-title') {
            this.songs = songs
            this.currentIndex = 0
            this.failSongs = []
            this.out=out
            this.showfinishBox=showfinishBox
            this.onSongDUSuccess=onSongDUSuccess
            this.onSongDUFail=onSongDUFail
            //song:{api:{url,data},id,title,artist,album}
        };
        startUpload(){
            this.currentIndex = 0
            this.failSongs = []
            if(this.songs.length>0){
                this.uploadSong(this.songs[0])
            }
        }
        uploadSong(song) {
            try{
                weapiRequest(song.api.url, {
                    type: "json",
                    data: song.api.data,
                    onload: (responses) => {
                        showTips(`(1/6)${song.title} 获取文件信息完成`,1)
                        let content = JSON.parse(responses.response);
                        //console.log(content)
                        let resData=content.data[0]||content.data
                        if (resData.url != null) {
                            song.fileFullName = nameFileWithoutExt(song.title,song.artist,this.out) + '.' + resData.type.toLowerCase()
                            song.dlUrl = resData.url
                            song.md5 = resData.md5
                            song.size = resData.size
                            song.ext = resData.type.toLowerCase()
                            song.bitrate = Math.floor(resData.br/1000)
                            //是否直接import
                            let songCheckData=[{
                                md5:song.md5,
                                songId: song.id,
                                bitrate: song.bitrate,
                                fileSize:song.size,
                            }]
                            weapiRequest("/api/cloud/upload/check/v2", {
                                method: "POST",
                                type: "json",
                                data: {
                                    uploadType: 0,
                                    songs: JSON.stringify(songCheckData),
                                },
                                onload: (responses1) => {
                                    let res1 = JSON.parse(responses1.response)
                                    console.log(song.title, '1.检查资源', res1)
                                    if (res1.code != 200 || res1.data.length<1) {
                                        this.uploadSongFail(song)
                                        return
                                    }
                                    showTips(`(2/6)${song.title} 检查资源`,1)
                                    song.cloudId=res1.data[0].songId
                                    if(res1.data[0].upload==1){
                                        this.uploadSongWay1Part1(song)
                                    }
                                    else if(res1.data[0].upload==2){
                                        this.uploadSongWay2Part1(song)
                                    }
                                    else{
                                        this.uploadSongWay3Part1(song)
                                    }
                                },
                                onerror: (res) => {
                                    console.error(song.title, '1.检查资源', res)
                                    this.uploadSongFail(song)
                                }
                            })
                        }
                        else{
                            this.uploadSongFail(song)
                        }
                    },
                    onerror: (res) => {
                        console.error(song.title, '0.获取URL', res)
                        this.uploadSongFail(song)
                    }
                })
            }
            catch (e) {
                console.error(e);
                this.uploadSongFail(song)
            }
        }
        uploadSongWay1Part1(song){
            let importSongData=[{
                songId:song.cloudId,
                bitrate:song.bitrate,
                song:nameFileWithoutExt(song.title,song.artist,this.out),
                artist:song.artist,
                album:song.album,
                fileName:song.fileFullName
            }]
            //step2 导入歌曲
            try{
                weapiRequest("/api/cloud/user/song/import", {
                    method: "POST",
                    type: "json",
                    data: {
                        uploadType: 0,
                        songs: JSON.stringify(importSongData),
                    },
                    onload: (responses) => {
                        let res=JSON.parse(responses.response)
                        console.log(song.title, '2.导入文件', res)
                        if (res.code != 200 || res.data.successSongs.length<1) {
                            console.error(song.title, '2.导入文件', res)
                            this.uploadSongFail(song)
                            return
                        }
                        showTips(`(2/6)${song.title} 2.导入文件完成`,1)
                        song.cloudSongId=res.data.successSongs[0].song.songId
                        this.uploadSongMatch(song)
                    },
                    onerror: (responses2) => {
                        console.error(song.title, '2.导入歌曲', responses2)
                        this.uploadSongFail(song)
                    }
                })
            }
            catch (e) {
                console.error(e);
                this.uploadSongFail(song)
            }
        }
        uploadSongWay2Part1(song){
            try{
                weapiRequest("/api/nos/token/alloc", {
                    method: "POST",
                    type: "json",
                    data: {
                        filename: song.fileFullName,
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
                            console.error(song.title, '2.获取令牌', res2)
                            this.uploadSongFail(song)
                            return
                        }
                        song.resourceId=res2.result.resourceId
                        showTips(`(3/6)${song.title} 获取令牌完成`,1)
                        console.log(song.title, '2.获取令牌', res2)
                        showTips(`(3/6)${song.title} 开始上传文件`,1)
                        this.uploadSongPart2(song)
                    },
                    onerror: (res) => {
                        console.error(song.title, '2.获取令牌', res)
                        this.uploadSongFail(song)
                    }
                })
            }
            catch (e) {
                console.error(e);
                this.uploadSongFail(song)
            }
        }
        uploadSongPart2(song){
            //上传文件
            showTips(`(3.1/6)${song.title} 开始下载文件`,1)
            try{
                GM_xmlhttpRequest({
                    method: "GET",
                    url: song.dlUrl,
                    headers: {
                        "Content-Type": "audio/mpeg"
                    },
                    responseType: "blob",
                    onload: (response) => {
                        showTips(`(3.2/6)${song.title} 文件下载完成`,1)
                        let buffer=response.response
                        //step2 上传令牌
                        weapiRequest("/api/nos/token/alloc", {
                            method: "POST",
                            type: "json",
                            data: {
                                filename: song.fileFullName,
                                length: song.size,
                                ext: song.ext,
                                type: 'audio',
                                bucket: 'jd-musicrep-privatecloud-audio-public',
                                local: false,
                                nos_product: 3,
                                md5: song.md5
                            },
                            onload: (responses2) => {
                                let tokenRes=JSON.parse(responses2.response)
                                song.token=tokenRes.result.token
                                song.objectKey = tokenRes.result.objectKey
                                console.log(song.title, '2.2.开始上传', tokenRes)
                                showTips(`(3.3/6)${song.title} 开始上传文件`,1)
                                this.uploadFile(buffer,song,0)
                            },
                            onerror: (responses2) => {
                                console.error(song.title, '2.1.获取令牌', responses2)
                                this.uploadSongFail(song)
                            }
                        })
                    }
                })
            }
            catch (e) {
                console.error(e);
                this.uploadSongFail(song)
            }
        }
        uploadFile(data,song,offset,context=null){
            let complete=offset+uploadChunkSize>song.size
            let url=`http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${encodeURIComponent(song.objectKey)}?offset=${offset}&complete=${String(complete)}&version=1.0`
            if (context) url += `&context=${context}`
            GM_xmlhttpRequest({
                method: "POST",
                url: url,
                headers: {
                    'x-nos-token': song.token,
                    'Content-MD5': song.md5,
                    'Content-Type': 'audio/mpeg',
                },
                data: data.slice(offset,offset+uploadChunkSize),
                onload: (response3) => {
                    let res=JSON.parse(response3.response)
                    if(complete){
                        console.log(song.title, '2.5.上传文件完成', res)
                        showTips(`(4/6)${song.title} 上传文件完成`,1)
                        this.uploadSongPart3(song)
                    }
                    else{
                        showTips(`(4/6)${song.title} 正在上传${fileSizeDesc(res.offset)}/${fileSizeDesc(song.size)}`,1)
                        this.uploadFile(data,song,res.offset,res.context)
                    }
                },
                onerror: (response3) => {
                    console.error(song.title, '文件上传时失败', response3)
                    this.uploadSongFail(song)
                },
            });
        }
        uploadSongWay3Part1(song){
            try{
                weapiRequest("/api/nos/token/alloc", {
                    method: "POST",
                    type: "json",
                    data: {
                        filename: song.fileFullName,
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
                            console.error(song.title, '2.获取令牌', res2)
                            this.uploadSongFail(song)
                            return
                        }
                        song.resourceId=res2.result.resourceId
                        showTips(`(3/6)${song.title} 获取令牌完成`,1)
                        console.log(song.title, '2.获取令牌', res2)
                        this.uploadSongPart3(song)
                    },
                    onerror: (res) => {
                        console.error(song.title, '2.获取令牌', res)
                        this.uploadSongFail(song)
                    }
                })
            }
            catch (e) {
                console.error(e);
                this.uploadSongFail(song)
            }
        }
        uploadSongPart3(song){
            //step3 提交
            try{
                console.log(song)
                weapiRequest("/api/upload/cloud/info/v2", {
                    method: "POST",
                    type: "json",
                    data: {
                        md5: song.md5,
                        songid: song.cloudId,
                        filename: song.fileFullName,
                        song: song.title,
                        album: song.album,
                        artist: song.artist,
                        bitrate: String(song.bitrate),
                        resourceId: song.resourceId,
                    },
                    onload: (responses3) => {
                        let res3 = JSON.parse(responses3.response)
                        if (res3.code != 200) {
                            if(song.expireTime<Date.now()||(res3.msg&&res3.msg.includes('rep create failed'))){
                                console.error(song.title, '3.提交文件', res3)
                                this.uploadSongFail(song)
                            }
                            else{
                                console.log(song.title, '3.正在转码', res3)
                                showTips(`(5/6)${song.title} 正在转码...`,1)
                                sleep(1000).then(()=>{
                                    this.uploadSongPart3(song)
                                })
                            }
                            return
                        }
                        console.log(song.title, '3.提交文件', res3)
                        showTips(`(5/6)${song.title} 提交文件完成`,1)
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
                                    console.error(song.title, '4.发布资源', res4)
                                    this.uploadSongFail(song)
                                    return
                                }
                                console.log(song.title, '4.发布资源', res4)
                                showTips(`(5/6)${song.title} 提交文件完成`,1)
                                song.cloudSongId=res4.privateCloud.songId
                                this.uploadSongMatch(song)
                            },
                            onerror: (res)=> {
                                console.error(song.title, '4.发布资源', res)
                                this.uploadSongFail(song)
                            }
                        })
                    },
                    onerror: (res)=>{
                        console.error(song.title, '3.提交文件', res)
                        this.uploadSongFail(song)
                    }
                });
            }
            catch (e) {
                console.error(e);
                this.uploadSongFail(song)
            }
        }
        uploadSongMatch(song){
            //step5 关联
            if (song.cloudSongId != song.id) {
                weapiRequest("/api/cloud/user/song/match", {
                    method: "POST",
                    type: "json",
                    sync: true,
                    data: {
                        songId: song.cloudSongId,
                        adjustSongId: song.id,
                    },
                    onload: (responses5) => {
                        let res5 = JSON.parse(responses5.response)
                        if (res5.code != 200) {
                            console.error(song.title, '5.匹配歌曲', res5)
                            this.uploadSongFail(song)
                            return
                        }
                        console.log(song.title, '5.匹配歌曲', res5)
                        console.log(song.title, '完成')
                        //完成
                        showTips(`(6/6)${song.title} 上传完成`,1)
                        this.uploadSongSuccess(song)
                    },
                    onerror: (res)=> {
                        console.error(song.title, '5.匹配歌曲', res)
                        this.uploadSongFail(song)
                    }
                })
            } else {
                console.log(song.title, '完成')
                //完成
                showTips(`(6/6)${song.title} 上传完成`,1)
                this.uploadSongSuccess(song)
            }
        }
        uploadSongFail(song){
            showTips(`${song.title} 上传失败`,2)
            this.failSongs.push(song)
            if (this.onSongDUFail) this.onSongDUFail(song)
            this.uploadNextSong()
        }
        uploadSongSuccess(song){
            if (this.onSongDUSuccess) this.onSongDUSuccess(song)
            this.uploadNextSong()
        }
        uploadNextSong(){
            this.currentIndex += 1;
            if(this.currentIndex<this.songs.length){
                this.uploadSong(this.songs[this.currentIndex])
            }
            else{
                let msg=this.failSongs==0?`${this.songs[0].title}上传完成`:`${this.songs[0].title}上传失败`
                if(this.songs.length>1) msg=this.failSongs==0?'全部上传完成':`上传完毕,存在${this.failSongs.length}首上传失败的歌曲.它们为:${this.failSongs.map(song=>song.title).join()}`
                if(this.showfinishBox){
                    showConfirmBox(msg)
                }
            }
        }
    }

    //歌曲页
    if (location.href.includes('song')) {
        let cvrwrap = document.querySelector(".cvrwrap")
        if (cvrwrap) {
            let songId = new URLSearchParams(location.search).get('id')
            let songTitle = document.head.querySelector("[property~='og:title'][content]")?.content
            let songArtist = document.head.querySelector("[property~='og:music:artist'][content]")?document.head.querySelector("[property~='og:music:artist'][content]").content.replaceAll('/',','):''
            let songAlbum = document.head.querySelector("[property~='og:music:album'][content]")?document.head.querySelector("[property~='og:music:album'][content]"):''
            //songRedCount
            let songRedCountDiv = document.createElement('div');
            songRedCountDiv.className = "out s-fc3"
            let songRedCountP = document.createElement('p');
            songRedCountP.innerHTML = '红心数量:';
            songRedCountDiv.style.display = "none"
            songRedCountDiv.appendChild(songRedCountP)
            cvrwrap.appendChild(songRedCountDiv)

            //songdownload
            let songDownloadDiv = document.createElement('div');
            songDownloadDiv.className = "out s-fc3"
            let songDownloadP = document.createElement('p');
            songDownloadP.innerHTML = '歌曲下载:';
            songDownloadDiv.style.display = "none"
            songDownloadDiv.appendChild(songDownloadP)
            cvrwrap.appendChild(songDownloadDiv)
            let songUploadDiv = document.createElement('div');
            songUploadDiv.className = "out s-fc3"
            let songUploadP = document.createElement('p');
            songUploadP.innerHTML = '转存云盘:';
            songUploadDiv.style.display = "none"
            songUploadDiv.appendChild(songUploadP)
            cvrwrap.appendChild(songUploadDiv)

            //lyricDownload
            let lrcDownloadDiv = document.createElement('div');
            lrcDownloadDiv.className = "out s-fc3"
            let lrcDownloadP = document.createElement('p');
            lrcDownloadP.innerHTML = '歌词下载:';
            lrcDownloadDiv.style.display = "none"
            lrcDownloadDiv.appendChild(lrcDownloadP)
            cvrwrap.appendChild(lrcDownloadDiv)
            let lyricObj = {}

            //songMark
            let songMarkDiv = document.createElement('div');
            songMarkDiv.className = "out s-fc3"
            let songMarkP = document.createElement('p');
            songMarkP.innerHTML = '<b>🅴：</b>内容含有不健康因素';
            songMarkDiv.style.display = "none"
            songMarkDiv.appendChild(songMarkP)
            cvrwrap.appendChild(songMarkDiv)

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
                    this.filename = nameFileWithoutExt(songTitle,songArtist,'artist-title')
                };
                getNCMSource() {
                    weapiRequest("/api/batch", {
                        type: "json",
                        data: {
                            '/api/v3/song/detail': JSON.stringify({c: JSON.stringify([{ 'id': songId}])}),
                            '/api/song/music/detail/get': JSON.stringify({'songId':songId,'immerseType': 'ste'}),
                        },
                        onload: (responses) => {
                            //example songid:1914447186
                            let res = JSON.parse(responses.response)
                            //console.log(res)
                            //脏标
                            if((res["/api/v3/song/detail"].songs[0].mark & songMark.explicit) == songMark.explicit){
                                songMarkDiv.style.display = "inline"
                            }
                            let channel='pl'
                            let plLevel=res["/api/v3/song/detail"].privileges[0].plLevel
                            let dlLevel=res["/api/v3/song/detail"].privileges[0].dlLevel
                            let songWeight=levelWeight[plLevel]
                            if(res["/api/v3/song/detail"].privileges[0].fee==0&&dlLevel!="none"&&plLevel!=dlLevel){
                                channel='dl'
                                songWeight=Math.max(songWeight,levelWeight[dlLevel])
                            }
                            if (res["/api/v3/song/detail"].privileges[0].cs) {
                                this.createDLButton(`云盘文件(${levelDesc(plLevel)})`,'standard','pl')
                            }
                            else if(channel=='pl'){
                                let songDetail=res["/api/song/music/detail/get"].data
                                if(songDetail.l && songWeight>=1) {let desc=`标准(${Math.round(songDetail.l.br/1000)}k/${fileSizeDesc(songDetail.l.size)})`;let level='standard';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.m && songWeight>=2) {let desc=`较高(${Math.round(songDetail.m.br/1000)}k/${fileSizeDesc(songDetail.m.size)})`;let level='higher';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.h && songWeight>=3) {let desc=`极高(${Math.round(songDetail.h.br/1000)}k/${fileSizeDesc(songDetail.h.size)})`;let level='exhigh';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.sq && songWeight>=4) {let desc=`无损(${Math.round(songDetail.sq.br/1000)}k/${fileSizeDesc(songDetail.sq.size)})`;let level='lossless';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.hr && songWeight>=4) {let desc=`Hi-Res(${Math.round(songDetail.hr.br/1000)}k/${songDetail.hr.sr/1000}kHz/${fileSizeDesc(songDetail.hr.size)})`;let level='hires';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.je && songWeight>=4) {let desc=`高清环绕声(${Math.round(songDetail.je.br/1000)}k/${songDetail.je.sr/1000}kHz/${fileSizeDesc(songDetail.je.size)})`;let level='jyeffect';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.sk && songWeight>=7) {let desc=`沉浸环绕声(${Math.round(songDetail.sk.br/1000)}k/${songDetail.sk.sr/1000}kHz/${fileSizeDesc(songDetail.sk.size)})`;let level='sky';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.jm && songWeight>=7) {let desc=`超清母带(${Math.round(songDetail.jm.br/1000)}k/${songDetail.jm.sr/1000}kHz/${fileSizeDesc(songDetail.jm.size)})`;let level='jymaster';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                            }
                            else if(channel=='dl'){
                                let songDetail=res["/api/song/music/detail/get"].data
                                if(songDetail.l && songWeight>=1) {let desc=`标准(${Math.round(songDetail.l.br/1000)}k/${fileSizeDesc(songDetail.l.size)})`;let level='standard';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.m && songWeight>=2) {let desc=`较高(${Math.round(songDetail.m.br/1000)}k/${fileSizeDesc(songDetail.m.size)})`;let level='higher';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.h && songWeight>=3) {let desc=`极高(${Math.round(songDetail.h.br/1000)}k/${fileSizeDesc(songDetail.h.size)})`;let level='exhigh';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.sq && songWeight>=4) {let desc=`无损(${Math.round(songDetail.sq.br/1000)}k/${fileSizeDesc(songDetail.sq.size)})`;let level='lossless';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.hr && songWeight>=5) {let desc=`Hi-Res(${Math.round(songDetail.hr.br/1000)}k/${songDetail.hr.sr/1000}kHz/${fileSizeDesc(songDetail.hr.size)})`;let level='hires';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.je && songWeight>=6) {let desc=`高清环绕声(${Math.round(songDetail.je.br/1000)}k/${songDetail.je.sr/1000}kHz/${fileSizeDesc(songDetail.je.size)})`;let level='jyeffect';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.sk && songWeight>=7) {let desc=`沉浸环绕声(${Math.round(songDetail.sk.br/1000)}k/${songDetail.sk.sr/1000}kHz/${fileSizeDesc(songDetail.sk.size)})`;let level='sky';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                                if(songDetail.jm && songWeight>=8) {let desc=`超清母带(${Math.round(songDetail.jm.br/1000)}k/${songDetail.jm.sr/1000}kHz/${fileSizeDesc(songDetail.jm.size)})`;let level='jymaster';this.createDLButton(desc,level,channel);this.createULButton(desc,level,channel)}
                            }
                        }
                    })
                };

                createDLButton(desc,level,channel) {
                    let btn = document.createElement('a');
                    btn.text = desc;
                    btn.className = "des s-fc7"
                    btn.style.margin = '2px';
                    btn.addEventListener('click', () => {
                        this.dwonloadSong(channel, level, btn)
                    })
                    songDownloadP.appendChild(btn)
                    songDownloadDiv.style.display = "inline"
                };

                dwonloadSong(channel,level, dlbtn) {
                    let api='/api/song/enhance/player/url/v1'
                    if(channel=='dl') api='/api/song/enhance/download/url/v1'
                    let data={ ids: JSON.stringify([songId]),level: level,encodeType: 'mp3'}
                    if(channel=='dl') data={ id: songId, level: level, encodeType: 'mp3'}
                    weapiRequest(api, {
                        type: "json",
                        data: data,
                        onload: (responses) => {
                            let content = JSON.parse(responses.response);
                            let resData=content.data[0]||content.data
                            if (resData.url != null) {
                                //console.log(content)
                                let fileFullName = nameFileWithoutExt(songTitle,songArtist,'artist-title') + '.' + resData.type.toLowerCase()
                                let url = resData.url
                                let btntext = dlbtn.text
                                GM_download({
                                    url: url,
                                    name: fileFullName,
                                    onprogress: function(e) {
                                        dlbtn.text = btntext + ` 正在下载(${fileSizeDesc(e.loaded)})`
				},
                                    onload: function() {
                                        dlbtn.text = btntext
                                    },
                                    onerror: function(e) {
                                        console.error(e)
                                        dlbtn.text = btntext + ' 下载失败'
                                    }
                                });
                            }
                            else{
                                showTips('下载失败',2)
                            }
                        }
                    })
                }

                createULButton(desc,level,channel) {
                    if(!unsafeWindow.GUser.userId) return
                    let apiUrl='/api/song/enhance/player/url/v1'
                    if(channel=='dl') apiUrl='/api/song/enhance/download/url/v1'
                    let data={ ids: JSON.stringify([songId]),level: level,encodeType: 'mp3'}
                    if(channel=='dl') data={ id: songId, level: level, encodeType: 'mp3'}
                    let api={url:apiUrl,data:data}
                    //song:{api:{url,data},id,title,artist,album}
                    let songItem={api:api,id:this.songId,title:this.title,artist:this.artists,album:this.album}
                    let btn = document.createElement('a');
                    btn.text = desc;
                    btn.className = "des s-fc7"
                    btn.style.margin = '2px';
                    btn.addEventListener('click', () => {
                        let ULobj=new ncmDownUpload([songItem])
                        ULobj.startUpload()
                    })
                    songUploadP.appendChild(btn)
                    songUploadDiv.style.display = "inline"
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

            //wiki
            weapiRequest("/api/song/play/about/block/page", {
                type: "json",
                data: {
                    songId: songId,
                },
                onload: function(responses) {
                    let content = JSON.parse(responses.response)
                    //console.log(content)
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

            //redccount
            weapiRequest("/api/song/red/count", {
                type: "json",
                data: {
                    songId: songId,
                },
                onload: function(responses) {
                    let content = JSON.parse(responses.response)
                    //console.log(content)
                    songRedCountP.innerHTML += content.data.count
                    songRedCountDiv.style.display = "inline"
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

    }

    //个人主页
    if (location.href.includes('user')) {
        let urlUserId = new URLSearchParams(location.search).get('id')
        let editArea = document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
        if (editArea && urlUserId == unsafeWindow.GUser.userId) {
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
                let begin = Math.floor(new Date().getTime() / 1000)
                let logs = []
                for (let i = begin; i < begin + 320; i++) {
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
                    cookie:'os=pc;appver=2.9.7',
                    data: {
                        logs: JSON.stringify(logs)
                    },
                    onload: (responses) => {
                        let res = JSON.parse(responses.response)
                        //console.log(res1)
                        if (res.code == 200) {
                            showConfirmBox('今日听歌量+300首完成')
                        }
                        else{
                            showConfirmBox('听歌量打卡失败。'+responses.response)
                        }
                    }
                })
            }

            //歌曲快传
            let btnUpload = document.createElement('a')
            btnUpload.id = 'cloudBtn'
            btnUpload.className = 'u-btn2 u-btn2-1'
            let btnUploadDesc = document.createElement('i')
            btnUploadDesc.innerHTML = '快速上传加载中'
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
            fetch(`${baseCDNURL}top.json`)
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
                btnUploadDesc.innerHTML = '云盘快速上传'
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
                fetch(`${baseCDNURL}${artistId}.json`)
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
                        threadMax: 2,
                        threadCount: 2,
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
                                this.batchUpload.threadCount = Math.min(this.batchUpload.songIndexs.length, this.batchUpload.threadMax)
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
                            let songslen = content.songs.length
                            let privilegelen = content.privileges.length
                            for (let i = 0; i < privilegelen; i++) {
                                if (!content.privileges[i].cs) {
                                    let config = uploader.config.data.find(item => {
                                        return item.id == content.privileges[i].id
                                    })
                                    let item = {
                                        id: content.privileges[i].id,
                                        name: '未知',
                                        album: '未知',
                                        albumid: 0,
                                        artists: '未知',
                                        tns: '', //翻译
                                        dt: duringTimeDesc(0),
                                        filename: '未知.' + config.ext,
                                        ext: config.ext,
                                        md5: config.md5,
                                        size: config.size,
                                        bitrate: config.bitrate,
                                        picUrl: 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg',
                                        isNoCopyright: content.privileges[i].st<0,
                                        isVIP: false,
                                        isPay: false,
                                        uploaded: false,
                                        needMatch:config.name == undefined,
                                    }
                                    for (let j = 0; j < songslen; j++) {
                                        if(content.songs[j].id==content.privileges[i].id){
                                            item.name = content.songs[j].name
                                            item.album = getAlbumTextInSongDetail(content.songs[j])
                                            item.albumid = content.songs[j].al.id || 0
                                            item.artists = getArtistTextInSongDetail(content.songs[j])
                                            item.tns = content.songs[j].tns ? content.songs[j].tns.join() : '' //翻译
                                            item.dt = duringTimeDesc(content.songs[j].dt || 0)
                                            item.filename = nameFileWithoutExt(item.name,item.artists,'artist-title') + '.' + config.ext
                                            item.picUrl = (content.songs[j].al && content.songs[j].al.picUrl) ? content.songs[j].al.picUrl : 'http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg'
                                            item.isVIP = content.songs[j].fee == 1
                                            item.isPay = content.songs[j].fee == 4
                                            break
                                        }
                                    }
                                    if (config.name) {
                                        item.name = config.name
                                        item.album = config.al
                                        item.artists = config.ar
                                        item.filename = nameFileWithoutExt(item.name,item.artists,'artist-title') + '.' + config.ext
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
                        let songCheckData=[{
                            md5:song.md5,
                            songId: song.id,
                            bitrate: song.bitrate,
                            fileSize:song.size,
                        }]
                        weapiRequest("/api/cloud/upload/check/v2", {
                            method: "POST",
                            type: "json",
                            data: {
                                uploadType: 0,
                                songs: JSON.stringify(songCheckData),
                            },
                            onload: (responses1) => {
                                let res1 = JSON.parse(responses1.response)
                                if (res1.code != 200) {
                                    console.error(song.name, '1.检查资源', res1)
                                    uploader.onUploadFail(songIndex)
                                    return
                                }
                                if(res1.data.length<1){
                                    if(song.id > 0){
                                        //被**的歌曲要id设为0
                                        uploader.songs[songIndex].id = 0
                                        uploader.uploadSong(songIndex)
                                    }
                                    else{
                                        console.error(song.name, '1.检查资源', res1)
                                        uploader.onUploadFail(songIndex)
                                    }
                                    return
                                }

                                console.log(song.name, '1.检查资源', res1)
                                song.cloudId=res1.data[0].songId
                                showTips(`(2/6)${song.name} 检查资源`,1)
                                if(res1.data[0].upload==1){
                                    uploader.uploadSongWay1Part1(songIndex)
                                }
                                else{
                                    uploader.uploadSongWay2Part1(songIndex)
                                }
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
                uploadSongWay1Part1(songIndex){
                    let song = this.songs[songIndex]
                    let uploader = this
                    let importSongData=[{
                        songId:song.cloudId,
                        bitrate:song.bitrate,
                        song:song.needMatch?nameFileWithoutExt(song.name,song.artists,'artist-title'):song.name,
                        artist:song.artists,
                        album:song.album,
                        fileName:song.filename,
                    }]
                    //step2 导入歌曲
                    try{
                        weapiRequest("/api/cloud/user/song/import", {
                            method: "POST",
                            type: "json",
                            data: {
                                uploadType: 0,
                                songs: JSON.stringify(importSongData),
                            },
                            onload: (responses) => {
                                let res=JSON.parse(responses.response)
                                if (res.code != 200 || res.data.successSongs.length<1) {
                                    console.error(song.name, '2.导入文件', res)
                                    uploader.onUploadFail(songIndex)
                                    return
                                }
                                console.log(song.name, '2.导入文件', res)
                                song.cloudSongId=res.data.successSongs[0].song.songId
                                uploader.uploadSongMatch(songIndex)
                            },
                            onerror: (responses2) => {
                                console.error(song.name, '2.导入歌曲', responses2)
                                uploader.onUploadFail(songIndex)
                            }
                        })
                    }
                    catch (e) {
                        console.error(e);
                        uploader.onUploadFail(songIndex)
                    }
                }
                uploadSongWay2Part1(songIndex){
                    let song = this.songs[songIndex]
                    let uploader = this
                    try{
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
                                let tokenRes=JSON.parse(responses2.response)
                                song.token=tokenRes.result.token
                                song.objectKey = tokenRes.result.objectKey
                                song.resourceId=tokenRes.result.resourceId
                                song.expireTime=Date.now()+60000
                                console.log(song.name, '2.2.开始上传', tokenRes)
                                uploader.uploadSongWay2Part2(songIndex)
                            },
                            onerror: (responses2) => {
                                console.error(song.name, '2.获取令牌', responses2)
                                uploader.onUploadFail(songIndex)
                            }
                        })
                    }
                    catch (e) {
                        console.error(e);
                        uploader.onUploadFail(songIndex)
                    }
                }
                uploadSongWay2Part2(songIndex){
                    let song = this.songs[songIndex]
                    let uploader = this
                    weapiRequest("/api/upload/cloud/info/v2", {
                        method: "POST",
                        type: "json",
                        data: {
                            md5: song.md5,
                            songid: song.cloudId,
                            filename: song.filename,
                            song: song.name,
                            album: song.album,
                            artist: song.artists,
                            bitrate: String(song.bitrate||128),
                            resourceId: song.resourceId,
                        },
                        onload: (responses3) => {
                            let res3 = JSON.parse(responses3.response)
                            if (res3.code != 200) {
                                if(song.expireTime<Date.now()||(res3.msg&&res3.msg.includes('rep create failed'))){
                                    console.error(song.name, '3.提交文件', res3)
                                    uploader.onUploadFail(songIndex)
                                }
                                else{
                                    console.log(song.name, '3.正在转码', res3)
                                    sleep(1000).then(()=>{
                                        uploader.uploadSongWay2Part2(songIndex)
                                    })
                                }
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
                                    song.cloudSongId=res4.privateCloud.songId
                                    //step5 关联
                                    uploader.uploadSongMatch(songIndex)
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
                }
                uploadSongMatch(songIndex){
                    let song = this.songs[songIndex]
                    let uploader = this
                    if (song.cloudSongId != song.id && song.id > 0) {
                        weapiRequest("/api/cloud/user/song/match", {
                            method: "POST",
                            type: "json",
                            sync: true,
                            data: {
                                songId: song.cloudSongId,
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
            btnMatchDesc.innerHTML = '云盘匹配纠正'
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
                            //console.log(res)
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
                        if (song.simpleSong.al && song.simpleSong.al.picUrl) {
                            picUrl = song.simpleSong.al.picUrl
                        }
                        if (song.simpleSong.al && song.simpleSong.al.name && song.simpleSong.al.name.length>0) {
                            album = song.simpleSong.al.name
                        }
                        let artist = song.artist
                        if (song.simpleSong.ar) {
                            let artist2 = ''
                            let arcount = 0
                            song.simpleSong.ar.forEach(ar => {
                                if (ar.name) {
                                    if(ar.id>0) artist2 += `<a target="_blank" href="https://music.163.com/artist?id=${ar.id}">${ar.name}<a>,`
                                    else artist2 += ar.name + ','
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
                        tablerow.innerHTML = `<td><button type="button" class="swal2-styled">匹配</button></td><td><a class="album-link"><img src="${picUrl}?param=50y50&quality=100" title="${album}"></a></td><td><a class="song-link" target="_blank" href="https://music.163.com/song?id=${song.simpleSong.id}">${song.simpleSong.name}</a></td><td>${artist}</td><td>${duringTimeDesc(song.simpleSong.dt)}</td><td>${fileSizeDesc(song.fileSize)} ${levelDesc(song.simpleSong.privilege.plLevel)}</td><td>${addTime}</td>`
						if (song.simpleSong.al && song.simpleSong.al.id > 0) {
                            let albumLink = tablerow.querySelector('.album-link')
                            albumLink.href = 'https://music.163.com/album?id=' + song.simpleSong.al.id
                            albumLink.target = "_blank"
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
                                if (matcher.filter.notMatch && song.simpleSong.cd) {
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
                        didOpen: () => {
                            let titleDOM = Swal.getTitle()
                            weapiRequest("/api/song/enhance/player/url/v1", {
                                type: "json",
                                data: {
                                    immerseType:'ste',
                                    ids: JSON.stringify([song.simpleSong.id]),
                                    level: 'standard',
                                    encodeType: 'mp3'
                                },
                                onload: (responses) => {
                                    let content = JSON.parse(responses.response)
                                    titleDOM.innerHTML+=' 文件时长'+duringTimeDesc(content.data[0].time)
                                }
                            })
                        }
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

            //音质升级
            let btnUpgrade = document.createElement('a')
            btnUpgrade.id = 'upgradeBtn'
            btnUpgrade.className = 'u-btn2 u-btn2-1'
            let btnUpgradeDesc = document.createElement('i')
            btnUpgradeDesc.innerHTML = '云盘音质提升'
            btnUpgrade.appendChild(btnUpgradeDesc)
            btnUpgrade.setAttribute("hidefocus", "true");
            btnUpgrade.style.marginRight = '10px';
            btnUpgrade.addEventListener('click', ShowCloudUpgradePopUp)
            editArea.insertBefore(btnUpgrade, editArea.lastChild)
            function ShowCloudUpgradePopUp() {
                Swal.fire({
                    title: '云盘音质提升',
                    input: 'select',
                    inputOptions: {lossless:'无损',hires:'Hi-Res'},
                    inputPlaceholder: '选择目标音质',
                    confirmButtonText: '下一步',
                    showCloseButton: true,
                    footer: '寻找网易云音源比云盘音质好的歌曲,然后进行替换<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
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
                weapiRequest(`/api/v1/user/detail/${urlUserId}`, {
                    method: "POST",
                    type: "json",
                    onload: (responses) => {
                        let res = JSON.parse(responses.response)
                        if (res.profile.vipType<=10){
                            showConfirmBox('当前不是会员,无法获取无损以上音源,领取个会员礼品卡再来吧。')
                        }
                        else{
                            let upgrade=new Upgrader(level)
                            upgrade.start()
                        }
                    }
                })
            }
            class Upgrader {
                constructor(level) {
                    this.targetLevel = level
                    this.targetWeight=levelWeight[level]
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
                    this.batchUpgrade= {
                        threadMax: 1,
                        threadCount: 1,
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
  width: 16%;
}
 tr th:nth-child(5),tr td:nth-child(6){
  width: 16%;
}
</style>
<input id="text-filter" class="swal2-input" type="text" placeholder="歌曲过滤">
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
                                footer:footer
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
                                this.batchUpgrade.working = true
                                this.batchUpgrade.finnishThread = 0
                                this.batchUpgrade.threadCount = Math.min(this.batchUpgrade.songIndexs.length, this.batchUpgrade.threadMax)
                                for (let i = 0; i < this.batchUpgrade.threadCount; i++) {
                                    this.upgradeSong(this.batchUpgrade.songIndexs[i])
                                }
                            })
                            this.fetchSongInfo()
                        },
                    })
                }
                fetchSongInfo() {
                    //获取需上传的song
                    this.popupObj.tbody.innerHTML = '正在查找云盘歌曲...'
                    this.fetchCloudSongInfoSub(0,[])
                }
                fetchCloudSongInfoSub(offset,songIds) {
                    let upgrader = this
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
                            upgrader.popupObj.tbody.innerHTML = `正在搜索第${offset+1}到${Math.min(offset+1000,res.count)}云盘歌曲`
							res.data.forEach(song => {
                                if (song.simpleSong.privilege.toast) return
                                if (song.simpleSong.privilege.fee==4) return
                                if (song.simpleSong.privilege.playMaxBrLevel!="lossless") return
                                let cloudWeight=levelWeight[song.simpleSong.privilege.plLevel]||0
                                let ncmMaxWeight=levelWeight[song.simpleSong.privilege.playMaxBrLevel]
                                if(cloudWeight>=this.targetWeight) return
                                songIds.push({'id':song.simpleSong.id})
                                upgrader.popupObj.tbody.innerHTML = `正在搜索第${offset+1}到${Math.min(offset+1000,res.count)}云盘歌曲 找到${songIds.length}首可能有提升的歌曲`
                            })
                            if (res.hasMore) {
                                //if(offset<2000){//testing
                                res = {}
                                upgrader.fetchCloudSongInfoSub(offset + 1000,songIds)
                            } else {
                                upgrader.filterTargetLevelSongSub(0,songIds)
                            }
                        }
                    })
                }
                filterTargetLevelSongSub(offset,songIds){
                    let upgrader = this
                    upgrader.popupObj.tbody.innerHTML = `正在确认${songIds.length}首潜在歌曲是否有目标音质`
                    if(offset>=songIds.length){
                        upgrader.createTableRow()
                        upgrader.applyFilter()
                        return
                    }
                    weapiRequest("/api/v3/song/detail", {
                        type: "json",
                        method: "post",
                        sync: true,
                        data: {
                            c: JSON.stringify(songIds.slice(offset, offset + 1000))
                        },
                        onload: function(responses) {
                            let content = JSON.parse(responses.response)
                            let songlen = content.songs.length
                            let privilegelen = content.privileges.length
                            for (let i = 0; i < songlen; i++) {
                                for (let j = 0; j < privilegelen; j++) {
                                    if(content.songs[i].id==content.privileges[j].id){
                                        let songItem={
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
                                        let cloudBr=content.songs[i].pc.br
                                        if(upgrader.targetLevel=='lossless'&&content.songs[i].sq){
                                            songItem.fileinfo={originalLevel:content.privileges[j].plLevel,originalBr:content.songs[i].pc.br,tagetBr:Math.round(content.songs[i].sq.br/1000)}
                                            upgrader.songs.push(songItem)
                                        }
                                        else if(upgrader.targetLevel=='hires'&&content.songs[i].hr){
                                            songItem.fileinfo={originalLevel:content.privileges[j].plLevel,originalBr:content.songs[i].pc.br,tagetBr:Math.round(content.songs[i].hr.br/1000)}
                                            upgrader.songs.push(songItem)
                                        }
                                        break
                                    }
                                }


                            }
                            upgrader.filterTargetLevelSongSub(offset+1000,songIds)
                        }
                    })
                }
                createTableRow() {
                    let tagetLevelDesc=levelDesc(this.targetLevel)
                    for (let i = 0; i < this.songs.length; i++) {
                        let song = this.songs[i]
                        let tablerow = document.createElement('tr')
                        tablerow.innerHTML = `<td><button type="button" class="swal2-styled">提升</button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${levelDesc(song.fileinfo.originalLevel)} ${song.fileinfo.originalBr}k</td><td>${tagetLevelDesc} ${song.fileinfo.tagetBr}k</td>`
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
                        weapiRequest("/api/cloud/user/song/match", {
                            method: "POST",
                            type: "json",
                            sync: true,
                            data: {
                                songId: song.id,
                                adjustSongId: 0,
                            },
                            onload: (responses) => {
                                let res = JSON.parse(responses.response)
                                console.log(res)
                                if (res.code == 200) {
                                    showTips(`${song.name}解绑成功`, 1)
                                    song.originalId=res.matchData.songId
                                    let songItem={api:{url:'/api/song/enhance/player/url/v1',data:{ ids: JSON.stringify([song.id]) ,level: upgrade.targetLevel, encodeType: 'mp3'}},id:song.id,title:song.name,artist:song.artists,album:song.album,songIndex:songIndex,Upgrader:this}
                                    let ULobj=new ncmDownUpload([songItem],false,this.onUploadSuccess,this.onUploadFail)
                                    ULobj.startUpload()
                                } else {
                                    showTips(`${song.name}解绑失败`, 2)
                                    upgrade.onUpgradeFail(songIndex)
                                }
                            },
                        })

                    } catch (e) {
                        console.error(e);
                        upgrade.onUpgradeFail(songIndex)
                    }
                }
                onUploadFail(ULsong){
                    let song = ULsong.Upgrader.songs[ULsong.songIndex]
                    try {
                        weapiRequest("/api/cloud/user/song/match", {
                            method: "POST",
                            type: "json",
                            sync: true,
                            data: {
                                songId: song.originalId,
                                adjustSongId: song.id,
                            },
                            onload: (responses) => {
                                let res = JSON.parse(responses.response)
                                console.log(res)
                                if (res.code != 200) {
                                    showTips(`${song.name} 重新关联失败`, 2)
                                }
                                ULsong.Upgrader.onUpgradeFail(ULsong.songIndex)
                            },
                        })

                    } catch (e) {
                        console.error(e);
                        ULsong.Upgrader.onUpgradeFail(ULsong.songIndex)
                    }
                }
                onUploadSuccess(ULsong){
                    let song = ULsong.Upgrader.songs[ULsong.songIndex]
                    try {
                        weapiRequest("/api/cloud/del", {
                            method: "POST",
                            type: "json",
                            sync: true,
                            data: {
                                songIds: [song.originalId],
                            },
                            onload: (responses) => {
                                ULsong.Upgrader.onUpgradeSucess(ULsong.songIndex)
                            },
                        })

                    } catch (e) {
                        console.error(e);
                        ULsong.Upgrader.onUpgradeFail(ULsong.songIndex)
                    }
                }
                onUpgradeFail(songIndex) {
                    let song = this.songs[songIndex]
                    showTips(`${song.name} 音质提升失败`, 2)
                    this.onUpgradeFinnsh(songIndex)
                }
                onUpgradeSucess(songIndex) {
                    let song = this.songs[songIndex]
                    showTips(`${song.name} 音质提升成功`, 1)
                    song.upgraded = true
                    let btnUpgrade = song.tablerow.querySelector('button')
                    btnUpgrade.innerHTML = '已提升'
                    btnUpgrade.disabled = 'disabled'
                    this.onUpgradeFinnsh(songIndex)
                }
                onUpgradeFinnsh(songIndex) {
                    if (this.batchUpgrade.working) {
                        let batchSongIdx = this.batchUpgrade.songIndexs.indexOf(songIndex)
                        if (batchSongIdx + this.batchUpgrade.threadCount < this.batchUpgrade.songIndexs.length) {
                            this.upgradeSong(this.batchUpgrade.songIndexs[batchSongIdx + this.batchUpgrade.threadCount])
                        } else {
                            this.batchUpgrade.finnishThread += 1
                            if (this.batchUpgrade.finnishThread == this.batchUpgrade.threadCount) {
                                this.batchUpgrade.working = false
                                this.renderFilterInfo()
                                showTips('歌曲提升完成', 1)
                            }
                        }
                    } else {
                        this.renderFilterInfo()
                    }
                }
            }

            //本地上传
            let btnLocalUpload = document.createElement('a')
            btnLocalUpload.id = 'localuploadBtn'
            btnLocalUpload.className = 'u-btn2 u-btn2-1'
            let btnLocalUploadDesc = document.createElement('i')
            btnLocalUploadDesc.innerHTML = '云盘本地上传'
            btnLocalUpload.appendChild(btnLocalUploadDesc)
            btnLocalUpload.setAttribute("hidefocus", "true");
            btnLocalUpload.style.marginRight = '10px';
            btnLocalUpload.addEventListener('click', ShowLocalUploadPopUp)
            editArea.insertBefore(btnLocalUpload, editArea.lastChild)
            function ShowLocalUploadPopUp() {
                Swal.fire({
                    title: '云盘本地上传',

                    html:`<div id="my-file">
                    <input id='song-file' type="file" accept="audio/*" multiple="multiple" class="swal2-file" placeholder="" style="display: flex;">
                    </div>
                    <div id="my-rd">
                    <div class="swal2-radio"">
                    <label><input type="radio" name="file-info" value="autofill" checked><span class="swal2-label">直接上传</span></label>
                    <label><input type="radio" name="file-info" value="needInput" id="need-fill-info-radio"><span class="swal2-label">先填写文件的歌手、专辑信息</span></label>
                    </div>
                    </div>`,
                    confirmButtonText: '上传',
                    showCloseButton: true,
                    preConfirm: (level) => {
                        let files=document.getElementById('song-file').files
                        if(files.length==0) return Swal.showValidationMessage('请选择文件')
                        return {
                            files:files,
                            needFillInfo:document.getElementById('need-fill-info-radio').checked,
                        }
                    },
                })
                    .then(result => {
                    if (result.isConfirmed) {
                        new LocalUpload().start(result.value)
                    }
                })
            }

            class LocalUpload{
                start(config){
                    this.files=config.files
                    this.needFillInfo=config.needFillInfo
                    this.task=[]
                    this.currentIndex=0
                    this.failIndexs=[]

                    for (let i=0;i<config.files.length;i++){
                        let file=config.files[i]
                        let fileName=file.name
                        let song={
                            id:-2,
                            songFile:file,
                            fileFullName:fileName,
                            title:fileName.slice(0,fileName.lastIndexOf('.')),
                            artist:'未知',
                            album:'未知',
                            size:file.size,
                            ext:fileName.slice(fileName.lastIndexOf('.')+1),
                            bitrate:128
                        }
                        this.task.push(song)
                    }
                    showTips(`开始获取文件中的标签信息`,1)
                    this.readFileTags(0)
                }
                readFileTags(songIndex){
                    if(songIndex>=this.task.length){
                        if(this.needFillInfo){
                            this.showFillSongInforBox()
                        }
                        else{
                            this.localUploadPart1(0)
                        }
                        return
                    }
                    let fileData=this.task[songIndex].songFile
                    new jsmediatags.Reader(fileData)
                        .read({
                        onSuccess: (res) => {
                            if (res.tags.title) this.task[songIndex].title=res.tags.title
                            if (res.tags.artist) this.task[songIndex].artist=res.tags.artist
                            if (res.tags.album) this.task[songIndex].album=res.tags.album
                            this.readFileTags(songIndex+1)
                        },
                        onError: (error) => {
                            this.readFileTags(songIndex+1)
                        }
                    });
                }
                showFillSongInforBox(){
                    Swal.fire({
                        html:`<style>
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
 tr th:nth-child(2),tr td:nth-child(2){
  width: 30%;
}
 tr th:nth-child(3),tr td:nth-child(3){
  width: 27%;
}
 tr th:nth-child(4),tr td:nth-child(4){
  width: 27%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>专辑</th></tr></thead><tbody></tbody></table>
`,
                        confirmButtonText: '上传',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showCloseButton: false,
                        didOpen: () => {
                            let container = Swal.getHtmlContainer()
                            let tbody = container.querySelector('tbody')
                            for(let i=0;i<this.task.length;i++){
                                let tablerow = document.createElement('tr')
                                tablerow.innerHTML = `<td><button type="button" class="swal2-styled my-edit">编辑</button></td><td>${this.task[i].title}</td><td>${this.task[i].artist}</td><td>${this.task[i].album}</td>`
                                let btnEdit = tablerow.querySelector('.my-edit')
                                btnEdit.addEventListener('click', () => {
                                    this.showEditInforBox(i)
                                })
                                tbody.appendChild(tablerow)
                            }
                        },
                    })
                        .then(result => {
                        if (result.isConfirmed) {
                            this.localUploadPart1(0)
                        }
                    })
                }
                showEditInforBox(songIndex){
                    Swal.fire({
                        title: this.task[songIndex].fileFullName,
                        html: `<div><label for="text-title">歌名</label><input class="swal2-input" id="text-title" type="text" value="${this.task[songIndex].title}"></div>
                    <div><label for="text-artist">歌手</label><input class="swal2-input" id="text-artist" type="text"  value="${this.task[songIndex].artist}"></div>
                    <div><label for="text-album">专辑</label><input class="swal2-input" id="text-album" type="text"  value="${this.task[songIndex].album}"></div>`,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showCloseButton: false,
                        confirmButtonText: '确定',
                        preConfirm: () => {
                            let songTitle=document.getElementById('text-title').value.trim()
                            if(songTitle.length==0) return Swal.showValidationMessage('歌名不能为空')
                            return {
                                title:songTitle,
                                artist:document.getElementById('text-artist').value.trim(),
                                album:document.getElementById('text-album').value.trim(),
                            }
                        },
                    })
                        .then((result) => {
                        if (result.isConfirmed) {
                            this.task[songIndex].title=result.value.title
                            this.task[songIndex].artist=result.value.artist
                            this.task[songIndex].album=result.value.album
                            this.showFillSongInforBox()
                        }
                    })
                }
                localUploadPart1(songindex){
                    let self=this
                    let song=self.task[songindex]
                    let reader = new FileReader()
                    let chunkSize = 1024*1024
                    let loaded = 0
                    let md5sum=unsafeWindow.CryptoJS.algo.MD5.create()
                    showTips(`(1/5)${song.title} 正在获取文件MD5值`,1)
                    reader.onload = function (e) {
                        md5sum.update(unsafeWindow.CryptoJS.enc.Latin1.parse(reader.result));
                        loaded += e.loaded;
                        if (loaded < song.size) {
                            readBlob(loaded);
                        } else {
                            showTips(`(1/5)${song.title} 已计算文件MD5值`,1)
                            song.md5 = md5sum.finalize().toString()
                            try{
                                weapiRequest("/api/cloud/upload/check", {
                                    method: "POST",
                                    type: "json",
                                    data: {
                                        songId: 0,
                                        md5: song.md5,
                                        length: song.size,
                                        ext: song.ext,
                                        version: 1,
                                        bitrate: song.bitrate,
                                    },
                                    onload: (responses1) => {
                                        let res1 = JSON.parse(responses1.response)
                                        console.log(song.title, '1.检查资源', res1)
                                        if (res1.code != 200) {
                                            console.error(song.title, '1.检查资源', res1)
                                            self.uploadFail()
                                            return
                                        }
                                        song.cloudId=res1.songId
                                        song.needUpload=res1.needUpload
                                        weapiRequest("/api/nos/token/alloc", {
                                            method: "POST",
                                            type: "json",
                                            data: {
                                                filename: song.title,
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
                                                    console.error(song.title, '2.获取令牌', res2)
                                                    self.uploadFail()
                                                    return
                                                }
                                                song.resourceId=res2.result.resourceId
                                                let tokenRes=JSON.parse(responses2.response)
                                                song.token=tokenRes.result.token
                                                song.objectKey = tokenRes.result.objectKey
                                                showTips(`(3/5)${song.title} 开始上传文件`,1)
                                                console.log(song.title, '2.获取令牌', res2)
                                                if(res1.needUpload){
                                                    self.localUploadFile(songindex,0)
                                                }
                                                else{
                                                    song.expireTime=Date.now()+60000
                                                    self.localUploadPart2(songindex)
                                                }
                                            },
                                            onerror: (res) => {
                                                console.error(song.title, '2.获取令牌', res)
                                                self.uploadFail()
                                            }
                                        });
                                    },
                                    onerror: (res) => {
                                        console.error(song.title, '1.检查资源', res)
                                        self.uploadFail()
                                    }
                                })
                            }
                            catch (e) {
                                console.error(e);
                                self.uploadFail()
                            }
                        }
                    }
                    readBlob(0);
                    function readBlob(offset) {
                        let blob = song.songFile.slice(offset, offset + chunkSize);
                        reader.readAsBinaryString(blob);
                    }
                }
                localUploadFile(songindex,offset,context=null){
                    let self=this
                    let song=self.task[songindex]
                    try{
                        let complete=offset+uploadChunkSize>song.size
                        let url=`http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${encodeURIComponent(song.objectKey)}?offset=${offset}&complete=${String(complete)}&version=1.0`
                    if (context) url += `&context=${context}`
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: url,
                        headers: {
                            'x-nos-token': song.token,
                            'Content-MD5': song.md5,
                            'Content-Type': 'audio/mpeg',
                        },
                        data: song.songFile.slice(offset,offset+uploadChunkSize),
                        onload: (response3) => {
                            let res=JSON.parse(response3.response)
                            if(complete){
                                console.log(song.title, '2.5.上传文件完成', res)
                                showTips(`(3.5/5)${song.title} 上传文件完成`,1)
                                song.expireTime=Date.now()+60000
                                self.localUploadPart2(songindex)
                            }
                            else{
                                showTips(`(3.4/5)${song.title} 正在上传${fileSizeDesc(res.offset)}/${fileSizeDesc(song.size)}`,1)
                                self.localUploadFile(songindex,res.offset,res.context)
                            }
                        },
                        onerror: (response3) => {
                            console.error(song.title, '文件上传时失败', response3)
                            self.uploadFail()
                        },
                    });
                    }
                    catch (e) {
                        console.error(e);
                        self.uploadFail()
                    }
                }
                localUploadPart2(songindex){
                    let self=this
                    let song=self.task[songindex]
                    try{
                        weapiRequest("/api/upload/cloud/info/v2", {
                            method: "POST",
                            type: "json",
                            data: {
                                md5: song.md5,
                                songid: song.cloudId,
                                filename: song.fileFullName,
                                song: song.title,
                                album: song.album,
                                artist: song.artist,
                                bitrate: String(song.bitrate),
                                resourceId: song.resourceId,
                            },
                            onload: (responses3) => {
                                let res3 = JSON.parse(responses3.response)
                                if (res3.code != 200) {
                                    if(song.expireTime<Date.now()||(res3.msg&&res3.msg.includes('rep create failed'))){
                                        console.error(song.title, '3.提交文件', res3)
                                        self.uploadFail()
                                    }
                                    else{
                                        console.log(song.title, '3.正在转码', res3)
                                        showTips(`(4/5)${song.title} 正在转码...`,1)
                                        sleep(1000).then(()=>{
                                            self.localUploadPart2(songindex)
                                        })
                                    }
                                    return
                                }

                                console.log(song.title, '3.提交文件', res3)
                                showTips(`(4/5)${song.title} 提交文件完成`,1)
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
                                            console.error(song.title, '4.发布资源', res4)
                                            self.uploadFail()
                                            return
                                        }
                                        //完成
                                        showTips(`(5/5)${song.title} 上传完成`,1)
                                        self.uploadSuccess()
                                    },
                                    onerror: (res)=> {
                                        console.error(song.title, '4.发布资源', res)
                                        self.uploadFail()
                                    }
                                })
                            },
                            onerror: (res)=>{
                                console.error(song.title, '3.提交文件', res)
                                self.uploadFail()
                            }
                        });
                    }
                    catch (e) {
                        console.error(e);
                        self.uploadFail()
                    }
                }
                uploadFail(){
                    this.failIndexs.push(this.currentIndex)
                    showTips(`${this.task[this.currentIndex].title}上传失败`,2)
                    this.uploadNext()
                }
                uploadSuccess(){
                    this.uploadNext()
                }
                uploadNext(){
                    this.currentIndex+=1
                    if (this.currentIndex>=this.task.length){
                        this.uploadFinnsh()
                    }
                    else{
                        this.localUploadPart1(this.currentIndex)
                    }
                }
                uploadFinnsh(){
                    let msg='上传完成'
                    if (this.failIndexs.length>0){
                        msg+=',以下文件上传失败：'
                        msg+=this.failIndexs.map(idx => this.task[idx].fileFullName).join()
                    }
                    showConfirmBox(msg)
                }
            }

            //限免VIP歌曲
            let btnVIPfreeA = document.createElement('a')
            btnVIPfreeA.id = 'listenBtn'
            btnVIPfreeA.className = 'u-btn2 u-btn2-1'
            let btnVIPfreeDescA = document.createElement('i')
            btnVIPfreeDescA.innerHTML = '限免VIP歌曲A'
            btnVIPfreeA.appendChild(btnVIPfreeDescA)
            btnVIPfreeA.setAttribute("hidefocus", "true");
            btnVIPfreeA.style.marginRight = '10px';
            btnVIPfreeA.addEventListener('click', VIPfreeA)
            editArea.insertBefore(btnVIPfreeA, editArea.lastChild)
            function VIPfreeA(){
                weapiRequest('/api/homepage/block/page', {
                    type: "json",
                    method: "POST",
                    data: {
                        cursor: JSON.stringify({offset:0,blockCodeOrderList:['HOMPAGE_BLOCK_VIP_RCMD']}),
                        refresh: true,
                        extInfo: JSON.stringify({refreshType:1,abInfo:{'hp-new-homepageV3.1':'t3'},netstate:1}),
                    },
                    onload: (responses) => {
                        let res = JSON.parse(responses.response)
                        //console.log(res)
                        let songList=res.data.blocks[0].resourceIdList.map(item => {
                            return {
                                'id': Number(item)
                            }
                        })
                        openVIPDownLoadPopup(songList,'APP发现页「免费听VIP歌曲」的内容',23)
                    }
                })
            }

            let btnVIPfreeB = document.createElement('a')
            btnVIPfreeB.id = 'listenBtn'
            btnVIPfreeB.className = 'u-btn2 u-btn2-1'
            let btnVIPfreeDescB = document.createElement('i')
            btnVIPfreeDescB.innerHTML = '限免VIP歌曲B'
            btnVIPfreeB.appendChild(btnVIPfreeDescB)
            btnVIPfreeB.setAttribute("hidefocus", "true");
            btnVIPfreeB.style.marginRight = '10px';
            btnVIPfreeB.addEventListener('click', VIPfreeB)
            editArea.insertBefore(btnVIPfreeB, editArea.lastChild)
            function VIPfreeB(){
                weapiRequest('/api/v6/playlist/detail', {
                    type: "json",
                    method: "POST",
                    data:{
                        id: 8402996200,
                        n: 100000,
                        s: 8,
                    },
                    onload: (responses) => {
                        let res = JSON.parse(responses.response)
                        //console.log(res)
                        let songList=res.playlist.trackIds.map(item => {
                            return {
                                'id': Number(item.id)
                            }
                        })
                        openVIPDownLoadPopup(songList,'歌单<a href="https://music.163.com/#/playlist?id=8402996200" target="_blank">「会员雷达」</a>的内容',22)
                    }
                })
            }
            function openVIPDownLoadPopup(songIds,footer,trialMode) {
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
  width: 30%;
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
                    footer:footer+'，只有标准(128k)音质<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
                    didOpen: () => {
                        let container = Swal.getHtmlContainer()
                        let footer = Swal.getFooter()
                        let tbody = container.querySelector('tbody')
                        weapiRequest("/api/v3/song/detail", {
                            type: "json",
                            method: "post",
                            sync: true,
                            data: {
                                c: JSON.stringify(songIds)
                            },

                            onload: function(responses) {
                                let content = JSON.parse(responses.response)
                                //console.log(content)
                                let songlen = content.songs.length
                                let privilegelen = content.privileges.length
                                for (let i = 0; i < songlen; i++) {
                                    for (let j = 0; j < privilegelen; j++) {
                                        if(content.songs[i].id==content.privileges[j].id){
                                            //生成表格
                                            if (content.privileges[j].cs) {
                                                //移除云盘已存在歌曲
                                                break
                                            }
                                            let songArtist=content.songs[i].ar?content.songs[i].ar.map(ar => `<a target="_blank" href="https://music.163.com/artist?id=${ar.id}">${ar.name}<a>`).join():''
                                            let songTitle=content.songs[i].name
                                            let filename=nameFileWithoutExt(songTitle,songArtist,'artist-title')
                                            let tablerow = document.createElement('tr')
                                            tablerow.innerHTML = `<td><button type="button" class="swal2-styled mydl">下载</button><button type="button" class="swal2-styled myul">上传</button></td><td><a href="https://music.163.com/album?id=${content.songs[i].al.id}" target="_blank"><img src="${content.songs[i].al.picUrl}?param=50y50&quality=100" title="${getAlbumTextInSongDetail(content.songs[i])}"></a></td><td><a href="https://music.163.com/song?id=${content.songs[i].id}" target="_blank">${content.songs[i].name}</a></td><td>${songArtist}</td><td>${duringTimeDesc(content.songs[i].dt || 0)}</td><td>${fileSizeDesc(content.songs[i].l.size)}</td>`
                                            let btnDL = tablerow.querySelector('.mydl')
                                            btnDL.addEventListener('click', () => {TrialDownLoad(content.songs[i].id,trialMode,filename)})
                                            let btnUL = tablerow.querySelector('.myul')
                                            btnUL.addEventListener('click', () => {
                                                let songItem={api:{url:'/api/song/enhance/player/url/v1',data:{ ids: JSON.stringify([content.songs[i].id]), trialMode:trialMode,level: 'exhigh', encodeType: 'mp3'}},id:content.songs[i].id,title:content.songs[i].name,artist:getArtistTextInSongDetail(content.songs[i]),album:getAlbumTextInSongDetail(content.songs[i])}
                                                let ULobj=new ncmDownUpload([songItem],false)
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
            function TrialDownLoad(songId,trialMode,filename){
                weapiRequest("/api/song/enhance/player/url/v1", {
                    type: "json",
                    data: {
                        immerseType:'ste',
                        trialMode:trialMode,
                        ids: JSON.stringify([songId]),
                        level: 'exhigh',
                        encodeType: 'mp3'
                    },
                    onload: (responses) => {
                        let content = JSON.parse(responses.response);
                        //console.log(content)
                        if (content.data[0].url != null) {
                            GM_download({
                                url: content.data[0].url,
                                name: filename + '.' + content.data[0].type.toLowerCase(),
                                onload: function() {
                                    //
                                },
                                onerror: function(e) {
                                    console.error(e)
                                    showTips('下载失败',2)
                                }
                            })
                        }
                        else{
                            showTips('下载失败',2)
                        }
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
                    html: `<div><label for="text-artist">歌手</label><input class="swal2-input" id="text-artist" placeholder="选填" type="text"></div>
                    <div><label for="text-album">专辑</label><input class="swal2-input" id="text-album" placeholder="选填" type="text"></div>
                    <div><label for="text-song">歌名</label><input class="swal2-input" id="text-song" placeholder="选填" type="text"></div>
                    <div><label for="text-playlistid">歌单ID</label><input class="swal2-input" id="text-playlistid" placeholder="选填" type="number"></div>`,
                    footer: '过滤条件取交集',
                    confirmButtonText: '导出',
                    preConfirm: () => {
                        return [
                            document.getElementById('text-artist')
                            .value.trim(),
                            document.getElementById('text-album')
                            .value.trim(),
                            document.getElementById('text-song')
                            .value.trim(),
                            document.getElementById('text-playlistid')
                            .value
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
                if(filter[3]){
                    exportCloudByPlaylist(filter)
                }
                else{
                    exportCloudSub(filter, {
                        data: []
                    }, 0)
                }
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
                                if (filter[1].length > 0 && filter[1] != getAlbumTextInSongDetail(song.simpleSong)) {
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
                                    encodeType: 'mp3',
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
            function exportCloudByPlaylist(filter){
                weapiRequest('/api/v6/playlist/detail', {
                    type: "json",
                    method: "POST",
                    data:{
                        id: filter[3],
                        n: 100000,
                        s: 8,
                    },
                    onload: (responses) => {
                        let res = JSON.parse(responses.response)
                        //console.log(res)
                        let trackIds=res.playlist.trackIds.map(item => {
                            return item.id
                        })
                        exportCloudByPlaylistSub(filter,trackIds, {
                            data: []
                        }, 0)
                    }
                })
            }
            function exportCloudByPlaylistSub(filter,trackIds, config, offset){
                let limit=100
                if(trackIds.length<=offset){
                    configToFile(config)
                    return
                }
                showTips(`正在获取第${offset+1}到${Math.min(offset+limit,trackIds.length)}首云盘歌曲信息`, 1)
                weapiRequest("/api/v1/cloud/get/byids", {
                    type: "json",
                    method: "post",
                    sync: true,
                    data: {
                        songIds: JSON.stringify(trackIds.slice(offset,offset+limit))
                    },

                    onload: function(responses) {
                        let res = JSON.parse(responses.response)
                        //console.log(res)
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
                                if (filter[1].length > 0 && filter[1] != getAlbumTextInSongDetail(song.simpleSong)) {
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
                                    encodeType: 'mp3',
                                },
                                onload: (responses2) => {
                                    let res2 = JSON.parse(responses2.response)
                                    //console.log(res2)
                                    if (res2.code != 200) {
                                        //重试
                                        exportCloudByPlaylistSub(filter,trackIds, config, offset)
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
                                    exportCloudByPlaylistSub(filter,trackIds, config, offset + limit)
                                }
                            })
                        } else {
                            exportCloudByPlaylistSub(filter,trackIds, config, offset + limit)
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

    //歌单页&&专辑页
    if (location.href.includes('playlist')||location.href.includes('album')) {

        let pageType=location.href.includes('playlist')?'playlist':'album'
        let operationArea = document.querySelector('#content-operation')
        let listId = new URLSearchParams(location.search).get('id')

        if(operationArea && unsafeWindow.GUser.userId){
            //批量下载
            let btnBatchDownload = document.createElement('a')
            btnBatchDownload.id = 'downloadBtn'
            btnBatchDownload.className = 'u-btn2 u-btn2-1'
            let btnBatchDownloadDesc = document.createElement('i')
            btnBatchDownloadDesc.innerHTML = '批量下载'
            btnBatchDownload.appendChild(btnBatchDownloadDesc)
            btnBatchDownload.setAttribute("hidefocus", "true");
            btnBatchDownload.style.margin = '5px';
            operationArea.appendChild(btnBatchDownload)
            btnBatchDownload.addEventListener('click', () => {
                ShowBatchDLPopUp(pageType)
            })
            function ShowBatchDLPopUp(pageType){
                Swal.fire({
                    title: '批量下载',
                    html: `<div id="my-cbs">
<input class="form-check-input" type="checkbox" value="" id="cb-fee1" checked><label class="form-check-label" for="cb-fee1">VIP歌曲</label>
<input class="form-check-input" type="checkbox" value="" id="cb-fee4" checked><label class="form-check-label" for="cb-fee4">付费专辑歌曲</label>
</div>
<div id="my-cbs2">
<input class="form-check-input" type="checkbox" value="" id="cb-fee8" checked><label class="form-check-label" for="cb-fee8">低音质免费歌曲</label>
<input class="form-check-input" type="checkbox" value="" id="cb-fee0" checked><label class="form-check-label" for="cb-fee0">免费和云盘未匹配歌曲</label>
</div>
<div id="my-cbs3">
<input class="form-check-input" type="checkbox" value="" id="cb-skipcloud"><label class="form-check-label" for="cb-fee0">跳过云盘歌曲</label>
</div>
<div id="my-level">
<label for="level-select" class="swal2-input-label">优先下载音质</label><select id="level-select" class="swal2-select"><option value="lossless">无损</option><option value="hires">Hi-Res</option><option value="jymaster" selected="">超清母带</option><option value="exhigh">极高</option></select>
</div>
<div id="my-out">
<label for="out-select" class="swal2-input-label">文件命名格式</label><select id="out-select" class="swal2-select"><option value="artist-title" selected="">歌手 - 歌曲名</option><option value="title">歌曲名</option><option value="title-artist">歌曲名-歌手</option></select>
</div>
<div id="my-folder">
<label for="folder-select" class="swal2-input-label">文件夹格式</label><select id="folder-select" class="swal2-select"><option value="none" selected="">不建立文件夹</option><option value="artist">建立歌手文件夹</option><option value="artist-album">建立歌手 \\ 专辑文件夹</option></select>
</div>
<div id="my-thread-count">
<label for="thread-count-select" class="swal2-input-label">同时下载的歌曲数</label><select id="thread-count-select" class="swal2-select"><option value=4 selected="">4</option><option value=3>3</option><option value="2">2</option><option value=1>1</option></select>
</div>
    `,
                    confirmButtonText: '开始下载',
                    showCloseButton: true,
                    footer:'<span>不消耗会员下载次数</span><a href="https://github.com/Cinvin/myuserscripts"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
                    focusConfirm: false,
                    preConfirm: (level) => {
                        let container = Swal.getHtmlContainer()
                        return {
                            free:container.querySelector('#cb-fee0').checked,
                            VIP:container.querySelector('#cb-fee1').checked,
                            pay:container.querySelector('#cb-fee4').checked,
                            lowFree:container.querySelector('#cb-fee8').checked,
                            skipCloud:container.querySelector('#cb-skipcloud').checked,
                            level:container.querySelector('#level-select').value,
                            out:container.querySelector('#out-select').value,
                            folder:container.querySelector('#folder-select').value,
                            threadCount:Number(container.querySelector('#thread-count-select').value),
                            listType:pageType,
                            action:'batchDownload'
                        }
                    }
                }).then(res=>{
                    fetchSongList(res.value)
                })
            }

            //批量转存云盘
            let btnBatchUpload = document.createElement('a')
            btnBatchUpload.id = 'uploadBtn'
            btnBatchUpload.className = 'u-btn2 u-btn2-1'
            let btnBatchUploadDesc = document.createElement('i')
            btnBatchUploadDesc.innerHTML = '批量转存云盘'
            btnBatchUpload.appendChild(btnBatchUploadDesc)
            btnBatchUpload.setAttribute("hidefocus", "true");
            btnBatchUpload.style.margin = '5px';
            operationArea.appendChild(btnBatchUpload)
            btnBatchUpload.addEventListener('click', () => {
                ShowBatchDLULPopUp(pageType)
            })
            function ShowBatchDLULPopUp(pageType){
                Swal.fire({
                    title: '批量转存云盘',
                    html: `<div id="my-cbs">
<input class="form-check-input" type="checkbox" value="" id="cb-fee1" checked><label class="form-check-label" for="cb-fee1">VIP歌曲</label>
<input class="form-check-input" type="checkbox" value="" id="cb-fee4" checked><label class="form-check-label" for="cb-fee4">付费专辑歌曲</label>
<input class="form-check-input" type="checkbox" value="" id="cb-fee8"><label class="form-check-label" for="cb-fee8">低音质免费歌曲</label>
<input class="form-check-input" type="checkbox" value="" id="cb-fee0"><label class="form-check-label" for="cb-fee0">免费歌曲</label>
</div>
<div id="my-level">
<label for="level-select" class="swal2-input-label">优先转存音质</label><select id="level-select" class="swal2-select"><option value="lossless">无损</option><option value="hires">Hi-Res</option><option value="jymaster" selected="">超清母带</option><option value="exhigh">极高</option></select>
</div>
<div id="my-out">
<label for="out-select" class="swal2-input-label">文件命名格式</label><select id="out-select" class="swal2-select"><option value="artist-title" selected="">歌手 - 歌曲名</option><option value="title">歌曲名</option><option value="title-artist">歌曲名-歌手</option></select>
</div>
    `,
                    confirmButtonText: '开始转存',
                    showCloseButton: true,
                    footer:'<span>不消耗会员下载次数</span><a href="https://github.com/Cinvin/myuserscripts"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
                    focusConfirm: false,
                    preConfirm: (level) => {
                        return [
                            document.getElementById('cb-fee0').checked,
                            document.getElementById('cb-fee1').checked,
                            document.getElementById('cb-fee4').checked,
                            document.getElementById('cb-fee8').checked,
                            document.getElementById('level-select').value,
                            document.getElementById('out-select').value,
                        ]
                    }
                }).then(res=>{
                    if(res.value[0].length==0) return
                    let config={ree:res.value[0],VIP:res.value[1],pay:res.value[2],lowFree:res.value[3],skipCloud:true,level:res.value[4],out:res.value[5],listType:pageType,action:'batchUpload'}
                    fetchSongList(config)
                })
            }
            function fetchSongList(config){
                if(config.listType=='playlist'){
                    weapiRequest("/api/v6/playlist/detail", {
                        type: "json",
                        method: "POST",
                        data:{
                            id: listId,
                            n: 100000,
                            s: 8,
                        },
                        onload: (res)=> {
                            let content = JSON.parse(res.response)
                            //console.log(content)
                            let songList=[]
                            let tracklen = content.playlist.tracks.length
                            let privilegelen = content.privileges.length
                            for (let i = 0; i < tracklen; i++) {
                                for (let j = 0; j < privilegelen; j++) {
                                    if(content.playlist.tracks[i].id==content.privileges[j].id){
                                        if(content.privileges[j].st<0||content.privileges[j].plLevel=='none') break
                                        if(content.privileges[j].cs&&config.skipCloud) break
                                        if(content.privileges[j].fee==0&&!config.free) break
                                        if(content.privileges[j].fee==1&&!config.VIP) break
                                        if(content.privileges[j].fee==4&&!config.pay) break
                                        if(content.privileges[j].fee==8&&!config.lowFree) break
                                        let api={url:'/api/song/enhance/player/url/v1',data:{ ids:JSON.stringify([content.playlist.tracks[i].id]), level: config.level, encodeType: 'mp3'}}
                                        if (content.privileges[j].fee==0&&content.privileges[j].dlLevel!="none"&&content.privileges[j].plLevel!=content.privileges[j].dlLevel) api={url:'/api/song/enhance/download/url/v1',data:{ id:content.playlist.tracks[i].id, level: config.level, encodeType: 'mp3'}}
                                        let songItem={api:api,id:content.playlist.tracks[i].id,title:content.playlist.tracks[i].name,artist:getArtistTextInSongDetail(content.playlist.tracks[i]),album:getAlbumTextInSongDetail(content.playlist.tracks[i])}
                                        songList.push(songItem)
                                        break
                                    }
                                }
                            }
                            if(content.playlist.trackCount>content.playlist.tracks.length){
                                showTips(`大歌单,开始分批获取${content.playlist.trackCount}首歌信息`,1)
                                let trackIds=content.playlist.trackIds.map(item => {
                                    return {
                                        'id': item.id
                                    }
                                })
                                fetchplaylistSongInfo(trackIds,0,[],config)
                            }
                            else{
                                if(config.action=='batchUpload'){
                                    startUploadSongs(songList,config)
                                }
                                else if(config.action=='batchDownload'){
                                    startDownloadSongs(songList,config)
                                }
                            }
                        }
                    })
                }
                else if(config.listType=='album'){
                    weapiRequest(`/api/v1/album/${listId}`, {
                        type: "json",
                        method: "POST",
                        onload: (res)=> {
                            let content = JSON.parse(res.response)
                            //console.log(content)
                            let songList=[]
                            for(let i=0;i<content.songs.length;i++){
                                if(content.songs[i].privilege.st<0||content.songs[i].privilege.plLevel=='none') continue
                                if(content.songs[i].privilege.cs&&config.skipCloud) continue
                                if(content.songs[i].privilege.fee==0&&!config.free) continue
                                if(content.songs[i].privilege.fee==1&&!config.VIP) continue
                                if(content.songs[i].privilege.fee==4&&!config.pay) continue
                                if(content.songs[i].privilege.fee==8&&!config.lowFree) continue
                                let api={url:'/api/song/enhance/player/url/v1',data:{ ids:JSON.stringify([content.songs[i].id]), level: config.level, encodeType: 'mp3'}}
                                if (content.songs[i].privilege.fee==0&&content.songs[i].privilege.dlLevel!="none"&&content.songs[i].privilege.plLevel!=content.songs[i].privilege.dlLevel) api={url:'/api/song/enhance/download/url/v1',data:{ id:content.songs[i].id, level: config.level, encodeType: 'mp3'}}
                                let songItem={api:api,id:content.songs[i].id,title:content.songs[i].name,artist:getArtistTextInSongDetail(content.songs[i]),album:getAlbumTextInSongDetail(content.songs[i])}
                                songList.push(songItem)
                            }
                            if(config.action=='batchUpload'){
                                startUploadSongs(songList,config)
                            }
                            else if(config.action=='batchDownload'){
                                startDownloadSongs(songList,config)
                            }
                        }
                    })
                }
            }
            function fetchplaylistSongInfo(trackIds,startIndex,songList,config){
                if(startIndex>=trackIds.length){
                    if(config.action=='batchUpload'){
                        startUploadSongs(songList,config)
                    }
                    else if(config.action=='batchDownload'){
                        startDownloadSongs(songList,config)
                    }
                    return
                }
                weapiRequest("/api/v3/song/detail", {
                    type: "json",
                    method: "post",
                    sync: true,
                    data: {
                        c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1000))
                    },
                    onload: function(responses) {
                        let content = JSON.parse(responses.response)
                        let songlen = content.songs.length
                        let privilegelen = content.privileges.length
                        for (let i = 0; i < songlen; i++) {
                            for (let j = 0; j < privilegelen; j++) {
                                if(content.songs[i].id==content.privileges[j].id){
                                    if(content.privileges[j].st<0||content.privileges[j].plLevel=='none') break
                                    if(content.privileges[j].cs&&config.skipCloud) break
                                    if(content.privileges[j].fee==0&&!config.free) break
                                    if(content.privileges[j].fee==1&&!config.VIP) break
                                    if(content.privileges[j].fee==4&&!config.pay) break
                                    if(content.privileges[j].fee==8&&!config.lowFree) break
                                    let api={url:'/api/song/enhance/player/url/v1',data:{ ids:JSON.stringify([content.songs[i].id]), level: config.level, encodeType: 'mp3'}}
                                    if (content.privileges[j].fee==0&&content.privileges[j].dlLevel!="none"&&content.privileges[j].plLevel!=content.privileges[j].dlLevel) api={url:'/api/song/enhance/download/url/v1',data:{ id:content.songs[i].id, level: config.level, encodeType: 'mp3'}}
                                    let songItem={api:api,id:content.songs[i].id,title:content.songs[i].name,artist:getArtistTextInSongDetail(content.songs[i]),album:getAlbumTextInSongDetail(content.songs[i])}
                                    songList.push(songItem)
                                    break
                                }
                            }
                        }
                        fetchplaylistSongInfo(trackIds, startIndex + content.songs.length,songList,config)
                    }
                })
            }
            function startDownloadSongs(songList,config){
                if(songList.length==0){
                    showConfirmBox('没有可下载的歌曲')
                    return
                }
                Swal.fire({
                    title: '批量下载',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showCloseButton: false,
                    showConfirmButton:false,
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
                        let threadList=[]
                        for(let i=0;i<config.threadCount;i++){
                            let trDOM = document.createElement('tr')
                            tbodyDOM.appendChild(trDOM)
                            threadList.push({tableRowDOM:trDOM,working:true})
                        }
                        config.finnshCount=0
                        config.errorSongTitles=[]
                        config.taskCount=songList.length
                        config.threadList=threadList
                        for(let i=0;i<config.threadCount;i++){
                            downloadSongSub(i,songList,config)
                        }
                    },
                })
            }
            function downloadSongSub(threadIndex,songList,config){
                let song=songList.shift()
                let tableRowDOM=config.threadList[threadIndex].tableRowDOM
                if(song == undefined){
                    config.threadList[threadIndex].working=false
                    let allFinnsh=true
                    for(let i=0;i<config.threadCount;i++){
                        if(config.threadList[i].working){
                            allFinnsh=false
                            break
                        }
                    }
                    if(allFinnsh){
                        let finnshText='下载完成'
                        if(config.errorSongTitles.length>0){
                            finnshText=`下载完成。以下${config.errorSongTitles.length}首歌曲下载失败: ${config.errorSongTitles.join()}`
                        }
                        Swal.update({
                            allowOutsideClick: true,
                            allowEscapeKey: true,
                            showCloseButton: true,
                            showConfirmButton:true,
                            html:finnshText,
                        })
                    }
                    return
                }
                tableRowDOM.innerHTML = `<td>${song.title}</td><td>${song.artist}</td><td>${song.album}</td><td class='my-level'></td><td class='my-size'></td><td class='my-pr'></td>`
                let levelText=tableRowDOM.querySelector('.my-level')
                let sizeText=tableRowDOM.querySelector('.my-size')
                let prText=tableRowDOM.querySelector('.my-pr')
                try{
                    weapiRequest(song.api.url, {
                        type: "json",
                        data: song.api.data,
                        onload: (responses) => {
                            let content = JSON.parse(responses.response);
                            let resData=content.data[0]||content.data
                            if (resData.url != null) {
                                let fileFullName = nameFileWithoutExt(song.title,song.artist,config.out) + '.' + resData.type.toLowerCase()
                                let folder = ''
                                if(config.folder != 'none' && song.artist.length>0){
                                    folder = song.artist + '/'
                                }
                                if(config.folder == 'artist-album' && song.album.length>0){
                                    folder += song.album + '/'
                                }
                                fileFullName = folder + fileFullName
                                let dlUrl = resData.url
                                levelText.innerHTML = levelDesc(resData.level)
                                sizeText.innerHTML = fileSizeDesc(resData.size)
                                GM_download({
                                    url:dlUrl,
                                    name: fileFullName,
                                    onprogress: function(e) {
                                        prText.innerHTML = `${fileSizeDesc(e.loaded)}`
                                    },
                                    onload: function() {
                                        config.finnshCount+=1
                                        Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`
                                        prText.innerHTML = `完成`
                                        downloadSongSub(threadIndex,songList,config)
                                    },
                                    onerror: function(e) {
                                        if(song.retry){
                                            prText.innerHTML = `下载出错`
                                            config.errorSongTitles.push(song.title)
                                        }
                                        else{
                                            prText.innerHTML = `下载出错\t稍后重试`
                                            song.retry=true
                                            songList.push(song)
                                        }
                                        console.error(e)
                                        downloadSongSub(threadIndex,songList,config)
                                    }
                                });
                            }
                            else{
                                showTips(`${song.title}\t无法下载`,2)
                                prText.innerHTML = `无法下载`
                                config.errorSongTitles.push(song.title)
                                downloadSongSub(threadIndex,songList,config)
                            }
                        },
                        onerror: (res) => {
                            console.error(res)
                            if(song.retry){
                                prText.innerHTML = `下载出错`
                                config.errorSongTitles.push(song.title)
                            }
                            else{
                                prText.innerHTML = `下载出错\t稍后重试`
                                song.retry=true
                                songList.push(song)
                            }
                            downloadSongSub(threadIndex,songList,config)
                        }
                    })
                }
                catch (e) {
                    console.error(e);
                    if(song.retry){
                        prText.innerHTML = `下载出错`
                        config.errorSongTitles.push(song.title)
                    }
                    else{
                        prText.innerHTML = `下载出错\t稍后重试`
                        song.retry=true
                        songList.push(song)
                    }
                    downloadSongSub(threadIndex,songList,config)
                }
            }
            function startUploadSongs(songList,config){
                if(songList.length==0){
                    showConfirmBox('没有可上传的歌曲')
                    return
                }
                showTips(`开始下载上传${songList.length}首歌曲`,1)
                let ULobj=new ncmDownUpload(songList,true,null,null,config.out)
                ULobj.startUpload()
            }

            //歌单排序
            if (pageType=='playlist'){
                let creatorhomeURL = document.head.querySelector("[property~='music:creator'][content]")?.content
                let creatorId = new URLSearchParams(new URL(creatorhomeURL).search).get('id')
                if(creatorId==unsafeWindow.GUser.userId){
                    //歌单排序
                    let btnPlaylistSort = document.createElement('a')
                    btnPlaylistSort.id = 'sortBtn'
                    btnPlaylistSort.className = 'u-btn2 u-btn2-1'
                    let btnPlaylistSortDesc = document.createElement('i')
                    btnPlaylistSortDesc.innerHTML = '歌单排序'
                    btnPlaylistSort.appendChild(btnPlaylistSortDesc)
                    btnPlaylistSort.setAttribute("hidefocus", "true");
                    btnPlaylistSort.style.margin = '5px';
                    operationArea.appendChild(btnPlaylistSort)
                    btnPlaylistSort.addEventListener('click', () => {
                        ShowPLSortPopUp()
                    })
                    function ShowPLSortPopUp(){
                        Swal.fire({
                            title: '歌单内歌曲排序',
                            input: 'select',
                            inputOptions: ['发行时间降序','发行时间升序','红心数量降序','红心数量升序','评论数量降序','评论数量升序'],
                            inputPlaceholder: '选择排序方式',
                            confirmButtonText: '开始排序',
                            showCloseButton: true,
                            focusConfirm: false,
                            inputValidator: (way) => {
                                if (!way) {
                                    return '请选择排序方式'
                                }
                            },
                        }).then(res=>{
                            if(!res.isConfirmed) return
                            if(res.value==0){
                                PlaylistTimeSort(listId,true)
                            }
                            else if(res.value==1){
                                PlaylistTimeSort(listId,false)
                            }
                            else if(res.value==2){
                                PlaylistCountSort(listId,true,'Red')
                            }
                            else if(res.value==3){
                                PlaylistCountSort(listId,false,'Red')
                            }
                            else if(res.value==4){
                                PlaylistCountSort(listId,true,'Comment')
                            }
                            else if(res.value==5){
                                PlaylistCountSort(listId,false,'Comment')
                            }
                        })
                    }
                    function PlaylistTimeSort(playlistId,descending){
                        showTips(`正在获取歌单内歌曲信息`,1)
                        weapiRequest("/api/v6/playlist/detail", {
                            type: "json",
                            method: "POST",
                            data:{
                                id: playlistId,
                                n: 100000,
                                s: 8,
                            },
                            onload: (res)=> {
                                let content = JSON.parse(res.response)
                                let songList=[]
                                let tracklen = content.playlist.tracks.length
                                for (let i = 0; i < tracklen; i++) {
                                    let songItem={id:content.playlist.tracks[i].id,publishTime:content.playlist.tracks[i].publishTime,albumId:content.playlist.tracks[i].al.id,cd:content.playlist.tracks[i].cd?Number(content.playlist.tracks[i].cd.split(' ')[0]):0,no:content.playlist.tracks[i].no}
                                    songList.push(songItem)
                                }
                                if(content.playlist.trackCount>content.playlist.tracks.length){
                                    showTips(`大歌单,开始分批获取${content.playlist.trackCount}首歌信息`,1)
                                    let trackIds=content.playlist.trackIds.map(item => {
                                        return {
                                            'id': item.id
                                        }
                                    })
                                    PlaylistTimeSortFetchAll(playlistId,descending,trackIds,0,songList)
                                }
                                else{
                                    PlaylistTimeSortFetchAllPublishTime(playlistId,descending,0,songList,{})
                                }
                            }
                        })
                    }
                    function PlaylistTimeSortFetchAll(playlistId,descending,trackIds,startIndex,songList){
                        if(startIndex>=trackIds.length){
                            PlaylistTimeSortFetchAllPublishTime(playlistId,descending,0,songList,{})
                            return
                        }
                        weapiRequest("/api/v3/song/detail", {
                            type: "json",
                            method: "post",
                            sync: true,
                            data: {
                                c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1000))
                            },
                            onload: function(responses) {
                                let content = JSON.parse(responses.response)
                                let songlen = content.songs.length
                                for (let i = 0; i < songlen; i++) {
                                    let songItem={id:content.songs[i].id,publishTime:content.songs[i].publishTime,albumId:content.songs[i].al.id,cd:content.songs[i].cd?Number(content.songs[i].cd.split(' ')[0]):0,no:content.songs[i].no}
                                    songList.push(songItem)
                                }
                                PlaylistTimeSortFetchAll(playlistId,descending,trackIds, startIndex + content.songs.length,songList)
                            }
                        })
                    }
                    function PlaylistTimeSortFetchAllPublishTime(playlistId,descending,index,songList,aldict){
                        if(index>=songList.length){
                            PlaylistTimeSortSongs(playlistId,descending,songList)
                            return
                        }
                        if(index==0) showTips('开始获取歌曲专辑发行时间')
                        if(index%10==9) showTips(`正在获取歌曲专辑发行时间(${index+1}/${songList.length})`)
                        let albumId=songList[index].albumId
                        if(albumId<=0){
                            PlaylistTimeSortFetchAllPublishTime(playlistId,descending,index+1,songList,aldict)
                            return
                        }

                        if(aldict[albumId]){
                            songList[index].publishTime=aldict[albumId]
                            PlaylistTimeSortFetchAllPublishTime(playlistId,descending,index+1,songList,aldict)
                            return
                        }
                        weapiRequest(`/api/v1/album/${albumId}`, {
                            type: "json",
                            method: "post",
                            sync: true,
                            onload: function(responses) {
                                let content = JSON.parse(responses.response)
                                let publishTime = content.album.publishTime
                                aldict[albumId]=publishTime
                                songList[index].publishTime=publishTime
                                PlaylistTimeSortFetchAllPublishTime(playlistId,descending,index+1,songList,aldict)
                            }
                        })
                    }
                    function PlaylistTimeSortSongs(playlistId,descending,songList){
                        songList.sort((a, b) => {
                            if (a.publishTime != b.publishTime) {
                                if(descending){
                                    return b.publishTime - a.publishTime
                                }
                                else{
                                    return a.publishTime - b.publishTime
                                }
                            }
                            else if(a.albumId != b.albumId){
                                if(descending){
                                    return b.albumId - a.albumId
                                }
                                else{
                                    return a.albumId - b.albumId
                                }
                            }
                            else if(a.cd != b.cd){
                                return a.cd - b.cd
                            }
                            else if(a.no != b.no){
                                return a.no - b.no
                            }
                            return a.id - b.id
                        })
                        let trackIds=songList.map(song=>song.id)
                        weapiRequest("/api/playlist/manipulate/tracks", {
                            type: "json",
                            method: "post",
                            data: {
                                pid: playlistId,
                                trackIds: JSON.stringify(trackIds),
                                op: 'update',
                            },
                            onload: function(responses) {
                                let content = JSON.parse(responses.response)
                                //console.log(content)
                                if(content.code==200){
                                    showConfirmBox('排序完成')
                                }
                                else{
                                    showConfirmBox('排序失败,'+responses.response)
                                }
                            }
                        })
                    }
                    function PlaylistCountSort(playlistId,descending,way){
                        showTips(`正在获取歌单内歌曲信息`,1)
                        weapiRequest("/api/v6/playlist/detail", {
                            type: "json",
                            method: "POST",
                            data:{
                                id: playlistId,
                                n: 100000,
                                s: 8,
                            },
                            onload: (res)=> {
                                let content = JSON.parse(res.response)
                                let songList=content.playlist.trackIds.map(item => {
                                    return {
                                        'id': item.id,
                                        'count': 0,
                                    }
                                })
                                let trackIds=content.playlist.trackIds.map(item => {return item.id })
                                if(way=='Red'){
                                    PlaylistCountSortFetchRedCount(playlistId,songList,0,descending)
                                }
                                else if(way=='Comment'){
                                    PlaylistCountSortFetchCommentCount(playlistId,songList,trackIds,0,descending)
                                }
                            }
                        })
                    }
                    function PlaylistCountSortFetchRedCount(playlistId,songList,index,descending){
                        if(index>=songList.length){
                            PlaylistCountSortSongs(playlistId,descending,songList)
                            return
                        }
                        if(index==0) showTips('开始获取歌曲红心数量')
                        if(index%10==9) showTips(`正在获取歌曲红心数量(${index+1}/${songList.length})`)
                        weapiRequest("/api/song/red/count", {
                            type: "json",
                            data: {
                                songId: songList[index].id,
                            },
                            onload: function(responses) {
                                let content = JSON.parse(responses.response)
                                songList[index].count= content.data.count
                                PlaylistCountSortFetchRedCount(playlistId,songList,index+1,descending)
                            },
                        });
                    }
                    function PlaylistCountSortFetchCommentCount(playlistId,songList,trackIds,index,descending){
                        if(index>=songList.length){
                            PlaylistCountSortSongs(playlistId,descending,songList)
                            return
                        }
                        if(index==0) showTips('开始获取歌曲评论数量')
                        else showTips(`正在获取歌曲评论数量(${index+1}/${songList.length})`)
                        weapiRequest("/api/resource/commentInfo/list", {
                            type: "json",
                            data: {
                                resourceType: "4",
                                resourceIds: JSON.stringify(trackIds.slice(index, index + 1000)),
                            },
                            onload: function(responses) {
                                let content = JSON.parse(responses.response)

                                content.data.forEach(item => {
                                    let songId=item.resourceId
                                    for(let i=0;i<songList.length;i++){
                                        if(songList[i].id==songId){
                                            songList[i].count=item.commentCount
                                            break
                                        }
                                    }
                                })
                                PlaylistCountSortFetchCommentCount(playlistId,songList,trackIds,index+1000,descending)
                            },
                        });
                    }
                    function PlaylistCountSortSongs(playlistId,descending,songList){
                        songList.sort((a, b) => {
                            if (a.count != b.count) {
                                if(descending){
                                    return b.count - a.count
                                }
                                else{
                                    return a.count - b.count
                                }
                            }
                            return a.id - b.id
                        })
                        let trackIds=songList.map(song=>song.id)
                        weapiRequest("/api/playlist/manipulate/tracks", {
                            type: "json",
                            method: "post",
                            data: {
                                pid: playlistId,
                                trackIds: JSON.stringify(trackIds),
                                op: 'update',
                            },
                            onload: function(responses) {
                                let content = JSON.parse(responses.response)
                                if(content.code==200){
                                    showConfirmBox('排序完成')
                                }
                                else{
                                    showConfirmBox('排序失败')
                                }
                            }
                        })
                    }
                }
            }
            //显示脏标
            else if(pageType=='album'){
                if(document.querySelector('.topblk')){
                weapiRequest(`/api/v1/album/${listId}`, {
                        type: "json",
                        method: "POST",
                        onload: (res)=> {
                            let content = JSON.parse(res.response)
                            if((content.album.mark & songMark.explicit) == songMark.explicit){
                                document.querySelector('.topblk').innerHTML+=`<p class="intr"><b>🅴：</b>内容含有不健康因素</p>`
                            }
                        }
                    })
                }
            }
        }
    }
    //高音质播放
    GM_registerMenuCommand(`优先试听音质`, setLevel)
    function setLevel() {
        Swal.fire({
            title: '优先试听音质',
            input: 'select',
            inputOptions: levelOptions,
            inputValue: GM_getValue('DEFAULT_LEVEL',defaultOfDEFAULT_LEVEL),
            confirmButtonText: '确定',
            showCloseButton: true,
            footer: '<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
        })
            .then(result => {
            if (result.isConfirmed) {
                GM_setValue('DEFAULT_LEVEL',result.value)
            }
        })
    }
    if(unsafeWindow.self==unsafeWindow.top){
        unsafeWindow.myhook=ah.proxy({
            onResponse: (response, handler) => {
                if(response.config.url.includes('/weapi/song/enhance/player/url/v1')){
                    let content = JSON.parse(response.response)
                    let songId=content.data[0].id
                    let targetLevel=GM_getValue('DEFAULT_LEVEL',defaultOfDEFAULT_LEVEL)
                    if (content.data[0].type.toLowerCase() !== "mp3" && content.data[0].type.toLowerCase() !== "m4a") {
                        content.data[0].type='mp3'
                    }
                    if(content.data[0].url){
                        if(content.data[0].level=='standard'){
                            if(targetLevel != 'standard'){
                                let apiData= {
                                    '/api/song/enhance/player/url/v1': JSON.stringify({
                                        ids: JSON.stringify([songId]),
                                        level: targetLevel,
                                        encodeType: 'mp3'
                                    }),
                                }
                                if(content.data[0].fee==0){
                                    apiData['/api/song/enhance/download/url/v1']=JSON.stringify({
                                        id:songId,
                                        level: targetLevel,
                                        encodeType: 'mp3'})
                                }
                                weapiRequest("/api/batch", {
                                    type: "json",
                                    data: apiData,
                                    onload: (resreget) => {
                                        let res = JSON.parse(resreget.response)
                                        let songUrl=res['/api/song/enhance/player/url/v1'].data[0].url
                                        let songLevel=res["/api/song/enhance/player/url/v1"].data[0].level
                                        if(res['/api/song/enhance/download/url/v1']){
                                            let songDLLevel=res["/api/song/enhance/download/url/v1"].data.level
                                            if (res["/api/song/enhance/download/url/v1"].data.url && songDLLevel!=songLevel){
                                                songUrl=res["/api/song/enhance/download/url/v1"].data.url
                                                songLevel=songDLLevel
                                            }
                                        }
                                        if(songLevel!='standard'){
                                            content.data[0].url=songUrl
                                            player.tipPlay(levelDesc(songLevel)+'音质')
                                        }
                                        response.response=JSON.stringify(content)
                                        handler.next(response)
                                    },
                                    onerror: (res) => {
                                        console.error('/api/batch',apiData, res)
                                        response.response=JSON.stringify(content)
                                        handler.next(response)
                                    }
                                })
                            }
                            else{
                                response.response=JSON.stringify(content)
                                handler.next(response)
                            }
                        }
                        else{
                            player.tipPlay(levelDesc(content.data[0].level)+'音质(云盘文件)')
                            response.response=JSON.stringify(content)
                            handler.next(response)
                        }
                    }
                    else{
                        response.response=JSON.stringify(content)
                        handler.next(response)
                    }
                }
                else{
                    handler.next(response)
                }
            }
        },unsafeWindow)
    }
})();