/**
 * Quadrant
 */

var Quadrant = function (config) {
	this.DOMId = config.DOMId;
	this.DOMContainerSelector = config.DOMContainerSelector || "body";

	this.isRendered = false;
	this.$quadrant = $("<div class='quadrant' id='" + this.DOMId + "'></div>");
};

Quadrant.prototype.render = function () {

	var $container = $(this.DOMContainerSelector),
		$q = this.$quadrant, // Quandrant window
		qw = $container.outerWidth(false),
		qh = $container.outerHeight(false);

	$q.append("<div class='nw'></div><div class='ne'></div><div class='sw'></div><div class='se'></div>");

	if ((this.$quadrant).parents(":last").is("html") === false) { // Initial rendering
		this.$quadrant.appendTo($container);
	}

	$q.css({ width: qw + "px", height: qh + "px" });
	$q.children("div").css({ width: qw + "px", height: qh + "px" });

	$q.children("div").eq(0).css({ left: "0px", top: "0px" });
	$q.children("div").eq(1).css({ left: qw + "px", top: "0px" });
	$q.children("div").eq(2).css({ left: qw + "px", top: qh +"px" });
	$q.children("div").eq(3).css({ left: "0px", top: qh + "px" });



	$q.scrollTo({ left: (qw / 2) + "px", top: (qh / 2) + "px" });

	window.setTimeout(function() {

		$q.scrollTo($q.children().eq(1), {easing: "easeInOutQuad",  duration: 500, onAfter: function () {
			$q.scrollTo($q.children().eq(3), {easing: "easeInOutQuad",  duration: 500, onAfter: function () {
				$q.scrollTo($q.children().eq(2), {easing: "easeInOutQuad",  duration: 500 });
			}});
		}});

		
	}, 1000);






	this.isRendered = true;
}
