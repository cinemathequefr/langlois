/**
 * fitInBox
 * Constrains a box (width x height) to fit in a containing box (maxWidth x maxHeight), preserving the aspect ratio
 * Useful to resize images to fit a container
 * see: http://stackoverflow.com/questions/1106339/resize-image-to-fit-in-bounding-box
 * @author  Nicolas Le Thierry d'Ennequin
 * @version 2012-11-29
 * @param   Int     width           width of the box to be resized
 * @param   Int     height          height of the box to be resized
 * @param   Int     maxWidth        width of the containing box
 * @param   Int     maxHeight       height of the containing box
 * @param   Bool    expandable      if output size is bigger than input size, output is left unchanged (false) or expanded (true)
 * @return  Object                  width, height of the resized box
 */
function fitInBox(width, height, maxWidth, maxHeight, expandable) {
    width = parseInt(width);
    height = parseInt(height);
    maxWidth = parseInt(maxWidth);
    maxHeight = parseInt(maxHeight);

    var aspect = width / height,
        initWidth = width,
        initHeight = height;

    if (width > maxWidth || height < maxHeight) {
        width = maxWidth;
        height = Math.floor(width / aspect);
    }

    if (height > maxHeight || width < maxWidth) {
        height = maxHeight;
        width = Math.floor(height * aspect);
    }

    if (!!expandable === false && (width >= initWidth || height >= initHeight)) {
        width = initWidth;
        height = initHeight;
    }

    return {
        width: width,
        height: height
    };
}