import { playlistDetailObj } from "../playlist/playlistDetail"
import { albumDetailObj } from "../album/albumDetail"
import { filterSongs } from "../song/filterSongs"
import { createSongsUrlApi } from "../song/createSongsUrlApi"
export const ShowBatchDLULPopUp = (config) => {
    Swal.fire({
        width: 600,
        title: '批量转存云盘',
        html: `<div id="my-cbs">
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee1" checked>VIP歌曲</label>
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee4" checked>付费专辑歌曲</label>
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee8">低音质免费歌曲</label>
<labe><input class="form-check-input" type="checkbox" value="" id="cb-fee0">免费歌曲</label>
</div>
<div id="my-cbs2">
<label><input class="form-check-input" type="checkbox" value="" id="cb-targetLevelOnly">仅获取到目标音质时上传</label>
</div>
<div id="my-level">
<label>优先转存音质<select id="level-select" class="swal2-select"><option value="jymaster" selected="">超清母带</option><option value="dolby">杜比全景声</option><option value="sky">沉浸环绕声</option><option value="jyeffect">高清环绕声</option><option value="hires">Hi-Res</option><option value="lossless">无损</option><option value="exhigh">极高</option></select></label>
</div>
<div id="my-out">
<label>文件命名格式<select id="out-select" class="swal2-select"><option value="artist-title" selected="">歌手 - 歌曲名</option><option value="title">歌曲名</option><option value="title-artist">歌曲名-歌手</option></select></label>
</div>
`,
        confirmButtonText: '开始转存',
        showCloseButton: true,
        footer: '<span></span><a href="https://github.com/Cinvin/myuserscripts"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
        focusConfirm: false,
        preConfirm: () => {
            const container = Swal.getHtmlContainer()
            return {
                free: container.querySelector('#cb-fee0').checked,
                VIP: container.querySelector('#cb-fee1').checked,
                pay: container.querySelector('#cb-fee4').checked,
                lowFree: container.querySelector('#cb-fee8').checked,
                targetLevelOnly: container.querySelector('#cb-targetLevelOnly').checked,
                skipCloud: true,
                level: container.querySelector('#level-select').value,
                out: container.querySelector('#out-select').value,
                listType: config.listType,
                listId: config.listId,
                action: 'batchUpload'
            }
        }
    }).then(res => {
        if (res.isConfirmed) {
            if (res.value.listType == 'playlist') {
                let filtedSongList = filterSongs(playlistDetailObj.playlistSongList, res.value)
                createSongsUrlApi(filtedSongList, res.value)
            }
            else if (res.value.listType == 'album') {
                let filtedSongList = filterSongs(albumDetailObj.albumSongList, res.value)
                createSongsUrlApi(filtedSongList, res.value)
            }
        }
    })
}