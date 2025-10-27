import { unsafeWindow } from '$'
import { hookTopWindow } from './hooks'
import { myHomeMain } from './home/main'

import { songDetailObj } from './song/songDetail'
import { albumDetailObj } from './album/albumDetail'
import { playlistDetailObj } from './playlist/playlistDetail'
import { artistDetailObj } from './artist/artistDetail'

import { hookWindowForCommentBox, observerCommentBox, addCommentWithCumstomIP } from './commentBox'

import { registerMenuCommand } from './registerMenuCommand'
import { InfoFirstPage } from './commentBox'

const url = unsafeWindow.location.href
const params = new URLSearchParams(unsafeWindow.location.search)
const paramId = Number(params.get('id'))

export const onStart = () => {
    console.log('[ncmExtend] onStart()')
    if (unsafeWindow.self === unsafeWindow.top) {
        GM_addStyle(GM_getResourceText('fa').replaceAll('../webfonts/', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/webfonts/'))
        unsafeWindow.GUserScriptObjects = { Swal: Swal }
        hookTopWindow()
        const iframes = document.getElementsByTagName("iframe")
        for (let iframe of iframes) {
            hookWindowForCommentBox(iframe.contentWindow)
        }
    }
    else if (unsafeWindow.name === 'contentFrame') {
        Swal = unsafeWindow.top.GUserScriptObjects.Swal

        hookWindowForCommentBox(unsafeWindow)
        if (paramId > 0) {
            if (url.includes('/song?')) {
                songDetailObj.fetchSongData(paramId)
            }
            else if (url.includes('/playlist?')) {
                playlistDetailObj.fetchPlaylistFullData(paramId)
            }
            else if (url.includes('/album?')) {
                albumDetailObj.fetchAlbumData(paramId)
            }
        }
    }
}
export const onDomReady = () => {
    console.log('[ncmExtend] onDomReady()')
    if (paramId > 0) {
        if (url.includes('/user/home?')) {
            myHomeMain(paramId)
        }
        else if (url.includes('/song?')) {
            songDetailObj.onDomReady()
        }
        else if (url.includes('/playlist?')) {
            playlistDetailObj.onDomReady()
        }
        else if (url.includes('/album?')) {
            albumDetailObj.onDomReady()
        }
        else if (url.includes('/artist?')) {
            artistDetailObj.onDomReady()
        }
    }

    const commentBox = document.querySelector('#comment-box')
    if (commentBox) {
        observerCommentBox(commentBox)
        InfoFirstPage(commentBox)
        addCommentWithCumstomIP(commentBox)
    }
    if (unsafeWindow.name === 'contentFrame') {
        registerMenuCommand()
    }
}
export const onPageLoaded = () => {
    console.log('[ncmExtend] onPageLoaded()')
}