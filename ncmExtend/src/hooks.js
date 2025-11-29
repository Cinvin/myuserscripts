import { GM_getValue, unsafeWindow } from "$";
import { defaultOfDEFAULT_LEVEL, levelWeight } from "./utils/constant";
import { isSettedHeader, weapiRequestSync } from "./utils/request";
import { levelDesc } from "./utils/descHelper";
import { storageCommentInfo } from "./commentBox";
import { levelTipDOM } from "./webPlayer/main"

export const hookTopWindow = () => {
    ah.proxy(
        {
            onRequest: (config, handler) => {
                if (isSettedHeader && config.url.includes("api/feedback/weblog")) {
                    //屏蔽日志接口请求
                    handler.resolve({
                        config: config,
                        status: 200,
                        headers: { "content-type": "application/x-www-form-urlencoded" },
                        response: '{"code":200,"data":"success","message":""}',
                    });
                } else {
                    handler.next(config);
                }
            },
            onResponse: (response, handler) => {
                if (response.config.url.includes("/weapi/song/enhance/player/url/v1")) {
                    handlePlayResponse(response.response, false).then((res) => {
                        response.response = res;
                        handler.next(response);
                    });
                } else {
                    handler.next(response);
                }
            },
        },
        unsafeWindow
    );
};

export const hookContentFrame = () => {
    ah.proxy(
        {
            onRequest: (config, handler) => {
                //屏蔽日志接口请求
                if (isSettedHeader && config.url.includes("api/feedback/weblog")) {
                    handler.resolve({
                        config: config,
                        status: 200,
                        headers: { "content-type": "application/x-www-form-urlencoded" },
                        response: '{"code":200,"data":"success","message":""}',
                    });
                } else {
                    handler.next(config);
                }
            },
            onResponse: (response, handler) => {
                if (response.config.url.includes("/weapi/song/enhance/player/url/v1")) {
                    handlePlayResponse(response.response, false).then((res) => {
                        response.response = res;
                        handler.next(response);
                    });
                }
                //评论区增加IP信息
                else if (
                    response.config.url.includes("/weapi/comment/resource/comments/get")
                ) {
                    let content = JSON.parse(response.response);
                    storageCommentInfo(content);
                    handler.next(response);
                } else {
                    handler.next(response);
                }
            },
        },
        unsafeWindow
    );
};

export const hookOtherWindow = () => {
    ah.proxy(
        {
            onRequest: (config, handler) => {
                if (isSettedHeader && config.url.includes("api/feedback/weblog")) {
                    //屏蔽日志接口请求
                    handler.resolve({
                        config: config,
                        status: 200,
                        headers: { "content-type": "application/x-www-form-urlencoded" },
                        response: '{"code":200,"data":"success","message":""}',
                    });
                } else {
                    handler.next(config);
                }
            },
            onResponse: (response, handler) => {
                if (response.config.url.includes("/weapi/song/enhance/player/url/v1")) {
                    handlePlayResponse(response.response, false).then((res) => {
                        response.response = res;
                        handler.next(response);
                    });
                } else {
                    handler.next(response);
                }
            },
        },
        unsafeWindow
    );
};

export const hookWebPlayerFetch = () => {
    const origFetch = window.fetch;

    const myCustomFetch = async function (resource, options = {}) {
        const response = await origFetch(resource, options);

        const resClone = response.clone();

        const url = typeof resource === 'string' ? resource : resource.url;

        if (url.includes('/weapi/song/enhance/player/url/v1')) {
            const content = await resClone.text();
            const res = await handlePlayResponse(content, true);
            const newResponse = new Response(res, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
            return newResponse;
        }
        else if (url.includes('/weapi/aio/produce/material/group/get')) {
            const content = await resClone.text();
            let jsonContent = JSON.parse(content);
            if (jsonContent && jsonContent.data) {
                //网页无法加载特效模式，全部移除
                jsonContent.data.materialList = [];
                // for (let material of jsonContent.data.materialList) {
                //     material.vipFlag = 'FREE';
                // }
            }
            const newResponse = new Response(JSON.stringify(jsonContent), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
            });
            return newResponse;
        }
        else {
            return response;
        }

    };
    unsafeWindow.fetch = myCustomFetch;
};

/**
 * 替换高音质音源
 * @param {string} response 
 * @param {boolean} isWebPlayer - 是否为新网页端
 */
const handlePlayResponse = async (response, isWebPlayer) => {
    const content = JSON.parse(response);
    const songId = content.data[0].id;
    const targetLevel = GM_getValue("DEFAULT_LEVEL", defaultOfDEFAULT_LEVEL);
    if (!isWebPlayer && content.data[0].type !== "mp3" && content.data[0].type !== "m4a") {
        content.data[0].type = "mp3";
    }

    if (content.data[0].url) {
        if (["standard", "higher", "exhigh"].includes(content.data[0].level)) {
            if (levelWeight[targetLevel] > levelWeight[content.data[0].level]) {
                let apiData = {
                    "/api/song/enhance/player/url/v1": JSON.stringify({
                        ids: JSON.stringify([songId]),
                        level: targetLevel,
                        encodeType: "mp3",
                    }),
                };
                if (content.data[0].fee == 0) {
                    apiData["/api/song/enhance/download/url/v1"] = JSON.stringify({
                        id: songId,
                        level:
                            levelWeight[targetLevel] > levelWeight.hires
                                ? "hires"
                                : targetLevel,
                        encodeType: "mp3",
                    });
                }
                const BatchRes = await weapiRequestSync("/api/batch", { data: apiData });
                if (BatchRes) {
                    let songUrl = BatchRes["/api/song/enhance/player/url/v1"].data[0].url;
                    let songLevel = BatchRes["/api/song/enhance/player/url/v1"].data[0].level;
                    if (BatchRes["/api/song/enhance/download/url/v1"]) {
                        let songDLLevel = BatchRes["/api/song/enhance/download/url/v1"].data.level;
                        if (
                            BatchRes["/api/song/enhance/download/url/v1"].data.url &&
                            levelWeight[songDLLevel] > levelWeight[songLevel]
                        ) {
                            songUrl = BatchRes["/api/song/enhance/download/url/v1"].data.url;
                            songLevel = songDLLevel;
                        }
                    }
                    content.data[0].url = songUrl;
                    showLevelTips(songLevel);
                }
            }
        } else {
            showLevelTips(content.data[0].level);
        }
    }
    return JSON.stringify(content);
};

const showLevelTips = (level) => {
    const desc = levelDesc(level);
    try {
        if (unsafeWindow && unsafeWindow.top && unsafeWindow.top.player) {
            unsafeWindow.top.player.tipPlay(desc);
            return;
        }
    } catch (e) {
    }

    if (levelTipDOM) {
        levelTipDOM.innerHTML = desc;
    }
}