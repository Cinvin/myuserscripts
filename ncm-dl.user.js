// ==UserScript==
// @name             网易云:音乐、歌词、乐谱下载,云盘快速上传周杰伦等歌手
// @namespace     https://github.com/Cinvin/myuserscripts
// @license           MIT
// @version           1.2.10
// @description     歌曲页:歌曲、歌词、乐谱下载,个人主页:云盘快速上传歌手歌曲
// @author            cinvin
// @match            https://music.163.com/*
// @grant             GM_xmlhttpRequest
// @grant             GM_download
// @grant             unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    const weapiRequest=unsafeWindow.NEJ.P("nej.j").be3x

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

            //lyricShow
            let lrcShowDiv = document.createElement('div');
            lrcShowDiv.className="out s-fc3"
            let lrcShowP = document.createElement('p');
            lrcShowP.innerHTML = '歌词显示:';
            lrcShowDiv.style.display="none"
            lrcShowDiv.appendChild(lrcShowP)
            cvrwrap.appendChild(lrcShowDiv)

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
                kuwotoken=''
                get kuwoToken(){
                    if(this.kuwotoken.length==0){
                        fetch('http://www.kuwo.cn/favicon.ico')
                    }
                    return this.kuwotoken
                }
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
                        query: {
                            c: JSON.stringify([{'id':songId}]),
                        },
                        onload: (songdetail)=> {
                            console.log(songdetail)
                            if (songdetail.privileges[0].cs){
                                songDownloadP.innerHTML='歌曲下载(云盘版本):'
                            }
                            if (songdetail.privileges[0].plLevel!="none"){
                                weapiRequest("/api/song/enhance/player/url/v1", {
                                    type: "json",
                                    query: {
                                        ids: JSON.stringify([songId]),
                                        level: songdetail.privileges[0].plLevel,
                                        encodeType: 'mp3'
                                    },
                                    onload: (content)=> {
                                        if(content.data[0].url!=null){
                                            console.log(content)
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
                                    query: {
                                        id: songId,
                                        level: songdetail.privileges[0].dlLevel,
                                        encodeType: 'mp3'
                                    },
                                    onload: (content)=> {
                                        if(content.data.url!=null){
                                            console.log(content)
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
                query: {
                    id: songId,
                    tv: -1,
                    lv: -1,
                    rv: -1,
                    kv: -1,
                },
                onload: function(content) {
                    lyricObj=content
                    if(content.romalrc.lyric.length>0){
                        let tl = document.createElement('a');
                        tl.text = '正常';
                        tl.className="des s-fc7"
                        tl.style.margin='2px';
                        tl.addEventListener('click', () => {
                            switchLyric('tlyric');
                        })
                        lrcShowP.appendChild(tl)
                        let rl = document.createElement('a');
                        rl.text = '罗马音';
                        rl.className="des s-fc7"
                        rl.style.margin='2px';
                        rl.addEventListener('click', () => {
                            switchLyric('romalrc');
                        })
                        lrcShowP.appendChild(rl)
                        lrcShowDiv.style.display="inline"
                    }
                    let lrc = document.createElement('a');
                    lrc.text = '原词';
                    lrc.className="des s-fc7"
                    lrc.style.margin='2px';
                    lrc.addEventListener('click',() =>{
                        downloadLyric('lrc',songTitle)
                    })
                    lrcDownloadP.appendChild(lrc)
                    if(content.tlyric.lyric.length>0){
                        let tlyric = document.createElement('a');
                        tlyric.text = '原词x翻译';
                        tlyric.className="des s-fc7"
                        tlyric.style.margin='2px';
                        tlyric.addEventListener('click',() =>{
                            downloadLyric('lrc-tlyric',songTitle)
                        })
                        lrcDownloadP.appendChild(tlyric)
                    }
                    if(content.romalrc.lyric.length>0){
                        let romalrc = document.createElement('a');
                        romalrc.text = '原词x罗马音';
                        romalrc.className="des s-fc7"
                        romalrc.style.margin='2px';
                        romalrc.addEventListener('click',() =>{
                            downloadLyric('lrc-romalrc',songTitle)
                        })
                        lrcDownloadP.appendChild(romalrc)
                    }
                    lrcDownloadDiv.style.display="inline"
                },
            });

            //sheet
            weapiRequest("/api/music/sheet/list/v1", {
                type: "json",
                query: {
                    id: songId,
                    abTest:  'b',
                },
                onload: (content)=> {
                    console.log(content)
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
                onload: function(content) {
                    console.log(content)
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

            function switchLyric(type) {
                let lyric1=lyricObj.lrc.lyric
                let lyric2=null
                switch (type) {
                    case 'tlyric':
                        lyric2=lyricObj.tlyric.lyric
                        break
                    case 'romalrc':
                        lyric2=lyricObj.romalrc.lyric
                        break
                }
                let lyric_content=document.querySelector("#lyric-content")
                let songId=Number(location.href.match(/\d+$/g));
                let lyrictimelines=unsafeWindow.NEJ.P("nm.ut").bFL9C(lyric1, lyric2);
                let a9j = unsafeWindow.NEJ.P("nej.e")
                a9j.dn4r(lyric_content, "m-lyric-content", {
                    id: songId,
                    nolyric: lyricObj.nolyric,
                    limit: lyric2 ? 6 : 13,
                    lines: lyrictimelines.lines,
                    scrollable: lyrictimelines.scrollable,
                    thirdCopy: a9j.v3x(lyric_content, "thirdCopy") == "true",
                    copyFrom: a9j.v3x(lyric_content, "copyFrom")
                });
                lyricObj.scrollable = lyrictimelines.scrollable;
                lyricObj.songId = songId;
                //a9j.dm1x("user-operation", "m-user-operation", lyric);
                unsafeWindow.NEJ.P("nej.v").s3x("flag_ctrl", "click", () => {
                    var bBh8Z = a9j.A3x("flag_more");
                    if (a9j.bE4I(bBh8Z, "f-hide")) {
                        a9j.x3x(bBh8Z, "f-hide");
                        a9j.A3x("flag_ctrl").innerHTML = '收起<i class="u-icn u-icn-70"></i>'
                    } else {
                        a9j.w3x(bBh8Z, "f-hide");
                        a9j.A3x("flag_ctrl").innerHTML = '展开<i class="u-icn u-icn-69"></i>'
                    }
                })
            }
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
            function combineLyric(lyric1,lyric2){
                let lyrictimelines=unsafeWindow.NEJ.P("nm.ut").bFL9C(lyric1, lyric2);
                let content=''
                lyrictimelines.lines.forEach(line=>{
                    let linecontent=`[${line.tag}] ${line.lyric}`
            linecontent=linecontent.replace('<br>','\n').trim()+'\n'
                    content=content+linecontent
                })
                return content.trim()
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
            console.log(sheetId,desc)
            weapiRequest("/api//music/sheet/preview/info", {
                type: "json",
                query: {
                    id: sheetId,
                },
                onload: (content)=> {
                    console.log(content)
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

    function showConfirmBox(msg){
        unsafeWindow.NEJ.P("nm.x").iM6G(msg);
    }

    function showTips(tip,type){
        //type:1 √ 2:!
        unsafeWindow.g_showTipCard({
            tip: tip,
            type: type
        })
    }
    if(location.href.match('user')){
        let urlUserId=Number(location.href.match(/\d+$/g));
        let editArea=document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
        if(editArea && urlUserId==unsafeWindow.GUser.userId){
            //个人主页
            if(!weapiRequest){
                let btnissue=document.createElement('a')
                btnissue.text ='因网站更新导致脚本失效,欢迎进行反馈';
                btnissue.className="des s-fc7"
                btnissue.style.margin='2px';
                btnissue.href='https://github.com/Cinvin/myuserscripts/issues'
                editArea.insertBefore(btnissue,editArea.lastChild)
            }
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
            //https://raw.githubusercontent.com/Cinvin/cdn/main/artist/top.json
            //https://fastly.jsdelivr.net/gh/Cinvin/cdn/artist/top.json
            fetch('https://fastly.jsdelivr.net/gh/Cinvin/cdn/artist/top.json')
                .then(r => r.json())
                .then(r=>{
                toplist=r;
                editArea.insertBefore(btn,editArea.lastChild)
            })


            function ShowCloudUploadPopUp(){
                let option = {
                    title:'云盘快速上传 点击歌手开始上传 请善用Ctrl+F',
                    clazz: "m-layer-w4",
                    message:''
                };
                let popupdom=unsafeWindow.NEJ.P("nm.x").os8k(option).o3x;
                //console.log(popupdom)
                let artists=toplist
                let btns=[]
                artists.forEach(artist=>{
                    let btn = document.createElement('a');
                    btn.text = `${artist.name}(${artist.count}首/${artist.sizeDesc})`;
                    btn.className="des s-fc7"
                    btn.style.margin='2px';
                    btn.addEventListener('click', () => {
                        startUpload(artist.name,artist.id)
                    })
                    btns.push(btn)
                    btns.forEach(btn=>{popupdom.childNodes[0].appendChild(btn)})
                })
                popupdom.childNodes[1].innerHTML='<p class="inf s-fc3">上传不用文件是因为有人上传过,可以跳过这个步骤</p><p class="inf s-fc3">内容都有所缺少。同一首歌若在不同专辑出现，可能就上传一份。</p><p class="inf s-fc3">选取规则为网易云是无版权、VIP或音源是无损以上音质</p><span class="inf s-fc3">在拼夕夕上传一个歌手要1.88，这里秒传，<a target="_blank" href="https://github.com/Cinvin/myuserscripts" class="des s-fc7">可以点个免费的⭐️吗</a></span>'
            }

            function startUpload(cfgname,artistid){
                showTips(`正在获取${cfgname}配置...`,1)
                //https://raw.githubusercontent.com/Cinvin/cdn/main/artist/${artistid}.json
                //https://cdn.jsdelivr.net/gh/Cinvin/cdn/artist/${artistid}.json
                fetch(`https://fastly.jsdelivr.net/gh/Cinvin/cdn/artist/${artistid}.json`)
                    .then(r => r.json())
                    .then(r=>{
                    let songList=r.data
                    //console.log(songList)
                    let ids=songList.map(item=>{ return {'id':item.id} })
                    //获取需上传的song
                    showTips(`正在获取${cfgname}需要上传的歌曲..`,1)
                    weapiRequest("/api/v3/song/detail", {
                        type: "json",
                        method: "post",
                        sync: true,
                        query: {c: JSON.stringify(ids)},
                        onload: function(content) {
                            //console.log(content)
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
                                    songs.push(item)
                                }
                            }

                            if ( songs.length == 0 ){
                                showConfirmBox(cfgname+' 没有需要上传的文件')
                                return
                            }
                            let md5UploadObj=new Md5Upload(songs,cfgname,onMD5Finnish)
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
                    // ah.proxy({
                    //     onRequest: (config, handler) => {
                    //         if (config.url.indexOf('upload/check')>0||config.url.indexOf('cloud/pub/v2')>0) {
                    //             let headers=config.headers
                    //             headers.cookie=unsafeWindow.document.cookie+';os=pc;appver=2.9.7'
                    //             let tagetUrl=config.url
                    //             if (tagetUrl.startsWith('/')){
                    //                 tagetUrl = 'https://interface.music.163.com'+tagetUrl
                    //             }
                    //             console.log(config)
                    //             GM_xmlhttpRequest({
                    //                 async:config.async,
                    //                 method: config.method,
                    //                 url: tagetUrl,
                    //                 headers: headers,
                    //                 cookie:headers.cookie,
                    //                 data:config.body,
                    //                 onload: function(response) {
                    //                     console.log(response)
                    //                     handler.resolve({
                    //                         config: config,
                    //                         status: response.status,
                    //                         headers: response.responseHeaders,
                    //                         response: response.response,
                    //                     })
                    //                 }
                    //             });
                    //         }
                    //         else {
                    //             handler.next(config);
                    //         }
                    //     },
                    //     onResponse: (response, handler) => {
                    //         console.log(response)
                    //         handler.next(response)
                    //     },
                    // },unsafeWindow)
                };
                // destructor(){
                //     ah.unProxy(unsafeWindow)
                // }
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
                            onload: (res1)=>{
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
                                    query: {
                                        filename: song.filename,
                                        length:song.size,
                                        ext: song.ext,
                                        type: 'audio',
                                        bucket: 'jd-musicrep-privatecloud-audio-public',
                                        local: false,
                                        nos_product: 3,
                                        md5: song.md5
                                    },
                                    onload: (res2)=>{
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
                                            onload: (res3)=>{
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
                                                    onload: (res4)=>{
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
                                                                onload: (res5)=>{
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
                    showTips(`${song.name} - ${song.artists} - ${song.album} 上传失败`,2)
                    this.currentIndex+=1
                    this.uploadSong()
                }
                onUploadSucess(){
                    this.sucessCount+=1
                    let song=this.songs[this.currentIndex]
                    showTips(`${song.name} - ${song.artists} - ${song.album} 上传成功`,1)
                    this.currentIndex+=1
                    this.uploadSong()
                }
            }
        }
    }
})();
