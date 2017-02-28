const Cookie = {
    get: function(name) {
        const fieldPrefix = `${name}=`;
        let value = null;

        document.cookie.split(';').some(item => {
            item = item.trim();
            if (item.indexOf(fieldPrefix) === 0) {
                value = decodeURIComponent(item.substring(fieldPrefix.length, item.length));
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    return;
                }

                if (value === 'undefined') {
                    value = undefined;
                }
                return true;
            }
        });

        return value;
    },

    set: function(name, value, days = null, path = "/", domain = null, secure = false) {

        const date = new Date();
        let expires = '';

        if (days) {
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `expires=${date.toUTCString()}`;
        }

        const type = typeof(value);
        if (type === 'object') {
            value = JSON.stringify(value);
        }
        const namevalue = `${name}=${encodeURIComponent(value)}`;

        if (secure) {
            secure = 'secure';
        }

        if (domain) {
            domain = `domain=${encodeURIComponent(domain)}`;
        }

        path = `path=${path}`;
        document.cookie = [namevalue, expires, secure, domain, path].filter(item => !!item).join('; ');
    },

    remove: function(name) {
        Cookie.set(name, '', -1);
    },

    isEnabled: function() {
        if (navigator.cookieEnabled) {
            return true;
        }
        document.cookie = "testcookie";
        return document.cookie.indexOf("testcookie") != -1;
    }
};
export default Cookie;
