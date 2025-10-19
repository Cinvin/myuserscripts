import { weapi } from "./crypto";
var CookieMap = {
    web: true,
    android: 'os=android;appver=9.1.78;channel=netease;osver=14;buildver=241009150147;',
    pc: 'os=pc;appver=3.0.18.203152;channel=netease;osver=Microsoft-Windows-10-Professional-build-19045-64bit;',
}
var UserAgentMap = {
    web: undefined,
    android: 'NeteaseMusic/9.1.78.241009150147(9001078);Dalvik/2.1.0 (Linux; U; Android 14; V2318A Build/TP1A.220624.014)',
    pc: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.0.18.203152',
}

const requestQueue = []
// 定时器，每200毫秒执行一次，从队列中取出一个请求执行
const REQUEST_INTERVAL = 50; // 每200毫秒执行一个请求
setInterval(() => {
    if (requestQueue.length > 0) {
        const requestFn = requestQueue.shift();
        requestFn();
    }
}, REQUEST_INTERVAL);

setDeviceId()

export const weapiRequest = (url, config) => {
    let data = config.data || {}
    let clientType = config.clientType || 'pc'
    let csrfToken = document.cookie.match(/_csrf=([^(;|$)]+)/)
    data.csrf_token = csrfToken ? csrfToken[1] : ''
    const encRes = weapi(data)
    let headers = {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": UserAgentMap[clientType],
    }
    if (config.ip) {
        headers["X-Real-IP"] = config.ip
        headers["X-Forwarded-For"] = config.ip
    }
    const details = {
        url: url.replace("api", "weapi") + `?csrf_token=${data.csrf_token}`,
        method: "POST",
        responseType: "json",
        headers: headers,
        cookie: CookieMap[clientType],
        data: `params=${encodeURIComponent(encRes.params)}&encSecKey=${encodeURIComponent(encRes.encSecKey)}`,
        onload: res => { config.onload(res.response) },
        onerror: config.onerror,
    }
    enqueueAPIRequest(details)
}
export function weapiRequestSync(url, config) {
    return new Promise((resolve, reject) => {
        weapiRequest(url, {
            ...config,
            onload: resolve,
            onerror: reject
        });
    });
}
function enqueueAPIRequest(data) {
    return new Promise((resolve, reject) => {
        // 把一个函数推入队列，这个函数负责执行 API 请求并传递结果
        requestQueue.push(() => {
            callAPI(data)
        });
    });
}
function callAPI(data) {
    GM_xmlhttpRequest(data)
}
function setDeviceId() {
    const requestHeader = JSON.parse(GM_getValue('requestHeader', '{}'))
    if ('appendCookie' in requestHeader) {
        CookieMap['pc'] = requestHeader.appendCookie
        UserAgentMap['pc'] = requestHeader.userAgent
    }
    else {
        GM_cookie.list({ name: 'sDeviceId' }, function (cookies, error) {
            if (!error) {
                if (cookies.length > 0) {
                    CookieMap['android'] += `deviceId=${cookies[0].value};`
                    CookieMap['pc'] += `deviceId=${cookies[0].value};`
                }
            } else {
                console.error(error);
            }
        });
    }
}