(function () {
	"use strict";

	var app = {};
	app.config = {};
	app.config.timeline = {
        DOMId: "timeline",
        DOMContainerSelector: "#container",
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


	};










	// Application entry point
	$(function () {

		app.init();

	});


}());