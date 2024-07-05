import { getAlbumAllSongs } from "../album/getAlbumAllSongs"
import { getPlaylistAllSongs } from "../playlist/getPlaylistAllSongs"
export const ShowBatchDLPopUp = (config) => {
    Swal.fire({
        title: '批量下载',
        customClass: {
            input: 'f-rdi',
        },
        html: `<div id="my-cbs">
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee1" checked>VIP歌曲</label>
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee4" checked>付费专辑歌曲</label>
</div>
<div id="my-cbs2">
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee8" checked>低音质免费歌曲</label>
<label><input class="form-check-input" type="checkbox" value="" id="cb-fee0" checked>免费和云盘未匹配歌曲</label>
</div>
<div id="my-cbs3">
<label><input class="form-check-input" type="checkbox" value="" id="cb-skipcloud">跳过云盘歌曲</label>
<label><input class="form-check-input" type="checkbox" value="" id="cb-dlLyric">下载歌词文件(.lrc)</label>
</div>
<div id="my-level">
<label>优先下载音质<select id="level-select" class="swal2-select"><option value="lossless">无损</option><option value="hires">Hi-Res</option><option value="jymaster" selected="">超清母带</option><option value="exhigh">极高</option></select></label>
</div>
<div id="my-out">
<label>文件命名格式<select id="out-select" class="swal2-select"><option value="artist-title" selected="">歌手 - 歌曲名</option><option value="title">歌曲名</option><option value="title-artist">歌曲名 - 歌手</option></select></label>
</div>
<div id="my-folder">
<label>文件夹格式<select id="folder-select" class="swal2-select"><option value="none" selected="">不建立文件夹</option><option value="artist">建立歌手文件夹</option><option value="artist-album">建立歌手 \\ 专辑文件夹</option></select></label>
</div>
<div id="my-thread-count">
<label>同时下载的歌曲数<select id="thread-count-select" class="swal2-select"><option value=4 selected="">4</option><option value=3>3</option><option value="2">2</option><option value=1>1</option></select></label>
</div>
`,
        confirmButtonText: '开始下载',
        showCloseButton: true,
        footer: '<span>请将 <b>TamperMonkey</b> 插件设置中的 <b>下载模式</b> 设置为 <b>浏览器 API</b> 并将 <b>/\.(mp3|flac|lrc)$/</b> 添加进 <b>文件扩展名白名单</b> 以保证能正常下载。</span><a href="https://github.com/Cinvin/myuserscripts"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
        focusConfirm: false,
        preConfirm: (level) => {
            let container = Swal.getHtmlContainer()
            return {
                free: container.querySelector('#cb-fee0').checked,
                VIP: container.querySelector('#cb-fee1').checked,
                pay: container.querySelector('#cb-fee4').checked,
                lowFree: container.querySelector('#cb-fee8').checked,
                skipCloud: container.querySelector('#cb-skipcloud').checked,
                downloadLyric: container.querySelector('#cb-dlLyric').checked,
                level: container.querySelector('#level-select').value,
                out: container.querySelector('#out-select').value,
                folder: container.querySelector('#folder-select').value,
                threadCount: Number(container.querySelector('#thread-count-select').value),
                listType: config.listType,
                listId: config.listId,
                action: 'batchDownload'
            }
        }
    }).then(res => {
        if (res.value.listType == 'playlist') {
            getPlaylistAllSongs(res.value)
        }
        else if (res.value.listType == 'album') {
            getAlbumAllSongs(res.value)
        }
    })
}