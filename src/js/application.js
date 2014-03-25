(function () {
	"use strict";

	var app = {};
	app.config = {};
	app.config.timeline = {
        DOMId: "timeline",
        DOMContainerSelector: "body",
        tlPxWidth: 5000,
        ptPxWidth: 18,
        tlWidth: 24471, // Day count from 01-Jan-12 to 31-Dec-78 = number of virtual timeline 'slots'
        graduation: {
            step: 24471 / 66,
            cssClass: function (i) { return (((1912 + i) % 5 === 0) ? "g1" : "g2"); },
            legend: function (i) { return (1912 + i); }
        }
	};

	app.init = function (data) {
		var timeline;
		timeline = new Timeline(app.config.timeline);
		timeline.render();
		var tle = timeline.add(1, 500).$point;
		console.log(tle);

		var quadrant;
		quadrant = new Quadrant({ DOMId: "quadrant", DOMContainerSelector: ".container" });
		quadrant.render();


		$(".app-title").on("click", function () {
			quadrant.scrollTo({ pos: "center", duration: 500 });
		});

		$(".quad-trigger").on("click", function () {
			quadrant.scrollTo({pos: $(this).data("pos"), duration: 500 });
		});



		$(window).on("debouncedresize", quadrant.render);

		// quadrant.scrollTo({ pos: "ne", duration: 1000 });
		// quadrant.scrollTo({ pos: "sw", duration: 1000 });
		// quadrant.scrollTo({ pos: "se", duration: 1000 });
		// quadrant.scrollTo({ pos: "nw", duration: 1000 });
		// quadrant.scrollTo({ pos: "center", duration: 1000 });



		




	};










	// Application entry point
	$(function () {
		app.init();
	});


}());