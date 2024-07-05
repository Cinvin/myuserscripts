import { levelOptions, defaultOfDEFAULT_LEVEL } from './utils/constant'
export const registerMenuCommand = () => {
    GM_registerMenuCommand(`优先试听音质`, setLevel)
    function setLevel() {
        Swal.fire({
            title: '优先试听音质',
            input: 'select',
            inputOptions: levelOptions,
            inputValue: GM_getValue('DEFAULT_LEVEL', defaultOfDEFAULT_LEVEL),
            confirmButtonText: '确定',
            showCloseButton: true,
            footer: '<a href="https://github.com/Cinvin/myuserscripts"  target="_blank"><img src="https://img.shields.io/github/stars/cinvin/myuserscripts?style=social" alt="Github"></a>',
        })
            .then(result => {
                if (result.isConfirmed) {
                    GM_setValue('DEFAULT_LEVEL', result.value)
                }
            })
    }
}