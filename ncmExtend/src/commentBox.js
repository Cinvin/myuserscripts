import { weapiRequest } from "./utils/request"
//评论区增加IP信息

export const hookWindowForCommentBox= (window) => {
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