//from NeteaseCloudMusicApi
import 'node-forge'
const iv = '0102030405060708'
const presetKey = '0CoJUm6Qyw8W8jud'
const base62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDgtQn2JZ34ZC28NWYpAUd98iZ37BUrX/aKzmFbt7clFSs6sXqHauqKWqdtLkF2KexO40H1YTX8z2lSgBBOAxLsvaklV8k4cBFK9snQXE9/DDaFt6Rr7iVZMldczhC0JNgTz+SHXT6CBHuX3e9SdB1Ua44oncaTWz7OBGLbCiK45wIDAQAB
-----END PUBLIC KEY-----`
export const aesEncrypt = (text, key, iv) => {
  var cipher = forge.cipher.createCipher('AES-CBC', forge.util.encodeUtf8(key));
  cipher.start({ iv: forge.util.encodeUtf8(iv) });
  cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(text)));
  cipher.finish();
  var encrypted = cipher.output;
  return forge.util.encode64(encrypted.getBytes())
}
export const rsaEncrypt = (str, key) => {
  const forgePublicKey = forge.pki.publicKeyFromPem(key)
  const encrypted = forgePublicKey.encrypt(str, 'NONE')
  return forge.util.bytesToHex(encrypted)
}
export const weapi = (object) => {
  const text = JSON.stringify(object)
  let secretKey = ''
  for (let i = 0; i < 16; i++) {
    secretKey += base62.charAt(Math.round(Math.random() * 61))
  }
  return {
    params: aesEncrypt(
      aesEncrypt(text, presetKey, iv),
      secretKey,
      iv,
    ),
    encSecKey: rsaEncrypt(secretKey.split('').reverse().join(''), publicKey),
  }
}