import { createBigButton, showTips, showConfirmBox } from "../utils/common"
import { getDownloadSettings, setDownloadSettings, levelOptions, defaultOfDEFAULT_LEVEL } from "../utils/constant"
import { isOldSettedHeader } from "../utils/request"

export const scriptSettings = (uiArea) => {
    //设置请求头
    const btnExport = createBigButton('脚本设置', uiArea, 2)
    btnExport.addEventListener('click', openSettingPopup)

    function openSettingPopup() {
        Swal.fire({
            title: '脚本设置',
            showConfirmButton: false,
            html: `<div><button type="button" class="swal2-styled" id="btn-playlevel-settings">音质播放设置</button></div>
            <div><button type="button" class="swal2-styled" id="btn-download-settings">通用下载设置</button></div>
            <div><button type="button" class="swal2-styled" id="btn-header-settings">设置请求头</button></div>`,
            confirmButtonText: '设置',
            didOpen: () => {
                let container = Swal.getHtmlContainer()
                let btnPlayLevelSettings = container.querySelector('#btn-playlevel-settings')
                let btnDownloadSettings = container.querySelector('#btn-download-settings')
                let btnHeaderSettings = container.querySelector('#btn-header-settings')

                btnPlayLevelSettings.addEventListener('click', () => {
                    setPlayLevel()
                })
                btnDownloadSettings.addEventListener('click', () => {
                    openDownloadSettingPopup()
                })
                btnHeaderSettings.addEventListener('click', () => {
                    openHeaderSettingPopup()
                })
            },
        })
    }

    function openDownloadSettingPopup() {
        Swal.fire({
            title: '通用下载设置',
            showCloseButton: true,
            html: `<div>
                        <div><label>文件名格式
                      <select id="dl-out"  class="swal2-select">
                        <option value="artist-title">歌手 - 标题</option><option value="title-artist">标题 - 歌手</option><option value="title">仅标题</option>
                      </select>
                    </label></div>
                    <div><label>文件夹格式
                    <select id="dl-folder" class="swal2-select"><option value="none">不建立文件夹</option><option value="artist">建立歌手文件夹</option><option value="artist-album">建立歌手 \\ 专辑文件夹</option></select>
                    </label></div>
                    <div><label>音乐元数据
                        <select id="dl-appendMeta" class="swal2-select">
                            <option value="notAppend">不添加</option><option value="skipCloud">云盘歌曲不添加</option><option value="allAppend">全部添加</option>
                        </select></div>
                    </label>
</div>`,
            confirmButtonText: '确定',
            footer: '<div>建立文件夹功能篡改猴下载模式设置为浏览器API可以生效，其他脚本管理器可能导致文件名乱码的问题。</div>',
            preConfirm: () => {
                const container = Swal.getHtmlContainer()

                return {
                    appendMeta: container.querySelector('#dl-appendMeta').value.trim(),
                    out: container.querySelector('#dl-out').value.trim(),
                    folder: container.querySelector('#dl-folder').value.trim(),
                }
            },
            didOpen: () => {
                const container = Swal.getHtmlContainer()
                const downloadSettings = getDownloadSettings()
                const metaInput = container.querySelector('#dl-appendMeta')
                metaInput.value = downloadSettings.appendMeta
                const outinput = container.querySelector('#dl-out')
                outinput.value = downloadSettings.out
                const folderInput = container.querySelector('#dl-folder')
                folderInput.value = downloadSettings.folder
            }
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setDownloadSettings(result.value)
                }
            })
    }

    function openHeaderSettingPopup() {
        Swal.fire({
            title: '设置客户端请求头（Header）',
            showCloseButton: true,
            html: `<div><label>Cookie<input class="swal2-input" id="text-cookie"></label></div>
            <div><label>UserAgent<input class="swal2-input" id="text-userAgent"></label></div>`,
            footer: `<div>以上内容需要自行使用<a target="_blank" target="_blank" href="https://reqable.com/zh-CN/">Reqable</a>等抓包工具，获取网易云音乐客户端的请求头。</div>
            <div>设置的目的是尽量模拟客户端调用，避免被风控系统检测到。(提示操作频繁/网络拥挤)</div>`,
            confirmButtonText: '设置',
            didOpen: () => {
                const container = Swal.getHtmlContainer()
                const actions = Swal.getActions()
                actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-cancel-set" style="display: inline-block;">清除设置</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-set" style="display: inline-block;">设置</button>`
                const cookieInput = container.querySelector('#text-cookie')
                const userAgentInput = container.querySelector('#text-userAgent')
                const requestHeader = JSON.parse(GM_getValue('requestHeader', '{}'))
                if (requestHeader.originalCookie) {
                    cookieInput.value = requestHeader.originalCookie
                }
                if (requestHeader.userAgent) {
                    userAgentInput.value = requestHeader.userAgent
                }
                const btnCancelSet = actions.querySelector('#btn-cancel-set')
                const btnSet = actions.querySelector('#btn-set')
                btnCancelSet.addEventListener('click', () => {
                    removeHeader();
                });
                btnSet.addEventListener('click', () => {
                    setHeader({
                        cookie: cookieInput.value.trim(),
                        userAgent: userAgentInput.value.trim(),
                    });
                });
            }
        })
    }
    function setHeader(config) {
        const cookieObject = tryParseJSON(config.cookie) || parseCookie(config.cookie)
        if (config.userAgent.length == 0) {
            showTips('请填写UserAgent', 2)
            return
        }
        if (Object.keys(cookieObject).length == 0) {
            showTips('cookie格式不正确，支持标准的cookie格式和JSON格式', 2)
            return
        }
        if (!(cookieObject.MUSIC_U && cookieObject.deviceId)) {
            showTips('cookie内容不完整，cookie中一定会有MUSIC_U、deviceId等字段', 2)
            return
        }

        let cookieString = ''
        for (const key in cookieObject) {
            cookieString += `${key}=${cookieObject[key]}; `
        }

        GM_setValue('requestHeader', JSON.stringify({
            originalCookie: config.cookie,
            //appendCookie: appendCookieText,
            coverCookie: cookieString,
            userAgent: config.userAgent,
        }))
        showConfirmBox('设置完成，刷新网页生效。')
    }
    function removeHeader() {
        const requestHeader = JSON.parse(GM_getValue('requestHeader', '{}'))
        if (!requestHeader.originalCookie) {
            showTips('并没有设置请求头', 2)
            return
        }

        GM_setValue('requestHeader', '{}')

        let msg = '请求头设置已清除。'

        if (requestHeader.appendCookie) {
            msg += '需手动清空网易云网页版cookie，以免以后被判断为“使用非法挂机软件”。'
        }

        showConfirmBox(msg)
    }
}

export const parseCookie = (cookieString) => {
    return cookieString
        .split(";")
        .map(part => part.trim())
        .filter(part => part)
        .reduce((cookies, part) => {
            const [key, value] = part.split("=", 2);
            cookies[key.trim()] = value ? value.trim() : "";
            return cookies;
        }, {});
}
export const tryParseJSON = (jsonString) => {
    try {
        const o = JSON.parse(jsonString)
        if (o && typeof o === "object") {
            return o
        }
    }
    catch (e) { }
    return false;
}

export const setPlayLevel = () => {
    Swal.fire({
        title: '音质播放设置',
        input: 'select',
        inputOptions: levelOptions,
        inputValue: GM_getValue('DEFAULT_LEVEL', defaultOfDEFAULT_LEVEL),
        confirmButtonText: '确定',
        showCloseButton: true,
        footer: '<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
    })
        .then(result => {
            if (result.isConfirmed) {
                GM_setValue('DEFAULT_LEVEL', result.value)
            }
        })
}

export const WarningOldHeaderSetting = () => {
    if (isOldSettedHeader) {
        Swal.fire({
            text: '脚本请求头设置已更新为更安全的方式，请前往个人主页清除请求头设置以及清除music.163.com的cookie，然后重新登录。以免使用网页版听歌被判断为“使用非法挂机软件”。目前“请求头设置”没有太大作用，貌似不设置也能流畅上传云盘。',
            icon: 'warning',
            confirmButtonText: '确定'
        })
    }
}