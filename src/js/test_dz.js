// test_dz

$(function () {
	"use strict";
	var $overlay = $("<div id='deepzoomviewer' class='overlay'></div>").appendTo($("body")).show(),
		deepZoom = new DeepZoom();


	deepZoom.init("deepzoomviewer");
	deepZoom.open("1000-1", 1500, 2000);

	window.setTimeout(function () {
		deepZoom.open("4-1", 1500, 2000);
	}, 2000);
	
	window.setTimeout(function () {
		deepZoom.close();
	}, 3000);




});


// DeepZoom
// 
var DeepZoom = function () {
	this.viewer = {}; // Seadragon.Viewer object (http://openseadragon.github.io/docs/module-OpenSeadragon.html)
};


DeepZoom.prototype.init = function ( id ) {
	this.viewer = this.initViewer(id);
};

DeepZoom.prototype.open = function (folderName, width, height) {

	this.viewer.open({
		Image: {
			xmlns: "http://schemas.microsoft.com/deepzoom/2008",
			Url: "http://cf.pasoliniroma.com/static/langlois/dz/" + folderName + "/",
			Format: "jpg",
			Overlap: "1",
			TileSize: "256",
			Size: {
				Height: height.toString(),
				Width: width.toString()
			}
		}
	});

};


// Closes the viewer
DeepZoom.prototype.close = function () {
	console.log(this.viewer.isOpen());
	if (this.viewer.isOpen() === true) {
		this.viewer.close();
	}
};


DeepZoom.prototype.initViewer = function ( id ) { // id: id of DOM element
	// http://openseadragon.github.io/docs/index.html
    return OpenSeadragon({
        id: id, // TODO: parameterize (apparently, must point to an existing DOM element)
        autoHideControls: true,
        wrapHorizontal: false, // Horizontal repeat
        wrapVertical: false, // Vertical repeatw
        animationTime: 1.5,
        minZoomImageRatio: .5, // (Min size is proportional to viewport size?)
        maxZoomPixelRatio: 4, // (Max size is proportional to the real-size image)
        showNavigationControl: false, // Important
        showNavigator: false,
        mouseNavEnabled: true,
        preserveViewport: false, // Sequence: preserve zoom level and position when navigating between images
        visibilityRatio: 0.5, // Default: 0.5
        zoomPerClick: 1.4, // Default: 2
        zoomPerScroll: 1.1 // Default: 1.2
    });
};




