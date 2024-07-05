
export const extractLrcRegex = /^(?<lyricTimestamps>(?:\[.+?\])+)(?!\[)(?<content>.+)$/gm
export const extractTimestampRegex = /\[(?<min>\d+):(?<sec>\d+)(?:\.|:)*(?<ms>\d+)*\]/g
const combineLyric = (lyricOri, lyricAdd) => {
    let resLyric = {
        lyric: '',
        parsedLyric: lyricOri.parsedLyric.slice(0),
    }
    for (const parsedAddLyric of lyricAdd.parsedLyric) {
        resLyric.parsedLyric.splice(parsedLyricsBinarySearch(parsedAddLyric, resLyric.parsedLyric), 0, parsedAddLyric);
    }
    resLyric.lyric = resLyric.parsedLyric.map(lyric => lyric.line).join('\n')
    return resLyric
}
const parseLyric = (lrc) => {
    const parsedLyrics = [];
    for (const line of lrc.trim().matchAll(extractLrcRegex)) {
        const { lyricTimestamps, content } = line.groups;
        for (const timestamp of lyricTimestamps.matchAll(extractTimestampRegex)) {
            const { min, sec, ms } = timestamp.groups;
            const rawTime = timestamp[0];
            const time = Number(min) * 60 + Number(sec) + Number(ms ?? 0) * 0.001;
            const parsedLyric = { rawTime, time, content: trimLyricContent(content), line: line[0] };
            parsedLyrics.splice(parsedLyricsBinarySearch(parsedLyric, parsedLyrics), 0, parsedLyric);
        }
    }
    return parsedLyrics;
}
const parsedLyricsBinarySearch = (lyric, lyrics) => {
    let time = lyric.time;

    let low = 0;
    let high = lyrics.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midTime = lyrics[mid].time;
        if (midTime === time) {
            return mid;
        } else if (midTime < time) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return low;
};
const trimLyricContent = (content) => {
    let t = content.trim();
    return t.length < 1 ? content : t;
}
export const handleLyric = (lyricRes) => {
    let LyricObj = {
        orilrc: {
            lyric: lyricRes.lrc.lyric,
            parsedLyric: parseLyric(lyricRes.lrc.lyric),
        },
        romalrc: {
            lyric: lyricRes.romalrc.lyric,
            parsedLyric: parseLyric(lyricRes.romalrc.lyric),
        },
        tlyriclrc: {
            lyric: lyricRes.tlyric.lyric,
            parsedLyric: parseLyric(lyricRes.tlyric.lyric),
        },
    }
    if (LyricObj.orilrc.parsedLyric.length > 0 && LyricObj.tlyriclrc.parsedLyric.length > 0) {
        LyricObj.oritlrc = combineLyric(LyricObj.tlyriclrc, LyricObj.orilrc)
    }
    if (LyricObj.orilrc.parsedLyric.length > 0 && LyricObj.romalrc.parsedLyric.length > 0) {
        LyricObj.oriromalrc = combineLyric(LyricObj.orilrc, LyricObj.romalrc)
    }
    return LyricObj
}