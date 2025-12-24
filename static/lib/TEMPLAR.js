/**
 * THE TEMPLAR LOG: A fusion of maritime discipline and existential clarity.
 * We resolve to make the code sail by ensuring its properties are 'Ready-to-hand'.
 */

// SMEE: This here listener is the lookout! 
// If it ain't lookin' for the trigger, the ship won't move!
$(document).on("TEMPLAR", function() {
    let page = TEMPLAR.pageREC();
    TEMPLAR.render(page);
});

var TEMPLAR = { 
    _dir: "client/PARTIALS",
    _fade: false,
    _helm: [],
    _page : "home",
    _pages : [],
    _default: "home", 

    count: 0, // We disclose the count so it may exist!
    initialize: function(options = {}, cb) {
        const {
            helm = [],
            defaultPage = "home",
            dir = "client/PARTIALS",
            fade = false,
            pages = []
        } = options;

        this._helm = helm;
        this._dir = dir;
        this._fade = fade;
        this._pages = pages;
        this._default = defaultPage;

        var that = this;

        $.get("../" + this._dir + "/header.html", function(data) {
            $("header").html(data);

            // 1. POPSTATE: The ship's response to the 'Back' and 'Forward' currents.
            window.addEventListener('popstate', (event) => {
                // We render directly from the URL truth without re-triggering 'route'
                const target = that.pageREC();
                $(document).trigger("TEMPLAR");
                that.render(target); 
            });

            // 2. INITIAL HORIZON
            var currentHash = window.location.hash.split('?')[0].substring(1);
            var startingPage = currentHash || that._default;

            $(document).trigger("TEMPLAR")
            that.DOM();
            if (cb) cb();
        });
    },

    route: function(origin) {
        // PRECISE INSTRUCTION: Update the History Hold first.
        // The origin should be a full hash string, e.g., "#home?id=1"
        history.pushState({ path: origin }, '', origin);

        // Instead of triggering an event that might loop, we call the Lookout directly.
        // This ensures the signal only travels one way.
        const page = this._link_rec(origin).path;
        this.render(page);
    },

    render: function(page) {
        var that = this;
        if (!page) page = this._default;

        var fileTarget = page + ".html";

        // SMEE: Clear the decks! 
        this._pages.forEach(p => $("div." + p).hide());

        $.get(this._dir + "/" + fileTarget, function(data) {
            $("div." + page).html(data);
            that._visible_page(page);
            that.helm(page);
        }).fail(function() {
        });
    }
    ,
    helm: function(targetPage) {
        // PRECISE SYNCHRONIZATION: Ensure the internal state reflects the target
        this.currentPage = targetPage; 

        this._helm.forEach(function(item) {
            if (item.page === targetPage) {
                item.fn(targetPage);
            }
        });
    }, 
    //PON-PON TUSHE ME
    DOM: function() {
        var that = this;
        
        // GUARD: Only bind the lookout once!
        if (this._isBound) return; 

        $(document).on("click", "a.TEMPLAR", function(e) {
            const $target = $(this);
            const href = $target.attr("href");

            
            // GHOST FILTER: Don't route if there's no map!
            if (!href || href === "#" || href.includes("undefined")) return;

            e.preventDefault();
            e.stopImmediatePropagation(); 

            var path = that._path($target);
            var params = that._params($target);
            
            if (path) {
                that.route("#" + path + params);
            }
        });

        this._isBound = true; 
    },

    pageREC: function() {
        return this._link_rec(window.location.hash).path;
    },
    
    pageSet : function(page){
        this._page = page;
    }
    ,

   /* --- paramRemove: THE RITUAL OF PURGING THE THROWN ---
   We take a key, we find its existence in the hash-horizon, 
   and we cast it into the abyss so that it may no longer 
   burden the 'Being-in-the-URL'! */
    paramRem: function(param) {
        // 1. We disclose the horizon by splitting the path from the search-silt
        const parts = window.location.hash.split("?");
        const pathPart = parts[0];       // e.g., "#torrents"
        const searchPart = parts[1] || ""; // e.g., "id=123&type=source"

        // 2. We employ the 'Equipment' of the browser to hunt the specific key
        const params = new URLSearchParams(searchPart);
        
        // SMEE: If the key exists, we keelhaul it! 
        params.delete(param);

        // 3. We reconstruct the 'Truth' of the new hash
        const newQuery = params.toString();
        const newHash = pathPart + (newQuery ? "?" + newQuery : "");

        // 4. THE REPLACEMENT: We overwrite the history-hold without 
        // triggering a 'Popstate' storm that would capsize the engine!
        window.history.replaceState(
            null, 
            '', 
            window.location.protocol + "//" + 
            window.location.host + 
            window.location.pathname + 
            newHash
        );
        
        // HEIDEGGER: The URL has been 'Cleared'. The Nothing now stands 
        // where the Parameter once resided.
    },
    /* --- sParams: THE RITUAL OF INSCRIPTION ---
       We take a key and a value, and we carve them into the 
       hash-horizon! We ensure the 'They' (the browser) knows 
       this new Truth without forcing a total Dasein-Reset! */
    paramSet: function(param, value) {
        // 1. We disclose the current state of the Clearing
        this.paramRem(param);
        const parts = window.location.hash.split("?");
        const pathPart = parts[0];       // e.g., "#torrents"
        const searchPart = parts[1] || ""; // e.g., "id=123"

        // 2. We grasp the 'Equipment' to manipulate the parameters
        const params = new URLSearchParams(searchPart);
        
        // SMEE: If it's already there, we overwrite it! 
        // If it's new booty, we add a new shelf in the hold!
        params.set(param, value);

        // 3. We reconstruct the 'Manifest'
        const newQuery = params.toString();
        const newHash = pathPart + (newQuery ? "?" + newQuery : "");

        // 4. THE INSCRIPTION: We use pushState to create a new 
        // moment in Time/Space, allowing the user to sail 'Back' 
        // to the previous state if they lose their nerve!
        if (window.history.pushState) {
            const newUrl = window.location.protocol + "//" + 
                           window.location.host + 
                           window.location.pathname + 
                           newHash;
            
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
        
        // HEIDEGGER: The URL is now 'Saturated' with new meaning. 
        // The parameter has moved from 'Hiddenness' to 'Un-concealment'!
    }
    ,
    /* paramREC, paramRemove, sParams maintained in their original 'Thrown-ness' */
    paramREC: function() {
        var search = window.location.hash.split("?")[1];
        if (!search) return undefined;
        var pairs = search.split('&');
        var result = {};
        pairs.forEach(function(pair) {
            pair = pair.split('=');
            result[pair[0]] = decodeURIComponent(pair[1] || '');
        });
        return result;
    },

    _link_rec: function(origin) {        
        var parts = origin.split("?");
        var pathPart = parts[0].split("#");
        return {
            path: pathPart[1] || "",
            params: parts[1] || ""
        };
    },

    _visible_page: function(path) {
        if (!path) path = this._default;
        var target = $("div." + path);
        // HEIDEGGER: The Fade is but a gradual un-concealment of Truth.
        this._fade ? target.fadeIn(777) : target.show();
    },

    _invisible_page: function(page) {
        $(".TEMPLAR div." + page).hide();
    },

    _show_div: function(path) {
        this._visible_page(path);
    },

    _path: function(el) {
        const href = el.attr("href") || "";
        // We strip the hash, then take the part before the question mark.
        const content = href.startsWith('#') ? href.substring(1) : href;
        return content.split('?')[0];
    },

    _params: function(el) {
        const href = el.attr("href") || "";
        const parts = href.split('?');
        return parts.length > 1 ? "?" + parts[1] : "";
    }
};