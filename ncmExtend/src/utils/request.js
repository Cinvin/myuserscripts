import { weapi } from "./crypto";
const appendCookie = 'os=android;appver=9.1.10'

export const weapiRequest = (url, config) => {
    let data = config.data || {}
    let csrfToken = document.cookie.match(/_csrf=([^(;|$)]+)/)
    data.csrf_token = csrfToken ? csrfToken[1] : ''
    const encRes = weapi(data)
    let headers = { "content-type": "application/x-www-form-urlencoded" }
    if(config.ip){
        headers["X-Real-IP"]=config.ip
        headers["X-Forwarded-For"]=config.ip
    }
    const details = {
        url: url.replace("api", "weapi") + `?csrf_token=${data.csrf_token}`,
        method: "POST",
        responseType: "json",
        headers: headers,
        cookie: config.cookie || appendCookie,
        data: `params=${encodeURIComponent(encRes.params)}&encSecKey=${encodeURIComponent(encRes.encSecKey)}`,
        onload: res => { config.onload(res.response) },
        onerror: config.onerror,
    }
    GM_xmlhttpRequest(details)
}