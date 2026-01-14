import { scriptSettings } from "./scriptSettings"
import { cloudUpload } from "./cloudUpload"
import { myCloudDisk } from "./myCloudDisk"
import { cloudUpgrade } from "./cloudUpgrade"
import { cloudLocalUpload } from "./cloudLocalUpload"
import { freeVIPSong } from "./freeVIPSong"
import { cloudExport } from "./cloudExport"
import { cloudImport } from "./cloudImport"
import { musicTag } from "./musicTag"
import { cloudDeduplication } from "./cloudDeduplication"
export const myHomeMain = (userId) => {
    const isUserHome = userId === unsafeWindow.GUser.userId
    let editArea = document.querySelector('#head-box > dd > div.name.f-cb > div > div.edit')
    if (isUserHome && editArea) {
        myCloudDisk(editArea)
        cloudUpload(editArea)
        cloudUpgrade(editArea)
        cloudDeduplication(editArea)
        cloudLocalUpload(editArea)
        freeVIPSong(editArea)
        cloudExport(editArea)
        cloudImport(editArea)
        musicTag(editArea)
        scriptSettings(editArea)
    }
}