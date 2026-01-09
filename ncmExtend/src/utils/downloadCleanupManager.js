/**
 * 下载内存管理器
 * 使用 LRU 缓存防止内存无限增长
 * 下载过程中自动清理，下载完成后保留缓存（页面刷新后自然清除）
 */

export const downloadCleanupManager = {
  // 保留最近完成的歌曲数量（超过此数量时自动清理最旧的）
  MAX_PENDING_ITEMS: 16,

  // 存储已完成的下载：{ songItem, blobUrl }
  pendingCleanup: [],

  /**
   * 添加完成的下载到队列
   * 超过限制时自动清理最旧的项
   * @param {Object} songItem - 歌曲对象
   * @param {string} blobUrl - Blob URL
   */
  addPendingCleanup: function(songItem, blobUrl) {
    this.pendingCleanup.push({ songItem, blobUrl });
    // 如果超过最大数量，清理最旧的项目以防止内存溢出
    while (this.pendingCleanup.length > this.MAX_PENDING_ITEMS) {
      const oldest = this.pendingCleanup.shift();
      this.cleanupItem(oldest);
    }
  },

  /**
   * 清理单个项目的内存资源
   * @param {Object} item - { songItem, blobUrl }
   */
  cleanupItem: function(item) {
    if (!item) return;

    // 释放 Blob URL
    if (item.blobUrl) {
      try {
        URL.revokeObjectURL(item.blobUrl);
      } catch (e) {
        // 忽略释放失败的错误
      }
    }

    // 清理歌曲下载数据
    if (item.songItem && item.songItem.download) {
      item.songItem.download.musicFile = null;
      item.songItem.download.coverData = null;
      item.songItem.download.lyricText = null;
    }

    // 清理专辑详情缓存引用
    if (item.songItem) {
      item.songItem.albumDetail = null;
    }
  },

  /**
   * 下载全部完成时调用
   * 注意：不清理缓存，让页面刷新后自然清除
   * 这样可以避免文件写入磁盘时删除 Blob URL 导致下载失败
   */
  cleanupAll: function() {
    // 不执行任何清理操作
    // 缓存会在页面刷新后自动清除
    // 下载过程中已通过 addPendingCleanup 中的 LRU 机制防止内存无限增长
  }
};
