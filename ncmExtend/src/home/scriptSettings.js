import { createBigButton, showTips, showConfirmBox } from "../utils/common"
import { getDownloadSettings, setDownloadSettings, levelOptions, defaultOfDEFAULT_LEVEL } from "../utils/constant"

export const scriptSettings = (uiArea) => {
    //设置请求头
    let btnExport = createBigButton('脚本设置', uiArea, 2)
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
            <div>设置的目的是尽量模拟客户端调用，避免被风控系统检测到。(提示操作频繁/网络拥挤)</div>
            <div>为避免被风控，请不要在设置请求头时用新网页版听歌，可能会被判定为“使用非法挂机软件”。</div>
            <div>设置请求头后，清除请求头或关闭卸载脚本时请自行清空网易云网页版cookie。以免被之后使用网页版时，被判断为“使用非法挂机软件”。</div>`,
            confirmButtonText: '设置',
            preConfirm: () => {
                const container = Swal.getHtmlContainer()
                return {
                    cookie: container.querySelector('#text-cookie').value.trim(),
                    userAgent: container.querySelector('#text-userAgent').value.trim(),
                }
            },
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

        const excludeCookie = ['MUSIC_U']
        let appendCookieText = ''
        GM_cookie.list({}, function (cookies, error) {
            if (!error) {
                const webCoookieObject = {}
                cookies.forEach(item => {
                    webCoookieObject[item.name] = item
                })
                for (const key in cookieObject) {
                    if (key in webCoookieObject) {
                        //网页端客户端都有该cookie
                        GM_cookie.set({
                            name: key,
                            value: cookieObject[key],
                            domain: webCoookieObject[key].domain,
                            path: webCoookieObject[key].path,
                            secure: webCoookieObject[key].secure,
                            httpOnly: webCoookieObject[key].httpOnly,
                            expirationDate: webCoookieObject[key].expirationDate,
                        })
                    }
                    else if (!excludeCookie.includes(key)) {
                        appendCookieText += `${key}=${cookieObject[key]};`
                    }
                }
                GM_cookie.set({
                    name: 'MUSIC_U',
                    value: cookieObject.MUSIC_U,
                    domain: '.music.163.com',
                    path: '/',
                    httpOnly: true,
                    expirationDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 400)
                })
                GM_setValue('requestHeader', JSON.stringify({
                    originalCookie: config.cookie,
                    appendCookie: appendCookieText,
                    userAgent: config.userAgent,
                }))
                showConfirmBox('设置完成，刷新网页生效。')
            } else {
                console.error(error);
            }
        });
    }
    function removeHeader() {
        const requestHeader = JSON.parse(GM_getValue('requestHeader', '{}'))
        if (!requestHeader.appendCookie) {
            showTips('并没有设置请求头', 2)
            return
        }

        GM_setValue('requestHeader', '{}')

        showConfirmBox('请求头设置已清除，需手动清空网易云网页版cookie，以免以后被判断为“使用非法挂机软件”。')
    }
    function parseCookie(cookieString) {
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
    function tryParseJSON(jsonString) {
        try {
            var o = JSON.parse(jsonString)
            if (o && typeof o === "object") {
                return o
            }
        }
        catch (e) { }
        return false;
    }


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