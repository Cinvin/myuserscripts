
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
    return new Promise((resolve, reject) => {
        GM_download({
            url,
            name: fileName,
            onload: () => resolve(`下载 ${fileName} 完成`),
            onerror: (error) => reject(`下载 ${fileName} 失败`)
        });
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
 * 清理文件名：将 '/' 转换为全角 '／'，其余非法字符转为下划线
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
    sanitized = sanitized.replace(illegalRe, '_');

    // 3. 移除文件名末尾的空格或点 (Windows 系统限制)
    sanitized = sanitized.trim().replace(/[\s.]+$/, '');

    // 4. 处理 Windows 保留文件名 (如 CON, PRN 等)
    const reservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    if (reservedRe.test(sanitized)) {
        sanitized = '_' + sanitized;
    }

    return sanitized || 'downloaded_file';
}