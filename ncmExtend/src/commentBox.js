import { showConfirmBox } from "./utils/common"
import { weapiRequest } from "./utils/request"
//评论区增加IP信息
export const hookWindowForCommentBox = (window) => {
    ah.proxy({
        onResponse: (response, handler) => {
            if (response.config.url.includes('/weapi/comment/resource/comments/get')) {
                let content = JSON.parse(response.response)
                storageCommentInfo(content)
                handler.next(response)
            }
            else {
                handler.next(response)
            }
        }
    }, window)
}
export const storageCommentInfo = (CommentRes) => {
    if (!unsafeWindow.top.GUserScriptObjects.storageCommentInfos) unsafeWindow.top.GUserScriptObjects.storageCommentInfos = {}
    const comments = CommentRes.data.comments.concat(CommentRes.data.hotComments)
    for (let comment of comments) {
        if (!comment?.commentId) continue
        let appendText = ''
        if (comment?.ipLocation?.location) appendText += comment.ipLocation.location + ' '
        if (comment?.extInfo?.endpoint?.OS_TYPE) appendText += comment.extInfo.endpoint.OS_TYPE
        unsafeWindow.top.GUserScriptObjects.storageCommentInfos[String(comment.commentId)] = appendText.trim()
    }
}
export const observerCommentBox = (commentBox) => {
    let observer = new MutationObserver((mutations, observer) => {
        mutations.forEach((mutation) => {
            if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.className == "itm") {
                        commentItemAddInfo(node)
                    }
                }
            }
        });
    });
    observer.observe(commentBox, {
        childList: true,
        subtree: true,
    });
}
const commentItemAddInfo = (commentItem) => {
    if (commentItem.querySelector('.ipInfo')) return
    const commentId = commentItem.getAttribute('data-id')
    let timeArea = commentItem.querySelector('div.time')
    if (unsafeWindow.top.GUserScriptObjects.storageCommentInfos[commentId]) {
        timeArea.innerHTML += ` <span class="ipInfo">${unsafeWindow.top.GUserScriptObjects.storageCommentInfos[commentId]}</span>`
    }
}
export const InfoFirstPage = (commentBox) => {
    const commentItems = commentBox.querySelectorAll("div.itm")
    for (const commentItem of commentItems) {
        commentItemAddInfo(commentItem)
    }
}
export const addCommentWithCumstomIP = (commentBox) => {
    const commentTextarea = commentBox.querySelector('textarea')
    const threadId = commentBox.getAttribute('data-tid')
    const btnsArea = commentBox.querySelector('.btns')
    let ipBtn = document.createElement('a')
    ipBtn.className = 's-fc7'
    ipBtn.innerHTML = '使用指定IP地址评论'
    ipBtn.addEventListener('click', () => {
        const content = commentTextarea.value.trim()
        if (content.length == 0) {
            showConfirmBox('评论内容不能为空')
            return
        }
        const lastIPValue = GM_getValue('lastIPValue', '')
        Swal.fire({
            input: 'text',
            inputLabel: 'IP地址',
            inputValue: GM_getValue('lastIPValue', ''),
            inputValidator: (value) => {
                if (!/((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))/.test(value)) {
                    return "IP格式不正确";
                }
            },
            confirmButtonText: '发送评论',
            showCloseButton: true,
            footer: `<div>可参考:<a href="https://zh-hans.ipshu.com/country-list" target="_blank">IP 国家/地区列表</a></div>`,
        })
            .then(result => {
                if (result.isConfirmed) {
                    GM_setValue('lastIPValue', result.value)
                    weapiRequest('/api/resource/comments/add', {
                        data:{
                            threadId: threadId,
                            content:content,
                        },
                        ip:result.value,
                        onload: (res)=> {
                            console.log(res)
                            if(res.code == 200){
                                showConfirmBox('评论成功，请刷新网页查看')
                            }
                            else{
                                showConfirmBox('评论失败，'+ JSON.stringify(res))
                            }
                        }
                    })
                }
            })
    })
    btnsArea.appendChild(ipBtn)
}