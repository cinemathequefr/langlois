// test_dz

$(function () {
	"use strict";
	var $overlay = $("<div class='overlay'></div>").appendTo($("body")),
		deepZoom;

	deepZoom = new DeepZoom({
		$el: $(".overlay"), // Container element
		zoomControls: true,	// Zoom controls
		closeButton: true,  // Close button
		baseUrl: "http://cf.pasoliniroma.com/static/langlois/dz/"
	});

	$("a.openbutton").on("click", function () {
		var data = $(this).data("dz");
		deepZoom.open(data.folder, data.width, data.height);
	});

});


// DeepZoom
var DeepZoom = function ( options ) {
	var $el = options.$el.eq(0),
		baseUrl = options.baseUrl,
		zoomControls = !!options.zoomControls,
		closeButton = !!options.closeButton,
		id = $el.attr("id");

	if (_.isUndefined($el)) {
		throw "DeepZoom: container element not specified";
	}

	// If $el doesn't have a valid id, we give it our own (dzcontainer)
	if (id === void 0 || id.match(/^[a-zA-Z][\w:.-]*$/g) === null) {
		id = $el.attr("id", "dzcontainer").attr("id");
	}

	$el.css({ cursor: "move" });

	this.baseUrl = baseUrl;
	this.$el = $el;
	this.id = id;
	this.viewer = OpenSeadragon({
        id: this.id,
        autoHideControls: true,
        wrapHorizontal: false, // Horizontal repeat
        wrapVertical: false, // Vertical repeat
        animationTime: 1.5,
        minZoomImageRatio: .5, // (Min size relative to viewport size)
        maxZoomPixelRatio: 4, // (Max size relative to real-size pixel image)
        showNavigationControl: false, // Important
        showNavigator: false,
        mouseNavEnabled: true,
        preserveViewport: false, // Sequence: preserve zoom level and position when navigating between images
        visibilityRatio: 0.5, // Default: 0.5
        zoomPerClick: 1.4, // Default: 2
        zoomPerScroll: 1.1 // Default: 1.2
	});

	this.closeButton = closeButton;
	this.zoomControls = zoomControls;

	if (zoomControls || closeButton) {
		this.initControls();
	}
};


DeepZoom.prototype = (function () {
	var close, closeWindow, initControls, open, setVisible;

	initControls = function () {
		var $slider, $closeButton,
			self = this;

		$("<div class='dzzoomcontrols'><div class='dzscalebutton minus'></div><div class='dzslider'></div><div class='dzscalebutton plus'></div></div>").appendTo(this.$el);
		$slider = this.$el.find(".dzslider");
		$closeButton = $("<div class='dzclosebutton'></div>").appendTo(this.$el);

	    $("body").spotlight({ fadeables: ".dzzoomcontrols, .dzclosebutton", interval: 800});


	    // Misplaced: handler must be added after an image is loaded (ie open)
		this.viewer.addHandler("open", function () {
			$slider.slider({
				min: minZoomLevel(),
				max: maxZoomLevel(),
				value: currentZoomLevel(),
				slide: function (e, r) {
					return self.viewer.viewport.zoomTo(reverseZoomLevel(r.value));
				}
			});

	        self.viewer.addHandler("zoom", function () {
	        	console.log("Mousezooming");
	            $slider.slider("value", currentZoomLevel());
	        });

		});

        $(".dzscalebutton.minus").on("click", zoomOut);
        $(".dzscalebutton.plus").on("click", zoomIn);
        $(".dzclosebutton").on("click", function () { self.closeWindow(self); });

	    function convertZoomLevel (level) { // OSD zoom to UI zoom
	        return 100 * Math.log(level / self.viewer.viewport.getMinZoom()) / Math.log(2);
	    }

	    function reverseZoomLevel (level) { // UI zoom to OSD zoom
	        return self.viewer.viewport.getMinZoom() * Math.pow(2, level / 100)
	    }

	    function minZoomLevel () {
	        return convertZoomLevel(null != (t = self.viewer.viewport) ? t.getMinZoom() : void 0);
	    }

	    function maxZoomLevel () {
	        return convertZoomLevel(null != (t = self.viewer.viewport) ? t.getMaxZoom() : void 0);
	    }

	    function currentZoomLevel () {
	        return convertZoomLevel(null != (t = self.viewer.viewport) ? t.getZoom() : void 0);
	    }

	    function zoomIn () {
	        return triggerZoomBy(self.viewer.zoomPerClick);
	    }

	    function zoomOut () {
	       return triggerZoomBy(1 / self.viewer.zoomPerClick);
	    }

	    function triggerZoomBy (t) {
	        self.viewer.viewport.zoomBy(t);
	        self.viewer.viewport.applyConstraints(); // NB: method not documented (http://openseadragon.github.io/docs/symbols/OpenSeadragon.Viewport.html#applyConstraints)
	    }
	};

	close = function () { // Close current image in the viewer
		this.viewer.close();
	}

	closeWindow = function (self) {
		self.close(); // Remove view
		self.viewer.removeAllHandlers();
		self.$el.hide();
	}

	destroy = function () { // Destroy viewer
		this.viewer.destroy();
	}

	// TODO: reset zoom level display on the slider! (remains set from previous view)
	open = function (folderName, width, height) {
		this.viewer.open({
			Image: {
				xmlns: "http://schemas.microsoft.com/deepzoom/2008",
				Url: this.baseUrl + folderName + "/",
				Format: "jpg",
				Overlap: "1",
				TileSize: "256",
				Size: {
					Height: height.toString(),
					Width: width.toString()
				}
			}
		});




		if (this.$el.is(":visible") === false) {
			this.$el.show();
		}

	};

	setVisible = function (visible) {
		this.viewer.setVisible(!!visible);
	};

	return {
		// constructor: DeepZoom, // Necessary? http://stackoverflow.com/questions/55611/javascript-private-methods
		close: close,
		closeWindow: closeWindow,
		destroy: destroy,
		initControls: initControls,
		open: open,
		setVisible: setVisible
	};
}());
