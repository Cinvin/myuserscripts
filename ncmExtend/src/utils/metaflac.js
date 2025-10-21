
// -------------------------
// BrowserBuffer: minimal Buffer-like wrapper
// -------------------------
class BrowserBuffer {
    constructor(uint8) {
        if (!(uint8 instanceof Uint8Array)) {
            throw new Error('BrowserBuffer expects Uint8Array');
        }
        this._u8 = uint8;
    }

    // static helpers
    static from(input, enc) {
        if (typeof input === 'string') {
            if (!enc || enc === 'utf8' || enc === 'utf-8') {
                const encoder = new TextEncoder();
                return new BrowserBuffer(encoder.encode(input));
            }
            if (enc === 'ascii') {
                const arr = new Uint8Array(input.length);
                for (let i = 0; i < input.length; i++) arr[i] = input.charCodeAt(i) & 0x7F;
                return new BrowserBuffer(arr);
            }
        }
        if (input instanceof ArrayBuffer) return new BrowserBuffer(new Uint8Array(input));
        if (input instanceof Uint8Array) return new BrowserBuffer(input);
        if (input instanceof BrowserBuffer) return input;
        throw new Error('BrowserBuffer.from: unsupported input');
    }

    static alloc(len) {
        return new BrowserBuffer(new Uint8Array(len));
    }

    static concat(list) {
        const u8s = list.map(item => {
            if (item instanceof BrowserBuffer) return item._u8;
            if (item instanceof Uint8Array) return item;
            if (item instanceof ArrayBuffer) return new Uint8Array(item);
            throw new Error('BrowserBuffer.concat: unsupported element type');
        });
        const total = u8s.reduce((s, a) => s + a.length, 0);
        const out = new Uint8Array(total);
        let pos = 0;
        for (const a of u8s) {
            out.set(a, pos);
            pos += a.length;
        }
        return new BrowserBuffer(out);
    }

    static isBuffer(x) {
        return x instanceof BrowserBuffer;
    }

    // getters
    get length() {
        return this._u8.length;
    }

    get buffer() {
        return this._u8.buffer;
    }

    slice(start = 0, end = undefined) {
        const sub = this._u8.subarray(start, end);
        return new BrowserBuffer(sub);
    }

    toString(enc = 'utf8') {
        if (enc === 'utf8' || enc === 'utf-8') {
            const dec = new TextDecoder('utf-8');
            return dec.decode(this._u8);
        }
        if (enc === 'ascii') {
            let s = '';
            for (let i = 0; i < this._u8.length; i++) s += String.fromCharCode(this._u8[i] & 0x7F);
            return s;
        }
        // fallback
        const dec = new TextDecoder('utf-8');
        return dec.decode(this._u8);
    }

    // read unsigned ints
    readUInt8(offset) {
        return this._u8[offset];
    }

    readUInt16BE(offset) {
        return (this._u8[offset] << 8) | this._u8[offset + 1];
    }

    readUInt16LE(offset) {
        return (this._u8[offset]) | (this._u8[offset + 1] << 8);
    }

    readUInt32BE(offset) {
        return (this._u8[offset] * 0x1000000) + ((this._u8[offset + 1] << 16) | (this._u8[offset + 2] << 8) | this._u8[offset + 3]);
    }

    readUInt32LE(offset) {
        return (this._u8[offset]) | (this._u8[offset + 1] << 8) | (this._u8[offset + 2] << 16) | (this._u8[offset + 3] << 24 >>> 0);
    }

    // read arbitrary BE integer (up to 6 bytes used in original code)
    readUIntBE(offset, byteLength) {
        let val = 0;
        for (let i = 0; i < byteLength; i++) {
            val = (val << 8) + this._u8[offset + i];
        }
        return val >>> 0;
    }

    // write unsigned ints BE
    writeUIntBE(value, offset, byteLength) {
        for (let i = byteLength - 1; i >= 0; i--) {
            this._u8[offset + i] = value & 0xFF;
            value = value >>> 8;
        }
    }

    writeUInt32BE(value, offset) {
        this._u8[offset] = (value >>> 24) & 0xFF;
        this._u8[offset + 1] = (value >>> 16) & 0xFF;
        this._u8[offset + 2] = (value >>> 8) & 0xFF;
        this._u8[offset + 3] = (value) & 0xFF;
    }

    writeUInt8(value, offset) {
        this._u8[offset] = value & 0xFF;
    }

    // expose underlying Uint8Array (read-only)
    toUint8Array() {
        return this._u8;
    }
}

// -------------------------
// Helpers: file-type / image-size substitutes
// -------------------------
function fileTypeFromBuffer(buf) {
    const u8 = buf instanceof Uint8Array ? buf : (buf instanceof ArrayBuffer ? new Uint8Array(buf) : null);
    if (!u8) return { mime: 'application/octet-stream', ext: '' };
    if (u8.length >= 4 && u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4E && u8[3] === 0x47) {
        return { mime: 'image/png', ext: 'png' };
    }
    if (u8.length >= 3 && u8[0] === 0xFF && u8[1] === 0xD8 && u8[u8.length - 2] === 0xFF && u8[u8.length - 1] === 0xD9) {
        return { mime: 'image/jpeg', ext: 'jpg' };
    }
    return { mime: 'application/octet-stream', ext: '' };
}

function imageSizeFromBuffer(arrayBufferOrU8) {
    const localU8 = arrayBufferOrU8 instanceof Uint8Array ? arrayBufferOrU8 : new Uint8Array(arrayBufferOrU8);
    return new Promise((resolve, reject) => {
        const blob = new Blob([localU8]);
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = function () {
            const w = img.width;
            const h = img.height;
            URL.revokeObjectURL(url);
            resolve({ width: w, height: h, type: 'image' });
        };
        img.onerror = function (e) {
            URL.revokeObjectURL(url);
            reject(new Error('imageSizeFromBuffer: failed to decode image'));
        };
        img.src = url;
    });
}

// -------------------------
// formatVorbisComment: reuse original lib if available, else minimal implementation
// The original metaflac-js refers to './lib/formatVorbisComment' to serialize vendor & tags into a Buffer.
// We'll implement equivalent serialization using BrowserBuffer.
// Vorbis comment layout:
// 4 bytes vendor_length (LE) + vendor_string + 4 bytes user_comment_list_length (LE) + [4 bytes length + comment bytes]...
// -------------------------
function formatVorbisComment(vendorString, tagsArray) {
    const encoder = new TextEncoder();
    const vendorBytes = encoder.encode(vendorString || '');
    const tagBytesList = (tagsArray || []).map(t => encoder.encode(t));

    // compute length
    // vendor length 4 + vendor + 4 + sum(4 + tagLen)
    let totalLen = 4 + vendorBytes.length + 4;
    for (const tb of tagBytesList) totalLen += 4 + tb.length;

    const out = new Uint8Array(totalLen);
    const view = new DataView(out.buffer);
    let offset = 0;
    view.setUint32(offset, vendorBytes.length, true); // LE
    offset += 4;
    out.set(vendorBytes, offset);
    offset += vendorBytes.length;
    view.setUint32(offset, tagBytesList.length, true); // number of comments
    offset += 4;
    for (const tb of tagBytesList) {
        view.setUint32(offset, tb.length, true);
        offset += 4;
        out.set(tb, offset);
        offset += tb.length;
    }
    return new BrowserBuffer(out);
}

// -------------------------
// Metaflac class (ported and adapted)
// -------------------------
const BLOCK_TYPE = {
    0: 'STREAMINFO',
    1: 'PADDING',
    2: 'APPLICATION',
    3: 'SEEKTABLE',
    4: 'VORBIS_COMMENT',
    5: 'CUESHEET',
    6: 'PICTURE',
};

const STREAMINFO = 0;
const PADDING = 1;
const APPLICATION = 2;
const SEEKTABLE = 3;
const VORBIS_COMMENT = 4;
const CUESHEET = 5;
const PICTURE = 6;

class MetaFlac {
    constructor(flac) {
        // flac must be ArrayBuffer / Uint8Array / BrowserBuffer
        if (!(flac instanceof ArrayBuffer) && !(flac instanceof Uint8Array) && !(flac instanceof BrowserBuffer)) {
            throw new Error('MetaFlac(flac) flac must be ArrayBuffer/Uint8Array/BrowserBuffer in browser build.');
        }
        // normalize to BrowserBuffer
        if (flac instanceof BrowserBuffer) {
            this.buffer = flac;
        } else if (flac instanceof Uint8Array) {
            this.buffer = new BrowserBuffer(flac);
        } else { // ArrayBuffer
            this.buffer = new BrowserBuffer(new Uint8Array(flac));
        }

        this.flac = this.buffer; // keep compatibility
        this.marker = '';
        this.streamInfo = null;
        this.blocks = [];
        this.padding = null;
        this.vorbisComment = null;
        this.vendorString = '';
        this.tags = [];
        this.pictures = [];
        this.picturesSpecs = [];
        this.picturesDatas = [];
        this.framesOffset = 0;
        this.init();
    }

    init() {
        let offset = 0;
        const markerBuf = this.buffer.slice(0, (offset += 4));
        const marker = markerBuf.toString('ascii');
        if (marker !== 'fLaC') {
            throw new Error('The file does not appear to be a FLAC file.');
        }

        let blockType = 0;
        let isLastBlock = false;
        while (!isLastBlock) {
            blockType = this.buffer.readUInt8(offset++);
            isLastBlock = blockType > 128;
            blockType = blockType % 128;

            const blockLength = this.buffer.readUIntBE(offset, 3);
            offset += 3;

            if (blockType === STREAMINFO) {
                this.streamInfo = this.buffer.slice(offset, offset + blockLength);
            }

            if (blockType === PADDING) {
                this.padding = this.buffer.slice(offset, offset + blockLength);
            }

            if (blockType === VORBIS_COMMENT) {
                this.vorbisComment = this.buffer.slice(offset, offset + blockLength);
                this.parseVorbisComment();
            }

            if (blockType === PICTURE) {
                this.pictures.push(this.buffer.slice(offset, offset + blockLength));
                this.parsePictureBlock();
            }

            if ([APPLICATION, SEEKTABLE, CUESHEET].includes(blockType)) {
                this.blocks.push([blockType, this.buffer.slice(offset, offset + blockLength)]);
            }

            offset += blockLength;
        }
        this.framesOffset = offset;
    }

    parseVorbisComment() {
        const vc = this.vorbisComment;
        const vendorLength = vc.readUInt32LE(0);
        this.vendorString = vc.slice(4, vendorLength + 4).toString('utf8');
        const userCommentListLength = vc.readUInt32LE(4 + vendorLength);
        const userCommentListBuffer = vc.slice(4 + vendorLength + 4);
        for (let off = 0; off < userCommentListBuffer.length;) {
            const length = userCommentListBuffer.readUInt32LE(off);
            off += 4;
            const comment = userCommentListBuffer.slice(off, off + length).toString('utf8');
            off += length;
            this.tags.push(comment);
        }
    }

    parsePictureBlock() {
        this.pictures.forEach(picture => {
            let offset = 0;
            const type = picture.readUInt32BE(offset); offset += 4;
            const mimeTypeLength = picture.readUInt32BE(offset); offset += 4;
            const mime = picture.slice(offset, offset + mimeTypeLength).toString('ascii'); offset += mimeTypeLength;
            const descriptionLength = picture.readUInt32BE(offset); offset += 4;
            const description = picture.slice(offset, offset + descriptionLength).toString('utf8'); offset += descriptionLength;
            const width = picture.readUInt32BE(offset); offset += 4;
            const height = picture.readUInt32BE(offset); offset += 4;
            const depth = picture.readUInt32BE(offset); offset += 4;
            const colors = picture.readUInt32BE(offset); offset += 4;
            const pictureDataLength = picture.readUInt32BE(offset); offset += 4;
            this.picturesDatas.push(picture.slice(offset, offset + pictureDataLength).toUint8Array());
            this.picturesSpecs.push(this.buildSpecification({
                type,
                mime,
                description,
                width,
                height,
                depth,
                colors
            }));
        });
    }

    getPicturesSpecs() {
        return this.picturesSpecs;
    }

    getMd5sum() {
        return this.streamInfo.slice(18, 34).toString('hex'); // hex via utf8 fallback - keep, but rarely used in browser
    }

    getMinBlocksize() {
        return this.streamInfo.readUInt16BE(0);
    }

    getMaxBlocksize() {
        return this.streamInfo.readUInt16BE(2);
    }

    getMinFramesize() {
        return this.streamInfo.readUIntBE(4, 3);
    }

    getMaxFramesize() {
        return this.streamInfo.readUIntBE(7, 3);
    }

    getSampleRate() {
        return this.streamInfo.readUIntBE(10, 3) >> 4;
    }

    getChannels() {
        return this.streamInfo.readUIntBE(10, 3) & 0x00000f >> 1;
    }

    getBps() {
        return this.streamInfo.readUIntBE(12, 2) & 0x01f0 >> 4;
    }

    getTotalSamples() {
        return this.streamInfo.readUIntBE(13, 5) & 0x0fffffffff;
    }

    getVendorTag() {
        return this.vendorString;
    }

    getTag(name) {
        return this.tags.filter(item => {
            const itemName = item.split('=')[0];
            return itemName === name;
        }).join('\n');
    }

    removeTag(name) {
        this.tags = this.tags.filter(item => item.split('=')[0] !== name);
    }

    removeFirstTag(name) {
        const found = this.tags.findIndex(item => item.split('=')[0] === name);
        if (found !== -1) this.tags.splice(found, 1);
    }

    removeAllTags() {
        this.tags = [];
    }

    removeAllPictures() {
        this.pictures = [];
        this.picturesSpecs = [];
        this.picturesDatas = [];
    }

    setTag(field) {
        if (field.indexOf('=') === -1) {
            throw new Error(`malformed vorbis comment field "${field}", field contains no '=' character`);
        }
        this.tags.push(field);
    }

    // Functions using file paths are NOT supported in browser build.
    setTagFromFile(field) {
        throw new Error('setTagFromFile is not supported in browser build. Use setTag("NAME=VALUE") directly or fetch file yourself.');
    }

    importTagsFrom(filename) {
        throw new Error('importTagsFrom(filename) is not supported in browser build. Provide tags array or fetch file yourself and call setTag for each line.');
    }

    exportTagsTo(filename) {
        throw new Error('exportTagsTo is not supported in browser build.');
    }

    // Import picture by filename is not supported: use importPictureFromBuffer
    importPictureFrom(filename) {
        throw new Error('importPictureFrom(filename) is not supported in browser build. Use importPictureFromBuffer(buffer).');
    }

    importPictureFromBuffer(picture) {
        const arr = picture instanceof BrowserBuffer
            ? picture.toUint8Array()
            : picture instanceof Uint8Array
                ? picture
                : new Uint8Array(picture);

        const { mime } = fileTypeFromBuffer(arr);
        const finalMime = mime === "image/png" ? "image/png" : "image/jpeg"; // 强制 jpeg 默认

        const self = this;
        return imageSizeFromBuffer(arr).then(dim => {
            const spec = self.buildSpecification({
                mime: finalMime,
                width: dim.width || 500,
                height: dim.height || 500,
                depth: 24,
                colors: 0,
                description: ""
            });
            const picBlock = self.buildPictureBlock(arr, spec);
            self.pictures.push(picBlock);
            self.picturesSpecs.push(spec);
            return true;
        });
    }


    exportPictureTo(filename) {
        throw new Error('exportPictureTo is not supported in browser build. Use getPicturesSpecs()/picturesDatas and then create Blob.');
    }

    getAllTags() {
        return this.tags;
    }

    buildSpecification(spec = {}) {
        const defaults = {
            type: 3,
            mime: 'image/jpeg',
            description: '',
            width: 0,
            height: 0,
            depth: 24,
            colors: 0,
        };
        return Object.assign(defaults, spec);
    }

    buildPictureBlock(picture, specification = {}) {
        // picture is Uint8Array
        const pictureU8 = picture instanceof Uint8Array ? picture : new Uint8Array(picture);
        const pictureType = BrowserBuffer.alloc(4);
        const mime = BrowserBuffer.from(specification.mime || 'image/jpeg', 'ascii');
        const mimeLength = BrowserBuffer.alloc(4);
        const description = BrowserBuffer.from(specification.description || '', 'utf8');
        const descriptionLength = BrowserBuffer.alloc(4);
        const width = BrowserBuffer.alloc(4);
        const height = BrowserBuffer.alloc(4);
        const depth = BrowserBuffer.alloc(4);
        const colors = BrowserBuffer.alloc(4);
        const pictureLength = BrowserBuffer.alloc(4);

        pictureType.writeUInt32BE(specification.type || 3, 0);
        mimeLength.writeUInt32BE((specification.mime || 'image/jpeg').length, 0);
        descriptionLength.writeUInt32BE((specification.description || '').length, 0);
        width.writeUInt32BE(specification.width || 0, 0);
        height.writeUInt32BE(specification.height || 0, 0);
        depth.writeUInt32BE(specification.depth || 24, 0);
        colors.writeUInt32BE(specification.colors || 0, 0);
        pictureLength.writeUInt32BE(pictureU8.length, 0);

        return BrowserBuffer.concat([
            pictureType,
            mimeLength,
            mime,
            descriptionLength,
            description,
            width,
            height,
            depth,
            colors,
            pictureLength,
            new BrowserBuffer(pictureU8)
        ]);
    }

    buildMetadataBlock(type, block, isLast = false) {
        const header = BrowserBuffer.alloc(4);
        let t = type;
        if (isLast) t += 128;
        // header.writeUIntBE(type, 0, 1);
        header.writeUIntBE(t, 0, 1);
        // header.writeUIntBE(block.length, 1, 3);
        header.writeUIntBE(block.length, 1, 3);
        return BrowserBuffer.concat([header, block]);
    }

    buildMetadata() {
        const bufferArray = [];
        bufferArray.push(this.buildMetadataBlock(STREAMINFO, this.streamInfo));
        this.blocks.forEach(block => bufferArray.push(this.buildMetadataBlock(...block)));
        // Vorbis comment
        bufferArray.push(this.buildMetadataBlock(VORBIS_COMMENT, formatVorbisComment(this.vendorString, this.tags)));
        this.pictures.forEach(block => bufferArray.push(this.buildMetadataBlock(PICTURE, block)));
        bufferArray.push(this.buildMetadataBlock(PADDING, this.padding, true));
        return bufferArray;
    }

    buildStream() {
        const metadata = this.buildMetadata();
        const resultList = [this.buffer.slice(0, 4), ...metadata, this.buffer.slice(this.framesOffset)];
        return resultList;
    }

    save() {
        // If originally a string path (not supported), throw.
        // Return Uint8Array of Buffer.concat(buildStream()) equivalent.
        const built = this.buildStream();
        const bb = BrowserBuffer.concat(built);
        return bb.toUint8Array(); // return Uint8Array
    }
}

export { MetaFlac, BrowserBuffer };