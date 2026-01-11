## 网易云音乐脚本

| jsDelivr源 | GreasyFork源 |
| ----------- | ----------- |
|  [安装](https://fastly.jsdelivr.net/gh/Cinvin/myuserscripts@latest/ncmExtend/publish/ncmExtend.user.js)      | [安装](https://update.greasyfork.org/scripts/459633/%E7%BD%91%E6%98%93%E4%BA%91%E9%9F%B3%E4%B9%90%3A%E4%BA%91%E7%9B%98%E5%BF%AB%E4%BC%A0%28%E5%90%AB%E5%91%A8%E6%9D%B0%E4%BC%A6%29%7C%E6%AD%8C%E6%9B%B2%E4%B8%8B%E8%BD%BD%E8%BD%AC%E5%AD%98%E4%BA%91%E7%9B%98%7C%E4%BA%91%E7%9B%98%E5%8C%B9%E9%85%8D%E7%BA%A0%E6%AD%A3%7C%E9%AB%98%E9%9F%B3%E8%B4%A8%E8%AF%95%E5%90%AC.user.js)        |

请确保浏览器已经安装了脚本管理器如:[篡改猴](https://www.tampermonkey.net/)，并将浏览器的`开发者模式`打开，浏览器的扩展管理界面 -> 你的脚本管理器的详情界面 -> `允许运行用户脚本`也要打开。

 [![Greasy Fork](https://img.shields.io/greasyfork/dt/459633?label=greasyfork%20installs)](https://greasyfork.org/zh-CN/scripts/459633)

 ### 主要功能
- **歌曲下载**：不消耗vip下载次数,不是ncm加密文件。支持下载时添加音乐元数据。
- **歌曲转存云盘**：用网易云自身音源将歌曲快速上传到云盘，不需要完整的文件下载和上传过程。
- **云盘导入导出**：可以将A账号的云盘歌曲导出，在B账号导入。 [云盘导入文件分享](https://github.com/Cinvin/myuserscripts/discussions/44)有个现成的。
- **云盘快传**：功能与前者相同，按歌手分类提供了一些歌曲。
- **云盘匹配纠错**：云盘歌曲匹配歌词、封面和评论。
- **云盘去重**
- **云盘音质提升**
- **音乐标签**：为本地文件添加音乐元数据，使得文件上传云盘后无需关联就有封面与滚动歌词。 
- **高音质试听**：解除网页端音质限制。
- 为网易云[新网页端](https://music.163.com/st/webplayer)进行一些优化。

### 使用说明
- 脚本安装完成后，登陆网易云。在原版网页端右上角用户头像的 `我的主页` 中，使用云盘相关功能。在单曲、专辑、歌手、歌单（并非`我的音乐`的歌单，而是 `我的主页` 的歌单）页面使用下载、转存云盘功能。

### 参考
网易云音乐API来自[Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)  