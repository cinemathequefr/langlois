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
		HTMLStructure: "<div><div class='point-container'></div></div>",
		defaultDuration: 500,
		defaultEasing: "easeInOutSine"
	};

	app.utils = {
		// maxImgWidth: 0, // Max image width (updated on resize)
		// maxImgHeight: 0 // Max image height
	};

	app.templates = {
		point: "<div class='left'><h1>{{&title}}</h1><div class='content'>{{&desc}}</div></div><div class='right'>{{#m}}{{#renderImg}}{{/renderImg}}{{/m}}</div>",
		img: "<img src='img/{{&id}}.jpg' width='{{&width}}' height='{{&height}}' alt='{{&caption}}'>"
	};

	// app.controller
    app.controller = function () {
		var state = app.state.save(),
			type = state.type,
			id = state.id || null,
			point; // IMPROVE

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
				// if (app.state.getOld().type === "point") app.quadrant.scrollTo({ pos: 0 }); // Scroll quad to center if we come from a point
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

    // app.getPointById (TODO: not needed if we have app.points.get)
    app.getPointById = function (id) { // Get one point by id from app.points
        return _.find(app.points, function (pt) { return (pt.id === id); });
    };


    // app.init
    // At this point, the index has been successfully loaded into data
    app.init = function (data) {
    	// var quadrant;

    	app.points = data;
    	app.points.get = function (id) { // IMPROVE?
			return _.find(this, function (pt) { return (pt.id === id); });
    	};

    	app.timeline = new Timeline(app.config.timeline),
		app.quadrant = new Quadrant(app.config.quadrant);

		_.each(app.points, function (point, i) { // Populate timeline with points
			var tle = app.timeline.add(point.id, point.pos).$point; // Timeline element
			tle.attr("data-id", point.id);
			tle.addClass("icon" + point.cat);
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
			app.utils.maxImgWidth = quadrant.getWidth() / 2;
			app.utils.maxImgHeight = quadrant.getHeight() - 80;
			quadrant.scrollTo({ pos: quadrant.currentPos });
		}).trigger("debouncedresize.main"); // Initial quadrant rendering

		$(window).on("debouncedresize.point", app.quadrant, function (e) {
			var $left = app.utils.$left,
				$right = app.utils.$right,
				$h1 = app.utils.$h1,
				$content = app.utils.$content,
				$image = app.utils.$image,
				containerHeight = app.utils.$container.innerHeight(),
				fit = fitInBox($image.attr("width"), $image.attr("height"), app.utils.maxImgWidth, app.utils.maxImgHeight, true);

			$right.css({ width: (fit.width) + "px", height: (fit.height) + "px", paddingTop: ((containerHeight - fit.height) / 2) + "px" });
			$image.css({ width: (fit.width) + "px", height: (fit.height) + "px" });
			$left.css({ width: (app.quadrant.getWidth() - fit.width) + "px" });
			$content.css({ paddingTop: (((containerHeight - $content.innerHeight()) / 2) - $h1.outerHeight(true)) + "px" }); // Bug? Doesn't always center vertically on resize
		});
    }


    // app.renderPoint
    app.renderPoint = function (point) {
    	var cat = point.cat.id,
    		$container = app.utils.$container = $(".quadrant-zone" + cat).children(".point-container");

		point.renderImg = function () { // Mustache lambda
			return function (text, render) {
				if (this.type === "img") {
					return render(app.templates.img);
				};
			};
		};

    	$container.css({ visibility: "hidden" }).html(Mustache.render(app.templates.point, point)).imagesLoaded(function () {
			app.utils.$container = $container;
			app.utils.$left = $container.find(".left");
			app.utils.$right = $container.find(".right");
			app.utils.$h1 = app.utils.$left.children("h1").eq(0);
			app.utils.$content = app.utils.$left.children(".content").eq(0);
			app.utils.$image = app.utils.$right.children("img").eq(0);
    		$(window).trigger("debouncedresize.point");

			app.quadrant.scrollTo({
				pos: cat,
				onAfter: function () {
					$container.hide().css({ visibility: "visible"}).fadeIn(500);
				}
			});

			$(".timeline-point-on").removeClass("timeline-point-on");
			point.$timelineElement.addClass("timeline-point-on");
			app.timeline.scrollTo(point.id);

    	});
    }


    // app.state
	app.state = (function () {
		var current, old,
			get, getOld, navigate, save, transition;

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
            	state.cat = app.getPointById(state.id).cat;
            }

            old = current || {};
            current = state;
            return state;
		};

		// transition = function () {
		// };

		return {
			get: get,
			getOld: getOld,
			navigate: navigate,
			save: save
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


