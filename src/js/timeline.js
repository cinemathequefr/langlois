/**
 * Timeline constructor
 * @param   config  [object]            Configuration object:
            config.DOMId                (Required) Id of the DOM element to which the timeline will be attached
            config.tlWidth              Virtual width of the timeline (no explicit unit), determines how many possible "slots" the timeline can hold (cannot be mutated).
            config.tlPxWidth            Width of the rendered timeline (in px) (is mutated when the timeline is resized)
            config.ptPxWidth            Width of a rendered timeline-point (in px) (Note: will be used later to deal with point overlapping)
            config.graduation           Object containing graduation info:
            config.graduation.step      Step for each graduations, in the unit of config.tlWidth
            config.graduation.cssClass     Function taking a graduation index (i) and returning a class name for the corresponding graduation DOM element.
            config.graduation.legend    Function taking a graduation index (i) and returning a string for the corresponding graduation legend (text).
 * @author Nicolas Le Thierry d'Ennequin
 * @version 2013-03-25
 */
var Timeline = function (config) {
    this.DOMId = config.DOMId;
    this.DOMContainerSelector = config.DOMContainerSelector || "body",
    this.tlWidth = config.tlWidth || 10000;
    this.tlPxWidth = config.tlPxWidth || 3000;
    this.ptPxWidth = config.ptPxWidth || 10;
    this.graduation = config.graduation;
    this.widthRatio = 1;
    this.points = [];   // Array containing the timeline's point objects
    this.isRendered = false;

    // Creates the basic DOM structure
    this.$tl = $("<div class='timeline' id='" + this.DOMId + "'></div>");
    this.$tlContainer = $("<div class='timeline-container'></div>").appendTo(this.$tl);
    this.$tlPointsContainer = $("<div class='timeline-points-container'></div>").appendTo(this.$tlContainer);
    this.$tlGraduationContainer = $("<div class='timeline-graduation-container'></div>").appendTo(this.$tlContainer);

    // Creates the graduation
    if (this.graduation) {
        for (var i = 0; i < (this.tlWidth / this.graduation.step); ++i) {
            $("<div class='timeline-graduation'>" + this.graduation.legend(i) + "</div>").addClass(this.graduation.cssClass(i)).appendTo(this.$tlGraduationContainer);
        }
    }
};


/**
 * Add a point to the timeline
 * @param   id      [int]       Point Id
 * @param   pos     [number]    The point's position in the unit of the virtual width of the timeline
 */
Timeline.prototype.add = function (id, pos) {
    var l = this.points.push({
        id: id,
        pos: pos,
        $point: $("<div class='timeline-point'></div>").appendTo(this.$tlPointsContainer)
    });

    if (this.isRendered === true) {
        this.render();
    }
    
    return this.points[l - 1];
    // TODO: rather return `this`
};


/**
 * Get width ratio
 * Computes the ratio between the width of the rendered timeline (px) and its virtual width.
 * The result is used to position the graduations and the points on the timeline.
 * @return  Width ratio 
 */
Timeline.prototype.calcWidthRatio = function () {
    return this.tlPxWidth / this.tlWidth;
};
 

/**
 * Resize
 * Sets a timeline pixel width (by upadating Timeline.tlPxWidth) and renders
 * @param   [int]   New timeline pixel width
 */
Timeline.prototype.resize = function (w) {
    if (isNaN(w)) {
        return false;
    } else {
        this.tlPxWidth = w;
        this.render();
        return true;
    }
};


/**
 * Bind timeline points
 * NB: uses event delegation internally
 * TODO: add an `onclick` property to the configuration object to make event binding simpler
 */
Timeline.prototype.bind = function (eventType, callback) {
    var self = this; // Timeline object
    this.$tlPointsContainer.on(eventType, function (e) {
        var target = $(e.target);
        if (target.hasClass("timeline-point")) {
            callback.call(self, target.data("id")); // Calls the callback passing the point's id as parameter
        }
    });
    return this;
}


/**
 * Scrolls to a given point Id (tries to center it as much as possible)
 * @param   ptId    (int)   Id of the point
 */
Timeline.prototype.scrollTo = function (ptId) {
    try {
        var ptPxPos = _.find(this.points, function (i) { return (i.id == ptId ? i : false); }).pxPos;
        this.$tl.mCustomScrollbar("scrollTo", ptPxPos + (this.ptPxWidth - $(window).width()) / 2);
    }
    catch (err) {
    }
};


/**
 * Renders the timeline
 */
 Timeline.prototype.render = function () {
    var widthRatio, i, pt,
        graduationStep = this.graduation.step,
        ptPxWidth = this.ptPxWidth,
        minPxPosNext, // Min position of the next point (= position of previous point + ptPxWidth)
        winWidth = $(window).width();

    if (this.tlPxWidth < winWidth) { // The timeline cannot be narrower than the current viewport
        this.tlPxWidth = winWidth;
    }

    this.widthRatio = widthRatio = this.calcWidthRatio(); 
    this.$tlContainer.css({width: this.tlPxWidth + "px"});
    this.points = _.sortBy(this.points, function (p) { return parseInt(p.pos); });

    for (i = 0; i < this.points.length; ++i) {
        pt = this.points[i];
        pt.pxPos = Math.floor(pt.pos * widthRatio);

        if (i > 0) {
            minPxPosNext = this.points[i - 1].pxPos + ptPxWidth + 4;
            if (pt.pxPos < minPxPosNext) pt.pxPos = minPxPosNext;
        }

        pt.$point.css({width: this.ptPxWidth + "px", left:pt.pxPos + "px"});
    }

    if (this.graduation) { // (TODO: skip graduation rendering if widthRatio hasn't changed since previous rendering)
        this.$tlGraduationContainer.children().each(function (i) {
            $(this).css({left: (i * graduationStep * widthRatio) + "px"});
        });
    }
    
    
    if ((this.$tl).parents(":last").is("html") === false) { // Initial rendering: attach timeline to body and create scrollbar
        this.$tl.appendTo($(this.DOMContainerSelector));
        this.$tl.mCustomScrollbar({ horizontalScroll: true, advanced: { autoExpandHorizontalScroll: true} });
    } else { // Subsequent renderings: update scrollbar
        this.$tl.mCustomScrollbar("update");
    }

    this.isRendered = true;

    return this;

};
