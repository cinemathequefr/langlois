var View = function (params) {
	"use strict";

	var defaults = {
		DOMContainerSelector: "body",
		tagName: "div",
		className: null,
		id: null
	};

	this.params = $.extend(defaults, params);
	this.isRendered = false;
	this.$el = $("<" + this.params.tagName + "></" + this.params.tagName + ">");
	if (this.params.className) this.$el.addClass(this.params.className);
	if (this.params.id) this.$el.attr("id", this.params.id);

}


View.prototype.render = function () {

	if (this.$el.parents(":last").is("html") === false) { // Initial rendering
		this.$el.appendTo($(this.params.DOMContainerSelector));
	}



}

