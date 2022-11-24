// ==UserScript==
// @name         咪咕音乐下载
// @namespace    https://github.com/Cinvin
// @version      0.2.0
// @description  在咪咕音乐专辑页面添加下载链接,可下载最高音质,支持VIP/付费专辑
// @author       cinvin
// @license MIT
// @match        https://music.migu.cn/v3/music/album/*
// @match        https://music.migu.cn/v3/music/digital_album/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=migu.cn
// @grant       GM_xmlhttpRequest
// @grant       GM_download
// ==/UserScript==

(function() {
    'use strict';
    // Your code here...

    function fileSizeDesc(fileSize) {
        if (fileSize < 1024) {
            return fileSize.toFixed(2) + 'B'
        } else if (fileSize >= 1024 && fileSize < Math.pow(1024, 2)) {
            return (fileSize / 1024).toFixed(2).toString() + 'K'
        } else if (fileSize >= Math.pow(1024, 2) && fileSize < Math.pow(1024, 3)) {
            return (fileSize / Math.pow(1024, 2)).toFixed(2).toString() + 'M';
        } else if (fileSize > Math.pow(1024, 3)) {
            return (fileSize / Math.pow(1024, 3)).toFixed(2).toString() + 'G';
        } else if (fileSize > Math.pow(1024, 4)) {
            return (fileSize / Math.pow(1024, 4)).toFixed(2).toString() + 'T';
        }
    };
    var QualityDesc = {'PQ':'普通','HQ':'极高','SQ':'无损','ZQ':'至臻'}
    var AlbumId = (document.querySelector('#J_AlbumId') || document.querySelector('#J_ResId')).getAttribute("value");

    var fullUrl = "https://app.c.nf.migu.cn/MIGUM2.0/v1.0/content/resourceinfo.do?needSimple=01&resourceId="+AlbumId+"&resourceType=2003";
    console.log(fullUrl);
    GM_xmlhttpRequest({
        method: 'GET',
        url: fullUrl,
        headers: {
            'User-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/7.0.11(0x17000b21) NetType/4G Language/zh_CN',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Host' : 'app.c.nf.migu.cn',
            'Content-Type': 'application/json;charset=utf-8',
        },
        onload: function(responses) {
            //console.log(responses);
            let jsonObj=JSON.parse(responses.response);
            //console.log(jsonObj);
            if (jsonObj.resource[0] && jsonObj.resource[0].songItems) {
                let dllist= {};
                for (let item of jsonObj.resource[0].songItems) {
                    let songid = item.songId;
                    let songdllist=item.newRateFormats.map((detail) => ({
                        formatType: QualityDesc[detail.formatType] || detail.formatType,
                        url: encodeURI(detail.androidUrl || detail.url),
                        size: fileSizeDesc(Number(detail.androidSize || detail.size)),
                        fileType: detail.androidFileType || detail.fileType,
                    }));
                    dllist[songid]=songdllist;
                }
                let songselectorList = document.querySelector('.songlist-body').children;
                console.log(songselectorList);
                if (songselectorList && songselectorList.length != -1) {
                    for(let i=0;i<songselectorList.length;i++){
                        let node=songselectorList[i];
                        let songid=node.getAttribute("data-mid");
                        let appendtag=node.querySelector('.J_SongName')
                        let songname=appendtag.querySelector('.song-name-txt').text
                        if (dllist[songid] && dllist[songid].length != -1){
                            dllist[songid].forEach(function (item){
                                let urlObj = new URL(item.url);
                                urlObj.protocol = 'https';
                                urlObj.hostname = 'freetyst.nf.migu.cn';
                                let dl = document.createElement('a');
                                dl.text = item.formatType;
                                dl.title = item.size;
                                dl.style.margin='5px';
                                dl.addEventListener('click', () => {
                                    let filename=songname+'.'+item.fileType;
                                    GM_download({
                                        url: urlObj.href,
                                        name: filename,
                                        onprogress:function(e){
                                           // console.log(e);
                                            dl.text=`${item.formatType} (${Math.round(e.loaded/e.totalSize*10000)/100}%)`
                                        },
                                        onload: function () {
                                            dl.text=item.formatType
                                        },
                                        onerror :function(){
                                            GM_notification({ text: filename, title: "下载失败", timeout: 5000 })
                                        }
                                    });
                                })
                                appendtag.appendChild(dl);
                            });
                        }
                    }
                }
            }
        }
    });
})();
