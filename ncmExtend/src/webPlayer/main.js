import { levelOptions, defaultOfDEFAULT_LEVEL } from '../utils/constant'
import { hookWebPlayerFetch } from '../hooks'
import { showConfirmBox } from '../utils/common';

export const onWebPlayerStart = () => {
    hookWebpackJsonp();
    hookWebPlayerFetch();
    setWebPlayerStyle()
}

export const onWebPlayerPageLoaded = () => {
    observerWebPlayer();
}
/**
 * Webpack 劫持
 */
const hookWebpackJsonp = () => {
    let originalJsonp = unsafeWindow.webpackJsonp;

    Object.defineProperty(unsafeWindow, "webpackJsonp", {
        get() {
            return originalJsonp;
        },
        set(value) {
            if (value.push.__ncmExtendHasHooked) {
                return;
            }
            originalJsonp = value;
            const originPush = value.push;
            value.push = function (...args) {
                const chunk = args[0];
                const modules = chunk[1];

                for (const moduleId in modules) {
                    const moduleFunc = modules[moduleId];

                    let code = moduleFunc.toString();
                    let isChanged = false;
                    // 显示我的音乐云盘
                    const showCloudRegex = /\[\s*(['"])download\1\s*,\s*(['"])localMusic\2\s*,\s*(['"])cloudDisk\3\s*\]/;
                    if (showCloudRegex.test(code)) {
                        code = code.replace(showCloudRegex, '["download","localMusic"]');
                        isChanged = true;
                    }
                    // 显示播放模式按钮
                    const showPlayModeRegex = /className\s*:\s*"right draggable"\s*,\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*"([^"]*)"\s*,\s*children\s*:\s*\[\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*&&\s*!\s*([a-zA-Z_][a-zA-Z0-9_.]*)\.isWeb\s*\?\s*Object\s*\(\s*([a-zA-Z_][a-zA-Z0-9_.]*)\.jsx\s*\)/g;
                    if (showPlayModeRegex.test(code)) {
                        code = code.replace(showPlayModeRegex, 'className : "right draggable", $1 : "$2", children : [ $3 ? Object( $5 .jsx )');
                        isChanged = true;
                    }
                    // 显示正在播放音质
                    const showPlayingQuality = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*Object\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)\s*\|\|\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\.isWeb\s*\?\s*null\s*:\s*Object\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\.jsx\s*\)\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*\{\s*ignoreClickRef\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*isDefaultMiniBar\s*:\s*!\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,\s*_nk\s*:\s*"([^"]*)"\s*\}\s*\)\s*,/g;
                    if (showPlayingQuality.test(code)) {
                        code = code.replace(showPlayingQuality, '$1=Object($2.$3)($4)||Object($6.jsx)($7.$8,{ignoreClickRef:$9,isDefaultMiniBar:!$10,_nk:"$11"}),');
                        isChanged = true;
                    }
                    if (isChanged) {
                        const createFunc = new Function('return ' + code);
                        modules[moduleId] = createFunc();
                    }

                }

                // 7. 调用原始的 push 方法，让 Webpack 继续正常加载
                return originPush.apply(this, args);
            };
            value.push.__ncmExtendHasHooked = true;
        }
    });
}

const setWebPlayerStyle = () => {
    const webPlayerFontSetting = JSON.parse(GM_getValue('webPlayerFontSetting', '{}'));
    const defaultFont = webPlayerFontSetting.default || '';
    const lyricFont = webPlayerFontSetting.lyric || '';
    if (defaultFont.length > 0) {
        GM_addStyle(`
            #root > div {
            font-family: ${defaultFont};
        }`);
    }
    if (lyricFont.length > 0) {
        GM_addStyle(`
            #mod_pc_lyric_record, .lyric-line  {
                font-family: ${lyricFont};
        }`);
    }
}

/**
 * 监控页面变化
 */
const observerWebPlayer = () => {
    let observer = new MutationObserver((mutations, observer) => {

        mutations.forEach((mutation) => {
            if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
                for (let node of mutation.addedNodes) {
                    if (node.id === "page_pc_setting") {
                        AddQualitySetting(node);
                        AddFontSetting(node);
                    }
                    else if (node.localName === 'div' && node.textContent.startsWith('已上传单曲正在上传网盘容量')) {
                        HandleCloudButton(node);
                    }
                }
            }
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * 添加音质设置
 */
const AddQualitySetting = (node) => {
    const mainDiv = node.querySelector('main');
    const areaToAdd = mainDiv.querySelector('#play > div');
    const radioChecked = mainDiv.querySelector('.cmd-radio-checked');
    if (!radioChecked) return;
    const radioCheckedClassName = radioChecked.className;
    const radioClassName = radioCheckedClassName.replace('cmd-radio-checked', '');

    const currentLevel = GM_getValue('DEFAULT_LEVEL', defaultOfDEFAULT_LEVEL);

    const React = unsafeWindow.React;
    const ReactDOM = unsafeWindow.ReactDOM;
    if (!React || !ReactDOM) {
        return;
    }

    const existContainer = mainDiv.querySelector('.ncmextend-quality-react-container');
    if (existContainer) {
        try { ReactDOM.unmountComponentAtNode(existContainer); } catch (e) { }
        existContainer.remove();
    }

    const container = document.createElement('section');
    container.className = 'item list ncmextend-quality-react-container';
    areaToAdd.insertBefore(container, areaToAdd.firstChild)

    const { useState } = React;

    const RadioList = () => {
        const [level, setLevel] = useState(currentLevel);

        const onSelect = (key) => {
            setLevel(key);
            try { GM_setValue('DEFAULT_LEVEL', key); } catch (e) { }
        }

        const items = Object.keys(levelOptions).map((key) => {
            const checked = level === key;
            const labelClass = checked ? radioCheckedClassName : radioClassName;
            const spanClass = checked ? 'cmd-radio-inner-checked' : '';

            return React.createElement('span', { className: 'option-item', key, style: { width: '33.3%', marginTop: '10px', boxSizing: 'border-box' } },
                React.createElement('label', { className: labelClass, onClick: () => onSelect(key) },
                    React.createElement('span', { className: `cmd-radio-inner ${spanClass}` },
                        React.createElement('input', { type: 'radio', 'aria-describedby': '', value: levelOptions[key], readOnly: true }),
                        React.createElement('span', { className: 'cmd-radio-inner-display' },
                            checked ? React.createElement('span', { role: 'img', 'aria-label': 'radio', className: 'cmd-icon cmd-icon-default cmd-icon-radio IconStyle_i7u766h' },
                                React.createElement('svg', { viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', width: '1em', height: '1em', focusable: 'false', 'aria-hidden': 'true' },
                                    React.createElement('circle', { cx: 12, cy: 12, r: 5, fill: 'currentColor' })
                                )
                            ) : null
                        )
                    ),
                    React.createElement('div', { className: 'cmd-radio-content' },
                        React.createElement('span', { className: 'cmd-radio-addon', id: key },
                            React.createElement('span', { className: 'text' }, levelOptions[key])
                        )
                    )
                )
            );
        });

        const grid = React.createElement('div', { className: 'ncmextend-quality-grid', style: { display: 'flex', flexWrap: 'wrap' } }, ...items);
        return React.createElement('h4', { className: '' }, '音质播放设置', grid);
    };

    ReactDOM.render(React.createElement(RadioList), container);
}

/**
 * 字体设置
 */
const AddFontSetting = (node) => {
    const mainDiv = node.querySelector('main');
    const areaToAdd = mainDiv.querySelector('#normal > div');
    const buttonFound = mainDiv.querySelector('.cmd-button');
    if (!buttonFound) return;
    const buttonClassName = buttonFound.className;

    const React = unsafeWindow.React;
    const ReactDOM = unsafeWindow.ReactDOM;
    if (!React || !ReactDOM) {
        return;
    }

    const existContainer = mainDiv.querySelector('.ncmextend-font-react-container');
    if (existContainer) {
        try { ReactDOM.unmountComponentAtNode(existContainer); } catch (e) { }
        existContainer.remove();
    }

    const container = document.createElement('section');
    container.className = 'item list ncmextend-font-react-container';
    areaToAdd.appendChild(container);

    const Button = () => {
        const onClick = () => {
            Swal.fire({
                title: '自定义字体',
                html:
                    `<div><label>通用字体<input id="ncm-font-default" class="swal2-input"></label></div>
                    <div><label>滚动歌词字体<input id="ncm-font-lyric" class="swal2-input"></label></div>`,
                footer: `<div>示例："SF Pro Rounded", "ui-rounded",  "PingFang SC"</div>
                <div>字体之间以英文逗号分隔，字体格式请参考 <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/font-family" target="_blank">MDN</a></div>`,
                confirmButtonText: '保存',
                showCloseButton: true,
                focusConfirm: false,
                didOpen: () => {
                    const container = Swal.getHtmlContainer();
                    const webPlayerFontSetting = JSON.parse(GM_getValue('webPlayerFontSetting', '{}'));
                    container.querySelector('#ncm-font-default').value = webPlayerFontSetting.default || '';
                    container.querySelector('#ncm-font-lyric').value = webPlayerFontSetting.lyric || '';
                },
                preConfirm: () => {
                    const container = Swal.getHtmlContainer();
                    const defaultFont = container.querySelector('#ncm-font-default').value;
                    const lyricFont = container.querySelector('#ncm-font-lyric').value;
                    return { defaultFont, lyricFont };
                }
            }).then((res) => {
                if (res && res.isConfirmed) {
                    const v = res.value || {};
                    GM_setValue('webPlayerFontSetting', JSON.stringify({ default: v.defaultFont || '', lyric: v.lyricFont || '' }));

                    showConfirmBox('保存成功，刷新网页生效。');
                }
            });
        };

        return React.createElement('button', { className: buttonClassName, onClick }, '自定义字体');
    };

    ReactDOM.render(React.createElement(Button), container);

}

/**
 * 处理云盘上传按钮点击事件
 */
const HandleCloudButton = (node) => {
    const button = node.querySelector('div > div > button:nth-child(2)');
    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();  // 阻止事件冒泡
            event.preventDefault();   // 阻止默认行为
            showConfirmBox('新版网页端没有实现上传功能，估计网易云因此隐藏“我的音乐云盘”的。脚本在原版网页端的个人主页提供了上传功能。欢迎前去使用。');
        }, true);
    }
}