import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: '网易云音乐:云盘快传(含周杰伦)|歌曲下载&转存云盘|云盘匹配纠正|高音质试听',
        description: '无需文件云盘快传歌曲(含周杰伦)、歌曲下载&转存云盘(可批量)、云盘匹配纠正、高音质试听、完整歌单列表、评论区显示IP属地、使用指定的IP地址发送评论、歌单歌曲排序(时间、红心数、评论数)、专辑页加载Disc信息、限免VIP歌曲下载上传、云盘音质提升、本地文件上传云盘、云盘导入导出。',
        author: 'cinvin',
        license: 'MIT',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALiSURBVHgBpVZLThtBEH3d40WkIGWWSSDSGMw6cAP7BBlOgDkB5gSYE2BOgDlBnBNgToCzDmQmii0iZYEXsRRBPJ1X6R4+Mz3IKLVxT1f1q9/rais8IQmiCLjZNlBNA8O1iqzGpAoqNcAnjfmgjh9pFYbyA7+ODIJjAjSxmPTp6MDnSJfBV3YzBOfPABdp88zpBd7ERcWjDC7xdp9bXfyXZHtruOqVHNjITW8RCGZ3xOSHClnITwaF6KFeQ7XqGA/tGrbmBO9W4E0tIFL33W9g0gmQpWuY9A30XvEAsT4mCMM7B3MEXf6EZUN8ZvM2BVAY47bPyK6QuvNLLCcGWdcTFPVLnX8OJHrWadsHXsOsKeuvWD6lza7ThHWkzEqJw4gRvodXzK5kodn92KNNa5hz/0Uo7BBGicOMtc0b2MA4ZnZ17h34HUgWL9uakX3wKIfCaVe6yDqcNWv4NUrINIkswfKGGK5j3K1yItkp1vEahfpr3GwCwZTRJ25rRxoqNbdlUS2gNspwe02Qdh2TEymj5+6MNDzNreMnDwfNe4ezwQXexS4bksLE0geOC9qhJxkR/ASeMmlUS1ilCIBXdmWm1m5pg/0Y+mzFQVrclIhY11H+zWbFDXwfkDlHjHrAHA7svMKGzWheFcxUmpwWdwWwxhqLgds6FEAyp7OK8Rbwm/3R+3BZBjCjP6hFRRxO4G96DnVWVMi9kBpzmbND6JpII8meYwbAZqu20/WFcQqmXcZRA2Vv5e01SmKH1hesdDXMPjzCQDiPZlvuviRFvdwTbdmAYfm4PpTxKzwXQ2EJ7UbusWE/sq1VTFr5ZfT4d5khH3bBOfzMqXxMeC/a/Dn0nEt5pnXnwBl3nLFXJEsZF7IWmnIdVwQEya6Bq4E7dy9P1XtRoeO9dUzKD04uLpM7Cj5DOGGznTzyXEo3mTOnJ29AxdWvkr59Nx6Di6inTrnmxzJx3a11WT382zIjW6bTKoy/H+Iy6oHlZ+kAAAAASUVORK5CYII=',
        namespace: 'https://github.com/Cinvin/myuserscripts',
        match: ['https://music.163.com/*'],
        grant: ['unsafeWindow', 'GM_addStyle', 'GM_xmlhttpRequest', 'GM_download', 'GM_getValue', 'GM_setValue', 'GM_registerMenuCommand', 'GM_cookie'],
        'run-at': 'document-start',
        connect: ['45.127.129.8', '126.net'],
        resource: {
          fa: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css',
        },
      },

      build: {
        fileName: 'ncmExtend.user.js',
        externalGlobals: {
          sweetalert2: cdn.jsdelivrFastly('sweetalert2', 'dist/sweetalert2.all.min.js'),
          'ajax-hook': cdn.jsdelivrFastly('ajax-hook', 'dist/ajaxhook.min.js'),
          jsmediatags: cdn.jsdelivrFastly('jsmediatags', 'dist/jsmediatags.min.js'),
          'node-forge': cdn.jsdelivrFastly('node-forge', 'dist/forge.min.js'),
          'mp3tag.js': cdn.jsdelivrFastly('mp3tag.js', 'dist/mp3tag.min.js'),
        },
      }
    }),
  ],
});
