import { weapiRequest } from "./utils/request"
//评论区增加IP信息
let storageCommentInfos = {}
export const commentInfo = (commentBox) => {
    ObserverCommentBox(commentBox)
    hookCommentBox(commentBox)
    const tid = commentBox.getAttribute("data-tid")
    InfoFirstPage(commentBox, tid)
}
const InfoFirstPage = (commentBox, tid) => {
    weapiRequest("/api/comment/resource/comments/get", {
        data: {
            rid: tid,
            threadId: tid,
            pageNo: 1,
            pageSize: 20,
            cursor: -1,
            offset: 0,
            orderType: 1,
        },
        onload: (res) => {
            storageCommentInfo(res)
            const commentItems = commentBox.querySelectorAll("div.itm")
            for (const commentItem of commentItems) {
                commentItemAddInfo(commentItem)
            }
        },
    })
}
const commentItemAddInfo = (commentItem) => {
    if (commentItem.querySelector('.ipInfo')) return
    const commentId = commentItem.getAttribute('data-id')
    let timeArea = commentItem.querySelector('div.time')
    if (storageCommentInfos[commentId]) {
        timeArea.innerHTML += ` <span class="ipInfo">${storageCommentInfos[commentId]}</span>`
    }
}

const hookCommentBox = (commentBox) => {
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
    }, unsafeWindow)
}
const ObserverCommentBox = (commentBox) => {
    let observer = new MutationObserver((mutations, observer) => {
        mutations.forEach((mutation) => {
            if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
                let changeFlag = false
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
const storageCommentInfo = (CommentRes) => {
    const comments = CommentRes.data.comments.concat(CommentRes.data.hotComments)
    for (let comment of comments) {
        if (!comment?.commentId) continue
        let appendText = ''
        if (comment?.ipLocation?.location) appendText += comment.ipLocation.location + ' '
        if (comment?.extInfo?.endpoint?.OS_TYPE) appendText += comment.extInfo.endpoint.OS_TYPE
        storageCommentInfos[String(comment.commentId)] = appendText.trim()
    }
}