import "ajax-hook"
import "sweetalert2"
import "jsmediatags"
import { unsafeWindow } from '$'

import { onStart, onDomReady, onPageLoaded } from './routers'

const DOM_READY = "DOMContentLoaded";
const PAGE_LOADED = "load";

onStart()

unsafeWindow.addEventListener(DOM_READY, (() => {
    onDomReady()
}));

unsafeWindow.addEventListener(PAGE_LOADED, (() => {
    onPageLoaded()
}));