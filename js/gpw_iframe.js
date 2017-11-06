'use strict';

var targetLength = 32;
var chars = CHARS;

$(document).ready(function () {

    var $keyElements = $('body, input');
    var $password = $('#password');
    var $visibilityIcon = $('#visibility-icon');
    var $copyIcon = $('#copy-icon');

    function getOutput () {
        var password = $password.val(), key = $('#key').val();
        if (!password || !key) {
            return null;
        }
        return gpw(password, key, targetLength, chars);
    }

    $('#16, #24, #32').bind('click keyup', function () {
        targetLength = parseInt($(this).attr('id'));
    });

    $('#standard').bind('click keyup', function () {
        chars = CHARS;
    });

    $('#weaker').bind('click keyup', function () {
        chars = CHARS_WEAKER;
    });

    $('#visibility-button').click(function () {
        if ($password.attr('type') === 'password') {
            $password.attr('type', 'text');
            $visibilityIcon.text('visibility_off');
        } else {
            $password.attr('type', 'password');
            $visibilityIcon.text('visibility');
        }
    });

    $('#gpw-copy').click(function () {
        var output = getOutput();
        if (!output || 0 === output.length) {
            return;
        }

        var copyFrom = $('<textarea/>');
        copyFrom.text(output);
        $('body').after(copyFrom);
        copyFrom.select();
        var success = document.execCommand('copy');
        copyFrom.remove();

        if (success) {
            $(this).removeClass('btn-secondary')
                .addClass('btn-success');
            $copyIcon.text('done');
        } else {
            $(this).removeClass('btn-secondary')
                .addClass('btn-danger');
            $copyIcon.text('error');
        }

        setTimeout(function () {
            $('#gpw-copy').removeClass('btn-success btn-danger')
                .addClass('btn-secondary');
            $copyIcon.text('content_copy');
        }, 1000);

    });

    $keyElements.on('keydown', null, 'return', function () {
        var output = getOutput();
        if (!output) {
            return;
        }
        sendMessage(window.parent, 'gpw', {'gpw': output}, '*');
    });

    $keyElements.on('keydown', null, 'esc', function () {
        sendMessage(window.parent, 'closeGpw', {'closeGpw': true}, '*');
    });

    window.addEventListener('message', function (e) {
        if (readMessage(e, 'focus', 'focus', true)) {
            document.activeElement.blur();
            var $password = $('#password');
            $password.focus();
            $password.select();
        }
    });

});