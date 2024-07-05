const appendCookie = 'os=android;appver=9.1.10'
const getcookie = (key) => {
    var cookies = document.cookie,
        text = "\\b" + key + "=",
        find = cookies.search(text);
    if (find < 0) {
        return ""
    }
    find += text.length - 2;
    var index = cookies.indexOf(";", find);
    if (index < 0) {
        index = cookies.length
    }
    return cookies.substring(find, index) || ""
};
export const weapiRequest = (url, config) => {
    let data = config.data || {}
    data.csrf_token = getcookie("__csrf");
    const encRes = unsafeWindow.asrsea(
        JSON.stringify(data),
        "010001",
        "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7",
        "0CoJUm6Qyw8W8jud");
    const details = {
        url: url.replace("api", "weapi") + `?csrf_token=${data.csrf_token}`,
        method: "POST",
        responseType: "json",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
        },
        cookie: config.cookie || appendCookie,
        data: `params=${encodeURIComponent(encRes.encText)}&encSecKey=${encodeURIComponent(encRes.encSecKey)}`,
        onload: res => { config.onload(res.response) },
        onerror: config.onerror,
    }
    GM_xmlhttpRequest(details)
}