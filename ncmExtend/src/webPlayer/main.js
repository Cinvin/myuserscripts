import { levelOptions, defaultOfDEFAULT_LEVEL } from '../utils/constant'
import { hookWebPlayerFetch } from '../hooks'
import { showConfirmBox } from '../utils/common';

export const onWebPlayerStart = () => {
    hookWebpackJsonp();
    hookWebPlayerFetch();
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
            // 1. 保存 Webpack 试图赋值的那个数组
            // 注意：这里我们将 originalJsonp 更新为新的 value，确保后续 Webpack 能正常读取
            originalJsonp = value;

            // 2. 获取原始的 push 方法
            const originPush = value.push;

            // 3. 劫持（重写）push 方法
            value.push = function (...args) {
                // args[0] 是当前加载的 chunk，通常结构为 [chunkIds, modules, ...]
                const chunk = args[0];
                const modules = chunk[1]; // modules 是一个对象或数组，存放具体的模块函数

                // 遍历所有模块
                for (const moduleId in modules) {
                    const moduleFunc = modules[moduleId];

                    // 将模块函数转换为字符串
                    let code = moduleFunc.toString();

                    // 4. 检查是否包含目标字符串
                    const targetStr = '["download","localMusic","cloudDisk"]';
                    if (code.includes(targetStr)) {
                        // 5. 执行替换
                        // 显示我的音乐云盘
                        code = code.replace(targetStr, '["download","localMusic"]');

                        // 6. 将修改后的字符串还原为函数
                        const createFunc = new Function('return ' + code);
                        modules[moduleId] = createFunc();
                    }
                }

                // 7. 调用原始的 push 方法，让 Webpack 继续正常加载
                return originPush.apply(this, args);
            };
        }
    });
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
                    }
                    else if (node.id === 'page_pc_mini_bar') {
                        AddLevelTips(node);
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

export let levelTipDOM = null;

/**
 * 播放器添加音质提示
 */
const AddLevelTips = (node) => {
    const areaToAdd = node.querySelector('.side.right-side > div');
    if (!areaToAdd) return;
    levelTipDOM = document.createElement('div');
    areaToAdd.insertBefore(levelTipDOM, areaToAdd.firstChild);
}

/**
 * 处理云盘上传按钮点击事件
 */
const HandleCloudButton = (node) => {
    const button = node.querySelector('div > div > button:nth-child(2)');
    console.log('button:', button);
    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();  // 阻止事件冒泡
            event.preventDefault();   // 阻止默认行为
            showConfirmBox('新版网页端没有实现上传功能，估计网易云因此隐藏“我的音乐云盘”的。脚本在原版网页端的个人主页提供了上传功能。欢迎前去使用。');
        }, true);
    }
}