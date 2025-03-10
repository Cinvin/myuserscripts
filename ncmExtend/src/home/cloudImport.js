import { createBigButton } from "../utils/common"
import { Uploader } from "./Uploader"

export const cloudImport= (uiArea) => {
    //云盘导入
    let btnImport = createBigButton('云盘导入', uiArea, 2)
    btnImport.addEventListener('click', openImportPopup)
    function openImportPopup() {
        Swal.fire({
            title: '云盘导入',
            input: 'file',
            inputAttributes: {
                'accept': 'application/json',
                'aria-label': '选择文件'
            },
            confirmButtonText: '导入',
            footer: '<div>请勿多个标签页同时操作，网易云有频率限制，若短时间内有大量请求，会请求失败。</div><div><a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a></div>',
        })
            .then((result) => {
                if (result.isConfirmed) {
                    importCloud(result.value)
                }
            })
    }
    function importCloud(file) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            let uploader = new Uploader(JSON.parse(e.target.result), true)
            uploader.start()
        }
    }
}