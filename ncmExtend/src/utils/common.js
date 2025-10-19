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
export const showTips = (tip, type) => {
    //type:1 √ 2:!
    unsafeWindow.g_showTipCard({
        tip: tip,
        type: type
    })
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
                onerror: (error) => reject(`下载 ${fileName} 失败: ${error}`)
            });
        });
    }