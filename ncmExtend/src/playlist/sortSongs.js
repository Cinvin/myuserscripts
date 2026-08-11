import { createBigButton } from '../utils/common';
import { weapiRequest } from '../utils/request';
export const sortSongs = (playlistId, uiArea) => {
  //歌单排序
  const btnPlaylistSort = createBigButton('歌单排序', uiArea, 1);
  btnPlaylistSort.addEventListener('click', () => {
    ShowPLSortPopUp(playlistId);
  });
};
class SortLogger {
  constructor() {
    this.log = '';
  }
  addLog(log) {
    this.log += log + '\n';
    this.textarea.value = this.log;
    this.textarea.scrollTop = this.textarea.scrollHeight;
  }
}
const ShowPLSortPopUp = (playlistId) => {
  Swal.fire({
    title: '歌单内歌曲排序',
    input: 'select',
    inputOptions: ['发行时间降序', '发行时间升序', '红心数量降序', '红心数量升序', '评论数量降序', '评论数量升序'],
    inputPlaceholder: '选择排序方式',
    confirmButtonText: '开始排序',
    showCloseButton: true,
    focusConfirm: false,
    inputValidator: (way) => {
      if (!way) {
        return '请选择排序方式';
      }
    },
  }).then((res) => {
    if (!res.isConfirmed) return;
    const logger = new SortLogger();
    Swal.fire({
      input: 'textarea',
      inputLabel: '歌单排序',
      confirmButtonText: '关闭',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showCloseButton: false,
      showConfirmButton: true,
      inputAttributes: {
        readonly: true,
      },
      didOpen: () => {
        logger.textarea = Swal.getInput();
        logger.textarea.style = 'height: 300px;';
        logger.comfirmBtn = Swal.getConfirmButton();
        logger.comfirmBtn.style = 'display: none;';
        if (res.value === '0') {
          PlaylistTimeSort(playlistId, true, logger);
        } else if (res.value === '1') {
          PlaylistTimeSort(playlistId, false, logger);
        } else if (res.value === '2') {
          PlaylistCountSort(playlistId, true, 'Red', logger);
        } else if (res.value === '3') {
          PlaylistCountSort(playlistId, false, 'Red', logger);
        } else if (res.value === '4') {
          PlaylistCountSort(playlistId, true, 'Comment', logger);
        } else if (res.value === '5') {
          PlaylistCountSort(playlistId, false, 'Comment', logger);
        }
      },
    });
  });
};
const PlaylistTimeSort = (playlistId, descending, logger) => {
  logger.addLog('正在获取歌单内歌曲信息');
  weapiRequest('/api/v6/playlist/detail', {
    data: {
      id: playlistId,
      n: 100000,
      s: 8,
    },
    onload: (content) => {
      const songList = [];
      const tracklen = content.playlist.tracks.length;
      for (let i = 0; i < tracklen; i++) {
        const songItem = {
          id: content.playlist.tracks[i].id,
          publishTime: content.playlist.tracks[i].publishTime,
          albumId: content.playlist.tracks[i].al.id,
          cd: content.playlist.tracks[i].cd ? Number(content.playlist.tracks[i].cd.split(' ')[0]) : 0,
          no: content.playlist.tracks[i].no,
        };
        songList.push(songItem);
      }
      if (content.playlist.trackCount > content.playlist.tracks.length) {
        logger.addLog(`大歌单,开始分批获取${content.playlist.trackCount}首歌信息`);
        const trackIds = content.playlist.trackIds.map((item) => {
          return {
            id: item.id,
          };
        });
        PlaylistTimeSortFetchAll(playlistId, descending, trackIds, 0, songList, logger);
      } else {
        PlaylistTimeSortFetchAllPublishTime(playlistId, descending, 0, songList, {}, logger);
      }
    },
  });
};
const PlaylistTimeSortFetchAll = (playlistId, descending, trackIds, startIndex, songList, logger) => {
  if (startIndex >= trackIds.length) {
    PlaylistTimeSortFetchAllPublishTime(playlistId, descending, 0, songList, {}, logger);
    return;
  }
  weapiRequest('/api/v3/song/detail', {
    data: {
      c: JSON.stringify(trackIds.slice(startIndex, startIndex + 1000)),
    },
    onload: function (content) {
      const songlen = content.songs.length;
      for (let i = 0; i < songlen; i++) {
        const songItem = {
          id: content.songs[i].id,
          publishTime: content.songs[i].publishTime,
          albumId: content.songs[i].al.id,
          cd: content.songs[i].cd ? Number(content.songs[i].cd.split(' ')[0]) : 0,
          no: content.songs[i].no,
        };
        songList.push(songItem);
      }
      PlaylistTimeSortFetchAll(playlistId, descending, trackIds, startIndex + content.songs.length, songList, logger);
    },
  });
};
const PlaylistTimeSortFetchAllPublishTime = (playlistId, descending, index, songList, aldict, logger) => {
  if (index >= songList.length) {
    PlaylistTimeSortSongs(playlistId, descending, songList, logger);
    return;
  }
  if (index === 0) logger.addLog('开始获取歌曲专辑发行时间');
  if (index % 10 === 9) logger.addLog(`正在获取歌曲专辑发行时间(${index + 1}/${songList.length})`);
  const albumId = songList[index].albumId;
  if (albumId <= 0) {
    PlaylistTimeSortFetchAllPublishTime(playlistId, descending, index + 1, songList, aldict, logger);
    return;
  }

  if (aldict[albumId]) {
    songList[index].publishTime = aldict[albumId];
    PlaylistTimeSortFetchAllPublishTime(playlistId, descending, index + 1, songList, aldict, logger);
    return;
  }
  weapiRequest(`/api/v1/album/${albumId}`, {
    onload: function (content) {
      const publishTime = content.album.publishTime;
      aldict[albumId] = publishTime;
      songList[index].publishTime = publishTime;
      PlaylistTimeSortFetchAllPublishTime(playlistId, descending, index + 1, songList, aldict, logger);
    },
  });
};
const PlaylistTimeSortSongs = (playlistId, descending, songList, logger) => {
  songList.sort((a, b) => {
    if (a.publishTime !== b.publishTime) {
      if (descending) {
        return b.publishTime - a.publishTime;
      } else {
        return a.publishTime - b.publishTime;
      }
    } else if (a.albumId !== b.albumId) {
      if (descending) {
        return b.albumId - a.albumId;
      } else {
        return a.albumId - b.albumId;
      }
    } else if (a.cd !== b.cd) {
      return a.cd - b.cd;
    } else if (a.no !== b.no) {
      return a.no - b.no;
    }
    return a.id - b.id;
  });
  logger.addLog('排序完成，正在提交...');
  let trackIds = songList.map((song) => song.id);
  weapiRequest('/api/playlist/manipulate/tracks', {
    data: {
      pid: playlistId,
      trackIds: JSON.stringify(trackIds),
      op: 'update',
    },
    onload: function (content) {
      //console.log(content)
      if (content.code === 200) {
        logger.addLog('排序完成');
      } else {
        logger.addLog('排序失败,' + content);
      }
      logger.comfirmBtn.style = 'display: inline-block;';
    },
  });
};
const PlaylistCountSort = (playlistId, descending, way, logger) => {
  logger.addLog('正在获取歌单内歌曲信息');
  weapiRequest('/api/v6/playlist/detail', {
    data: {
      id: playlistId,
      n: 100000,
      s: 8,
    },
    onload: (content) => {
      const songList = content.playlist.trackIds.map((item) => {
        return {
          id: item.id,
          count: 0,
        };
      });
      const trackIds = content.playlist.trackIds.map((item) => {
        return item.id;
      });
      if (way === 'Red') {
        PlaylistCountSortFetchRedCount(playlistId, songList, 0, descending, logger);
      } else if (way === 'Comment') {
        PlaylistCountSortFetchCommentCount(playlistId, songList, trackIds, 0, descending, logger);
      }
    },
  });
};
const PlaylistCountSortFetchRedCount = (playlistId, songList, index, descending, logger) => {
  if (index >= songList.length) {
    PlaylistCountSortSongs(playlistId, descending, songList, logger);
    return;
  }
  if (index === 0) logger.addLog('开始获取歌曲红心数量');
  if (index % 10 === 9) logger.addLog(`正在获取歌曲红心数量(${index + 1}/${songList.length})`);
  weapiRequest('/api/song/red/count', {
    data: {
      songId: songList[index].id,
    },
    onload: function (content) {
      songList[index].count = content.data.count;
      PlaylistCountSortFetchRedCount(playlistId, songList, index + 1, descending, logger);
    },
  });
};
const PlaylistCountSortFetchCommentCount = (playlistId, songList, trackIds, index, descending, logger) => {
  if (index >= songList.length) {
    PlaylistCountSortSongs(playlistId, descending, songList, logger);
    return;
  }
  if (index === 0) logger.addLog('开始获取歌曲评论数量');
  else logger.addLog(`正在获取歌曲评论数量(${index + 1}/${songList.length})`);
  weapiRequest('/api/resource/commentInfo/list', {
    data: {
      resourceType: '4',
      resourceIds: JSON.stringify(trackIds.slice(index, index + 1000)),
    },
    onload: function (content) {
      content.data.forEach((item) => {
        const songId = item.resourceId;
        for (let i = 0; i < songList.length; i++) {
          if (songList[i].id === songId) {
            songList[i].count = item.commentCount;
            break;
          }
        }
      });
      PlaylistCountSortFetchCommentCount(playlistId, songList, trackIds, index + 1000, descending, logger);
    },
  });
};
const PlaylistCountSortSongs = (playlistId, descending, songList, logger) => {
  songList.sort((a, b) => {
    if (a.count !== b.count) {
      if (descending) {
        return b.count - a.count;
      } else {
        return a.count - b.count;
      }
    }
    return a.id - b.id;
  });
  logger.addLog('排序完成，正在提交...');
  let trackIds = songList.map((song) => song.id);
  weapiRequest('/api/playlist/manipulate/tracks', {
    data: {
      pid: playlistId,
      trackIds: JSON.stringify(trackIds),
      op: 'update',
    },
    onload: function (content) {
      if (content.code === 200) {
        logger.addLog('排序完成');
      } else {
        logger.addLog('排序失败');
      }
      logger.comfirmBtn.style = 'display: inline-block;';
    },
  });
};
