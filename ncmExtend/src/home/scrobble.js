import { createBigButton } from "../utils/common"
import { weapiRequest } from "../utils/request"
import { showConfirmBox } from "../utils/common"
import { unsafeWindow } from "$"

export const scrobble = (uiArea) => {
    //听歌量打卡
    let btnListen = createBigButton('⚠️必看警告说明!!!', uiArea, 2)
    btnListen.addEventListener('click', ()=>{
        Swal.fire({
            title: '必看说明',
            html: `<p>目前「听歌量打卡」功能因为能被网易云检测，会导致3天<b>账号冻结</b>，因此已移除。由于在极短时间内听完多首歌肯定会被视为异常行为，此功能无法再恢复。</p>
            <p>目前脚本其他功能暂时未受影响，但还请密切留意账号的状态，若出现app端登录状态退出、需要改密码登录等异常情况，请马上停止使用本脚本。</p>
            <p>参考阅读:<a href='https://www.landiannews.com/archives/105994.html' target='_blank'>网易云音乐调整风控系统，封禁使用第三方工具的账户</a></p>`,
            confirmButtonText: '确定',
            footer: '<a href="https://github.com/Cinvin/myuserscripts/issues"  target="_blank">脚本问题反馈</a>',
        })
    })
    //btnListen.addEventListener('click', listenDaily)
    function listenDaily() {
        let begin = Math.floor(new Date().getTime() / 1000)
        let logs = []
        for (let i = begin; i < begin + 320; i++) {
            logs.push({
                action: 'play',
                json: {
                    type: 'song',
                    wifi: 0,
                    download: 0,
                    id: i,
                    time: Math.floor(Math.random() * 60) + 200,
                    end: 'playend',
                    source: 'user',
                    sourceId: String(unsafeWindow.GUser.userId),
                    mainsite: '1',
                    content: `id=${i}`,
                }
            })
        }
        weapiRequest('/api/feedback/weblog', {
            cookie: true,
            data: {
                logs: encodeURIComponent(JSON.stringify(logs))
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