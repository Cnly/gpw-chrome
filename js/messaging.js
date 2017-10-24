'use strict';

var msgShell = {
    gPassword: {
        action: null
    }
};

function sendMessage (target, action, data, origin) {
    var msg = jQuery.extend(true, msgShell, {
        gPassword: {
            action: action
        }
    }, {
        gPassword: data
    });
    target.postMessage(msg, origin);
}

function readMessage (event, action, dataKey, ignoreOrigin) {
    if (ignoreOrigin || event.origin === 'chrome-extension://' + chrome.runtime.id) {
        var g = event.data.gPassword;
        if (!g || action !== g.action) {
            return null;
        }
        return g[dataKey];
    }
}