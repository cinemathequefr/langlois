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

	app.config.data = {
		indexURL: "data/index.json"
	};

	app.points = []; // Collection of points
	app.timeline = {};
	app.quadrant = {};
	app.utils = {
		maxImgWidth: 0, // Max image width (updated on resize)
		maxImgHeight: 0 // Max image height
	};

	app.templates = {
		point: "<div class='left'><h1>{{&title}}</h1><div class='content'>{{&desc}}</div></div><div class='right'>{{#m}}{{#_fn1}}{{/_fn1}}{{/m}}</div>",
		img: "<img src='img/{{&id}}.jpg' width='{{&width}}' height='{{&height}}' alt='{{&caption}}'>"
	};

	app.controller = function () {
		var state = app.state.save(),
			type = state.type,
			id = state.id || null;

		if (type === "point") {
			if (id) {
				if (app.state.getOld().type === "point") app.quadrant.scrollTo({ pos: 0 }); // Scroll quad to center if we come from a point
                $.when(app.fetchData("data/points/" + id + ".json")).then(app.renderPoint, fail);
			}
		}

		function fail () {
			console.log("Fail miserably!");
			app.state.navigate({ type: "index", id: null });
		}

	};

    /**
     * app.fetchData
     * @return  jQuery Deferred object
     */
    app.fetchData = function (url) {
        return $.getJSON(url);
    };

    app.getPoint = function (id) { // Get one point by id from app.points
        return _.find(app.points, function (pt) { return (pt.id === id); });
    };

	/**
	 * app.init
	 * Launches the application (once index data is loaded)
	 */
	app.init = function (data) {
		// console.log(data);

		var timeline = new Timeline(app.config.timeline),
			quadrant = new Quadrant(app.config.quadrant);

		_.each(data, function (point, i) {
			var tle = timeline.add(point.id, point.pos).$point; // Timeline element
			tle.attr("data-id", point.id);
			tle.addClass("icon" + point.cat);
			point.$timelineElement = tle; // Add reference to jquery timeline element
			app.points.push(point);
		});

		timeline.render();
		quadrant.render();

		// Event bindings
		timeline.$tlPointsContainer.on("click", function (e) {
			var target = $(e.target);
			if (target.hasClass("timeline-point")) {
				app.state.navigate({ type: "point", id: target.data("id") });
			}
		});

		$(".app-title").on("click", function () {
			quadrant.scrollTo({ pos: 0 });
		});

		$(".quad-trigger").on("click", function () {
			quadrant.scrollTo({ pos: $(this).data("pos") });
		});

		// Resize event
		$(window).on("debouncedresize", function () {
			quadrant.render();
			app.utils.maxImgWidth = quadrant.getWidth() / 2;
			app.utils.maxImgHeight = quadrant.getHeight() - 80;
			quadrant.scrollTo({ pos: quadrant.currentPos });

			console.log("Resize");
			console.log(app.state.get()); // ???
			// if (!_.isUndefined(app.state.get().cat)) {
			// 	console.log("Here we compute the resizes for the quadrant corresponding to cat");
			// }



		}).trigger("debouncedresize");

		app.timeline = timeline;
		app.quadrant = quadrant;
	};
 
	app.renderPoint = function (data) {
		var id = data.id,
			cat = data.cat.id,
			//point = _.find(app.points, function (i) { return i.id === data.id; }), // Extract point from app.points
			point = app.getPoint(id),
			$container = $(".quadrant-zone" + cat).children(".point-container");	

		// BUG: cat is an id value in "point" and an object in "data"
		data = $.extend(point, data); // Extend data with point

		data._fn1 = function () { // TODO: shouldn't be defined upon each call on renderPoint
			return function (text, render) {
				if (this.type === "img") {
					return render(app.templates.img);
				};
			};
		};

		$container.html(Mustache.render(app.templates.point, data)).imagesLoaded(function () {

			console.log("State", app.state.get());
			// Image size is maximized in the container, and the text box width sized accordingly
			// TODO: must be recomputed on resize!
			var containerHeight = $container.innerHeight(),
				$left = $container.find(".left"),
				$right = $container.find(".right"),
				$h1 = $left.children("h1").eq(0), // H1
				$content = $left.children(".content").eq(0), // Text block
				$image = $right.children("img").eq(0), // Image
				fit = fitInBox($image.attr("width"), $image.attr("height"), app.utils.maxImgWidth, app.utils.maxImgHeight, true);

			$left.css({ width: (app.quadrant.getWidth() - fit.width) + "px" });
			$content.css({ paddingTop: (((containerHeight - $content.innerHeight()) / 2) - $h1.outerHeight(true)) + "px" });
			$right.css({ width: (fit.width) + "px", height: (fit.height) + "px", paddingTop: 	((containerHeight - fit.height) / 2) + "px" });
			$image.css({ width: (fit.width) + "px", height: (fit.height) + "px" });

			$container.fadeIn(200);
			app.quadrant.scrollTo({ pos: cat });
			$(".timeline-point-on").removeClass("timeline-point-on");
			data.$timelineElement.addClass("timeline-point-on");
			app.timeline.scrollTo(id);
		});
	};

	app.state = (function () {
		var current, old,
			get, getOld, navigate, save, transition;

		get = function () { return current; };
		getOld = function () { return old; };
		navigate = function (state) {
			var curState = this.get(),
				type = (state.type || curState.type),
				id = (state.hasOwnProperty("id") ? state.id : curState.id);
			window.location.hash = "#!/" + type + (id ? ("/" + id) : ""); // Setting location.hash triggers routing
		};
		save = function () {
			var state = {},
				h = window.location.hash.split("/"); // Reads current location.hash
    
            if (h.length < 1) { return; }
            state.type = h[1] || "index"; // Implicit `type` index
            if (h[2]) { state.id = parseInt(h[2], 10); } // Important: convert to Int

            // If type is point, we get the cat and add it to current state
            if (state.type === "point") {
            	state.cat = app.getPoint(state.id).cat;
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




		// Some initial rendering (empty timeline, quadrant) should be called here (take it out of init)
		$.when(app.fetchData(app.config.data.indexURL)).then(function (data) {
			app.init(data);
			Path.root("#!/index");
			Path.map("#!/index").to(app.controller);
   			Path.map("#!/:point(/:id)").to(app.controller);
            Path.rescue(function () { alert("No route found"); });
            Path.listen();
		}, function (data) {
			console.log("Hem! Can't load data.");
		});

		console.log(app);


	});


}());


