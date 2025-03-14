import { createBigButton, showTips } from "../utils/common"
import { Uploader } from "./Uploader"

const baseCDNURL = 'https://fastly.jsdelivr.net/gh/Cinvin/cdn@latest/artist/'

const optionMap = {
    0: "热门",
    1: "华语男歌手",
    2: "华语女歌手",
    3: "华语组合",
    4: "欧美男歌手",
    5: "欧美女歌手",
    6: "欧美组合",
    7: "日本男歌手",
    8: "日本女歌手",
    9: "日本组合",
    10: "韩国男歌手",
    11: "韩国女歌手",
    12: "韩国组合"
}

export const cloudUpload = (uiArea) => {
    //云盘快速上传
    let btnUpload = createBigButton('快速上传加载中', uiArea, 2)
    let btnUploadDesc = btnUpload.firstChild
    let toplist = []
    let selectOptions = {
        "热门": {},
        "华语男歌手": {},
        "华语女歌手": {},
        "华语组合": {},
        "欧美男歌手": {},
        "欧美女歌手": {},
        "欧美组合": {},
        "日本男歌手": {},
        "日本女歌手": {},
        "日本组合": {},
        "韩国男歌手": {},
        "韩国女歌手": {},
        "韩国组合": {},
    }

    let artistmap = {}
    fetch(`${baseCDNURL}top.json`)
        .then(r => r.json())
        .then(r => {
            toplist = r;
            toplist.forEach(artist => {
                selectOptions[optionMap[artist.categroy]][artist.id] = `${artist.name}(${artist.count}首/${artist.sizeDesc})`
                artistmap[artist.id] = artist
            })
            //console.log(selectOptions)
            btnUpload.addEventListener('click', ShowCloudUploadPopUp)
            btnUploadDesc.innerHTML = '云盘快速上传'
        })
    function ShowCloudUploadPopUp() {
        Swal.fire({
            title: '快速上传',
            input: 'select',
            inputOptions: selectOptions,
            inputPlaceholder: '选择歌手',
            confirmButtonText: '下一步',
            showCloseButton: true,
            footer: '<div>建议先设置好请求头，以避免上传失败</div><div><a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a></div>',
            inputValidator: (value) => {
                if (!value) {
                    return '请选择歌手'
                }
            },
        })
            .then(result => {
                if (result.isConfirmed) {
                    fetchCDNConfig(result.value)
                }
            })
    }
    function fetchCDNConfig(artistId) {
        showTips(`正在获取资源配置...`, 1)
        fetch(`${baseCDNURL}${artistId}.json`)
            .then(r => r.json())
            .then(r => {
                let uploader = new Uploader(r)
                uploader.start()
            })
            .catch(`获取资源配置失败`)
    }
}