import $ from 'jquery';
import { validationRules } from './config';
import { setLabelError } from './custom-inputs';
import { hideListingActionBar, initSingleSimpleBar } from './service';
import { setGalleryReady } from './layouts/listing';

window.jQuery = $;
require("@fancyapps/fancybox");

class EVNavigator {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
    }
    isTablet() {
        const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(this.userAgent);
        return isTablet;
    }
    isMobile() {
        if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent)) {
            return true;
        }
        return false;
    }
    isApple() {
        // removed mac from check
        if (/iphone|ipad|ipod/i.test(this.userAgent) && !window.MSStream) {
            return true;
        }
        return false;
    }
}

const getScrollVisibility = (element, delta = 100) => {
    let position = element.offset(),
        scroll = $(window).scrollTop(),
        height = $(window).height();
    return (position.top + delta < scroll + height) ? true : false;
};

const scrollClickToAnchor = (query, delta = 0, speed = 500) => {
    $(query).on('click', function (e) {
        e.preventDefault();
        const anchor = $(this).attr("href").split("#")[1];
        scrollToAnchor(anchor, delta, speed);
    });
};

const scrollToAnchor = (elementID, delta = 0, speed = 500) => {
    if (elementID) {
        const tmp = $("#" + elementID).position();
        $("html, body").animate({ scrollTop: tmp.top - delta }, speed);
    }
};

const scrollToElement = (elementQuery, containerQuery, delta = 0, speed = 500) => {
    if (elementQuery && containerQuery) {
        // const tmp = $(elementQuery).offset();
        const top = document.querySelector(containerQuery).scrollTop;
        const offset = document.querySelector(elementQuery).offsetTop;
        // console.warn(elementQuery, top, offset);
        console.dir(document.querySelector(elementQuery));
        $(containerQuery).animate({ scrollTop: offset - delta }, speed);
    }
};

const openPopupByClick = query => {
    $(query).on('click', function () {
        const target = $(this).attr("data-popup");
        openPopup(target);
    });
};

const openPopup = id => {
    const target = "#" + id;
    $.fancybox.open([
        {
            src: target,
            type: "inline",
            closeExisting: true,
            smallBtn: false,
            toolbar: false,
            touch: false,

            beforeShow: function (instance, current) {
                hideListingActionBar(true);
            },
            afterClose: function (instance, current) {
                hideListingActionBar(false);
                lockScroll();
            },
            afterShow: function (instance, current) {
                if (current.src === '#terms') {
                    initSingleSimpleBar($('#terms .popup-content'));
                }
                setTimeout(() => {
                    const unitsSelect = $('body').find('#units_select');
                    unitsSelect.prop('disabled', false);
                    initSingleSimpleBar(unitsSelect);
                    setGalleryReady(true);
                }, 500);
            }
        }
    ]);
    lockScroll();
};

class EVCookie {
    setCookie(name, value, expY, expM, expD, expH, expMin, domain, secure = false, path = false) {
        let cookieString = `${name}=${escape(value)}`;

        if (expY) {
            const expires = new Date(expY, expM, expD, expH, expMin);
            cookieString += `; expires=${expires.toGMTString()}`;
        }

        if (domain)
            cookieString += `; domain=${escape(domain)}`;

        if (secure) {
            cookieString += '; secure';
        }

        if (path) cookieString += `; path=${escape(path)}`;

        document.cookie = cookieString;
    }

    getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    deleteCookie(name) {
        if (!this.getCookie(name)) return;

        this.setCookie(name, '', 1970, 1, 1, 0, 0);
    }
}


const processAjaxForm = (formId, action, refresh = true, callback = false) => {

    $(`#${formId}`).validate(validationRules);

    $(`#${formId}`).on('submit', function (e) {
        e.preventDefault();
        if (!$(`#${formId}`).valid()) {
            setLabelError();
            return;
        }

        let formdata = $(`#${formId}`).serialize();
        formdata += `&action=${action}&nonce_code=${myajax.nonce}`;
        $.ajax({
            url: myajax.url,
            data: formdata,
            type: "POST",
            beforeSend: function () {
                setButtonName(formId);
            },
            success: function (response) {
                revertButtonName(formId);
                const data = JSON.parse(response);
                if (refresh) window.location.reload();
                if (callback) callback(data);
            }
        });
    });
};


const setButtonName = formId => {
    let btn = $(`#${formId}`).find('.btn-primary'),
        btnText = btn.val();
    switch (formId) {
        case 'account-profile-form':
            btn.attr('data-text', btnText);
            btn.val('Saving...');
            break;
        case 'reset-pwd-form':
            btn.attr('data-text', btnText);
            btn.val('Saving...');
            break;
        case 'loginform':
            btn.attr('data-text', btnText);
            btn.val('Logging in');
            break;
        case 'signupform':
            btn.attr('data-text', btnText);
            btn.val('Signing up...');
            break;
        case 'message-agent-form':
            btnText = btn.text();
            btn.attr('data-text', btnText);
            btn.text('Sending...');
            break;
    }
};

const revertButtonName = formId => {
    const btn = $(`#${formId}`).find('.btn-primary'),
        attrText = btn.attr('data-text');
    switch (formId) {
        case 'message-agent-form':
            btn.text(attrText);
            break;
        default:
            btn.val(attrText);
            break;
    }
};

const processAjaxBuy = data => {
    $.ajax({
        url: myajax.url,
        data: data,
        type: "POST",
        success: function (response) {
            const data = JSON.parse(response);
            if (data.status) {
                if (data.type == 'devs') {
                    window.location.href = data.url;
                }
                else
                    window.location.href = data.url;
            }
            else {
                addNotification(getErrorMessage(data.error), 'error');
            }
        }
    });
};

const getErrorMessage = errorCode => {
    switch (errorCode) {
        case 1: return 'Terms are not confirmed';
        case 2: return 'Fill all necessary fields';
        case 3: return 'Invalid E-mail or password';
        case 4: return 'Registration error';
        case 5: return 'Update profile error';
        case 6: return 'New passwords are not equal';
        case 7: return 'Wrong password';
        case 8: return 'No user with that email found';
        case 9: return 'Validation Error';
        case 10: return 'No products found in cart';
        case 11: return 'Incorrect data. Select something.';
        case 12: return 'Already subscribed';
        case 13: return 'Unsubscribe failed';
        case 14: return 'Error while removing avatar';
        case 15: return 'This agent is not avaliable';
        case 16: return 'System error';
        case 17: return 'Not enough credits';
        case 18: return 'Error while changing auto credits option';
        case 19: return 'Please add invoice details in billing information section';
        case 20: return 'Profile picture is too big, upload a picture less than 500KB';
        case 21: return 'Only png and jpg images allowed';
        case 22: return 'Permissions error';
        case 23: return 'Error sending message';
        case 24: return 'User is logged out';
        case 25: return 'Error while updating emails';
    }
};


const getSuccessMessage = successCode => {
    switch (successCode) {
        case 1: return 'Profile information changed';
        case 2: return 'You have succesfully changed your old password';
        case 3: return 'Avatar removed';
        case 4: return 'Successfully logged in';
        case 5: return 'We have sent your message to the agent!';
        case 6: return 'Your subscriptions updated';
        case 7: return 'Subscription frequency updated';
        case 8: return 'Leads purchased';
        case 9: return 'Billing information changed';
        case 10: return 'Auto buy new leads setting turned off';
        case 11: return 'Auto buy new leads setting turned on';
        case 12: return 'Pay later processed successfully. Redirecting to "my account" in 5 seconds';
        case 13: return 'We’ve updated your emails';
        case 14: return 'Password recovery e-mail sent';
        default: return 'Success';
    }
};

function lockScroll() {
    if ($("html").hasClass("lock")) $("html").removeClass("lock");
    else $("html").addClass("lock");
}


function closeNotification() {
    $('.notification').on('click', '.notification-close', function () {
        const current = $(this);
        current.closest('.notification-item').hide(200);
    });
}

const addNotification = (message, success = true, title = '') => {
    const notifications = $('.notification'),
        notification = generateNotification(message, success, title);
    notifications.append(notification);

    const currentItem = notifications.find('.notification-item:last-child');
    currentItem.show(200);
    setTimeout(() => {
        currentItem.hide(200);
    }, 5000);
};

function generateNotification(message, success = true, title = '') {
    let status = '',
        iconClass = '',
        heading = '';

    switch (success) {
        case 'success':
            status = 'success';
            iconClass = 'success-tick';
            heading = (title ? title : 'Success!');
            break;
        case 'error':
            status = 'failure';
            iconClass = 'failure-cross';
            heading = (title ? title : 'Error!');
            break;
        case 'info':
            status = 'info';
            iconClass = 'info-notification';
            heading = (title ? title : 'Info!');
            break;
        case 'warning':
            status = 'warning';
            iconClass = 'warning-notification';
            heading = (title ? title : 'Warning!');
            break;
        default:
            return;
    }
    const closeStyles = !message ? 'style="top:50%;transform:translateY(-50%);"' : '';

    console.log(message);

    message = typeof message === 'undefined' ? '' : `<p>${message}</p>`;
    const icon = `<svg role="img" class="${iconClass}"><use xlink:href="#${iconClass}"></use></svg>`;

    let html = `<div class="notification-item ${status}">${icon}<h6>${heading}</h6>`;
    html += message;
    html += `<div class="notification-close" ${closeStyles}><svg role="img" class="notification-close-icon"><use xlink:href="#notification-close-icon"></use></svg></div>`;
    html += `</div>`;
    return html;
}


const manageDisabledButtons = queryForm => {
    $(queryForm).each(function () {
        $(this).on('click change keyup', function () {
            let filled = 0;
            $(this).find('input:not([type="submit"])').each(function () {
                if (!$(this).val()) {
                    filled = -1;
                }
            });

            const btn = $(this).find('input[type="submit"]');
            if (filled == -1 && !btn.hasClass('btn-disabled')) {
                btn.addClass('btn-disabled');
            }
            if (filled == 0 && btn.hasClass('btn-disabled')) {
                btn.removeClass('btn-disabled');
            }
        });
    });
};

const getClassFromBody = () => {
    const classBody = $('body').attr('class').split(' ');
    let id = classBody.filter(element => element.startsWith("postid-"));
    return id[0].split('-')[1];
};

const isLocalhost = () => {
    const url = window.location.href;
    if (url.indexOf('localhost:8080') == -1)
        return false
    return true;
};

function getTranslateX(htmlElement) {
    const style = window.getComputedStyle(htmlElement);
    const matrix = new WebKitCSSMatrix(style.webkitTransform);
    return matrix.m41;
}

function copyLink(notify = true) {
    if (notify)
        addNotification('Link is copied', 'success');
    const href = window.location.href;
    navigator.clipboard.writeText(href).then(function () {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function defaultAjax(formID, action, type, callback, checkNonce = true, beforeCallback = null, additionalParameters = null) {
    const form = $(`#${formID}`);

    if (form.hasClass('loading')) return;
    form.addClass('loading');

    form.on('submit', function (e) {
        e.preventDefault();
        let formdata = `${form.serialize()}&action=${action}`;

        if (checkNonce) {
            formdata += `&nonce_code=${myajax.nonce}`;
        }

        $.ajax({
            url: myajax.url,
            data: formdata,
            type: type,
            beforeSend: beforeCallback,
            success: function (response) {
                form.removeClass('loading');
                const data = JSON.parse(response);
                callback(data);
            }
        });
    });
}

// ont countDownTimer
const startTimer = (duration, display) => {

    let timer = duration;

    let d = 0,
        h = 0,
        m = 0,
        s = 0,
        hFloor = 0,
        mFloor = 0;

    const interval = setInterval(function () {
        mFloor = parseInt(timer / 60, 10);

        s = parseInt(timer % 60, 10);
        m = parseInt(mFloor % 60, 10);

        hFloor = parseInt(mFloor / 60, 10);
        h = parseInt(hFloor % 24, 10);

        d = parseInt(hFloor / 24, 10);

        d = d < 10 ? `0${d}` : d;
        h = h < 10 ? `0${h}` : h;
        m = m < 10 ? `0${m}` : m;
        s = s < 10 ? `0${s}` : s;

        display.find('.d').text(`${d}d`);
        display.find('.h').text(`${h}h`);
        display.find('.m').text(`${m}m`);
        display.find('.s').text(`${s}s`);

        if (--timer < 0) {
            display.find('.d').text('00d');
            display.find('.h').text('00h');
            display.find('.m').text('00m');
            display.find('.s').text('00s');
            clearInterval(interval);
        }
    }, 1000);
};

function setViewportMaximumScale() {
    const el = document.querySelector('meta[name=viewport]');

    if (el !== null) {
        let content = el.getAttribute('content');
        let re = /maximum\-scale=[0-9\.]+/g;

        if (re.test(content)) {
            content = content.replace(re, 'maximum-scale=1.0');
        } else {
            content = [content, 'maximum-scale=1.0'].join(', ')
        }

        el.setAttribute('content', content);
    }
}

function setResponsiveBodyClass() {
    const setBodyClass = (width) => {
        const $body = $('body');
        if (width < 712) $body.addClass('smallscreen').removeClass('desktop');
        else $body.addClass('desktop').removeClass('smallscreen');
    };

    setBodyClass(window.innerWidth);
    $(window).on('resize', () => setBodyClass(window.innerWidth));
}

export {
    EVCookie,
    EVNavigator,
    setResponsiveBodyClass,
    getScrollVisibility,
    scrollToAnchor,
    scrollClickToAnchor,
    scrollToElement,
    openPopup,
    openPopupByClick,
    getErrorMessage,
    getSuccessMessage,
    processAjaxForm,
    processAjaxBuy,
    addNotification,
    closeNotification,
    manageDisabledButtons,
    lockScroll,
    getClassFromBody,
    setButtonName,
    revertButtonName,
    isLocalhost,
    getTranslateX,
    copyLink,
    startTimer,
    setViewportMaximumScale,
    defaultAjax
};