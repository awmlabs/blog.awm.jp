"use strict";

var RGB   = ["red", "green", "blue"];
var YCbCr = ["y", "cb", "cr"];
var RGBYCbCr = RGB.concat(YCbCr);

function getById(id) {
    return document.getElementById(id);
}

function outOfRange(n) {
    if ((n < 0) || (255 < n)) {
	return true
    }
    return false;
}

function strNN(n) {
    if (n < 0) {
	n = 0;
    } else if  (0xff < n) {
	n = 0xff;
    }
    if (n < 0x10) {
        return "0"+(parseInt(n).toString(16));
    }
    return parseInt(n).toString(16);
}

function strN6(n) {
    return strNN(n[0]) + strNN(n[1]) + strNN(n[2]);
}

// http://www.technotype.net/tutorial/tutorial.php?fileId=%7BImage%20processing%7D&sectionId=%7Bconverting-between-rgb-and-ycbcr-color-space%7D
function rgb2ycbcr(rgb) {
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var y  =  0.29891 * r + 0.58661 * g + 0.11448 * b;
    var cb = -0.16874 * r - 0.33126 * g + 0.50000 * b + 128;
    var cr =  0.50000 * r - 0.41869 * g - 0.08131 * b + 128;
    return [Math.round(y), Math.round(cb), Math.round(cr)];
}

function ycbcr2rgb(ycbcr) {
    var y = ycbcr[0], cb = ycbcr[1], cr = ycbcr[2];
    var r = y + 1.40200 * (cr - 128);
    var g = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128);
    var b = y + 1.77200 * (cb - 128);
    return [Math.round(r), Math.round(g), Math.round(b)];
}

function showColorRGB(rgb) {
    // console.debug("showColorRGB:", rgb);
    var r = rgb[0], g = rgb[1], b = rgb[2];
    getById("paint").style.backgroundColor = "#" + strN6([r, g, b], true);
    getById("red_paint").style.backgroundColor   = "#" + strN6([r, 0, 0]);
    getById("green_paint").style.backgroundColor = "#" + strN6([0, g, 0]);
    getById("blue_paint").style.backgroundColor  = "#" + strN6([0, 0, b]);
    var red_num = getById("red_num"),
	green_num = getById("green_num"),
	blue_num = getById("blue_num");
    red_num.innerHTML   = r;
    green_num.innerHTML = g;
    blue_num.innerHTML  = b;
    red_num.style.backgroundColor   = outOfRange(r)?"red":null;
    green_num.style.backgroundColor = outOfRange(g)?"red":null;
    blue_num.style.backgroundColor  = outOfRange(b)?"red":null;
}

function showColorYCbCr(ycbcr) {
    // console.debug("showColorYCbCr:", ycbcr);
    var y = ycbcr[0], cb = ycbcr[1], cr = ycbcr[2];
    var rgb1 = ycbcr2rgb([  y, 127, 127]),
	rgb2 = ycbcr2rgb([127,  cb,   127]),
	rgb3 = ycbcr2rgb([127,  127,  cr]);
    getById("y_paint").style.backgroundColor  = "#" + strN6(rgb1);
    getById("cb_paint").style.backgroundColor = "#" + strN6(rgb2);
    getById("cr_paint").style.backgroundColor = "#" + strN6(rgb3);
    var y_num  = getById("y_num"),
	cb_num = getById("cb_num"),
	cr_num = getById("cr_num");
    y_num.innerHTML  = y;
    cb_num.innerHTML = cb;
    cr_num.innerHTML = cr;
    y_num.style.backgroundColor  = outOfRange(y) ?"red":null;
    cb_num.style.backgroundColor = outOfRange(cb)?"red":null;
    cr_num.style.backgroundColor = outOfRange(cr)?"red":null;
}

function slideChange(e) {
    var elem = e.target;
    var id = elem.id;
    switch(id) {
    case "red":
    case "green":
    case "blue":
	var r = parseInt(getById("red").value);
	var g = parseInt(getById("green").value);
	var b = parseInt(getById("blue").value);
	showColorRGB([r, g, b]);
	var ycbcr = rgb2ycbcr([r, g, b]);
	getById("y").value  = ycbcr[0];
	getById("cb").value = ycbcr[1];
	getById("cr").value = ycbcr[2];
	showColorYCbCr(ycbcr);
	break;
    case "y":
    case "cb":
    case "cr":
	var y  = parseInt(getById("y").value);
	var cb = parseInt(getById("cb").value);
	var cr = parseInt(getById("cr").value);
	showColorYCbCr([y, cb, cr]);
	var rgb = ycbcr2rgb([y, cb, cr]);
	getById("red").value   = rgb[0];
	getById("green").value = rgb[1];
	getById("blue").value  = rgb[2];
	showColorRGB(rgb);
	break;
    }
}

for (var i in RGBYCbCr) {
    var elem = getById(RGBYCbCr[i]);
    elem.addEventListener("input", slideChange);
}
