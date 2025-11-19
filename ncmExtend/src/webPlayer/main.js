import { levelOptions, defaultOfDEFAULT_LEVEL } from '../utils/constant'
export const observerWebPlayer = () => {
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
    areaToAdd.appendChild(container);

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

            return React.createElement('span', { className: 'option-item', key, style: { width: '50%', marginTop: '10px', boxSizing: 'border-box' } },
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
