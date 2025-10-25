
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
    let data = new Blob([content], {
        type: 'type/plain'
    })
    let fileurl = URL.createObjectURL(data)
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
    let btn = document.createElement('a')
    btn.className = 'u-btn2 u-btn2-1'
    let btnDesc = document.createElement('i')
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