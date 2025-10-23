import { createBigButton, showTips, showConfirmBox } from "../utils/common"

export const scriptSettings = (uiArea) => {
    //设置请求头
    let btnExport = createBigButton('脚本设置', uiArea, 2)
    btnExport.addEventListener('click', openSettingPopup)

    function openSettingPopup() {
        Swal.fire({
            title: '脚本设置',
            showConfirmButton: false,
            html: `<div><button type="button" class="swal2-styled" id="btn-download-settings">下载设置</button></div>
            <div><button type="button" class="swal2-styled" id="btn-header-settings">设置请求头</button></div>`,
            confirmButtonText: '设置',
            didOpen: () => {
                let container = Swal.getHtmlContainer()
                let btnDownloadSettings = container.querySelector('#btn-download-settings')
                let btnHeaderSettings = container.querySelector('#btn-header-settings')

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
            title: '下载设置',
            showCloseButton: true,
            html: `<div>
<label>是否添加元数据<select id="meta-select" class="swal2-select"><option value="notAppend" selected="">不添加</option><option value="skipCloud">云盘歌曲不添加</option><option value="allAppend">全部添加</option></select></label>
</div>`,
            confirmButtonText: '确定',
            preConfirm: () => {
                const container = Swal.getHtmlContainer()

                return {
                    appendMeta: container.querySelector('#meta-select').value.trim(),
                }
            },
            didOpen: () => {
                let container = Swal.getHtmlContainer()
                let metaInput = container.querySelector('#meta-select')
                const downloadSettings = JSON.parse(GM_getValue('downloadSettings', '{"appendMeta":"notAppend"}'))
                if (downloadSettings.appendMeta) {
                    metaInput.value = downloadSettings.appendMeta
                }
            }
        })
            .then((result) => {
                if (result.isConfirmed) {
                    console.log(result.value)
                    GM_setValue('downloadSettings', JSON.stringify(result.value))
                }
            })
    }

    function openHeaderSettingPopup() {
        Swal.fire({
            title: '设置客户端请求头（Header）',
            showCloseButton: true,
            html: `<div><label>Cookie<input class="swal2-input" id="text-cookie"></label></div>
            <div><label>UserAgent<input class="swal2-input" id="text-userAgent"></label></div>`,
            footer: '<div>以上内容需要自行使用<a target="_blank" target="_blank" href="https://reqable.com/zh-CN/">Reqable</a>等抓包工具，获取网易云音乐客户端的请求头。</div><div>设置的目的是尽量模拟客户端调用，避免被风控系统检测到。(提示操作频繁/网络拥挤)</div>',
            confirmButtonText: '设置',
            preConfirm: () => {
                const container = Swal.getHtmlContainer()
                return {
                    cookie: container.querySelector('#text-cookie').value.trim(),
                    userAgent: container.querySelector('#text-userAgent').value.trim(),
                }
            },
            didOpen: () => {
                let container = Swal.getHtmlContainer()
                let cookieInput = container.querySelector('#text-cookie')
                let userAgentInput = container.querySelector('#text-userAgent')
                const requestHeader = JSON.parse(GM_getValue('requestHeader', '{}'))
                if (requestHeader.originalCookie) {
                    cookieInput.value = requestHeader.originalCookie
                }
                if (requestHeader.userAgent) {
                    userAgentInput.value = requestHeader.userAgent
                }
            },
        })
            .then((result) => {
                if (result.isConfirmed) {
                    setHeader(result.value)
                }
            })
    }
    function setHeader(config) {
        const cookieObject = tryParseJSON(config.cookie) || parseCookie(config.cookie)
        if (config.userAgent.length == 0) {
            showConfirmBox('请填写UserAgent')
            return
        }
        if (Object.keys(cookieObject).length == 0) {
            showConfirmBox('cookie格式不正确，支持标准的cookie格式和JSON格式')
            return
        }
        if (!(cookieObject.MUSIC_U && cookieObject.deviceId)) {
            showConfirmBox('cookie内容不完整，cookie中一定会有MUSIC_U、deviceId等字段')
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