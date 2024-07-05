import { unsafeWindow } from '$'
import { hookTopWindow } from './hooks'
import { myHomeMain } from './home/main'
import {playlistMain} from'./playlist/main'
import { albumMain } from './album/main'
import { songMain } from './song/main'
export const router = () => {
    if (unsafeWindow.self == unsafeWindow.top) {
        hookTopWindow()
    }
    const url = unsafeWindow.location.href
    const params = new URLSearchParams(unsafeWindow.location.search)
    if (url.includes('/user/home')) {
        if (Number(params.get('id')) === unsafeWindow.GUser.userId) {
            myHomeMain()
        }
    }
    else if (url.includes('/playlist') && !url.includes('/my/m/music/playlist') ) {
        playlistMain(Number(params.get('id')))
    }
    else if (url.includes('/album')) {
        albumMain(Number(params.get('id')))
    }
    else if (url.includes('/song')) {
        songMain(Number(params.get('id')))
    }
}