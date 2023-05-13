// ==UserScript==
// @name             网易云:云盘上传周杰伦等歌手歌曲,音乐、歌词、乐谱下载
// @namespace     https://github.com/Cinvin/myuserscripts
// @license           MIT
// @version           1.3.2
// @description     个人主页:云盘快速上传并关联歌手歌曲，歌曲页:音乐、歌词、乐谱下载
// @author            cinvin
// @match            https://music.163.com/*
// @grant             GM_xmlhttpRequest
// @grant             GM_download
// @grant             unsafeWindow
// @require           https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/limonte-sweetalert2/11.4.4/sweetalert2.all.min.js
// ==/UserScript==

(function() {
    'use strict';

    function getcookie(key) {
        var cookies = document.cookie
        , text = "\\b" + key + "="
        , find = cookies.search(text);
        if (find < 0)
        {
            return ""
        }
        find += text.length - 2;
        var index = cookies.indexOf(";", find);
        if (index < 0){
            index = cookies.length
        }
        return cookies.substring(find, index) || ""
    };
    function weapiRequest(url,config){
        let data=config.data
        data.csrf_token = getcookie("__csrf");
        url = url.replace("api", "weapi");
        config.method = "post";
        config.cookie = true
        delete config.query
        config.headers={ "content-type": "application/x-www-form-urlencoded",}
        var encRes = unsafeWindow.asrsea(
            JSON.stringify(data),
            "010001",
            "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7",
            "0CoJUm6Qyw8W8jud");
        config.data = `params=${ encodeURIComponent(encRes.encText) }&encSecKey=${ encodeURIComponent(encRes.encSecKey) }`
            config.url=url+`?csrf_token=${data.csrf_token}`
        //console.log(config)
        GM_xmlhttpRequest(config)
    }

    function showConfirmBox(msg){
        Swal.fire({
            title: '提示',
            text: msg,
            confirmButtonText: '确定',
        })
    }
    function showTips(tip,type){
        //type:1 √ 2:!
        unsafeWindow.g_showTipCard({
            tip: tip,
            type: type
        })
    }

    //歌曲页
    if (location.href.match('song')){
        let cvrwrap=document.querySelector(".cvrwrap")
        if(cvrwrap){
            let songId=Number(location.href.match(/\d+$/g));
            let songTitle=document.head.querySelector("[property~='og:title'][content]").content;
            let songArtist=document.head.querySelector("[property~='og:music:artist'][content]").content;//split by /
            let songAlbum=document.head.querySelector("[property~='og:music:album'][content]").content;
            //songdownload
            let songDownloadDiv = document.createElement('div');
            songDownloadDiv.className="out s-fc3"
            let songDownloadP = document.createElement('p');
            songDownloadP.innerHTML = '歌曲下载:';
            songDownloadDiv.style.display="none"
            songDownloadDiv.appendChild(songDownloadP)
            cvrwrap.appendChild(songDownloadDiv)

            //lyricDownload
            let lrcDownloadDiv = document.createElement('div');
            lrcDownloadDiv.className="out s-fc3"
            let lrcDownloadP = document.createElement('p');
            lrcDownloadP.innerHTML = '歌词下载:';
            lrcDownloadDiv.style.display="none"
            lrcDownloadDiv.appendChild(lrcDownloadP)
            cvrwrap.appendChild(lrcDownloadDiv)
            let lyricObj={}

            //sheetDownload
            let sheetDownloadDiv = document.createElement('div');
            sheetDownloadDiv.className="out s-fc3"
            let sheetDownloadP = document.createElement('p');
            sheetDownloadP.innerHTML = '乐谱下载:';
            sheetDownloadDiv.style.display="none"
            sheetDownloadDiv.appendChild(sheetDownloadP)
            cvrwrap.appendChild(sheetDownloadDiv)

            //wikiMemory
            let wikiMemoryDiv = document.createElement('div');
            wikiMemoryDiv.className="out s-fc3"
            let wikiMemoryP = document.createElement('p');
            wikiMemoryP.innerHTML = '回忆坐标:';
            wikiMemoryDiv.style.display="none"
            wikiMemoryDiv.appendChild(wikiMemoryP)
            cvrwrap.appendChild(wikiMemoryDiv)


            //songDownload
            class SongFetch{
                constructor(songId,title,artists,album) {
                    this.songId=songId;
                    this.title=title;
                    this.artists=artists
                    this.album=album
                };
                ncmLevelDesc(level) {
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
                getNCMSource(){
                    weapiRequest("/api/v3/song/detail", {
                        type: "json",
                        data: {
                            c: JSON.stringify([{'id':songId}]),
                        },
                        onload: (responses)=> {
                            let songdetail=JSON.parse(responses.response);
                            //console.log(songdetail)
                            if (songdetail.privileges[0].cs){
                                songDownloadP.innerHTML='歌曲下载(云盘版本):'
                            }
                            if (songdetail.privileges[0].plLevel!="none"){
                                weapiRequest("/api/song/enhance/player/url/v1", {
                                    type: "json",
                                    data: {
                                        ids: JSON.stringify([songId]),
                                        level: songdetail.privileges[0].plLevel,
                                        encodeType: 'mp3'
                                    },
                                    onload: (responses)=> {
                                        let content=JSON.parse(responses.response);
                                        if(content.data[0].url!=null){
                                            //console.log(content)
                                            let config={
                                                filename:songTitle+'.'+content.data[0].type.toLowerCase(),
                                                url:content.data[0].url,
                                                size:content.data[0].size,
                                                desc:this.ncmLevelDesc(songdetail.privileges[0].plLevel)
                                            }
                                            if (songdetail.privileges[0].dlLevel!="none" && songdetail.privileges[0].plLevel!=songdetail.privileges[0].dlLevel){
                                                config.desc=`试听版本(${config.desc})`
                                            }
                                            this.createButton(config)
                                        }
                                    }
                                })
                            }
                            //example songid:1914447186
                            if (songdetail.privileges[0].dlLevel!="none" && songdetail.privileges[0].plLevel!=songdetail.privileges[0].dlLevel && unsafeWindow.GUser.userType==0){
                                weapiRequest("/api/song/enhance/download/url/v1", {
                                    type: "json",
                                    data: {
                                        id: songId,
                                        level: songdetail.privileges[0].dlLevel,
                                        encodeType: 'mp3'
                                    },
                                    onload: (responses)=> {
                                        let content=JSON.parse(responses.response)
                                        if(content.data.url!=null){
                                            //console.log(content)
                                            let config={
                                                filename:songTitle+'.'+content.data.type.toLowerCase(),
                                                url:content.data.url,
                                                size:content.data.size,
                                                desc:`下载版本(${this.ncmLevelDesc(songdetail.privileges[0].dlLevel)})`
                                            }
                                            this.createButton(config)
                                        }
                                    }
                                })
                            }
                        }
                    })
                };

                createButton(config){
                    let btn = document.createElement('a');
                    btn.text = config.desc;
                    btn.className="des s-fc7"
                    btn.style.margin='2px';
                    btn.addEventListener('click', () => {
                        dwonloadSong(config.url,config.filename,btn)
                    })
                    songDownloadP.appendChild(btn)
                    songDownloadDiv.style.display="inline"
                };
            }

            let songFetch=new SongFetch(songId,songTitle,songArtist,songAlbum)

            //wyy可播放
            if(!document.querySelector(".u-btni-play-dis")){
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
                    let content=JSON.parse(responses.response)
                    lyricObj=content
                    let lrc = document.createElement('a');
                    lrc.text = '下载';
                    lrc.className="des s-fc7"
                    lrc.style.margin='2px';
                    lrc.addEventListener('click',() =>{
                        downloadLyric('lrc',songTitle)
                    })
                    lrcDownloadP.appendChild(lrc)
                    lrcDownloadDiv.style.display="inline"
                },
            });

            //sheet
            weapiRequest("/api/music/sheet/list/v1", {
                type: "json",
                data: {
                    id: songId,
                    abTest:  'b',
                },
                onload: (responses)=> {
                    //console.log(content)
                    let content=JSON.parse(responses.response)
                    if (content.data.errorCode==null){
                        content.data.musicSheetSimpleInfoVOS.forEach(item=>{
                            let texts=[item.name,item.playVersion,item.musicKey+"调"]
                            if (item.difficulty.length>0){
                                texts.push("难度"+item.difficulty)
                            }
                            if (item.chordName.length>0){
                                texts.push(item.chordName+"和弦")
                            }
                            if (item.bpm>0){
                                texts.push(item.bpm+"bpm")
                            }
                            texts.push(item.totalPageSize+"页")

                            let btn = document.createElement('a');
                            btn.text = texts.join("-");
                            btn.className="des s-fc7"
                            btn.style.margin='5px';
                            btn.addEventListener('click', () => {
                                dwonloadSheet(item.id,`${songTitle}-${item.name}-${item.playVersion}`)
                            })
                            sheetDownloadP.appendChild(btn)
                            sheetDownloadDiv.style.display="inline"
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
                    let content=JSON.parse(responses.response)
                    if(content.data.blocks[0].creatives.length>0){
                        content.data.blocks.forEach(block=>{
                            if(block.code=='SONG_PLAY_ABOUT_MUSIC_MEMORY' && block.creatives.length>0){
                                let info=block.creatives[0].resources
                                let firstTimeP = document.createElement('p');
                                firstTimeP.innerHTML = `第一次听:${info[0].resourceExt.musicFirstListenDto.date}`;
                                firstTimeP.className="des s-fc3"
                                firstTimeP.style.margin='5px';
                                wikiMemoryP.appendChild(firstTimeP)
                                let recordP = document.createElement('p');
                                recordP.innerHTML = `累计播放:${info[1].resourceExt.musicTotalPlayDto.playCount}次 ${info[1].resourceExt.musicTotalPlayDto.duration}分钟 ${info[1].resourceExt.musicTotalPlayDto.text}`;
                                recordP.className="des s-fc3"
                                recordP.style.margin='5px';
                                wikiMemoryP.appendChild(recordP)
                                wikiMemoryDiv.style.display="inline"
                            }
                        })
                    }
                },
            });

            function downloadLyric(type,songTitle){
                let content=lyricObj.lrc.lyric
                if (type=='lrc-tlyric'){
                    content=combineLyric(lyricObj.lrc.lyric,lyricObj.tlyric.lyric)
                }
                else if (type=='lrc-romalrc'){
                    content=combineLyric(lyricObj.lrc.lyric,lyricObj.romalrc.lyric)
                }
                let lrc = document.createElement('a');
                let data=new Blob([content], {type:'type/plain'})
                let fileurl = URL.createObjectURL(data)
                lrc.href=fileurl
                lrc.download=songTitle+'.lrc'
                lrc.click()
                URL.revokeObjectURL(data);
            }
        }

        function dwonloadSong(url,fileName,dlbtn) {
            let btntext=dlbtn.text
            GM_download({
                url: url,
                name: fileName,
                onprogress:function(e){
                    dlbtn.text=btntext+` 正在下载(${Math.round(e.loaded/e.totalSize*10000)/100}%)`
                                        },
                onload: function () {
                    dlbtn.text=btntext
                },
                onerror :function(){
                    dlbtn.text=btntext+' 下载失败'
                }
            });
        }

        function dwonloadSheet(sheetId,desc) {
            //console.log(sheetId,desc)
            weapiRequest("/api//music/sheet/preview/info", {
                type: "json",
                data: {
                    id: sheetId,
                },
                onload: (responses)=> {
                    //console.log(content)
                    let content=JSON.parse(responses.response)
                    content.data.forEach(sheetPage=>{
                        let fileName=`${desc}-${sheetPage.pageNumber}.jpg`
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
    if(location.href.match('user')){
        let urlUserId=Number(location.href.match(/\d+$/g));
        let editArea=document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
        if(editArea && urlUserId==unsafeWindow.GUser.userId){
            let btn=document.createElement('a')
            btn.id='cloudBtn'
            btn.className='u-btn2 u-btn2-1'
            let btni=document.createElement('i')
            btni.innerHTML='云盘按歌手快传'
            btn.appendChild(btni)
            btn.setAttribute("hidefocus","true");
            btn.style.marginRight='10px';
            btn.addEventListener('click',ShowCloudUploadPopUp)
            var toplist=[]
            var selectOptions={"无版权歌手":{},"华语男歌手":{},"华语女歌手":{},"华语组合":{},"欧美男歌手":{},"欧美女歌手":{},"欧美组合":{},"日本男歌手":{},"日本女歌手":{},"日本组合":{},}
            var optionMap={0:"无版权歌手",1:"华语男歌手",2:"华语女歌手",3:"华语组合",4:"欧美男歌手",5:"欧美女歌手",6:"欧美组合",7:"日本男歌手",8:"日本女歌手",9:"日本组合"}
            var artistmap={}
            //https://raw.githubusercontent.com/Cinvin/cdn/main/artist/top.json
            //https://fastly.jsdelivr.net/gh/Cinvin/cdn/artist/top.json
            fetch('https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/top.json')
                .then(r => r.json())
                .then(r=>{
                toplist=r;
                toplist.forEach(artist=>{
                    let desc = `${artist.name}(${artist.count}首/${artist.sizeDesc})`;
                    let id = artist.id
                    selectOptions[optionMap[artist.categroy]][artist.id]=`${artist.name}(${artist.count}首/${artist.sizeDesc})`
                    artistmap[artist.id]=artist
                })
                //console.log(selectOptions)
                editArea.insertBefore(btn,editArea.lastChild)
            })


            function ShowCloudUploadPopUp(){
                Swal.fire({
                    title: '云盘上传',
                    input: 'select',
                    inputOptions: selectOptions,
                    inputPlaceholder: '选择歌手',
                    html: `<input class="form-check-input" type="checkbox" value="" id="checkbox1" checked>
                <label class="form-check-label" for="checkbox1">
                    无版权歌曲
                </label>
                <input class="form-check-input" type="checkbox" value="" id="checkbox2" checked>
                <label class="form-check-label" for="checkbox2">
                    VIP歌曲
                </label>
                <input class="form-check-input" type="checkbox" value="" id="checkbox3">
                <label class="form-check-label" for="checkbox3">
                    无损资源,歌曲免费也上传
                </label>
    `,
                    confirmButtonText: '上传',
                    showCloseButton: true,
                    footer:'<p class="des s-fc5">上传并关联歌曲 </p><a target="_blank" href="https://github.com/Cinvin/myuserscripts" class="des s-fc7">by cinvin</a>',
                    focusConfirm: false,
                    preConfirm: (artist) => {
                        return [
                            artist,
                            document.getElementById('checkbox1').checked,
                            document.getElementById('checkbox2').checked,
                            document.getElementById('checkbox3').checked,
                        ]
                    }
                }).then(result=>{
                    //console.log(result)
                    if(result.isConfirmed){
                        startUpload(result.value)
                    }
                })
            }

            function startUpload(config){
                var artistobj=artistmap[config[0]]
                var copyright=config[1]
                var vip=config[2]
                var lossless=config[3]
                showTips(`正在获取${artistobj.name}资源配置...`,1)
                //https://raw.githubusercontent.com/Cinvin/cdn/main/artist/${artistid}.json
                //https://cdn.jsdelivr.net/gh/Cinvin/cdn/artist/${artistid}.json
                fetch(`https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/${artistobj.id}.json`)
                    .then(r => r.json())
                    .then(r=>{
                    let songList=r.data
                    //console.log(songList)
                    let ids=songList.map(item=>{ return {'id':item.id} })
                    //获取需上传的song
                    showTips(`正在获取${artistobj.name}需要上传的歌曲...`,1)
                    weapiRequest("/api/v3/song/detail", {
                        type: "json",
                        method: "post",
                        sync: true,
                        data: {c: JSON.stringify(ids)},
                        onload: function(responses) {
                            //console.log(content)
                            let content=JSON.parse(responses.response)
                            let songs=Array()
                            let len=content.songs.length
                            for(let i =0;i<len;i++){
                                if(!content.privileges[i].cs){
                                    let config=songList.find(item=>{return item.id==content.songs[i].id})
                                    let item={
                                        id:content.songs[i].id,
                                        name:content.songs[i].name,
                                        album:content.songs[i].al.name,
                                        artists:content.songs[i].ar.map(ar=>ar.name).join(),
                                        filename:content.songs[i].name+'.'+config.ext,
                                        ext:config.ext,
                                        md5:config.md5,
                                        size:config.size,
                                    }
                                    if (config.name){
                                        item.id=0
                                        item.name=config.name
                                        item.album=config.al
                                        item.artists=config.ar
                                        item.filename=config.name+'.'+config.ext
                                    }

                                    let needupload=false
                                    //1.无版权
                                    if(copyright&&content.privileges[i].st==-200){
                                        needupload=true
                                    }
                                    //2.VIP
                                    if(vip&&(content.songs[i].fee==1 || content.songs[i].fee==4)){
                                        needupload=true
                                    }
                                    //3.无损
                                    if(lossless&&config.ext=='flac'){
                                        needupload=true
                                    }
                                    if(needupload||config.name){
                                        songs.push(item)
                                    }
                                }
                            }

                            if ( songs.length == 0 ){
                                showConfirmBox(artistobj.name+' 没有需要上传的文件')
                                return
                            }
                            let md5UploadObj=new Md5Upload(songs,artistobj.name,onMD5Finnish)
                            md5UploadObj.start()
                        }
                    })
                })
                    .catch('获取md5配置失败')
            }
            function onMD5Finnish(md5UploadObj){
                let text=`${md5UploadObj.name}成功上传${md5UploadObj.sucessCount}首歌曲\n`
                if(md5UploadObj.failCount>0){
                    text+='以下歌曲上传失败:'
                    md5UploadObj.failList.forEach(idx=>{text+=`${md5UploadObj.songs[idx].name} `})
                }
                showConfirmBox(text)
            }
            class Md5Upload {
                idx=0
                get currentIndex(){return this.idx}
                set currentIndex(currentIndex){
                    if(this.idx==currentIndex) return
                    this.idx=currentIndex
                    if(currentIndex>=this.count){
                        //this.destructor()
                        this.finnishCallback(this)
                    }
                }
                constructor(songs,name,finnishCallback) {
                    this.songs=songs;
                    this.count=songs.length
                    this.name=name
                    this.failCount=0
                    this.failList=Array()
                    this.sucessCount=0
                    this.existCount=0
                    this.finnishCallback=finnishCallback
                };
                start(){
                    this.currentIndex=0
                    this.uploadSong()
                }
                uploadSong(){
                    if(this.currentIndex>= this.count) return
                    let song=this.songs[this.currentIndex]
                    try{
                        weapiRequest("/api/cloud/upload/check", {
                            method: "POST",
                            type: "json",
                            data:{
                                songId:song.id,
                                md5:song.md5,
                                length:song.size,
                                ext:song.ext,
                                version:1,
                                bitrate:128,
                            },
                            onload: (responses1)=>{
                                let res1=JSON.parse(responses1.response)
                                if(res1.code!=200){
                                    console.error(song.name,'1.检查资源',res1)
                                    this.onUploadFail()
                                    return
                                }
                                console.log(song.name,'1.检查资源',res1)
                                //step2 上传令牌
                                weapiRequest("/api/nos/token/alloc", {
                                    method: "POST",
                                    type: "json",
                                    data: {
                                        filename: song.filename,
                                        length:song.size,
                                        ext: song.ext,
                                        type: 'audio',
                                        bucket: 'jd-musicrep-privatecloud-audio-public',
                                        local: false,
                                        nos_product: 3,
                                        md5: song.md5
                                    },
                                    onload: (responses2)=>{
                                        let res2=JSON.parse(responses2.response)
                                        if(res2.code!=200){
                                            console.error(song.name,'2.获取令牌',res2)
                                            this.onUploadFail()
                                            return
                                        }
                                        console.log(song.name,'2.获取令牌',res2)
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
                                            onload: (responses3)=>{
                                                let res3=JSON.parse(responses3.response)
                                                if(res3.code!=200){
                                                    console.error(song.name,'3.提交文件',res3)
                                                    this.onUploadFail()
                                                    return
                                                }
                                                console.log(song.name,'3.提交文件',res3)
                                                //step4 发布
                                                weapiRequest("/api/cloud/pub/v2", {
                                                    method: "POST",
                                                    type: "json",
                                                    data: {
                                                        songid: res3.songId,
                                                    },
                                                    onload: (responses4)=>{
                                                        let res4=JSON.parse(responses4.response)
                                                        if(res4.code!=200 && res4.code!=201){
                                                            console.error(song.name,'4.发布资源',res4)
                                                            this.onUploadFail()
                                                            return
                                                        }
                                                        console.log(song.name,'4.发布资源',res4)
                                                        //step5 关联
                                                        if(res4.privateCloud.songId!=song.id && song.id>0){
                                                            weapiRequest("/api/cloud/user/song/match", {
                                                                method: "POST",
                                                                type: "json",
                                                                sync:true,
                                                                data: {
                                                                    songId: res4.privateCloud.songId,
                                                                    adjustSongId: song.id,
                                                                },
                                                                onload: (responses5)=>{
                                                                    let res5=JSON.parse(responses5.response)
                                                                    if(res5.code!=200){
                                                                        console.error(song.name,'5.匹配歌曲',res5)
                                                                        this.onUploadFail()
                                                                        return
                                                                    }
                                                                    console.log(song.name,'5.匹配歌曲',res5)
                                                                    console.log(song.name,'完成')
                                                                    //完成
                                                                    this.onUploadSucess()
                                                                },
                                                                onerror: function(res) {
                                                                    console.error(song.name,'5.匹配歌曲',res)
                                                                    this. onUploadFail()
                                                                }
                                                            })
                                                        }
                                                        else{
                                                            console.log(song.name,'完成')
                                                            //完成
                                                            this.onUploadSucess()
                                                        }
                                                    },
                                                    onerror: function(res) {
                                                        console.error(song.name,'4.发布资源',res)
                                                        this.onUploadFail()
                                                    }
                                                })
                                            },
                                            onerror: function(res) {
                                                console.error(song.name,'3.提交文件',res)
                                                this.onUploadFail()
                                            }
                                        });
                                    },
                                    onerror: function(res) {
                                        console.error(song.name,'2.获取令牌',res)
                                        this.onUploadFail()
                                    }
                                });
                            },
                            onerror: function(res) {
                                console.error(song.name,'1.检查资源',res)
                                this.onUploadFail()
                            }
                        })

                    }
                    catch(e){
                        console.error(e);
                        this.onUploadFail()
                    }
                }
                onUploadFail(){
                    this.failCount+=1
                    this.failList.push(this.currentIndex)
                    let song=this.songs[this.currentIndex]
                    showTips(`(${this.currentIndex+1}/${this.count}) ${song.name} - ${song.artists} - ${song.album} 上传失败`,2)
                    this.currentIndex+=1
                    this.uploadSong()
                }
                onUploadSucess(){
                    this.sucessCount+=1
                    let song=this.songs[this.currentIndex]
                    showTips(`(${this.currentIndex+1}/${this.count}) ${song.name} - ${song.artists} - ${song.album} 上传成功`,1)
                    this.currentIndex+=1
                    this.uploadSong()
                }
            }
        }
    }
})();
