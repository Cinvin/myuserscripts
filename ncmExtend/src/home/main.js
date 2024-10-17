import { cloudUpload } from "./cloudUpload"
import { cloudMatch } from "./cloudMatch"
import { cloudUpgrade } from "./cloudUpgrade"
import { cloudLocalUpload } from "./cloudLocalUpload"
import { freeVIPSong } from "./freeVIPSong"
import { cloudExport } from "./cloudExport"
import { cloudImport } from "./cloudImport"
export const myHomeMain = (userId) => {
    const isUserHome = userId === unsafeWindow.GUser.userId
    let editArea = document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
    if (isUserHome && editArea) {
        cloudUpload(editArea)
        cloudMatch(editArea)
        cloudUpgrade(editArea)
        cloudLocalUpload(editArea)
        freeVIPSong(editArea)
        cloudExport(editArea)
        cloudImport(editArea)
    }
}