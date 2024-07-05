
import { levelOptions } from './constant'
export const fileSizeDesc = (fileSize) => {
    if (fileSize < 1024) {
        return fileSize + 'B'
    } else if (fileSize >= 1024 && fileSize < Math.pow(1024, 2)) {
        return (fileSize / 1024)
            .toFixed(1)
            .toString() + 'K'
    } else if (fileSize >= Math.pow(1024, 2) && fileSize < Math.pow(1024, 3)) {
        return (fileSize / Math.pow(1024, 2))
            .toFixed(1)
            .toString() + 'M';
    } else if (fileSize > Math.pow(1024, 3) && fileSize < Math.pow(1024, 4)) {
        return (fileSize / Math.pow(1024, 3))
            .toFixed(2)
            .toString() + 'G';
    } else if (fileSize > Math.pow(1024, 4)) {
        return (fileSize / Math.pow(1024, 4))
            .toFixed(2)
            .toString() + 'T';
    }
};
export const duringTimeDesc = (dt) => {
    let secondTotal = Math.floor(dt / 1000)
    let min = Math.floor(secondTotal / 60)
    let sec = secondTotal % 60
    return min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0')
};
export const levelDesc = (level) => {
    return levelOptions[level] || level
};

export const getArtistTextInSongDetail = (song) => {
    let artist = ''
    if (song.ar && song.ar[0].name && song.ar[0].name.length > 0) {
        artist = song.ar.map(ar => ar.name).join()
    }
    else if (song.pc && song.pc.ar && song.pc.ar.length > 0) {
        artist = song.pc.ar
    }
    return artist
}
export const getAlbumTextInSongDetail = (song) => {
    let album = ''
    if (song.al && song.al.name && song.al.name.length > 0) {
        album = song.al.name
    }
    else if (song.pc && song.pc.alb && song.pc.alb.length > 0) {
        album = song.pc.alb
    }
    return album
}
export const nameFileWithoutExt = (title, artist, out) => {
    if (out == 'title' || !artist || artist.length == 0) {
        return title
    }
    if (out == 'artist-title') {
        return `${artist} - ${title}`
    }
    if (out == 'title-artist') {
        return `${title} - ${artist}`
    }
}