import { createBigButton } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { showConfirmBox } from "../utils/common"

export const scrobble = (uiArea) => {
    //听歌量打卡
    let btnListen = createBigButton('听歌量打卡', uiArea, 2)
    btnListen.addEventListener('click', listenDaily)
    function listenDaily() {
        let begin = Math.floor(new Date().getTime() / 1000)
        let logs = []
        for (let i = begin; i < begin + 320; i++) {
            logs.push({
                action: 'play',
                json: {
                    download: 0,
                    end: 'playend',
                    id: i,
                    sourceId: '',
                    time: 300,
                    type: 'song',
                    wifi: 0,
                    source: 'list'
                }
            })
        }
        weapiRequest('/api/feedback/weblog', {
            cookie: 'os=pc;appver=2.9.7',
            data: {
                logs: JSON.stringify(logs)
            },
            onload: (res) => {
                //console.log(res1)
                if (res.code == 200) {
                    showConfirmBox('今日听歌量+300首完成')
                }
                else {
                    showConfirmBox('听歌量打卡失败。' + res)
                }
            }
        })
    }
}