import { GM_getValue, unsafeWindow } from "$"
import { defaultOfDEFAULT_LEVEL, levelWeight } from "./utils/constant";
import { weapiRequest } from "./utils/request";
import { levelDesc } from "./utils/descHelper"

export const hookTopWindow = () => {
    ah.proxy({
        onResponse: (response, handler) => {
            if (response.config.url.includes('/weapi/song/enhance/player/url/v1')) {
                let content = JSON.parse(response.response)
                let songId = content.data[0].id
                let targetLevel = GM_getValue('DEFAULT_LEVEL', defaultOfDEFAULT_LEVEL)
                if (content.data[0].type.toLowerCase() !== "mp3" && content.data[0].type.toLowerCase() !== "m4a") {
                    content.data[0].type = 'mp3'
                }
                if (content.data[0].url) {
                    if (content.data[0].level == 'standard') {
                        if (targetLevel != 'standard') {
                            let apiData = {
                                '/api/song/enhance/player/url/v1': JSON.stringify({
                                    ids: JSON.stringify([songId]),
                                    level: targetLevel,
                                    encodeType: 'mp3'
                                }),
                            }
                            if (content.data[0].fee == 0) {
                                apiData['/api/song/enhance/download/url/v1'] = JSON.stringify({
                                    id: songId,
                                    level: levelWeight[targetLevel] > levelWeight.hires ? 'hires' : targetLevel,
                                    encodeType: 'mp3'
                                })
                            }
                            weapiRequest("/api/batch", {
                                data: apiData,
                                onload: (res) => {
                                    let songUrl = res['/api/song/enhance/player/url/v1'].data[0].url
                                    let songLevel = res["/api/song/enhance/player/url/v1"].data[0].level
                                    if (res['/api/song/enhance/download/url/v1']) {
                                        let songDLLevel = res["/api/song/enhance/download/url/v1"].data.level
                                        if (res["/api/song/enhance/download/url/v1"].data.url && (levelWeight[songDLLevel] || -1) > (levelWeight[songLevel] || 99)) {
                                            songUrl = res["/api/song/enhance/download/url/v1"].data.url
                                            songLevel = songDLLevel
                                        }
                                    }
                                    if (songLevel != 'standard') {
                                        content.data[0].url = songUrl
                                        unsafeWindow.player.tipPlay(levelDesc(songLevel) + '音质')
                                    }
                                    response.response = JSON.stringify(content)
                                    handler.next(response)
                                },
                                onerror: (res) => {
                                    console.error('/api/batch', apiData, res)
                                    response.response = JSON.stringify(content)
                                    handler.next(response)
                                }
                            })
                        }
                        else {
                            response.response = JSON.stringify(content)
                            handler.next(response)
                        }
                    }
                    else {
                        unsafeWindow.player.tipPlay(levelDesc(content.data[0].level) + '音质(云盘文件)')
                        response.response = JSON.stringify(content)
                        handler.next(response)
                    }
                }
                else {
                    response.response = JSON.stringify(content)
                    handler.next(response)
                }
            }
            else {
                handler.next(response)
            }
        }
    }, unsafeWindow)
}