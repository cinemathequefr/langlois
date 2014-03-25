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

	app.config.quadrant = {
		DOMId: "quadrant",
		DOMContainerSelector: ".container"
	};

	app.init = function (data) {
		var timeline = new Timeline(app.config.timeline),
			data = [], // Stub (will be an array from deserialized JSON)
			point;



		data = [
			timeline.add(1, 500),
			timeline.add(2, 700),
			timeline.add(3, 1800),
			timeline.add(4, 2500)
		];

		data[0].cat = 1;
		data[1].cat = 2;
		data[2].cat = 3;
		data[3].cat = 4;


		timeline.render();



		//var tle = timeline.add(1, 500).$point;
		console.log(data);


		//console.log(tle);

		var quadrant = new Quadrant(app.config.quadrant);
		quadrant.render();

		$(".app-title").on("click", function () {
			quadrant.scrollTo({ pos: "center", duration: 500 });
		});

		$(".quad-trigger").on("click", function () {
			quadrant.scrollTo({ pos: $(this).data("pos"), duration: 500 });
		});

		$(window).on("debouncedresize", function () {
			quadrant.render();
			quadrant.scrollTo({ pos: quadrant.currentPos })
		});
	};



	// Application entry point
	$(function () {
		app.init();
	});


}());