/**
 * Pasolini Roma
 * @version 2013-05-31
 */
(function () {
    "use strict";

    var gm = google.maps,
        app = {};


    app.commonData = {
        ca: {
            menu: "<ul class='dropdown-menu'><li><a href='#!/ca/index'>Inici</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='intro'>Mapa</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='credits'>Crèdits</a></li><li class='dropdown-divider'></li><li><a href='http://blog.pasoliniroma.com' target='_blank'>Blog</a></li></ul>",
            enter: "Entrar"
        },
        de: {
            menu: "<ul class='dropdown-menu'><li><a href='#!/de/index'>Home</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='intro'>Karte</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='credits'>Impressum</a></li><li class='dropdown-divider'></li><li><a href='http://blog.pasoliniroma.com' target='_blank'>Blog</a></li></ul>",
            enter: "[Enter]"
        },
        en: {
            menu: "<ul class='dropdown-menu'><li><a href='#!/en/index'>Home</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='intro'>Map</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='credits'>Credits</a></li><li class='dropdown-divider'></li><li><a href='http://blog.pasoliniroma.com' target='_blank'>Blog</a></li></ul>",
            enter: "Enter"
        },
        es: {
            menu: "<ul class='dropdown-menu'><li><a href='#!/es/index'>Inicio</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='intro'>Mapa</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='credits'>Créditos</a></li><li class='dropdown-divider'></li><li><a href='http://blog.pasoliniroma.com' target='_blank'>Blog</a></li></ul>",
            enter: "Entrar"
        },
        fr: {
            menu: "<ul class='dropdown-menu'><li><a href='#!/fr/index'>Accueil</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='intro'>Carte</a></li></li><li><a href='javascript:void(0);' class='pagelink' data-type='credits'>Crédits</a></li><li class='dropdown-divider'></li><li><a href='http://blog.pasoliniroma.com' target='_blank'>Blog</a></li></ul>",
            enter: "Entrer"
        },
        it: {
            menu: "<ul class='dropdown-menu'><li><a href='#!/it/index'>Home</a></li><li><a href='javascript:void(0);' class='pagelink' data-type='intro'>Mappa</a></li></li><li><a href='javascript:void(0);' class='pagelink' data-type='credits'>Crediti</a></li><li class='dropdown-divider'></li><li><a href='http://blog.pasoliniroma.com' target='_blank'>Blog</a></li></ul>",
            enter: "Entrare"
        }

    };


    app.config = {
        icon: {
            count: 11, // How many place icons
            size: 22,
            url: "css/images/markers22.png"
        },
        langs: ["fr", "en", "es", "ca", "it"],
        map: {
            id: "map-canvas",
            infoboxPixelOffset: new gm.Size(-75, -11), // Offset of the infobox's bottom-left corner relative to the marker's center
            options: {
                backgroundColor: "#666",
                zoom: 13,
                minZoom: 8,
                maxZoom: 17,
                mapTypeId: gm.MapTypeId.ROADMAP,
                disableDefaultUI: true,
                center: new gm.LatLng(41.898492, 12.506111), // Map center
                styles: [ // Map styling (cf http://gmaps-samples-v3.googlecode.com/svn/trunk/styledmaps/wizard/index.html)
                    {"featureType": "road", "elementType": "labels.icon", "stylers": [{"visibility": "off"}]},
                    {"featureType": "road", "elementType": "geometry.stroke", "stylers": [{"visibility": "off"}]},
                    {"featureType": "road.highway", "elementType": "labels", "stylers": [{"visibility": "off"}]},
                    {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{"visibility": "on"}, {"color": "#e5e500"}]},
                    {"featureType": "poi", "stylers": [{"visibility": "off"}]},
                    {"featureType": "poi.park", "elementType": "geometry", "stylers": [{"visibility": "on"}, {"color": "#bad373"}]},
                    {"featureType": "landscape.natural", "stylers": [{"color": "#e4e5da"}, {"visibility": "on"}]},
                    {"featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{"visibility": "off"}]},
                    {"featureType": "transit", "stylers": [{"visibility": "off"}]},
                    {"featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{"visibility": "on"}, {"color": "#d0c0c0"}, {"weight": 1}]},
                    {"featureType": "water", "elementType": "geometry.fill", "stylers": [{"visibility": "on"}, {"color": "#74a6d2"}]}
                ],
                zoomControl: true
            }
        },
        modal: { // https://github.com/kylefox/jquery-modal#options
            clickClose: false,
            opacity: 0.5,
            showSpinner: false,
            zIndex: 5000
        },
        thumb: {
            maxWidth: 550
        },
        timeline: {
            DOMId: "timeline",
            DOMContainerSelector: "#container",
            tlPxWidth: 5000,
            ptPxWidth: 12,
            tlWidth: 10957, // Day count from 01-Jan-48 to 31-Dec-77 = number of virtual timeline 'slots'
            graduation: {
                step: 10957 / 30,
                cssClass: function (i) { return (((1948 + i) % 5 === 0) ? "g1" : "g2"); },
                legend: function (i) { return (1948 + i); }
            }
        },
        transitionSpeed: 500 // Default transition speed
    };

    app.defaultLang = "it";

    app.templates = { // Mustache templates
        indexTitle: "<a href='#!/{{lang}}/map'><h1>Pasolini Roma</h1></a>",
        mapTitle: "<a href='#!/{{lang}}/index'><h1>Pasolini Roma</h1></a>",
        mapInfobox: "<div><div class='infoBox-cat icon{{cat}}'>{{catName}}</div><div class='infoBox-name'>{{name}}</div></div>",
        modal: "{{{text}}}",
        //page: "<a href='#!/{{lang}}/index'><img class='title281' src='css/images/title281.png' alt='Pasolini Roma' /></a><div id='pagei'>{{{text}}}</div>",
        place: "<span class='sqrbtn sprite' id='ctrl-pane-close' title='Close'>Close</span>{{#cat}}<span id='ctrl-filter-markers' class='icon{{cat.id}} off'>{{cat.name}}</span>{{/cat}}<h2>{{name}} <span class='date'>{{date}}</span></h2><div id='pane-content'>{{{desc}}}<div>{{#m}}{{#_fn1}}{{/_fn1}}{{/m}}</div></div>",
        placeImg: "<div class='media-container' style='width:{{thumbWidth}}px;'><div class='media' style='height:{{thumbHeight}}px;'><img src='http://static.pasoliniroma.com/images/{{id}}.jpg' alt='{{caption}} {{rights}}' width='{{thumbWidth}}' height='{{thumbHeight}}' data-width='{{width}}' data-height='{{height}}' /></div><div class='caption'>{{caption}}<br />{{rights}}</div></div>",
        placeVideo: "<div class='media-container' style='width:{{thumbWidth}}px;'><iframe class='media' scroll='no' src='video.php?id={{id}}&amp;width={{thumbWidth}}&amp;height={{thumbHeight}}' style='width:{{thumbWidth}}px; height:{{thumbHeight}}px;' width='{{thumbWidth}}' height='{{thumbHeight}}'></iframe><div class='caption'>{{caption}}<br />{{rights}}</div></div>"
    };


    /**
     * app.controller
     */
    app.controller = function () {
        var state = app.state.save(),
            lang = state.lang,
            type = state.type,
            id = state.id || null,
            fail;

        fail = function () {
            // TODO: IMPORTANT: revert to previous state (after notifying?)
        };

        app.modal.close(); // Close modal (if applicable)

        if (type === "index") {
            app.renderIndex();
        }

        if (type === "map") {
            if (id) {
                $.when(app.fetchData("data/places/" + id + "-" + lang + ".json")).then(app.renderMapPane, fail);
            } else {
                app.renderMapNoPane();
            }
        }

        $(".lang").removeClass("active"); // Updates lang icons
        $("#lang" + state.lang).addClass("active");

    };


    /**
     * app.fetchData
     * @return  jQuery Deferred object
     */
    app.fetchData = function (url) {
        return $.getJSON(url);
    };


    /**
     * app.map
     */
    app.map = (function () {
        var center,
            filterIcon,
            getCurrentPlace,
            getPlace,
            icons = [], // One per color
            init,
            map,
            mapId = app.config.map.id,
            mapOptions = app.config.map.options,
            places = [], // Collection of Place objects
            setMarkerGroupState,
            timeline,
            zoom;


        /**
         * app.map.center
         * Center the map
         * @param   toCurrentPlace?:bool    true: center the map on the current place, false: apply default centering
         * @version 2013-04-22
         */
        center = function (toCurrentPlace) { // Center the map on place or default location
            var latLng,
                panByX = app.utils.centerX - (app.utils.$pane.offset().left / 2),
                place;

            if (toCurrentPlace) {
                place = getCurrentPlace();
                latLng = (place ? new gm.LatLng(place.latLng[0], place.latLng[1]) : mapOptions.center);
                timeline.scrollTo(place.id);
                map.panTo(latLng);
                map.panBy(panByX, 0);
            } else {
                latLng = mapOptions.center;
                map.panTo(latLng);
            }

        };


        /**
         * app.map.filterIcon
         */
        filterIcon = {
            state: false, // Stores current filter state (for persistence): false: unfiltered, [iconId]: filtered on iconId (BEWARE: make strict comparisons. 0 is a valid iconId and is not false)
            btn: "ctrl-filter-markers", // DOM id for the filtering toggle button
            on: function (iconId) {
                setMarkerGroupState("iconId", iconId, {ifFalse: 0});
                $("#" + this.btn).addClass("on").removeClass("off");
                this.state = iconId;
            },
            off: function (iconId) {
                setMarkerGroupState("iconId", iconId, {ifFalse: 1});
                $("#" + this.btn).addClass("off").removeClass("on");
                this.state = false;
            },
            toggle: function (iconId) {
                if (this.state === false) {
                    this.on(iconId);
                } else {
                    this.off(iconId);
                }
            }
        };


        /**
         * app.map.getCurrentPlace
         * Returns the current place object if applicable (ie a place pane is open)
         */
        getCurrentPlace = function () {
            var state = app.state.get();
            if (state.type === "map" && state.id) {
                return getPlace(state.id);
            } else {
                return false;
            }
        };


        /**
         * app.map.getPlace
         * Extracts a place object from the places collection
         * @param   id      [int]       Place id
         * @return          [object]    Place object (from the app.map.places collection)
         */
        getPlace = function (id) { // Extracts place data from app.places, by id
            return _.find(places, function (pl) { return (pl.id === id); });
        };


        /**
         * app.map.init
         * Creates the map and builds the `places` collection
         * @param   data    Array   deserialized index.json
         * @return  NONE
         */
        init = function (data) {
            var i,
                iconCount = app.config.icon.count,
                iconSize = app.config.icon.size,
                gmIconSize = new gm.Size(iconSize, iconSize),
                gmIconAnchorPoint = new gm.Point(iconSize / 2, iconSize / 2),
                iconUrl = app.config.icon.url,
                infoboxPixelOffset = app.config.map.infoboxPixelOffset,
                tle; // Timeline element

            map = new gm.Map(document.getElementById(mapId), mapOptions);
            timeline = new Timeline(app.config.timeline);

            for (i = 0; i < iconCount; ++i) { // Create icons
                icons.push([
                    { url: iconUrl, anchor: gmIconAnchorPoint, origin: new gm.Point(iconSize * i, 0), size: gmIconSize },
                    { url: iconUrl, anchor: gmIconAnchorPoint, origin: new gm.Point(iconSize * i, iconSize), size: gmIconSize }
                ]);
            }

            _.each(data, function (dataItem, i) { // Populates the `places` collection with Place objects (copied from deserialized JSON)
                var place = new Place();

                places.push(_.extend(place, dataItem));
                place.iconId = place.cat || 0;
                place.icons = icons[place.iconId];
                place.marker = new gm.Marker({ // Add marker object
                    map: map,
                    position: new gm.LatLng(place.latLng[0], place.latLng[1]),
                    icon: place.icons[0], // Icon for initial marker state
                    shape: {type: "circle", coords: [iconSize / 2, iconSize / 2, iconSize / 2]},
                    draggable: false,
                    flat: true,
                    ZIndex: i + 1, // z-index starts at 1
                    visible: false
                });
                place.zIndex = place.marker.getZIndex(); // Initial zIndex

                // InfoBox (Note: content will be attached on the fly before each opening)
                place.infobox = new InfoBox({
                    boxClass: "infoBox",
                    isHidden: true,
                    alignBottom: true,
                    closeBoxURL: "",
                    zIndex: i + 1,
                    pixelOffset: infoboxPixelOffset
                });

                place.infobox.open(map, place.marker); // The infobox is initially opened (ie attached to the map + marker) but hidden
                place.setMarkerState(1); // Shows the marker

                gm.event.addListener(place.marker, "click", function (e) {
                    app.state.navigate({ type: "map", id: place.id });
                });

                gm.event.addListener(place.marker, "mouseover", function (e) {
                    if (app.state.get().id !== place.id) { place.setMarkerState(2); }
                });

                gm.event.addListener(place.marker, "mouseout", function (e) {
                    if (app.state.get().id !== place.id) { place.setMarkerState(1); }
                });


                if (place.pos) { // Timeline element
                    tle = timeline.add(place.id, place.pos).$point; // Add timeline point and retrieve corresponding DOM element
                    tle.attr("id", "tle" + place.id);
                    tle.addClass("icon" + place.iconId);
                    tle.on("mouseover", function () { gm.event.trigger(place.marker, "mouseover"); }); // TODO: try using event delegation for the 3 event bindings
                    tle.on("mouseout", function () { gm.event.trigger(place.marker, "mouseout"); });
                    tle.on("click", function () { gm.event.trigger(place.marker, "click"); });
                    place.timelineElem = tle; // Copies a reference to the timeline point into the place object
                }

            });

            app.map.timeline = timeline; // Export reference to timeline
            timeline.render();

        };


        // Place object
        function Place () {} // Place constructor (empty)

        /**
         * Place.prototype.setMarkerState
         * Sets the place's marker state (affecting its icon) and hides/shows the infobox (if applicable)
         * TODO: improve
         * @param   state:Int       0: hidden, 1: normal, 2: hover, 3:selected
         * @return  NONE
         * @version 2013-03-28
         */
        Place.prototype.setMarkerState = function (state) {
            var stateIcon = [0, 0, 1, 1], // Gives the icon Id for each state (index)
                prevState = this.markerState,
                lang;

            if (prevState === state) { return; }
            this.markerState = state; // Sets the state
            this.marker.setIcon(this.icons[stateIcon[state]]); // Sets the icon

            if (state === 0) {
                this.marker.setVisible(false);
                if (!_.isUndefined(this.timelineElem)) { this.timelineElem.fadeOut(300, 0); }
            } else {
                if (prevState === 0 || _.isUndefined(prevState)) { // 2014-02-11 : previously (prevState === 0 || prevState == null)
                    this.marker.setVisible(true);
                }
                if (state === 1) {
                    this.marker.setZIndex(this.zIndex);
                    if (!_.isUndefined(this.timelineElem)) { this.timelineElem.removeClass("timeline-point-on").fadeIn(300); }
                    this.infobox.setVisible(false);
                } else if (state === 2) {
                    lang = app.state.get().lang;
                    this.marker.setZIndex(1001);
                    if (!_.isUndefined(this.timelineElem)) { this.timelineElem.addClass("timeline-point-on"); }
                    this.infobox.setContent(Mustache.render(app.templates.mapInfobox, { cat: this.cat, catName: this["cat-" + lang], name: this["name-" + lang] }));
                    this.infobox.setVisible(true);
                    this.infobox.setZIndex(2);
                } else if (state === 3) {
                    lang = app.state.get().lang;
                    this.marker.setZIndex(1000);
                    if (!_.isUndefined(this.timelineElem)) { this.timelineElem.addClass("timeline-point-on"); }
                    this.infobox.setContent(Mustache.render(app.templates.mapInfobox, { cat: this.cat, catName: this["cat-" + lang], name: this["name-" + lang] }));
                    this.infobox.setVisible(true);
                    this.infobox.setZIndex(1);
                }
            }
        };


        /**
         * app.map.setMarkerGroupState
         * Group-sets marker states for 2 split subsets of `places` depending on a condition.
         * (to set _all_ places to state `s`, use arguments: null, null, null, `s`)
         * @param   key         (string)
         * @param   value       (mixed)
         * @param   state       (object)    {ifTrue: [state if true], ifFalse: [state if false]}
         * @return  NONE
         */
        setMarkerGroupState = function (key, value, state) {
            _.each(places, function (pl) {
                if (pl[key] === value) {
                    if (!_.isUndefined(state.ifTrue)) { pl.setMarkerState(state.ifTrue); }
                } else {
                    if (!_.isUndefined(state.ifFalse)) { pl.setMarkerState(state.ifFalse); }
                }
            });
        };


        /**
         * app.map.zoom
         * TODO: if pane isopen, manually "recenter" map after zooming
         */
        zoom = function (level) {
            var min = app.config.map.options.minZoom,
                max = app.config.map.options.maxZoom;

            level = parseInt(level, 10) || 10;

            if (level < min) {
                level = min;
            } else if (level > max) {
                level = max;
            }

            map.setZoom(level);
        };

        return {
            center: center,
            filterIcon: filterIcon,
            init: init,
            getPlace: getPlace,
            timeline: timeline, // (Undefined at this point - will be set upon calling init)
            zoom: zoom
        };

    }());



    /**
     * app.modal
     * 2013-05-24
     * CONTINUE
     */
     app.modal = function (page) {
        var lang = app.state.get().lang;

        if (page === "intro") {
            app.map.center(false);
        }

        $.when(app.fetchData("data/pages/" + page + "-" + lang +".json")).then(function (data) {
            window.setTimeout(function () {
                $(".modal").html(Mustache.render(app.templates.modal, data)).modal(app.config.modal);
            }, 500);
        });
     };

     app.modal.close = $.modal.close;


    /**
     * app.renderIndex
     */
    app.renderIndex = function (data) {

        // Extend the `data` object with current lang + data common to all views
        data = data || {};
        data.lang = app.state.get().lang;
        _.extend(data, app.commonData[data.lang]);

        app.state.transition(function () {
            $("#dropdown1").html(data.menu);
            //$(".indextitle").wrap(Mustache.render(app.templates.indexTitle, data));
            //$(".indextitle").replaceWith(Mustache.render(app.templates.indexTitle, data));
            $(".indextitle").html(Mustache.render(app.templates.indexTitle, data));
        });
    };


    /**
     * app.renderMapPane
     */
    app.renderMapPane = function (data) {
        var i, r, media;

        // Extend the `data` object with current lang + data common to all views
        data = data || {};
        data.lang = app.state.get().lang;
        _.extend(data, app.commonData[data.lang]);

        //$(".maptitle").wrap(Mustache.render(app.templates.mapTitle, data));
        //$(".maptitle").replaceWith(Mustache.render(app.templates.mapTitle, data));
        $(".maptitle").html(Mustache.render(app.templates.mapTitle, data));

        // For mustache: function for conditional rendering of the media (img/video)
        data._fn1 = function () {
            return function (dummy, render) {
                if (this.type === "img") { return render(app.templates.placeImg); }
                if (this.type === "video") { return render(app.templates.placeVideo); }
            };
        };

        // Computes and adds thumbWidth and thumbHeight properties to each media item
        if (!_.isUndefined(data.m)) {
            for (i = 0; i < data.m.length; ++i) {
                media = data.m[i];
                if (media.type === "img") {
                    r = app.utils.resize(media.width, media.height, app.config.thumb.maxWidth, app.config.thumb.maxHeight);
                    media.thumbWidth = r.width;
                    media.thumbHeight = r.height;
                }
                if (media.type === "video") {
                    r = (media.wide ? (1024 / 576) : (768 / 576));
                    media.thumbWidth = app.config.thumb.maxWidth;
                    media.thumbHeight = Math.ceil(app.config.thumb.maxWidth / r);
                }
            }
        }

        app.state.transition(function () {
            // IMPORTANT: all post-transition operations (rendering and extra) must be placed in this callback

            var iconId = (_.isUndefined(data.cat) ? 0 : data.cat.id),
                filterIcon = app.map.filterIcon;

            $("#dropdown1").html(data.menu);
            $("#pane").html(Mustache.render(app.templates.place, data));
            /*
            $("#pane-content").mCustomScrollbar({
                scrollInertia: 100,
                theme: "dark-2"
            });
            */
            $("#pane-content img").hide().seqLoad().fullscreen();

            if (filterIcon.state === iconId) { // Persist icon filtering
                //$("#" + filterIcon.btn).addClass("icon" + iconId);
                $("#" + filterIcon.btn).addClass("on").removeClass("off");
            } else {
                filterIcon.off();
            }

            $("#" + filterIcon.btn).on("click", function () { // Binding for icon filtering
                filterIcon.toggle(iconId);
            });

        });
    };


    /**
     * app.renderMapNoPane
     */
    app.renderMapNoPane = function (data) {

        // Extend the `data` object with current lang + data common to all views
        data = data || {};
        data.lang = app.state.get().lang;
        _.extend(data, app.commonData[data.lang]);

        //$(".maptitle").wrap(Mustache.render(app.templates.mapTitle, data));
        //$(".maptitle").replaceWith(Mustache.render(app.templates.mapTitle, data));
        $(".maptitle").html(Mustache.render(app.templates.mapTitle, data));

        app.state.transition(function () {
            var oldType = app.state.getOld().type;

            $("#dropdown1").html(data.menu);

            if (oldType === "index" || _.isUndefined(oldType)) {
                app.modal("intro");
            }
        });
    };

    /**
     * app.renderPage
     */
    /*
    app.renderPage = function (data) {
        data = data || {};
        data.lang = app.state.get().lang;
        _.extend(data, app.commonData[data.lang]);
        app.state.transition(function () {
            $("#dropdown1").html(data.menu);
            $("#page").html(Mustache.render(app.templates.page, data));
        });
    }
    */


    /**
     * app.state
     * Application state management
     */
    app.state = (function () {
        var current, old, // (Private properties)
            validateLang, // (Private methods)
            get, getOld, navigate, save, transition; // (Public methods)

        /**
         * app.state.get
         * getter function for app.state.current
         * @return  object  the current state
         */
        get = function () {
            return current;
        };


        /*
         * app.state.getOld
         * getter function for app.state.old
         * @return   [object]   the previous state
         */
        getOld = function () {
            return old;
        };


        /**
         * app.state.navigate
         * Updates the hash (#) part in the location bar, which in turn triggers the router
         * It is therefore used for any state change that isn't invoked by a _direct_ modification of the location bar (what an <a href="#..."> link does)
         * The function takes a state object pattern {lang:?, type:?, id:?} (any combination of the 3 properties)
         * When one these properties is unspecified, the corresponding part of the actual (current) hash is used.
         * Id is special, however, because it may be unset by explicitly setting the property to an empty value.
         * @param   state   Object
         * @return  NONE
         */
        navigate = function (state) {
            var curState = this.get(),
                lang = (validateLang(state.lang) || curState.lang),
                type = (state.type || curState.type),
                id = (state.hasOwnProperty("id") ? state.id : curState.id);

            window.location.hash = "#!/" + lang + "/" + type + (id ? ("/" + id) : ""); // Setting location.hash triggers routing
        };


        /**
         * app.state.save
         * Updates app.state.current (from the location.hash) and app.state.old
         * State is an object literal {lang:, type:, id:} (id optional)
         * @return  Object  the current state (after update)
         */
        save = function () {
            var state = {},
                h = window.location.hash.split("/"); // Reads current location.hash

            if (h.length < 1) { return false; }
            state.lang = validateLang(h[1]) || app.defaultLang; // (The router enforces the presence of the `lang` part in the hash so the fallback to default should not occur)
            state.type = h[2] || "index"; // Implicit `type` index
            if (h[3]) { state.id = parseInt(h[3], 10); } // Important: convert to Int
            old = current || {};
            current = state;
            return state;
        };


        /**
         * app.state.transition
         * Runs (animated) transitions between application states (from `old` to `current`) and other operations that require awareness of the previous state
         * Note: the map layer is never animated, the other layers are animated above the map layer.
         * The render parameter is a function that will be called before animating in the `current` state.
         * Its purpose is to populate the element before showing it.
         * NOTE FOR DEVELOPMENT: DON'T FORGET TO CALL RENDER IN ALL CASES
         * @param   render:Fn   Callback
         * @return  NONE
         */
        transition = function (render) {
            var speed = app.config.transitionSpeed || 250,
                $index = app.utils.$index,
                $pane = app.utils.$pane,
                $page = app.utils.$page,
                place,
                hasChangedLang = (!_.isUndefined(old.lang) && old.lang !== current.lang), // TODO: delete is no use for it (a modal welcoming to new lang?)
                hasChangedType = (!_.isUndefined(old.type) && old.type !== current.type),
                hasChangedId = (_.isUndefined(old.type) && !_.isUndefined(current.id)) || (old.type === current.type && old.id !== current.id);

            render = render || $.noop; // By default a do-nothing function

            if ($("#overlay").is(":visible")) { $("#overlay").hide(); } // Close the fullscreen overlay if it is open (quick and dirty)

            // NOTE: order matters

            if (!old.type) { // Don't animate transitions when there is no `old` state
                speed = 0;
                animateIn();
                return;
            }

            if (old.type === "index" && current.type === "index") { // Don't animate from index to index
                speed = 0;
                animateIn();
                return;
            }

            if (old.type === "map") {
                if (old.id) {
                    app.map.getPlace(old.id).setMarkerState(1);

                    if (!(current.type === "map" && current.id)) { // If leaving a pane for anything but a pane, unfilter
                        app.map.filterIcon.off(null);
                    }

                    $pane.fadeOut(speed, animateIn);
                    return;
                } else {
                    animateIn();
                    return;
                }
            }


            if (old.type === "index") {
                $index.fadeOut(speed, animateIn);
            }

            function animateIn() {
                render();

                if (current.type === "map") {
                    if (current.id) {
                        app.map.getPlace(current.id).setMarkerState(3);
                        $pane.fadeIn(speed);
                            if (hasChangedId) { window.setTimeout(function () { app.map.center(true); }, 500); } // Delay required?
                    } else {
                        return;
                    }
                }

                if (current.type === "credits" || current.type === "intro") {
                    $page.fadeIn(speed * 2);
                }

                if (current.type === "index") {
                    $index.fadeIn(speed * 2);
                }
            }

        };


        /**
         * validateLang
         * Checks whether the provided lang code is valid, ie is in the `langs` list (of lang codes)
         * @param   lg  [str]   lang code
         * @return      [bool]  is lang code valid?
         */
        validateLang = function (lg) { // Returns the param lg if it is a valid lang code, else false
            if (_.indexOf(app.config.langs, lg) !== -1) { return lg; }
            return false;
        };

        return {
            get: get,
            getOld: getOld,
            navigate: navigate,
            save: save,
            transition: transition

        };

    }());


    /**
     * app.utils
     * Utility properties and functions
     */
    app.utils = {
        //mapFirstRendering: false, // Set to true once the map has been displayed the first time (ADDENDUM: set to true whenever we go from /index to /map)
        winW: 0,
        winH: 0,
        centerX: 0,
        centerY: 0,
        $win: $(window),
        $index: $("#index"),
        $indexTitle: $(".indextitle"),
        $pane: $("#pane"),
        $page: $("#page"),
        centerElem: function ($elem, offsetX, offsetY) {
            var w = $elem.width(),
                h = $elem.height(),
                x = ((this.winW - w) / 2) + (offsetX || 0),
                y = ((this.winH - h) / 2) + (offsetY || 0);
            $elem.css({ position: "absolute", top: y + "px", left: x + "px" });
        },
        redraw: function () { // Repositions and resizes DOM elements
            var hMargins = this.$pane.outerWidth(true)  - this.$pane.width();

            this.winW = this.$win.width();
            this.winH = this.$win.height();
            this.centerX = this.winW / 2;
            this.centerY = this.winH / 2;
            this.$pane.css({ width: (this.centerX - hMargins) + "px" }); // Pane width is the half of window width (minus padding and margin) TODO: take into account a minimum width (rather than css min-width)?
            this.centerElem(this.$indexTitle);
        },
        resize: function (w, h, maxW, maxH) { // Image resize (will fit in a maxW * maxH rectangle)
            var rw = maxW / w,
                rh = (maxH || maxW) / h, // (use maxW if maxH is not given)
                r = (rw < rh ? rw : rh);
            return { width: Math.floor(w * r), height: Math.floor(h * r) };
        }

    };


    // Main
    $(function () {

        // Initializations
        app.utils.redraw();

        app.utils.$win.on("debouncedresize", function () {
            app.utils.redraw();
        });

        $("body").on("click", ".pagelink", function () { // 2013-05-27: Dropdown menu links to modals
            var pageType = $(this).data("type");

            app.modal(pageType);

            if (pageType === "intro") {
                app.state.navigate({ type: "map", id: "" });
            }
        });

        $.when(app.fetchData("data/places/index.json")).then(function (data) {

            // Define own GA update method (cf https://github.com/mtrpcic/pathjs/wiki/Integrating-Google-Analytics)
            function updateAnalytics () {
                _gaq.push(['_trackPageview', document.location.href]);
            }

            app.map.init(data);

            Path.root("#!/" + app.defaultLang + "/index");

            // Includes GA updating
            Path.map("#!/:lang/index").enter(updateAnalytics).to(app.controller);
            Path.map("#!/:lang/map(/:id)").enter(updateAnalytics).to(app.controller);

            Path.rescue(function () { alert("No route found"); });
            Path.listen();

            $(".maptitle").show(); // Initially hidden (CSS) to prevent loading flicker on index page

            // DOM Bindings
            $("#nav").on("click", ".lang", function () { app.state.navigate({ lang: $(this).data("lang") }); });

            $("#pane").on("click", "#ctrl-pane-close", function () {
                app.state.navigate({ id: "" });
            });

        });
    });
}());


