(function () {
	"use strict";
	var app = {};

	app.config = {};
	app.config.timeline = {
        DOMId: "timeline",
        DOMContainerSelector: "body",
        //tlPxWidth: 4000,
        tlPxWidth: 7000,
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
		//point: "<div class='left'><article><div class='cat cat{{&cat.id}}'>{{&cat.name}}</div><h1>{{&title}}</h1><div class='content'>{{&desc}}</div>{{#m}}<div class='caption'>Illustration : {{&caption}} {{&rights}}</div>{{/m}}</article></div><div class='right'>{{#m}}{{#renderImg}}{{/renderImg}}{{/m}}</div>",
		point: "<div class='left'><article><div class='cat cat{{&cat.id}}'>{{&cat.name}}</div><h1>{{&title}}</h1><div class='content'>{{&desc}}</div>{{#m}}{{#renderCaption}}{{/renderCaption}}{{/m}}</article></div><div class='right'>{{#m}}{{#renderImg}}{{/renderImg}}{{/m}}</div>",
		img: "<div class='media' width='{{&width}}' height='{{&height}}'><img src='//cf.pasoliniroma.com/static/langlois/img/{{&id}}.jpg' alt='{{&caption}}'></div>",
        //video: "<div class='media' width='{{&width}}' height='{{&height}}'><div style='display:none'></div><object id='myExperience2292442024001' class='BrightcoveExperience'><param name='bgcolor' value='#111111' /><param name='playerID' value='592570533001' /><param name='playerKey' value='AQ~~,AAAAiWK05bE~,EapetqFlUMNn0qIYma980_NuvlxhZfq6' /><param name='isVid' value='true' /><param name='isUI' value='true' /><param name='dynamicStreaming' value='true' /><param name='@videoPlayer' value='{{&id}}' /></object></div>"
        video: "<div class='media' width='{{&width}}' height='{{&height}}'><iframe width='{{&width}}' height='{{&height}}' src='video.php?id={{&id}}'></iframe></div>",
        caption: "<div class='caption'>Illustration : {{&caption}} {{&rights}}</div>"
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

    	app.points = _.sortBy(data, function (i) { return i.pos }); // Data sorted by pos


    	// Add prev and next ids to each point
    	_.each(app.points, function (pt, i) {
    		if (!_.isUndefined(app.points[i - 1])) {
    			_.extend(pt, { prev: app.points[i - 1].id });
    		}
    		if (!_.isUndefined(app.points[i + 1])) {
    			_.extend(pt, { next: app.points[i + 1].id });
    		}
    	});

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

        // Timeline binding and rendering
		app.timeline.bind("click", function (id) {
			app.state.navigate({
				type: "point",
				id: id
			});
		}).render();

		app.timeline.scrollTo(_.last(app.points).id);


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
    		app.$pointContainer.hide().html("<div class='center'><p>La vie d'Henri Langlois (1914-1977) se confond largement avec l'existence de la Cinémathèque française, institution qu'il a créée en 1936 avec Georges Franju, Paul-Auguste Harlé et Jean Mitry.</p><p>À travers plus de 120 dates, importantes ou anecdotiques, parcourez en tous sens l'histoire mouvementée de l'homme qui a poursuivi inlassablement la mission qu'il s'était fixé : sauver les films de la destruction et de l'oubli, les montrer.</p><p><a class='enter' href='#!/point/113'>Entrer</a></p></div>");
			$(".timeline-point-on").removeClass("timeline-point-on");

			app.quadrant.scrollTo({
				pos: 0,
				onAfter: function () {
					app.$pointContainer.fadeIn(500);
				}
			});
    		
    	});
    }


	app.renderPoint = function (point) {
		// 1: transition out
		// 2: hide content
		// 3: load new content + assets
		// 4: computes dimensions relative to viewport
		// 5: transition in / show content

		app.state.transitionOut(function () {

			point.renderImg = function () {
				return function (text, render) {
					if (this.type === "img") {
						return render(app.templates.img);
					} else if (this.type === "video") {
						return render(app.templates.video);
					}
				};
			};

			point.renderCaption = function () {
				return function (text, render) {
					if(this.caption || this.rights) {
						return render(app.templates.caption);
					}
				};
			};

			// $pointContainer gets current quadrant-zone's bgcol
			//app.$pointContainer.css({ backgroundColor: $(".quadrant-zone" + point.cat.id).css("background-color") });

			$(".loading").show();

			app.$pointContainer.css({visibility: "hidden"}).html(Mustache.render(app.templates.point, point)).imagesLoaded(function () {

				$(".loading").hide();

				$(document).on("keyup", function (e) {
					if (e.which === 37 && point.prev) {
						app.state.navigate({ type: "point", id: point.prev });
					}
					if (e.which === 39 && point.next) {
						app.state.navigate({ type: "point", id: point.next });
					}
				});

				$(".media > img").on("click", function() {
					app.dz = new DeepZoom({
						$el: $(".overlay"),
						url: "http://cf.pasoliniroma.com/static/langlois/dz/" + point.m.id,
						width: point.m.width,
						height: point.m.height,
					});
				});

				app.pointResize(point);

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


	app.pointResize = function (point) {
		var $p = app.$pointContainer,
			$left = $p.find(".left"),
			$right = $p.find(".right"),
			$h1 = $left.children("h1").eq(0),
			$article = $left.children("article").eq(0),
			$media = $right.children("div.media").eq(0),
			fit = fitInBox($media.attr("width"), $media.attr("height"), $p.innerWidth() / 2, $p.innerHeight(), true),
			dims = app.utils.hiddenDimensioned($p, function () {
				return {
					containerHeight: $p.innerHeight(),
					articleHeight: $article.innerHeight()
				};
			});

		$media.css({ width: (fit.width) + "px", height: (fit.height) + "px" });
		$right.css({ width: (fit.width) + "px", height: (fit.height) + "px", paddingTop: ((dims.containerHeight - fit.height) / 2) + "px" });
		$left.css({ width: ($p.innerWidth() - fit.width) + "px" });
		$article.css({ paddingTop: ((dims.containerHeight - dims.articleHeight) / 2) + "px" });

		try {
			if (point.m.type === "video") {
				$("<script>brightcove.createExperiences();</script>").appendTo($media);
			}
		} catch(e) {}

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

            state.type = h[1] || "index"; // Implicit type "index"
            if (h[2]) { state.id = parseInt(h[2], 10); } // Important: convert to Int

            // If type is point, we get the cat and add it to current state
            if (state.type === "point") {
            	if (_.find(app.points, function (pt) { return pt.id === state.id; })) {
	            	state.cat = app.points.get(state.id).cat;
            	} else {
            		state = { type: "index" };
            	}
            }

            old = current || {};
            current = state;
            return state;
		};


		transitionOut = function (onAfter) {

			if (!_.isUndefined(app.dz) && app.dz.isOpen) { // Close deep zoom overlay before
				app.dz.close();
			}

			if (typeof onAfter !== "function") onAfter = $.noop;

			// if (old.type === "index") {}
			if (_.isUndefined(old.type)) {}

			if (old.type === "point" || old.type === "index") {
				app.$pointContainer.fadeOut(500, function () {
					onAfter.call();
				});

				return; // Return to prevent final call of onAfter
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


