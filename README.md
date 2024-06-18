## 网易云音乐脚本
[点击此处安装](https://greasyfork.org/scripts/459633-%E7%BD%91%E6%98%93%E4%BA%91-%E4%BA%91%E7%9B%98%E6%AD%8C%E6%9B%B2%E5%BF%AB%E4%BC%A0-%E5%90%AB%E5%91%A8%E6%9D%B0%E4%BC%A6-%E4%BA%91%E7%9B%98%E5%8C%B9%E9%85%8D%E7%BA%A0%E6%AD%A3-%E5%90%AC%E6%AD%8C%E9%87%8F%E6%89%93%E5%8D%A1-%E9%9F%B3%E4%B9%90%E6%AD%8C%E8%AF%8D%E4%B9%90%E8%B0%B1%E4%B8%8B%E8%BD%BD/code/%E7%BD%91%E6%98%93%E4%BA%91:%E4%BA%91%E7%9B%98%E6%AD%8C%E6%9B%B2%E5%BF%AB%E4%BC%A0(%E5%90%AB%E5%91%A8%E6%9D%B0%E4%BC%A6)%7C%E4%BA%91%E7%9B%98%E5%8C%B9%E9%85%8D%E7%BA%A0%E6%AD%A3%7C%E5%90%AC%E6%AD%8C%E9%87%8F%E6%89%93%E5%8D%A1%7C%E9%9F%B3%E4%B9%90%E6%AD%8C%E8%AF%8D%E4%B9%90%E8%B0%B1%E4%B8%8B%E8%BD%BD.user.js) (请确保浏览器已经安装了[TamperMonkey](https://www.tampermonkey.net/))

 [![Greasy Fork](https://img.shields.io/greasyfork/dt/459633?label=greasyfork%20installs)](https://greasyfork.org/zh-CN/scripts/459633)

 ### 功能
- 云盘快传:无需文件快速上传云盘歌曲,三分钟解锁周杰伦。网易云他人上传过的文件只需提供文件MD5值即可上传。
- 歌曲下载:不消耗vip下载次数,不是ncm加密文件。可在歌单、专辑页批量下载。
- 歌曲转存云盘:同上。会跳过下载的步骤秒传。建议领个7天会员把喜欢的歌都用云盘解锁了。
- 听歌量打卡: 快速完成每日300首歌曲的等级任务。助力早日Lv10。不影响个性化推荐。
- 高音质试听：解除网页端只能听标准音质的限制。支持超清母带。在鼠标右键菜单中可进行音质设置。通过重新请求用高音质替换掉原来音质。
- 歌单歌曲排序:歌单内歌曲按发行时间、红心数、评论数进行排序。
- 限免vip歌曲下载&上传:对APP内普通用户可免费完整试听的vip歌曲进行下载或上传。
- 云盘匹配纠错:云盘歌曲匹配歌词、封面和评论。
- 云盘音质提升:需会员获取高音质。寻找网易云的音质比云盘文件更好的歌曲，以进行替换。只有上传成功时才删除原来低音质文件。
- 本地文件上传云盘:解决mac不能上传难题。文件可批量选择。
- 云盘导入导出:云盘歌曲导入另一账号。和云盘快传相同原理。 
 ### 问题说明
- 若脚本加载异常,可能与fastly.jsdelivr.net抽风无法访问有关。
- 云盘快传:少部分音源内容残缺,歌曲与音源可能不对应。存在许多用AI提升的咪咕24bit音源。
- 云盘快传\转存:无损以上音质文件(flac)上传后再下载文件名后缀变为mp3,但不会影响文件的音质。
- 上传失败时，浏览器控制台有输出具体错误内容。大多数时候重试一次就好了。
- 云盘音质提升:当目标高音质文件已在云盘中时,提升音质只是把高音质文件匹配到目标歌曲，然后删除低音质文件。这就造成云盘歌曲数量减少的现象。
### 截图
<img src="https://raw.githubusercontent.com/Cinvin/myuserscripts/main/ncmHomePage.png" width="60%">

<img src="https://raw.githubusercontent.com/Cinvin/myuserscripts/main/ncmPlaylist.png" width="60%">

### 参考
网易云音乐API来自[Binaryify/NeteaseCloudMusicApi](https://gitlab.com/Binaryify/NeteaseCloudMusicApi)  
## 咪咕音乐下载脚本
在咪咕音乐专辑详情页添加下载链接 可无需登录下载至臻(24Bit)  
[安装](https://greasyfork.org/scripts/453820-%E5%92%AA%E5%92%95%E9%9F%B3%E4%B9%90%E4%B8%8B%E8%BD%BD/code/%E5%92%AA%E5%92%95%E9%9F%B3%E4%B9%90%E4%B8%8B%E8%BD%BD.user.js) (请确保浏览器已经安装了TamperMonkey)  
 [![Greasy Fork](https://img.shields.io/greasyfork/dt/453820?label=greasyfork%20installs)](https://greasyfork.org/zh-CN/scripts/453820)    
<img src="https://raw.githubusercontent.com/Cinvin/myuserscripts/main/screenshot.png" width="60%">
