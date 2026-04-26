import { liveRegex } from "./constant"

/**
 * 转义 HTML 特殊字符，防止 XSS 注入
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的安全字符串
 */
export const escapeHtml = (str) => {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

export const sleep = (millisec) => {
    return new Promise(resolve => setTimeout(resolve, millisec));
};
export const showConfirmBox = (msg) => {
    Swal.fire({
        title: '提示',
        text: msg,
        confirmButtonText: '确定',
    })
}

export const showTips = (tip, type = 1) => {
    //type:1 √ 2:!
    if (Swal.isVisible()) {
        unsafeWindow.g_showTipCard({
            tip: tip,
            type: type,
            parent: Swal.getContainer()
        })
    } else {
        unsafeWindow.top.g_showTipCard({
            tip: tip,
            type: type,
        })
    }
}
export const saveContentAsFile = (content, fileName) => {
    const data = new Blob([content], {
        type: 'type/plain'
    })
    const fileurl = URL.createObjectURL(data)
    GM_download({
        url: fileurl,
        name: fileName,
        onload: function () {
            URL.revokeObjectURL(data)
        },
        onerror: function (e) {
            console.error(e)
            showTips(`下载失败,请尝试将 .${fileName.split('.').pop()} 格式加入 文件扩展名白名单`, 2)
        }
    })
}
export const createBigButton = (desc, parent, appendWay) => {
    const btn = document.createElement('a')
    btn.className = 'u-btn2 u-btn2-1'
    const btnDesc = document.createElement('i')
    btnDesc.innerHTML = desc
    btn.appendChild(btnDesc)
    btn.style.margin = '5px'
    if (appendWay === 1) {
        parent.appendChild(btn)
    }
    else {
        parent.insertBefore(btn, parent.lastChild)
    }
    return btn
}

export const createPageJumpInput = (currentPage, maxPage) => {
    const jumpToPageInput = document.createElement('input')
    jumpToPageInput.setAttribute("type", "number")
    jumpToPageInput.setAttribute("min", 1)
    jumpToPageInput.setAttribute("max", maxPage)
    jumpToPageInput.value = currentPage
    jumpToPageInput.style.width = '50px'
    jumpToPageInput.style.margin = '.3125em'
    jumpToPageInput.style.padding = '.625em 1.1em'
    jumpToPageInput.placeholder = '跳转到页码'
    return jumpToPageInput
}

export const downloadFileSync = (url, fileName) => {
    return new Promise((resolve) => {
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        const evt = new MouseEvent('click', { view: unsafeWindow || window, bubbles: false, cancelable: false })
        a.dispatchEvent(evt)
        document.body.removeChild(a)
        resolve(`下载 ${fileName} 完成`)
    });
}

export const songItemAddToFormat = (song) => {
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
        source: null,
    }
}

/**
 * 清理文件名：将 '/' 转换为全角 '／'，其余非法字符转为空格
 * @param {string} filename - 原始文件名
 * @returns {string} 处理后的安全文件名
 */
export const sanitizeFilename = (filename) => {
    if (!filename) return 'downloaded_file';

    // 1. 特殊处理：将正斜杠 / 替换为全角字符 ／
    // 这样在文件名里看起来依然像斜杠，但不会被识别为路径分隔符
    let sanitized = filename.replace(/\//g, '／');

    // 2. 定义其他非法字符 (排除已经处理过的 /)
    // 包含: < > : " \ | ? * 以及控制字符 (0-31)
    const illegalRe = /[<>:"\\|?*\x00-\x1F]/g;
    sanitized = sanitized.replace(illegalRe, ' ');

    // 3. 移除文件名末尾的空格或点 (Windows 系统限制)
    sanitized = sanitized.trim().replace(/[\s.]+$/, '');

    // 4. 处理 Windows 保留文件名 (如 CON, PRN 等)
    const reservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    if (reservedRe.test(sanitized)) {
        sanitized = '_' + sanitized;
    }

    return sanitized || 'downloaded_file';
}

export const isLiveSong = (item) => {
    if (!item) return false;
    
    // 如果传入的是包装对象，尝试提取内部真正的 song 对象
    const song = item.simpleSong || item.song || item;

    // 提取可能的属性
    const title = song.name || item.name || item.title || song.title || '';
    const additionalTitle = song.additionalTitle || item.additionalTitle || '';
    let albumName = '';
    let albumSubType = '';

    if (song.al) {
        if (typeof song.al === 'string') {
            albumName = song.al;
        } else {
            albumName = song.al.name || '';
            albumSubType = song.al.subType || '';
        }
    } else if (song.album) {
        if (typeof song.album === 'string') {
            albumName = song.album;
        } else {
            albumName = song.album.name || '';
            albumSubType = song.album.subType || '';
        }
    }

    // 1. 检查 additionalTitle
    if (additionalTitle && additionalTitle.toLowerCase().includes('live')) {
        return true;
    }

    // 2. 检查标题是否匹配 liveRegex
    if (title && liveRegex.test(title.toLowerCase())) {
        return true;
    }

    // 3. 检查专辑 subType
    if (albumSubType === '现场版') {
        return true;
    }

    // 4. 检查专辑名称是否包含“演唱会”、“concert”等字眼
    const albumNameLower = albumName.toLowerCase();
    if (albumNameLower.includes('演唱会') || albumNameLower.includes('concert')) {
        return true;
    }

    return false;
}