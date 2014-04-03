var Quadrant = function (params) {
	"use strict";
	var defaults = {
		DOMContainerSelector: "body",
		HTMLStructure: "<div></div>", // HTML structure to be injected into each quadrant zone (string or array of strings)
		defaultDuration: 0,
		defaultEasing: "swing"
	};

	params = $.extend(defaults, params);
	this.DOMContainerSelector = params.DOMContainerSelector;
	this.HTMLStructure = params.HTMLStructure;
	this.defaultDuration = params.defaultDuration;
	this.defaultEasing = params.defaultEasing;
	this.DOMId = params.DOMId; // Must be explicitly defined (no default)

	this.isRendered = false;
	this.isScrolling = false;
	this.$quadrant = $("<div class='quadrant' id='" + this.DOMId + "'></div>");
	this.width = 0;
	this.height = 0;
	this.scrollQueue = [];
	this.currentPos = "center";

	if (typeof this.HTMLStructure === "string") this.HTMLStructure = [this.HTMLStructure];

};


Quadrant.prototype.clearQueue = function () {
	this.scrollQueue = [];
	this.isScrolling = false;
}


Quadrant.prototype.render = function () {
	"use strict";
	var $container = $(this.DOMContainerSelector),
		$q = this.$quadrant, // Quandrant window
		qw, qh,
		$zones,
		i = 0,
		l = this.HTMLStructure.length;

	qw = this.width = $container.outerWidth(false);
	qh = this.height = $container.outerHeight(false);



	if ($q.parents(":last").is("html") === false) { // Initial rendering
		//$zones = $q.append("<div class='nw'></div><div class='ne'></div><div class='se'></div><div class='sw'></div>");

		for (i = 0; i < 4; ++i) {
			$(this.HTMLStructure[i % l]).addClass("quadrant-zone").addClass("quadrant-zone" + (i + 1)).appendTo($q);
		}
		$q.appendTo($container);
	}

	// Set elements size and position
	$q.css({ width: qw + "px", height: qh + "px" });
	$q.children().css({ width: qw + "px", height: qh + "px" });
	$q.children().eq(0).css({ left: "0px", top: "0px" });
	$q.children().eq(1).css({ left: qw + "px", top: "0px" });
	$q.children().eq(2).css({ left: qw + "px", top: qh +"px" });
	$q.children().eq(3).css({ left: "0px", top: qh + "px" });


	if (this.isRendered === false) {
		this.isRendered = true;
		this.scrollTo({ pos: "center", duration: 0 }); // Initial positioning
	} else {
		this.scrollTo({ pos: this.currentPos, duration: 0});
	}
}


Quadrant.prototype.getHeight = function () {
	return this.height;
};

Quadrant.prototype.getWidth = function () {
	return this.width;
};


Quadrant.prototype.scrollTo = function (params) {
	"use strict";
	var self = this,
		defaults = {
			pos: 0, // 0: center, 1: nw, 2: ne, 3: se, 4: sw
			duration: this.defaultDuration,
			easing: this.defaultEasing,
			onAfter: $.noop //onAfter: function () {}
		},
		$q = this.$quadrant,
		passedOnAfter;

	params = $.extend(defaults, params);
	passedOnAfter = params.onAfter; // Save passed onAfter argument
	params.pos = parseInt(params.pos);
	if (isNaN(params.pos) || params.pos < 0 || params.pos > 4) params.pos = 0;

	// DEBUG: sometimes onAfter seems not to be called and the behaviour freezes (TODO: clearQueue is this.scrollQueue.length > something)
	params.onAfter = function() {
		if (typeof passedOnAfter === "function") passedOnAfter(); // Run passed onAfter function
		if (self.scrollQueue.length > 0) {
			runScroll(self.scrollQueue.shift());
		} else {
			self.isScrolling = false;
		}
	};

	this.scrollQueue.push(params);

	if (this.isScrolling === false) {
		runScroll(this.scrollQueue.shift());
	} 

	function runScroll (params) {
		var pos = self.currentPos = params.pos,
			onAfter = params.onAfter;

		delete params.pos;
		self.isScrolling = true;

		if (pos === 0) {
			$q.scrollTo({ left: (self.width / 2) + "px", top: (self.height / 2) + "px" }, params);
			$q.fadeTo(params.duration, .5);
		} else {
			$q.scrollTo($q.children().eq(pos - 1), params); // NB: element position in container is -1 with respect to `pos`
			$q.fadeTo(params.duration, 1);
		}
	}

};


