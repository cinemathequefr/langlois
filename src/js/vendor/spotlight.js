// jQuery plugin: spotlight
// From artsy.net common.js
//


(function ($) {
    var e = {
                interval: 5e3,
                fade_class: "fade_out",
                fadeables: [],
                timeout: null,
                cancel: !1
            },
        r = {
            init: function(o) {
                o && $.extend(e, o);
                e.$_this = this;
                e.fadeables = $(e.fadeables);
                e.fadeables.addClass("fadeable");
                r.fadeOut();
                $(document).bind("click.spotlight", r.fadeIn).bind("keyup.spotlight", r.fadeIn).bind("mousemove.spotlight", r.fadeIn);
                $(e.fadeables).bind("mouseover.spotlight", r.mouseoverOthers).bind("mouseout.spotlight", r.mouseoutOthers);
                return this;
            },
            mouseoverOthers: function() {
                e.cancel = !0;
                window.clearTimeout(e.timeout);
            },
            mouseoutOthers: function() {
                e.cancel = !1;
                window.clearTimeout(e.timeout);
                e.timeout = window.setTimeout(r.fadeOut, e.interval);
            },
            fadeIn: function() {
                $(e.fadeables).removeClass(e.fade_class);
                window.clearTimeout(e.timeout);
                e.timeout = window.setTimeout(r.fadeOut, e.interval);
            },
            fadeOut: function() {
                e.cancel || $(e.fadeables).addClass("fade_out");
                window.clearTimeout(e.timeout);
            },
            destroy: function() {
                r.fadeIn();
                $(e.fadeables).unbind(".spotlight");
                $(document).unbind(".spotlight");
                window.clearTimeout(e.timeout);
            },
            option: function($, r) {
                return r ? (e[$] = r, void 0) : e[$];
            }
        };

    $.fn.spotlight = function(e) {
        return r[e] ? r[e].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof e && e ? ($.error("Method " + e + " does not exist on jQuery.spotlight"), void 0) : r.init.apply(this, arguments)
    }

}(jQuery));

