import { setPlayLevel } from './home/scriptSettings'
export const registerMenuCommand = () => {
    GM_registerMenuCommand(`音质播放设置`, setPlayLevel)
}