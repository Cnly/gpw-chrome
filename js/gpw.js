'use strict';

var $gpwDiv;
var $gpwFrame;
var targetPasswordInput;
var $target;
var globalClickHandler;

function openGpwFor(target) {

    targetPasswordInput = target;
    $target = $(target);

    $gpwDiv.css(
        {
            position: 'absolute',
            top: $target.offset().top + 'px',
            left: ($target.offset().left + $target.outerWidth() + 5) + 'px'
        }
    );

    $gpwDiv.show();

    if (!globalClickHandler) {
        $(document).mousedown(globalClickHandler = function (e) {
            if (e.target !== targetPasswordInput) {
                hideGpw();
            }
        });
    }

}

function hideGpw () {
    $gpwDiv.hide();
    $(document).off('mousedown', null, globalClickHandler);
    globalClickHandler = null;
}

function closeGpw () {
    document.activeElement.blur();
    $target.focus();
    hideGpw();
    $target.trigger('change');
}

$(document).ready(function () {

    var activeElement = document.activeElement;

    var $passwordInputs = $('[type=password]');
    $passwordInputs.on('focus click', function () {
        openGpwFor(this);
    }).on('keydown', null, 'alt+s', function () {
        openGpwFor(this);
        sendMessage($gpwFrame[0].contentWindow, 'focus', {focus: true}, '*');
    }).on('keydown', null, 'tab', function () {
        hideGpw();
    }).on('keydown', null, 'shift+tab', function () {
        hideGpw();
    });

    if ($passwordInputs.length !== 0) {
        $gpwDiv = $('<div>', {
            id: 'gpw-div',
            style: 'display: none; z-index: 9999; height: 180px; width: 300px; box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.22), 0 2px 35px 0 rgba(0, 0, 0, 0.2);'
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

            var inputSimulatorCode = [
                "var target = document.getElementById('{id}');".replace('{id}', targetPasswordInput.id),
                "target.dispatchEvent(new Event('keydown', {}));",
                "target.dispatchEvent(new Event('keyup', {}));",
                "target.dispatchEvent(new Event('keypress', {}));",
                "target.dispatchEvent(new Event('input', {}));",
                "target.dispatchEvent(new Event('change', {}));"
            ].join('\n');
            var script = document.createElement('script');
            script.textContent = inputSimulatorCode;
            (document.head||document.documentElement).appendChild(script);
            script.remove();

            closeGpw();
        }
        var isCloseGpw = readMessage(e, 'closeGpw', 'closeGpw');
        if (isCloseGpw) {
            closeGpw();
        }
    });

});