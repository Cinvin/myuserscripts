// 输入：ArrayBuffer（或支持 .byteLength 的 TypedArray.buffer）
// 输出：'mp3' | 'flac' | 'unknown'
export const detectAudioFormat = (arrayBuffer) => {
  if (!arrayBuffer) return 'unknown';
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length < 4) return 'unknown';

  // FLAC magic "fLaC"
  if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) {
    return 'flac';
  }

  // ID3v2 header: "ID3"
  let scanStart = 0;
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    // ID3v2 header size is a syncsafe 4-byte at offset 6..9
    if (bytes.length >= 10) {
      const size =
        ((bytes[6] & 0x7f) << 21) |
        ((bytes[7] & 0x7f) << 14) |
        ((bytes[8] & 0x7f) << 7) |
        (bytes[9] & 0x7f);
      scanStart = 10 + size;
      if (scanStart >= bytes.length) return 'unknown';
    } else {
      return 'unknown';
    }
  }

  // Scan for MP3 frame sync in the first upTo bytes (从 scanStart 开始)
  const MAX_SCAN = Math.min(bytes.length - 1, scanStart + 65536); // scan up to 64KB after header
  for (let i = scanStart; i < MAX_SCAN; i++) {
    // frame sync: 0xFF followed by byte with high 3 bits set (0xE0)
    if (bytes[i] === 0xFF && (bytes[i + 1] & 0xE0) === 0xE0) {
      return 'mp3';
    }
  }

  return 'unknown';
}