
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
            const time = Number(min) * 60 + Number(sec) + Number((ms ?? '000').padEnd(3, '0')) * 0.001;
            const parsedLyric = { rawTime, time, content: trimLyricContent(content), line: line[0] };
            parsedLyrics.splice(parsedLyricsBinarySearch(parsedLyric, parsedLyrics), 0, parsedLyric);
        }
    }
    return parsedLyrics;
}

const parseNotLyricLines = (lrc) => {
    const notLyricLines = {before: '', after: ''};
    const lines = lrc.trim().split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(extractTimestampRegex)) {
            break;
        }
        else {
            notLyricLines.before += line + '\n';
        }
    }
    for (let i =  lines.length-1; i >= 0; i--) {
        const line = lines[i];
        if (line.match(extractTimestampRegex)) {
            break;
        }
        else {
            notLyricLines.after = line + '\n'+notLyricLines.after ;
        }
    }
    notLyricLines.after = notLyricLines.after.trim();
    return notLyricLines;
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
    //console.log(lyricRes)
    //纯音乐或暂无歌词
    if (lyricRes.pureMusic || lyricRes.needDesc) return {
        orilrc: {
            lyric: '',
            parsedLyric: [],
        },
    }
    const lrc = lyricRes?.lrc?.lyric || ''
    const rlrc = lyricRes?.romalrc?.lyric || ''
    const tlrc = lyricRes?.tlyric?.lyric || ''
    let LyricObj = {
        orilrc: {
            lyric: lrc,
            parsedLyric: parseLyric(lrc),
        },
        romalrc: {
            lyric: rlrc,
            parsedLyric: parseLyric(rlrc),
        },
        tlyriclrc: {
            lyric: tlrc,
            parsedLyric: parseLyric(tlrc),
        },
    }
    const notLyricLines = parseNotLyricLines(lrc);
    if (LyricObj.orilrc.parsedLyric.length > 0 && LyricObj.tlyriclrc.parsedLyric.length > 0) {
        LyricObj.oritlrc = combineLyric(LyricObj.tlyriclrc, LyricObj.orilrc);
        LyricObj.oritlrc.lyric = notLyricLines.before + LyricObj.oritlrc.lyric + notLyricLines.after;
    }
    if (LyricObj.orilrc.parsedLyric.length > 0 && LyricObj.romalrc.parsedLyric.length > 0) {
        LyricObj.oriromalrc = combineLyric(LyricObj.orilrc, LyricObj.romalrc);
        LyricObj.oriromalrc.lyric = notLyricLines.before + LyricObj.oriromalrc.lyric + notLyricLines.after;
    }
    return LyricObj
}