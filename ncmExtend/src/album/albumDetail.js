import { weapiRequest } from "../utils/request"
import { songMark } from "../utils/constant"
export const albumDetail=(albumId,uiArea)=>{
    weapiRequest(`/api/v1/album/${albumId}`, {
        onload: (content) => {
            console.log(content)
            uiArea.innerHTML += `<p class="intr"><b>专辑类型：</b>${content.album.type} ${content.album.subType}</p>`
            if ((content.album.mark & songMark.explicit) == songMark.explicit) {
                uiArea.innerHTML += `<p class="intr"><b>🅴：</b>内容含有不健康因素</p>`
            }
            if (content.album.blurPicUrl) {
                uiArea.innerHTML += `<p class="intr"><a class="s-fc7" href="${content.album.blurPicUrl}" target="_blank">专辑封面原图</a></p>`
            }
        }
    })

}