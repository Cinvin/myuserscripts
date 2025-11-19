import { unsafeWindow } from '$'
import { hookTopWindow, hookContentFrame, hookOtherWindow, hookWebPlayerFetch } from './hooks'
import { myHomeMain } from './home/main'

import { songDetailObj } from './song/songDetail'
import { albumDetailObj } from './album/albumDetail'
import { playlistDetailObj } from './playlist/playlistDetail'
import { artistDetailObj } from './artist/artistDetail'
import { observerWebPlayer } from './webPlayer/main'

import { observerCommentBox, addCommentWithCumstomIP, InfoFirstPage } from './commentBox'

import { registerMenuCommand } from './registerMenuCommand'

const url = unsafeWindow.location.href
const params = new URLSearchParams(unsafeWindow.location.search)
const paramId = Number(params.get('id'))
const isWebPlayer = url === 'https://music.163.com/st/webplayer'

export const onStart = () => {
    console.log('[ncmExtend] onStart()')
    if (isWebPlayer) {
        hookWebPlayerFetch()
    }
    else {
        if (unsafeWindow.self === unsafeWindow.top) {
            GM_addStyle(GM_getResourceText('fa').replaceAll('../webfonts/', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/webfonts/'))
            unsafeWindow.GUserScriptObjects = {
                Swal: Swal,
            }
            hookTopWindow()
        }
        else if (unsafeWindow.name === 'contentFrame') {
            Swal = unsafeWindow.top.GUserScriptObjects.Swal
            hookContentFrame()
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
        else {
            hookOtherWindow()
        }
    }
}
export const onDomReady = () => {
    console.log('[ncmExtend] onDomReady()')

    if (isWebPlayer) {

    }
    else {
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
}
export const onPageLoaded = () => {
    console.log('[ncmExtend] onPageLoaded()')
    if (isWebPlayer) {
        observerWebPlayer()
    }
}