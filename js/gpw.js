'use strict';

var $gpwDiv;
var $gpwFrame;
var $target;

function openGpwFor(target) {

    $target = $(target);

    $gpwDiv.css(
        {
            position: 'absolute',
            top: $target.offset().top + 'px',
            left: ($target.offset().left + $target.outerWidth() + 5) + 'px'
        }
    );

    $gpwDiv.show();

}

function hideGpw () {
    $gpwDiv.hide();
}

function closeGpw () {
    document.activeElement.blur();
    $target.focus();
    hideGpw();
}

$(document).ready(function () {

    var activeElement = document.activeElement;

    var $passwordInputs = $('[type=password]');
    $passwordInputs.on('focus click', function () {
        openGpwFor(this);
    }).on('keydown', null, 'alt+s', function () {
        openGpwFor(this);
        sendMessage($gpwFrame[0].contentWindow, 'focus', {focus: true}, '*');
    }).blur(function () {
        if (this !== document.activeElement) {
            hideGpw();
        }
    });

    if ($passwordInputs.length !== 0) {
        $gpwDiv = $('<div>', {
            id: 'gpw-div',
            style: 'display: none; z-index: 9999; height: 180px; width: 300px;'
        });

        $gpwDiv.append(
            $gpwFrame = $('<iframe>', {
                src: chrome.runtime.getURL('gpw_iframe.html'),
                id: 'gpw-iframe',
                style: 'height: 180px; width: 300px;',
                frameborder: 0,
                scrolling: 'no'
            }));

        $gpwDiv.draggable();
        $gpwDiv.insertAfter(document.body);
    }

    if ('password' === activeElement.type) {
        openGpwFor(activeElement)
    }

    window.addEventListener('message', function (e) {
        // TODO: Optimization
        var gpw = readMessage(e, 'gpw', 'gpw');
        if (gpw) {
            $target.val(gpw);
            closeGpw();
        }
        var isCloseGpw = readMessage(e, 'closeGpw', 'closeGpw');
        if (isCloseGpw) {
            closeGpw();
        }
    });

});