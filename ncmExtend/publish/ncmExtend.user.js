// ==UserScript==
// @name         网易云音乐:歌曲下载&转存云盘|云盘快传|云盘匹配纠正|高音质试听
// @namespace    https://github.com/Cinvin/myuserscripts
// @version      4.4.1
// @author       cinvin
// @description  歌曲下载&转存云盘(可批量)、无需文件云盘快传歌曲、云盘匹配纠正、高音质试听、完整歌单列表、评论区显示IP属地、使用指定的IP地址发送评论、歌单歌曲排序(时间、红心数、评论数)、云盘音质提升、本地文件添加音乐元数据等功能。
// @license      MIT
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALiSURBVHgBpVZLThtBEH3d40WkIGWWSSDSGMw6cAP7BBlOgDkB5gSYE2BOgDlBnBNgToCzDmQmii0iZYEXsRRBPJ1X6R4+Mz3IKLVxT1f1q9/rais8IQmiCLjZNlBNA8O1iqzGpAoqNcAnjfmgjh9pFYbyA7+ODIJjAjSxmPTp6MDnSJfBV3YzBOfPABdp88zpBd7ERcWjDC7xdp9bXfyXZHtruOqVHNjITW8RCGZ3xOSHClnITwaF6KFeQ7XqGA/tGrbmBO9W4E0tIFL33W9g0gmQpWuY9A30XvEAsT4mCMM7B3MEXf6EZUN8ZvM2BVAY47bPyK6QuvNLLCcGWdcTFPVLnX8OJHrWadsHXsOsKeuvWD6lza7ThHWkzEqJw4gRvodXzK5kodn92KNNa5hz/0Uo7BBGicOMtc0b2MA4ZnZ17h34HUgWL9uakX3wKIfCaVe6yDqcNWv4NUrINIkswfKGGK5j3K1yItkp1vEahfpr3GwCwZTRJ25rRxoqNbdlUS2gNspwe02Qdh2TEymj5+6MNDzNreMnDwfNe4ezwQXexS4bksLE0geOC9qhJxkR/ASeMmlUS1ilCIBXdmWm1m5pg/0Y+mzFQVrclIhY11H+zWbFDXwfkDlHjHrAHA7svMKGzWheFcxUmpwWdwWwxhqLgds6FEAyp7OK8Rbwm/3R+3BZBjCjP6hFRRxO4G96DnVWVMi9kBpzmbND6JpII8meYwbAZqu20/WFcQqmXcZRA2Vv5e01SmKH1hesdDXMPjzCQDiPZlvuviRFvdwTbdmAYfm4PpTxKzwXQ2EJ7UbusWE/sq1VTFr5ZfT4d5khH3bBOfzMqXxMeC/a/Dn0nEt5pnXnwBl3nLFXJEsZF7IWmnIdVwQEya6Bq4E7dy9P1XtRoeO9dUzKD04uLpM7Cj5DOGGznTzyXEo3mTOnJ29AxdWvkr59Nx6Di6inTrnmxzJx3a11WT382zIjW6bTKoy/H+Iy6oHlZ+kAAAAASUVORK5CYII=
// @match        https://music.163.com/*
// @require      https://fastly.jsdelivr.net/npm/sweetalert2@11.26.3/dist/sweetalert2.all.min.js
// @require      https://fastly.jsdelivr.net/npm/ajax-hook@3.0.3/dist/ajaxhook.min.js
// @require      https://fastly.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js
// @require      https://fastly.jsdelivr.net/npm/node-forge@1.3.1/dist/forge.min.js
// @require      https://fastly.jsdelivr.net/npm/mp3tag.js@3.14.1/dist/mp3tag.min.js
// @resource     fa  https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css
// @connect      45.127.129.8
// @connect      126.net
// @grant        GM_addStyle
// @grant        GM_cookie
// @grant        GM_download
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const levelOptions = { jymaster: "超清母带", dolby: "杜比全景声", sky: "沉浸环绕声", jyeffect: "高清臻音", hires: "高解析度无损", lossless: "无损", exhigh: "极高", higher: "较高", standard: "标准" };
  const levelWeight = { jymaster: 9, dolby: 8, sky: 7, jyeffect: 6, hires: 5, lossless: 4, exhigh: 3, higher: 2, standard: 1, none: 0 };
  const defaultOfDEFAULT_LEVEL = "jymaster";
  const defaultOfBatchFilter = {
    free: true,
vip: true,
pay: true,
lowfree: true,
instrumental: true,
live: true,
cloud: false
};
  const getBatchFilter = () => {
    return Object.assign(defaultOfBatchFilter, JSON.parse(GM_getValue("batchFilter", "{}")));
  };
  const setBatchFilter = (value) => {
    GM_setValue("batchFilter", JSON.stringify(Object.assign(defaultOfBatchFilter, value)));
  };
  const defaultOfDownloadSettings = {
    appendMeta: "notAppend",
out: "artist-title",
folder: "none"
};
  const getDownloadSettings = () => {
    return Object.assign(defaultOfDownloadSettings, JSON.parse(GM_getValue("downloadSettings", "{}")));
  };
  const setDownloadSettings = (value) => {
    GM_setValue("downloadSettings", JSON.stringify(Object.assign(defaultOfDownloadSettings, value)));
  };
  const defaultOfBatchDownloadSettings = {
    concurrent: 4,
level: "jymaster",
dllrc: false,
levelonly: false
};
  const getBatchDownloadSettings = () => {
    return Object.assign(defaultOfBatchDownloadSettings, JSON.parse(GM_getValue("batchDownloadSettings", "{}")));
  };
  const setBatchDownloadSettings = (value) => {
    GM_setValue("batchDownloadSettings", JSON.stringify(Object.assign(defaultOfBatchDownloadSettings, value)));
  };
  const defaultOfBatchTransUploadSettings = {
    level: "jymaster",
levelonly: false
};
  const getBatchTransUploadSettings = () => {
    return Object.assign(defaultOfBatchTransUploadSettings, JSON.parse(GM_getValue("batchTransUploadSettings", "{}")));
  };
  const setBatchTransUploadSettings = (value) => {
    GM_setValue("batchTransUploadSettings", JSON.stringify(Object.assign(defaultOfBatchTransUploadSettings, value)));
  };
  const uploadChunkSize = 8 * 1024 * 1024;
  const songMark = { explicit: 1048576 };
  const liveRegex = /(?:\(|（)[^）\)]*\blive\b[^\)]*(?:\)|）)$/;
  const iv = "0102030405060708";
  const presetKey = "0CoJUm6Qyw8W8jud";
  const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`;
  const aesEncrypt = (text, key, iv2) => {
    const cipher = forge.cipher.createCipher("AES-CBC", key);
    cipher.start({ iv: iv2 });
    cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(text)));
    cipher.finish();
    const encrypted = cipher.output;
    return forge.util.encode64(encrypted.getBytes());
  };
  const rsaEncrypt = (str, key) => {
    const forgePublicKey = forge.pki.publicKeyFromPem(key);
    const encrypted = forgePublicKey.encrypt(str, "NONE");
    return forge.util.bytesToHex(encrypted);
  };
  const weapi = (object) => {
    const text = JSON.stringify(object);
    let secretKey = "";
    for (let i = 0; i < 16; i++) {
      secretKey += base62.charAt(Math.round(Math.random() * 61));
    }
    return {
      params: aesEncrypt(
        aesEncrypt(text, presetKey, iv),
        secretKey,
        iv
      ),
      encSecKey: rsaEncrypt(secretKey.split("").reverse().join(""), publicKey)
    };
  };
  const getMD5 = (text) => {
    const md = forge.md.md5.create();
    md.update(text);
    return md.digest().toHex();
  };
  const sleep = (millisec) => {
    return new Promise((resolve) => setTimeout(resolve, millisec));
  };
  const showConfirmBox = (msg) => {
    Swal.fire({
      title: "提示",
      text: msg,
      confirmButtonText: "确定"
    });
  };
  const showTips = (tip, type = 1) => {
    if (Swal.isVisible()) {
      unsafeWindow.g_showTipCard({
        tip,
        type,
        parent: Swal.getContainer()
      });
    } else {
      unsafeWindow.top.g_showTipCard({
        tip,
        type
      });
    }
  };
  const saveContentAsFile = (content, fileName) => {
    const data = new Blob([content], {
      type: "type/plain"
    });
    const fileurl = URL.createObjectURL(data);
    GM_download({
      url: fileurl,
      name: fileName,
      onload: function() {
        URL.revokeObjectURL(data);
      },
      onerror: function(e2) {
        console.error(e2);
        showTips(`下载失败,请尝试将 .${fileName.split(".").pop()} 格式加入 文件扩展名白名单`, 2);
      }
    });
  };
  const createBigButton = (desc, parent, appendWay) => {
    const btn = document.createElement("a");
    btn.className = "u-btn2 u-btn2-1";
    const btnDesc = document.createElement("i");
    btnDesc.innerHTML = desc;
    btn.appendChild(btnDesc);
    btn.style.margin = "5px";
    if (appendWay === 1) {
      parent.appendChild(btn);
    } else {
      parent.insertBefore(btn, parent.lastChild);
    }
    return btn;
  };
  const createPageJumpInput = (currentPage, maxPage) => {
    const jumpToPageInput = document.createElement("input");
    jumpToPageInput.setAttribute("type", "number");
    jumpToPageInput.setAttribute("min", 1);
    jumpToPageInput.setAttribute("max", maxPage);
    jumpToPageInput.value = currentPage;
    jumpToPageInput.style.width = "50px";
    jumpToPageInput.style.margin = ".3125em";
    jumpToPageInput.style.padding = ".625em 1.1em";
    jumpToPageInput.placeholder = "跳转到页码";
    return jumpToPageInput;
  };
  const downloadFileSync = (url2, fileName) => {
    return new Promise((resolve, reject) => {
      GM_download({
        url: url2,
        name: fileName,
        onload: () => resolve(`下载 ${fileName} 完成`),
        onerror: (error) => reject(`下载 ${fileName} 失败`)
      });
    });
  };
  const songItemAddToFormat = (song) => {
    return {
      album: song.al,
      alias: song.alia || song.ala || [],
      artists: song.ar || [],
      commentThreadId: "R_SO_4_" + song.id,
      copyrightId: song.cp || 0,
      duration: song.dt || 0,
      id: song.id,
      mvid: song.mv || 0,
      name: song.name || "",
      cd: song.cd,
      position: song.no || 0,
      ringtone: song.rt,
      rtUrl: song.rtUrl,
      status: song.st || 0,
      pstatus: song.pst || 0,
      fee: song.fee || 0,
      version: song.v || 0,
      eq: song.eq,
      songType: song.t || 0,
      mst: song.mst,
      score: song.pop || 0,
      ftype: song.ftype,
      rtUrls: song.rtUrls,
      transNames: song.tns,
      privilege: song.privilege,
      lyrics: song.lyrics,
      alg: song.alg,
      source: null
    };
  };
  const sanitizeFilename = (filename) => {
    if (!filename) return "downloaded_file";
    let sanitized = filename.replace(/\//g, "／");
    const illegalRe = /[<>:"\\|?*\x00-\x1F]/g;
    sanitized = sanitized.replace(illegalRe, " ");
    sanitized = sanitized.trim().replace(/[\s.]+$/, "");
    const reservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    if (reservedRe.test(sanitized)) {
      sanitized = "_" + sanitized;
    }
    return sanitized || "downloaded_file";
  };
  const scriptSettings = (uiArea) => {
    const btnExport = createBigButton("脚本设置", uiArea, 2);
    btnExport.addEventListener("click", openSettingPopup);
    function openSettingPopup() {
      Swal.fire({
        title: "脚本设置",
        showConfirmButton: false,
        html: `<div><button type="button" class="swal2-styled" id="btn-playlevel-settings">音质播放设置</button></div>
            <div><button type="button" class="swal2-styled" id="btn-download-settings">通用下载设置</button></div>
            <div><button type="button" class="swal2-styled" id="btn-header-settings">设置请求头</button></div>`,
        confirmButtonText: "设置",
        didOpen: () => {
          let container = Swal.getHtmlContainer();
          let btnPlayLevelSettings = container.querySelector("#btn-playlevel-settings");
          let btnDownloadSettings = container.querySelector("#btn-download-settings");
          let btnHeaderSettings = container.querySelector("#btn-header-settings");
          btnPlayLevelSettings.addEventListener("click", () => {
            setPlayLevel();
          });
          btnDownloadSettings.addEventListener("click", () => {
            openDownloadSettingPopup();
          });
          btnHeaderSettings.addEventListener("click", () => {
            openHeaderSettingPopup();
          });
        }
      });
    }
    function openDownloadSettingPopup() {
      Swal.fire({
        title: "通用下载设置",
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
        confirmButtonText: "确定",
        footer: "<div>建立文件夹功能篡改猴下载模式设置为浏览器API可以生效，其他脚本管理器可能导致文件名乱码的问题。</div>",
        preConfirm: () => {
          const container = Swal.getHtmlContainer();
          return {
            appendMeta: container.querySelector("#dl-appendMeta").value.trim(),
            out: container.querySelector("#dl-out").value.trim(),
            folder: container.querySelector("#dl-folder").value.trim()
          };
        },
        didOpen: () => {
          const container = Swal.getHtmlContainer();
          const downloadSettings = getDownloadSettings();
          const metaInput = container.querySelector("#dl-appendMeta");
          metaInput.value = downloadSettings.appendMeta;
          const outinput = container.querySelector("#dl-out");
          outinput.value = downloadSettings.out;
          const folderInput = container.querySelector("#dl-folder");
          folderInput.value = downloadSettings.folder;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          setDownloadSettings(result.value);
        }
      });
    }
    function openHeaderSettingPopup() {
      Swal.fire({
        title: "设置客户端请求头（Header）",
        showCloseButton: true,
        html: `<div><label>Cookie<input class="swal2-input" id="text-cookie"></label></div>
            <div><label>UserAgent<input class="swal2-input" id="text-userAgent"></label></div>`,
        footer: `<div>以上内容需要自行使用<a target="_blank" target="_blank" href="https://reqable.com/zh-CN/">Reqable</a>等抓包工具，获取网易云音乐客户端的请求头。</div>
            <div>设置的目的是尽量模拟客户端调用，避免被风控系统检测到。(提示操作频繁/网络拥挤)</div>`,
        confirmButtonText: "设置",
        didOpen: () => {
          const container = Swal.getHtmlContainer();
          const actions = Swal.getActions();
          actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-cancel-set" style="display: inline-block;">清除设置</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-set" style="display: inline-block;">设置</button>`;
          const cookieInput = container.querySelector("#text-cookie");
          const userAgentInput = container.querySelector("#text-userAgent");
          const requestHeader = JSON.parse(GM_getValue("requestHeader", "{}"));
          if (requestHeader.originalCookie) {
            cookieInput.value = requestHeader.originalCookie;
          }
          if (requestHeader.userAgent) {
            userAgentInput.value = requestHeader.userAgent;
          }
          const btnCancelSet = actions.querySelector("#btn-cancel-set");
          const btnSet = actions.querySelector("#btn-set");
          btnCancelSet.addEventListener("click", () => {
            removeHeader();
          });
          btnSet.addEventListener("click", () => {
            setHeader({
              cookie: cookieInput.value.trim(),
              userAgent: userAgentInput.value.trim()
            });
          });
        }
      });
    }
    function setHeader(config) {
      const cookieObject = tryParseJSON(config.cookie) || parseCookie(config.cookie);
      if (config.userAgent.length == 0) {
        showTips("请填写UserAgent", 2);
        return;
      }
      if (Object.keys(cookieObject).length == 0) {
        showTips("cookie格式不正确，支持标准的cookie格式和JSON格式", 2);
        return;
      }
      if (!(cookieObject.MUSIC_U && cookieObject.deviceId)) {
        showTips("cookie内容不完整，cookie中一定会有MUSIC_U、deviceId等字段", 2);
        return;
      }
      let cookieString = "";
      for (const key in cookieObject) {
        cookieString += `${key}=${cookieObject[key]}; `;
      }
      GM_setValue("requestHeader", JSON.stringify({
        originalCookie: config.cookie,
coverCookie: cookieString,
        userAgent: config.userAgent
      }));
      showConfirmBox("设置完成，刷新网页生效。");
    }
    function removeHeader() {
      const requestHeader = JSON.parse(GM_getValue("requestHeader", "{}"));
      if (!requestHeader.originalCookie) {
        showTips("并没有设置请求头", 2);
        return;
      }
      GM_setValue("requestHeader", "{}");
      let msg = "请求头设置已清除。";
      if (requestHeader.appendCookie) {
        msg += "需手动清空网易云网页版cookie，以免以后被判断为“使用非法挂机软件”。";
      }
      showConfirmBox(msg);
    }
  };
  const parseCookie = (cookieString) => {
    return cookieString.split(";").map((part) => part.trim()).filter((part) => part).reduce((cookies, part) => {
      const [key, value] = part.split("=", 2);
      cookies[key.trim()] = value ? value.trim() : "";
      return cookies;
    }, {});
  };
  const tryParseJSON = (jsonString) => {
    try {
      const o = JSON.parse(jsonString);
      if (o && typeof o === "object") {
        return o;
      }
    } catch (e2) {
    }
    return false;
  };
  const setPlayLevel = () => {
    Swal.fire({
      title: "音质播放设置",
      input: "select",
      inputOptions: levelOptions,
      inputValue: GM_getValue("DEFAULT_LEVEL", defaultOfDEFAULT_LEVEL),
      confirmButtonText: "确定",
      showCloseButton: true,
      footer: '<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>'
    }).then((result) => {
      if (result.isConfirmed) {
        GM_setValue("DEFAULT_LEVEL", result.value);
      }
    });
  };
  const WarningOldHeaderSetting = () => {
    if (isOldSettedHeader) {
      Swal.fire({
        text: "脚本请求头设置已更新为更安全的方式，请前往个人主页清除请求头设置以及清除music.163.com的cookie，然后重新登录。以免使用网页版听歌被判断为“使用非法挂机软件”。目前“请求头设置”没有太大作用，貌似不设置也能流畅上传云盘。",
        icon: "warning",
        confirmButtonText: "确定"
      });
    }
  };
  const CookieMap = {
    web: "",
    android: "os=android;appver=9.1.78;channel=netease;osver=14;buildver=241009150147;",
    pc: "os=pc;appver=3.1.22.204707;channel=netease;osver=Microsoft-Windows-10-Professional-build-19045-64bit;"
  };
  const UserAgentMap = {
    web: void 0,
    android: "NeteaseMusic/9.1.78.241009150147(9001078);Dalvik/2.1.0 (Linux; U; Android 14; V2318A Build/TP1A.220624.014)",
    pc: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.22.204707"
  };
  let isSettedHeader = false;
  let isOldSettedHeader = false;
  const requestQueue = [];
  const REQUEST_INTERVAL = 50;
  setInterval(() => {
    if (requestQueue.length > 0) {
      const requestFn = requestQueue.shift();
      requestFn();
    }
  }, REQUEST_INTERVAL);
  setDeviceId();
  const weapiRequest = (url2, config) => {
    const data = config.data || {};
    const clientType = config.clientType || "pc";
    const csrfToken = document.cookie.match(/_csrf=([^(;|$)]+)/);
    data.csrf_token = csrfToken ? csrfToken[1] : "";
    const encRes = weapi(data);
    const headers = {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": UserAgentMap[clientType],
      "cookie": CookieMap[clientType]
    };
    if (config.ip) {
      headers["X-Real-IP"] = config.ip;
      headers["X-Forwarded-For"] = config.ip;
    }
    const details = {
      url: url2.replace("api", "weapi") + `?csrf_token=${data.csrf_token}`,
      method: "POST",
      responseType: "json",
      headers,
      cookie: CookieMap[clientType],
      anonymous: isSettedHeader,
      data: `params=${encodeURIComponent(encRes.params)}&encSecKey=${encodeURIComponent(encRes.encSecKey)}`,
      onload: (res) => {
        config.onload(res.response);
      },
      onerror: config.onerror
    };
    enqueueAPIRequest(details);
  };
  function weapiRequestSync(url2, config) {
    return new Promise((resolve, reject) => {
      weapiRequest(url2, {
        ...config,
        onload: resolve,
        onerror: reject
      });
    });
  }
  function enqueueAPIRequest(data) {
    return new Promise((resolve, reject) => {
      requestQueue.push(() => {
        callAPI(data);
      });
    });
  }
  function callAPI(data) {
    GM_xmlhttpRequest(data);
  }
  function setDeviceId() {
    const requestHeader = JSON.parse(GM_getValue("requestHeader", "{}"));
    if (!requestHeader.coverCookie && requestHeader.originalCookie) {
      const cookieObject = tryParseJSON(requestHeader.originalCookie) || parseCookie(requestHeader.originalCookie);
      let cookieString = "";
      for (const key in cookieObject) {
        cookieString += `${key}=${cookieObject[key]}; `;
      }
      requestHeader.coverCookie = cookieString;
      GM_setValue("requestHeader", JSON.stringify(requestHeader));
    }
    if (requestHeader.appendCookie) {
      isOldSettedHeader = true;
    }
    if (requestHeader.coverCookie) {
      isSettedHeader = true;
      CookieMap["pc"] = requestHeader.coverCookie;
      UserAgentMap["pc"] = requestHeader.userAgent;
    } else if (GM_info.scriptHandler !== "Violentmonkey") {
      GM_cookie.list({ name: "sDeviceId" }, function(cookies, error) {
        if (!error) {
          if (cookies.length > 0) {
            CookieMap["android"] += `deviceId=${cookies[0].value};`;
            CookieMap["pc"] += `deviceId=${cookies[0].value};`;
          }
        } else {
          console.error(error);
        }
      });
    }
  }
  const fileSizeDesc = (fileSize) => {
    if (fileSize < 1024) {
      return fileSize + "B";
    } else if (fileSize >= 1024 && fileSize < Math.pow(1024, 2)) {
      return (fileSize / 1024).toFixed(1).toString() + "K";
    } else if (fileSize >= Math.pow(1024, 2) && fileSize < Math.pow(1024, 3)) {
      return (fileSize / Math.pow(1024, 2)).toFixed(1).toString() + "M";
    } else if (fileSize > Math.pow(1024, 3) && fileSize < Math.pow(1024, 4)) {
      return (fileSize / Math.pow(1024, 3)).toFixed(2).toString() + "G";
    } else if (fileSize > Math.pow(1024, 4)) {
      return (fileSize / Math.pow(1024, 4)).toFixed(2).toString() + "T";
    }
  };
  const duringTimeDesc = (dt) => {
    const secondTotal = Math.floor(dt / 1e3);
    const min = Math.floor(secondTotal / 60);
    const sec = secondTotal % 60;
    return min.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");
  };
  const dateDesc = (timestamp) => {
    if (!timestamp) return "";
    try {
      const d = new Date(timestamp);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e2) {
      return "";
    }
  };
  const levelDesc = (level) => {
    return levelOptions[level] || level;
  };
  const getArtistTextInSongDetail = (song) => {
    let artist = "";
    if (song.ar && song.ar[0].name && song.ar[0].name.length > 0) {
      artist = song.ar.map((ar) => ar.name).join();
    } else if (song.pc && song.pc.ar && song.pc.ar.length > 0) {
      artist = song.pc.ar;
    }
    return artist;
  };
  const getAlbumTextInSongDetail = (song) => {
    let album = "";
    if (song.al && song.al.name && song.al.name.length > 0) {
      album = song.al.name;
    } else if (song.pc && song.pc.alb && song.pc.alb.length > 0) {
      album = song.pc.alb;
    }
    return album;
  };
  const nameFileWithoutExt = (title, artist, out) => {
    if (out === "title" || !artist || artist.length === 0) {
      return title;
    }
    if (out === "artist-title") {
      return `${artist} - ${title}`;
    }
    if (out === "title-artist") {
      return `${title} - ${artist}`;
    }
  };
  const escapeHTML = (string) => string.replace(
    /[&<>'"]/g,
    (word) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[word] || word
  );
  const storageCommentInfo = (CommentRes) => {
    var _a, _b, _c;
    if (!unsafeWindow.top.GUserScriptObjects.storageCommentInfos) unsafeWindow.top.GUserScriptObjects.storageCommentInfos = {};
    const comments = CommentRes.data.comments.concat(CommentRes.data.hotComments);
    for (let comment of comments) {
      if (!(comment == null ? void 0 : comment.commentId)) continue;
      let appendText = "";
      if ((_a = comment == null ? void 0 : comment.ipLocation) == null ? void 0 : _a.location) appendText += comment.ipLocation.location + " ";
      if ((_c = (_b = comment == null ? void 0 : comment.extInfo) == null ? void 0 : _b.endpoint) == null ? void 0 : _c.OS_TYPE) appendText += comment.extInfo.endpoint.OS_TYPE;
      unsafeWindow.top.GUserScriptObjects.storageCommentInfos[String(comment.commentId)] = appendText.trim();
    }
  };
  const observerCommentBox = (commentBox) => {
    let observer = new MutationObserver((mutations, observer2) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (let node of mutation.addedNodes) {
            if (node.className === "itm") {
              commentItemAddInfo(node);
            }
          }
        }
      });
    });
    observer.observe(commentBox, {
      childList: true,
      subtree: true
    });
  };
  const commentItemAddInfo = (commentItem) => {
    if (commentItem.querySelector(".ipInfo")) return;
    const commentId = commentItem.getAttribute("data-id");
    let timeArea = commentItem.querySelector("div.time");
    if (unsafeWindow.top.GUserScriptObjects.storageCommentInfos[commentId]) {
      timeArea.innerHTML += ` <span class="ipInfo">${unsafeWindow.top.GUserScriptObjects.storageCommentInfos[commentId]}</span>`;
    }
  };
  const InfoFirstPage = (commentBox) => {
    const commentItems = commentBox.querySelectorAll("div.itm");
    for (const commentItem of commentItems) {
      commentItemAddInfo(commentItem);
    }
  };
  const addCommentWithCumstomIP = (commentBox) => {
    const commentTextarea = commentBox.querySelector("textarea");
    const threadId = commentBox.getAttribute("data-tid");
    const btnsArea = commentBox.querySelector(".btns");
    let ipBtn = document.createElement("a");
    ipBtn.className = "s-fc7";
    ipBtn.innerHTML = "使用指定IP地址评论";
    ipBtn.addEventListener("click", () => {
      const content = commentTextarea.value.trim();
      if (content.length === 0) {
        showConfirmBox("评论内容不能为空");
        return;
      }
      GM_getValue("lastIPValue", "");
      Swal.fire({
        input: "text",
        inputLabel: "IP地址",
        inputValue: GM_getValue("lastIPValue", ""),
        inputValidator: (value) => {
          if (!/((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/.test(value)) {
            return "IP格式不正确";
          }
        },
        confirmButtonText: "发送评论",
        showCloseButton: true,
        footer: `
            <div>可参考:<a href="https://zh-hans.ipshu.com/country-list" target="_blank">IP 国家/地区列表</a></div>
            <div>需不显示属地请填 <b>127.0.0.1</b></div>
            `
      }).then((result) => {
        if (result.isConfirmed) {
          GM_setValue("lastIPValue", result.value);
          weapiRequest("/api/resource/comments/add", {
            data: {
              threadId,
              content
            },
            ip: result.value,
            clientType: "web",
            onload: (res) => {
              console.log(res);
              if (res.code === 200) {
                showConfirmBox("评论成功，请刷新网页查看");
              } else {
                showConfirmBox("评论失败，" + JSON.stringify(res));
              }
            }
          });
        }
      });
    });
    btnsArea.appendChild(ipBtn);
  };
  const hookTopWindow = () => {
    ah.proxy(
      {
        onResponse: (response, handler) => {
          if (response.config.url.includes("/weapi/song/enhance/player/url/v1")) {
            handlePlayResponse(response.response, false).then((res) => {
              response.response = res;
              handler.next(response);
            });
          } else {
            handler.next(response);
          }
        }
      },
      _unsafeWindow
    );
  };
  const hookContentFrame = () => {
    ah.proxy(
      {
        onResponse: (response, handler) => {
          if (response.config.url.includes("/weapi/song/enhance/player/url/v1")) {
            handlePlayResponse(response.response, false).then((res) => {
              response.response = res;
              handler.next(response);
            });
          } else if (response.config.url.includes("/weapi/comment/resource/comments/get")) {
            let content = JSON.parse(response.response);
            storageCommentInfo(content);
            handler.next(response);
          } else {
            handler.next(response);
          }
        }
      },
      _unsafeWindow
    );
  };
  const hookOtherWindow = () => {
    ah.proxy(
      {
        onResponse: (response, handler) => {
          if (response.config.url.includes("/weapi/song/enhance/player/url/v1")) {
            handlePlayResponse(response.response, false).then((res) => {
              response.response = res;
              handler.next(response);
            });
          } else {
            handler.next(response);
          }
        }
      },
      _unsafeWindow
    );
  };
  const hookWebPlayerFetch = () => {
    const origFetch = window.fetch;
    const myCustomFetch = async function(resource, options = {}) {
      const response = await origFetch(resource, options);
      const resClone = response.clone();
      const url2 = typeof resource === "string" ? resource : resource.url;
      if (url2.includes("/weapi/song/enhance/player/url/v1")) {
        const content = await resClone.text();
        const res = await handlePlayResponse(content, true);
        const newResponse = new Response(res, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        return newResponse;
      } else if (url2.includes("/weapi/aio/produce/material/group/get")) {
        const content = await resClone.text();
        let jsonContent = JSON.parse(content);
        if (jsonContent && jsonContent.data) {
          jsonContent.data.materialList = [];
        }
        const newResponse = new Response(JSON.stringify(jsonContent), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        return newResponse;
      } else {
        return response;
      }
    };
    _unsafeWindow.fetch = myCustomFetch;
  };
  const handlePlayResponse = async (response, isWebPlayer2) => {
    const content = JSON.parse(response);
    const songId = content.data[0].id;
    const targetLevel = _GM_getValue("DEFAULT_LEVEL", defaultOfDEFAULT_LEVEL);
    if (content.data[0].url) {
      if (["standard", "higher", "exhigh"].includes(content.data[0].level)) {
        if (levelWeight[targetLevel] > levelWeight[content.data[0].level]) {
          let apiData = {
            "/api/song/enhance/player/url/v1": JSON.stringify({
              ids: JSON.stringify([songId]),
              level: targetLevel,
              encodeType: "mp3"
            })
          };
          if (content.data[0].fee === 0) {
            apiData["/api/song/enhance/download/url/v1"] = JSON.stringify({
              id: songId,
              level: levelWeight[targetLevel] > levelWeight.hires ? "hires" : targetLevel,
              encodeType: "mp3"
            });
          }
          const BatchRes = await weapiRequestSync("/api/batch", { data: apiData });
          if (BatchRes) {
            let songLevel = BatchRes["/api/song/enhance/player/url/v1"].data[0].level;
            let selectedURL = "player";
            if (BatchRes["/api/song/enhance/download/url/v1"]) {
              let songDLLevel = BatchRes["/api/song/enhance/download/url/v1"].data.level;
              if (BatchRes["/api/song/enhance/download/url/v1"].data.url && levelWeight[songDLLevel] > levelWeight[songLevel]) {
                selectedURL = "download";
              }
            }
            if (selectedURL === "download") {
              content.data[0] = BatchRes["/api/song/enhance/download/url/v1"].data;
            } else {
              content.data[0] = BatchRes["/api/song/enhance/player/url/v1"].data[0];
            }
            if (!isWebPlayer2) showLevelTips(content.data[0].level);
          }
        }
      } else {
        if (!isWebPlayer2) showLevelTips(content.data[0].level);
      }
    }
    if (!isWebPlayer2 && content.data[0].type !== "mp3" && content.data[0].type !== "m4a") {
      content.data[0].type = "mp3";
    }
    return JSON.stringify(content);
  };
  const showLevelTips = (level) => {
    const desc = levelDesc(level);
    try {
      if (_unsafeWindow && _unsafeWindow.top && _unsafeWindow.top.player) {
        _unsafeWindow.top.player.tipPlay(desc);
        return;
      }
    } catch (e2) {
    }
  };
  const extractLrcRegex = /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm;
  const extractTimestampRegex = /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g;
  const combineLyric = (lyricOri, lyricAdd) => {
    const resLyric = {
      lyric: "",
      parsedLyric: lyricOri.parsedLyric.slice(0)
    };
    for (const parsedAddLyric of lyricAdd.parsedLyric) {
      resLyric.parsedLyric.splice(parsedLyricsBinarySearch(parsedAddLyric, resLyric.parsedLyric), 0, parsedAddLyric);
    }
    resLyric.lyric = resLyric.parsedLyric.map((lyric) => lyric.line).join("\n");
    return resLyric;
  };
  const parseLyric = (lrc) => {
    const parsedLyrics = [];
    for (const line of lrc.trim().matchAll(extractLrcRegex)) {
      const { lyricTimestamps, content } = line.groups;
      for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
        const { min, sec, ms } = timestamp.groups;
        const rawTime = timestamp[0];
        const time = Number(min) * 60 + Number(sec) + Number((ms ?? "000").padEnd(3, "0")) * 1e-3;
        const parsedLyric = { rawTime, time, content: trimLyricContent(content), line: line[0] };
        parsedLyrics.splice(parsedLyricsBinarySearch(parsedLyric, parsedLyrics), 0, parsedLyric);
      }
    }
    return parsedLyrics;
  };
  const parseNotLyricLines = (lrc) => {
    const notLyricLines = { before: "", after: "" };
    const lines = lrc.trim().split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(extractTimestampRegex)) {
        break;
      } else {
        notLyricLines.before += line + "\n";
      }
    }
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.match(extractTimestampRegex)) {
        break;
      } else {
        notLyricLines.after = line + "\n" + notLyricLines.after;
      }
    }
    notLyricLines.after = notLyricLines.after.trim();
    return notLyricLines;
  };
  const parsedLyricsBinarySearch = (lyric, lyrics) => {
    const time = lyric.time;
    let low = 0;
    let high = lyrics.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midTime = lyrics[mid].time;
      if (midTime === time) {
        return mid;
      } else if (midTime < time) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return low;
  };
  const trimLyricContent = (content) => {
    const t = content.trim();
    return t.length < 1 ? content : t;
  };
  const handleLyric = (lyricRes) => {
    var _a, _b, _c;
    if (lyricRes.pureMusic || lyricRes.needDesc) return {
      orilrc: {
        lyric: "",
        parsedLyric: []
      }
    };
    const lrc = ((_a = lyricRes == null ? void 0 : lyricRes.lrc) == null ? void 0 : _a.lyric) || "";
    const rlrc = ((_b = lyricRes == null ? void 0 : lyricRes.romalrc) == null ? void 0 : _b.lyric) || "";
    const tlrc = ((_c = lyricRes == null ? void 0 : lyricRes.tlyric) == null ? void 0 : _c.lyric) || "";
    const LyricObj = {
      orilrc: {
        lyric: lrc,
        parsedLyric: parseLyric(lrc)
      },
      romalrc: {
        lyric: rlrc,
        parsedLyric: parseLyric(rlrc)
      },
      tlyriclrc: {
        lyric: tlrc,
        parsedLyric: parseLyric(tlrc)
      }
    };
    const notLyricLines = parseNotLyricLines(lrc);
    if (LyricObj.orilrc.parsedLyric.length > 0 && LyricObj.tlyriclrc.parsedLyric.length > 0) {
      LyricObj.oritlrc = combineLyric(LyricObj.tlyriclrc, LyricObj.orilrc);
      LyricObj.oritlrc.lyric = notLyricLines.before + LyricObj.oritlrc.lyric + notLyricLines.after;
    }
    if (LyricObj.orilrc.parsedLyric.length > 0 && LyricObj.romalrc.parsedLyric.length > 0) {
      LyricObj.oriromalrc = combineLyric(LyricObj.orilrc, LyricObj.romalrc);
      LyricObj.oriromalrc.lyric = notLyricLines.before + LyricObj.oriromalrc.lyric + notLyricLines.after;
    }
    return LyricObj;
  };
  class BrowserBuffer {
    constructor(uint8) {
      if (!(uint8 instanceof Uint8Array)) {
        throw new Error("BrowserBuffer expects Uint8Array");
      }
      this._u8 = uint8;
    }
static from(input, enc) {
      if (typeof input === "string") {
        if (!enc || enc === "utf8" || enc === "utf-8") {
          const encoder = new TextEncoder();
          return new BrowserBuffer(encoder.encode(input));
        }
        if (enc === "ascii") {
          const arr = new Uint8Array(input.length);
          for (let i = 0; i < input.length; i++) arr[i] = input.charCodeAt(i) & 127;
          return new BrowserBuffer(arr);
        }
      }
      if (input instanceof ArrayBuffer) return new BrowserBuffer(new Uint8Array(input));
      if (input instanceof Uint8Array) return new BrowserBuffer(input);
      if (input instanceof BrowserBuffer) return input;
      throw new Error("BrowserBuffer.from: unsupported input");
    }
    static alloc(len) {
      return new BrowserBuffer(new Uint8Array(len));
    }
    static concat(list) {
      const u8s = list.map((item) => {
        if (item instanceof BrowserBuffer) return item._u8;
        if (item instanceof Uint8Array) return item;
        if (item instanceof ArrayBuffer) return new Uint8Array(item);
        throw new Error("BrowserBuffer.concat: unsupported element type");
      });
      const total = u8s.reduce((s, a) => s + a.length, 0);
      const out = new Uint8Array(total);
      let pos = 0;
      for (const a of u8s) {
        out.set(a, pos);
        pos += a.length;
      }
      return new BrowserBuffer(out);
    }
    static isBuffer(x) {
      return x instanceof BrowserBuffer;
    }
get length() {
      return this._u8.length;
    }
    get buffer() {
      return this._u8.buffer;
    }
    slice(start = 0, end = void 0) {
      const sub = this._u8.subarray(start, end);
      return new BrowserBuffer(sub);
    }
    toString(enc = "utf8") {
      if (enc === "utf8" || enc === "utf-8") {
        const dec2 = new TextDecoder("utf-8");
        return dec2.decode(this._u8);
      }
      if (enc === "ascii") {
        let s = "";
        for (let i = 0; i < this._u8.length; i++) s += String.fromCharCode(this._u8[i] & 127);
        return s;
      }
      const dec = new TextDecoder("utf-8");
      return dec.decode(this._u8);
    }
readUInt8(offset) {
      return this._u8[offset];
    }
    readUInt16BE(offset) {
      return this._u8[offset] << 8 | this._u8[offset + 1];
    }
    readUInt16LE(offset) {
      return this._u8[offset] | this._u8[offset + 1] << 8;
    }
    readUInt32BE(offset) {
      return this._u8[offset] * 16777216 + (this._u8[offset + 1] << 16 | this._u8[offset + 2] << 8 | this._u8[offset + 3]);
    }
    readUInt32LE(offset) {
      return this._u8[offset] | this._u8[offset + 1] << 8 | this._u8[offset + 2] << 16 | this._u8[offset + 3] << 24 >>> 0;
    }
readUIntBE(offset, byteLength) {
      let val = 0;
      for (let i = 0; i < byteLength; i++) {
        val = (val << 8) + this._u8[offset + i];
      }
      return val >>> 0;
    }
writeUIntBE(value, offset, byteLength) {
      for (let i = byteLength - 1; i >= 0; i--) {
        this._u8[offset + i] = value & 255;
        value = value >>> 8;
      }
    }
    writeUInt32BE(value, offset) {
      this._u8[offset] = value >>> 24 & 255;
      this._u8[offset + 1] = value >>> 16 & 255;
      this._u8[offset + 2] = value >>> 8 & 255;
      this._u8[offset + 3] = value & 255;
    }
    writeUInt8(value, offset) {
      this._u8[offset] = value & 255;
    }
toUint8Array() {
      return this._u8;
    }
  }
  function fileTypeFromBuffer(buf) {
    const u8 = buf instanceof Uint8Array ? buf : buf instanceof ArrayBuffer ? new Uint8Array(buf) : null;
    if (!u8) return { mime: "application/octet-stream", ext: "" };
    if (u8.length >= 4 && u8[0] === 137 && u8[1] === 80 && u8[2] === 78 && u8[3] === 71) {
      return { mime: "image/png", ext: "png" };
    }
    if (u8.length >= 3 && u8[0] === 255 && u8[1] === 216 && u8[u8.length - 2] === 255 && u8[u8.length - 1] === 217) {
      return { mime: "image/jpeg", ext: "jpg" };
    }
    return { mime: "application/octet-stream", ext: "" };
  }
  function imageSizeFromBuffer(arrayBufferOrU8) {
    const localU8 = arrayBufferOrU8 instanceof Uint8Array ? arrayBufferOrU8 : new Uint8Array(arrayBufferOrU8);
    return new Promise((resolve, reject) => {
      const blob = new Blob([localU8]);
      const url2 = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function() {
        const w = img.width;
        const h = img.height;
        URL.revokeObjectURL(url2);
        resolve({ width: w, height: h, type: "image" });
      };
      img.onerror = function(e2) {
        URL.revokeObjectURL(url2);
        reject(new Error("imageSizeFromBuffer: failed to decode image"));
      };
      img.src = url2;
    });
  }
  function formatVorbisComment(vendorString, tagsArray) {
    const encoder = new TextEncoder();
    const vendorBytes = encoder.encode(vendorString || "");
    const tagBytesList = (tagsArray || []).map((t) => encoder.encode(t));
    let totalLen = 4 + vendorBytes.length + 4;
    for (const tb of tagBytesList) totalLen += 4 + tb.length;
    const out = new Uint8Array(totalLen);
    const view = new DataView(out.buffer);
    let offset = 0;
    view.setUint32(offset, vendorBytes.length, true);
    offset += 4;
    out.set(vendorBytes, offset);
    offset += vendorBytes.length;
    view.setUint32(offset, tagBytesList.length, true);
    offset += 4;
    for (const tb of tagBytesList) {
      view.setUint32(offset, tb.length, true);
      offset += 4;
      out.set(tb, offset);
      offset += tb.length;
    }
    return new BrowserBuffer(out);
  }
  const STREAMINFO = 0;
  const PADDING = 1;
  const APPLICATION = 2;
  const SEEKTABLE = 3;
  const VORBIS_COMMENT = 4;
  const CUESHEET = 5;
  const PICTURE = 6;
  class MetaFlac {
    constructor(flac) {
      if (!(flac instanceof ArrayBuffer) && !(flac instanceof Uint8Array) && !(flac instanceof BrowserBuffer)) {
        throw new Error("MetaFlac(flac) flac must be ArrayBuffer/Uint8Array/BrowserBuffer in browser build.");
      }
      if (flac instanceof BrowserBuffer) {
        this.buffer = flac;
      } else if (flac instanceof Uint8Array) {
        this.buffer = new BrowserBuffer(flac);
      } else {
        this.buffer = new BrowserBuffer(new Uint8Array(flac));
      }
      this.flac = this.buffer;
      this.marker = "";
      this.streamInfo = null;
      this.blocks = [];
      this.padding = null;
      this.vorbisComment = null;
      this.vendorString = "";
      this.tags = [];
      this.pictures = [];
      this.picturesSpecs = [];
      this.picturesDatas = [];
      this.framesOffset = 0;
      this.init();
    }
    init() {
      let offset = 0;
      const markerBuf = this.buffer.slice(0, offset += 4);
      const marker = markerBuf.toString("ascii");
      if (marker !== "fLaC") {
        throw new Error("The file does not appear to be a FLAC file.");
      }
      let blockType = 0;
      let isLastBlock = false;
      while (!isLastBlock) {
        blockType = this.buffer.readUInt8(offset++);
        isLastBlock = blockType > 128;
        blockType = blockType % 128;
        const blockLength = this.buffer.readUIntBE(offset, 3);
        offset += 3;
        if (blockType === STREAMINFO) {
          this.streamInfo = this.buffer.slice(offset, offset + blockLength);
        }
        if (blockType === PADDING) {
          this.padding = this.buffer.slice(offset, offset + blockLength);
        }
        if (blockType === VORBIS_COMMENT) {
          this.vorbisComment = this.buffer.slice(offset, offset + blockLength);
          this.parseVorbisComment();
        }
        if (blockType === PICTURE) {
          this.pictures.push(this.buffer.slice(offset, offset + blockLength));
          this.parsePictureBlock();
        }
        if ([APPLICATION, SEEKTABLE, CUESHEET].includes(blockType)) {
          this.blocks.push([blockType, this.buffer.slice(offset, offset + blockLength)]);
        }
        offset += blockLength;
      }
      this.framesOffset = offset;
    }
    parseVorbisComment() {
      const vc = this.vorbisComment;
      const vendorLength = vc.readUInt32LE(0);
      this.vendorString = vc.slice(4, vendorLength + 4).toString("utf8");
      vc.readUInt32LE(4 + vendorLength);
      const userCommentListBuffer = vc.slice(4 + vendorLength + 4);
      for (let off = 0; off < userCommentListBuffer.length; ) {
        const length = userCommentListBuffer.readUInt32LE(off);
        off += 4;
        const comment = userCommentListBuffer.slice(off, off + length).toString("utf8");
        off += length;
        this.tags.push(comment);
      }
    }
    parsePictureBlock() {
      this.pictures.forEach((picture) => {
        let offset = 0;
        const type = picture.readUInt32BE(offset);
        offset += 4;
        const mimeTypeLength = picture.readUInt32BE(offset);
        offset += 4;
        const mime = picture.slice(offset, offset + mimeTypeLength).toString("ascii");
        offset += mimeTypeLength;
        const descriptionLength = picture.readUInt32BE(offset);
        offset += 4;
        const description = picture.slice(offset, offset + descriptionLength).toString("utf8");
        offset += descriptionLength;
        const width = picture.readUInt32BE(offset);
        offset += 4;
        const height = picture.readUInt32BE(offset);
        offset += 4;
        const depth = picture.readUInt32BE(offset);
        offset += 4;
        const colors = picture.readUInt32BE(offset);
        offset += 4;
        const pictureDataLength = picture.readUInt32BE(offset);
        offset += 4;
        this.picturesDatas.push(picture.slice(offset, offset + pictureDataLength).toUint8Array());
        this.picturesSpecs.push(this.buildSpecification({
          type,
          mime,
          description,
          width,
          height,
          depth,
          colors
        }));
      });
    }
    getPicturesSpecs() {
      return this.picturesSpecs;
    }
    getMd5sum() {
      return this.streamInfo.slice(18, 34).toString("hex");
    }
    getMinBlocksize() {
      return this.streamInfo.readUInt16BE(0);
    }
    getMaxBlocksize() {
      return this.streamInfo.readUInt16BE(2);
    }
    getMinFramesize() {
      return this.streamInfo.readUIntBE(4, 3);
    }
    getMaxFramesize() {
      return this.streamInfo.readUIntBE(7, 3);
    }
    getSampleRate() {
      return this.streamInfo.readUIntBE(10, 3) >> 4;
    }
    getChannels() {
      return this.streamInfo.readUIntBE(10, 3) & 15 >> 1;
    }
    getBps() {
      return this.streamInfo.readUIntBE(12, 2) & 496 >> 4;
    }
    getTotalSamples() {
      return this.streamInfo.readUIntBE(13, 5) & 68719476735;
    }
    getVendorTag() {
      return this.vendorString;
    }
    getTag(name) {
      return this.tags.filter((item) => {
        const itemName = item.split("=")[0];
        return itemName === name;
      }).join("\n");
    }
    removeTag(name) {
      this.tags = this.tags.filter((item) => item.split("=")[0] !== name);
    }
    removeFirstTag(name) {
      const found = this.tags.findIndex((item) => item.split("=")[0] === name);
      if (found !== -1) this.tags.splice(found, 1);
    }
    removeAllTags() {
      this.tags = [];
    }
    removeAllPictures() {
      this.pictures = [];
      this.picturesSpecs = [];
      this.picturesDatas = [];
    }
    setTag(field) {
      if (field.indexOf("=") === -1) {
        throw new Error(`malformed vorbis comment field "${field}", field contains no '=' character`);
      }
      this.tags.push(field);
    }
setTagFromFile(field) {
      throw new Error('setTagFromFile is not supported in browser build. Use setTag("NAME=VALUE") directly or fetch file yourself.');
    }
    importTagsFrom(filename) {
      throw new Error("importTagsFrom(filename) is not supported in browser build. Provide tags array or fetch file yourself and call setTag for each line.");
    }
    exportTagsTo(filename) {
      throw new Error("exportTagsTo is not supported in browser build.");
    }
importPictureFrom(filename) {
      throw new Error("importPictureFrom(filename) is not supported in browser build. Use importPictureFromBuffer(buffer).");
    }
    importPictureFromBuffer(picture) {
      const arr = picture instanceof BrowserBuffer ? picture.toUint8Array() : picture instanceof Uint8Array ? picture : new Uint8Array(picture);
      const { mime } = fileTypeFromBuffer(arr);
      const finalMime = mime === "image/png" ? "image/png" : "image/jpeg";
      const self = this;
      return imageSizeFromBuffer(arr).then((dim) => {
        const spec = self.buildSpecification({
          mime: finalMime,
          width: dim.width || 500,
          height: dim.height || 500,
          depth: 24,
          colors: 0,
          description: ""
        });
        const picBlock = self.buildPictureBlock(arr, spec);
        self.pictures.push(picBlock);
        self.picturesSpecs.push(spec);
        return true;
      });
    }
    exportPictureTo(filename) {
      throw new Error("exportPictureTo is not supported in browser build. Use getPicturesSpecs()/picturesDatas and then create Blob.");
    }
    getAllTags() {
      return this.tags;
    }
    buildSpecification(spec = {}) {
      const defaults = {
        type: 3,
        mime: "image/jpeg",
        description: "",
        width: 0,
        height: 0,
        depth: 24,
        colors: 0
      };
      return Object.assign(defaults, spec);
    }
    buildPictureBlock(picture, specification = {}) {
      const pictureU8 = picture instanceof Uint8Array ? picture : new Uint8Array(picture);
      const pictureType = BrowserBuffer.alloc(4);
      const mime = BrowserBuffer.from(specification.mime || "image/jpeg", "ascii");
      const mimeLength = BrowserBuffer.alloc(4);
      const description = BrowserBuffer.from(specification.description || "", "utf8");
      const descriptionLength = BrowserBuffer.alloc(4);
      const width = BrowserBuffer.alloc(4);
      const height = BrowserBuffer.alloc(4);
      const depth = BrowserBuffer.alloc(4);
      const colors = BrowserBuffer.alloc(4);
      const pictureLength = BrowserBuffer.alloc(4);
      pictureType.writeUInt32BE(specification.type || 3, 0);
      mimeLength.writeUInt32BE((specification.mime || "image/jpeg").length, 0);
      descriptionLength.writeUInt32BE((specification.description || "").length, 0);
      width.writeUInt32BE(specification.width || 0, 0);
      height.writeUInt32BE(specification.height || 0, 0);
      depth.writeUInt32BE(specification.depth || 24, 0);
      colors.writeUInt32BE(specification.colors || 0, 0);
      pictureLength.writeUInt32BE(pictureU8.length, 0);
      return BrowserBuffer.concat([
        pictureType,
        mimeLength,
        mime,
        descriptionLength,
        description,
        width,
        height,
        depth,
        colors,
        pictureLength,
        new BrowserBuffer(pictureU8)
      ]);
    }
    buildMetadataBlock(type, block, isLast = false) {
      const header = BrowserBuffer.alloc(4);
      let t = type;
      if (isLast) t += 128;
      header.writeUIntBE(t, 0, 1);
      header.writeUIntBE(block.length, 1, 3);
      return BrowserBuffer.concat([header, block]);
    }
    buildMetadata() {
      const bufferArray = [];
      bufferArray.push(this.buildMetadataBlock(STREAMINFO, this.streamInfo));
      this.blocks.forEach((block) => bufferArray.push(this.buildMetadataBlock(...block)));
      bufferArray.push(this.buildMetadataBlock(VORBIS_COMMENT, formatVorbisComment(this.vendorString, this.tags)));
      this.pictures.forEach((block) => bufferArray.push(this.buildMetadataBlock(PICTURE, block)));
      bufferArray.push(this.buildMetadataBlock(PADDING, this.padding, true));
      return bufferArray;
    }
    buildStream() {
      const metadata = this.buildMetadata();
      const resultList = [this.buffer.slice(0, 4), ...metadata, this.buffer.slice(this.framesOffset)];
      return resultList;
    }
    save() {
      const built = this.buildStream();
      const bb = BrowserBuffer.concat(built);
      return bb.toUint8Array();
    }
  }
  const detectAudioFormat = (arrayBuffer) => {
    if (!arrayBuffer) return "unknown";
    const bytes = new Uint8Array(arrayBuffer);
    if (bytes.length < 4) return "unknown";
    if (bytes[0] === 102 && bytes[1] === 76 && bytes[2] === 97 && bytes[3] === 67) {
      return "flac";
    }
    let scanStart = 0;
    if (bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51) {
      if (bytes.length >= 10) {
        const size = (bytes[6] & 127) << 21 | (bytes[7] & 127) << 14 | (bytes[8] & 127) << 7 | bytes[9] & 127;
        scanStart = 10 + size;
        if (scanStart >= bytes.length) return "unknown";
      } else {
        return "unknown";
      }
    }
    const MAX_SCAN = Math.min(bytes.length - 1, scanStart + 65536);
    for (let i = scanStart; i < MAX_SCAN; i++) {
      if (bytes[i] === 255 && (bytes[i + 1] & 224) === 224) {
        return "mp3";
      }
    }
    return "unknown";
  };
  const downloadCleanupManager = {
MAX_PENDING_ITEMS: 16,
pendingCleanup: [],
addPendingCleanup: function(songItem, blobUrl) {
      this.pendingCleanup.push({ songItem, blobUrl });
      while (this.pendingCleanup.length > this.MAX_PENDING_ITEMS) {
        const oldest = this.pendingCleanup.shift();
        this.cleanupItem(oldest);
      }
    },
cleanupItem: function(item) {
      if (!item) return;
      if (item.blobUrl) {
        try {
          URL.revokeObjectURL(item.blobUrl);
        } catch (e2) {
        }
      }
      if (item.songItem && item.songItem.download) {
        item.songItem.download.musicFile = null;
        item.songItem.download.coverData = null;
        item.songItem.download.lyricText = null;
      }
      if (item.songItem) {
        item.songItem.albumDetail = null;
      }
    },
cleanupAll: function() {
    }
  };
  const batchDownloadSongs = (songList, config) => {
    if (songList.length === 0) {
      showConfirmBox("没有可下载的歌曲");
      return;
    }
    Swal.fire({
      title: "批量下载",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCloseButton: false,
      showConfirmButton: false,
      width: "980px",
      html: `<style>
table {
width: 100%;
border-spacing: 0px;
border-collapse: collapse;
border: 2px solid #f0f0f0;
}
table th, table td {
text-align: left;
text-overflow: ellipsis;
}
table tbody {
display: block;
width: 100%;
max-height: 400px;
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
box-sizing: border-box;
table-layout: fixed;
display: table;
width: 100%;
}
table tbody tr td{
border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 26%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 22%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 22%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 10%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 10%;
}
tr th:nth-child(6),tr td:nth-child(6){
width: 10%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>歌曲标题</th><th>歌手</th><th>专辑</th><th>音质</th><th>大小</th><th>进度</th> </tr></thead><tbody></tbody></table>
`,
      footer: "<div></div>",
      didOpen: () => {
        let container = Swal.getHtmlContainer();
        let tbodyDOM = container.querySelector("tbody");
        let threadList = [];
        for (let i = 0; i < config.threadCount; i++) {
          let trDOM = document.createElement("tr");
          tbodyDOM.appendChild(trDOM);
          threadList.push({ tableRowDOM: trDOM, working: true });
        }
        config.finnshCount = 0;
        config.errorSongs = [];
        config.skipSongs = [];
        config.taskCount = songList.length;
        config.threadList = threadList;
        config.albumDetailCache = new Map();
        for (let i = 0; i < config.threadCount; i++) {
          downloadSongSub(i, songList, config);
        }
      }
    });
  };
  const downloadSongSub = (threadIndex, songList, config) => {
    let song = songList.shift();
    let tableRowDOM = config.threadList[threadIndex].tableRowDOM;
    if (song === void 0) {
      config.threadList[threadIndex].working = false;
      let allFinnsh = true;
      for (let i = 0; i < config.threadCount; i++) {
        if (config.threadList[i].working) {
          allFinnsh = false;
          break;
        }
      }
      if (allFinnsh) {
        downloadCleanupManager.cleanupAll();
        if (config.albumDetailCache) {
          config.albumDetailCache.clear();
        }
        let finnshText = "下载完成";
        if (config.skipSongs.length > 0) {
          finnshText += `
有${config.skipSongs.length}首歌曲不是目标音质，未进行下载。`;
        }
        if (config.errorSongs.length > 0) {
          finnshText += `
以下${config.errorSongs.length}首歌曲下载失败: ${config.errorSongs.map((song2) => `<a href="https://music.163.com/#/song?id=${song2.id}">${song2.title}</a>`).join()}`;
        }
        Swal.update({
          allowOutsideClick: true,
          allowEscapeKey: true,
          showCloseButton: true,
          showConfirmButton: true,
          html: finnshText
        });
      }
      return;
    }
    tableRowDOM.innerHTML = `<td>${song.title}</td><td>${song.artist}</td><td>${song.album}</td><td class='my-level'></td><td class='my-size'></td><td class='my-pr'></td>`;
    let levelText = tableRowDOM.querySelector(".my-level");
    let sizeText = tableRowDOM.querySelector(".my-size");
    let prText = tableRowDOM.querySelector(".my-pr");
    if (!song.api) {
      song.api = song.privilege.fee === 0 && (levelWeight[song.privilege.plLevel] || 99) < (levelWeight[song.privilege.dlLevel] || -1) ? { url: "/api/song/enhance/download/url/v1", data: { id: song.id, level: config.level, encodeType: "mp3" } } : { url: "/api/song/enhance/player/url/v1", data: { ids: JSON.stringify([song.id]), level: config.level, encodeType: "mp3" } };
    }
    try {
      weapiRequest(song.api.url, {
        data: song.api.data,
        onload: (content) => {
          let resData = content.data[0] || content.data;
          if (resData.url !== null) {
            if (config.targetLevelOnly && config.level !== resData.level) {
              prText.innerHTML = `跳过下载`;
              config.skipSongs.push(song);
              downloadSongSub(threadIndex, songList, config);
              return;
            }
            let folder = "";
            if (config.folder !== "none" && song.artist.length > 0) {
              folder = sanitizeFilename(song.artist) + "/";
            }
            if (config.folder === "artist-album" && song.album.length > 0) {
              folder += sanitizeFilename(song.album) + "/";
            }
            song.fileNameWithOutExt = folder + sanitizeFilename(nameFileWithoutExt(song.title, song.artist, config.out));
            song.fileFullName = song.fileNameWithOutExt + "." + resData.type.toLowerCase();
            song.dlUrl = resData.url;
            song.ext = resData.type.toLowerCase();
            levelText.innerHTML = levelDesc(resData.level);
            sizeText.innerHTML = fileSizeDesc(resData.size);
            song.download = {
              finnnsh: {
                music: false,
                lyric: false,
                cover: false
              },
              musicFile: null,
              lyricText: null,
              coverData: null,
              prText,
              appendMeta: config.appendMeta === "allAppend" || config.appendMeta === "skipCloud" && !song.privilege.cs
            };
            song.download.prText.innerHTML = "正在下载";
            downloadSongFile(song, threadIndex, songList, config);
            downloadSongCover(song, threadIndex, songList, config);
            downloadSongLyric(song, threadIndex, songList, config);
          } else {
            showTips(`${song.title}	无法下载`, 2);
            prText.innerHTML = `无法下载`;
            config.errorSongs.push(song);
            downloadSongSub(threadIndex, songList, config);
          }
        },
        onerror: (res) => {
          console.error(res);
          if (song.retry) {
            prText.innerHTML = `下载出错`;
            config.errorSongs.push(song);
          } else {
            prText.innerHTML = `下载出错	稍后重试`;
            song.retry = true;
            songList.push(song);
          }
          downloadSongSub(threadIndex, songList, config);
        }
      });
    } catch (e2) {
      console.error(e2);
      if (song.retry) {
        prText.innerHTML = `下载出错`;
        config.errorSongs.push(song);
      } else {
        prText.innerHTML = `下载出错	稍后重试`;
        song.retry = true;
        songList.push(song);
      }
      downloadSongSub(threadIndex, songList, config);
    }
  };
  const downloadSongFile = (songItem, threadIndex, songList, config) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: songItem.dlUrl,
      responseType: "arraybuffer",
      onload: function(response) {
        const uint8 = new Uint8Array(response.response);
        songItem.download.musicFile = uint8.buffer;
        songItem.fileFormat = detectAudioFormat(songItem.download.musicFile);
        if (songItem.fileFormat !== "unknown") {
          songItem.ext = songItem.fileFormat;
          songItem.fileFullName = `${songItem.fileNameWithOutExt}.${songItem.fileFormat}`;
        }
        songItem.download.finnnsh.music = true;
        comcombineFile(songItem, threadIndex, songList, config);
      },
      onprogress: function(progress) {
        songItem.download.prText.innerHTML = fileSizeDesc(progress.loaded);
      },
      onerror: function(error) {
        songItem.download.finnnsh.music = true;
        comcombineFile(songItem, threadIndex, songList, config);
      }
    });
  };
  const downloadSongCover = (songItem, threadIndex, songList, config) => {
    if (!songItem.download.appendMeta) {
      songItem.download.finnnsh.cover = true;
      comcombineFile(songItem, threadIndex, songList, config);
      return;
    }
    if (songItem.song.al.pic > 0) {
      GM_xmlhttpRequest({
        method: "GET",
        url: songItem.song.al.picUrl,
        responseType: "arraybuffer",
        onload: function(response) {
          const uint8 = new Uint8Array(response.response);
          songItem.download.coverData = uint8.buffer;
          songItem.download.finnnsh.cover = true;
          comcombineFile(songItem, threadIndex, songList, config);
        },
        onerror: function(error) {
          songItem.download.finnnsh.cover = true;
          comcombineFile(songItem, threadIndex, songList, config);
        }
      });
    } else {
      songItem.download.finnnsh.cover = true;
      comcombineFile(songItem, threadIndex, songList, config);
    }
  };
  const downloadSongLyric = (songItem, threadIndex, songList, config) => {
    if (!songItem.download.appendMeta && !config.downloadLyric) {
      songItem.download.finnnsh.lyric = true;
      comcombineFile(songItem, threadIndex, songList, config);
      return;
    }
    const requestData = {
      "/api/song/lyric/v1": JSON.stringify({ id: songItem.id, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0 })
    };
    if (songItem.song.al.id > 0) {
      if (config.albumDetailCache[songItem.song.al.id]) {
        songItem.albumDetail = config.albumDetailCache[songItem.song.al.id];
      } else {
        requestData[`/api/v1/album/${songItem.song.al.id}`] = "{}";
      }
    }
    weapiRequest("/api/batch", {
      data: requestData,
      onload: (content) => {
        console.log(content);
        const lyricContent = content["/api/song/lyric/v1"];
        songItem.download.finnnsh.lyric = true;
        if (lyricContent.pureMusic) comcombineFile(songItem, threadIndex, songList, config);
        const LyricObj = handleLyric(lyricContent);
        if (LyricObj.orilrc.parsedLyric.length === 0) comcombineFile(songItem, threadIndex, songList, config);
        const LyricItem = LyricObj.oritlrc || LyricObj.orilrc;
        songItem.download.lyricText = LyricItem.lyric;
        if (config.downloadLyric && LyricItem.lyric.length > 0) {
          saveContentAsFile(LyricItem.lyric, songItem.fileNameWithOutExt + ".lrc");
        }
        const albumContent = content[`/api/v1/album/${songItem.song.al.id}`];
        if (albumContent) {
          songItem.albumDetail = {
            publisher: albumContent.album.company.length > 0 ? albumContent.album.company : null,
            artists: albumContent.album.artists ? albumContent.album.artists.map((artist) => artist.name).join("; ") : null,
            publishTime: albumContent.album.publishTime > 0 ? dateDesc(albumContent.album.publishTime) : null
          };
          config.albumDetailCache[songItem.song.al.id] = songItem.albumDetail;
        }
        comcombineFile(songItem, threadIndex, songList, config);
      }
    });
  };
  const comcombineFile = async (songItem, threadIndex, songList, config) => {
    if (songItem.download.finnnsh.music && songItem.download.finnnsh.cover && songItem.download.finnnsh.lyric) {
      if (songItem.download.musicFile) {
        if (songItem.download.appendMeta && songItem.fileFormat !== "unknown") {
          if (songItem.song.ar && songItem.song.ar[0].name && songItem.song.ar[0].name.length > 0) {
            songItem.artist = songItem.song.ar.map((ar) => ar.name).join("; ");
          }
          if (songItem.fileFormat === "mp3") {
            const mp3tag = new MP3Tag(songItem.download.musicFile);
            mp3tag.read();
            mp3tag.tags.title = songItem.title;
            mp3tag.tags.artist = songItem.artist;
            if (songItem.album.length > 0) mp3tag.tags.album = songItem.album;
            if (songItem.song.no && songItem.song.no > 0) mp3tag.tags.v2.TRCK = String(songItem.song.no).padStart(2, "0");
            if (songItem.song.cd && songItem.song.cd.length > 0) mp3tag.tags.v2.TPOS = songItem.song.cd;
            if (songItem.albumDetail) {
              if (songItem.albumDetail.publisher) {
                mp3tag.tags.v2.TPUB = songItem.albumDetail.publisher;
              }
              if (songItem.albumDetail.artists) {
                mp3tag.tags.v2.TPE2 = songItem.albumDetail.artists;
              }
              if (songItem.albumDetail.publishTime) {
                mp3tag.tags.v2.TDRC = songItem.albumDetail.publishTime;
              }
            }
            if (songItem.download.coverData) {
              mp3tag.tags.v2.APIC = [{
                description: "",
                data: songItem.download.coverData,
                type: 3,
                format: "image/jpeg"
              }];
            }
            if (songItem.download.lyricText.length > 0) {
              mp3tag.tags.v2.TXXX = [{
                description: "LYRICS",
                text: songItem.download.lyricText
              }];
            }
            mp3tag.save();
            if (mp3tag.error) {
              console.error("mp3tag.error", mp3tag.error);
            }
            const blob = new Blob([mp3tag.buffer], { type: "audio/mp3" });
            const url2 = URL.createObjectURL(blob);
            GM_download({
              url: url2,
              name: songItem.fileFullName,
              onload: function() {
                config.finnshCount += 1;
                Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`;
                songItem.download.prText.innerHTML = `完成`;
                downloadCleanupManager.addPendingCleanup(songItem, url2);
                downloadSongSub(threadIndex, songList, config);
              },
              onerror: function() {
                songItem.download.prText.innerHTML = `下载失败`;
                downloadCleanupManager.addPendingCleanup(songItem, url2);
                downloadSongSub(threadIndex, songList, config);
              }
            });
          } else if (songItem.fileFormat === "flac") {
            const flac = new MetaFlac(songItem.download.musicFile);
            flac.removeAllTags();
            flac.removeAllPictures();
            flac.setTag(`TITLE=${songItem.title}`);
            flac.setTag(`ARTIST=${songItem.artist}`);
            if (songItem.album.length > 0) flac.setTag(`ALBUM=${songItem.album}`);
            if (songItem.song.no && songItem.song.no > 0) flac.setTag(`TRACKNUMBER=${String(songItem.song.no).padStart(2, "0")}`);
            if (songItem.song.cd && songItem.song.cd.length > 0) flac.setTag(`DISCNUMBER=${songItem.song.cd}`);
            if (songItem.albumDetail) {
              if (songItem.albumDetail.publisher) {
                flac.setTag(`PUBLISHER=${songItem.albumDetail.publisher}`);
              }
              if (songItem.albumDetail.artists) {
                flac.setTag(`ALBUMARTIST=${songItem.albumDetail.artists}`);
              }
              if (songItem.albumDetail.publishTime) {
                flac.setTag(`DATE=${songItem.albumDetail.publishTime}`);
              }
            }
            if (songItem.download.lyricText.length > 0) flac.setTag(`LYRICS=${songItem.download.lyricText}`);
            if (songItem.download.coverData) await flac.importPictureFromBuffer(songItem.download.coverData, "image/jpeg");
            const newBuffer = flac.save();
            const blob = new Blob([newBuffer], { type: "audio/flac" });
            const url2 = URL.createObjectURL(blob);
            GM_download({
              url: url2,
              name: songItem.fileFullName,
              onload: function() {
                config.finnshCount += 1;
                Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`;
                songItem.download.prText.innerHTML = `完成`;
                downloadCleanupManager.addPendingCleanup(songItem, url2);
                downloadSongSub(threadIndex, songList, config);
              },
              onerror: function() {
                songItem.download.prText.innerHTML = `下载失败`;
                downloadCleanupManager.addPendingCleanup(songItem, url2);
                downloadSongSub(threadIndex, songList, config);
              }
            });
          }
        } else {
          const blob = new Blob([songItem.download.musicFile], { type: `audio/${songItem.ext}` });
          const url2 = URL.createObjectURL(blob);
          GM_download({
            url: url2,
            name: songItem.fileFullName,
            onload: function() {
              config.finnshCount += 1;
              Swal.getFooter().innerHTML = `已完成: ${config.finnshCount} 总共: ${config.taskCount}`;
              songItem.download.prText.innerHTML = `完成`;
              downloadCleanupManager.addPendingCleanup(songItem, url2);
              downloadSongSub(threadIndex, songList, config);
            },
            onerror: function() {
              songItem.download.prText.innerHTML = `下载失败`;
              downloadCleanupManager.addPendingCleanup(songItem, url2);
              downloadSongSub(threadIndex, songList, config);
            }
          });
        }
      } else {
        songItem.download.prText.innerHTML = `下载失败`;
        downloadSongSub(threadIndex, songList, config);
      }
    }
  };
  const PAGE_SIZE = 50;
  const showBatchManager = (fullSongList = [], defaultConfig = {}) => {
    const songPlayableList = fullSongList.filter((item) => item.privilege.plLevel !== "none");
    if (!songPlayableList || songPlayableList.length === 0) {
      showTips("没有可操作的歌曲", 2);
      return;
    }
    let _savedBatchDl = {};
    let _savedBatchUp = {};
    let _savedDl = {};
    try {
      _savedBatchDl = getBatchDownloadSettings() || {};
    } catch (e2) {
      console.warn("getBatchDownloadSettings error", e2);
    }
    try {
      _savedBatchUp = getBatchTransUploadSettings() || {};
    } catch (e2) {
      console.warn("getBatchTransUploadSettings error", e2);
    }
    try {
      _savedDl = getDownloadSettings() || {};
    } catch (e2) {
      console.warn("getDownloadSettings error", e2);
    }
    let state = {
      songs: songPlayableList.map((s, idx) => {
        return Object.assign({ _index: idx, downloadStatus: "", uploadStatus: "", selected: false }, s);
      }),
      filterText: "",
      filterOptions: getBatchFilter(),
      page: 1,
      pageMax: Math.ceil(songPlayableList.length / PAGE_SIZE),
      view: "songs",
downloadConfig: Object.assign({
        threadCount: _savedBatchDl.concurrent !== void 0 ? _savedBatchDl.concurrent : 4,
        downloadLyric: !!_savedBatchDl.dllrc || false,
        folder: _savedDl.folder || "none",
        out: _savedDl.out || "artist-title",
        level: _savedBatchDl.level || "jymaster",
        targetLevelOnly: !!_savedBatchUp.levelonly || false,
        appendMeta: _savedDl.appendMeta || "notAppend"
}, defaultConfig),
      uploadConfig: Object.assign({
        level: _savedBatchUp.level || "jymaster",
        targetLevelOnly: !!_savedBatchUp.levelonly || false
}, defaultConfig)
    };
    Swal.fire({
      width: "980px",
      showConfirmButton: false,
      showCloseButton: true,
      html: `<div style="display:flex;gap:12px;">
    <div style="width:150px;border-right:1px solid #eee;padding-right:8px;box-sizing:border-box;">
      <ul id="bm-nav" style="list-style:none;padding:0;margin:0;">
        <li><button data-view="songs" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">歌曲列表</button></li>
        <li style="margin-top:6px;"><button data-view="filter" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">过滤条件</button></li>
        <li style="margin-top:6px;"><button data-view="dl" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">下载设置</button></li>
        <li style="margin-top:6px;"><button data-view="up" class="swal2-styled bm-nav-item" style="width:100%;text-align:left">转存设置</button></li>
      </ul>
      <div id="bm-nav-desc" style="margin-top:16px;color:#666;font-size:13px;">仅显示可操作的歌曲</div>
      ${defaultConfig.listType === "artist" ? '<div style="margin-top:16px;color:#666;font-size:13px;">对歌手歌曲进行了一定的去重。若一首歌的重复版本是云盘歌曲，其也视作云盘歌曲。</div>' : ""}
    </div>
    <div style="flex:1;padding-left:8px;box-sizing:border-box;">
      <div id="bm-toolbar" style="display:flex;gap:8px;margin-bottom:8px;">
        <button id="bm-select-page-all" type="button" class="swal2-styled">本页全选择</button>
        <button id="bm-clear-page-all" type="button" class="swal2-styled">本页全取消</button>
        <button id="bm-select-all" type="button" class="swal2-styled">全部选择</button>
        <button id="bm-clear-select" type="button" class="swal2-styled">全部取消</button>
        <button id="bm-download-all" type="button" class="swal2-styled">下载已选</button>
        <button id="bm-upload-all" type="button" class="swal2-styled">转存已选</button>
      </div>
      <div id="bm-main-content" style="height:520px;overflow:auto;border:1px solid #eee;padding:8px;"></div>
      <div id="bm-pager" style="margin-top:8px;text-align:center"></div>
    </div>
  </div>`,
      didOpen: () => {
        const container = Swal.getHtmlContainer();
        const btnSelectPageAll = container.querySelector("#bm-select-page-all");
        const btnClearPageAll = container.querySelector("#bm-clear-page-all");
        const btnSelectAll = container.querySelector("#bm-select-all");
        const btnClearSelect = container.querySelector("#bm-clear-select");
        const btnDownloadAll = container.querySelector("#bm-download-all");
        const btnUploadAll = container.querySelector("#bm-upload-all");
        const mainContent = container.querySelector("#bm-main-content");
        const pager = container.querySelector("#bm-pager");
        const nav = container.querySelector("#bm-nav");
        container.querySelector("#bm-nav-desc");
        const toolbar = container.querySelector("#bm-toolbar");
        nav.querySelectorAll(".bm-nav-item").forEach((btn) => {
          btn.addEventListener("click", (e2) => {
            const view = e2.currentTarget.getAttribute("data-view");
            state.view = view;
            renderView();
          });
        });
        btnSelectPageAll.addEventListener("click", () => {
          const filtered = filteredSongs();
          const begin = (state.page - 1) * PAGE_SIZE;
          for (let i = begin; i < begin + PAGE_SIZE && i < filtered.length; i++) {
            filtered[i].selected = true;
          }
          renderView();
        });
        btnClearPageAll.addEventListener("click", () => {
          const filtered = filteredSongs();
          const begin = (state.page - 1) * PAGE_SIZE;
          for (let i = begin; i < begin + PAGE_SIZE && i < filtered.length; i++) {
            filtered[i].selected = false;
          }
          renderView();
        });
        btnSelectAll.addEventListener("click", () => {
          const filtered = filteredSongs();
          filtered.forEach((s) => s.selected = true);
          renderView();
        });
        btnClearSelect.addEventListener("click", () => {
          const filtered = filteredSongs();
          filtered.forEach((s) => s.selected = false);
          renderView();
        });
        btnDownloadAll.addEventListener("click", () => {
          const toDl = state.songs.filter((s) => s.selected);
          if (toDl.length === 0) {
            showTips("未选择歌曲", 2);
            return;
          }
          batchDownloadSongs(toDl, state.downloadConfig);
        });
        btnUploadAll.addEventListener("click", () => {
          const toUp = state.songs.filter((s) => s.selected && !s.privilege.cs);
          if (toUp.length === 0) {
            showTips("未选择歌曲或只选择了云盘歌曲", 2);
            return;
          }
          const ULobj = new ncmDownUploadBatch(toUp, state.uploadConfig);
          ULobj.startUpload();
        });
        function currentPageSongs() {
          const filtered = filteredSongs();
          const begin = (state.page - 1) * PAGE_SIZE;
          const pageSongs = filtered.slice(begin, begin + PAGE_SIZE);
          state.pageMax = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
          return pageSongs;
        }
        function filteredSongs() {
          return state.songs.filter((s) => {
            if (s.privilege.fee === 0) {
              if (!state.filterOptions.free) return false;
            } else if (s.privilege.fee === 1) {
              if (!state.filterOptions.vip) return false;
            } else if (s.privilege.fee === 4) {
              if (!state.filterOptions.pay) return false;
            } else if (s.privilege.fee === 8) {
              if (!state.filterOptions.lowfree) return false;
            }
            if (!state.filterOptions.instrumental) {
              if ((s.song.mark & 131072) === 131072) return false;
              if (s.song.additionalTitle) {
                if (s.song.additionalTitle.toLowerCase().includes("instrumental")) return false;
                if (s.song.additionalTitle.includes("伴奏")) return false;
              } else {
                if (s.title.toLowerCase().includes("instrumental")) return false;
                if (s.title.includes("伴奏")) return false;
              }
            }
            if (!state.filterOptions.live) {
              if (s.song.album && s.song.album.subType === "现场版") return false;
              if (s.song.additionalTitle) {
                if (s.song.additionalTitle.toLowerCase().includes("live")) return false;
              } else if (liveRegex.test(s.title.toLowerCase())) return false;
            }
            if (s.privilege.cs && !state.filterOptions.cloud) return false;
            if (!state.filterText) return true;
            const t = state.filterText.toLowerCase();
            return s.title.toLowerCase().includes(t) || s.artist.toLowerCase().includes(t) || s.album.toLowerCase().includes(t);
          });
        }
        function renderView() {
          toolbar.style.display = state.view === "songs" ? "" : "none";
          if (state.view === "songs") {
            renderSongsView();
            renderPager();
          } else if (state.view === "filter") {
            renderFilterView();
            pager.innerHTML = "";
          } else if (state.view === "dl") {
            renderDownloadSettingsView();
            pager.innerHTML = "";
          } else if (state.view === "up") {
            renderUploadSettingsView();
            pager.innerHTML = "";
          }
        }
        function renderSongsView() {
          mainContent.style.width = "735px";
          mainContent.style.boxSizing = "border-box";
          const pageSongs = currentPageSongs();
          mainContent.innerHTML = "";
          pageSongs.forEach((s) => {
            const row = document.createElement("div");
            row.style = "display:flex;align-items:center;gap:8px;padding:6px;border-bottom:1px solid #f0f0f0;width:100%;box-sizing:border-box;min-width:0;";
            row.innerHTML = ` 
  <!-- 复选框：固定宽度，居中 -->
  <div style="flex: 0 0 36px; display: flex; align-items: center; justify-content: center;">
    <input type="checkbox" style="width: 25px; height: 25px; " ${s.selected ? "checked" : ""}>
  </div>
  
  <!-- 封面：固定宽度，居中 -->
  <div style="flex: 0 0 56px; display: flex; align-items: center; justify-content: center;">
    <a href="https://music.163.com/#/album?id=${s.song.al.id}" target="_blank" title="${s.album}" style="display: block;">
      <img src="${s.song.al.picUrl + "?param=50y50&quality=100"}" 
           alt="cover" 
           style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; background: #f5f5f5; transition: transform 0.2s ease;">
    </a>
  </div>
  
  <!-- 歌曲信息：弹性伸缩，优先占用空间 -->
  <div style="flex: 2 1 200px; min-width: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: center; gap: 2px;">
    <div style="font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.2;">
      <a href="https://music.163.com/#/song?id=${s.song.id}" target="_blank" style="color: #000; text-decoration: none; transition: color 0.2s ease;">${s.title}</a>
    </div>
    <div style="font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.2;">
    ${(s.song.mark & 1048576) === 1048576 ? "🅴 " : ""}
    ${s.privilege.cs ? '<i class="fa-regular fa-cloud"></i> ' : ""}
      ${s.artist}
    </div>
  </div>
  
  <!-- 专辑信息：弹性伸缩，次要占用空间 -->
  <div style="flex: 1 1 120px; min-width: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: center;">
    <div style="font-weight: 600; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; line-height: 1.2;">
      <a href="https://music.163.com/#/album?id=${s.song.al.id}" target="_blank" style="color: #000; text-decoration: none; transition: color 0.2s ease;">${s.album}</a>
    </div>
  </div>
                    `;
            const chk = row.querySelector("input[type=checkbox]");
            chk.addEventListener("change", () => {
              s.selected = chk.checked;
            });
            mainContent.appendChild(row);
          });
        }
        function renderFilterView() {
          mainContent.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <input id="bm-filter-input" class="swal2-input" placeholder="过滤：标题/歌手/专辑" value="${state.filterText}">
                    <div>
                        歌曲收费类型：
                      <div>
                      （免费用户）
                      <label style="margin-right:12px"><input id="bm-filter-cb-lowfree" type="checkbox" ${state.filterOptions.lowfree ? "checked" : ""}> 最高极高音质试听</label>
                      <label style="margin-right:12px"><input id="bm-filter-cb-free" type="checkbox" ${state.filterOptions.free ? "checked" : ""}> 前者基础上+最高HiRes音质下载</label></div>
                      <div><label style="margin-right:12px"><input id="bm-filter-cb-vip" type="checkbox" ${state.filterOptions.vip ? "checked" : ""}> VIP</label>
                      <label style="margin-right:12px"><input id="bm-filter-cb-pay" type="checkbox" ${state.filterOptions.pay ? "checked" : ""}> 数字专辑</label></div>
                    </div>
                    <div>
                      <label style="margin-right:12px"><input id="bm-filter-cb-cloud" type="checkbox" ${state.filterOptions.cloud ? "checked" : ""}>显示云盘歌曲</label>
                    </div>
                    <div>
                      <label style="margin-right:12px"><input id="bm-filter-cb-instrumental" type="checkbox" ${state.filterOptions.instrumental ? "checked" : ""}>纯音乐、伴奏</label>
                      <label style="margin-right:12px"><input id="bm-filter-cb-live" type="checkbox" ${state.filterOptions.live ? "checked" : ""}>歌曲标题含有(Live)或歌曲的专辑类型是现场版</label>
                    </div>
                    <div style="margin-top:16px;color:#666;font-size:13px;">专辑页面无法识别纯音乐</div>
                    <div style="margin-top:16px;color:#666;font-size:13px;">”歌曲的专辑类型是现场版“仅在歌手页面能识别</div>
                  </div>
                `;
          const input = mainContent.querySelector("#bm-filter-input");
          input.addEventListener("input", (e2) => {
            state.filterText = e2.target.value.trim();
            state.page = 1;
          });
          const checkboxes = mainContent.querySelectorAll('input[type="checkbox"]');
          checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
              state.filterOptions[checkbox.id.split("-").pop()] = checkbox.checked;
              setBatchFilter(state.filterOptions);
              state.page = 1;
            });
          });
        }
        function renderDownloadSettingsView() {
          mainContent.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <label>同时下载的歌曲数
                        <select id="bm-dl-concurrent" class="swal2-select">
                        <option value=4>4</option><option value=3>3</option><option value="2">2</option><option value=1>1</option>
                        </select></label>
                    <label>优先下载音质
                    <select id="bm-dl-level" class="swal2-select">
                        <option value="jymaster">超清母带</option><option value="dolby">杜比全景声</option><option value="sky">沉浸环绕声</option><option value="jyeffect">高清臻音</option><option value="hires">高解析度无损</option><option value="lossless">无损</option><option value="exhigh">极高</option>
                    </select></label>
                    <label>文件名格式
                      <select id="bm-dl-out"  class="swal2-select">
                        <option value="artist-title">歌手 - 标题</option><option value="title-artist">标题 - 歌手</option><option value="title">仅标题</option>
                      </select>
                    </label>
                    <label>文件夹格式
                    <select id="bm-dl-folder" class="swal2-select"><option value="none">不建立文件夹</option><option value="artist">建立歌手文件夹</option><option value="artist-album">建立歌手 \\ 专辑文件夹</option></select>
                    </label>
                    <label>音乐元数据
                        <select id="bm-dl-appendMeta" class="swal2-select">
                            <option value="notAppend">不添加</option><option value="skipCloud">云盘歌曲不添加</option><option value="allAppend">全部添加</option>
                        </select>
                    </label>
                    <label><input id="bm-dl-dllrc" type="checkbox"> 下载.lrc歌词文件</label>
                    <label><input id="bm-dl-levelonly" type="checkbox"> 仅获取到目标音质时下载</label>
                    <div style="margin-top:16px;color:#666;font-size:13px;">建立文件夹功能篡改猴下载模式设置为浏览器API可以生效，其他脚本管理器可能导致文件名乱码的问题。</div>
                  </div>
                `;
          const selConcurrent = mainContent.querySelector("#bm-dl-concurrent");
          const selLevel = mainContent.querySelector("#bm-dl-level");
          const selOut = mainContent.querySelector("#bm-dl-out");
          const selFolder = mainContent.querySelector("#bm-dl-folder");
          const selAppend = mainContent.querySelector("#bm-dl-appendMeta");
          const cbLyric = mainContent.querySelector("#bm-dl-dllrc");
          const cbLevelOnly = mainContent.querySelector("#bm-dl-levelonly");
          selConcurrent.value = state.downloadConfig.threadCount || state.downloadConfig.concurrent || 4;
          selLevel.value = state.downloadConfig.level || "jymaster";
          selOut.value = state.downloadConfig.out || "artist-title";
          selFolder.value = state.downloadConfig.folder || "none";
          selAppend.value = state.downloadConfig.appendMeta || "notAppend";
          cbLyric.checked = !!state.downloadConfig.downloadLyric;
          cbLevelOnly.checked = !!state.downloadConfig.levelonly;
          selConcurrent.addEventListener("change", (e2) => {
            const v = parseInt(e2.target.value || "4");
            state.downloadConfig.threadCount = v;
            setBatchDownloadSettings({ concurrent: v, level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly });
          });
          selLevel.addEventListener("change", (e2) => {
            state.downloadConfig.level = e2.target.value;
            setBatchDownloadSettings({ concurrent: parseInt(selConcurrent.value || "4"), level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly });
          });
          selOut.addEventListener("change", (e2) => {
            state.downloadConfig.out = e2.target.value;
            setDownloadSettings({ out: state.downloadConfig.out, folder: state.downloadConfig.folder, appendMeta: state.downloadConfig.appendMeta });
          });
          selFolder.addEventListener("change", (e2) => {
            state.downloadConfig.folder = e2.target.value;
            setDownloadSettings({ out: state.downloadConfig.out, folder: state.downloadConfig.folder, appendMeta: state.downloadConfig.appendMeta });
          });
          selAppend.addEventListener("change", (e2) => {
            state.downloadConfig.appendMeta = e2.target.value;
            setDownloadSettings({ out: state.downloadConfig.out, folder: state.downloadConfig.folder, appendMeta: state.downloadConfig.appendMeta });
          });
          cbLyric.addEventListener("change", (e2) => {
            state.downloadConfig.downloadLyric = e2.target.checked;
            setBatchDownloadSettings({ concurrent: parseInt(selConcurrent.value || "4"), level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly });
          });
          cbLevelOnly.addEventListener("change", (e2) => {
            state.downloadConfig.targetLevelOnly = e2.target.checked;
            setBatchDownloadSettings({ concurrent: parseInt(selConcurrent.value || "4"), level: state.downloadConfig.level, dllrc: !!state.downloadConfig.downloadLyric, levelonly: !!state.downloadConfig.levelonly });
          });
        }
        function renderUploadSettingsView() {
          mainContent.innerHTML = `
                  <div style="display:flex;flex-direction:column;gap:8px;">
                    <label>优先转存音质
                    <select id="bm-up-level" class="swal2-select">
                        <option value="jymaster" selected="">超清母带</option><option value="dolby">杜比全景声</option><option value="sky">沉浸环绕声</option><option value="jyeffect">高清臻音</option><option value="hires">高解析度无损</option><option value="lossless">无损</option><option value="exhigh">极高</option>
                    </select></label>
                    <label><input id="bm-up-target-only" type="checkbox" ${state.uploadConfig.targetLevelOnly ? "checked" : ""}> 仅获取到目标音质时转存</label>
                  </div>
                `;
          const selUpLevel = mainContent.querySelector("#bm-up-level");
          const cbUpLevelOnly = mainContent.querySelector("#bm-up-target-only");
          selUpLevel.value = state.uploadConfig.level || "jymaster";
          cbUpLevelOnly.checked = !!state.uploadConfig.targetLevelOnly;
          selUpLevel.addEventListener("change", (e2) => {
            state.uploadConfig.level = e2.target.value;
            setBatchTransUploadSettings({ level: state.uploadConfig.level, levelonly: !!state.uploadConfig.targetLevelOnly });
          });
          cbUpLevelOnly.addEventListener("change", (e2) => {
            state.uploadConfig.targetLevelOnly = e2.target.checked;
            setBatchTransUploadSettings({ level: state.uploadConfig.level, levelonly: !!state.uploadConfig.targetLevelOnly });
          });
        }
        function renderPager() {
          pager.innerHTML = "";
          const pageIndexs = [1];
          const floor = Math.max(2, state.page - 2);
          const ceil = Math.min(state.pageMax - 1, state.page + 2);
          for (let i = floor; i <= ceil; i++) {
            pageIndexs.push(i);
          }
          if (state.pageMax > 1) {
            pageIndexs.push(state.pageMax);
          }
          pageIndexs.forEach((pageIndex) => {
            const pageBtn = document.createElement("button");
            pageBtn.setAttribute("type", "button");
            pageBtn.className = "swal2-styled";
            pageBtn.innerHTML = pageIndex;
            if (pageIndex !== state.page) {
              pageBtn.addEventListener("click", () => {
                state.page = pageIndex;
                renderView();
              });
            } else {
              pageBtn.style.background = "white";
            }
            pager.appendChild(pageBtn);
          });
          if (pageIndexs.length < state.pageMax) {
            const jumpToPageInput = createPageJumpInput(state.page, state.pageMax);
            jumpToPageInput.addEventListener("change", () => {
              const newPage = parseInt(jumpToPageInput.value);
              if (newPage >= 1 && newPage <= state.pageMax) {
                state.page = newPage;
                renderView();
              } else {
                jumpToPageInput.value = state.page;
              }
            });
            pager.appendChild(jumpToPageInput);
          }
        }
        renderView();
      }
    });
  };
  const songsDownUpLoad$1 = (albumId, uiArea) => {
    const btnSongsDownUpLoad = createBigButton("批量下载 & 转存", uiArea, 1);
    btnSongsDownUpLoad.addEventListener("click", () => {
      showBatchManager(albumDetailObj.albumSongList, { listType: "album", listId: albumId });
    });
  };
  class AlbumDetail {
    constructor() {
      this.domReady = false;
      this.dataFetched = false;
      this.flag = true;
      this.albumSongList = [];
      this.albumRes = null;
      this.albumDiscList = [];
      const params2 = new URLSearchParams(unsafeWindow.location.search);
      this.playlistId = Number(params2.get("id"));
      this._hash = params2.get("_hash");
    }
    fetchAlbumData(albumId) {
      this.albumId = albumId;
      weapiRequest(`/api/v1/album/${albumId}`, {
        onload: (content) => {
          this.albumRes = content;
          for (let i = 0; i < content.songs.length; i++) {
            content.songs[i].al.picUrl = content.album.blurPicUrl;
            const songItem = {
              id: content.songs[i].id,
              title: content.songs[i].name,
              artist: getArtistTextInSongDetail(content.songs[i]),
              album: content.album.name,
              song: content.songs[i],
              privilege: content.songs[i].privilege
            };
            this.albumSongList.push(songItem);
            const discInfos = content.songs[i].cd ? content.songs[i].cd.split(" ") : [];
            if (discInfos.length > 0) {
              const discIndex = parseInt(discInfos[0]);
              while (this.albumDiscList.length < discIndex) {
                this.albumDiscList.push(null);
              }
              if (this.albumDiscList[discIndex - 1] === null) {
                const discTitle = `Disc ${discIndex}`;
                if (discInfos.length > 1) discTitle += " " + discInfos.slice(1).join(" ");
                this.albumDiscList[discIndex - 1] = { title: discTitle, songs: [] };
              }
              this.albumDiscList[discIndex - 1].songs.push(songItem);
            }
          }
          this.dataFetched = true;
          this.checkStartCreateDom();
        }
      });
    }
    onDomReady() {
      this.domReady = true;
      this.descriptionArea = document.querySelector(".topblk");
      this.operationArea = document.querySelector("#content-operation");
      this.checkStartCreateDom();
    }
    checkStartCreateDom() {
      if (this.domReady && this.dataFetched && this.flag) {
        this.flag = false;
        this.AppendInfos();
        this.AppendBtns();
        if (this.albumDiscList.length > 1) this.createDiscTable();
      }
    }
    AppendInfos() {
      this.descriptionArea.innerHTML += `<p class="intr"><b>专辑类型：</b>${this.albumRes.album.type} ${this.albumRes.album.subType}</p>`;
      if ((this.albumRes.album.mark & songMark.explicit) === songMark.explicit) {
        this.descriptionArea.innerHTML += `<p class="intr"><b>🅴：</b>内容含有不健康因素</p>`;
      }
      if (this.albumRes.album.blurPicUrl) {
        this.descriptionArea.innerHTML += `<p class="intr"><a class="s-fc7" href="${this.albumRes.album.blurPicUrl}" target="_blank">专辑封面原图</a></p>`;
      }
    }
    AppendBtns() {
      songsDownUpLoad$1(this.albumId, this.operationArea);
    }
    createDiscTable() {
      const tableRows = document.querySelectorAll(".m-table-album tr");
      const tableParent = document.querySelector("div:has(> .m-table-album)");
      let isTableCreated = false;
      this.albumDiscList.forEach((disc, index) => {
        if (disc === null) return;
        isTableCreated = true;
        tableParent.innerHTML += `
            <div class="u-title u-title-1 f-cb" style="margin-top: 10px"><h3><span class="f-ff2">${disc.title}</span></h3><span class="sub s-fc3">${disc.songs.length}首歌</span></div>
            <table class="m-table m-table-album">
                <thead><tr><th class="first w1"><div class="wp">&nbsp;</div></th><th><div class="wp">歌曲标题</div></th><th class="w2-1"><div class="wp">时长</div></th><th class="w4"><div class="wp">歌手</div></th></tr></thead>
                <tbody id="ncmextend-disc-${index}"></tbody>
            </table>
            `;
        const tbody = tableParent.querySelector(`#ncmextend-disc-${index}`);
        disc.songs.forEach((songItem, songIndex) => {
          tableRows.forEach((tableRow) => {
            if (Number(tableRow.id.slice(0, -13)) === songItem.id) {
              tableRow.querySelector(".num").innerHTML = songItem.song.no;
              tableRow.className = songIndex % 2 === 0 ? "even " : "";
              if (songItem.privilege.st < 0) tableRow.className += "js-dis";
              tbody.appendChild(tableRow);
            }
          });
        });
      });
      if (isTableCreated) {
        const originTitle = document.querySelector(".n-songtb .u-title");
        originTitle.parentNode.removeChild(originTitle);
        tableParent.removeChild(tableParent.firstChild);
      }
      if (/^songlist-(\d+)$/.test(this._hash) && tableRows.length > 0) {
        const timestamp = document.querySelector(".m-table > tbody > tr").id.slice(-13);
        const tr = document.querySelector(`[id="${this._hash.slice(9)}${timestamp}"]`);
        if (tr) tr.scrollIntoView();
      }
    }
    updateSongsCloudStatus(songIds) {
      songIds.forEach((songId) => {
        for (let i = 0; i < this.albumSongList.length; i++) {
          if (this.albumSongList[i].id === songId) {
            this.albumSongList[i].privilege.cs = true;
            break;
          }
        }
      });
    }
  }
  const albumDetailObj = new AlbumDetail();
  const songsDownUpLoad = (playlistId, uiArea) => {
    const btnSongsDownUpLoad = createBigButton("批量下载 & 转存", uiArea, 1);
    btnSongsDownUpLoad.addEventListener("click", () => {
      showBatchManager(playlistDetailObj.playlistSongList, { listType: "playlist", listId: playlistId });
    });
  };
  const sortSongs = (playlistId, uiArea) => {
    const btnPlaylistSort = createBigButton("歌单排序", uiArea, 1);
    btnPlaylistSort.addEventListener("click", () => {
      ShowPLSortPopUp(playlistId);
    });
  };
  const ShowPLSortPopUp = (playlistId) => {
    Swal.fire({
      title: "歌单内歌曲排序",
      input: "select",
      inputOptions: ["发行时间降序", "发行时间升序", "红心数量降序", "红心数量升序", "评论数量降序", "评论数量升序"],
      inputPlaceholder: "选择排序方式",
      confirmButtonText: "开始排序",
      showCloseButton: true,
      focusConfirm: false,
      inputValidator: (way) => {
        if (!way) {
          return "请选择排序方式";
        }
      }
    }).then((res) => {
      if (!res.isConfirmed) return;
      if (res.value === 0) {
        PlaylistTimeSort(playlistId, true);
      } else if (res.value === 1) {
        PlaylistTimeSort(playlistId, false);
      } else if (res.value === 2) {
        PlaylistCountSort(playlistId, true, "Red");
      } else if (res.value === 3) {
        PlaylistCountSort(playlistId, false, "Red");
      } else if (res.value === 4) {
        PlaylistCountSort(playlistId, true, "Comment");
      } else if (res.value === 5) {
        PlaylistCountSort(playlistId, false, "Comment");
      }
    });
  };
  const PlaylistTimeSort = (playlistId, descending) => {
    showTips(`正在获取歌单内歌曲信息`, 1);
    weapiRequest("/api/v6/playlist/detail", {
      data: {
        id: playlistId,
        n: 1e5,
        s: 8
      },
      onload: (content) => {
        const songList = [];
        const tracklen = content.playlist.tracks.length;
        for (let i = 0; i < tracklen; i++) {
          const songItem = { id: content.playlist.tracks[i].id, publishTime: content.playlist.tracks[i].publishTime, albumId: content.playlist.tracks[i].al.id, cd: content.playlist.tracks[i].cd ? Number(content.playlist.tracks[i].cd.split(" ")[0]) : 0, no: content.playlist.tracks[i].no };
          songList.push(songItem);
        }
        if (content.playlist.trackCount > content.playlist.tracks.length) {
          showTips(`大歌单,开始分批获取${content.playlist.trackCount}首歌信息`, 1);
          const trackIds = content.playlist.trackIds.map((item) => {
            return {
              "id": item.id
            };
          });
          PlaylistTimeSortFetchAll(playlistId, descending, trackIds, 0, songList);
        } else {
          PlaylistTimeSortFetchAllPublishTime(playlistId, descending, 0, songList, {});
        }
      }
    });
  };
  const PlaylistTimeSortFetchAll = (playlistId, descending, trackIds, startIndex, songList) => {
    if (startIndex >= trackIds.length) {
      PlaylistTimeSortFetchAllPublishTime(playlistId, descending, 0, songList, {});
      return;
    }
    weapiRequest("/api/v3/song/detail", {
      data: {
        c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1e3))
      },
      onload: function(content) {
        const songlen = content.songs.length;
        for (let i = 0; i < songlen; i++) {
          const songItem = { id: content.songs[i].id, publishTime: content.songs[i].publishTime, albumId: content.songs[i].al.id, cd: content.songs[i].cd ? Number(content.songs[i].cd.split(" ")[0]) : 0, no: content.songs[i].no };
          songList.push(songItem);
        }
        PlaylistTimeSortFetchAll(playlistId, descending, trackIds, startIndex + content.songs.length, songList);
      }
    });
  };
  const PlaylistTimeSortFetchAllPublishTime = (playlistId, descending, index, songList, aldict) => {
    if (index >= songList.length) {
      PlaylistTimeSortSongs(playlistId, descending, songList);
      return;
    }
    if (index === 0) showTips("开始获取歌曲专辑发行时间");
    if (index % 10 === 9) showTips(`正在获取歌曲专辑发行时间(${index + 1}/${songList.length})`);
    const albumId = songList[index].albumId;
    if (albumId <= 0) {
      PlaylistTimeSortFetchAllPublishTime(playlistId, descending, index + 1, songList, aldict);
      return;
    }
    if (aldict[albumId]) {
      songList[index].publishTime = aldict[albumId];
      PlaylistTimeSortFetchAllPublishTime(playlistId, descending, index + 1, songList, aldict);
      return;
    }
    weapiRequest(`/api/v1/album/${albumId}`, {
      onload: function(content) {
        const publishTime = content.album.publishTime;
        aldict[albumId] = publishTime;
        songList[index].publishTime = publishTime;
        PlaylistTimeSortFetchAllPublishTime(playlistId, descending, index + 1, songList, aldict);
      }
    });
  };
  const PlaylistTimeSortSongs = (playlistId, descending, songList) => {
    songList.sort((a, b) => {
      if (a.publishTime !== b.publishTime) {
        if (descending) {
          return b.publishTime - a.publishTime;
        } else {
          return a.publishTime - b.publishTime;
        }
      } else if (a.albumId !== b.albumId) {
        if (descending) {
          return b.albumId - a.albumId;
        } else {
          return a.albumId - b.albumId;
        }
      } else if (a.cd !== b.cd) {
        return a.cd - b.cd;
      } else if (a.no !== b.no) {
        return a.no - b.no;
      }
      return a.id - b.id;
    });
    let trackIds = songList.map((song) => song.id);
    weapiRequest("/api/playlist/manipulate/tracks", {
      data: {
        pid: playlistId,
        trackIds: JSON.stringify(trackIds),
        op: "update"
      },
      onload: function(content) {
        if (content.code === 200) {
          showConfirmBox("排序完成");
        } else {
          showConfirmBox("排序失败," + content);
        }
      }
    });
  };
  const PlaylistCountSort = (playlistId, descending, way) => {
    showTips(`正在获取歌单内歌曲信息`, 1);
    weapiRequest("/api/v6/playlist/detail", {
      data: {
        id: playlistId,
        n: 1e5,
        s: 8
      },
      onload: (content) => {
        const songList = content.playlist.trackIds.map((item) => {
          return {
            "id": item.id,
            "count": 0
          };
        });
        const trackIds = content.playlist.trackIds.map((item) => {
          return item.id;
        });
        if (way === "Red") {
          PlaylistCountSortFetchRedCount(playlistId, songList, 0, descending);
        } else if (way === "Comment") {
          PlaylistCountSortFetchCommentCount(playlistId, songList, trackIds, 0, descending);
        }
      }
    });
  };
  const PlaylistCountSortFetchRedCount = (playlistId, songList, index, descending) => {
    if (index >= songList.length) {
      PlaylistCountSortSongs(playlistId, descending, songList);
      return;
    }
    if (index === 0) showTips("开始获取歌曲红心数量");
    if (index % 10 === 9) showTips(`正在获取歌曲红心数量(${index + 1}/${songList.length})`);
    weapiRequest("/api/song/red/count", {
      data: {
        songId: songList[index].id
      },
      onload: function(content) {
        songList[index].count = content.data.count;
        PlaylistCountSortFetchRedCount(playlistId, songList, index + 1, descending);
      }
    });
  };
  const PlaylistCountSortFetchCommentCount = (playlistId, songList, trackIds, index, descending) => {
    if (index >= songList.length) {
      PlaylistCountSortSongs(playlistId, descending, songList);
      return;
    }
    if (index === 0) showTips("开始获取歌曲评论数量");
    else showTips(`正在获取歌曲评论数量(${index + 1}/${songList.length})`);
    weapiRequest("/api/resource/commentInfo/list", {
      data: {
        resourceType: "4",
        resourceIds: JSON.stringify(trackIds.slice(index, index + 1e3))
      },
      onload: function(content) {
        content.data.forEach((item) => {
          const songId = item.resourceId;
          for (let i = 0; i < songList.length; i++) {
            if (songList[i].id === songId) {
              songList[i].count = item.commentCount;
              break;
            }
          }
        });
        PlaylistCountSortFetchCommentCount(playlistId, songList, trackIds, index + 1e3, descending);
      }
    });
  };
  const PlaylistCountSortSongs = (playlistId, descending, songList) => {
    songList.sort((a, b) => {
      if (a.count !== b.count) {
        if (descending) {
          return b.count - a.count;
        } else {
          return a.count - b.count;
        }
      }
      return a.id - b.id;
    });
    let trackIds = songList.map((song) => song.id);
    weapiRequest("/api/playlist/manipulate/tracks", {
      data: {
        pid: playlistId,
        trackIds: JSON.stringify(trackIds),
        op: "update"
      },
      onload: function(content) {
        if (content.code === 200) {
          showConfirmBox("排序完成");
        } else {
          showConfirmBox("排序失败");
        }
      }
    });
  };
  class PlaylistDetail {
    constructor() {
      this.domReady = false;
      this.dataFetched = false;
      this.flag = true;
      const params2 = new URLSearchParams(unsafeWindow.location.search);
      this.playlistId = Number(params2.get("id"));
      this._hash = params2.get("_hash");
      this.playlist = null;
      this.playlistSongList = [];
      this.playableSongList = [];
      this.rowHTMLList = [];
    }
    fetchPlaylistFullData(playlistId) {
      weapiRequest("/api/v6/playlist/detail", {
        data: {
          id: playlistId,
          n: 1e5,
          s: 8
        },
        onload: (content) => {
          this.playlist = content.playlist;
          if (content.playlist.trackCount > content.playlist.tracks.length) {
            const trackIds = content.playlist.trackIds.map((item) => {
              return {
                "id": item.id
              };
            });
            this.getPlaylistAllSongsSub(trackIds, 0);
          } else {
            this.addSongInToSongList(content);
            this.onFetchDatafinnsh();
          }
        }
      });
    }
    getPlaylistAllSongsSub(trackIds, startIndex) {
      if (startIndex >= trackIds.length) {
        this.onFetchDatafinnsh();
        return;
      }
      weapiRequest("/api/v3/song/detail", {
        data: {
          c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1e3))
        },
        onload: (content) => {
          this.addSongInToSongList(content);
          this.getPlaylistAllSongsSub(trackIds, startIndex + content.songs.length);
        }
      });
    }
    addSongInToSongList(content) {
      const songs = content.songs || content.playlist.tracks;
      const privileges = content.privileges;
      const songlen = songs.length;
      const privilegelen = privileges.length;
      for (let i = 0; i < songlen; i++) {
        for (let j = 0; j < privilegelen; j++) {
          if (songs[i].id === privileges[j].id) {
            const songItem = {
              id: songs[i].id,
              title: songs[i].name,
              artist: getArtistTextInSongDetail(songs[i]),
              album: getAlbumTextInSongDetail(songs[i]),
              song: songs[i],
              privilege: privileges[j]
            };
            this.playlistSongList.push(songItem);
            break;
          }
        }
      }
    }
    onFetchDatafinnsh() {
      this.playlistSongList.forEach((songItem) => {
        this.createFormatAddToData(songItem);
      });
      this.dataFetched = true;
      this.checkStartInitBtn();
    }
    createFormatAddToData(songItem) {
      if (songItem.privilege.plLevel !== "none") {
        const addToFormat = songItemAddToFormat(songItem.song);
        addToFormat.source = {
          fdata: String(this.playlistId),
          fid: 13,
          link: `playlist?id=${this.playlistId}&_hash=songlist-${songItem.song.id}`,
          title: "歌单"
        };
        this.playableSongList.push(addToFormat);
      }
    }
    onDomReady() {
      this.operationArea = document.querySelector("#content-operation");
      this.songListTextDom = document.querySelector("div.u-title.u-title-1.f-cb > h3 > span");
      this.playCount = document.querySelector("#play-count");
      this.songListTextDom.innerHTML = "获取歌单数据中...";
      this.domReady = true;
      this.checkStartInitBtn();
    }
    checkStartInitBtn() {
      if (this.domReady && this.dataFetched && this.flag) {
        this.flag = false;
        this.renderPlayAllBtn();
        this.appendBtns();
        this.fillTableSong();
        const playlistTrackCount = document.querySelector("#playlist-track-count");
        if (playlistTrackCount) playlistTrackCount.innerHTML = this.playlistSongList.length;
        this.songListTextDom.innerHTML = "歌曲列表";
      }
    }
    renderPlayAllBtn() {
      this.operationArea.innerHTML = `
        <a style="display:none" class="u-btn2 u-btn2-2 u-btni-addply f-fl" hidefocus="true" title="播放"><i><em class="ply"></em>播放全部(${this.playableSongList.length})</i></a>
        <a style="display:none" class="u-btni u-btni-add" hidefocus="true" title="添加到播放列表"></a>
        ` + this.operationArea.innerHTML;
      this.operationArea.children[0].addEventListener("click", () => {
        unsafeWindow.top.player.addTo(this.playableSongList, true, true);
        weapiRequest("/api/playlist/update/playcount", {
          data: {
            id: this.playlistId
          },
          onload: (content) => {
            if (content.code === 200) this.playCount.innerHTML = Number(this.playCount.innerHTML) + 1;
          }
        });
      });
      this.operationArea.children[1].addEventListener("click", () => {
        unsafeWindow.top.player.addTo(this.playableSongList, false, false);
      });
      this.operationArea.children[0].style.display = "";
      this.operationArea.children[1].style.display = "";
      this.operationArea.children[2].style.display = "none";
      this.operationArea.children[3].style.display = "none";
    }
    appendBtns() {
      var _a;
      songsDownUpLoad(this.playlistId, this.operationArea);
      const creatorhomeURL = (_a = document.head.querySelector("[property~='music:creator'][content]")) == null ? void 0 : _a.content;
      const creatorId = new URLSearchParams(new URL(creatorhomeURL).search).get("id");
      if (creatorId === unsafeWindow.GUser.userId) {
        sortSongs(this.playlistId, this.operationArea);
      }
    }
    fillTableSong() {
      const timestamp = document.querySelector(".m-table > tbody > tr").id.slice(-13);
      const isLargePlaylist = this.playlistSongList.length > 1e3;
      this.playlistSongList.forEach((songItem, index) => {
        this.createRowHTML(songItem, index, timestamp, isLargePlaylist);
      });
      const table = document.querySelector(".m-table");
      if (table) {
        const tableStyles = `
            .m-table .ncmextend-playlist-playbtn {
                display: none;
            }
            .m-table tr:hover .ncmextend-playlist-playbtn {
                display: block;
            }
            .m-table .ncmextend-playlist-playbtn:has(.ply-z-slt) {
                display: block;
            }
            .m-table .ncmextend-playlist-songindex:has(+ div > .ply-z-slt) {
                display: none;
            }
            .m-table .ncmextend-playlist-songindex {
                color: #999;
                float: left;
                margin-left: -8px;
                width: 40px;
                text-align: center;
            }
            .m-table tr:hover .ncmextend-playlist-songindex {
                display: none;
            }
            .m-table .ncmextend-playlist-viponly {
                color: #999;
                float: left;
                margin-left: -8px;
                width: 40px;
                text-align: center;
            }
            .m-table .ncmextend-playlist-songtitle {
                height: 20px;
                margin-right: 20px;
                margin-top: 5px;
                font-size: 16px;
            }
            .m-table .ncmextend-playlist-songartist {
                height: 20px;
                margin-right: 20px;
                margin-top: 5px;
            }
            .m-table .ncmextend-playlist-songalbum {
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 2;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            `;
        GM_addStyle(tableStyles);
        table.className = "m-table m-table-rank";
        const headerHTML = isLargePlaylist ? `<thead><tr>
                    <th style="width:40px;"><div class="wp">&nbsp;</div></th>
                    <th><div class="wp">歌曲</div></th>
                    <th style="width:150px;"><div class="wp">歌手</div></th>
                    <th class="w4"><div class="wp af3"></div></th>
                    <th style="width:90px;"><div class="wp af1"></div></th>
                </tr></thead>` : `<thead><tr>
                    <th style="width:40px;"><div class="wp">&nbsp;</div></th>
                    <th><div class="wp">歌名/歌手</div></th>
                    <th class="w4"><div class="wp af3"></div></th>
                    <th style="width:90px;"><div class="wp af1"></div></th>
                </tr></thead>`;
        table.innerHTML = `
            ${headerHTML}
            <tbody>${this.rowHTMLList.join("")}</tbody>
            `;
        const playing = unsafeWindow.top.player.getPlaying();
        if (playing.track) {
          const plybtn = document.querySelector(`[id="${playing.track.id}${timestamp}"] > td:nth-child(1) > div > div.ncmextend-playlist-playbtn > span`);
          if (plybtn) {
            plybtn.className = plybtn.className.trimEnd() + " ply-z-slt";
          }
        }
        if (/^songlist-(\d+)$/.test(this._hash)) {
          const tr = document.querySelector(`[id="${this._hash.slice(9)}${timestamp}"]`);
          if (tr) tr.scrollIntoView();
        }
        this.deleteMoreInfoUI();
      }
    }
    createRowHTML(songItem, index, timestamp, isLargePlaylist) {
      this.bodyId = document.body.className.replace(/\D/g, "");
      const status = songItem.privilege.st < 0;
      const deletable = this.playlist.creator.userId === unsafeWindow.GUser.userId;
      const needVIP = songItem.privilege.plLevel === "none" && !status;
      const durationText = duringTimeDesc(songItem.song.dt);
      const artistText = escapeHTML(songItem.artist);
      const annotation = escapeHTML(songItem.song.tns ? songItem.song.tns[0] : songItem.song.alias ? songItem.song.alias[0] : "");
      const albumName = escapeHTML(songItem.album);
      const songName = escapeHTML(songItem.title);
      let playBtnHTML = `<span data-res-id="${songItem.id}" data-res-type="18" data-res-action="play" data-res-from="13" data-res-data="${this.playlist.id}" class="ply "></span>`;
      if (needVIP) playBtnHTML = `<span class='ncmextend-playlist-viponly'>需要VIP</span>`;
      let artistContent = "";
      songItem.song.ar.forEach((ar) => {
        if (ar.name) {
          if (ar.id > 0) artistContent += `<a href="#/artist?id=${ar.id}" hidefocus="true">${escapeHTML(ar.name)}</a>/`;
          else artistContent += escapeHTML(ar.name) + "/";
        }
      });
      if (artistContent.length > 0) artistContent = artistContent.slice(0, -1);
      else artistContent = artistText;
      let albumContent = albumName;
      if (songItem.song.al.id > 0) albumContent = `<a href="#/album?id=${songItem.song.al.id}" title="${albumName}">${albumName}</a>`;
      const albumImgHTML = isLargePlaylist ? "" : `
                                <a href="#/song?id=${songItem.id}" title="${songName}">
                                    <img class="rpic" src="${songItem.song.al.picUrl}?param=50y50&amp;quality=100" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5">
                                </a>`;
      const artistTdHTML = isLargePlaylist ? `
                    <td>
                        <div title="${artistText}" class="ncmextend-playlist-songalbum">
                            ${artistContent}
                        </div>
                    </td>` : "";
      const artistInSongTdHTML = isLargePlaylist ? "" : `
                                <div title="${artistText}" class="ncmextend-playlist-songartist">
							        <span title="${artistText}" class="txt" style="max-width: 78%;">
								        ${artistContent}
							        </span>
						        </div>`;
      const rowHTML = `
				<tr id="${songItem.id}${timestamp}" class="${index % 2 ? "" : "even"} ${status ? "js-dis" : ""}">
					<td>
						<div class="hd ">
                            <div class="ncmextend-playlist-songindex">
                                <span>${index + 1}</span>
                            </div>
                            <div class="ncmextend-playlist-playbtn">
                                ${playBtnHTML}
                            </div>
                        </div>
					</td>
					<td class="rank">
						<div class="f-cb">
							<div class="tt">${albumImgHTML}
								<div class="ncmextend-playlist-songtitle">
									<span class="txt" style="max-width: ${isLargePlaylist ? "100%" : "78%"};">
										<a href="#/song?id=${songItem.id}"><b title="${songName}${annotation ? ` - (${annotation})` : ""}"><div class="soil"></div>${songName}</b></a>
										${annotation ? `<span title="${annotation}" class="s-fc8">${annotation ? ` - (${annotation})` : ""}</span>` : ""}
										${songItem.song.mv ? `<a href="#/mv?id=${songItem.song.mv}" title="播放mv" class="mv">MV</a>` : ""}
									</span>
								</div>${artistInSongTdHTML}
							</div>
						</div>
					</td>${artistTdHTML}
                    <td>
						<div class="ncmextend-playlist-songalbum">
                            ${albumContent}
						</div>
					</td>
					<td class=" s-fc3">
						<span class="u-dur candel">${durationText}</span>
						<div class="opt hshow">
							<a class="u-icn u-icn-81 icn-add" href="javascript:;" title="添加到播放列表" hidefocus="true" data-res-type="18" data-res-id="${songItem.id}" data-res-action="addto" data-res-from="13" data-res-data="${this.playlist.id}"></a>
							<span data-res-id="${songItem.id}" data-res-type="18" data-res-action="fav" class="icn icn-fav" title="收藏"></span>
							<span data-res-id="${songItem.id}" data-res-type="18" data-res-action="share" data-res-name="${albumName}" data-res-author="${artistText}" data-res-pic="${songItem.song.al.picUrl}" class="icn icn-share" title="分享">分享</span>
							${deletable ? `<span data-res-id="${songItem.id}" data-res-type="18" data-res-from="13" data-res-data="${this.playlist.id}" data-res-action="delete" class="icn icn-del" title="删除">删除</span>` : ""}
						</div>
					</td>
				</tr>
			`;
      this.rowHTMLList.push(rowHTML);
    }
    deleteMoreInfoUI() {
      const seeMore = document.querySelector(".m-playlist-see-more");
      if (seeMore) seeMore.parentNode.removeChild(seeMore);
    }
    updateSongsCloudStatus(songIds) {
      songIds.forEach((songId) => {
        for (let i = 0; i < this.playlistSongList.length; i++) {
          if (this.playlistSongList[i].id === songId) {
            this.playlistSongList[i].privilege.cs = true;
            break;
          }
        }
      });
    }
  }
  const playlistDetailObj = new PlaylistDetail();
  class ArtistDetail {
    constructor() {
      this.dataFetched = false;
      this.artistSongList = [];
      this.artistSongUniqueMap = {};
      this.artistRes = null;
      const params2 = new URLSearchParams(unsafeWindow.location.search);
      this.artistId = Number(params2.get("id"));
    }
    onDomReady() {
      this.AppendBtns();
    }
    AppendBtns() {
      this.operationArea = document.querySelector("#content-operation");
      const btnSongsDownUpLoad = createBigButton("批量下载 & 转存", this.operationArea, 1);
      btnSongsDownUpLoad.addEventListener("click", () => {
        if (!this.dataFetched) {
          this.fetchArtistSongs();
        } else {
          showBatchManager(this.artistSongList, { listType: "artist", listId: this.artistId });
        }
      });
      this.operationArea.appendChild(btnSongsDownUpLoad);
    }
    fetchArtistSongs() {
      Swal.fire({
        input: "textarea",
        inputLabel: "获取歌手歌曲",
        confirmButtonText: "关闭",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        showConfirmButton: false,
        footer: `<div>将根据标题歌手时长进行一定的去重处理</div>`,
        inputAttributes: {
          "readonly": true
        },
        didOpen: async () => {
          const textarea = Swal.getInput();
          textarea.style = "height: 300px;";
          function addLog(log) {
            textarea.value += log + "\n";
            textarea.scrollTop = textarea.scrollHeight;
          }
          let offset = 0;
          const limit = 200;
          let more = true;
          while (more) {
            const content = await weapiRequestSync("/api/v2/artist/songs", {
              data: {
                id: this.artistId,
                offset,
                limit
              }
            });
            if (offset === 0) {
              addLog(`总共${content.total}首歌`);
            }
            addLog(`获取第${offset + 1}到第${offset + limit}首`);
            content.songs.forEach((song) => {
              song.al = {
                id: song.album.id,
                name: song.album.name,
                pic: song.album.pic,
                picUrl: song.album.picUrl,
                pic_str: song.album.picId_str,
                tns: song.album.alias
              };
              song.ar = song.artists.map((artist) => {
                return {
                  id: artist.id,
                  name: artist.name
                };
              });
              const songItem = {
                id: song.id,
                title: song.name,
                artist: getArtistTextInSongDetail(song),
                album: getAlbumTextInSongDetail(song),
                song,
                privilege: song.privilege
              };
              const songKey = this.getSongUniqueCode(songItem);
              if (!this.artistSongUniqueMap[songKey]) {
                this.artistSongUniqueMap[songKey] = [{ songs: [songItem], duration: songItem.song.duration }];
                this.artistSongList.push(songItem);
              } else {
                let found = false;
                for (const item of this.artistSongUniqueMap[songKey]) {
                  if (Math.abs(songItem.song.duration - item.duration) <= 1e3) {
                    if (songItem.privilege.cs) {
                      item.songs[0].privilege.cs = true;
                    }
                    if (item.songs[0].otherVersions) {
                      item.songs[0].otherVersions.push(songItem);
                    } else {
                      item.songs[0].otherVersions = [songItem];
                    }
                    item.songs.push(songItem);
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  this.artistSongUniqueMap[songKey].push({ songs: [songItem], duration: songItem.song.duration });
                  this.artistSongList.push(songItem);
                }
              }
            });
            offset += limit;
            more = content.more;
          }
          this.dataFetched = true;
          showBatchManager(this.artistSongList, { listType: "artist", listId: this.artistId });
        }
      });
    }
    updateSongsCloudStatus(songIds) {
      songIds.forEach((songId) => {
        for (let i = 0; i < this.artistSongList.length; i++) {
          if (this.artistSongList[i].id === songId) {
            this.artistSongList[i].privilege.cs = true;
            break;
          }
        }
      });
    }
    getSongUniqueCode(song) {
      const item = {
        name: song.song.name,
        artists: song.song.ar.map((a) => a.name).sort(),
        instrumental: (song.song.mark & 131072) === 131072,
        explicit: (song.song.mark & 1048576) === 1048576
      };
      return getMD5(JSON.stringify(item));
    }
  }
  const artistDetailObj = new ArtistDetail();
  const PlayAPIDataLimit = 1e3;
  const CheckAPIDataLimit = 100;
  const importAPIDataLimit = 10;
  class ncmDownUploadBatch {
    constructor(songs, config) {
      this.hasError = false;
      this.songs = songs;
      this.songIdIndexsMap = {};
      this.playerApiSongIds = [];
      this.downloadApiSongIds = [];
      for (let i = 0; i < songs.length; i++) {
        const songId = songs[i].id;
        this.songIdIndexsMap[songId] = i;
        if (!songs[i].api) {
          songs[i].api = songs[i].privilege.fee === 0 && (levelWeight[songs[i].privilege.plLevel] || 99) < (levelWeight[songs[i].privilege.dlLevel] || -1) ? { url: "/api/song/enhance/download/url/v1", data: { id: songs[i].id, level: config.level, encodeType: "mp3" } } : { url: "/api/song/enhance/player/url/v1", data: { ids: JSON.stringify([songs[i].id]), level: config.level, encodeType: "mp3" } };
        }
        if (songs[i].api.url === "/api/song/enhance/player/url/v1") {
          this.playerApiSongIds.push(songId);
        } else {
          this.downloadApiSongIds.push(songId);
        }
      }
      this.successSongsId = [];
      this.skipSongs = [];
      this.failSongs = [];
      this.config = config;
      this.log = "";
    }
    startUpload() {
      Swal.fire({
        input: "textarea",
        inputLabel: "批量转存云盘",
        confirmButtonText: "关闭",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        showConfirmButton: true,
        inputAttributes: {
          "readonly": true
        },
        footer: "<div>建议先在个人主页先设置好请求头，以避免上传失败</div><div>浏览器F12控制台中可查看所有的接口返回内容，出错时可进行检查。</div>",
        didOpen: () => {
          this.textarea = Swal.getInput();
          this.textarea.style = "height: 300px;";
          this.comfirmBtn = Swal.getConfirmButton();
          this.comfirmBtn.style = "display: none;";
          this.fetchFileDetail();
        }
      });
    }
    fetchFileDetail() {
      this.addLog(`将上传 ${this.songs.length} 首歌`);
      this.addLog("第一步：获取歌曲文件信息");
      if (this.playerApiSongIds.length > 0) {
        this.addLog("通过试听接口获取歌曲文件信息");
        this.fetchFileDetailByPlayerApi(0);
      } else {
        this.fetchFileDetailByDownloadApi();
      }
    }
    fetchFileDetailByPlayerApi(offset, retry = false) {
      if (offset >= this.playerApiSongIds.length) {
        this.addLog("通过试听接口获取歌曲文件信息完成");
        this.fetchFileDetailByDownloadApi();
        return;
      }
      this.addLog(`正在获取第 ${offset + 1} 到 第 ${Math.min(offset + PlayAPIDataLimit, this.playerApiSongIds.length)} 首歌曲`);
      const ids = this.playerApiSongIds.slice(offset, offset + PlayAPIDataLimit);
      weapiRequest("/api/song/enhance/player/url/v1", {
        data: {
          ids: JSON.stringify(ids),
          level: this.config.level,
          encodeType: "mp3"
        },
        onload: (content) => {
          if (content.code !== 200) {
            console.error("试听接口", content);
            if (!retry) {
              this.addLog("接口调用失败，1秒后重试");
              sleep(1e3).then(() => {
                this.fetchFileDetailByPlayerApi(offset, retry = true);
              });
            } else {
              this.addLog("接口调用失败，将跳过出错歌曲");
              this.hasError = true;
              sleep(1e3).then(() => {
                this.fetchFileDetailByPlayerApi(offset + PlayAPIDataLimit);
              });
            }
            return;
          }
          console.log("试听接口", content);
          content.data.forEach((songFileData) => {
            const songIndex = this.songIdIndexsMap[songFileData.id];
            if (this.config.targetLevelOnly && this.config.level !== songFileData.level) {
              if (this.songs[songIndex].api.url === "/api/song/enhance/player/url/v1") {
                this.skipSongs.push(this.songs[songIndex].title);
              }
            } else if (songFileData.md5) {
              this.songs[songIndex].fileFullName = nameFileWithoutExt(this.songs[songIndex].title, this.songs[songIndex].artist, "artist-title") + "." + songFileData.type.toLowerCase();
              this.songs[songIndex].md5 = songFileData.md5;
              this.songs[songIndex].size = songFileData.size;
              this.songs[songIndex].level = songFileData.level;
              this.songs[songIndex].ext = songFileData.type.toLowerCase();
              this.songs[songIndex].bitrate = Math.floor(songFileData.br / 1e3);
            } else {
              console.error("试听接口", this.songs[songIndex].title, songFileData);
              this.failSongs.push(this.songs[songIndex].title + "：通过试听接口获取文件信息失败");
            }
          });
          this.fetchFileDetailByPlayerApi(offset + PlayAPIDataLimit);
        },
        onerror: (content) => {
          console.error("试听接口", content);
          if (!retry) {
            this.addLog("试听接口调用时报错，1秒后重试");
            sleep(1e3).then(() => {
              this.fetchFileDetailByPlayerApi(offset, retry = true);
            });
          } else {
            this.addLog("试听接口调用时报错，将跳过出错歌曲");
            this.hasError = true;
            sleep(1e3).then(() => {
              this.fetchFileDetailByPlayerApi(offset + PlayAPIDataLimit);
            });
          }
        }
      });
    }
    fetchFileDetailByDownloadApi() {
      if (this.downloadApiSongIds.length > 0) {
        this.addLog("通过下载接口获取更好音质(非vip用户少数歌曲可获取到无损、HiRes音质)");
        this.fetchFileDetailByDownloadApiSub(0);
      } else {
        this.fetchCloudId();
      }
    }
    fetchFileDetailByDownloadApiSub(offset, retry = false) {
      if (offset >= this.downloadApiSongIds.length) {
        this.addLog("通过下载接口获取歌曲文件信息完成");
        this.fetchCloudId();
        return;
      }
      const songId = this.downloadApiSongIds[offset];
      const songIndex = this.songIdIndexsMap[songId];
      weapiRequest(
        "/api/song/enhance/download/url/v1",
        {
          data: this.songs[songIndex].api.data,
          onload: (content) => {
            if (content.code !== 200) {
              console.error("下载接口", content);
              if (!retry) {
                this.addLog("接口调用失败，1秒后重试");
                sleep(1e3).then(() => {
                  this.fetchFileDetailByDownloadApiSub(offset, retry = true);
                });
              } else {
                this.addLog(`歌曲 ${this.songs[songIndex].title} 下载接口调用失败，跳过`);
                this.failSongs.push(this.songs[songIndex].title + "：通过下载接口获取文件信息失败");
                this.hasError = true;
                sleep(1e3).then(() => {
                  this.fetchFileDetailByDownloadApiSub(offset + 1);
                });
              }
              return;
            }
            console.log("下载接口", content);
            if (this.config.targetLevelOnly && this.config.level !== content.data.level) {
              this.skipSongs.push(this.songs[songIndex].title);
            } else if (content.data.md5) {
              this.songs[songIndex].fileFullName = nameFileWithoutExt(this.songs[songIndex].title, this.songs[songIndex].artist, "artist-title") + "." + content.data.type.toLowerCase();
              this.songs[songIndex].md5 = content.data.md5;
              this.songs[songIndex].size = content.data.size;
              this.songs[songIndex].level = content.data.level;
              this.songs[songIndex].ext = content.data.type.toLowerCase();
              this.songs[songIndex].bitrate = Math.floor(content.data.br / 1e3);
              this.addLog(`${this.songs[songIndex].title} 通过下载接口获取到 ${levelDesc(content.data.level)} 音质文件信息`);
            } else {
              this.failSongs.push(this.songs[songIndex].title + "：通过下载接口获取文件信息失败");
            }
            this.fetchFileDetailByDownloadApiSub(offset + 1);
          },
          onerror: (content) => {
            console.error("下载接口", content);
            if (!retry) {
              this.addLog("下载接口调用时报错，1秒后重试");
              sleep(1e3).then(() => {
                this.fetchFileDetailByDownloadApiSub(offset, retry = true);
              });
            } else {
              this.addLog(`歌曲 ${this.songs[songIndex].title} 下载接口调用失败，跳过`);
              this.failSongs.push(this.songs[songIndex].title + "：通过下载接口获取文件信息失败");
              this.hasError = true;
              sleep(1e3).then(() => {
                this.fetchFileDetailByDownloadApiSub(offset + 1);
              });
            }
          }
        }
      );
    }
    fetchCloudId() {
      this.addLog("第二步：获取文件的云盘ID");
      this.fetchCloudIdSub(0);
    }
    fetchCloudIdSub(offset, retry = false) {
      if (offset >= this.songs.length) {
        this.addLog("获取文件的云盘ID完成");
        this.importSongs();
        return;
      }
      let songMD5Map = {};
      let songCheckDatas = [];
      let index = offset;
      while (index < this.songs.length && songCheckDatas.length < CheckAPIDataLimit) {
        let song = this.songs[index];
        if (song.md5) {
          songCheckDatas.push({
            md5: song.md5,
            songId: song.id,
            bitrate: song.bitrate,
            fileSize: song.size
          });
          songMD5Map[song.md5] = song.id;
        }
        index += 1;
      }
      this.addLog(`正在获取第 ${offset + 1} 到 第 ${index} 首歌曲`);
      if (songCheckDatas.length === 0) {
        this.fetchCloudIdSub(index);
        return;
      }
      weapiRequest("/api/cloud/upload/check/v2", {
        data: {
          uploadType: 0,
          songs: JSON.stringify(songCheckDatas)
        },
        onload: (content) => {
          if (content.code !== 200 || content.data.length === 0) {
            console.error("获取文件云盘ID接口", content);
            if (!retry) {
              this.addLog("接口调用失败，1秒后重试");
              sleep(1e3).then(() => {
                this.fetchCloudIdSub(offset, retry = true);
              });
            } else {
              this.addLog("接口调用失败，将跳过出错歌曲");
              this.hasError = true;
              sleep(1e3).then(() => {
                this.fetchCloudIdSub(index);
              });
            }
            return;
          }
          console.log("获取文件云盘ID接口", content);
          let hasFail = false;
          content.data.forEach((fileData) => {
            const songId = songMD5Map[fileData.md5];
            const songIndex = this.songIdIndexsMap[songId];
            if (fileData.upload === 1) {
              this.songs[songIndex].cloudId = fileData.songId;
            } else {
              this.failSongs.push(this.songs[songIndex].title);
              hasFail = true;
            }
          });
          if (hasFail) {
            console.error("获取文件云盘ID api", content);
          }
          this.fetchCloudIdSub(index);
        },
        onerror: (content) => {
          console.error("获取文件云盘ID接口", content);
          if (!retry) {
            this.addLog("调用接口时报错，1秒后重试");
            sleep(1e3).then(() => {
              this.fetchCloudIdSub(offset, retry = true);
            });
          } else {
            this.addLog("调用接口时报错，将跳过出错歌曲");
            this.hasError = true;
            sleep(1e3).then(() => {
              this.fetchCloudIdSub(index);
            });
          }
        }
      });
    }
    importSongs() {
      this.addLog("第三步：文件导入云盘");
      this.importSongsSub(0);
    }
    importSongsSub(offset, retry = false) {
      if (offset >= this.songs.length) {
        this.matchSongs();
        return;
      }
      let songCloudIdMap = {};
      let importSongDatas = [];
      let index = offset;
      while (index < this.songs.length && importSongDatas.length < importAPIDataLimit) {
        let song = this.songs[index];
        if (song.cloudId) {
          importSongDatas.push({
            songId: song.cloudId,
            bitrate: song.bitrate,
            song: song.title,
            artist: song.artist,
            album: song.album,
            fileName: song.fileFullName
          });
          songCloudIdMap[song.cloudId] = song.id;
        }
        index += 1;
      }
      if (importSongDatas.length === 0) {
        this.importSongsSub(index);
        return;
      }
      weapiRequest("/api/cloud/user/song/import", {
        data: {
          uploadType: 0,
          songs: JSON.stringify(importSongDatas)
        },
        onload: (content) => {
          if (content.code !== 200) {
            console.error("歌曲导入云盘接口", content);
            if (!retry) {
              this.addLog("接口调用失败，1秒后重试");
              sleep(1e3).then(() => {
                this.importSongsSub(offset, retry = true);
              });
            } else {
              this.addLog("接口调用失败，将跳过出错歌曲");
              this.hasError = true;
              sleep(1e3).then(() => {
                this.importSongsSub(index);
              });
            }
            return;
          }
          console.log("歌曲导入云盘接口", content);
          if (content.data.successSongs.length > 0) {
            content.data.successSongs.forEach((successSong) => {
              let songId = songCloudIdMap[successSong.songId];
              this.songs[this.songIdIndexsMap[songId]].cloudSongId = successSong.song.songId;
            });
            this.addLog(`导入${content.data.successSongs.length} 首歌曲`);
          }
          if (content.data.failed.length > 0) {
            console.error("导入歌曲接口，存在上传失败歌曲。", content.data.failed);
            content.data.failed.forEach((failSong) => {
              let songId = songCloudIdMap[failSong.songId];
              let songTItle = this.songs[this.songIdIndexsMap[songId]].title;
              if (failSong.msg) {
                songTItle += "：" + failSong.msg;
              }
              this.failSongs.push(songTItle);
            });
          }
          this.importSongsSub(index);
        },
        onerror: (content) => {
          console.error("歌曲导入云盘", content);
          if (!retry) {
            this.addLog("调用接口时报错，1秒后重试");
            sleep(1e3).then(() => {
              this.importSongsSub(offset, retry = true);
            });
          } else {
            this.addLog("调用接口时报错，将跳过出错歌曲");
            this.hasError = true;
            sleep(1e3).then(() => {
              this.importSongsSub(index);
            });
          }
        }
      });
    }
    matchSongs() {
      this.addLog("第四步：文件关联歌曲");
      this.matchSongsSub(0);
    }
    matchSongsSub(offset) {
      if (offset >= this.songs.length) {
        this.final();
        return;
      }
      const song = this.songs[offset];
      console.log("匹配歌曲", song);
      if (song.cloudSongId) {
        if (song.cloudSongId !== song.id) {
          weapiRequest("/api/cloud/user/song/match", {
            data: {
              songId: song.cloudSongId,
              adjustSongId: song.id
            },
            onload: (res) => {
              if (res.code !== 200) {
                console.error(song.title, "匹配歌曲", res);
                let songTItle = song.title;
                if (res.msg) {
                  songTItle += "：" + res.msg;
                }
                this.failSongs.push(songTItle);
              } else {
                this.successSongsId.push(song.id);
                this.addLog(`转存完成：${song.title}`);
              }
              this.matchSongsSub(offset + 1);
            },
            onerror: (res) => {
              console.error(song.title, "5.匹配歌曲", res);
              this.matchSongsSub(offset + 1);
            }
          });
        } else {
          this.successSongsId.push(song.id);
          this.addLog(`转存完成：${song.title}`);
          this.matchSongsSub(offset + 1);
        }
      } else {
        this.matchSongsSub(offset + 1);
      }
    }
    final() {
      this.addLog("上传结束");
      if (this.hasError) {
        this.addLog("调用接口时存在报错，跳过了部分歌曲。请尝试重新上传");
      }
      if (this.skipSongs.length > 0) {
        this.addLog(`有${this.skipSongs.length}首歌不是目标音质不进行上传`);
      }
      if (this.failSongs.length > 0) {
        this.addLog(`以下${this.failSongs.length}首歌上传失败：${this.failSongs.join()}`);
      }
      this.updateSongCloudStatus();
      this.comfirmBtn.style = "display: inline-block;";
    }
    addLog(log) {
      this.log += log + "\n";
      this.textarea.value = this.log;
      this.textarea.scrollTop = this.textarea.scrollHeight;
    }
updateSongCloudStatus() {
      if (this.successSongsId.length > 0) {
        if (this.config.listType === "playlist") {
          playlistDetailObj.updateSongsCloudStatus(this.successSongsId);
        } else if (this.config.listType === "album") {
          albumDetailObj.updateSongsCloudStatus(this.successSongsId);
        } else if (this.config.listType === "artist") {
          artistDetailObj.updateSongsCloudStatus(this.successSongsId);
        }
      }
    }
  }
  const API_ENDPOINTS = {
    songDetail: "/api/v3/song/detail",
    uploadCheck: "/api/cloud/upload/check/v2",
    songImport: "/api/cloud/user/song/import",
    songMatch: "/api/cloud/user/song/match",
    tokenAlloc: "/api/nos/token/alloc",
    uploadInfo: "/api/upload/cloud/info/v2",
    cloudPub: "/api/cloud/pub/v2"
  };
  const UPLOAD_TYPE = {
    needUpload: 1,
    alreadyInCloud: 0
  };
  const DEFAULT_PIC_URL = "http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg";
  const TOKEN_EXPIRE_TIME = 6e4;
  const BATCH_FETCH_SIZE = 1e3;
  const PAGINATION_LIMIT = 50;
  const MATCH_OFFSET_BASE = 131072;
  const UI_CLASSES = {
    uploadBtn: ".uploadbtn",
    reuploadBtn: ".reuploadbtn",
    songRemark: ".song-remark",
    filterInput: "#text-filter",
    unmatchCheckbox: "#cb-unmatch",
    copyrightCheckbox: "#cb-copyright",
    freeCheckbox: "#cb-free",
    vipCheckbox: "#cb-vip",
    payCheckbox: "#cb-pay",
    instrumentalCheckbox: "#cb-instrumental",
    liveCheckbox: "#cb-live",
    losslessCheckbox: "#cb-lossless",
    uploadBatchBtn: "#btn-upload-batch"
  };
  const UPLOAD_MESSAGES = {
    checkResource: "1.检查资源",
    importFile: "2.导入文件",
    submitFile: "3.提交文件",
    encoding: "3.正在转码",
    publishResource: "4.发布资源",
    matchSong: "5.匹配歌曲",
    cannotUpload: "文件无法上传",
    uploadSuccess: "上传成功",
    uploadFail: "上传失败",
    noSongs: "没有需要上传的歌曲",
    batchComplete: "批量上传完成",
    associateFail: "文件关联失败",
    interfaceFail: "接口调用失败，1秒后重试"
  };
  class Uploader {
    constructor(config, showAll = false) {
      this.config = config;
      this.songs = [];
      this.popupObj = null;
      this.btnUploadBatch = null;
      this.initFilterState();
      this.initPageState();
      this.initBatchUploadState();
    }
    initFilterState() {
      this.filter = {
        text: "",
        unmatch: true,
        noCopyright: true,
        free: true,
        vip: true,
        pay: true,
        instrumental: true,
        live: true,
        lossless: false,
        songIndexs: []
      };
    }
    initPageState() {
      this.page = {
        current: 1,
        max: 1,
        limitCount: PAGINATION_LIMIT
      };
    }
    initBatchUploadState() {
      this.batchUpload = {
        working: false,
        stopFlag: false,
        songIndexs: [],
        checkOffset: 0,
        importOffset: 0,
        matchOffset: 0
      };
    }
    start() {
      this.showPopup();
    }
    showPopup() {
      Swal.fire({
        showCloseButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        width: "980px",
        html: this.getPopupHtml(),
        footer: "<div></div>",
        didOpen: () => this.onPopupOpen(),
        willClose: () => {
          this.batchUpload.stopFlag = true;
        }
      });
    }
    getPopupHtml() {
      const tableStyles = this.getTableStyles();
      const filterCheckboxes = this.getFilterCheckboxesHtml();
      return `<style>${tableStyles}</style>
<input id="text-filter" class="swal2-input" placeholder="过滤：标题/歌手/专辑">
<div id="my-cbs">${filterCheckboxes}</div>
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upload-batch">全部上传</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th></th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>备注</th></tr></thead><tbody></tbody></table>`;
    }
    getTableStyles() {
      return `
    table {
        width: 100%;
        border-spacing: 0px;
        border-collapse: collapse;
        border: 2px solid #f0f0f0;
    }
    table th, table td {
        text-align: left;
        text-overflow: ellipsis;
    }
    table tbody {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    table thead tr, table tbody tr, table tfoot tr {
        box-sizing: border-box;
        table-layout: fixed;
        display: table;
        width: 100%;
    }
    table tbody tr td { border-bottom: none; }
    tr th:nth-child(1), tr td:nth-child(1) { width: 6%; }
    tr th:nth-child(2), tr td:nth-child(2) { width: 6%; }
    tr th:nth-child(3), tr td:nth-child(3) { width: 25%; }
    tr th:nth-child(4), tr td:nth-child(4) { width: 25%; }
    tr th:nth-child(5), tr td:nth-child(5) { width: 8%; }
    tr th:nth-child(6), tr td:nth-child(6) { width: 15%; }
    tr th:nth-child(7), tr td:nth-child(7) { width: 15%; }
        `;
    }
    getFilterCheckboxesHtml() {
      const filters = [
        { id: "cb-unmatch", label: "未关联" },
        { id: "cb-copyright", label: "无版权" },
        { id: "cb-free", label: "免费" },
        { id: "cb-vip", label: "VIP" },
        { id: "cb-pay", label: "数字专辑" },
        { id: "cb-instrumental", label: "纯音乐" },
        { id: "cb-live", label: "live版" },
        { id: "cb-lossless", label: "仅显示flac文件", checked: false }
      ];
      return filters.map(
        (f) => `<input class="form-check-input" type="checkbox" value="" id="${f.id}" ${f.checked !== false ? "checked" : ""}><label class="form-check-label" for="${f.id}">${f.label}</label>`
      ).join("");
    }
    onPopupOpen() {
      const container = Swal.getHtmlContainer();
      const footer = Swal.getFooter();
      const tbody = container.querySelector("tbody");
      this.popupObj = { container, tbody, footer };
      this.setupFilterListeners(container);
      this.btnUploadBatch = container.querySelector(UI_CLASSES.uploadBatchBtn);
      this.setupBatchUploadListener();
      this.fetchSongInfo();
    }
    setupFilterListeners(container) {
      const filterInput = container.querySelector(UI_CLASSES.filterInput);
      filterInput.addEventListener("change", () => {
        const filtertext = filterInput.value.trim();
        if (this.filter.text !== filtertext) {
          this.filter.text = filtertext;
          this.applyFilter();
        }
      });
      const filterMap = [
        { selector: UI_CLASSES.unmatchCheckbox, property: "unmatch" },
        { selector: UI_CLASSES.copyrightCheckbox, property: "noCopyright" },
        { selector: UI_CLASSES.freeCheckbox, property: "free" },
        { selector: UI_CLASSES.vipCheckbox, property: "vip" },
        { selector: UI_CLASSES.payCheckbox, property: "pay" },
        { selector: UI_CLASSES.instrumentalCheckbox, property: "instrumental" },
        { selector: UI_CLASSES.liveCheckbox, property: "live" },
        { selector: UI_CLASSES.losslessCheckbox, property: "lossless" }
      ];
      filterMap.forEach(({ selector, property }) => {
        const input = container.querySelector(selector);
        input.addEventListener("change", () => {
          this.filter[property] = input.checked;
          this.applyFilter();
        });
      });
    }
    setupBatchUploadListener() {
      this.btnUploadBatch.addEventListener("click", () => {
        if (this.batchUpload.working) {
          this.batchUpload.stopFlag = true;
          this.btnUploadBatch.innerHTML = "正在停止";
          return;
        }
        const uploadIndexes = this.getUploadableIndexes();
        if (uploadIndexes.length === 0) {
          showTips(UPLOAD_MESSAGES.noSongs, 1);
          return;
        }
        this.startBatchUpload(uploadIndexes);
      });
    }
    getUploadableIndexes() {
      const indexes = [];
      this.filter.songIndexs.forEach((idx) => {
        const song = this.songs[idx];
        if (!song.uploaded && song.uploadType !== UPLOAD_TYPE.alreadyInCloud) {
          indexes.push(idx);
        }
      });
      return indexes;
    }
    startBatchUpload(uploadIndexes) {
      this.batchUpload.songIndexs = uploadIndexes;
      this.batchUpload.working = true;
      this.batchUpload.stopFlag = false;
      this.batchUpload.checkOffset = 0;
      this.batchUpload.importOffset = 0;
      this.batchUpload.matchOffset = 0;
      this.btnUploadBatch.innerHTML = "停止";
      this.uploadSongBatch();
    }
    fetchSongInfo() {
      const ids = this.config.data.map((item) => ({ id: item.id }));
      this.popupObj.tbody.innerHTML = "<div>正在获取歌曲信息</div><div>并排除已上传的歌曲</div>";
      this.fetchSongInfoSub(ids, 0);
    }
    fetchSongInfoSub(ids, startIndex) {
      if (startIndex >= ids.length) {
        this.onSongInfoFetched();
        return;
      }
      this.updateFetchProgress(startIndex, ids.length);
      const batchIds = ids.slice(startIndex, startIndex + BATCH_FETCH_SIZE);
      weapiRequest(API_ENDPOINTS.songDetail, {
        data: { c: JSON.stringify(batchIds) },
        onload: (content) => this.onSongDetailResponse(content, ids, startIndex),
        onerror: () => this.fetchSongInfoSub(ids, startIndex)
      });
    }
    updateFetchProgress(startIndex, totalLength) {
      const endIndex = Math.min(totalLength, startIndex + BATCH_FETCH_SIZE);
      this.popupObj.tbody.innerHTML = `<div>正在获取第${startIndex + 1}到${endIndex}首歌曲信息</div><div>并排除已上传的歌曲</div>`;
    }
    onSongDetailResponse(content, ids, startIndex) {
      if (content.code !== 200 || !content.songs) {
        setTimeout(() => this.fetchSongInfoSub(ids, startIndex), 1e3);
        return;
      }
      const songMap = this.buildSongMap(content.songs);
      content.privileges.forEach((privilege) => {
        if (!privilege.cs) {
          const config = this.config.data.find((item) => item.id === privilege.id);
          const song = this.buildSongItem(privilege, config, songMap);
          this.songs.push(song);
        }
      });
      this.fetchSongInfoSub(ids, startIndex + BATCH_FETCH_SIZE);
    }
    buildSongMap(songs) {
      const map = {};
      songs.forEach((song) => {
        map[song.id] = song;
      });
      return map;
    }
    buildSongItem(privilege, config, songMap) {
      const songId = privilege.id;
      const songDetail = songMap[songId];
      const item = {
        id: songId,
        name: "未知",
        album: "未知",
        albumid: 0,
        artists: "未知",
        tns: "",
        dt: duringTimeDesc(0),
        filename: "未知." + config.ext,
        ext: config.ext,
        md5: config.md5,
        size: config.size,
        bitrate: config.bitrate,
        picUrl: DEFAULT_PIC_URL,
        isNoCopyright: privilege.st < 0,
        isVIP: false,
        isPay: false,
        isLive: config.name ? liveRegex.test(config.name.toLowerCase()) : false,
        isInstrumental: false,
        uploaded: false,
        needMatch: config.name === void 0 && songDetail
      };
      if (songDetail) {
        this.enrichSongItemFromDetail(item, songDetail, config);
      }
      if (config.name) {
        item.name = config.name;
        item.album = config.al;
        item.artists = config.ar;
        item.filename = nameFileWithoutExt(item.name, item.artists, "artist-title") + "." + config.ext;
      }
      return item;
    }
    enrichSongItemFromDetail(item, songDetail, config) {
      var _a, _b;
      item.name = songDetail.name || item.name;
      item.album = getAlbumTextInSongDetail(songDetail);
      item.albumid = ((_a = songDetail.al) == null ? void 0 : _a.id) || 0;
      item.artists = getArtistTextInSongDetail(songDetail);
      item.tns = songDetail.tns ? songDetail.tns.join() : "";
      item.dt = duringTimeDesc(songDetail.dt || 0);
      item.filename = nameFileWithoutExt(item.name, item.artists, "artist-title") + "." + config.ext;
      item.picUrl = ((_b = songDetail.al) == null ? void 0 : _b.picUrl) || DEFAULT_PIC_URL;
      item.isVIP = songDetail.fee === 1;
      item.isPay = songDetail.fee === 4;
      item.isLive = item.name ? liveRegex.test(item.name.toLowerCase()) : false;
      item.isInstrumental = (songDetail.mark & MATCH_OFFSET_BASE) === MATCH_OFFSET_BASE || item.name && item.name.includes("伴奏") || item.name && item.name.toLowerCase().includes("Instrumental");
    }
    onSongInfoFetched() {
      if (this.songs.length === 0) {
        this.popupObj.tbody.innerHTML = "没有可以上传的歌曲";
        return;
      }
      this.songs.sort((a, b) => {
        if (a.albumid !== b.albumid) {
          return b.albumid - a.albumid;
        }
        return a.id - b.id;
      });
      this.createTableRows();
      this.applyFilter();
    }
    createTableRows() {
      this.songs.forEach((song, i) => {
        song.tablerow = this.createSingleTableRow(song, i);
      });
    }
    createSingleTableRow(song, index) {
      const tr = document.createElement("tr");
      tr.innerHTML = this.getSongTableRowHtml(song);
      const uploadBtn = tr.querySelector(UI_CLASSES.uploadBtn);
      uploadBtn.addEventListener("click", () => {
        if (!this.batchUpload.working) {
          this.uploadSong(index);
        }
      });
      const reuploadBtn = tr.querySelector(UI_CLASSES.reuploadBtn);
      reuploadBtn.addEventListener("click", () => {
        if (!this.batchUpload.working) {
          this.uploadSongWay2Part1(index);
        }
      });
      this.setSongRemarkHtml(tr, song);
      return tr;
    }
    getSongTableRowHtml(song) {
      return `<td><button type="button" class="swal2-styled uploadbtn"><i class="fa-solid fa-cloud-arrow-up"></i></button><button type="button" class="swal2-styled reuploadbtn" style="display: none" title="重新上传并关联到此歌曲"><i class="fa-solid fa-repeat"></i></button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${song.dt}</td><td>${fileSizeDesc(song.size)} ${song.ext.toUpperCase()}</td><td class="song-remark"></td>`;
    }
    setSongRemarkHtml(tr, song) {
      const remarkElement = tr.querySelector(UI_CLASSES.songRemark);
      if (song.isNoCopyright) {
        remarkElement.innerHTML = "无版权";
      } else if (song.isVIP) {
        remarkElement.innerHTML = "VIP";
      } else if (song.isPay) {
        remarkElement.innerHTML = "数字专辑";
      }
    }
    applyFilter() {
      this.filter.songIndexs = [];
      const { text, unmatch, noCopyright, free, vip, pay, instrumental, live, lossless } = this.filter;
      for (let i = 0; i < this.songs.length; i++) {
        const song = this.songs[i];
        if (text.length > 0 && !this.matchesSearchText(song, text)) {
          continue;
        }
        if (lossless && song.ext !== "flac") {
          continue;
        }
        if (!instrumental && song.isInstrumental) continue;
        if (!live && song.isLive) continue;
        if (this.matchesSongTypeFilter(song, unmatch, noCopyright, free, vip, pay)) {
          this.filter.songIndexs.push(i);
        }
      }
      this.page.current = 1;
      this.page.max = Math.ceil(this.filter.songIndexs.length / this.page.limitCount);
      this.renderData();
      this.renderFilterInfo();
    }
    matchesSearchText(song, searchText) {
      return song.name.includes(searchText) || song.album.includes(searchText) || song.artists.includes(searchText) || song.tns.includes(searchText);
    }
    matchesSongTypeFilter(song, unmatch, noCopyright, free, vip, pay) {
      if (unmatch && !song.needMatch) return true;
      if (noCopyright && song.isNoCopyright) return true;
      if (free && !song.isVIP && !song.isPay) return true;
      if (vip && song.isVIP) return true;
      if (pay && song.isPay) return true;
      return false;
    }
    renderData() {
      if (this.filter.songIndexs.length === 0) {
        this.popupObj.tbody.innerHTML = "空空如也";
        this.popupObj.footer.innerHTML = "";
        return;
      }
      this.renderTable();
      this.renderPagination();
    }
    renderTable() {
      this.popupObj.tbody.innerHTML = "";
      const songBegin = (this.page.current - 1) * this.page.limitCount;
      const songEnd = Math.min(this.filter.songIndexs.length, songBegin + this.page.limitCount);
      for (let i = songBegin; i < songEnd; i++) {
        this.popupObj.tbody.appendChild(this.songs[this.filter.songIndexs[i]].tablerow);
      }
    }
    renderPagination() {
      const pageIndexs = this.getPageIndexes();
      this.popupObj.footer.innerHTML = "";
      pageIndexs.forEach((pageIndex) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "swal2-styled";
        btn.innerHTML = pageIndex;
        if (pageIndex === this.page.current) {
          btn.style.background = "white";
        } else {
          btn.addEventListener("click", () => {
            this.page.current = pageIndex;
            this.renderData();
          });
        }
        this.popupObj.footer.appendChild(btn);
      });
    }
    getPageIndexes() {
      const pageIndexs = [1];
      const floor = Math.max(2, this.page.current - 2);
      const ceil = Math.min(this.page.max - 1, this.page.current + 2);
      for (let i = floor; i <= ceil; i++) {
        pageIndexs.push(i);
      }
      if (this.page.max > 1) {
        pageIndexs.push(this.page.max);
      }
      return pageIndexs;
    }
    renderFilterInfo() {
      let sizeTotal = 0;
      let countCanUpload = 0;
      this.filter.songIndexs.forEach((idx) => {
        const song = this.songs[idx];
        if (!song.uploaded && song.uploadType !== UPLOAD_TYPE.alreadyInCloud) {
          countCanUpload += 1;
          sizeTotal += song.size;
        }
      });
      this.btnUploadBatch.innerHTML = "全部上传";
      if (countCanUpload > 0) {
        this.btnUploadBatch.innerHTML += ` (${countCanUpload}首 ${fileSizeDesc(sizeTotal)})`;
      }
    }
    setReUploadButtonViewable(songIndex) {
      const song = this.songs[songIndex];
      const uploadBtn = song.tablerow.querySelector(UI_CLASSES.uploadBtn);
      const reuploadBtn = song.tablerow.querySelector(UI_CLASSES.reuploadBtn);
      uploadBtn.style.display = "none";
      reuploadBtn.style.display = "";
      this.setSongRemark(song, "文件已在云盘但没有关联到目标歌曲，点击按钮重新上传并关联。");
    }
    setSongUploaded(song) {
      song.uploaded = true;
      const btnSelector = song.uploadType === UPLOAD_TYPE.alreadyInCloud ? UI_CLASSES.reuploadBtn : UI_CLASSES.uploadBtn;
      const btn = song.tablerow.querySelector(btnSelector);
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      btn.disabled = true;
    }
    setSongRemark(song, remark) {
      const markElement = song.tablerow.querySelector(UI_CLASSES.songRemark);
      if (markElement) {
        markElement.innerHTML = remark;
      }
    }
uploadSong(songIndex) {
      const song = this.songs[songIndex];
      if (song.cloudId) {
        if (song.uploadType === UPLOAD_TYPE.needUpload) {
          this.uploadSongImport(songIndex);
        } else if (song.uploadType === UPLOAD_TYPE.alreadyInCloud) {
          this.uploadSongWay2Part1(songIndex);
        }
        return;
      }
      try {
        const songCheckData = [{
          md5: song.md5,
          songId: song.id,
          bitrate: song.bitrate,
          fileSize: song.size
        }];
        weapiRequest(API_ENDPOINTS.uploadCheck, {
          data: {
            uploadType: 0,
            songs: JSON.stringify(songCheckData)
          },
          onload: (res) => this.onUploadCheckResponse(res, songIndex),
          onerror: () => this.onUploadFail(songIndex)
        });
      } catch (e2) {
        console.error(e2);
        this.onUploadFail(songIndex);
      }
    }
    onUploadCheckResponse(res, songIndex) {
      const song = this.songs[songIndex];
      if (res.code !== 200 || res.data.length < 1) {
        if (res.code !== 200) {
          console.error(song.name, UPLOAD_MESSAGES.checkResource, res);
          this.onUploadFail(songIndex);
        } else if (song.id > 0) {
          song.id = 0;
          this.uploadSong(songIndex);
        } else {
          console.error(song.name, UPLOAD_MESSAGES.checkResource, res);
          this.onUploadFail(songIndex);
        }
        return;
      }
      console.log(song.name, UPLOAD_MESSAGES.checkResource, res);
      song.uploadType = res.data[0].upload;
      if (song.uploadType === UPLOAD_TYPE.needUpload) {
        showTips(`(1/3)${song.name} ${UPLOAD_MESSAGES.checkResource}`, 1);
        song.cloudId = res.data[0].songId;
        this.uploadSongImport(songIndex);
      } else if (song.uploadType === UPLOAD_TYPE.alreadyInCloud) {
        this.setReUploadButtonViewable(songIndex);
        song.cloudId = res.data[0].songId;
        this.onUploadFinish();
      } else {
        console.error(song.name, UPLOAD_MESSAGES.checkResource, res);
        showTips(`(1/3)${song.name} ${UPLOAD_MESSAGES.cannotUpload}`, 2);
        song.uploaded = true;
        const btnUpload = song.tablerow.querySelector(UI_CLASSES.uploadBtn);
        btnUpload.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        btnUpload.disabled = true;
        this.setSongRemark(song, UPLOAD_MESSAGES.cannotUpload);
        this.onUploadFinish();
      }
    }
    uploadSongImport(songIndex) {
      const song = this.songs[songIndex];
      if (song.cloudSongId) {
        this.uploadSongMatch(songIndex);
        return;
      }
      const importSongData = [{
        songId: song.cloudId,
        bitrate: song.bitrate,
        song: song.name,
        artist: song.artists,
        album: song.album,
        fileName: song.filename
      }];
      try {
        weapiRequest(API_ENDPOINTS.songImport, {
          data: {
            uploadType: 0,
            songs: JSON.stringify(importSongData)
          },
          onload: (res) => this.onSongImportResponse(res, songIndex),
          onerror: () => this.onUploadFail(songIndex)
        });
      } catch (e2) {
        console.error(e2);
        this.onUploadFail(songIndex);
      }
    }
    onSongImportResponse(res, songIndex) {
      const song = this.songs[songIndex];
      if (res.code !== 200 || res.data.successSongs.length < 1) {
        console.error(song.name, UPLOAD_MESSAGES.importFile, res);
        this.onUploadFail(songIndex);
        return;
      }
      console.log(song.name, UPLOAD_MESSAGES.importFile, res);
      song.cloudSongId = res.data.successSongs[0].song.songId;
      this.uploadSongMatch(songIndex);
    }
    uploadSongMatch(songIndex) {
      const song = this.songs[songIndex];
      if (song.cloudSongId === song.id || song.id <= 0) {
        this.onUploadSuccess(songIndex);
        return;
      }
      weapiRequest(API_ENDPOINTS.songMatch, {
        data: {
          songId: song.cloudSongId,
          adjustSongId: song.id
        },
        onload: (res) => this.onSongMatchResponse(res, songIndex),
        onerror: () => this.onUploadFail(songIndex)
      });
    }
    onSongMatchResponse(res, songIndex) {
      const song = this.songs[songIndex];
      if (res.code !== 200) {
        console.error(song.name, UPLOAD_MESSAGES.matchSong, res);
        showTips(`${song.name}${UPLOAD_MESSAGES.uploadSuccess}，但是${UPLOAD_MESSAGES.associateFail}`, 2);
        this.setSongUploaded(song);
        this.setSongRemark(song, UPLOAD_MESSAGES.associateFail);
        this.onUploadFinish();
        return;
      }
      console.log(song.name, UPLOAD_MESSAGES.matchSong, res);
      this.onUploadSuccess(songIndex);
    }
    uploadSongWay2Part1(songIndex) {
      const song = this.songs[songIndex];
      try {
        weapiRequest(API_ENDPOINTS.tokenAlloc, {
          data: {
            filename: song.filename,
            length: song.size,
            ext: song.ext,
            type: "audio",
            bucket: "jd-musicrep-privatecloud-audio-public",
            local: false,
            nos_product: 3,
            md5: song.md5
          },
          onload: (tokenRes) => this.onTokenAllocResponse(tokenRes, songIndex),
          onerror: () => this.onUploadFail(songIndex)
        });
      } catch (e2) {
        console.error(e2);
        this.onUploadFail(songIndex);
      }
    }
    onTokenAllocResponse(tokenRes, songIndex) {
      const song = this.songs[songIndex];
      song.token = tokenRes.result.token;
      song.objectKey = tokenRes.result.objectKey;
      song.resourceId = tokenRes.result.resourceId;
      song.expireTime = Date.now() + TOKEN_EXPIRE_TIME;
      console.log(song.name, "2.2.开始上传", tokenRes);
      this.uploadSongWay2Part2(songIndex);
    }
    uploadSongWay2Part2(songIndex) {
      const song = this.songs[songIndex];
      weapiRequest(API_ENDPOINTS.uploadInfo, {
        data: {
          md5: song.md5,
          songid: song.cloudId,
          filename: song.filename,
          song: song.name,
          album: song.album,
          artist: song.artists,
          bitrate: String(song.bitrate || 128),
          resourceId: song.resourceId
        },
        onload: (res3) => this.onUploadInfoResponse(res3, songIndex),
        onerror: () => this.onUploadFail(songIndex)
      });
    }
    onUploadInfoResponse(res3, songIndex) {
      const song = this.songs[songIndex];
      if (res3.code !== 200) {
        if (song.expireTime < Date.now() || res3.msg && res3.msg.includes("rep create failed")) {
          console.error(song.name, UPLOAD_MESSAGES.submitFile, res3);
          this.onUploadFail(songIndex);
        } else {
          console.log(song.name, UPLOAD_MESSAGES.encoding, res3);
          sleep(1e3).then(() => this.uploadSongWay2Part2(songIndex));
        }
        return;
      }
      console.log(song.name, UPLOAD_MESSAGES.submitFile, res3);
      weapiRequest(API_ENDPOINTS.cloudPub, {
        data: { songid: res3.songId },
        onload: (res4) => this.onCloudPublishResponse(res4, songIndex),
        onerror: () => this.onUploadFail(songIndex)
      });
    }
    onCloudPublishResponse(res4, songIndex) {
      const song = this.songs[songIndex];
      if (res4.code !== 200 && res4.code !== 201) {
        console.error(song.name, UPLOAD_MESSAGES.publishResource, res4);
        this.onUploadFail(songIndex);
        return;
      }
      console.log(song.name, UPLOAD_MESSAGES.publishResource, res4);
      song.cloudSongId = res4.privateCloud.songId;
      this.uploadSongMatch(songIndex);
    }
    onUploadSuccess(songIndex) {
      const song = this.songs[songIndex];
      showTips(`${song.name} - ${song.artists} - ${song.album} ${UPLOAD_MESSAGES.uploadSuccess}`, 1);
      this.setSongUploaded(song);
      this.onUploadFinish();
    }
    onUploadFail(songIndex) {
      const song = this.songs[songIndex];
      showTips(`${song.name} - ${song.artists} - ${song.album} ${UPLOAD_MESSAGES.uploadFail}`, 2);
      this.onUploadFinish();
    }
    onUploadFinish() {
      this.renderFilterInfo();
    }
uploadSongBatch(retry = false) {
      if (this.batchUpload.checkOffset >= this.batchUpload.songIndexs.length) {
        this.onBatchUploadFinish();
        showTips(UPLOAD_MESSAGES.batchComplete, 1);
        return;
      }
      if (this.batchUpload.stopFlag) {
        this.onBatchUploadFinish();
        return;
      }
      const { songCheckDatas, songMD5IndexMap, endIndex } = this.buildBatchCheckData();
      weapiRequest(API_ENDPOINTS.uploadCheck, {
        data: {
          uploadType: 0,
          songs: JSON.stringify(songCheckDatas)
        },
        onload: (content) => this.onBatchCheckResponse(content, songMD5IndexMap, endIndex, retry),
        onerror: () => this.onBatchCheckError(endIndex, retry)
      });
    }
    buildBatchCheckData() {
      const songMD5IndexMap = {};
      const songCheckDatas = [];
      let indexOfSongIndexs = this.batchUpload.checkOffset;
      const endIndex = Math.min(this.batchUpload.songIndexs.length, this.batchUpload.checkOffset + CheckAPIDataLimit);
      while (indexOfSongIndexs < endIndex) {
        const songIndex = this.batchUpload.songIndexs[indexOfSongIndexs];
        const song = this.songs[songIndex];
        songCheckDatas.push({
          md5: song.md5,
          songId: song.id,
          bitrate: song.bitrate,
          fileSize: song.size
        });
        songMD5IndexMap[song.md5] = songIndex;
        indexOfSongIndexs += 1;
      }
      return { songCheckDatas, songMD5IndexMap, endIndex };
    }
    onBatchCheckResponse(content, songMD5IndexMap, endIndex, retry) {
      if (content.code !== 200 || content.data.length === 0) {
        console.error("获取文件云盘ID接口", content);
        if (!retry) {
          showTips(UPLOAD_MESSAGES.interfaceFail, 2);
          sleep(1e3).then(() => this.uploadSongBatch(true));
        } else {
          this.batchUpload.checkOffset = endIndex;
          this.uploadSongBatch();
        }
        return;
      }
      showTips(`获取第 ${this.batchUpload.checkOffset + 1} 到 第 ${endIndex} 首歌曲云盘ID`, 1);
      console.log("获取文件云盘ID接口", content);
      content.data.forEach((fileData) => {
        const songIndex = songMD5IndexMap[fileData.md5];
        this.songs[songIndex].uploadType = fileData.upload;
        this.songs[songIndex].cloudId = fileData.songId;
        if (fileData.upload === UPLOAD_TYPE.alreadyInCloud) {
          this.setReUploadButtonViewable(songIndex);
        } else if (fileData.upload > UPLOAD_TYPE.needUpload) {
          this.songs[songIndex].uploaded = true;
          const btnUpload = this.songs[songIndex].tablerow.querySelector(UI_CLASSES.uploadBtn);
          btnUpload.innerHTML = '<i class="fa-solid fa-xmark"></i>';
          this.setSongRemark(this.songs[songIndex], UPLOAD_MESSAGES.cannotUpload);
          btnUpload.disabled = true;
        }
      });
      this.batchUpload.checkOffset = endIndex;
      this.uploadSongImportBatch();
    }
    onBatchCheckError(endIndex, retry) {
      console.error("获取文件云盘ID接口错误");
      if (!retry) {
        showTips(UPLOAD_MESSAGES.interfaceFail, 2);
        sleep(1e3).then(() => this.uploadSongBatch(true));
      } else {
        this.batchUpload.checkOffset = endIndex;
        this.uploadSongBatch();
      }
    }
    uploadSongImportBatch(retry = false) {
      if (this.batchUpload.importOffset >= this.batchUpload.checkOffset) {
        this.uploadSongBatch();
        return;
      }
      if (this.batchUpload.stopFlag) {
        this.onBatchUploadFinish();
        return;
      }
      const { importSongDatas, songCloudIdIndexMap, maxIndex } = this.buildBatchImportData();
      weapiRequest(API_ENDPOINTS.songImport, {
        data: {
          uploadType: 0,
          songs: JSON.stringify(importSongDatas)
        },
        onload: (content) => this.onBatchImportResponse(content, songCloudIdIndexMap, maxIndex, retry),
        onerror: () => this.onBatchImportError(maxIndex, retry)
      });
    }
    buildBatchImportData() {
      const songCloudIdIndexMap = {};
      const importSongDatas = [];
      let indexOfSongIndexs = this.batchUpload.importOffset;
      const maxIndex = Math.min(this.batchUpload.checkOffset, this.batchUpload.importOffset + importAPIDataLimit);
      while (indexOfSongIndexs < maxIndex) {
        const songIndex = this.batchUpload.songIndexs[indexOfSongIndexs];
        const song = this.songs[songIndex];
        if ("cloudId" in song) {
          importSongDatas.push({
            songId: song.cloudId,
            bitrate: song.bitrate,
            song: song.name,
            artist: song.artists,
            album: song.album,
            fileName: song.filename
          });
          songCloudIdIndexMap[song.cloudId] = songIndex;
        }
        indexOfSongIndexs += 1;
      }
      return { importSongDatas, songCloudIdIndexMap, maxIndex };
    }
    onBatchImportResponse(content, songCloudIdIndexMap, maxIndex, retry) {
      if (content.code !== 200) {
        console.error("歌曲导入云盘接口", content);
        if (!retry) {
          showTips(UPLOAD_MESSAGES.interfaceFail, 1);
          sleep(1e3).then(() => this.uploadSongImportBatch(true));
        } else {
          this.batchUpload.importOffset = maxIndex;
          this.uploadSongImportBatch();
        }
        return;
      }
      console.log("歌曲导入云盘接口", content);
      if (content.data.successSongs.length > 0) {
        const successSongNames = [];
        content.data.successSongs.forEach((successSong) => {
          const song = this.songs[songCloudIdIndexMap[successSong.songId]];
          song.cloudSongId = successSong.song.songId;
          if (song.cloudSongId === song.id) {
            this.setSongUploaded(song);
            successSongNames.push(song.name);
          }
        });
        showTips(`成功上传${successSongNames.length}首:${successSongNames.join("、")}`, 1);
      }
      this.batchUpload.importOffset = maxIndex;
      this.uploadSongMatchBatch();
    }
    onBatchImportError(maxIndex, retry) {
      console.error("歌曲导入云盘错误");
      if (!retry) {
        showTips(UPLOAD_MESSAGES.interfaceFail, 1);
        sleep(1e3).then(() => this.uploadSongImportBatch(true));
      } else {
        this.batchUpload.importOffset = maxIndex;
        this.uploadSongImportBatch();
      }
    }
    uploadSongMatchBatch(retry = false) {
      if (this.batchUpload.matchOffset >= this.batchUpload.importOffset) {
        this.uploadSongImportBatch();
        return;
      }
      const songIndex = this.batchUpload.songIndexs[this.batchUpload.matchOffset];
      const song = this.songs[songIndex];
      if (!("cloudSongId" in song) || song.cloudSongId === song.id || song.id <= 0) {
        this.batchUpload.matchOffset += 1;
        this.uploadSongMatchBatch();
        return;
      }
      weapiRequest(API_ENDPOINTS.songMatch, {
        data: {
          songId: song.cloudSongId,
          adjustSongId: song.id
        },
        onload: (res5) => this.onBatchMatchResponse(res5, songIndex, retry),
        onerror: () => this.onBatchMatchError(songIndex, retry)
      });
    }
    onBatchMatchResponse(res5, songIndex, retry) {
      const song = this.songs[songIndex];
      if (res5.code !== 200) {
        console.error(song.name, UPLOAD_MESSAGES.matchSong, res5);
        if (res5.code === 400 || !retry) {
          showTips(`${song.name}${UPLOAD_MESSAGES.uploadSuccess}，但是${UPLOAD_MESSAGES.associateFail}`, 2);
          this.setSongUploaded(song);
          this.setSongRemark(song, UPLOAD_MESSAGES.associateFail);
          this.batchUpload.matchOffset += 1;
          this.uploadSongMatchBatch();
        } else {
          sleep(1e3).then(() => this.uploadSongMatchBatch(true));
        }
        return;
      }
      console.log(song.name, UPLOAD_MESSAGES.matchSong, res5);
      this.setSongUploaded(song);
      showTips(`成功上传1首歌曲`, 1);
      this.batchUpload.matchOffset += 1;
      this.uploadSongMatchBatch();
    }
    onBatchMatchError(songIndex, retry) {
      const song = this.songs[songIndex];
      console.error(song.name, UPLOAD_MESSAGES.matchSong, "网络错误");
      if (!retry) {
        showTips(UPLOAD_MESSAGES.interfaceFail, 1);
        sleep(1e3).then(() => this.uploadSongMatchBatch(true));
      } else {
        this.batchUpload.matchOffset += 1;
        this.uploadSongMatchBatch();
      }
    }
    onBatchUploadFinish() {
      this.batchUpload.working = false;
      this.renderFilterInfo();
    }
  }
  const baseCDNURL = "https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/";
  const optionMap = {
    0: "热门",
    1: "华语男歌手",
    2: "华语女歌手",
    3: "华语组合",
    4: "欧美男歌手",
    5: "欧美女歌手",
    6: "欧美组合",
    7: "日本男歌手",
    8: "日本女歌手",
    9: "日本组合",
    10: "韩国男歌手",
    11: "韩国女歌手",
    12: "韩国组合"
  };
  const cloudUpload = (uiArea) => {
    let btnUpload = createBigButton("快速上传加载中", uiArea, 2);
    let btnUploadDesc = btnUpload.firstChild;
    let toplist = [];
    let selectOptions = {
      "热门": {},
      "华语男歌手": {},
      "华语女歌手": {},
      "华语组合": {},
      "欧美男歌手": {},
      "欧美女歌手": {},
      "欧美组合": {},
      "日本男歌手": {},
      "日本女歌手": {},
      "日本组合": {},
      "韩国男歌手": {},
      "韩国女歌手": {},
      "韩国组合": {}
    };
    let artistmap = {};
    fetch(`${baseCDNURL}top.json`).then((r) => r.json()).then((r) => {
      toplist = r;
      toplist.forEach((artist) => {
        selectOptions[optionMap[artist.categroy]][artist.id] = `${artist.name}(${artist.count}首/${artist.sizeDesc})`;
        artistmap[artist.id] = artist;
      });
      btnUpload.addEventListener("click", ShowCloudUploadPopUp);
      btnUploadDesc.innerHTML = "云盘快速上传";
    });
    function ShowCloudUploadPopUp() {
      Swal.fire({
        title: "快速上传",
        input: "select",
        inputOptions: selectOptions,
        inputPlaceholder: "选择歌手",
        confirmButtonText: "下一步",
        showCloseButton: true,
        footer: '<div>由于网易云增加限制，目前周杰伦等无版权歌曲已经无法关联封面歌词。</div><div>内容不会再更新，且许多是AI升频或时长对不上，建议还是在歌手页上传。</div><div>如果出现大量报错，可设置请求头，来避免上传失败。</div><div><a href="https://github.com/Cinvin/myuserscripts/issues"  target="_blank">问题反馈</a></div>',
        inputValidator: (value) => {
          if (!value) {
            return "请选择歌手";
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          fetchCDNConfig(result.value);
        }
      });
    }
    function fetchCDNConfig(artistId) {
      showTips(`正在获取资源配置...`, 1);
      fetch(`${baseCDNURL}${artistId}.json`).then((r) => r.json()).then((r) => {
        let uploader = new Uploader(r);
        uploader.start();
      }).catch(`获取资源配置失败`);
    }
  };
  const myCloudDisk = (uiArea) => {
    const btnMyCloudDisk = createBigButton("我的云盘", uiArea, 2);
    btnMyCloudDisk.addEventListener("click", () => {
      const cloudDiskManager = new CloudDiskManager();
      cloudDiskManager.start();
    });
    class CloudDiskManager {
start() {
        this.cloudCountLimit = 50;
        this.currentPage = 1;
        this.filter = {
          text: "",
          matchStatus: "all",
pureMusic: "all",
liveVersion: "all",
allSongs: [],
songs: [],
          filterInput: null,
          filterControls: {
            matchStatusRadios: null,
            pureMusicRadios: null,
            liveVersionRadios: null,
            filterBtn: null
          }
        };
        this.controls = {
          tbody: null,
          pageArea: null,
          cloudDesc: null,
          filterPanel: null,
          filterToggleBtn: null,
          selectAllCheckbox: null,
          batchPanel: null,
          batchOpsBtn: null,
          batchDeleteBtn: null,
          batchCollectBtn: null,
          batchDeselectAllBtn: null,
          baseTableMaxHeight: 400
        };
        this.selectedSongIds = new Set();
        this.currentDisplaySongs = [];
        this.openCloudList();
      }
openCloudList() {
        Swal.fire({
          showCloseButton: true,
          showConfirmButton: false,
          width: "980px",
          html: this._getCloudListHTML(),
          footer: `<div id="page-area"></div><br><div id="cloud-desc">${this.controls.cloudDesc ? this.controls.cloudDesc.innerHTML : ""}</div>`,
          didOpen: () => {
            this._handleCloudListOpen(Swal.getHtmlContainer(), Swal.getFooter());
          }
        });
      }
fetchCloudInfoForMatchTable(offset) {
        this.controls.tbody.innerHTML = "正在获取...";
        weapiRequest("/api/v1/cloud/get", {
          data: {
            limit: this.cloudCountLimit,
            offset
          },
          onload: (res) => {
            this.currentPage = offset / this.cloudCountLimit + 1;
            const maxPage = Math.ceil(res.count / this.cloudCountLimit);
            this.controls.cloudDesc.innerHTML = `云盘容量 ${fileSizeDesc(res.size)}/${fileSizeDesc(res.maxSize)} 共${res.count}首歌曲`;
            const pageIndexs = [1];
            const floor = Math.max(2, this.currentPage - 2);
            const ceil = Math.min(maxPage - 1, this.currentPage + 2);
            for (let i = floor; i <= ceil; i++) {
              pageIndexs.push(i);
            }
            if (maxPage > 1) {
              pageIndexs.push(maxPage);
            }
            this.controls.pageArea.innerHTML = "";
            pageIndexs.forEach((pageIndex) => {
              const pageBtn = document.createElement("button");
              pageBtn.setAttribute("type", "button");
              pageBtn.className = "swal2-styled";
              pageBtn.innerHTML = pageIndex;
              if (pageIndex !== this.currentPage) {
                pageBtn.addEventListener("click", () => {
                  this.fetchCloudInfoForMatchTable(this.cloudCountLimit * (pageIndex - 1));
                });
              } else {
                pageBtn.style.background = "white";
              }
              this.controls.pageArea.appendChild(pageBtn);
            });
            if (pageIndexs.length < maxPage) {
              const jumpToPageInput = createPageJumpInput(this.currentPage, maxPage);
              jumpToPageInput.addEventListener("change", () => {
                const newPage = parseInt(jumpToPageInput.value);
                if (newPage >= 1 && newPage <= maxPage) {
                  this.fetchCloudInfoForMatchTable(this.cloudCountLimit * (newPage - 1));
                } else {
                  jumpToPageInput.value = this.currentPage;
                }
              });
              this.controls.pageArea.appendChild(jumpToPageInput);
            }
            this.fillCloudListTable(res.data);
          }
        });
      }
fillCloudListTable(songs) {
        this.currentDisplaySongs = songs;
        this.controls.tbody.innerHTML = "";
        if (songs.length === 0) {
          this.controls.tbody.innerHTML = "空空如也";
        }
        this.updateSelectAllCheckboxState();
        songs.forEach((song) => {
          let album = song.album;
          let picUrl = "http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg";
          if (song.simpleSong.al && song.simpleSong.al.picUrl) {
            picUrl = song.simpleSong.al.picUrl;
          }
          if (song.simpleSong.al && song.simpleSong.al.name && song.simpleSong.al.name.length > 0) {
            album = song.simpleSong.al.name;
          }
          let artist = song.artist;
          if (song.simpleSong.ar) {
            let artist2 = "";
            let arcount = 0;
            song.simpleSong.ar.forEach((ar) => {
              if (ar.name) {
                if (ar.id > 0) artist2 += `<a target="_blank" href="https://music.163.com/artist?id=${ar.id}">${ar.name}<a>,`;
                else artist2 += ar.name + ",";
                arcount += 1;
              }
            });
            if (arcount > 0) {
              artist = artist2.substring(0, artist2.length - 1);
            }
          }
          const addTime = dateDesc(song.addTime);
          const tablerow = document.createElement("tr");
          const isChecked = this.selectedSongIds.has(song.simpleSong.id) ? "checked" : "";
          tablerow.innerHTML = `<td class="song-checkbox-cell"><input type="checkbox" class="song-checkbox" value="${song.simpleSong.id}" ${isChecked}></td>
                <td><button type="button" class="swal2-styled btn-match" title="匹配"><i class="fa-solid fa-link"></i></button></td>
                <td><a class="album-link"><img src="${picUrl}?param=50y50&quality=100" title="${album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td>
                <td><a class="song-link" target="_blank" href="https://music.163.com/song?id=${song.simpleSong.id}">${song.simpleSong.name}</a></td>
                <td>${artist}</td><td>${duringTimeDesc(song.simpleSong.dt)}</td><td>${fileSizeDesc(song.fileSize)} ${levelDesc(song.simpleSong.privilege.plLevel)}</td>
                <td>${addTime}
                <div class="row-actions">
                    <button type="button" class="swal2-styled btn-play"  title="播放"><i class="fa-solid fa-play"></i></button>
                    <button type="button" class="swal2-styled btn-addplay"  title="添加至播放列表"><i class="fa-solid fa-plus"></i></button>
                    <button type="button" class="swal2-styled btn-collect"  title="收藏"><i class="fa-solid fa-folder-plus"></i></button>
                    <button type="button" class="swal2-styled btn-delete"  title="删除"><i class="fa-solid fa-trash"></i></button>
                </div></td>`;
          if (song.simpleSong.al && song.simpleSong.al.id > 0) {
            const albumLink = tablerow.querySelector(".album-link");
            albumLink.href = "https://music.163.com/album?id=" + song.simpleSong.al.id;
            albumLink.target = "_blank";
          }
          tablerow.querySelector(".btn-match").addEventListener("click", () => this.openMatchPopup(song));
          tablerow.querySelector(".song-checkbox").addEventListener("change", (e2) => {
            this.toggleSelection(song.simpleSong.id, e2.target.checked);
          });
          const addToFormat = songItemAddToFormat(song.simpleSong);
          tablerow.querySelector(".btn-play").addEventListener("click", () => {
            unsafeWindow.top.player.addTo([addToFormat], false, true);
          });
          tablerow.querySelector(".btn-addplay").addEventListener("click", () => {
            unsafeWindow.top.player.addTo([addToFormat], false, false);
          });
          tablerow.querySelector(".btn-collect").addEventListener("click", () => {
            this.openAddToPlaylistPopup(song);
          });
          tablerow.querySelector(".btn-delete").addEventListener("click", () => {
            this.deleteCloudSong(song);
          });
          this.controls.tbody.appendChild(tablerow);
        });
      }
      updateFilterButtonText() {
        if (this.controls.filterToggleBtn) {
          const isDefault = this.filter.text === "" && this.filter.matchStatus === "all" && this.filter.pureMusic === "all" && this.filter.liveVersion === "all";
          if (isDefault) {
            this.controls.filterToggleBtn.innerHTML = '筛选歌曲<i class="fa-solid fa-arrow-down filter-icon"></i>';
          } else {
            const count = this.filter.songs.length;
            this.controls.filterToggleBtn.innerHTML = `已筛选（${count}）<i class="fa-solid fa-arrow-down filter-icon"></i>`;
          }
        }
      }
      onCloudInfoFilterChange() {
        this.filter.songs = [];
        if (this.filter.allSongs && this.filter.allSongs.length > 0) {
          this.applyFiltersToAllSongs();
          return;
        }
        this.filter.filterInput.setAttribute("disabled", 1);
        this.filter.filterControls.filterBtn.setAttribute("disabled", 1);
        this.controls.batchOpsBtn.disabled = true;
        this.cloudInfoFilterFetchData(0);
      }
checkSongMatchesFilters(song) {
        if (this.filter.text.length > 0) {
          let matchFlag = false;
          if (song.album.includes(this.filter.text) || song.artist.includes(this.filter.text) || song.simpleSong.name.includes(this.filter.text) || song.simpleSong.al && song.simpleSong.al.id > 0 && song.simpleSong.al.name && song.simpleSong.al.name.includes(this.filter.text)) {
            matchFlag = true;
          }
          if (!matchFlag && song.simpleSong.ar) {
            song.simpleSong.ar.forEach((ar) => {
              if (ar.name && ar.name.includes(this.filter.text)) {
                matchFlag = true;
              }
            });
          }
          if (!matchFlag) {
            return false;
          }
        }
        if (this.filter.matchStatus !== "all") {
          if (this.filter.matchStatus === "matched" && song.matchType === "unmatched") {
            return false;
          }
          if (this.filter.matchStatus === "unmatched" && song.matchType === "matched") {
            return false;
          }
        }
        if (this.filter.pureMusic !== "all") {
          const titleLower = (song.simpleSong.name || "").toLowerCase();
          const isPureMusic = (song.simpleSong.mark & 131072) === 131072 || titleLower.includes("伴奏") || titleLower.includes("纯音乐") || titleLower.includes("instrumental");
          if (this.filter.pureMusic === "pure" && !isPureMusic) return false;
          if (this.filter.pureMusic === "noPure" && isPureMusic) return false;
        }
        if (this.filter.liveVersion !== "all") {
          const nameLower = (song.simpleSong.name || "").toLowerCase();
          const isLive = liveRegex.test(nameLower);
          if (this.filter.liveVersion === "live" && !isLive) return false;
          if (this.filter.liveVersion === "noLive" && isLive) return false;
        }
        return true;
      }
      applyFiltersToAllSongs() {
        if (!this.filter.allSongs) this.filter.allSongs = [];
        this.filter.songs = this.filter.allSongs.filter((song) => this.checkSongMatchesFilters(song));
        this.updateFilterButtonText();
        this.sepreateFilterCloudListPage(1);
      }
cloudInfoFilterFetchData(offset) {
        if (offset === 0) {
          this.filter.allSongs = [];
          if (this.controls.pageArea) {
            this.controls.pageArea.style.display = "none";
          }
        }
        weapiRequest("/api/v1/cloud/get", {
          data: {
            limit: 1e3,
            offset
          },
          onload: (res) => {
            this.controls.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1e3, res.count)}云盘歌曲`;
            res.data.forEach((song) => {
              this.filter.allSongs.push(song);
            });
            if (res.hasMore) {
              this.cloudInfoFilterFetchData(offset + 1e3);
            } else {
              this.applyFiltersToAllSongs();
              this.filter.filterInput.removeAttribute("disabled");
              this.filter.filterControls.filterBtn.removeAttribute("disabled");
              this.controls.batchOpsBtn.disabled = false;
              if (this.controls.pageArea) {
                this.controls.pageArea.style.display = "block";
              }
            }
          }
        });
      }
sepreateFilterCloudListPage(currentPage) {
        this.currentPage = currentPage;
        const count = this.filter.songs.length;
        const maxPage = Math.ceil(count / this.cloudCountLimit);
        this.controls.pageArea.innerHTML = "";
        const pageIndexs = [1];
        const floor = Math.max(2, currentPage - 2);
        const ceil = Math.min(maxPage - 1, currentPage + 2);
        for (let i = floor; i <= ceil; i++) {
          pageIndexs.push(i);
        }
        if (maxPage > 1) {
          pageIndexs.push(maxPage);
        }
        pageIndexs.forEach((pageIndex) => {
          const pageBtn = document.createElement("button");
          pageBtn.setAttribute("type", "button");
          pageBtn.className = "swal2-styled";
          pageBtn.innerHTML = pageIndex;
          if (pageIndex !== currentPage) {
            pageBtn.addEventListener("click", () => {
              this.sepreateFilterCloudListPage(pageIndex);
            });
          } else {
            pageBtn.style.background = "white";
          }
          this.controls.pageArea.appendChild(pageBtn);
        });
        const songindex = (currentPage - 1) * this.cloudCountLimit;
        this.fillCloudListTable(this.filter.songs.slice(songindex, songindex + this.cloudCountLimit));
      }
      openMatchPopup(song) {
        Swal.fire({
          showCloseButton: true,
          width: "980px",
          confirmButtonText: "匹配",
          html: this._getMatchPopupHTML(),
          footer: "",
          didOpen: () => {
            this._handleMatchPopupOpen(song, Swal.getHtmlContainer(), Swal.getActions(), Swal.getFooter(), Swal.getTitle());
          },
          didClose: () => {
            this.openCloudList();
          }
        });
      }
      matchSong(fromId, toId) {
        weapiRequest("/api/cloud/user/song/match", {
          data: {
            songId: fromId,
            adjustSongId: toId
          },
          onload: (res) => {
            if (res.code !== 200) {
              showTips(res.message || res.msg || "匹配失败", 2);
            } else {
              let msg = "解除匹配成功";
              if (toId > 0) {
                msg = "匹配成功";
                if (res.matchData) {
                  msg = `${res.matchData.songName} 成功匹配到 ${res.matchData.simpleSong.name} `;
                }
              }
              showTips(msg, 1);
              if (this.filter.songs.length > 0 && res.matchData) {
                for (let i = 0; i < this.filter.songs.length; i++) {
                  if (this.filter.songs[i].simpleSong.id == fromId) {
                    res.matchData.simpleSong.privilege = this.filter.songs[i].simpleSong.privilege;
                    this.filter.songs[i] = res.matchData;
                    break;
                  }
                }
              }
              if (this.filter.allSongs && this.filter.allSongs.length > 0 && res.matchData) {
                for (let i = 0; i < this.filter.allSongs.length; i++) {
                  if (this.filter.allSongs[i].simpleSong && this.filter.allSongs[i].simpleSong.id == fromId) {
                    res.matchData.simpleSong.privilege = this.filter.allSongs[i].simpleSong.privilege || res.matchData.simpleSong.privilege;
                    this.filter.allSongs[i] = res.matchData;
                    break;
                  }
                }
              }
              this.openCloudList();
            }
          }
        });
      }
      fiilSearchTable(searchContent, cloudSongId) {
        if (searchContent.result.songCount > 0) {
          this.tbody.innerHTML = "";
          const timeMatchSongs = [];
          const timeNoMatchSongs = [];
          searchContent.result.songs.forEach((resultSong) => {
            if (Math.abs(resultSong.dt - this.fileDuringTime) < 1e3)
              timeMatchSongs.push(resultSong);
            else
              timeNoMatchSongs.push(resultSong);
          });
          const resultSongs = timeMatchSongs.concat(timeNoMatchSongs);
          resultSongs.forEach((resultSong) => {
            const tablerow = document.createElement("tr");
            const songName = resultSong.name;
            const artists = resultSong.ar.map((ar) => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${ar.name}</a>`).join();
            const needHighLight = Math.abs(resultSong.dt - this.fileDuringTime) < 1e3;
            const dtstyle = needHighLight ? "color:SpringGreen;" : "";
            tablerow.innerHTML = `<td><button type="button" class="swal2-styled selectbtn"><i class="fa-solid fa-link"></i></button></td><td><a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${resultSong.al.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${songName}${resultSong.privilege.cs ? ' <i class="fa-regular fa-cloud"></i>' : ""}</a></td><td>${artists}</td><td style="${dtstyle}">${duringTimeDesc(resultSong.dt)}</td>`;
            const selectbtn = tablerow.querySelector(".selectbtn");
            selectbtn.addEventListener("click", () => {
              this.matchSong(cloudSongId, resultSong.id);
            });
            this.tbody.appendChild(tablerow);
          });
        } else {
          this.tbody.innerHTML = "搜索结果为空";
        }
      }
      openAddToPlaylistPopup(song) {
        Swal.fire({
          showCloseButton: true,
          showConfirmButton: false,
          html: this._getPlaylistPopupHTML(),
          footer: "",
          didOpen: () => {
            this._handlePlaylistPopupOpen(song, Swal.getHtmlContainer());
          },
          didClose: () => {
            this.openCloudList();
          }
        });
      }
      deleteCloudSong(song) {
        Swal.fire({
          icon: "warning",
          title: "确认删除",
          text: `确定要删除《${song.simpleSong.name}》吗？`,
          showCancelButton: true,
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          didClose: () => {
            this.openCloudList();
          }
        }).then(async (result) => {
          if (result.isConfirmed) {
            await this.executeDelete([song.simpleSong.id]);
          }
        });
      }
      async executeDelete(songIds) {
        const deleteRes = await weapiRequestSync("/api/cloud/del", {
          method: "POST",
          data: {
            songIds
          }
        });
        if (deleteRes.code === 200) {
          showTips("删除成功", 1);
          songIds.forEach((id) => this.selectedSongIds.delete(id));
          if (this.filter.songs.length > 0) {
            this.filter.songs = this.filter.songs.filter((s) => !songIds.includes(s.simpleSong.id));
          }
          if (this.filter.allSongs && this.filter.allSongs.length > 0) {
            this.filter.allSongs = this.filter.allSongs.filter((s) => !songIds.includes(s.simpleSong.id));
          }
        } else {
          if (deleteRes.message) {
            showTips(deleteRes.message, 2);
          } else {
            showTips("删除失败", 2);
          }
        }
      }
      toggleSelection(songId, checked) {
        if (checked) {
          this.selectedSongIds.add(parseInt(songId));
        } else {
          this.selectedSongIds.delete(parseInt(songId));
        }
        this.updateSelectAllCheckboxState();
        this.updateBatchOpsButtonText();
      }
      toggleSelectAll(checked) {
        const targetSongs = this.currentDisplaySongs;
        targetSongs.forEach((song) => {
          if (checked) {
            this.selectedSongIds.add(song.simpleSong.id);
          } else {
            this.selectedSongIds.delete(song.simpleSong.id);
          }
        });
        const checkboxes = this.controls.tbody.querySelectorAll(".song-checkbox");
        checkboxes.forEach((cb) => {
          cb.checked = checked;
        });
        this.updateBatchOpsButtonText();
      }
      updateSelectAllCheckboxState() {
        if (!this.controls.selectAllCheckbox) return;
        const visibleSongs = this.currentDisplaySongs;
        if (visibleSongs.length === 0) {
          this.controls.selectAllCheckbox.checked = false;
          return;
        }
        const allSelected = visibleSongs.every((song) => this.selectedSongIds.has(song.simpleSong.id));
        this.controls.selectAllCheckbox.checked = allSelected;
      }
      toggleBatchPanel() {
        if (this.controls.filterPanel.classList.contains("show")) {
          this.controls.filterPanel.classList.remove("show");
          const filterIconEl = this.controls.filterToggleBtn.querySelector(".filter-icon");
          filterIconEl.className = "fa-solid fa-arrow-down filter-icon";
        }
        this.controls.batchPanel.classList.toggle("show");
        const isShow = this.controls.batchPanel.classList.contains("show");
        const batchIconEl = this.controls.batchOpsBtn.querySelector(".batch-icon");
        const container = Swal.getHtmlContainer();
        if (isShow) {
          batchIconEl.className = "fa-solid fa-arrow-up batch-icon";
          container.classList.add("batch-mode");
          this.selectedSongIds.clear();
          this.updateSelectAllCheckboxState();
          this.currentDisplaySongs.forEach((song) => {
            const cb = this.controls.tbody.querySelector(`.song-checkbox[value="${song.simpleSong.id}"]`);
            if (cb) cb.checked = false;
          });
          this.updateBatchOpsButtonText();
          this.updateBatchButtonVisibility();
        } else {
          batchIconEl.className = "fa-solid fa-arrow-down batch-icon";
          container.classList.remove("batch-mode");
          this.controls.batchOpsBtn.innerHTML = '批量操作 <i class="fa-solid fa-arrow-down batch-icon"></i>';
        }
        if (this.controls.tbody) {
          const base = this.controls.baseTableMaxHeight || 400;
          const panelH = isShow ? this.controls.batchPanel.offsetHeight : 0;
          const filterPanelH = this.controls.filterPanel.classList.contains("show") ? this.controls.filterPanel.offsetHeight : 0;
          const newMax = Math.max(80, base - panelH - filterPanelH);
          this.controls.tbody.style.maxHeight = newMax + "px";
        }
      }
      updateBatchOpsButtonText() {
        const count = this.selectedSongIds.size;
        const iconClass = this.controls.batchPanel.classList.contains("show") ? "fa-arrow-up" : "fa-arrow-down";
        if (count > 0) {
          this.controls.batchOpsBtn.innerHTML = `批量操作（已选择${count}首） <i class="fa-solid ${iconClass} batch-icon"></i>`;
        } else {
          this.controls.batchOpsBtn.innerHTML = `批量操作 <i class="fa-solid ${iconClass} batch-icon"></i>`;
        }
        if (this.controls.batchDeleteBtn) this.controls.batchDeleteBtn.disabled = count === 0;
        if (this.controls.batchCollectBtn) this.controls.batchCollectBtn.disabled = count === 0;
        if (this.controls.batchDeselectAllBtn) this.controls.batchDeselectAllBtn.disabled = count === 0;
      }
      updateBatchButtonVisibility() {
        const isFiltered = this.filter.songs.length > 0 && !(this.filter.text === "" && this.filter.matchStatus === "all" && this.filter.pureMusic === "all" && this.filter.liveVersion === "all");
        const batchSelectAllFilteredBtn = this.controls.batchPanel.querySelector("#btn-batch-select-all-filtered");
        if (isFiltered) {
          batchSelectAllFilteredBtn.style.display = "inline-block";
        } else {
          batchSelectAllFilteredBtn.style.display = "none";
        }
      }
      selectAllFiltered() {
        if (this.filter.songs.length > 0) {
          this.filter.songs.forEach((song) => {
            this.selectedSongIds.add(song.simpleSong.id);
          });
          this.updateSelectAllCheckboxState();
          const checkboxes = this.controls.tbody.querySelectorAll(".song-checkbox");
          checkboxes.forEach((cb) => cb.checked = true);
          this.updateBatchOpsButtonText();
        }
      }
      deselectAllFiltered() {
        this.selectedSongIds.clear();
        this.updateSelectAllCheckboxState();
        const checkboxes = this.controls.tbody.querySelectorAll(".song-checkbox");
        checkboxes.forEach((cb) => cb.checked = false);
        this.updateBatchOpsButtonText();
      }
      batchDelete() {
        Swal.fire({
          icon: "warning",
          title: "确认批量删除",
          text: `确定要删除选中的 ${this.selectedSongIds.size} 首歌曲吗？`,
          showCancelButton: true,
          confirmButtonText: "删除",
          cancelButtonText: "取消",
          didClose: () => {
            this.openCloudList();
          }
        }).then(async (result) => {
          if (result.isConfirmed) {
            await this.executeDelete(Array.from(this.selectedSongIds));
            this.updateBatchOpsButtonText();
          }
        });
      }
      batchAddToPlaylist() {
        Swal.fire({
          showCloseButton: true,
          showConfirmButton: false,
          html: this._getPlaylistPopupHTML(),
          didOpen: () => {
            this._handleBatchAddToPlaylistOpen(Swal.getHtmlContainer());
          },
          didClose: () => {
            this.openCloudList();
          }
        });
      }

_getCloudListHTML() {
        return `<style>
.controls-area {
    margin-bottom: 15px;
    text-align: left;
}
.control-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}
.filter-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
}
.filter-icon {
    display: inline-block;
    margin-left: 5px;
}
.filter-panel {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #f9f9f9;
    display: none;
}
.filter-panel.show {
    display: block;
}
.batch-panel {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 15px;
    background-color: #fff9e6;
    display: none;
}
.batch-panel.show {
    display: block;
}
.batch-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}
/* Checkbox visibility control */
.song-checkbox-cell, .song-checkbox-header {
    display: none;
}
.cloud-list-container.batch-mode .song-checkbox-cell,
.cloud-list-container.batch-mode .song-checkbox-header {
    display: table-cell;
}
.filter-row {
    margin-bottom: 12px;
}
.filter-row label {
    display: inline-block;
    min-width: 120px;
    font-weight: 500;
    margin-right: 10px;
}
.filter-row input[type="text"] {
    width: 300px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 8px;
    box-sizing: border-box;
    background: #fff;
}
.radio-group {
    display: inline-flex;
    gap: 15px;
}
.radio-group label {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: auto;
    margin-right: 0;
    font-weight: normal;
}
.filter-buttons {
    display: flex;
    gap: 10px;
    margin-top: 12px;
}
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 4%;
text-align: center;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 6%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 6%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 26%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 22%;
}
tr th:nth-child(6),tr td:nth-child(6){
width: 8%;
}
tr th:nth-child(7),tr td:nth-child(7){
width: 18%;
}
tr th:nth-child(8),tr td:nth-child(8){
width: 10%;
}
.row-actions {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
}
table tbody tr:hover .row-actions {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}
table tbody tr {
    position: relative;
}
table tbody tr:hover td:nth-last-child(-n + 3) {
    visibility: hidden;
}
.cloud-list-container.batch-mode .row-actions {
    display: none !important;
}  
.cloud-list-container.batch-mode table tbody tr:hover td:nth-last-child(-n + 3) {
     visibility: visible !important;
}
.cloud-list-container.batch-mode tr th:nth-child(2),
.cloud-list-container.batch-mode tr td:nth-child(2) {
    display: none;
}
</style>
<div class="controls-area">
    <div class="control-buttons">
        <button type="button" class="swal2-styled swal2-styled filter-toggle-btn" id="btn-filter-toggle">
            筛选歌曲
            <i class="fa-solid fa-arrow-down filter-icon"></i>
        </button>
        <button type="button" class="swal2-styled filter-toggle-btn" id="btn-batch-ops">
            批量操作
            <i class="fa-solid fa-arrow-down batch-icon"></i>
        </button>
    </div>
    <div class="batch-panel" id="batch-panel">
        <div class="batch-actions">
           <button type="button" class="swal2-styled" id="btn-batch-delete">删除</button>
           <button type="button" class="swal2-styled" id="btn-batch-collect">收藏</button>
           <button type="button" class="swal2-styled" style="display:none;" id="btn-batch-select-all-filtered">选择全部已筛选</button>
           <button type="button" class="swal2-styled" id="btn-batch-deselect-all" disabled>取消所有选择</button>
        </div>
    </div>
    <div class="filter-panel" id="filter-panel">
        <div class="filter-row">
            <label>关键词：</label>
            <input class="swal2-input" type="text" id="text-filter" placeholder="过滤：标题/歌手/专辑">
        </div>
        <div class="filter-row">
            <label>匹配状态：</label>
            <div class="radio-group">
                <label><input type="radio" name="match-status" value="all" checked> 全部</label>
                <label><input type="radio" name="match-status" value="matched"> 已匹配</label>
                <label><input type="radio" name="match-status" value="unmatched"> 未匹配</label>
            </div>
        </div>
        <div class="filter-row">
            <label>纯音乐：</label>
            <div class="radio-group">
                <label><input type="radio" name="pure-music" value="all" checked> 全部</label>
                <label><input type="radio" name="pure-music" value="pure"> 仅纯音乐</label>
                <label><input type="radio" name="pure-music" value="noPure"> 排除纯音乐</label>
            </div>
        </div>
        <div class="filter-row">
            <label>Live版本：</label>
            <div class="radio-group">
                <label><input type="radio" name="live-version" value="all" checked> 全部</label>
                <label><input type="radio" name="live-version" value="live"> 仅Live</label>
                <label><input type="radio" name="live-version" value="noLive"> 排除Live</label>
            </div>
        </div>
        <div class="filter-buttons">
            <button type="button" class="swal2-confirm swal2-styled" id="btn-apply-filter">过滤</button>
        </div>
    </div>
</div>`;
      }
_handleCloudListOpen(cloudListContainer, cloudListFooter) {
        cloudListContainer.classList.add("cloud-list-container");
        cloudListFooter.style.display = "block";
        cloudListFooter.style.textAlign = "center";
        this.controls.filterPanel = cloudListContainer.querySelector("#filter-panel");
        this.controls.filterToggleBtn = cloudListContainer.querySelector("#btn-filter-toggle");
        this.controls.batchPanel = cloudListContainer.querySelector("#batch-panel");
        this.controls.batchOpsBtn = cloudListContainer.querySelector("#btn-batch-ops");
        this.controls.batchDeleteBtn = cloudListContainer.querySelector("#btn-batch-delete");
        this.controls.batchCollectBtn = cloudListContainer.querySelector("#btn-batch-collect");
        const batchDeleteBtn = this.controls.batchDeleteBtn;
        const batchCollectBtn = this.controls.batchCollectBtn;
        const batchSelectAllFilteredBtn = cloudListContainer.querySelector("#btn-batch-select-all-filtered");
        this.controls.batchDeselectAllBtn = cloudListContainer.querySelector("#btn-batch-deselect-all");
        const batchDeselectAllBtn = this.controls.batchDeselectAllBtn;
        const applyFilterBtn = cloudListContainer.querySelector("#btn-apply-filter");
        this.filter.filterInput = cloudListContainer.querySelector("#text-filter");
        this.filter.filterControls.matchStatusRadios = cloudListContainer.querySelectorAll('input[name="match-status"]');
        this.filter.filterControls.pureMusicRadios = cloudListContainer.querySelectorAll('input[name="pure-music"]');
        this.filter.filterControls.liveVersionRadios = cloudListContainer.querySelectorAll('input[name="live-version"]');
        this.filter.filterControls.filterBtn = applyFilterBtn;
        this.controls.filterToggleBtn.addEventListener("click", () => {
          if (this.controls.batchPanel.classList.contains("show")) {
            this.toggleBatchPanel();
          }
          this.controls.filterPanel.classList.toggle("show");
          const isShow = this.controls.filterPanel.classList.contains("show");
          const filterIconEl = this.controls.filterToggleBtn.querySelector(".filter-icon");
          if (isShow) {
            filterIconEl.className = "fa-solid fa-arrow-up filter-icon";
            this.filter.filterInput.value = this.filter.text;
            cloudListContainer.querySelector(`input[name="match-status"][value="${this.filter.matchStatus}"]`).checked = true;
            cloudListContainer.querySelector(`input[name="pure-music"][value="${this.filter.pureMusic}"]`).checked = true;
            cloudListContainer.querySelector(`input[name="live-version"][value="${this.filter.liveVersion}"]`).checked = true;
          } else {
            filterIconEl.className = "fa-solid fa-arrow-down filter-icon";
          }
          if (this.controls.tbody) {
            const base = this.controls.baseTableMaxHeight || 400;
            const panelH = isShow ? this.controls.filterPanel.offsetHeight : 0;
            const newMax = Math.max(80, base - panelH);
            this.controls.tbody.style.maxHeight = newMax + "px";
          }
        });
        this.controls.batchOpsBtn.addEventListener("click", () => this.toggleBatchPanel());
        batchDeleteBtn.addEventListener("click", () => this.batchDelete());
        batchCollectBtn.addEventListener("click", () => this.batchAddToPlaylist());
        batchSelectAllFilteredBtn.addEventListener("click", () => {
          this.selectAllFiltered();
          this.updateBatchButtonVisibility();
        });
        batchDeselectAllBtn.addEventListener("click", () => {
          this.deselectAllFiltered();
          this.updateBatchButtonVisibility();
        });
        applyFilterBtn.addEventListener("click", () => {
          this.filter.text = this.filter.filterInput.value.trim();
          this.filter.matchStatus = this.controls.filterPanel.querySelector('input[name="match-status"]:checked').value;
          this.filter.pureMusic = this.controls.filterPanel.querySelector('input[name="pure-music"]:checked').value;
          this.filter.liveVersion = this.controls.filterPanel.querySelector('input[name="live-version"]:checked').value;
          this.onCloudInfoFilterChange();
          this.controls.filterPanel.classList.remove("show");
          const filterIconEl = this.controls.filterToggleBtn.querySelector(".filter-icon");
          filterIconEl.className = "fa-solid fa-arrow-down filter-icon";
          if (this.controls.tbody) {
            this.controls.tbody.style.maxHeight = this.controls.baseTableMaxHeight + "px";
          }
        });
        const songtb = document.createElement("table");
        songtb.border = 1;
        songtb.frame = "hsides";
        songtb.rules = "rows";
        songtb.innerHTML = `<thead><tr><th class="song-checkbox-header"><input type="checkbox" id="select-all-header"></th><th>匹配</th><th style="width: 6%">&nbsp;</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>文件信息</th><th>上传日期</th> </tr></thead><tbody></tbody>`;
        this.controls.tbody = songtb.querySelector("tbody");
        this.controls.selectAllCheckbox = songtb.querySelector("#select-all-header");
        this.controls.selectAllCheckbox.addEventListener("change", (e2) => {
          this.toggleSelectAll(e2.target.checked);
        });
        this.controls.baseTableMaxHeight = 400;
        this.controls.tbody.style.maxHeight = this.controls.baseTableMaxHeight + "px";
        this.controls.pageArea = cloudListFooter.querySelector("#page-area");
        this.controls.cloudDesc = cloudListFooter.querySelector("#cloud-desc");
        cloudListContainer.appendChild(songtb);
        this.updateFilterButtonText();
        if (this.filter.text === "" && this.filter.matchStatus === "all" && this.filter.pureMusic === "all" && this.filter.liveVersion === "all") {
          this.fetchCloudInfoForMatchTable((this.currentPage - 1) * this.cloudCountLimit);
        } else {
          this.sepreateFilterCloudListPage(this.currentPage);
        }
      }
_getMatchPopupHTML() {
        return `<style>
    table {
        width: 100%;
        height: 400px; 
        border-spacing: 0px;
        border-collapse: collapse;
        border: 2px solid #f0f0f0;
    }
    table th, table td {
        text-align: left;
        text-overflow: ellipsis;
    }
    table tbody {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    table thead tr, table tbody tr, table tfoot tr {
        box-sizing: border-box;
        table-layout: fixed;
        display: table;
        width: 100%;
    }
    table tbody tr td{
        border-bottom: none;
    }
tr th:nth-child(1),tr td:nth-child(1){
width: 6%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 6%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 40%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 40%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 8%;
}
</style>
<div><label>关键词/歌曲链接/歌曲ID:<input class="swal2-input" id="search-text" style="width: 400px;" placeholder="关键词/链接/ID"></label><button type="button" class="swal2-confirm swal2-styled" id="btn-search">搜索</button></div>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>匹配</th><th></th><th>歌曲标题</th><th>歌手</th><th>时长</th></tr></thead><tbody></tbody></table>
</div>`;
      }
_handleMatchPopupOpen(song, container, actions, footer, title) {
        actions.innerHTML = `<div class="swal2-loader"></div>
            <button type="button" class="swal2-styled" aria-label="" id="btn-unmatch" style="display: none;">取消网易云关联</button>`;
        this.targetIdDom = container.querySelector("#target-id");
        this.searchDom = container.querySelector("#search-text");
        this.searchBtn = container.querySelector("#btn-search");
        this.unMatchBtn = actions.querySelector("#btn-unmatch");
        this.titleDOM = title;
        this.tbody = container.querySelector("tbody");
        this.fileDuringTime = 0;
        if (song.matchType === "matched") {
          this.unMatchBtn.style.display = "inline-block";
          this.unMatchBtn.addEventListener("click", () => {
            this.matchSong(song.simpleSong.id, 0);
          });
        }
        let songTitle = song.songName;
        let songAlbum = song.album;
        let songArtist = song.artist;
        const pointIndex = songTitle.lastIndexOf(".");
        if (pointIndex > 0) {
          songTitle = songTitle.substring(0, pointIndex);
        }
        const hyphenIndex = songTitle.lastIndexOf("-");
        if (hyphenIndex > 0) {
          songArtist = songTitle.substring(0, hyphenIndex).trim();
          songTitle = songTitle.substring(hyphenIndex + 1).trim();
        }
        if (songArtist === "未知" || songArtist === "未知歌手") songArtist = "";
        if (songAlbum === "未知" || songAlbum === "未知专辑") songAlbum = "";
        const keyword = `${songTitle}   ${songArtist}   ${songAlbum}`.trim();
        this.searchDom.value = keyword;
        weapiRequest("/api/batch", {
          data: {
            "/api/song/enhance/player/url/v1": JSON.stringify({
              immerseType: "ste",
              ids: JSON.stringify([song.simpleSong.id]),
              level: "standard",
              encodeType: "mp3"
            }),
            "/api/cloudsearch/get/web": JSON.stringify({
              s: keyword,
              type: 1,
              limit: 30,
              offset: 0,
              total: true
            })
          },
          onload: (content) => {
            if (content.code !== 200) return;
            const playerContent = content["/api/song/enhance/player/url/v1"];
            const searchContent = content["/api/cloudsearch/get/web"];
            this.fileDuringTime = playerContent.data[0].time;
            let songDetailText = "文件时长：" + duringTimeDesc(this.fileDuringTime);
            if (song.matchType === "unmatched") {
              songDetailText += "，目前未关联到网易云。";
            }
            footer.innerHTML = `<div>${songDetailText}</div>` + footer.innerHTML;
            this.fiilSearchTable(searchContent, song.simpleSong.id);
          }
        });
        this.searchBtn.addEventListener("click", () => {
          const searchWord = this.searchDom.value.trim();
          const isSongId = /^[1-9]\d*$/.test(searchWord);
          let songId = isSongId ? searchWord : "";
          let URLObj = null;
          if (searchWord.includes("song?")) {
            try {
              URLObj = new URL(searchWord);
            } catch (e2) {
            }
          }
          if (URLObj && URLObj.hostname === "music.163.com") {
            const urlParamsStr = URLObj.search.length > 0 ? URLObj.search : URLObj.href.slice(URLObj.href.lastIndexOf("?"));
            songId = new URLSearchParams(urlParamsStr).get("id") || "";
          }
          const requestData = {};
          if (URLObj === null) {
            requestData["/api/cloudsearch/get/web"] = JSON.stringify({
              s: searchWord,
              type: 1,
              limit: 30,
              offset: 0,
              total: true
            });
          }
          if (songId.length > 0) {
            requestData["/api/v3/song/detail"] = JSON.stringify({ c: JSON.stringify([{ "id": songId }]) });
          }
          if (requestData["/api/cloudsearch/get/web"] || requestData["/api/v3/song/detail"]) {
            this.tbody.innerHTML = "正在搜索...";
            weapiRequest("/api/batch", {
              data: requestData,
              onload: (content) => {
                if (content.code !== 200) return;
                const songDetailContent = content["/api/v3/song/detail"];
                const searchContent = content["/api/cloudsearch/get/web"] || { result: { songCount: 0, songs: [] } };
                if (songDetailContent && songDetailContent.songs && songDetailContent.songs.length > 0) {
                  songDetailContent.songs[0].privilege = songDetailContent.privileges[0];
                  if (searchContent.result.songCount > 0) {
                    searchContent.result.songs.push(songDetailContent.songs[0]);
                  } else {
                    searchContent.result.songCount = 1;
                    searchContent.result.songs = songDetailContent.songs;
                  }
                }
                this.fiilSearchTable(searchContent, song.simpleSong.id);
              }
            });
          } else {
            this.tbody.innerHTML = "无法解析链接";
          }
        });
      }
_getPlaylistPopupHTML() {
        return `<style>
    table {
        width: 100%;
        height: 400px; 
        border-spacing: 0px;
        border-collapse: collapse;
        border: 2px solid #f0f0f0;
    }
    table th, table td {
        text-align: left;
        text-overflow: ellipsis;
    }
    table tbody {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    table thead tr, table tbody tr, table tfoot tr {
        box-sizing: border-box;
        table-layout: fixed;
        display: table;
        width: 100%;
    }
    table tbody tr td{
        border-bottom: none;
    }
tr th:nth-child(1),tr td:nth-child(1){
width: 14%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 16%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 70%;
}
</style>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th></th><th>歌单</th></tr></thead><tbody></tbody></table>
</div>`;
      }
async _handlePlaylistPopupOpen(song, container) {
        this.tbody = container.querySelector("tbody");
        const userPlaylistRes = await weapiRequestSync("/api/user/playlist", {
          data: {
            uid: unsafeWindow.GUser.userId,
            limit: 1001,
            offset: 0
          }
        });
        if (userPlaylistRes.code === 200 && userPlaylistRes.playlist.length > 0) {
          userPlaylistRes.playlist.filter((p) => !p.subscribed).forEach((playlist) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td><button type="button" class="swal2-styled btn-add" title="加入歌单"><i class="fa-solid fa-plus"></i></button></td>
                                    <td><img src="${playlist.coverImgUrl}?param=50y50&quality=100" title="${playlist.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></td>
                                    <td>${playlist.name}</td>`;
            row.querySelector(".btn-add").addEventListener("click", async () => {
              const collectRes = await weapiRequestSync("/api/playlist/manipulate/tracks", {
                method: "POST",
                data: {
                  op: "add",
                  pid: playlist.id,
                  tracks: song.simpleSong.id,
                  trackIds: JSON.stringify([song.simpleSong.id])
                }
              });
              if (collectRes.code === 200) {
                showTips("加入歌单成功", 1);
                this.openCloudList();
              } else {
                showTips(collectRes.message || "加入歌单失败", 2);
              }
            });
            this.tbody.appendChild(row);
          });
        }
      }
      async _handleBatchAddToPlaylistOpen(container) {
        const tbody = container.querySelector("tbody");
        const userPlaylistRes = await weapiRequestSync("/api/user/playlist", {
          data: {
            uid: unsafeWindow.GUser.userId,
            limit: 1001,
            offset: 0
          }
        });
        if (userPlaylistRes.code === 200 && userPlaylistRes.playlist.length > 0) {
          userPlaylistRes.playlist.filter((p) => !p.subscribed).forEach((playlist) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td><button type="button" class="swal2-styled btn-add" title="加入歌单"><i class="fa-solid fa-plus"></i></button></td>
                                    <td><img src="${playlist.coverImgUrl}?param=50y50&quality=100" title="${playlist.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></td>
                                    <td>${playlist.name}</td>`;
            row.querySelector(".btn-add").addEventListener("click", async () => {
              const songIds = Array.from(this.selectedSongIds);
              const collectRes = await weapiRequestSync("/api/playlist/manipulate/tracks", {
                method: "POST",
                data: {
                  op: "add",
                  pid: playlist.id,
                  trackIds: JSON.stringify(songIds),
                  immutable: true
                }
              });
              if (collectRes.code === 200) {
                showTips(`成功将 ${songIds.length} 首歌曲加入歌单`, 1);
                this.selectedSongIds.clear();
                this.updateBatchOpsButtonText();
                this.openCloudList();
              } else {
                showTips(collectRes.message || "加入歌单失败", 2);
              }
            });
            tbody.appendChild(row);
          });
        }
      }
    }
  };
  class ncmDownUpload {
    constructor(songs, showfinishBox = true, onSongDUSuccess = null, onSongDUFail = null, out = "artist-title") {
      this.songs = songs;
      this.currentIndex = 0;
      this.failSongs = [];
      this.out = out;
      this.showfinishBox = showfinishBox;
      this.onSongDUSuccess = onSongDUSuccess;
      this.onSongDUFail = onSongDUFail;
    }
    startUpload() {
      this.currentIndex = 0;
      this.failSongs = [];
      if (this.songs.length > 0) {
        this.uploadSong(this.songs[0]);
      }
    }
    uploadSong(song) {
      try {
        weapiRequest(song.api.url, {
          data: song.api.data,
          onload: (content) => {
            showTips(`(1/3)${song.title} 获取文件信息完成`, 1);
            const resData = content.data[0] || content.data;
            if (resData.url !== null) {
              song.fileFullName = nameFileWithoutExt(song.title, song.artist, "artist-title") + "." + resData.type.toLowerCase();
              song.dlUrl = resData.url;
              song.md5 = resData.md5;
              song.size = resData.size;
              song.ext = resData.type.toLowerCase();
              song.bitrate = Math.floor(resData.br / 1e3);
              const songCheckData = [{
                md5: song.md5,
                songId: song.id,
                bitrate: song.bitrate,
                fileSize: song.size
              }];
              weapiRequest("/api/cloud/upload/check/v2", {
                data: {
                  uploadType: 0,
                  songs: JSON.stringify(songCheckData)
                },
                onload: (res1) => {
                  console.log(song.title, "1.检查资源", res1);
                  if (res1.code !== 200 || res1.data.length < 1) {
                    this.uploadSongFail(song);
                    return;
                  }
                  showTips(`(2/3)${song.title} 检查资源`, 1);
                  song.cloudId = res1.data[0].songId;
                  if (res1.data[0].upload === 1) {
                    this.uploadSongWay1Part1(song);
                  } else if (res1.data[0].upload === 2) {
                    this.uploadSongWay2Part1(song);
                  } else {
                    this.uploadSongWay3Part1(song);
                  }
                },
                onerror: (res) => {
                  console.error(song.title, "1.检查资源", res);
                  this.uploadSongFail(song);
                }
              });
            } else {
              this.uploadSongFail(song);
            }
          },
          onerror: (res) => {
            console.error(song.title, "0.获取URL", res);
            this.uploadSongFail(song);
          }
        });
      } catch (e2) {
        console.error(e2);
        this.uploadSongFail(song);
      }
    }
    uploadSongWay1Part1(song) {
      let importSongData = [{
        songId: song.cloudId,
        bitrate: song.bitrate,
        song: song.title,
        artist: song.artist,
        album: song.album,
        fileName: song.fileFullName
      }];
      try {
        weapiRequest("/api/cloud/user/song/import", {
          data: {
            uploadType: 0,
            songs: JSON.stringify(importSongData)
          },
          onload: (res) => {
            console.log(song.title, "2.导入文件", res);
            if (res.code !== 200 || res.data.successSongs.length < 1) {
              console.error(song.title, "2.导入文件", res);
              this.uploadSongFail(song);
              return;
            }
            showTips(`(3/3)${song.title} 2.导入文件完成`, 1);
            song.cloudSongId = res.data.successSongs[0].song.songId;
            this.uploadSongMatch(song);
          },
          onerror: (responses2) => {
            console.error(song.title, "2.导入歌曲", responses2);
            this.uploadSongFail(song);
          }
        });
      } catch (e2) {
        console.error(e2);
        this.uploadSongFail(song);
      }
    }
    uploadSongWay2Part1(song) {
      try {
        weapiRequest("/api/nos/token/alloc", {
          data: {
            filename: song.fileFullName,
            length: song.size,
            ext: song.ext,
            type: "audio",
            bucket: "jd-musicrep-privatecloud-audio-public",
            local: false,
            nos_product: 3,
            md5: song.md5
          },
          onload: (res2) => {
            if (res2.code !== 200) {
              console.error(song.title, "2.获取令牌", res2);
              this.uploadSongFail(song);
              return;
            }
            song.resourceId = res2.result.resourceId;
            showTips(`(3/6)${song.title} 获取令牌完成`, 1);
            console.log(song.title, "2.获取令牌", res2);
            showTips(`(3/6)${song.title} 开始上传文件`, 1);
            this.uploadSongPart2(song);
          },
          onerror: (res) => {
            console.error(song.title, "2.获取令牌", res);
            this.uploadSongFail(song);
          }
        });
      } catch (e2) {
        console.error(e2);
        this.uploadSongFail(song);
      }
    }
    uploadSongPart2(song) {
      showTips(`(3.1/6)${song.title} 开始下载文件`, 1);
      try {
        GM_xmlhttpRequest({
          method: "GET",
          url: song.dlUrl,
          headers: {
            "Content-Type": "audio/mpeg"
          },
          responseType: "blob",
          onload: (response) => {
            showTips(`(3.2/6)${song.title} 文件下载完成`, 1);
            let buffer = response.response;
            weapiRequest("/api/nos/token/alloc", {
              data: {
                filename: song.fileFullName,
                length: song.size,
                ext: song.ext,
                type: "audio",
                bucket: "jd-musicrep-privatecloud-audio-public",
                local: false,
                nos_product: 3,
                md5: song.md5
              },
              onload: (tokenRes) => {
                song.token = tokenRes.result.token;
                song.objectKey = tokenRes.result.objectKey;
                console.log(song.title, "2.2.开始上传", tokenRes);
                showTips(`(3.3/6)${song.title} 开始上传文件`, 1);
                this.uploadFile(buffer, song, 0);
              },
              onerror: (responses2) => {
                console.error(song.title, "2.1.获取令牌", responses2);
                this.uploadSongFail(song);
              }
            });
          }
        });
      } catch (e2) {
        console.error(e2);
        this.uploadSongFail(song);
      }
    }
    uploadFile(data, song, offset, context = null) {
      const complete = offset + uploadChunkSize > song.size;
      const url2 = `http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${encodeURIComponent(song.objectKey)}?offset=${offset}&complete=${String(complete)}&version=1.0`;
      if (context) url2 += `&context=${context}`;
      GM_xmlhttpRequest({
        method: "POST",
        url: url2,
        headers: {
          "x-nos-token": song.token,
          "Content-MD5": song.md5,
          "Content-Type": "audio/mpeg"
        },
        data: data.slice(offset, offset + uploadChunkSize),
        onload: (response3) => {
          const res = JSON.parse(response3.response);
          if (complete) {
            console.log(song.title, "2.5.上传文件完成", res);
            showTips(`(4/6)${song.title} 上传文件完成`, 1);
            this.uploadSongPart3(song);
          } else {
            showTips(`(4/6)${song.title} 正在上传${fileSizeDesc(res.offset)}/${fileSizeDesc(song.size)}`, 1);
            this.uploadFile(data, song, res.offset, res.context);
          }
        },
        onerror: (response3) => {
          console.error(song.title, "文件上传时失败", response3);
          this.uploadSongFail(song);
        }
      });
    }
    uploadSongWay3Part1(song) {
      try {
        weapiRequest("/api/nos/token/alloc", {
          data: {
            filename: song.fileFullName,
            length: song.size,
            ext: song.ext,
            type: "audio",
            bucket: "jd-musicrep-privatecloud-audio-public",
            local: false,
            nos_product: 3,
            md5: song.md5
          },
          onload: (res2) => {
            if (res2.code !== 200) {
              console.error(song.title, "2.获取令牌", res2);
              this.uploadSongFail(song);
              return;
            }
            song.resourceId = res2.result.resourceId;
            showTips(`(3/6)${song.title} 获取令牌完成`, 1);
            console.log(song.title, "2.获取令牌", res2);
            this.uploadSongPart3(song);
          },
          onerror: (res) => {
            console.error(song.title, "2.获取令牌", res);
            this.uploadSongFail(song);
          }
        });
      } catch (e2) {
        console.error(e2);
        this.uploadSongFail(song);
      }
    }
    uploadSongPart3(song) {
      try {
        console.log(song);
        weapiRequest("/api/upload/cloud/info/v2", {
          data: {
            md5: song.md5,
            songid: song.cloudId,
            filename: song.fileFullName,
            song: song.title,
            album: song.album,
            artist: song.artist,
            bitrate: String(song.bitrate),
            resourceId: song.resourceId
          },
          onload: (res3) => {
            if (res3.code !== 200) {
              if (song.expireTime < Date.now() || res3.msg && res3.msg.includes("rep create failed")) {
                console.error(song.title, "3.提交文件", res3);
                this.uploadSongFail(song);
              } else {
                console.log(song.title, "3.正在转码", res3);
                showTips(`(5/6)${song.title} 正在转码...`, 1);
                sleep(1e3).then(() => {
                  this.uploadSongPart3(song);
                });
              }
              return;
            }
            console.log(song.title, "3.提交文件", res3);
            showTips(`(5/6)${song.title} 提交文件完成`, 1);
            weapiRequest("/api/cloud/pub/v2", {
              data: {
                songid: res3.songId
              },
              onload: (res4) => {
                if (res4.code !== 200 && res4.code !== 201) {
                  console.error(song.title, "4.发布资源", res4);
                  this.uploadSongFail(song);
                  return;
                }
                console.log(song.title, "4.发布资源", res4);
                showTips(`(5/6)${song.title} 提交文件完成`, 1);
                song.cloudSongId = res4.privateCloud.songId;
                this.uploadSongMatch(song);
              },
              onerror: (res) => {
                console.error(song.title, "4.发布资源", res);
                this.uploadSongFail(song);
              }
            });
          },
          onerror: (res) => {
            console.error(song.title, "3.提交文件", res);
            this.uploadSongFail(song);
          }
        });
      } catch (e2) {
        console.error(e2);
        this.uploadSongFail(song);
      }
    }
    uploadSongMatch(song) {
      if (song.cloudSongId !== song.id) {
        weapiRequest("/api/cloud/user/song/match", {
          data: {
            songId: song.cloudSongId,
            adjustSongId: song.id
          },
          onload: (res5) => {
            if (res5.code !== 200) {
              console.error(song.title, "5.匹配歌曲", res5);
              this.uploadSongFail(song);
              return;
            }
            console.log(song.title, "5.匹配歌曲", res5);
            console.log(song.title, "完成");
            showTips(`(6/6)${song.title} 上传完成`, 1);
            this.uploadSongSuccess(song);
          },
          onerror: (res) => {
            console.error(song.title, "5.匹配歌曲", res);
            this.uploadSongFail(song);
          }
        });
      } else {
        console.log(song.title, "完成");
        showTips(`${song.title} 上传完成`, 1);
        this.uploadSongSuccess(song);
      }
    }
    uploadSongFail(song) {
      showTips(`${song.title} 上传失败`, 2);
      this.failSongs.push(song);
      if (this.onSongDUFail) this.onSongDUFail(song);
      this.uploadNextSong();
    }
    uploadSongSuccess(song) {
      if (this.onSongDUSuccess) this.onSongDUSuccess(song);
      this.uploadNextSong();
    }
    uploadNextSong() {
      this.currentIndex += 1;
      if (this.currentIndex < this.songs.length) {
        this.uploadSong(this.songs[this.currentIndex]);
      } else {
        let msg = this.failSongs.length === 0 ? `${this.songs[0].title}上传完成` : `${this.songs[0].title}上传失败`;
        msg = this.songs.length > 1 ? this.failSongs.length === 0 ? "全部上传完成" : `上传完毕,存在${this.failSongs.length}首上传失败的歌曲.它们为:${this.failSongs.map((song) => song.title).join()}` : msg;
        if (this.showfinishBox) {
          showConfirmBox(msg);
        }
      }
    }
  }
  const cloudUpgrade = (uiArea) => {
    let btnUpgrade = createBigButton("云盘音质升降", uiArea, 2);
    btnUpgrade.addEventListener("click", ShowCloudUpgradePopUp);
    function ShowCloudUpgradePopUp() {
      Swal.fire({
        title: "云盘音质升降",
        html: `
                <select id="target-level" class="swal2-select">
                    <option value="" disabled selected>目标音质</option>
                    <option value="hires">高解析度无损</option>
                    <option value="lossless">无损</option>
                    <option value="exhigh">极高(320k)</option>
                </select>
                <select id="filter-mode" class="swal2-select">
                    <option value="" disabled selected>歌曲筛选</option>
                    <option value="lower">比目标音质低</option>
                    <option value="higher">比目标音质高</option>
                </select>
                <select id="judgment-method" class="swal2-select">
                    <option value="" disabled selected>判断方式</option>
                    <option value="filesize">文件大小</option>
                    <option value="bitrate">比特率</option>
                </select>
            `,
        confirmButtonText: "下一步",
        showCloseButton: true,
        footer: "<div>寻找网易云音源与云盘音质不同的歌曲,然后进行删除并重新上传</div><div>比特率的判断方式可能不准确，因为正常用文件上传的歌曲均为128k</div><div>建议先设置好请求头或自行做好备份，以避免上传失败但是文件已经被删除的情况</div>",
        preConfirm: () => {
          const container = Swal.getHtmlContainer();
          const targetLevel = container.querySelector("#target-level").value;
          const filterMode = container.querySelector("#filter-mode").value;
          const judgmentMethod = container.querySelector("#judgment-method").value;
          if (!targetLevel) {
            Swal.showValidationMessage("请选择目标音质");
            return false;
          }
          if (!filterMode) {
            Swal.showValidationMessage("请选择歌曲筛选方式");
            return false;
          }
          if (!judgmentMethod) {
            Swal.showValidationMessage("请选择判断方式");
            return false;
          }
          return { targetLevel, filterMode, judgmentMethod };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          checkVIPBeforeUpgrade(result.value.targetLevel, result.value.filterMode, result.value.judgmentMethod);
        }
      });
    }
    function checkVIPBeforeUpgrade(level, filterMode, judgmentMethod) {
      weapiRequest(`/api/v1/user/detail/${_unsafeWindow.GUser.userId}`, {
        onload: (res) => {
          if (res.profile.vipType <= 10) {
            showConfirmBox("当前不是会员,无法获取无损以上音源,领取个会员礼品卡再来吧。");
          } else {
            let upgrade = new Upgrader(level, filterMode, judgmentMethod);
            upgrade.start();
          }
        }
      });
    }
    class Upgrader {
      constructor(level, filterMode, judgmentMethod) {
        this.targetLevel = level;
        this.targetWeight = levelWeight[level];
        this.filterMode = filterMode;
        this.judgmentMethod = judgmentMethod;
        this.songs = [];
        this.page = {
          current: 1,
          max: 1,
          limitCount: 50
        };
        this.filter = {
          text: "",
          songIndexs: []
        };
        this.batchUpgrade = {
          threadMax: 1,
          threadCount: 1,
          working: false,
          stopFlag: false,
          finnishThread: 0,
          songIndexs: []
        };
      }
      start() {
        this.showPopup();
      }
      showPopup() {
        Swal.fire({
          showCloseButton: true,
          showConfirmButton: false,
          width: "980px",
          html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 6%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 6%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 28%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 28%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 16%;
}
tr th:nth-child(6),tr td:nth-child(6){
width: 16%;
}
</style>
<input id="text-filter" class="swal2-input" placeholder="过滤：标题/歌手/专辑">
<button type="button" class="swal2-confirm swal2-styled" aria-label="" style="display: inline-block;" id="btn-upgrade-batch">全部处理</button>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th></th><th>歌曲标题</th><th>歌手</th><th>云盘音源</th><th>目标音源</th> </tr></thead><tbody></tbody></table>
`,
          footer: "<div></div>",
          didOpen: () => {
            let container = Swal.getHtmlContainer();
            let tbody = container.querySelector("tbody");
            let footer = Swal.getFooter();
            this.popupObj = {
              container,
              tbody,
              footer
            };
            let filterInput = container.querySelector("#text-filter");
            filterInput.addEventListener("change", () => {
              let filtertext = filterInput.value.trim();
              if (this.filter.text !== filtertext) {
                this.filter.text = filtertext;
                this.applyFilter();
              }
            });
            let upgrader = this;
            this.btnUpgradeBatch = container.querySelector("#btn-upgrade-batch");
            this.btnUpgradeBatch.addEventListener("click", () => {
              if (this.batchUpgrade.working) {
                this.batchUpgrade.stopFlag = true;
                this.btnUpgradeBatch.innerHTML = "正在停止";
                return;
              }
              this.batchUpgrade.songIndexs = [];
              this.filter.songIndexs.forEach((idx) => {
                if (!upgrader.songs[idx].upgraded) {
                  upgrader.batchUpgrade.songIndexs.push(idx);
                }
              });
              if (this.batchUpgrade.songIndexs.length == 0) {
                showTips("没有需要处理的歌曲", 1);
                return;
              }
              this.btnUpgradeBatch.innerHTML = "停止";
              this.batchUpgrade.working = true;
              this.batchUpgrade.stopFlag = false;
              this.batchUpgrade.finnishThread = 0;
              this.batchUpgrade.threadCount = Math.min(this.batchUpgrade.songIndexs.length, this.batchUpgrade.threadMax);
              for (let i = 0; i < this.batchUpgrade.threadCount; i++) {
                this.upgradeSong(this.batchUpgrade.songIndexs[i]);
              }
            });
            this.fetchSongInfo();
          },
          willClose: () => {
            this.batchUpgrade.stopFlag = true;
          }
        });
      }
      fetchSongInfo() {
        this.popupObj.tbody.innerHTML = "正在查找云盘歌曲...";
        this.fetchCloudSongInfoSub(0, []);
      }
      fetchCloudSongInfoSub(offset, songIds) {
        let upgrader = this;
        weapiRequest("/api/v1/cloud/get", {
          data: {
            limit: 1e3,
            offset
          },
          onload: (res) => {
            upgrader.popupObj.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1e3, res.count)}云盘歌曲`;
            res.data.forEach((song) => {
              if (song.simpleSong.privilege.toast) return;
              if (song.simpleSong.privilege.fee == 0 && song.simpleSong.privilege.flLevel == "none") return;
              if (song.simpleSong.privilege.fee == 4) return;
              if (song.simpleSong.privilege.playMaxBrLevel == "none") return;
              let cloudWeight = levelWeight[song.simpleSong.privilege.plLevel] || 0;
              if (this.filterMode === "lower") {
                if (cloudWeight >= this.targetWeight) return;
              } else if (this.filterMode === "higher") {
                if (cloudWeight <= this.targetWeight) return;
              }
              songIds.push({ "id": song.simpleSong.id });
              const actionText = this.filterMode === "lower" ? "提升" : "降低";
              upgrader.popupObj.tbody.innerHTML = `正在搜索第${offset + 1}到${Math.min(offset + 1e3, res.count)}云盘歌曲 找到${songIds.length}首可能可以${actionText}的歌曲`;
            });
            if (res.hasMore) {
              res = {};
              upgrader.fetchCloudSongInfoSub(offset + 1e3, songIds);
            } else {
              upgrader.filterTargetLevelSongSub(0, songIds);
            }
          }
        });
      }
      filterTargetLevelSongSub(offset, songIds) {
        let upgrader = this;
        upgrader.popupObj.tbody.innerHTML = `正在确认 ${offset + 1} / ${songIds.length} 首潜在歌曲是否有目标音质`;
        if (offset >= songIds.length) {
          upgrader.createTableRow();
          upgrader.applyFilter();
          return;
        }
        weapiRequest("/api/v3/song/detail", {
          data: {
            c: JSON.stringify(songIds.slice(offset, offset + 1e3))
          },
          onload: function(content) {
            var _a, _b;
            let songlen = content.songs.length;
            let privilegelen = content.privileges.length;
            for (let i = 0; i < songlen; i++) {
              for (let j = 0; j < privilegelen; j++) {
                if (content.songs[i].id == content.privileges[j].id) {
                  let songItem = {
                    id: content.songs[i].id,
                    name: content.songs[i].name,
                    album: getAlbumTextInSongDetail(content.songs[i]),
                    albumid: content.songs[i].al.id || 0,
                    artists: getArtistTextInSongDetail(content.songs[i]),
                    tns: content.songs[i].tns ? content.songs[i].tns.join() : "",
dt: duringTimeDesc(content.songs[i].dt || 0),
                    picUrl: content.songs[i].al && content.songs[i].al.picUrl ? content.songs[i].al.picUrl : "http://p4.music.126.net/UeTuwE7pvjBpypWLudqukA==/3132508627578625.jpg",
                    upgraded: false
                  };
                  const cloudFileSize = ((_b = (_a = content.songs[i].pc) == null ? void 0 : _a.privateCloud) == null ? void 0 : _b.fileSize) || 0;
                  if (upgrader.targetLevel === "lossless" && content.songs[i].sq) {
                    const targetSize = content.songs[i].sq.size || 0;
                    songItem.fileinfo = {
                      originalLevel: content.privileges[j].plLevel,
                      originalBr: content.songs[i].pc.br,
                      tagetBr: Math.round(content.songs[i].sq.br / 1e3),
                      originalSize: cloudFileSize,
                      targetSize
                    };
                    let shouldAdd = false;
                    if (upgrader.judgmentMethod === "filesize") {
                      if (upgrader.filterMode === "lower") {
                        shouldAdd = cloudFileSize + 1024 <= targetSize;
                      } else if (upgrader.filterMode === "higher") {
                        shouldAdd = cloudFileSize - 1024 >= targetSize;
                      }
                    } else {
                      if (upgrader.filterMode === "lower") {
                        shouldAdd = songItem.fileinfo.originalBr + 10 <= songItem.fileinfo.tagetBr;
                      } else if (upgrader.filterMode === "higher") {
                        shouldAdd = songItem.fileinfo.originalBr - 10 >= songItem.fileinfo.tagetBr;
                      }
                    }
                    if (shouldAdd) {
                      upgrader.songs.push(songItem);
                    }
                  } else if (upgrader.targetLevel === "hires" && content.songs[i].hr) {
                    const targetSize = content.songs[i].hr.size || 0;
                    songItem.fileinfo = {
                      originalLevel: content.privileges[j].plLevel,
                      originalBr: content.songs[i].pc.br,
                      tagetBr: Math.round(content.songs[i].hr.br / 1e3),
                      originalSize: cloudFileSize,
                      targetSize
                    };
                    let shouldAdd = false;
                    if (upgrader.judgmentMethod === "filesize") {
                      if (upgrader.filterMode === "lower") {
                        shouldAdd = cloudFileSize + 1024 <= targetSize;
                      } else if (upgrader.filterMode === "higher") {
                        shouldAdd = cloudFileSize - 1024 >= targetSize;
                      }
                    } else {
                      if (upgrader.filterMode === "lower") {
                        shouldAdd = songItem.fileinfo.originalBr + 10 <= songItem.fileinfo.tagetBr;
                      } else if (upgrader.filterMode === "higher") {
                        shouldAdd = songItem.fileinfo.originalBr - 10 >= songItem.fileinfo.tagetBr;
                      }
                    }
                    if (shouldAdd) {
                      upgrader.songs.push(songItem);
                    }
                  } else if (upgrader.targetLevel === "exhigh" && content.songs[i].h) {
                    const targetSize = content.songs[i].h.size || 0;
                    songItem.fileinfo = {
                      originalLevel: content.privileges[j].plLevel,
                      originalBr: content.songs[i].pc.br,
                      tagetBr: Math.round(content.songs[i].h.br / 1e3),
                      originalSize: cloudFileSize,
                      targetSize
                    };
                    let shouldAdd = false;
                    if (upgrader.judgmentMethod === "filesize") {
                      if (upgrader.filterMode === "lower") {
                        shouldAdd = cloudFileSize + 1024 <= targetSize;
                      } else if (upgrader.filterMode === "higher") {
                        shouldAdd = cloudFileSize - 1024 >= targetSize;
                      }
                    } else {
                      if (upgrader.filterMode === "lower") {
                        shouldAdd = songItem.fileinfo.originalBr + 10 <= songItem.fileinfo.tagetBr;
                      } else if (upgrader.filterMode === "higher") {
                        shouldAdd = songItem.fileinfo.originalBr - 10 >= songItem.fileinfo.tagetBr;
                      }
                    }
                    if (shouldAdd) {
                      upgrader.songs.push(songItem);
                    }
                  }
                  break;
                }
              }
            }
            upgrader.filterTargetLevelSongSub(offset + 1e3, songIds);
          }
        });
      }
      createTableRow() {
        let tagetLevelDesc = levelDesc(this.targetLevel);
        for (let i = 0; i < this.songs.length; i++) {
          let song = this.songs[i];
          let tablerow = document.createElement("tr");
          let cloudInfo, targetInfo;
          if (this.judgmentMethod === "filesize") {
            cloudInfo = `${levelDesc(song.fileinfo.originalLevel)} ${fileSizeDesc(song.fileinfo.originalSize)}`;
            targetInfo = `${tagetLevelDesc} ${fileSizeDesc(song.fileinfo.targetSize)}`;
          } else {
            cloudInfo = `${levelDesc(song.fileinfo.originalLevel)} ${song.fileinfo.originalBr}k`;
            targetInfo = `${tagetLevelDesc} ${song.fileinfo.tagetBr}k`;
          }
          tablerow.innerHTML = `<td><button type="button" class="swal2-styled" title="${this.filterMode === "lower" ? "提升" : "降低"}"><i class="fa-solid fa-arrow-${this.filterMode === "lower" ? "up" : "down"}"></i></button></td><td><a href="https://music.163.com/album?id=${song.albumid}" target="_blank"><img src="${song.picUrl}?param=50y50&quality=100" title="${song.album}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${song.id}" target="_blank">${song.name}</a></td><td>${song.artists}</td><td>${cloudInfo}</td><td>${targetInfo}</td>`;
          let btn = tablerow.querySelector("button");
          btn.addEventListener("click", () => {
            if (this.batchUpgrade.working) {
              return;
            }
            this.upgradeSong(i);
          });
          song.tablerow = tablerow;
        }
      }
      applyFilter() {
        this.filter.songIndexs = [];
        let filterText = this.filter.text;
        for (let i = 0; i < this.songs.length; i++) {
          let song = this.songs[i];
          if (filterText.length > 0 && !song.name.includes(filterText) && !song.album.includes(filterText) && !song.artists.includes(filterText) && !song.tns.includes(filterText)) {
            continue;
          }
          this.filter.songIndexs.push(i);
        }
        this.page.current = 1;
        this.page.max = Math.ceil(this.filter.songIndexs.length / this.page.limitCount);
        this.renderData();
        this.renderFilterInfo();
      }
      renderData() {
        if (this.filter.songIndexs.length == 0) {
          this.popupObj.tbody.innerHTML = "内容为空";
          this.popupObj.footer.innerHTML = "";
          return;
        }
        this.popupObj.tbody.innerHTML = "";
        let songBegin = (this.page.current - 1) * this.page.limitCount;
        let songEnd = Math.min(this.filter.songIndexs.length, songBegin + this.page.limitCount);
        for (let i = songBegin; i < songEnd; i++) {
          this.popupObj.tbody.appendChild(this.songs[this.filter.songIndexs[i]].tablerow);
        }
        let pageIndexs = [1];
        let floor = Math.max(2, this.page.current - 2);
        let ceil = Math.min(this.page.max - 1, this.page.current + 2);
        for (let i = floor; i <= ceil; i++) {
          pageIndexs.push(i);
        }
        if (this.page.max > 1) {
          pageIndexs.push(this.page.max);
        }
        let upgrader = this;
        this.popupObj.footer.innerHTML = "";
        pageIndexs.forEach((pageIndex) => {
          let pageBtn = document.createElement("button");
          pageBtn.setAttribute("type", "button");
          pageBtn.className = "swal2-styled";
          pageBtn.innerHTML = pageIndex;
          if (pageIndex !== upgrader.page.current) {
            pageBtn.addEventListener("click", () => {
              upgrader.page.current = pageIndex;
              upgrader.renderData();
            });
          } else {
            pageBtn.style.background = "white";
          }
          upgrader.popupObj.footer.appendChild(pageBtn);
        });
      }
      renderFilterInfo() {
        let sizeTotal = 0;
        let countCanUpgrade = 0;
        this.filter.songIndexs.forEach((idx) => {
          let song = this.songs[idx];
          if (!song.upgraded) {
            countCanUpgrade += 1;
            sizeTotal += song.size;
          }
        });
        this.btnUpgradeBatch.innerHTML = "全部处理";
        if (countCanUpgrade > 0) {
          this.btnUpgradeBatch.innerHTML += ` (${countCanUpgrade}首)`;
        }
      }
      upgradeSong(songIndex) {
        let song = this.songs[songIndex];
        let upgrade = this;
        try {
          weapiRequest("/api/cloud/del", {
            data: {
              songIds: [song.id]
            },
            onload: (content) => {
              console.log(content);
              if (content.code == 200) {
                showTips(`${song.name}删除成功`, 1);
              }
              let songItem = { api: { url: "/api/song/enhance/player/url/v1", data: { ids: JSON.stringify([song.id]), level: upgrade.targetLevel, encodeType: "mp3" } }, id: song.id, title: song.name, artist: song.artists, album: song.album, songIndex, Upgrader: this };
              let ULobj = new ncmDownUpload([songItem], false, this.onUpgradeSucess, this.onUpgradeFail);
              ULobj.startUpload();
            }
          });
        } catch (e2) {
          console.error(e2);
          upgrade.onUpgradeFail(songIndex);
        }
      }
      onUpgradeFail(ULsong) {
        let song = ULsong.Upgrader.songs[ULsong.songIndex];
        const actionText = ULsong.Upgrader.filterMode === "lower" ? "提升" : "降低";
        showTips(`${song.name} 音质${actionText}失败`, 2);
        ULsong.Upgrader.onUpgradeFinnsh(ULsong.songIndex);
      }
      onUpgradeSucess(ULsong) {
        let song = ULsong.Upgrader.songs[ULsong.songIndex];
        const actionText = ULsong.Upgrader.filterMode === "lower" ? "提升" : "降低";
        showTips(`${song.name} 音质${actionText}成功`, 1);
        song.upgraded = true;
        let btnUpgrade2 = song.tablerow.querySelector("button");
        btnUpgrade2.innerHTML = '<i class="fa-solid fa-check"></i>';
        btnUpgrade2.disabled = "disabled";
        ULsong.Upgrader.onUpgradeFinnsh(ULsong.songIndex);
      }
      onUpgradeFinnsh(songIndex) {
        if (this.batchUpgrade.working) {
          let batchSongIdx = this.batchUpgrade.songIndexs.indexOf(songIndex);
          if (!this.batchUpgrade.stopFlag && batchSongIdx + this.batchUpgrade.threadCount < this.batchUpgrade.songIndexs.length) {
            this.upgradeSong(this.batchUpgrade.songIndexs[batchSongIdx + this.batchUpgrade.threadCount]);
          } else {
            this.batchUpgrade.finnishThread += 1;
            if (this.batchUpgrade.finnishThread == this.batchUpgrade.threadCount) {
              this.batchUpgrade.working = false;
              this.batchUpgrade.stopFlag = false;
              this.renderFilterInfo();
              showTips("歌曲处理完成", 1);
            }
          }
        } else {
          this.renderFilterInfo();
        }
      }
    }
  };
  const cloudLocalUpload = (uiArea) => {
    let btnLocalUpload = createBigButton("云盘本地上传", uiArea, 2);
    btnLocalUpload.addEventListener("click", ShowLocalUploadPopUp);
    function ShowLocalUploadPopUp() {
      Swal.fire({
        title: "云盘本地上传",
        html: `<div id="my-file">
            <input id='song-file' type="file" accept="audio/*" multiple="multiple" class="swal2-file" placeholder="" style="display: flex;">
            </div>
            <div id="my-rd">
            <div class="swal2-radio"">
            <label><input type="radio" name="file-info" value="autofill" checked><span class="swal2-label">直接上传</span></label>
            <label><input type="radio" name="file-info" value="needInput" id="need-fill-info-radio"><span class="swal2-label">先填写文件的歌手、专辑信息</span></label>
            </div>
            </div>`,
        confirmButtonText: "上传",
        showCloseButton: true,
        preConfirm: () => {
          const container = Swal.getHtmlContainer();
          const files = container.querySelector("#song-file").files;
          if (files.length === 0) return Swal.showValidationMessage("请选择文件");
          return {
            files,
            needFillInfo: container.querySelector("#need-fill-info-radio").checked
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          new LocalUpload().start(result.value);
        }
      });
    }
    class LocalUpload {
      start(config) {
        this.files = config.files;
        this.needFillInfo = config.needFillInfo;
        this.task = [];
        this.currentIndex = 0;
        this.failIndexs = [];
        for (let i = 0; i < config.files.length; i++) {
          let file = config.files[i];
          let fileName = file.name;
          let song = {
            id: -2,
            songFile: file,
            fileFullName: fileName,
            title: fileName.slice(0, fileName.lastIndexOf(".")),
            artist: "未知",
            album: "未知",
            size: file.size,
            ext: fileName.slice(fileName.lastIndexOf(".") + 1),
            bitrate: 128
          };
          this.task.push(song);
        }
        showTips(`开始获取文件中的标签信息`, 1);
        this.readFileTags(0);
      }
      readFileTags(songIndex) {
        if (songIndex >= this.task.length) {
          if (this.needFillInfo) {
            this.showFillSongInforBox();
          } else {
            this.localUploadPart1(0);
          }
          return;
        }
        let fileData = this.task[songIndex].songFile;
        fileData = new File([fileData], fileData.name, { type: fileData.type });
        new jsmediatags.Reader(fileData).read({
          onSuccess: (res) => {
            if (res.tags.title) this.task[songIndex].title = res.tags.title;
            if (res.tags.artist) this.task[songIndex].artist = res.tags.artist;
            if (res.tags.album) this.task[songIndex].album = res.tags.album;
            this.readFileTags(songIndex + 1);
          },
          onError: (error) => {
            this.readFileTags(songIndex + 1);
          }
        });
      }
      showFillSongInforBox() {
        Swal.fire({
          html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 16%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 30%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 27%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 27%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>专辑</th></tr></thead><tbody></tbody></table>
`,
          confirmButtonText: "上传",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showCloseButton: false,
          didOpen: () => {
            let container = Swal.getHtmlContainer();
            let tbody = container.querySelector("tbody");
            for (let i = 0; i < this.task.length; i++) {
              let tablerow = document.createElement("tr");
              tablerow.innerHTML = `<td><button type="button" class="swal2-styled my-edit">编辑</button></td><td>${this.task[i].title}</td><td>${this.task[i].artist}</td><td>${this.task[i].album}</td>`;
              let btnEdit = tablerow.querySelector(".my-edit");
              btnEdit.addEventListener("click", () => {
                this.showEditInforBox(i);
              });
              tbody.appendChild(tablerow);
            }
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.localUploadPart1(0);
          }
        });
      }
      showEditInforBox(songIndex) {
        Swal.fire({
          title: this.task[songIndex].fileFullName,
          html: `<div><label for="text-title">歌名</label><input class="swal2-input" id="text-title" value="${this.task[songIndex].title}"></div>
            <div><label for="text-artist">歌手</label><input class="swal2-input" id="text-artist"  value="${this.task[songIndex].artist}"></div>
            <div><label for="text-album">专辑</label><input class="swal2-input" id="text-album" value="${this.task[songIndex].album}"></div>`,
          allowOutsideClick: false,
          allowEscapeKey: false,
          showCloseButton: false,
          confirmButtonText: "确定",
          preConfirm: () => {
            const container = Swal.getHtmlContainer();
            let songTitle = container.querySelector("#text-title").value.trim();
            if (songTitle.length === 0) return Swal.showValidationMessage("歌名不能为空");
            return {
              title: songTitle,
              artist: container.querySelector("#text-artist").value.trim(),
              album: container.querySelector("#text-album").value.trim()
            };
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.task[songIndex].title = result.value.title;
            this.task[songIndex].artist = result.value.artist;
            this.task[songIndex].album = result.value.album;
            this.showFillSongInforBox();
          }
        });
      }
      localUploadPart1(songindex) {
        let self = this;
        let song = self.task[songindex];
        let reader = new FileReader();
        let chunkSize = 1024 * 1024;
        let loaded = 0;
        let md5sum = _unsafeWindow.CryptoJS.algo.MD5.create();
        showTips(`(1/5)${song.title} 正在获取文件MD5值`, 1);
        reader.onload = function(e2) {
          md5sum.update(_unsafeWindow.CryptoJS.enc.Latin1.parse(reader.result));
          loaded += e2.loaded;
          if (loaded < song.size) {
            readBlob(loaded);
          } else {
            showTips(`(1/5)${song.title} 已计算文件MD5值`, 1);
            song.md5 = md5sum.finalize().toString();
            try {
              weapiRequest("/api/cloud/upload/check", {
                data: {
                  songId: 0,
                  md5: song.md5,
                  length: song.size,
                  ext: song.ext,
                  version: 1,
                  bitrate: song.bitrate
                },
                onload: (res1) => {
                  console.log(song.title, "1.检查资源", res1);
                  if (res1.code !== 200) {
                    console.error(song.title, "1.检查资源", res1);
                    self.uploadFail();
                    return;
                  }
                  song.cloudId = res1.songId;
                  song.needUpload = res1.needUpload;
                  weapiRequest("/api/nos/token/alloc", {
                    data: {
                      filename: song.title,
                      length: song.size,
                      ext: song.ext,
                      type: "audio",
                      bucket: "jd-musicrep-privatecloud-audio-public",
                      local: false,
                      nos_product: 3,
                      md5: song.md5
                    },
                    onload: (res2) => {
                      if (res2.code !== 200) {
                        console.error(song.title, "2.获取令牌", res2);
                        self.uploadFail();
                        return;
                      }
                      song.resourceId = res2.result.resourceId;
                      song.token = res2.result.token;
                      song.objectKey = res2.result.objectKey;
                      showTips(`(3/5)${song.title} 开始上传文件`, 1);
                      console.log(song.title, "2.获取令牌", res2);
                      if (res1.needUpload) {
                        self.localUploadFile(songindex, 0);
                      } else {
                        song.expireTime = Date.now() + 6e4;
                        self.localUploadPart2(songindex);
                      }
                    },
                    onerror: (res) => {
                      console.error(song.title, "2.获取令牌", res);
                      self.uploadFail();
                    }
                  });
                },
                onerror: (res) => {
                  console.error(song.title, "1.检查资源", res);
                  self.uploadFail();
                }
              });
            } catch (e3) {
              console.error(e3);
              self.uploadFail();
            }
          }
        };
        readBlob(0);
        function readBlob(offset) {
          let blob = song.songFile.slice(offset, offset + chunkSize);
          reader.readAsBinaryString(blob);
        }
      }
      localUploadFile(songindex, offset, context = null) {
        let self = this;
        let song = self.task[songindex];
        try {
          let complete = offset + uploadChunkSize > song.size;
          let url2 = `http://45.127.129.8/jd-musicrep-privatecloud-audio-public/${encodeURIComponent(song.objectKey)}?offset=${offset}&complete=${String(complete)}&version=1.0`;
          if (context) url2 += `&context=${context}`;
          GM_xmlhttpRequest({
            method: "POST",
            url: url2,
            headers: {
              "x-nos-token": song.token,
              "Content-MD5": song.md5,
              "Content-Type": "audio/mpeg"
            },
            data: song.songFile.slice(offset, offset + uploadChunkSize),
            onload: (response3) => {
              let res = JSON.parse(response3.response);
              if (complete) {
                console.log(song.title, "2.5.上传文件完成", res);
                showTips(`(3.5/5)${song.title} 上传文件完成`, 1);
                song.expireTime = Date.now() + 6e4;
                self.localUploadPart2(songindex);
              } else {
                showTips(`(3.4/5)${song.title} 正在上传${fileSizeDesc(res.offset)}/${fileSizeDesc(song.size)}`, 1);
                self.localUploadFile(songindex, res.offset, res.context);
              }
            },
            onerror: (response3) => {
              console.error(song.title, "文件上传时失败", response3);
              self.uploadFail();
            }
          });
        } catch (e2) {
          console.error(e2);
          self.uploadFail();
        }
      }
      localUploadPart2(songindex) {
        let self = this;
        let song = self.task[songindex];
        try {
          weapiRequest("/api/upload/cloud/info/v2", {
            data: {
              md5: song.md5,
              songid: song.cloudId,
              filename: song.fileFullName,
              song: song.title,
              album: song.album,
              artist: song.artist,
              bitrate: String(song.bitrate),
              resourceId: song.resourceId
            },
            onload: (res3) => {
              if (res3.code !== 200) {
                if (song.expireTime < Date.now() || res3.msg && res3.msg.includes("rep create failed")) {
                  console.error(song.title, "3.提交文件", res3);
                  self.uploadFail();
                } else {
                  console.log(song.title, "3.正在转码", res3);
                  showTips(`(4/5)${song.title} 正在转码...`, 1);
                  sleep(1e3).then(() => {
                    self.localUploadPart2(songindex);
                  });
                }
                return;
              }
              console.log(song.title, "3.提交文件", res3);
              showTips(`(4/5)${song.title} 提交文件完成`, 1);
              weapiRequest("/api/cloud/pub/v2", {
                data: {
                  songid: res3.songId
                },
                onload: (res4) => {
                  if (res4.code !== 200 && res4.code !== 201) {
                    console.error(song.title, "4.发布资源", res4);
                    self.uploadFail();
                    return;
                  }
                  showTips(`(5/5)${song.title} 上传完成`, 1);
                  self.uploadSuccess();
                },
                onerror: (res) => {
                  console.error(song.title, "4.发布资源", res);
                  self.uploadFail();
                }
              });
            },
            onerror: (res) => {
              console.error(song.title, "3.提交文件", res);
              self.uploadFail();
            }
          });
        } catch (e2) {
          console.error(e2);
          self.uploadFail();
        }
      }
      uploadFail() {
        this.failIndexs.push(this.currentIndex);
        showTips(`${this.task[this.currentIndex].title}上传失败`, 2);
        this.uploadNext();
      }
      uploadSuccess() {
        this.uploadNext();
      }
      uploadNext() {
        this.currentIndex += 1;
        if (this.currentIndex >= this.task.length) {
          this.uploadFinnsh();
        } else {
          this.localUploadPart1(this.currentIndex);
        }
      }
      uploadFinnsh() {
        let msg = "上传完成";
        if (this.failIndexs.length > 0) {
          msg += ",以下文件上传失败：";
          msg += this.failIndexs.map((idx) => this.task[idx].fileFullName).join();
        }
        showConfirmBox(msg);
      }
    }
  };
  const freeVIPSong = (uiArea) => {
    let btnVIPfreeB = createBigButton("限免VIP歌曲", uiArea, 2);
    btnVIPfreeB.addEventListener("click", VIPfreeB);
    function VIPfreeB() {
      weapiRequest("/api/v6/playlist/detail", {
        data: {
          id: 8402996200,
          n: 1e5,
          s: 8
        },
        onload: (res) => {
          let songList = res.playlist.trackIds.map((item) => {
            return {
              "id": Number(item.id)
            };
          });
          openVIPDownLoadPopup(songList, '歌单<a href="https://music.163.com/#/playlist?id=8402996200" target="_blank">「会员雷达」</a>的内容', 22);
        }
      });
    }
    function openVIPDownLoadPopup(songIds, footer, trialMode) {
      Swal.fire({
        title: "限免VIP歌曲",
        showCloseButton: true,
        showConfirmButton: false,
        width: "980px",
        html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 16%;
}
tr th:nth-child(2){
width: 48%;
}
tr td:nth-child(2){
width: 10%;
}
tr td:nth-child(3){
width: 38%;
}
tr th:nth-child(3),tr td:nth-child(4){
width: 28%;
}
tr th:nth-child(4),tr td:nth-child(5){
width: 8%;
}
tr th:nth-child(5),tr td:nth-child(6){
width: 8%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>歌曲标题</th><th>歌手</th><th>时长</th><th>大小</th> </tr></thead><tbody></tbody></table>
`,
        footer: footer + '，只有标准(128k)音质<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
        didOpen: () => {
          let container = Swal.getHtmlContainer();
          Swal.getFooter();
          let tbody = container.querySelector("tbody");
          weapiRequest("/api/v3/song/detail", {
            data: {
              c: JSON.stringify(songIds)
            },
            onload: function(content) {
              let songlen = content.songs.length;
              let privilegelen = content.privileges.length;
              for (let i = 0; i < songlen; i++) {
                for (let j = 0; j < privilegelen; j++) {
                  if (content.songs[i].id == content.privileges[j].id) {
                    if (content.privileges[j].cs) {
                      break;
                    }
                    let songArtist = getArtistTextInSongDetail(content.songs[i]);
                    let songTitle = content.songs[i].name;
                    let filename = nameFileWithoutExt(songTitle, songArtist, "artist-title");
                    songArtist = content.songs[i].ar ? content.songs[i].ar.map((ar) => `<a target="_blank" href="https://music.163.com/artist?id=${ar.id}">${ar.name}<a>`).join() : "";
                    let tablerow = document.createElement("tr");
                    tablerow.innerHTML = `<td><button type="button" class="swal2-styled mydl">下载</button><button type="button" class="swal2-styled myul">上传</button></td><td><a href="https://music.163.com/album?id=${content.songs[i].al.id}" target="_blank"><img src="${content.songs[i].al.picUrl}?param=50y50&quality=100" title="${getAlbumTextInSongDetail(content.songs[i])}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${content.songs[i].id}" target="_blank">${content.songs[i].name}</a></td><td>${songArtist}</td><td>${duringTimeDesc(content.songs[i].dt || 0)}</td><td>${fileSizeDesc(content.songs[i].l.size)}</td>`;
                    let btnDL = tablerow.querySelector(".mydl");
                    btnDL.addEventListener("click", () => {
                      TrialDownLoad(content.songs[i].id, trialMode, filename);
                    });
                    let btnUL = tablerow.querySelector(".myul");
                    btnUL.addEventListener("click", () => {
                      let songItem = { api: { url: "/api/song/enhance/player/url/v1", data: { ids: JSON.stringify([content.songs[i].id]), trialMode, level: "exhigh", encodeType: "mp3" } }, id: content.songs[i].id, title: content.songs[i].name, artist: getArtistTextInSongDetail(content.songs[i]), album: getAlbumTextInSongDetail(content.songs[i]) };
                      let ULobj = new ncmDownUpload([songItem], false);
                      ULobj.startUpload();
                    });
                    tbody.appendChild(tablerow);
                    break;
                  }
                }
              }
            }
          });
        }
      });
    }
    function TrialDownLoad(songId, trialMode, filename) {
      weapiRequest("/api/song/enhance/player/url/v1", {
        data: {
          immerseType: "ste",
          trialMode,
          ids: JSON.stringify([songId]),
          level: "exhigh",
          encodeType: "mp3"
        },
        onload: (content) => {
          if (content.data[0].url !== null) {
            GM_download({
              url: content.data[0].url,
              name: filename + "." + content.data[0].type.toLowerCase(),
              onload: function() {
              },
              onerror: function(e2) {
                console.error(e2);
                showTips("下载失败", 2);
              }
            });
          } else {
            showTips("下载失败", 2);
          }
        }
      });
    }
  };
  const cloudExport = (uiArea) => {
    let btnExport = createBigButton("云盘导出", uiArea, 2);
    btnExport.addEventListener("click", openExportPopup);
    function openExportPopup() {
      Swal.fire({
        title: "云盘导出",
        showCloseButton: true,
        html: `<div><label>歌手<input class="swal2-input" id="text-artist" placeholder="选填"></label></div>
            <div><label>专辑<input class="swal2-input" id="text-album" placeholder="选填"></label></div>
            <div><label>歌名<input class="swal2-input" id="text-song" placeholder="选填"></label></div>
            <div><label>歌单ID<input class="swal2-input" id="text-playlistid" placeholder="选填" type="number"></label></div>`,
        footer: "过滤条件取交集",
        confirmButtonText: "导出",
        preConfirm: () => {
          const container = Swal.getHtmlContainer();
          return [
            container.querySelector("#text-artist").value.trim(),
            container.querySelector("#text-album").value.trim(),
            container.querySelector("#text-song").value.trim(),
            container.querySelector("#text-playlistid").value
          ];
        }
      }).then((result) => {
        if (result.isConfirmed) {
          exportCloud(result.value);
        }
      });
    }
    function exportCloud(filter) {
      showTips("开始导出", 1);
      if (filter[3]) {
        exportCloudByPlaylist(filter);
      } else {
        exportCloudSub(filter, {
          data: []
        }, 0);
      }
    }
    function exportCloudSub(filter, config, offset) {
      showTips(`正在获取第${offset + 1}到${offset + 1e3}首云盘歌曲信息`, 1);
      weapiRequest("/api/v1/cloud/get", {
        data: {
          limit: 1e3,
          offset
        },
        onload: (res) => {
          if (res.code !== 200 || !res.data) {
            setTimeout(exportCloudSub(filter, config, offset), 1e3);
            return;
          }
          let matchSongs = [];
          res.data.forEach((song) => {
            if (song.simpleSong.al && song.simpleSong.al.id > 0) {
              if (filter[0].length > 0) {
                let flag = false;
                for (let i = 0; i < song.simpleSong.ar.length; i++) {
                  if (song.simpleSong.ar[i].name === filter[0]) {
                    flag = true;
                    break;
                  }
                }
                if (!flag) {
                  return;
                }
              }
              if (filter[1].length > 0 && filter[1] !== getAlbumTextInSongDetail(song.simpleSong)) {
                return;
              }
              if (filter[2].length > 0 && filter[2] !== song.simpleSong.name) {
                return;
              }
              let songItem = {
                "id": song.songId,
                "size": song.fileSize,
                "ext": song.fileName.split(".").pop().toLowerCase(),
                "bitrate": song.bitrate,
                "md5": null
              };
              matchSongs.push(songItem);
            } else {
              if (filter[0].length > 0 && song.artist !== filter[0]) {
                return;
              }
              if (filter[1].length > 0 && song.album !== filter[1]) {
                return;
              }
              if (filter[2].length > 0 && song.songName !== filter[2]) {
                return;
              }
              let songItem = {
                "id": song.songId,
                "size": song.fileSize,
                "ext": song.fileName.split(".").pop().toLowerCase(),
                "bitrate": song.bitrate,
                "md5": null,
                "name": song.songName,
                "al": song.album,
                "ar": song.artist
              };
              matchSongs.push(songItem);
            }
          });
          let ids = matchSongs.map((song) => song.id);
          if (ids.length > 0) {
            weapiRequest("/api/song/enhance/player/url/v1", {
              data: {
                ids: JSON.stringify(ids),
                level: "hires",
                encodeType: "mp3"
              },
              onload: (res2) => {
                if (res2.code !== 200 || !res2.data) {
                  setTimeout(exportCloudSub(filter, config, offset), 1e3);
                  return;
                }
                matchSongs.forEach((song) => {
                  let songId = song.id;
                  for (let i = 0; i < res2.data.length; i++) {
                    if (res2.data[i].id === songId) {
                      song.md5 = res2.data[i].md5;
                      config.data.push(song);
                      break;
                    }
                  }
                });
                if (res.hasMore) {
                  exportCloudSub(filter, config, offset + 1e3);
                } else {
                  configToFile(config);
                }
              }
            });
          } else {
            if (res.hasMore) {
              exportCloudSub(filter, config, offset + 1e3);
            } else {
              configToFile(config);
            }
          }
        }
      });
    }
    function exportCloudByPlaylist(filter) {
      weapiRequest("/api/v6/playlist/detail", {
        data: {
          id: filter[3],
          n: 1e5,
          s: 8
        },
        onload: (res) => {
          let trackIds = res.playlist.trackIds.map((item) => {
            return item.id;
          });
          exportCloudByPlaylistSub(filter, trackIds, {
            data: []
          }, 0);
        }
      });
    }
    function exportCloudByPlaylistSub(filter, trackIds, config, offset) {
      let limit = 100;
      if (trackIds.length <= offset) {
        configToFile(config);
        return;
      }
      showTips(`正在获取第${offset + 1}到${Math.min(offset + limit, trackIds.length)}首云盘歌曲信息`, 1);
      weapiRequest("/api/v1/cloud/get/byids", {
        data: {
          songIds: JSON.stringify(trackIds.slice(offset, offset + limit))
        },
        onload: function(res) {
          let matchSongs = [];
          res.data.forEach((song) => {
            if (song.simpleSong.al && song.simpleSong.al.id > 0) {
              if (filter[0].length > 0) {
                let flag = false;
                for (let i = 0; i < song.simpleSong.ar.length; i++) {
                  if (song.simpleSong.ar[i].name === filter[0]) {
                    flag = true;
                    break;
                  }
                }
                if (!flag) {
                  return;
                }
              }
              if (filter[1].length > 0 && filter[1] !== getAlbumTextInSongDetail(song.simpleSong)) {
                return;
              }
              if (filter[2].length > 0 && filter[2] !== song.simpleSong.name) {
                return;
              }
              let songItem = {
                "id": song.songId,
                "size": song.fileSize,
                "ext": song.fileName.split(".").pop().toLowerCase(),
                "bitrate": song.bitrate,
                "md5": null
              };
              matchSongs.push(songItem);
            } else {
              if (filter[0].length > 0 && song.artist !== filter[0]) {
                return;
              }
              if (filter[1].length > 0 && song.album !== filter[1]) {
                return;
              }
              if (filter[2].length > 0 && song.songName !== filter[2]) {
                return;
              }
              let songItem = {
                "id": song.songId,
                "size": song.fileSize,
                "ext": song.fileName.split(".").pop().toLowerCase(),
                "bitrate": song.bitrate,
                "md5": null,
                "name": song.songName,
                "al": song.album,
                "ar": song.artist
              };
              matchSongs.push(songItem);
            }
          });
          let ids = matchSongs.map((song) => song.id);
          if (ids.length > 0) {
            weapiRequest("/api/song/enhance/player/url/v1", {
              data: {
                ids: JSON.stringify(ids),
                level: "hires",
                encodeType: "mp3"
              },
              onload: (res2) => {
                if (res2.code !== 200) {
                  exportCloudByPlaylistSub(filter, trackIds, config, offset);
                  return;
                }
                matchSongs.forEach((song) => {
                  let songId = song.id;
                  for (let i = 0; i < res2.data.length; i++) {
                    if (res2.data[i].id === songId) {
                      song.md5 = res2.data[i].md5;
                      config.data.push(song);
                      break;
                    }
                  }
                });
                exportCloudByPlaylistSub(filter, trackIds, config, offset + limit);
              }
            });
          } else {
            exportCloudByPlaylistSub(filter, trackIds, config, offset + limit);
          }
        }
      });
    }
    function configToFile(config) {
      let content = JSON.stringify(config);
      let temp = document.createElement("a");
      let data = new Blob([content], {
        type: "type/plain"
      });
      let fileurl = URL.createObjectURL(data);
      temp.href = fileurl;
      temp.download = "网易云云盘信息.json";
      temp.click();
      URL.revokeObjectURL(data);
      showTips(`导出云盘信息完成,共${config.data.length}首歌曲`, 1);
    }
  };
  const cloudImport = (uiArea) => {
    let btnImport = createBigButton("云盘导入", uiArea, 2);
    btnImport.addEventListener("click", openImportPopup);
    function openImportPopup() {
      Swal.fire({
        title: "云盘导入",
        input: "file",
        inputAttributes: {
          "accept": "application/json",
          "aria-label": "选择文件"
        },
        confirmButtonText: "导入",
        footer: '<div>如果出现大量报错，可设置请求头，来避免上传失败。</div><div><a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a></div>'
      }).then((result) => {
        if (result.isConfirmed) {
          importCloud(result.value);
        }
      });
    }
    function importCloud(file) {
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e2) => {
        let uploader = new Uploader(JSON.parse(e2.target.result), true);
        uploader.start();
      };
    }
  };
  const musicTag = (uiArea) => {
    let btnImport = createBigButton("音乐标签", uiArea, 2);
    btnImport.addEventListener("click", openMusicTag);
    function openMusicTag() {
      Swal.fire({
        title: "音乐标签",
        confirmButtonText: "添加元数据",
        showCloseButton: true,
        html: `<div id="my-file">
            <input id='song-file' type="file" accept=".mp3,audio/mpeg,.flac,audio/flac"  aria-label='选择文件' multiple="multiple" class="swal2-file" placeholder="" style="display: flex;">
            </div>
            <div>
            <input class="form-check-input" type="checkbox" value="" id="cb-rename" checked><label class="form-check-label" for="cb-rename">完成时按《歌手 - 歌名》重命名文件</label>
            </div>`,
        footer: `<div>为本地文件添加添加的封面歌词等音乐标签，使得文件上传网易云云盘后，不关联的情况下显示封面以及滚动歌词。</div>
            <div>仅支持MP3/FLAC格式</div>`,
        preConfirm: () => {
          const container = Swal.getHtmlContainer();
          const files = container.querySelector("#song-file").files;
          if (files.length == 0) return Swal.showValidationMessage("请选择文件");
          return {
            files,
            rename: container.querySelector("#cb-rename").checked
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const musicTag2 = new MusicFile(result.value);
          musicTag2.openFilesDialog();
        }
      });
    }
    class MusicFile {
      constructor(config) {
        this.files = config.files;
        this.rename = config.rename;
        this.fileList = null;
        this.isAutoFillingSong = false;
        this.albumDetailCache = new Map();
      }
      openFilesDialog() {
        Swal.fire({
          width: "980px",
          showCloseButton: true,
          html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 6%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 30%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 6%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 29%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 29%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th>文件名</th><th></th><th>目标歌曲</th><th>歌手</th></tr></thead><tbody></tbody></table>
`,
          didOpen: async () => {
            const actions = Swal.getActions();
            const container = Swal.getHtmlContainer();
            const promises = Array.from(this.files).map(this.getAudioDuration);
            const results = await Promise.all(promises);
            if (!this.fileList) {
              this.fileList = results.map((result) => ({
                file: result.file,
                fileName: result.file.name,
                ext: result.file.name.split(".").pop().toLowerCase(),
                duration: Math.round(result.duration * 1e3),
                mode: "unfill",
                songDescription: "</td><td>未设置</td><td>"
              }));
            }
            actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-auto-fill" style="display: inline-block;">自动填充目标歌曲</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-add-metadata" style="display: inline-block;">添加元数据</button>`;
            this.songListTbody = container.querySelector("tbody");
            this.refreshSongListTable();
            const btnAutoFill = actions.querySelector("#btn-auto-fill");
            btnAutoFill.addEventListener("click", () => {
              this.autoFillTargetSongs();
            });
            const btnAddMetadata = actions.querySelector("#btn-add-metadata");
            btnAddMetadata.addEventListener("click", () => {
              if (this.isAutoFillingSong) {
                showTips("正在自动填充歌曲信息，请稍候...", 1);
                return;
              }
              this.handleSongTag();
            });
          }
        });
      }
      openSongSelectionDialog(file) {
        Swal.fire({
          showCloseButton: true,
          width: "980px",
          html: `<style>
    table {
        width: 100%;
        height: 400px;
        border-spacing: 0px;
        border-collapse: collapse;
        border: 2px solid #f0f0f0;
    }
    table th, table td {
        text-align: left;
        text-overflow: ellipsis;
    }
    table tbody {
        display: block;
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }
    table thead tr, table tbody tr, table tfoot tr {
        box-sizing: border-box;
        table-layout: fixed;
        display: table;
        width: 100%;
    }
    table tbody tr td{
        border-bottom: none;
    }
tr th:nth-child(1),tr td:nth-child(1){
width: 6%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 6%;
}
tr th:nth-child(3),tr td:nth-child(3){
width: 40%;
}
tr th:nth-child(4),tr td:nth-child(4){
width: 40%;
}
tr th:nth-child(5),tr td:nth-child(5){
width: 8%;
}
</style>
<div><input class="swal2-input" id="search-text" placeholder="搜索"><button type="button" class="swal2-confirm swal2-styled" id="btn-search">搜索</button></div>
<div class="table-wrapper">
<table border="1" frame="hsides" rules="rows"><thead><tr><th>操作</th><th></th><th>歌曲标题</th><th>歌手</th><th>时长</th></tr></thead><tbody></tbody></table>
</div>
`,
          footer: `<div>文件时长 ${duringTimeDesc(file.duration)}</div>`,
          didOpen: () => {
            const container = Swal.getHtmlContainer();
            const actions = Swal.getActions();
            actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-unset" style="display: none;">移除设置</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-custom" style="display: inline-block;">自定义标签内容</button>`;
            const tbody = container.querySelector("tbody");
            const searchText = container.querySelector("#search-text");
            const btnSearch = container.querySelector("#btn-search");
            const btnUnset = actions.querySelector("#btn-unset");
            const btnCustom = actions.querySelector("#btn-custom");
            if (file.mode !== "unfill") {
              btnUnset.style.display = "inline-block";
              btnUnset.addEventListener("click", () => {
                this.unsetSong(file);
                this.openFilesDialog();
              });
            }
            btnCustom.addEventListener("click", () => {
              this.openSongCustomDialog(file);
            });
            searchText.value = file.fileName.substring(0, file.fileName.lastIndexOf("."));
            btnSearch.addEventListener("click", () => {
              const searchWord = searchText.value.trim();
              tbody.innerHTML = "正在搜索...";
              weapiRequest("/api/cloudsearch/get/web", {
                data: {
                  s: searchWord,
                  type: 1,
                  limit: 30,
                  offset: 0,
                  total: true
                },
                onload: (searchContent) => {
                  if (searchContent.code !== 200) {
                    return;
                  }
                  if (searchContent.result.songCount > 0) {
                    tbody.innerHTML = "";
                    const timeMatchSongs = [];
                    const timeNoMatchSongs = [];
                    searchContent.result.songs.forEach((resultSong) => {
                      if (Math.abs(resultSong.dt - file.duration) < 1e3)
                        timeMatchSongs.push(resultSong);
                      else
                        timeNoMatchSongs.push(resultSong);
                    });
                    const resultSongs = timeMatchSongs.concat(timeNoMatchSongs);
                    resultSongs.forEach((resultSong) => {
                      let tablerow = document.createElement("tr");
                      let songName = resultSong.name;
                      const artists = resultSong.ar.map((ar) => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${ar.name}</a>`).join();
                      const needHighLight = Math.abs(resultSong.dt - file.duration) < 1e3;
                      const dtstyle = needHighLight ? "color:SpringGreen;" : "";
                      tablerow.innerHTML = `<td><button type="button" class="swal2-styled selectbtn">选择</button></td><td><a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${resultSong.al.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${songName}</a></td><td>${artists}</td><td style="${dtstyle}">${duringTimeDesc(resultSong.dt)}</td>`;
                      let selectbtn = tablerow.querySelector(".selectbtn");
                      selectbtn.addEventListener("click", () => {
                        file.targetSong = resultSong;
                        file.mode = "netease";
                        file.songDescription = `<a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${resultSong.al.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${songName}</a></td><td>${artists}`;
                        this.openFilesDialog();
                      });
                      tbody.appendChild(tablerow);
                    });
                  } else {
                    tbody.innerHTML = "搜索结果为空";
                  }
                }
              });
            });
            btnSearch.click();
          },
          didClose: () => {
            this.openFilesDialog();
          }
        });
      }
      openSongCustomDialog(file) {
        Swal.fire({
          showCloseButton: true,
          html: `
                <div><label>歌名<input class="swal2-input" id="text-song"></label></div>
                <div><label>歌手<input class="swal2-input" id="text-artist"></label></div>
                <div><label>专辑<input class="swal2-input" id="text-album"></label></div>
                <div><label>封面<input type="file" accept="image/jpeg,image/png" class="swal2-file"  id="text-cover"></label></div>
                <div><label>歌词<textarea id="textarea-lyric" class="swal2-textarea" placeholder="[00:10.000] 第一行..."></textarea></label></div>
                `,
          didOpen: () => {
            const container = Swal.getHtmlContainer();
            const actions = Swal.getActions();
            actions.innerHTML = `<div class="swal2-loader"></div>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-unset" style="display: none;">移除设置</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-netease" style="display: inline-block;">使用网易云信息</button>
                    <button type="button" class="swal2-styled" aria-label="" id="btn-confirm" style="display: inline-block;">设置</button>`;
            const songInput = container.querySelector("#text-song");
            const artistInput = container.querySelector("#text-artist");
            const albumInput = container.querySelector("#text-album");
            const coverInput = container.querySelector("#text-cover");
            const lyricInput = container.querySelector("#textarea-lyric");
            const btnUnset = actions.querySelector("#btn-unset");
            const btnNetease = actions.querySelector("#btn-netease");
            const btnConfirm = actions.querySelector("#btn-confirm");
            if (file.mode !== "unfill") {
              btnUnset.style.display = "inline-block";
              btnUnset.addEventListener("click", () => {
                this.unsetSong(file);
                this.openFilesDialog();
              });
            }
            if (file.customSong) {
              songInput.value = file.customSong.name;
              artistInput.value = file.customSong.artist;
              albumInput.value = file.customSong.album;
              if (file.customSong.cover) {
                const dt = new DataTransfer();
                dt.items.add(file.customSong.cover.file);
                coverInput.files = dt.files;
              }
              lyricInput.value = file.customSong.lyric;
            }
            btnNetease.addEventListener("click", () => {
              this.openSongSelectionDialog(file);
            });
            btnConfirm.addEventListener("click", () => {
              var _a;
              if ((_a = file.customSong) == null ? void 0 : _a.cover) {
                URL.revokeObjectURL(file.customSong.cover.url);
              }
              file.customSong = {
                name: songInput.value,
                artist: artistInput.value,
                album: albumInput.value,
                cover: coverInput.files.length > 0 ? { file: new File([coverInput.files[0]], coverInput.files[0].name), url: URL.createObjectURL(coverInput.files[0]) } : null,
                lyric: lyricInput.value
              };
              file.mode = "custom";
              file.songDescription = file.customSong.cover ? `<img src="${file.customSong.cover.url}" height=50 title="${file.customSong.album}"></td><td>` : "";
              file.songDescription += `${file.customSong.name}</td><td>${file.customSong.artist}`;
              this.openFilesDialog();
            });
          },
          didClose: () => {
            this.openFilesDialog();
          }
        });
      }
      getAudioDuration(file) {
        return new Promise((resolve, reject) => {
          const audio = new Audio();
          const objectUrl = URL.createObjectURL(file);
          audio.addEventListener("loadedmetadata", () => {
            URL.revokeObjectURL(objectUrl);
            resolve({
              duration: audio.duration,
              file
            });
          });
          audio.addEventListener("error", () => {
            URL.revokeObjectURL(objectUrl);
            showTips("无法加载音频文件，请检查文件格式或路径是否正确。", 2);
            reject(new Error(`无法加载文件: ${file.name}`));
          });
          audio.src = objectUrl;
        });
      }
      refreshSongListTable() {
        this.songListTbody.innerHTML = "";
        this.fileList.forEach((item) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                        <td><button type="button" class="swal2-styled"><i class="fa-solid fa-gear"></i></button></td>
                        <td>${item.fileName}</td>
                        <td class="target-song">${item.songDescription}</td>
                    `;
          const selectButton = tr.querySelector(".swal2-styled");
          selectButton.addEventListener("click", () => {
            if (this.isAutoFillingSong) {
              showTips("正在自动填充歌曲信息，请稍候...", 1);
              return;
            }
            if (item.mode === "unfill" || item.mode === "netease") {
              this.openSongSelectionDialog(item);
            } else {
              this.openSongCustomDialog(item);
            }
          });
          this.songListTbody.appendChild(tr);
        });
      }
      async autoFillTargetSongs() {
        if (this.isAutoFillingSong) return;
        this.isAutoFillingSong = true;
        for (let i = 0; i < this.fileList.length; i++) {
          const file = this.fileList[i];
          if (file.mode === "unfill") {
            const searchWord = file.fileName.substring(0, file.fileName.lastIndexOf(".")).normalize("NFC");
            const response = await weapiRequestSync("/api/cloudsearch/get/web", {
              data: {
                s: searchWord,
                type: 1,
                limit: 30,
                offset: 0,
                total: true
              }
            });
            if (response && response.code == 200 && response.result.songCount > 0) {
              for (const resultSong of response.result.songs) {
                if (Math.abs(resultSong.dt - file.duration) < 1e3 && searchWord.toLowerCase().includes(resultSong.name.toLowerCase())) {
                  let songName = resultSong.name;
                  const artists = resultSong.ar.map((ar) => `<a href="https://music.163.com/#/artist?id=${ar.id}" target="_blank">${ar.name}</a>`).join();
                  file.targetSong = resultSong;
                  file.mode = "netease";
                  file.songDescription = `<a href="https://music.163.com/album?id=${resultSong.al.id}" target="_blank"><img src="${resultSong.al.picUrl}?param=50y50&quality=100" title="${resultSong.al.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5"></a></td><td><a href="https://music.163.com/song?id=${resultSong.id}" target="_blank">${songName}</a></td><td>${artists}`;
                  this.refreshSongListTable();
                  break;
                }
              }
            }
          }
          if (i === this.fileList.length - 1) {
            this.isAutoFillingSong = false;
          }
        }
      }
      unsetSong(file) {
        file.targetSong = null;
        file.customSong = null;
        file.songDescription = "</td><td>未设置</td><td>";
        file.mode = "unfill";
      }
      handleSongTag() {
        Swal.fire({
          width: "980px",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showCloseButton: false,
          showConfirmButton: false,
          html: `<style>
table {
    width: 100%;
    border-spacing: 0px;
    border-collapse: collapse;
    border: 2px solid #f0f0f0;
}
table th, table td {
    text-align: left;
    text-overflow: ellipsis;
}
table tbody {
    display: block;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}
table thead tr, table tbody tr, table tfoot tr {
    box-sizing: border-box;
    table-layout: fixed;
    display: table;
    width: 100%;
}
table tbody tr td{
    border-bottom: none;
}
tr th:nth-child(1),tr td:nth-child(1){
width: 50%;
}
tr th:nth-child(2),tr td:nth-child(2){
width: 50%;
}
</style>
<table border="1" frame="hsides" rules="rows"><thead><tr><th>文件名</th><th>进度</th></tr></thead><tbody></tbody></table>
`,
          didOpen: async () => {
            const container = Swal.getHtmlContainer();
            this.selectedSongs = this.fileList.filter((item) => item.mode !== "unfill");
            if (this.selectedSongs.length === 0) {
              this.showFinishBox(0);
              return;
            }
            this.songListTbody = container.querySelector("tbody");
            this.selectedSongs.forEach((song) => {
              const tr = document.createElement("tr");
              tr.innerHTML = `<td>${song.fileName}</td><td>未开始</td>`;
              this.songListTbody.appendChild(tr);
              song.progressDOM = tr.querySelector("td:nth-child(2)");
            });
            let finishCount = 0;
            for (const song of this.selectedSongs) {
              song.progressDOM.innerHTML = "开始处理";
              const fileData = new File([song.file], song.file.name, { type: song.file.type });
              const fileBuffer = await fileData.arrayBuffer();
              const fileFormat = detectAudioFormat(fileBuffer);
              if (fileFormat !== "unknown") {
                song.ext = fileFormat;
              } else {
                song.progressDOM.innerHTML = "不支持该文件格式";
                continue;
              }
              const songTitle = song.mode === "netease" ? song.targetSong.name : song.customSong.name;
              let songArtist = song.mode === "netease" ? song.targetSong.ar.map((ar) => ar.name).join() : song.customSong.artist;
              const songAlbum = song.mode === "netease" ? song.targetSong.al.name : song.customSong.album;
              if (this.rename) {
                const nameWithoutExt = nameFileWithoutExt(songTitle, songArtist, "artist-title");
                if (nameWithoutExt && nameWithoutExt.length > 0) song.fileName = `${nameWithoutExt}.${song.ext}`;
              }
              if (song.mode === "netease") {
                songArtist = song.targetSong.ar.map((ar) => ar.name).join("; ");
              }
              let coverBuffer = null;
              let coverFormat = "image/jpeg";
              if (song.mode === "netease") {
                if (song.targetSong.al.pic > 0) {
                  coverBuffer = await new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                      method: "GET",
                      url: song.targetSong.al.picUrl,
                      responseType: "arraybuffer",
                      onload: (res) => resolve(res.response),
                      onerror: (err) => reject(err)
                    });
                  });
                  coverBuffer = new Uint8Array(coverBuffer).buffer;
                  song.progressDOM.innerHTML = "已获取图片";
                }
              } else {
                if (song.customSong.cover) {
                  let imgext = song.customSong.cover.file.name.split(".").pop().toLowerCase();
                  if (imgext === "jpg") {
                    imgext = "jpeg";
                  }
                  coverFormat = `image/${imgext}`;
                  coverBuffer = await song.customSong.cover.file.arrayBuffer();
                  coverBuffer = new Uint8Array(coverBuffer).buffer;
                  URL.revokeObjectURL(song.customSong.cover.url);
                }
              }
              let lyricText = "";
              if (song.mode === "netease") {
                const requestData = {
                  "/api/song/lyric/v1": JSON.stringify({ id: song.targetSong.id, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0 })
                };
                if (song.targetSong.al.id > 0) {
                  if (this.albumDetailCache[song.targetSong.al.id]) {
                    song.albumDetail = this.albumDetailCache[song.targetSong.al.id];
                  } else {
                    requestData[`/api/v1/album/${song.targetSong.al.id}`] = "{}";
                  }
                }
                const res = await weapiRequestSync("/api/batch", {
                  data: requestData
                });
                const lyricRes = res["/api/song/lyric/v1"];
                if (lyricRes && !lyricRes.pureMusic) {
                  const LyricObj = handleLyric(lyricRes);
                  if (LyricObj && LyricObj.oritlrc && LyricObj.oritlrc.lyric) {
                    lyricText = LyricObj.oritlrc.lyric;
                    song.progressDOM.innerHTML = "已获取歌词";
                  } else if (LyricObj && LyricObj.orilrc && LyricObj.orilrc.parsedLyric.length > 0) {
                    lyricText = LyricObj.orilrc.lyric;
                    song.progressDOM.innerHTML = "已获取歌词";
                  }
                }
                const albumRes = res[`/api/v1/album/${song.targetSong.al.id}`];
                if (albumRes) {
                  song.albumDetail = {
                    publisher: albumRes.album.company.length > 0 ? albumRes.album.company : null,
                    artists: albumRes.album.artists ? albumRes.album.artists.map((artist) => artist.name).join("; ") : null,
                    publishTime: albumRes.album.publishTime > 0 ? dateDesc(albumRes.album.publishTime) : null
                  };
                  this.albumDetailCache[song.targetSong.al.id] = song.albumDetail;
                }
              } else {
                lyricText = song.customSong.lyric.trim();
              }
              if (song.ext === "mp3") {
                const mp3tag = new MP3Tag(fileBuffer);
                mp3tag.read();
                mp3tag.tags.title = songTitle;
                mp3tag.tags.artist = songArtist;
                if (song.mode === "netease") {
                  if (song.targetSong.no && song.targetSong.no > 0) mp3tag.tags.v2.TRCK = String(song.targetSong.no).padStart(2, "0");
                  if (song.targetSong.cd && song.targetSong.cd.length > 0) mp3tag.tags.v2.TPOS = song.targetSong.cd;
                  if (song.albumDetail) {
                    if (song.albumDetail.publisher) {
                      mp3tag.tags.v2.TPUB = song.albumDetail.publisher;
                    }
                    if (song.albumDetail.artists) {
                      mp3tag.tags.v2.TPE2 = song.albumDetail.artists;
                    }
                    if (song.albumDetail.publishTime) {
                      mp3tag.tags.v2.TDRC = song.albumDetail.publishTime;
                    }
                  }
                }
                if (songAlbum.length > 0) mp3tag.tags.album = songAlbum;
                if (coverBuffer) {
                  mp3tag.tags.v2.APIC = [{
                    description: "",
                    data: coverBuffer,
                    type: 3,
                    format: coverFormat
                  }];
                }
                if (lyricText && lyricText.length > 0) {
                  mp3tag.tags.v2.TXXX = [{
                    description: "LYRICS",
                    text: lyricText
                  }];
                }
                mp3tag.save();
                if (mp3tag.error) {
                  console.error("mp3tag.error", mp3tag.error);
                  song.progressDOM.innerHTML = `标记时出错：${mp3tag.error}`;
                  continue;
                }
                const blob = new Blob([mp3tag.buffer], { type: "audio/mp3" });
                const url2 = URL.createObjectURL(blob);
                const downloadRes = await downloadFileSync(url2, sanitizeFilename(song.fileName));
                song.progressDOM.innerHTML = downloadRes;
                URL.revokeObjectURL(url2);
                if (downloadRes.endsWith("完成")) {
                  finishCount += 1;
                }
              } else if (song.ext === "flac") {
                const flac = new MetaFlac(fileBuffer);
                flac.removeAllTags();
                flac.removeAllPictures();
                flac.setTag(`TITLE=${songTitle}`);
                flac.setTag(`ARTIST=${songArtist}`);
                if (song.mode === "netease") {
                  if (song.targetSong.no && song.targetSong.no > 0) flac.setTag(`TRACKNUMBER=${String(song.targetSong.no).padStart(2, "0")}`);
                  if (song.targetSong.cd && song.targetSong.cd.length > 0) flac.setTag(`DISCNUMBER=${song.targetSong.cd}`);
                  if (song.albumDetail) {
                    if (song.albumDetail.publisher) {
                      flac.setTag(`PUBLISHER=${song.albumDetail.publisher}`);
                    }
                    if (song.albumDetail.artists) {
                      flac.setTag(`ALBUMARTIST=${song.albumDetail.artists}`);
                    }
                    if (song.albumDetail.publishTime) {
                      flac.setTag(`DATE=${song.albumDetail.publishTime}`);
                    }
                  }
                }
                if (songAlbum.length > 0) flac.setTag(`ALBUM=${songAlbum}`);
                if (lyricText.length > 0) flac.setTag(`LYRICS=${lyricText}`);
                if (coverBuffer) await flac.importPictureFromBuffer(coverBuffer, coverFormat);
                const newBuffer = flac.save();
                const blob = new Blob([newBuffer], { type: "audio/flac" });
                const url2 = URL.createObjectURL(blob);
                const downloadRes = await downloadFileSync(url2, sanitizeFilename(song.fileName));
                song.progressDOM.innerHTML = downloadRes;
                URL.revokeObjectURL(url2);
                if (downloadRes.endsWith("完成")) {
                  finishCount += 1;
                }
              }
            }
            this.showFinishBox(finishCount);
          }
        });
      }
      showFinishBox(finishCount) {
        Swal.update({
          allowOutsideClick: true,
          allowEscapeKey: true,
          showCloseButton: true,
          showConfirmButton: true,
          html: Swal.getHtmlContainer().innerHTML,
          footer: `已完成。共 ${finishCount} 首文件添加了标签`
        });
      }
    }
  };
  const cloudDeduplication = (uiArea) => {
    const btnDeduplication = createBigButton("云盘去重", uiArea, 2);
    btnDeduplication.addEventListener("click", () => {
      const deduplication = new CloudDeduplication();
      deduplication.showConfigPopUp();
    });
  };
  class CloudDeduplication {
    constructor() {
      this.cloudCountLimit = 1e3;
      this.config = {
durationGroupEnabled: true,
durationThreshold: 1,
        explicitDedup: false
      };
      this.cloudDeduplicationSongList = [];
      this.cloudSongUniqueMap = {};
      this.deduplication = {
        working: false,
        stopFlag: false
      };
      this.selectedGroups = new Set();
    }
    showConfigPopUp() {
      Swal.fire({
        title: "云盘去重设置",
        width: "700px",
        showCloseButton: true,
        html: `
            <div>
                <div>是否使用以下属性区分歌曲？</div>
                <div style="margin-top:6px;">
                    <label><input type="checkbox" id="cd-duration-group-enabled" checked> 时长，差值小于<input type="number" id="cd-duration-threshold" step="0.1" min="0" max="60" value="1" style="width:40px;height:25px;margin-left:6px;">秒时，视为时长相同</label>
                </div>
                <div style="margin-top:6px;"><label><input type="checkbox" id="cd-deduplication-explicit" checked> 脏标（如<a href="https://music.163.com/#/song?id=1859245776" target="_blank">STAY(🅴)</a>和<a href="https://music.163.com/#/song?id=1859306637" target="_blank">STAY</a>）</label></div>
            </div>
            `,
        confirmButtonText: "开始查找重复歌曲",
        footer: "<div>手机客户端有回收站功能，误删请从那里恢复。</div><div>live歌曲不去重，因为无法区分是否重复。</div><div>没有用语言区分，因此如《K歌之王》国粤不同版本的歌曲可能会视为重复。</div>",
        preConfirm: () => {
          const container = Swal.getHtmlContainer();
          const durationEnabledEl = container.querySelector("#cd-duration-group-enabled");
          const durationThresholdEl = container.querySelector("#cd-duration-threshold");
          let threshold = 1;
          try {
            threshold = parseFloat(durationThresholdEl.value);
            if (isNaN(threshold) || threshold < 0) threshold = 1;
            threshold = Math.round(threshold * 10) / 10;
          } catch (e2) {
            threshold = 1;
          }
          return {
            durationGroupEnabled: !!(durationEnabledEl && durationEnabledEl.checked),
            durationThreshold: threshold,
            explicitDedup: container.querySelector("#cd-deduplication-explicit").checked
          };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          this.config = result.value;
          this.showFetchAllCloudSongPopUp();
        }
      });
    }
    showFetchAllCloudSongPopUp() {
      Swal.fire({
        input: "textarea",
        inputLabel: "获取云盘歌曲信息",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: false,
        showConfirmButton: false,
        inputAttributes: {
          readonly: true
        },
        didOpen: async () => {
          const textarea = Swal.getInput();
          textarea.style = "height: 300px;";
          function addLog(log) {
            textarea.value += log + "\n";
            textarea.scrollTop = textarea.scrollHeight;
          }
          let offset = 0;
          const limit = 1e3;
          let hasMore = true;
          while (hasMore) {
            const content = await weapiRequestSync("/api/v1/cloud/get", {
              data: {
                limit: this.cloudCountLimit,
                offset
              }
            });
            if (content.code !== 200) {
              addLog(`获取云盘歌曲信息失败,剩余歌曲不获取`);
              break;
            }
            if (offset === 0) {
              addLog(`总共${content.count}首云盘歌曲`);
            }
            addLog(`获取第${offset + 1}到第${offset + limit}首`);
            for (const song of content.data) {
              if (song.matchType === "unmatched") {
                continue;
              }
              if (liveRegex.test(song.simpleSong.name.toLowerCase())) {
                continue;
              }
              const songItem = {
                id: song.simpleSong.id,
                name: song.simpleSong.name,
                artist: song.simpleSong.ar,
                album: song.simpleSong.al,
                duration: song.simpleSong.dt,
                mark: song.simpleSong.mark,
                publishTime: song.simpleSong.publishTime,
                pop: song.simpleSong.pop,
                fileSize: song.fileSize
              };
              const item = {
                name: songItem.name,
                artists: songItem.artist ? songItem.artist.map((a) => a.name).sort() : [],
                explicit: !this.config.explicitDedup || (songItem.mark & 1048576) === 1048576
              };
              const md5 = getMD5(JSON.stringify(item));
              if (!this.cloudSongUniqueMap[md5]) {
                this.cloudSongUniqueMap[md5] = [songItem];
              } else {
                this.cloudSongUniqueMap[md5].push(songItem);
              }
            }
            offset += limit;
            hasMore = content.hasMore;
          }
          addLog(`开始处理数据找重复歌曲`);
          for (const [md5, songs] of Object.entries(this.cloudSongUniqueMap)) {
            if (songs.length > 1) {
              if (this.config.durationGroupEnabled) {
                const thresholdMs = Math.round((this.config.durationThreshold || 1) * 1e3);
                const songDurationMap = {};
                for (const song of songs) {
                  let found = false;
                  for (const [durationKey, group] of Object.entries(songDurationMap)) {
                    if (Math.abs(parseInt(durationKey) - song.duration) < thresholdMs) {
                      group.push(song);
                      found = true;
                      break;
                    }
                  }
                  if (!found) {
                    songDurationMap[song.duration] = [song];
                  }
                }
                for (const group of Object.values(songDurationMap)) {
                  if (group.length > 1) {
                    this.cloudDeduplicationSongList.push(group);
                  }
                }
              } else {
                this.cloudDeduplicationSongList.push(songs);
              }
            }
          }
          if (this.cloudDeduplicationSongList.length > 0) {
            console.log(this.cloudDeduplicationSongList);
            this.showDeduplicationSongs();
          } else {
            showConfirmBox(`未找到重复歌曲`);
          }
        }
      });
    }
    showDeduplicationSongs() {
      Swal.fire({
        title: "重复歌曲列表",
        width: "980px",
        showCloseButton: true,
        showConfirmButton: false,
        html: "",
        footer: "<div>去重：对于已勾选的重复组，删除重复歌曲，只保留歌曲收藏量最高的一首。</div>",
        didOpen: () => {
          const container = Swal.getHtmlContainer();
          container.innerHTML = "";
          const wrapper = document.createElement("div");
          wrapper.style.maxHeight = "60vh";
          wrapper.style.overflow = "auto";
          const outerTable = document.createElement("table");
          outerTable.style.width = "100%";
          outerTable.style.borderCollapse = "collapse";
          outerTable.style.fontSize = "13px";
          function markBtnDeleted(delBtn) {
            if (!delBtn) return;
            delBtn.textContent = "已删除";
            delBtn.disabled = true;
            delBtn.style.opacity = "0.6";
            delBtn.style.cursor = "not-allowed";
          }
          function updateDeleteButtonState(songId) {
            const delBtn = container.querySelector(`.cd-del-btn[data-song-id="${songId}"]`);
            markBtnDeleted(delBtn);
          }
          const pageLimit = 20;
          let currentPage = 1;
          const totalGroups = this.cloudDeduplicationSongList.length;
          const pageMax = Math.max(1, Math.ceil(totalGroups / pageLimit));
          const createGroupRow = (group, groupIndex) => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #e6e6e6";
            const td = document.createElement("td");
            td.style.padding = "8px";
            const nestedContainer = document.createElement("div");
            nestedContainer.style.width = "100%";
            nestedContainer.style.boxSizing = "border-box";
            const rep = group[0];
            const headerRow = document.createElement("div");
            headerRow.style.display = "flex";
            headerRow.style.alignItems = "center";
            headerRow.style.padding = "8px";
            headerRow.style.background = "#fafafa";
            headerRow.style.borderBottom = "1px solid #ddd";
            headerRow.style.fontWeight = "600";
            headerRow.style.gap = "8px";
            headerRow.style.boxSizing = "border-box";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "cd-group-checkbox";
            checkbox.setAttribute("data-group-id", groupIndex);
            checkbox.style.cursor = "pointer";
            checkbox.style.width = "18px";
            checkbox.style.height = "18px";
            checkbox.style.flexShrink = "0";
            checkbox.checked = this.selectedGroups.has(groupIndex);
            checkbox.addEventListener("change", () => {
              if (checkbox.checked) this.selectedGroups.add(groupIndex);
              else this.selectedGroups.delete(groupIndex);
              updateDeduplicationBtnText();
            });
            headerRow.appendChild(checkbox);
            const artistNames = (rep.artist || []).map((a) => a.name).join("/");
            const titleSpan = document.createElement("span");
            titleSpan.textContent = `${rep.name || ""} — ${artistNames}`;
            headerRow.appendChild(titleSpan);
            nestedContainer.appendChild(headerRow);
            group.forEach((song) => {
              const row = document.createElement("div");
              row.style = "display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid #f5f5f5;width:100%;box-sizing:border-box;min-width:0;";
              const coverHtml = `
                              <div style="flex: 0 0 72px; display:flex;align-items:center;justify-content:center;">
                                <a href="https://music.163.com/#/song?id=${song.id}" target="_blank" title="${song.album && song.album.name ? song.album.name : ""}" style="display:block;">
                                  <img src="${song.album && song.album.picUrl ? song.album.picUrl + "?param=50y50&quality=100" : ""}" alt="cover" style="width:50px;height:50px;object-fit:cover;border-radius:6px;background:#f5f5f5;">
                                </a>
                              </div>`;
              const albumHtml = `
                              <div style="flex:1 1 160px;min-width:0;overflow:hidden;">
                                <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                  <a href="https://music.163.com/#/album?id=${song.album && song.album.id ? song.album.id : ""}" target="_blank" style="color:#000;text-decoration:none">${song.album && song.album.name ? song.album.name : ""}</a>
                                </div>
                              </div>`;
              const publishHtml = `<div style="flex:0 0 90px;color:#666;font-size:13px;">${dateDesc(song.publishTime)}</div>`;
              const sizeHtml = `<div style="flex:0 0 110px;color:#666;font-size:13px;">${fileSizeDesc(song.fileSize)}</div>`;
              const durationHtml = `<div style="flex:0 0 70px;color:#666;font-size:13px;">${duringTimeDesc(song.duration)}</div>`;
              const actionsHtml = `<div style="flex:0 0 140px;display:flex;gap:8px;justify-content:flex-end;"> <button class="cd-del-btn swal2-styled" type="button" data-song-id="${song.id}">删除</button></div>`;
              row.innerHTML = coverHtml + albumHtml + publishHtml + sizeHtml + durationHtml + actionsHtml;
              const delBtn = row.querySelector(".cd-del-btn");
              if (song.deleted) {
                markBtnDeleted(delBtn);
              }
              delBtn.addEventListener("click", () => {
                Swal.fire({
                  icon: "warning",
                  title: "确认删除这首歌曲吗？",
                  text: `确定要删除《${song.name}》吗？`,
                  showCancelButton: true,
                  confirmButtonText: "删除",
                  cancelButtonText: "取消",
                  didClose: () => {
                    this.showDeduplicationSongs();
                  }
                }).then(async (res) => {
                  if (res.isConfirmed) {
                    try {
                      const deleteRes = await weapiRequestSync("/api/cloud/del", {
                        method: "POST",
                        data: { songIds: [song.id] }
                      });
                      if (deleteRes.code === 200) {
                        song.deleted = true;
                        updateDeleteButtonState(song.id);
                        showTips("已删除");
                      } else {
                        const msg = deleteRes.message || "删除失败";
                        showTips(msg);
                      }
                    } catch (e2) {
                      showTips(`删除出错: ${e2.message}`);
                    }
                  }
                });
              });
              nestedContainer.appendChild(row);
            });
            td.appendChild(nestedContainer);
            tr.appendChild(td);
            return tr;
          };
          const renderPage = () => {
            outerTable.innerHTML = "";
            const start = (currentPage - 1) * pageLimit;
            const end = Math.min(totalGroups, start + pageLimit);
            for (let idx = start; idx < end; idx++) {
              const group = this.cloudDeduplicationSongList[idx];
              const tr = createGroupRow(group, idx);
              outerTable.appendChild(tr);
            }
            updatePageArea();
          };
          const updatePageArea = () => {
            const footerEl = Swal.getFooter();
            footerEl.style.display = "block";
            const pageAreaId = "cd-page-area";
            let pageArea = footerEl.querySelector(`#${pageAreaId}`);
            if (!pageArea) {
              pageArea = document.createElement("div");
              pageArea.id = pageAreaId;
              pageArea.style.cssText = "display:flex;gap:6px;justify-content:center;flex-wrap:wrap;";
              footerEl.insertBefore(pageArea, footerEl.firstChild);
            }
            pageArea.innerHTML = "";
            const pageIndexs = [1];
            const floor = Math.max(2, currentPage - 2);
            const ceil = Math.min(pageMax - 1, currentPage + 2);
            for (let i = floor; i <= ceil; i++) pageIndexs.push(i);
            if (pageMax > 1) pageIndexs.push(pageMax);
            pageIndexs.forEach((pageIndex) => {
              const pageBtn = document.createElement("button");
              pageBtn.setAttribute("type", "button");
              pageBtn.className = "swal2-styled";
              pageBtn.innerHTML = pageIndex;
              pageBtn.style.padding = "6px 12px";
              pageBtn.style.minWidth = "40px";
              if (pageIndex !== currentPage) {
                pageBtn.addEventListener("click", () => {
                  currentPage = pageIndex;
                  renderPage();
                });
              } else {
                pageBtn.style.background = "#cccccc";
                pageBtn.disabled = true;
              }
              pageArea.appendChild(pageBtn);
            });
          };
          renderPage();
          const headerBar = document.createElement("div");
          headerBar.id = "cd-header-bar";
          headerBar.style.cssText = "display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;";
          const btnSelectAll = document.createElement("button");
          btnSelectAll.type = "button";
          btnSelectAll.className = "swal2-styled";
          btnSelectAll.id = "btn-selectall";
          btnSelectAll.textContent = "全部选择";
          const btnCancelAll = document.createElement("button");
          btnCancelAll.type = "button";
          btnCancelAll.className = "swal2-styled";
          btnCancelAll.id = "btn-cancelall";
          btnCancelAll.textContent = "全部取消";
          const btnPageSelectAll = document.createElement("button");
          btnPageSelectAll.type = "button";
          btnPageSelectAll.className = "swal2-styled";
          btnPageSelectAll.id = "btn-page-selectall";
          btnPageSelectAll.textContent = "本页全选";
          const btnPageCancelAll = document.createElement("button");
          btnPageCancelAll.type = "button";
          btnPageCancelAll.className = "swal2-styled";
          btnPageCancelAll.id = "btn-page-cancelall";
          btnPageCancelAll.textContent = "本页全取消";
          const btnDeduplication = document.createElement("button");
          btnDeduplication.type = "button";
          btnDeduplication.className = "swal2-styled";
          btnDeduplication.id = "btn-deduplication";
          btnDeduplication.textContent = "去重已选";
          headerBar.appendChild(btnSelectAll);
          headerBar.appendChild(btnCancelAll);
          headerBar.appendChild(btnPageSelectAll);
          headerBar.appendChild(btnPageCancelAll);
          headerBar.appendChild(btnDeduplication);
          container.appendChild(headerBar);
          wrapper.appendChild(outerTable);
          container.appendChild(wrapper);
          const updateDeduplicationBtnText = () => {
            let groupCount = 0;
            let songCount = 0;
            for (const groupId of this.selectedGroups) {
              const group = this.cloudDeduplicationSongList[groupId];
              if (group) {
                groupCount++;
                songCount += group.length;
              }
            }
            if (groupCount > 0) {
              btnDeduplication.textContent = `去重${groupCount}组${songCount}首歌曲`;
            } else {
              btnDeduplication.textContent = "去重已选";
            }
          };
          updateDeduplicationBtnText();
          btnSelectAll.addEventListener("click", () => {
            for (let i = 0; i < totalGroups; i++) {
              this.selectedGroups.add(i);
            }
            const checkboxes = container.querySelectorAll(".cd-group-checkbox");
            checkboxes.forEach((cb) => {
              cb.checked = true;
            });
            updateDeduplicationBtnText();
          });
          btnCancelAll.addEventListener("click", () => {
            this.selectedGroups.clear();
            const checkboxes = container.querySelectorAll(".cd-group-checkbox");
            checkboxes.forEach((cb) => {
              cb.checked = false;
            });
            updateDeduplicationBtnText();
          });
          btnPageSelectAll.addEventListener("click", () => {
            const checkboxes = container.querySelectorAll(".cd-group-checkbox");
            checkboxes.forEach((cb) => {
              cb.checked = true;
              const gid = parseInt(cb.getAttribute("data-group-id"));
              this.selectedGroups.add(gid);
            });
            updateDeduplicationBtnText();
          });
          btnPageCancelAll.addEventListener("click", () => {
            const checkboxes = container.querySelectorAll(".cd-group-checkbox");
            checkboxes.forEach((cb) => {
              cb.checked = false;
              const gid = parseInt(cb.getAttribute("data-group-id"));
              this.selectedGroups.delete(gid);
            });
            updateDeduplicationBtnText();
          });
          btnDeduplication.addEventListener("click", async () => {
            if (this.deduplication.working) {
              this.deduplication.stopFlag = true;
              btnDeduplication.textContent = "正在停止";
              btnDeduplication.disabled = true;
              return;
            }
            if (this.selectedGroups.size === 0) {
              showTips("请先选择要去重的分组");
              return;
            }
            this.deduplication.working = true;
            this.deduplication.stopFlag = false;
            btnDeduplication.textContent = "停止";
            btnDeduplication.disabled = false;
            const groupsToProcess = Array.from(this.selectedGroups).map((groupId) => {
              return this.cloudDeduplicationSongList[groupId];
            });
            for (const group of groupsToProcess) {
              if (this.deduplication.stopFlag) {
                break;
              }
              const activeSongs = group.filter((song) => !song.deleted);
              if (activeSongs.length <= 1) continue;
              let errorOccurred = false;
              for (const song of activeSongs) {
                try {
                  const countRes = await weapiRequestSync("/api/song/red/count", {
                    data: { songId: song.id }
                  });
                  if (countRes.code === 200 && countRes.data) {
                    song.redCount = countRes.data.count || 0;
                  } else {
                    showTips(`获取歌曲 ${song.name} 收藏量出错: ${e.message}`, 2);
                    errorOccurred = true;
                  }
                } catch (e2) {
                  showTips(`获取歌曲 ${song.name} 收藏量出错: ${e2.message}`, 2);
                  errorOccurred = true;
                }
              }
              if (errorOccurred) {
                continue;
              }
              const sorted = activeSongs.sort((a, b) => {
                const redCountDiff = (b.redCount || 0) - (a.redCount || 0);
                if (redCountDiff !== 0) return redCountDiff;
                const publishTimeDiff = (a.publishTime || 0) - (b.publishTime || 0);
                if (publishTimeDiff !== 0) return publishTimeDiff;
                return a.id - b.id;
              });
              const toDelete = sorted.slice(1);
              if (this.deduplication.stopFlag) {
                break;
              }
              try {
                const result = await weapiRequestSync("/api/cloud/del", {
                  data: { songIds: toDelete.map((song) => song.id) }
                });
                if (result.code !== 200) {
                  showTips(`删除 ${toDelete[0].name} 的重复歌曲失败`, 2);
                  return;
                } else {
                  showTips(`成功删除 ${toDelete.length} 首 ${toDelete[0].name} 的重复歌曲`, 1);
                }
                toDelete.forEach((song) => {
                  song.deleted = true;
                  updateDeleteButtonState(song.id);
                });
              } catch (e2) {
                showTips(`删除歌曲 ${toDelete[0].name} 出错: ${e2.message}`, 2);
                return;
              }
            }
            this.deduplication.working = false;
            this.deduplication.stopFlag = false;
            btnDeduplication.disabled = false;
            updateDeduplicationBtnText();
            if (!this.deduplication.stopFlag) {
              showTips("去重已完成");
            } else {
              showTips("去重已停止");
            }
          });
        },
        willClose: () => {
          this.deduplication.stopFlag = true;
        }
      });
    }
  }
  const myHomeMain = (userId) => {
    const isUserHome = userId === unsafeWindow.GUser.userId;
    let editArea = document.querySelector("#head-box > dd > div.name.f-cb > div > div.edit");
    if (isUserHome && editArea) {
      myCloudDisk(editArea);
      cloudUpload(editArea);
      cloudUpgrade(editArea);
      cloudDeduplication(editArea);
      cloudLocalUpload(editArea);
      freeVIPSong(editArea);
      cloudExport(editArea);
      cloudImport(editArea);
      musicTag(editArea);
      scriptSettings(editArea);
    }
  };
  class SongDetail {
    constructor() {
      this.domReady = false;
      this.dataFetched = false;
      this.flag = true;
    }
    fetchSongData(songId) {
      this.songId = songId;
      weapiRequest("/api/batch", {
        data: {
          "/api/v3/song/detail": JSON.stringify({ c: JSON.stringify([{ "id": this.songId }]) }),
          "/api/song/music/detail/get": JSON.stringify({ "songId": this.songId, "immerseType": "ste" }),
          "/api/song/red/count": JSON.stringify({ "songId": this.songId }),
          "/api/song/lyric/v1": JSON.stringify({ id: this.songId, cp: false, tv: 0, lv: 0, rv: 0, kv: 0, yv: 0, ytv: 0, yrv: 0 }),
          "/api/song/play/about/block/page": JSON.stringify({ "songId": this.songId })
        },
        onload: (res) => {
          console.log(res);
          this.SongRes = res;
          this.dataFetched = true;
          this.checkStartCreateDom();
        }
      });
    }
    onDomReady() {
      this.maindDiv = document.querySelector(".cvrwrap");
      this.domReady = true;
      this.checkStartCreateDom();
    }
    checkStartCreateDom() {
      if (this.domReady && this.dataFetched && this.flag) {
        this.flag = false;
        this.createDoms();
      }
    }
    createDoms() {
      var _a, _b, _c, _d, _e, _f, _g;
      this.songDetailObj = this.SongRes["/api/v3/song/detail"].songs[0];
      this.title = this.songDetailObj.name;
      this.album = getAlbumTextInSongDetail(this.songDetailObj);
      this.artist = getArtistTextInSongDetail(this.songDetailObj);
      this.filename = nameFileWithoutExt(this.title, this.artist, "artist-title");
      this.songDetailObj = this.songDetailObj;
      if (this.SongRes["/api/v3/song/detail"].privileges[0].plLevel !== "none") {
        this.createTitle("下载歌曲");
        this.downLoadTableBody = this.createTable().querySelector("tbody");
        const plLevel = this.SongRes["/api/v3/song/detail"].privileges[0].plLevel;
        const dlLevel = this.SongRes["/api/v3/song/detail"].privileges[0].dlLevel;
        const songPlWeight = levelWeight[plLevel] || 0;
        const songDlWeight = levelWeight[dlLevel] || 0;
        const songDetail = this.SongRes["/api/song/music/detail/get"].data;
        if (this.SongRes["/api/v3/song/detail"].privileges[0].cs) {
          this.createDLRow(`云盘文件 ${this.SongRes["/api/v3/song/detail"].songs[0].pc.br}k`, plLevel, "pl");
        } else {
          this.createTitle("转存云盘");
          this.upLoadTableBody = this.createTable().querySelector("tbody");
          if (songDlWeight > songPlWeight && this.SongRes["/api/v3/song/detail"].privileges[0].fee === 0) {
            const channel2 = "dl";
            if (songDetail.hr && songDlWeight >= 5 && songPlWeight < 5) {
              const desc = `${Math.round(songDetail.hr.br / 1e3)}k	${fileSizeDesc(songDetail.hr.size)}	${songDetail.hr.sr / 1e3}kHz`;
              const level = "hires";
              this.createDLRow(desc, level, channel2);
              this.createULRow(desc, level, channel2);
            }
            if (songDetail.sq && songDlWeight >= 4 && songPlWeight < 4) {
              const desc = `${Math.round(songDetail.sq.br / 1e3)}k	${fileSizeDesc(songDetail.sq.size)}	${songDetail.sq.sr / 1e3}kHz`;
              const level = "lossless";
              this.createDLRow(desc, level, channel2);
              this.createULRow(desc, level, channel2);
            }
            if (songDetail.h && songDlWeight >= 3 && songPlWeight < 3) {
              const desc = `${Math.round(songDetail.h.br / 1e3)}k	${fileSizeDesc(songDetail.h.size)}`;
              const level = "exhigh";
              this.createDLRow(desc, level, channel2);
              this.createULRow(desc, level, channel2);
            }
            if (songDetail.m && songDlWeight >= 2 && songPlWeight < 2) {
              const desc = `${Math.round(songDetail.m.br / 1e3)}k	${fileSizeDesc(songDetail.m.size)}`;
              const level = "higher";
              this.createDLRow(desc, level, channel2);
              this.createULRow(desc, level, channel2);
            }
          }
          const channel = "pl";
          if (songDetail.jm && songPlWeight >= 7) {
            const desc = `${Math.round(songDetail.jm.br / 1e3)}k	${fileSizeDesc(songDetail.jm.size)}	${songDetail.jm.sr / 1e3}kHz`;
            const level = "jymaster";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.db && songPlWeight >= 7) {
            const desc = `${Math.round(songDetail.db.br / 1e3)}k	${fileSizeDesc(songDetail.db.size)}	${songDetail.db.sr / 1e3}kHz`;
            const level = "dolby";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.sk && songPlWeight >= 7) {
            const desc = `${Math.round(songDetail.sk.br / 1e3)}k	${fileSizeDesc(songDetail.sk.size)}	${songDetail.sk.sr / 1e3}kHz`;
            const level = "sky";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.je && songPlWeight >= 4) {
            const desc = `${Math.round(songDetail.je.br / 1e3)}k	${fileSizeDesc(songDetail.je.size)}	${songDetail.je.sr / 1e3}kHz`;
            const level = "jyeffect";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.hr && songPlWeight >= 4) {
            const desc = `${Math.round(songDetail.hr.br / 1e3)}k	${fileSizeDesc(songDetail.hr.size)}	${songDetail.hr.sr / 1e3}kHz `;
            const level = "hires";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.sq && songPlWeight >= 4) {
            const desc = `${Math.round(songDetail.sq.br / 1e3)}k ${fileSizeDesc(songDetail.sq.size)}	${songDetail.sq.sr / 1e3}kHz`;
            const level = "lossless";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.h && songPlWeight >= 3) {
            const desc = `${Math.round(songDetail.h.br / 1e3)}k ${fileSizeDesc(songDetail.h.size)}`;
            const level = "exhigh";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.m && songPlWeight >= 2) {
            const desc = `${Math.round(songDetail.m.br / 1e3)}k ${fileSizeDesc(songDetail.m.size)}`;
            const level = "higher";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          if (songDetail.l && songPlWeight >= 1) {
            const desc = `${Math.round(songDetail.l.br / 1e3)}k ${fileSizeDesc(songDetail.l.size)}`;
            const level = "standard";
            this.createDLRow(desc, level, channel);
            this.createULRow(desc, level, channel);
          }
          this.createHideButtonRow(this.downLoadTableBody);
          this.createHideButtonRow(this.upLoadTableBody);
        }
      }
      this.createTitle("歌曲其他信息");
      this.infoTableBody = this.createTable().querySelector("tbody");
      if (!this.SongRes["/api/song/lyric/v1"].pureMusic) {
        this.lyricObj = handleLyric(this.SongRes["/api/song/lyric/v1"]);
        if (this.lyricObj.orilrc.lyric.length > 0) {
          this.lyricBlock = this.createTableRow(this.infoTableBody, "下载歌词");
          if (this.lyricObj.oritlrc) {
            let btn2 = this.createButton("原歌词+翻译");
            btn2.addEventListener("click", () => {
              this.downloadLyric("oritlrc");
            });
            this.lyricBlock.appendChild(btn2);
          }
          if (this.lyricObj.oriromalrc) {
            let btn2 = this.createButton("罗马音+原歌词");
            btn2.addEventListener("click", () => {
              this.downloadLyric("oriromalrc");
            });
            this.lyricBlock.appendChild(btn2);
          }
          let btn = this.createButton("原歌词");
          btn.addEventListener("click", () => {
            this.downloadLyric("orilrc");
          });
          this.lyricBlock.appendChild(btn);
        }
      }
      if (this.songDetailObj.al.picUrl) {
        let btn = this.createButton("专辑封面原图");
        btn.href = this.songDetailObj.al.picUrl;
        btn.target = "_blank";
        this.createButtonDescTableRow(this.infoTableBody, btn, null);
      }
      if (this.SongRes["/api/song/red/count"].data.count > 0) {
        let redBlock = this.createTableRow(this.infoTableBody, "红心数量");
        redBlock.innerHTML = `<span>${this.SongRes["/api/song/red/count"].data.count}</span>`;
      }
      if (this.songDetailObj.originCoverType > 0) {
        let originCoverTypeBlock = this.createTableRow(this.infoTableBody, "原唱翻唱类型");
        originCoverTypeBlock.innerHTML = `<span>${this.songDetailObj.originCoverType === 1 ? "原唱" : "翻唱"}</span>`;
      }
      if ((this.songDetailObj.mark & songMark.explicit) === songMark.explicit) {
        let explicitBlock = this.createTableRow(this.infoTableBody, "🅴");
        explicitBlock.innerHTML = `内容含有不健康因素`;
      }
      for (let block of this.SongRes["/api/song/play/about/block/page"].data.blocks) {
        if (block.code === "SONG_PLAY_ABOUT_MUSIC_MEMORY" && block.creatives.length > 0) {
          for (let creative of block.creatives) {
            for (let resource of creative.resources) {
              if (resource.resourceType === "FIRST_LISTEN") {
                let firstTimeBlock = this.createTableRow(this.infoTableBody, "第一次听");
                firstTimeBlock.innerHTML = resource.resourceExt.musicFirstListenDto.date;
              } else if (resource.resourceType === "TOTAL_PLAY") {
                let recordBlock = this.createTableRow(this.infoTableBody, "累计播放");
                let recordText = ` ${resource.resourceExt.musicTotalPlayDto.playCount}次`;
                if (resource.resourceExt.musicTotalPlayDto.duration > 0) {
                  recordText += ` ${resource.resourceExt.musicTotalPlayDto.duration}分钟`;
                }
                if (resource.resourceExt.musicTotalPlayDto.text.length > 0) {
                  recordText += " " + resource.resourceExt.musicTotalPlayDto.text;
                }
                recordBlock.innerHTML = recordText;
              }
            }
          }
        }
        if (block.code === "SONG_PLAY_ABOUT_SONG_BASIC" && block.creatives.length > 0) {
          for (let creative of block.creatives) {
            if (creative.creativeType === "sheet" && creative.resources.length === 0) continue;
            if (!((_a = creative == null ? void 0 : creative.uiElement) == null ? void 0 : _a.mainTitle)) continue;
            let wikiItemBlock = this.createTableRow(this.infoTableBody, creative.uiElement.mainTitle.title);
            if (creative.uiElement.descriptions) {
              let descriptionDiv = document.createElement("div");
              for (let description of creative.uiElement.descriptions) {
                let descriptionP = this.createText(description.description);
                descriptionDiv.appendChild(descriptionP);
              }
              wikiItemBlock.appendChild(descriptionDiv);
            }
            if (creative.uiElement.textLinks) {
              for (let textLink of creative.uiElement.textLinks) {
                let textLinkP = this.createText(textLink.text);
                wikiItemBlock.appendChild(textLinkP);
              }
            }
            if (creative.resources) {
              for (let resource of creative.resources) {
                let resourceDiv = document.createElement("div");
                resourceDiv.className = "des s-fc3";
                if (resource.uiElement.mainTitle) {
                  let IsLink = ((_c = (_b = resource.action) == null ? void 0 : _b.clickAction) == null ? void 0 : _c.action) === 1 && ((_e = (_d = resource.action) == null ? void 0 : _d.clickAction) == null ? void 0 : _e.targetUrl.startsWith("https://"));
                  let mainTitleItem = IsLink ? this.createButton(resource.uiElement.mainTitle.title) : this.createText(resource.uiElement.mainTitle.title);
                  if (IsLink) {
                    mainTitleItem.target = "_blank";
                    mainTitleItem.href = (_g = (_f = resource.action) == null ? void 0 : _f.clickAction) == null ? void 0 : _g.targetUrl;
                  }
                  wikiItemBlock.appendChild(mainTitleItem);
                }
                if (resource.uiElement.subTitles) {
                  let subTitleP = this.createText(resource.uiElement.subTitles.map((t) => t.title).join(" "));
                  subTitleP.innerHTML = resource.uiElement.subTitles.map((t) => t.title).join(" ");
                  wikiItemBlock.appendChild(subTitleP);
                }
                if (resource.uiElement.descriptions) {
                  for (let description of resource.uiElement.descriptions) {
                    let descriptionP = this.createText(description.description);
                    wikiItemBlock.appendChild(descriptionP);
                  }
                }
                if (resource.uiElement.images) {
                  for (let image of resource.uiElement.images) {
                    let imageA = this.createButton(image.title);
                    imageA.target = "_blank";
                    imageA.href = image.imageUrl || image.imageWithoutTextUrl;
                    wikiItemBlock.appendChild(imageA);
                  }
                }
                if (resource.uiElement.textLinks) {
                  for (let textLink of resource.uiElement.textLinks) {
                    if (textLink.text) {
                      let textLinkP = this.createText(textLink.text);
                      wikiItemBlock.appendChild(textLinkP);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    createTitle(title) {
      const h3 = document.createElement("h3");
      h3.innerHTML = `<span class="f-fl" style="margin-top: 10px;margin-bottom: 10px;">${title}</span>`;
      this.maindDiv.appendChild(h3);
    }
    createTable() {
      const table = document.createElement("table");
      table.className = "m-table";
      const tbody = document.createElement("tbody");
      table.appendChild(tbody);
      this.maindDiv.appendChild(table);
      return table;
    }
    createTableRow(tbody, title, needHide = false) {
      const row = document.createElement("tr");
      if (tbody.children.length % 2 === 0) row.className = "even";
      if (needHide && tbody.children.length > 0) row.style.display = "none";
      row.innerHTML = `<td><div><span>${title || ""}</span></div></td><td><div></div></td>`;
      tbody.appendChild(row);
      return row.querySelector("tr > td:nth-child(2) > div");
    }
    createButtonDescTableRow(tbody, btn, desc, needHide = false) {
      const row = document.createElement("tr");
      if (tbody.children.length % 2 === 0) row.className = "even";
      if (needHide && tbody.children.length > 0) row.style.display = "none";
      row.innerHTML = `<td ${desc ? 'style="width: 23%;"' : ""}><div></div></td><td><div><span>${desc || ""}</span></div></td>`;
      const firstArea = row.querySelector("tr > td:nth-child(1) > div");
      firstArea.appendChild(btn);
      tbody.appendChild(row);
      return row;
    }
    createHideButtonRow(tbody) {
      if (tbody.children.length < 2) return;
      const row = document.createElement("tr");
      row.innerHTML = `<td><div><a class="s-fc7">展开<i class="u-icn u-icn-69"></i></a></div></td>`;
      const btn = row.querySelector("a");
      btn.addEventListener("click", () => {
        for (let i = 1; i < tbody.children.length - 1; i++) {
          if (tbody.children[i].style.display === "none") {
            tbody.children[i].style.display = "";
          } else {
            tbody.children[i].style.display = "none";
          }
        }
        if (btn.innerHTML.startsWith("展开")) {
          btn.innerHTML = '收起<i class="u-icn u-icn-70"></i>';
        } else {
          btn.innerHTML = '展开<i class="u-icn u-icn-69"></i>';
        }
      });
      tbody.appendChild(row);
    }
    createButton(desc) {
      let btn = document.createElement("a");
      btn.text = desc;
      btn.className = "s-fc7";
      btn.style.marginRight = "10px";
      return btn;
    }
    createText(desc) {
      let btn = document.createElement("span");
      btn.innerHTML = desc;
      btn.style.marginRight = "10px";
      return btn;
    }
    createDLRow(desc, level, channel) {
      let btn = this.createButton(levelDesc(level));
      btn.addEventListener("click", () => {
        this.dwonloadSong(channel, level, btn);
      });
      this.createButtonDescTableRow(this.downLoadTableBody, btn, desc, true);
    }
    createULRow(desc, level, channel) {
      if (!unsafeWindow.GUser.userId) return;
      const apiUrl = channel === "dl" ? "/api/song/enhance/download/url/v1" : "/api/song/enhance/player/url/v1";
      const data = channel === "dl" ? { id: this.songId, level, encodeType: "mp3" } : { ids: JSON.stringify([this.songId]), level, encodeType: "mp3" };
      const api = { url: apiUrl, data };
      const songItem = { api, id: this.songId, title: this.title, artist: this.artist, album: this.album };
      const btn = this.createButton(levelDesc(level));
      btn.addEventListener("click", () => {
        const ULobj = new ncmDownUpload([songItem]);
        ULobj.startUpload();
      });
      this.createButtonDescTableRow(this.upLoadTableBody, btn, desc, true);
    }
    dwonloadSong(channel, level, dlbtn) {
      const url2 = channel === "dl" ? "/api/song/enhance/download/url/v1" : "/api/song/enhance/player/url/v1";
      const data = channel === "dl" ? { id: this.songId, level, encodeType: "mp3" } : { ids: JSON.stringify([this.songId]), level, encodeType: "mp3" };
      const songItem = {
        id: this.songId,
        title: this.songDetailObj.name,
        artist: this.artist,
        album: this.album,
        song: this.songDetailObj,
        privilege: this.songDetailObj,
        api: { url: url2, data }
      };
      const config = Object.assign({
        threadCount: 1
      }, getDownloadSettings());
      batchDownloadSongs([songItem], config);
    }
    downloadLyric(lrcKey) {
      saveContentAsFile(this.lyricObj[lrcKey].lyric, this.filename + ".lrc");
    }
  }
  let songDetailObj = new SongDetail();
  const onWebPlayerStart = () => {
    hookWebpackJsonp();
    hookWebPlayerFetch();
    setWebPlayerStyle();
  };
  const onWebPlayerPageLoaded = () => {
    observerWebPlayer();
  };
  const hookWebpackJsonp = () => {
    let originalJsonp = unsafeWindow.webpackJsonp;
    Object.defineProperty(unsafeWindow, "webpackJsonp", {
      get() {
        return originalJsonp;
      },
      set(value) {
        if (value.push.__ncmExtendHasHooked) {
          return;
        }
        originalJsonp = value;
        const originPush = value.push;
        value.push = function(...args) {
          const chunk = args[0];
          const modules = chunk[1];
          for (const moduleId in modules) {
            const moduleFunc = modules[moduleId];
            let code = moduleFunc.toString();
            let isChanged = false;
            const showCloudRegex = /\[\s*(['"])download\1\s*,\s*(['"])localMusic\2\s*,\s*(['"])cloudDisk\3\s*\]/;
            if (showCloudRegex.test(code)) {
              code = code.replace(showCloudRegex, '["download","localMusic"]');
              isChanged = true;
            }
            const showPlayModeRegex = /className\s*:\s*"right draggable"\s*,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*"([^"]*)"\s*,\s*children\s*:\s*\[\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*!\s*([a-zA-Z_][a-zA-Z0-9_.]*)\.isWeb\s*\?\s*Object\s*\(\s*([a-zA-Z_][a-zA-Z0-9_.]*)\.jsx\s*\)/g;
            if (showPlayModeRegex.test(code)) {
              code = code.replace(showPlayModeRegex, 'className : "right draggable", $1 : "$2", children : [ $3 ? Object( $5 .jsx )');
              isChanged = true;
            }
            const showPlayingQuality = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*Object\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*\|\|\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\.isWeb\s*\?\s*null\s*:\s*Object\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\.jsx\s*\)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\{\s*ignoreClickRef\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*isDefaultMiniBar\s*:\s*!\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*_nk\s*:\s*"([^"]*)"\s*\}\s*\)\s*,/g;
            if (showPlayingQuality.test(code)) {
              code = code.replace(showPlayingQuality, '$1=Object($2.$3)($4)||Object($6.jsx)($7.$8,{ignoreClickRef:$9,isDefaultMiniBar:!$10,_nk:"$11"}),');
              isChanged = true;
            }
            if (isChanged) {
              const createFunc = new Function("return " + code);
              modules[moduleId] = createFunc();
            }
          }
          return originPush.apply(this, args);
        };
        value.push.__ncmExtendHasHooked = true;
      }
    });
  };
  const setWebPlayerStyle = () => {
    const webPlayerFontSetting = JSON.parse(GM_getValue("webPlayerFontSetting", "{}"));
    const defaultFont = webPlayerFontSetting.default || "";
    const lyricFont = webPlayerFontSetting.lyric || "";
    if (defaultFont.length > 0) {
      GM_addStyle(`
            #root > div {
            font-family: ${defaultFont};
        }`);
    }
    if (lyricFont.length > 0) {
      GM_addStyle(`
            #mod_pc_lyric_record, .lyric-line  {
                font-family: ${lyricFont};
        }`);
    }
  };
  const observerWebPlayer = () => {
    let observer = new MutationObserver((mutations, observer2) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (let node of mutation.addedNodes) {
            if (node.id === "page_pc_setting") {
              AddQualitySetting(node);
              AddFontSetting(node);
            } else if (node.localName === "div" && node.textContent.startsWith("已上传单曲正在上传网盘容量")) {
              HandleCloudButton(node);
            }
          }
        }
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };
  const AddQualitySetting = (node) => {
    const mainDiv = node.querySelector("main");
    const areaToAdd = mainDiv.querySelector("#play > div");
    const radioChecked = mainDiv.querySelector(".cmd-radio-checked");
    if (!radioChecked) return;
    const radioCheckedClassName = radioChecked.className;
    const radioClassName = radioCheckedClassName.replace("cmd-radio-checked", "");
    const currentLevel = GM_getValue("DEFAULT_LEVEL", defaultOfDEFAULT_LEVEL);
    const React = unsafeWindow.React;
    const ReactDOM = unsafeWindow.ReactDOM;
    if (!React || !ReactDOM) {
      return;
    }
    const existContainer = mainDiv.querySelector(".ncmextend-quality-react-container");
    if (existContainer) {
      try {
        ReactDOM.unmountComponentAtNode(existContainer);
      } catch (e2) {
      }
      existContainer.remove();
    }
    const container = document.createElement("section");
    container.className = "item list ncmextend-quality-react-container";
    areaToAdd.insertBefore(container, areaToAdd.firstChild);
    const { useState } = React;
    const RadioList = () => {
      const [level, setLevel] = useState(currentLevel);
      const onSelect = (key) => {
        setLevel(key);
        try {
          GM_setValue("DEFAULT_LEVEL", key);
        } catch (e2) {
        }
      };
      const items = Object.keys(levelOptions).map((key) => {
        const checked = level === key;
        const labelClass = checked ? radioCheckedClassName : radioClassName;
        const spanClass = checked ? "cmd-radio-inner-checked" : "";
        return React.createElement(
          "span",
          { className: "option-item", key, style: { width: "33.3%", marginTop: "10px", boxSizing: "border-box" } },
          React.createElement(
            "label",
            { className: labelClass, onClick: () => onSelect(key) },
            React.createElement(
              "span",
              { className: `cmd-radio-inner ${spanClass}` },
              React.createElement("input", { type: "radio", "aria-describedby": "", value: levelOptions[key], readOnly: true }),
              React.createElement(
                "span",
                { className: "cmd-radio-inner-display" },
                checked ? React.createElement(
                  "span",
                  { role: "img", "aria-label": "radio", className: "cmd-icon cmd-icon-default cmd-icon-radio IconStyle_i7u766h" },
                  React.createElement(
                    "svg",
                    { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", width: "1em", height: "1em", focusable: "false", "aria-hidden": "true" },
                    React.createElement("circle", { cx: 12, cy: 12, r: 5, fill: "currentColor" })
                  )
                ) : null
              )
            ),
            React.createElement(
              "div",
              { className: "cmd-radio-content" },
              React.createElement(
                "span",
                { className: "cmd-radio-addon", id: key },
                React.createElement("span", { className: "text" }, levelOptions[key])
              )
            )
          )
        );
      });
      const grid = React.createElement("div", { className: "ncmextend-quality-grid", style: { display: "flex", flexWrap: "wrap" } }, ...items);
      return React.createElement("h4", { className: "" }, "音质播放设置", grid);
    };
    ReactDOM.render(React.createElement(RadioList), container);
  };
  const AddFontSetting = (node) => {
    const mainDiv = node.querySelector("main");
    const areaToAdd = mainDiv.querySelector("#normal > div");
    const buttonFound = mainDiv.querySelector(".cmd-button");
    if (!buttonFound) return;
    const buttonClassName = buttonFound.className;
    const React = unsafeWindow.React;
    const ReactDOM = unsafeWindow.ReactDOM;
    if (!React || !ReactDOM) {
      return;
    }
    const existContainer = mainDiv.querySelector(".ncmextend-font-react-container");
    if (existContainer) {
      try {
        ReactDOM.unmountComponentAtNode(existContainer);
      } catch (e2) {
      }
      existContainer.remove();
    }
    const container = document.createElement("section");
    container.className = "item list ncmextend-font-react-container";
    areaToAdd.appendChild(container);
    const Button = () => {
      const onClick = () => {
        Swal.fire({
          title: "自定义字体",
          html: `<div><label>通用字体<input id="ncm-font-default" class="swal2-input"></label></div>
                    <div><label>滚动歌词字体<input id="ncm-font-lyric" class="swal2-input"></label></div>`,
          footer: `<div>示例："SF Pro Rounded", "ui-rounded",  "PingFang SC"</div>
                <div>字体之间以英文逗号分隔，字体格式请参考 <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family" target="_blank">MDN</a></div>`,
          confirmButtonText: "保存",
          showCloseButton: true,
          focusConfirm: false,
          didOpen: () => {
            const container2 = Swal.getHtmlContainer();
            const webPlayerFontSetting = JSON.parse(GM_getValue("webPlayerFontSetting", "{}"));
            container2.querySelector("#ncm-font-default").value = webPlayerFontSetting.default || "";
            container2.querySelector("#ncm-font-lyric").value = webPlayerFontSetting.lyric || "";
          },
          preConfirm: () => {
            const container2 = Swal.getHtmlContainer();
            const defaultFont = container2.querySelector("#ncm-font-default").value;
            const lyricFont = container2.querySelector("#ncm-font-lyric").value;
            return { defaultFont, lyricFont };
          }
        }).then((res) => {
          if (res && res.isConfirmed) {
            const v = res.value || {};
            GM_setValue("webPlayerFontSetting", JSON.stringify({ default: v.defaultFont || "", lyric: v.lyricFont || "" }));
            showConfirmBox("保存成功，刷新网页生效。");
          }
        });
      };
      return React.createElement("button", { className: buttonClassName, onClick }, "自定义字体");
    };
    ReactDOM.render(React.createElement(Button), container);
  };
  const HandleCloudButton = (node) => {
    const button = node.querySelector("div > div > button:nth-child(2)");
    if (button) {
      button.addEventListener("click", function(event) {
        event.stopPropagation();
        event.preventDefault();
        showConfirmBox("新版网页端没有实现上传功能，估计网易云因此隐藏“我的音乐云盘”的。脚本在原版网页端的个人主页提供了上传功能。欢迎前去使用。");
      }, true);
    }
  };
  const registerMenuCommand = () => {
    GM_registerMenuCommand(`音质播放设置`, setPlayLevel);
  };
  const url = _unsafeWindow.location.href;
  const params = new URLSearchParams(_unsafeWindow.location.search);
  const paramId = Number(params.get("id"));
  const isWebPlayer = url === "https://music.163.com/st/webplayer";
  const onStart = () => {
    if (_unsafeWindow === _unsafeWindow.top) {
      console.log("[ncmExtend]脚本加载成功");
    }
    if (isWebPlayer) {
      onWebPlayerStart();
    } else {
      if (_unsafeWindow.self === _unsafeWindow.top) {
        GM_addStyle(GM_getResourceText("fa").replaceAll("../webfonts/", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/webfonts/"));
        _unsafeWindow.GUserScriptObjects = {
          Swal
        };
        hookTopWindow();
      } else if (_unsafeWindow.name === "contentFrame") {
        Swal = _unsafeWindow.top.GUserScriptObjects.Swal;
        hookContentFrame();
        if (paramId > 0) {
          if (url.includes("/song?")) {
            songDetailObj.fetchSongData(paramId);
          } else if (url.includes("/playlist?")) {
            playlistDetailObj.fetchPlaylistFullData(paramId);
          } else if (url.includes("/album?")) {
            albumDetailObj.fetchAlbumData(paramId);
          }
        }
      } else {
        hookOtherWindow();
      }
    }
  };
  const onDomReady = () => {
    if (_unsafeWindow === _unsafeWindow.top) {
      WarningOldHeaderSetting();
    }
    if (isWebPlayer) ;
    else {
      if (paramId > 0) {
        if (url.includes("/user/home?")) {
          myHomeMain(paramId);
        } else if (url.includes("/song?")) {
          songDetailObj.onDomReady();
        } else if (url.includes("/playlist?")) {
          playlistDetailObj.onDomReady();
        } else if (url.includes("/album?")) {
          albumDetailObj.onDomReady();
        } else if (url.includes("/artist?")) {
          artistDetailObj.onDomReady();
        }
      }
      const commentBox = document.querySelector("#comment-box");
      if (commentBox) {
        observerCommentBox(commentBox);
        InfoFirstPage(commentBox);
        addCommentWithCumstomIP(commentBox);
      }
      if (_unsafeWindow.name === "contentFrame") {
        registerMenuCommand();
      }
    }
  };
  const onPageLoaded = () => {
    if (isWebPlayer) {
      onWebPlayerPageLoaded();
    }
  };
  const DOM_READY = "DOMContentLoaded";
  const PAGE_LOADED = "load";
  onStart();
  _unsafeWindow.addEventListener(DOM_READY, () => {
    onDomReady();
  });
  _unsafeWindow.addEventListener(PAGE_LOADED, () => {
    onPageLoaded();
  });

})();