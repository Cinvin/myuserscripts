
export const levelOptions = { jymaster: '超清母带', dolby: '杜比全景声', sky: '沉浸环绕声', jyeffect: '高清环绕声', hires: 'Hi-Res', lossless: '无损', exhigh: '极高', higher: '较高', standard: '标准' }
export const levelWeight = { jymaster: 9, dolby: 8, sky: 7, jyeffect: 6, hires: 5, lossless: 4, exhigh: 3, higher: 2, standard: 1, none: 0 }
export const defaultOfDEFAULT_LEVEL = 'jymaster'
// 默认的批量操作的歌曲过滤条件
const defaultOfBatchFilter = {
    free: true, // 免费
    vip: true, // VIP
    pay: true, // 付费
    lowfree: true, // 低码率免费
    cloud: false, // 云盘歌曲
}
export const getBatchFilter = () => {
    return Object.assign(defaultOfBatchFilter, JSON.parse(GM_getValue('batchFilter', '{}')))
}
export const setBatchFilter = (value) => {
    GM_setValue('batchFilter', JSON.stringify(Object.assign(defaultOfBatchFilter, value)))
}
// 默认的通用下载设置
const defaultOfDownloadSettings = {
    appendMeta: 'notAppend',  // 是否附加元数据
    out: 'artist-title',  // 输出文件名格式
    folder: 'none',  // 输出文件夹
}
export const getDownloadSettings = () => {
    return Object.assign(defaultOfDownloadSettings, JSON.parse(GM_getValue('downloadSettings', '{}')))
}
export const setDownloadSettings = (value) => {
    GM_setValue('downloadSettings', JSON.stringify(Object.assign(defaultOfDownloadSettings, value)))
}
// 默认的批量下载设置
const defaultOfBatchDownloadSettings = {
    concurrent: 4, // 并发下载数
    level: 'jymaster', // 下载音质
    dllrc: false, // 下载.lrc歌词文件
    levelonly: false, // 仅获取到目标音质时下载
}
export const getBatchDownloadSettings = () => {
    return Object.assign(defaultOfBatchDownloadSettings, JSON.parse(GM_getValue('batchDownloadSettings', '{}')))
}
export const setBatchDownloadSettings = (value) => {
    GM_setValue('batchDownloadSettings', JSON.stringify(Object.assign(defaultOfBatchDownloadSettings, value)))
}
// 默认的批量转存设置
const defaultOfBatchTransUploadSettings = {
    level: 'jymaster', // 转存音质
    levelonly: false, // 仅获取到目标音质时下载
}
export const getBatchTransUploadSettings = () => {
    return Object.assign(defaultOfBatchTransUploadSettings, JSON.parse(GM_getValue('batchTransUploadSettings', '{}')))
}
export const setBatchTransUploadSettings = (value) => {
    GM_setValue('batchTransUploadSettings', JSON.stringify(Object.assign(defaultOfBatchTransUploadSettings, value)))
}
export const uploadChunkSize = 8 * 1024 * 1024
export const songMark = { explicit: 1048576 }