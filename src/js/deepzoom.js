/**
 * DeepZoom
 * @param 	options.$el:Object 				jQuery element to be used as container (e.g. an overlay div)
 * @param 	options.$url:String 			URL to the tile source folder
 * @param 	options.width:Integer 			pixel width of the full size image
 * @param 	options.height:Integer 			pixel height of the full size image
 * @param 	options.zoomControls:Boolean 	enable zoom slider
 * @param 	options.closeButton:Boolean 	enable close button
 */
var DeepZoom = function (options) {
	options = $.extend({ // Defaults
		zoomControls: true,
		closeButton: true
	}, options);


	var $el = options.$el.eq(0),
		url = options.url.replace(/\/?$/, "/"), // With trailing "/"
		zoomControls = !!options.zoomControls,
		closeButton = !!options.closeButton,
		width = options.width,
		height = options.height,
		id = $el.attr("id");

	if (_.isUndefined($el)) {
		throw "DeepZoom: container element not specified";
	}

	// If $el doesn't have a (valid) id, we give it our own ("dzcontainer")
	if (id === void 0 || id.match(/^[a-zA-Z][\w:.-]*$/g) === null) {
		id = $el.attr("id", "dzcontainer").attr("id");
	}

	this.url = url;
	this.$el = $el;
	this.id = id;
	this.width = width;
	this.height = height;
	this.closeButton = closeButton;
	this.zoomControls = zoomControls;

	this.open();
};


DeepZoom.prototype.open = function () {
	var self = this;

	// if (this.$el.is(":visible") === false) {
	// 	this.$el.fadeIn(500);
	// }

	this.viewer = OpenSeadragon({ // TODO: parameterize options
        id: this.id,
        autoHideControls: true,
        wrapHorizontal: false, // Horizontal repeat
        wrapVertical: false, // Vertical repeat
        animationTime: 1.5,
        minZoomImageRatio: .5, // (Min size relative to viewport size)
        maxZoomPixelRatio: 3, // (Max size relative to real-size pixel image)
        showNavigationControl: false, // Important
        showNavigator: false,
        mouseNavEnabled: true,
        preserveViewport: false, // Sequence: preserve zoom level and position when navigating between images
        visibilityRatio: 0.5, // Default: 0.5
        zoomPerClick: 1.4, // Default: 2
        zoomPerScroll: 1.1 // Default: 1.2
	});

	this.viewer.open({
		Image: {
			xmlns: "http://schemas.microsoft.com/deepzoom/2008",
			Url: this.url,
			Format: "jpg",
			Overlap: "1",
			TileSize: "256",
			Size: {
				Height: this.height.toString(),
				Width: this.width.toString()
			}
		}
	});

	if (this.zoomControls || this.closeButton) {
		this.initControls();
	}


	if (this.$el.is(":visible") === false) {
		this.$el.fadeIn(500, function () {

            $(document).one("keyup", function (e) { // Close with Escape key
                if (e.which  === 27) {
                    self.close();
                }
            });

			self.$el.css({ cursor: "move" });
		});
	}

	this.isOpen = true;
};


DeepZoom.prototype.close = function () {
	var self = this;
	this.$el.fadeOut(500, function () {
		self.viewer.destroy();
	});
}



DeepZoom.prototype.initControls = function () {
	var $slider,
		$closeButton,
		self = this;

	if (this.zoomControls) {
		$("<div class='dzzoomcontrols'><div class='dzscalebutton minus'></div><div class='dzslider'></div><div class='dzscalebutton plus'></div></div>").appendTo(this.$el);
		$slider = this.$el.find(".dzslider");
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
	            $slider.slider("value", currentZoomLevel());
	        });

	        $(".dzscalebutton.minus").on("click", zoomOut);
	        $(".dzscalebutton.plus").on("click", zoomIn);


		});
	}

	if (this.closeButton) {
		$closeButton = $("<div class='dzclosebutton'></div>").appendTo(this.$el);
		$closeButton.on("click", function () { self.close(); });
	}

	// Activate spotlight on non-touch devices
    if ("ontouchstart" in document.documentElement === false) {
    	$("body").spotlight({ fadeables: ".dzzoomcontrols, .dzclosebutton", interval: 800 });
    }

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


