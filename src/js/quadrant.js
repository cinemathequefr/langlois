
var Quadrant = function (config) {
	"use strict";
	this.DOMId = config.DOMId;
	this.DOMContainerSelector = config.DOMContainerSelector || "body";
	this.isRendered = false;
	this.isScrolling = false;
	this.$quadrant = $("<div class='quadrant' id='" + this.DOMId + "'></div>");
	this.width = 0;
	this.height = 0;
	this.scrollQueue = [];
	this.currentPos;
};

Quadrant.prototype.render = function () {
	"use strict";

	var $container = $(this.DOMContainerSelector),
		$q = this.$quadrant, // Quandrant window
		qw, qh;

	qw = this.width = $container.outerWidth(false);
	qh = this.height = $container.outerHeight(false);

	console.log(this.$quadrant);


	if ($q.parents(":last").is("html") === false) { // Initial rendering
		$q.append("<div class='nw'></div><div class='ne'></div><div class='sw'></div><div class='se'></div>");
		$q.appendTo($container);
	}

	$q.css({ width: qw + "px", height: qh + "px" });
	$q.children("div").css({ width: qw + "px", height: qh + "px" });
	$q.children("div").eq(0).css({ left: "0px", top: "0px" });
	$q.children("div").eq(1).css({ left: qw + "px", top: "0px" });
	$q.children("div").eq(2).css({ left: qw + "px", top: qh +"px" });
	$q.children("div").eq(3).css({ left: "0px", top: qh + "px" });

	if (this.isRendered === false) { // (Initial rendering ?)
		this.scrollTo({ pos: "center", duration: 0 });
	}

	this.isRendered = true;

	// this.scrollTo({ pos: "center", duration: 0 });
	// this.scrollTo({ pos: "nw", duration: 1000 });
	// this.scrollTo({ pos: "ne", duration: 1000 });
	// this.scrollTo({ pos: "center", duration: 1000 });
	// this.scrollTo({ pos: "sw", duration: 1000 });
	// this.scrollTo({ pos: "se", duration: 1000 });
	// this.scrollTo({ pos: "nw", duration: 1000 });
	// this.scrollTo({ pos: "center", duration: 1000 });
	// this.scrollTo({ pos: "se", duration: 1000 });
	// this.scrollTo({ pos: "center", duration: 1000 });

}


Quadrant.prototype.scrollTo = function (params) {
	"use strict";
	var self = this,
		defaults = {
			pos: "center",
			duration: 0,
			easing: "easeInOutQuad",
			onAfter: function () {}
		},
		$q = this.$quadrant,
		onAfter;

	if (params.pos === "nw") params.pos = 0;
	if (params.pos === "ne") params.pos = 1;
	if (params.pos === "se") params.pos = 2;
	if (params.pos === "sw") params.pos = 3;

	params = $.extend(defaults, params);
	onAfter = params.onAfter;

	params.onAfter = function() {
		console.log(self.currentPos);
		onAfter(); // Run specified onAfter function
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

		if (pos === "center") {
			$q.scrollTo({ left: (self.width / 2) + "px", top: (self.height / 2) + "px" }, params);
		} else {
			$q.scrollTo($q.children().eq(pos), params);
		}



	};
};


