(function () {
	"use strict";
	var app = {};

	app.config = {};
	app.config.timeline = {
        DOMId: "timeline",
        DOMContainerSelector: "body",
        tlPxWidth: 4000,
        ptPxWidth: 12,
        tlWidth: 24471, // Day count from 01-Jan-12 to 31-Dec-78 = number of virtual timeline 'slots'
        graduation: {
            step: 24471 / 67,
            cssClass: function (i) { return (((1912 + i) % 10 === 0) ? "g1" : "g2"); },
            legend: function (i) { return (1912 + i); }
        }
	};
	app.config.quadrant = {
		DOMId: "quadrant",
		DOMContainerSelector: ".container",
		defaultDuration: 500,
		defaultEasing: "easeInOutSine"
	};

	app.utils = {
		hiddenDimensioned: function ( $e, func, args ) { // Call a function (and returns what it returns) TODO: check (+ save) some initial css values
			var output;
			$e.css({ visibility: "hidden", display: "block" });
			output = func.apply(this, args);
			$e.css({ visibility: "visible", display: "none" });
			return output;
		}
	};

	app.templates = {
		point: "<div class='left'><h1>{{&title}}</h1><div class='content'>{{&desc}}</div></div><div class='right'>{{#m}}{{#renderImg}}{{/renderImg}}{{/m}}</div>",
		img: "<img src='//cf.pasoliniroma.com/static/langlois/img/{{&id}}.jpg' width='{{&width}}' height='{{&height}}' alt='{{&caption}}'>"
	};

	// app.controller
    app.controller = function () {
		var state = app.state.save(),
			type = state.type,
			id = state.id || null,
			point;


		if (type === "index") {
			app.renderIndex();
		}

		if (type === "point") {
			if (id) {
				point = app.points.get(id);
				if (!point.isComplete) { // If the point is not complete, we fetch the extra data before rendering
					$.when(app.fetchData("data/points/" + id + ".json")).then(
						function (data) {
							point = $.extend(point, data, { isComplete: true });
							app.renderPoint(point);
						},
						app.fail
					);
				} else {
					app.renderPoint(point);
				}
			}
		}

    };



    app.fail = function () {
    	app.state.navigate({ type: "index", il: null});
    }


	// app.fetchData
    app.fetchData = function (url) {
        return $.getJSON(url);
    };


    // app.init
    // At this point, the index has been successfully loaded into data
    app.init = function (data) {

    	app.points = data;
    	app.points.get = function (id) {
			return _.find(this, function (pt) { return (pt.id === id); });
    	};

    	app.timeline = new Timeline(app.config.timeline),
		app.quadrant = new Quadrant(app.config.quadrant);
		app.$pointContainer = $("<div class='point-container'></div>").appendTo(".container");

		_.each(app.points, function (point, i) { // Populate timeline with points
			var tle = app.timeline.add(point.id, point.pos).$point; // Timeline element
			tle.attr("data-id", point.id);
			tle.addClass("icon" + point.cat); // Warning : at this point (points loaded from index.json) cat is a number, later it'll be an object! TODO: normalize
			point.$timelineElement = tle; // Add reference to jquery timeline element
		});

		// Routing
		Path.root("#!/index");
		Path.map("#!/index").to(app.controller);
		Path.map("#!/:point(/:id)").to(app.controller);
		Path.rescue(function () { alert("No route found"); });
		Path.listen();

        // Timeline rendering
		app.timeline.bind("click", function (id) { // NEW: event binding uses a `Timeline.bind` method
			app.state.navigate({
				type: "point",
				id: id
			});
		}).render();


		// Quadrant rendering + dimensions computations on resize
		
		$(window).on("debouncedresize.main", app.quadrant, function (e) {
			var quadrant = e.data;
			quadrant.render();
			quadrant.scrollTo({ pos: quadrant.currentPos });
			// if (!_.isUndefined(app.$pointContainer)) {
			// 	app.pointResize();
			// }
		}).trigger("debouncedresize.main"); // Initial quadrant rendering
		



    }


    app.renderIndex = function () {
    	app.state.transitionOut(function () {
			$(".timeline-point-on").removeClass("timeline-point-on");
			app.quadrant.scrollTo({ pos: 0 });
    	});
    }

	app.renderPoint = function (point) {
		// 1: transition out
		// 2: hide content
		// 3: load new content + assets
		// 4: computes dimensions relative to viewport
		// 5: transition in / show content
		app.state.transitionOut(function () {

			point.renderImg = function () { // Mustache lambda
				return function (text, render) {
					if (this.type === "img") {
						return render(app.templates.img);
					};
				};
			};

			// $pointContainer gets current quadrant-zone's bgcol
			app.$pointContainer.css({ backgroundColor: $(".quadrant-zone" + point.cat.id).css("background-color") });

			$(".loading").show();

			app.$pointContainer.css({visibility: "hidden"}).html(Mustache.render(app.templates.point, point)).imagesLoaded(function () {

				$(".loading").hide();

				app.pointResize();
				app.quadrant.scrollTo({
					pos: point.cat.id,
					onAfter: function () {
						app.$pointContainer.hide().css({ visibility: "visible" }).fadeIn(500);
					}
				});
				$(".timeline-point-on").removeClass("timeline-point-on");
				point.$timelineElement.addClass("timeline-point-on");
				app.timeline.scrollTo(point.id);
			});			
		});
	}


	app.pointResize = function () {
		var $p = app.$pointContainer,
			$left = $p.find(".left"),
			$right = $p.find(".right"),
			$h1 = $left.children("h1").eq(0),
			$content = $left.children(".content").eq(0),
			$image = $right.children("img").eq(0),
			fit = fitInBox($image.attr("width"), $image.attr("height"), (app.quadrant.getWidth() / 2), (app.quadrant.getHeight() - 80), true),
			dims = app.utils.hiddenDimensioned($p, function () {
				return {
					containerHeight: $p.innerHeight(),
					contentHeight: $content.innerHeight(),
					h1Height: $h1.outerHeight(true)
				};
			});
			$image.css({ width: (fit.width) + "px", height: (fit.height) + "px" });
			$right.css({ width: (fit.width) + "px", height: (fit.height) + "px", paddingTop: ((dims.containerHeight - fit.height) / 2) + "px" });
			$left.css({ width: (app.quadrant.getWidth() - fit.width) + "px" });
			$content.css({ paddingTop: (((dims.containerHeight - dims.contentHeight) / 2) - dims.h1Height) + "px" });
	}


    // app.state
	app.state = (function () {
		var current, old,
			get, getOld, navigate, save, transitionOut;

		get = function () {
			return current;
		};

		getOld = function () {
			return old;
		};

		navigate = function (state) {
			var curState = this.get(),
				type = (state.type || curState.type),
				id = (state.hasOwnProperty("id") ? state.id : curState.id);
			window.location.hash = "#!/" + type + (id ? ("/" + id) : ""); // Setting location.hash triggers routing
		};

		save = function () {
			var state = {},
				h = window.location.hash.split("/"); // Reads current location.hash
    
            if (h.length < 1) {
            	return;
            }

            state.type = h[1] || "index"; // Implicit type "index"
            if (h[2]) { state.id = parseInt(h[2], 10); } // Important: convert to Int

            // If type is point, we get the cat and add it to current state
            if (state.type === "point") {
            	state.cat = app.points.get(state.id).cat;
            }

            old = current || {};
            current = state;
            return state;
		};


		transitionOut = function (onAfter) {
			if (typeof onAfter !== "function") onAfter = $.noop;

			if (old.type === "undefined") {}

			if (old.type === "point") {
				app.$pointContainer.fadeOut(500, function () {
					onAfter.call();
				});

				return; // Return to prevent final call of onAfter
			}

			if (old.type === "index") {
			}

			onAfter.call();
		};



		return {
			get: get,
			getOld: getOld,
			navigate: navigate,
			save: save,
			transitionOut: transitionOut
		};
	}());


	// Application entry point
	$(function () {
		$.when(app.fetchData("data/index.json")).then(
			app.init,
			app.fail
		);
	});
}());


