import { unsafeWindow } from '$'
import { hookTopWindow } from './hooks'
import { myHomeMain } from './home/main'
import { playlistMain } from './playlist/main'
import { albumMain } from './album/main'
import { songMain } from './song/main'

import { hookWindowForCommentBox } from './commentBox'
import { observerCommentBox } from './commentBox'

import { registerMenuCommand } from './registerMenuCommand'
import { InfoFirstPage } from './commentBox'

export const onStart = () => {
    console.log('[ncmExtend] onStart()')
    const url = unsafeWindow.location.href
    if (unsafeWindow.self === unsafeWindow.top) {
        unsafeWindow.GUserScriptObjects = {}
        hookTopWindow()
        const iframes = document.getElementsByTagName("iframe")
        for (let iframe of iframes) {
            hookWindowForCommentBox(iframe.contentWindow)
        }
    }
    else if (unsafeWindow.name === 'contentFrame') {
        hookWindowForCommentBox(unsafeWindow)
    }
}
export const onDomReady = () => {
    console.log('[ncmExtend] onDomReady()')
    const url = unsafeWindow.location.href
    const params = new URLSearchParams(unsafeWindow.location.search)
    if (url.includes('/user/home')) {
        myHomeMain(Number(params.get('id')))
    }
    else if (url.includes('/playlist') && !url.includes('/my/m/music/playlist')) {
        playlistMain(Number(params.get('id')))
    }
    else if (url.includes('/album')) {
        albumMain(Number(params.get('id')))
    }
    else if (url.includes('/song')) {
        songMain(Number(params.get('id')))
    }

    const commentBox = document.querySelector('#comment-box')
    if (commentBox) {
        observerCommentBox(commentBox)
        InfoFirstPage(commentBox)
    }
    registerMenuCommand()
}
export const onPageLoaded = () => {
    console.log('[ncmExtend] onPageLoaded()')
}