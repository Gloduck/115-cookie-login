// ==UserScript==
// @name         115 Cookie登录
// @namespace    115_cookie_login
// @author       Gloduck
// @version      1.0
// @description  115Cookie登录
// @match        *://*.115.com/*
// @grant        GM_cookie
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';

    let requireCookieNames = [
        "UID", "CID", "SEID"
    ];


    /**
     * Alter展示Cookie
     */
    function showCookie() {
        // 使用GM_cookie函数获取Cookie
        GM_cookie.list({domain: ".115.com"}, function (cookieInfos, error) {
            if (!error) {
                let cookieOutputs = [];
                cookieInfos.forEach(function (cookieInfo) {
                    if (requireCookieNames.includes(cookieInfo.name)) {
                        cookieOutputs.push(`${cookieInfo.name}=${cookieInfo.value}`);
                    }
                })
                alert(`Cookie信息为：\n---------------------------\n${cookieOutputs.join("\n")}\n---------------------------\n内容已复制到剪切板！`);
                GM_setClipboard(`${cookieOutputs.join(";")};`);
            } else {
                alert("获取cookie失败，请检查是否支持GM_cookie函数（目前只有beta版支持）")
            }
        });
    }

    /**
     * 初始化复制Cookie按钮
     */
    function initCopyCookieButton() {
        let btnGroupDiv = document.querySelector('div.left-tvf[rel="left_tvf"]');
        if (btnGroupDiv) {
            // 创建复制 Cookie 按钮
            let copyButton = document.createElement('a');
            copyButton.href = 'javascript:;';
            copyButton.className = 'button btn-line btn-upload';
            copyButton.innerHTML = '<i class="icon-operate ifo-copy"></i><span>复制Cookie</span>';

            // 点击显示Cookie
            copyButton.addEventListener('click', showCookie);

            btnGroupDiv.appendChild(copyButton);
        }
    }


    /**
     * 获取Cookie需要的列
     * @param requireFields {Array}
     * @param cookie {string}
     * @returns {Map<any, any>}
     */
    function getRequireFieldFromCookie(requireFields, cookie) {
        let resMap = new Map();
        if (!cookie) {
            return resMap;
        }
        let cookies = cookie.split(";");
        cookies.forEach(function (cookie) {
            if (!cookie) {
                return;
            }
            let kv = cookie.split("=");
            if (kv.length != 2) {
                return;
            }
            if (requireFields.includes(kv[0])) {
                resMap.set(kv[0], kv[1]);
            }
        })
        return resMap;
    }

    /**
     * Cookie登录
     * @param requireCookieMap {Map}
     * @param validDuration {number}
     */
    function handleCookieLogin(requireCookieMap, validDuration){
        requireCookieMap.forEach((value, key) => {
            GM_cookie.delete({ name: key }, function(error) {
                if (error) {
                    alert(`清除Cookie：[${key}]失败！请检查是否支持GM_cookie函数（目前只有beta版支持）`);
                }
            });
            GM_cookie.set({
                // url: '.115.com',
                name: key,
                value: value,
                domain: '.115.com',
                path: '/',
                secure: false,
                httpOnly: false,
                expirationDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * validDuration) // Expires in 30 days
            }, function(error) {
                if (error) {
                    alert(`设置Cookie：[${key}]失败，值为：[${value}]！请检查是否支持GM_cookie函数（目前只有beta版支持）`);
                }
            });
        })
        setTimeout(function () {
            location.reload();
        }, 1000);
    }

    /**
     * 显示Cookie登录的输入框
     */
    function showCookieLoginInputDialog() {
        let inputCookie = prompt('请输入 Cookie：');
        let requireCookieMap = getRequireFieldFromCookie(requireCookieNames, inputCookie);
        if (requireCookieMap.size != requireCookieNames.length) {
            alert(`输入的Cookie需包含[${requireCookieNames.join(",")}]，请重新输入！`);
            return;
        }
        let defaultValidDuration = 30;
        let inputValidDuration = prompt("请输入Cookie有效天数：", defaultValidDuration);
        let validDuration = parseInt(inputValidDuration, 10) || defaultValidDuration;
        handleCookieLogin(requireCookieMap, validDuration);
    }


    /**
     * 初始化Cookie登录按钮
     */
    function initCookieLoginButton() {
        let loginFooter = document.querySelector('div.login-footer[rel="login_footer"]');
        if (loginFooter) {
            // 分隔符
            let splitField = document.createElement('i');
            splitField.textContent = '|';
            // 登录按钮
            let loginSpan = document.createElement('span');
            let loginButton = document.createElement('a');
            loginButton.textContent = '使用 Cookie 登录';
            loginButton.href = 'javascript:;';
            loginButton.addEventListener('click', showCookieLoginInputDialog);
            loginSpan.appendChild(loginButton);
            loginFooter.insertBefore(splitField, loginFooter.firstElementChild);
            loginFooter.insertBefore(loginButton, loginFooter.firstElementChild);
        }
    }


    initCookieLoginButton();
    initCopyCookieButton();

})();