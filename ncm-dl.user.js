// ==UserScript==
// @name         网易云音乐下载
// @namespace    https://github.com/Cinvin
// @license MIT
// @version      0.1.0
// @description  在单曲页封面下面加个下载按钮 方便下载
// @author       cinvin
// @match        https://music.163.com/*
// @grant       GM_download
// @grant       unsafeWindow
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    console.log(location.href.match('song?id='));
    if (location.href.match('song')){
        //song
        var iFrame=document.querySelector("#g_iframe")
        iFrame.onload=function (){
            if(iFrame.contentWindow.document.querySelector(".u-btni-play-dis")){
                return
            }
            var songTitle=iFrame.contentWindow.document.head.querySelector("[property~='og:title'][content]").content;
            var songId=Number(location.href.match(/\d+$/g));
            var newItem = document.createElement('div');
            newItem.className="out s-fc3"
            var dl = document.createElement('a');
            dl.text = '下载';
            dl.className="des s-fc7"
            dl.addEventListener('click', () => {
                dwonloadSong(songId,songTitle,dl)
            })
            newItem.appendChild(dl)

            var cvrwrap=iFrame.contentWindow.document.querySelector(".cvrwrap")
            if(cvrwrap){
                cvrwrap.appendChild(newItem)
            }
        }
    }
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
            default:
                return level
        }
    }
    function dwonloadSong(songId,songTitle,dlbtn){
        unsafeWindow.NEJ.P("nej.j").be0x("/api/song/enhance/player/url/v1", {
            type: "json",
            query: {
                ids: JSON.stringify([songId]),
                level: 'hires',
                encodeType: 'flac'
            },
            onload: function(content) {
                console.log(content)
                if(content.code==200 && content.data[0].code==200){
                    var filename=songTitle+'.'+content.data[0].type.toLowerCase();
                    var dlurl=content.data[0].url
                    var size=content.data[0].size
                    var level=levelDesc(content.data[0].level)
                    GM_download({
                        url: dlurl,
                        name: filename,
                        onprogress:function(e){
                            dlbtn.text=`下载${level}品质音乐中... (${Math.round(e.loaded/e.totalSize*10000)/100}%)`
                                        },
                        onload: function () {
                            dlbtn.text='下载'
                        },
                        onerror :function(){
                            dlbtn.text='下载失败'
                        }
                    });
                }
                else{
                    dlbtn.text='获取下载链接失败 可能无下载权限';
                }
            },
            onerror: function(content) {
                console.log(content)
            }
        });
    }
})();