"use strict";

var RGB   = ["red", "green", "blue"];
var CMYK = ["cyan", "magenta", "yellow", "key"];
var RGBCMYK = RGB.concat(CMYK);

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

// https://www.w3.org/TR/css-color-4/#cmyk-rgb
function rgb2cmyk(rgb) {
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var k = 255 - Math.max(r, g, b);
    if (k === 255) {
        return [0, 0, 0, 255];
    }
    var c = 255 * (255 - r - k) / (255 - k)
    var m = 255 * (255 - g - k) / (255 - k)
    var y = 255 * (255 - b - k) / (255 - k)
    return [Math.round(c), Math.round(m), Math.round(y), Math.round(k)];
}

function cmyk2rgb(cmyk) {
    var c = cmyk[0], m = cmyk[1], y = cmyk[2], k = cmyk[3];
    var r = 255 - Math.min(255, c * (255 - k)/255 + k)
    var g = 255 - Math.min(255, m * (255 - k)/255 + k)
    var b = 255 - Math.min(255, y * (255 - k)/255 + k)
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

function showColorCMYK(cmyk) {
    // console.debug("showColorCMYK:", ycbcr);
    var c = cmyk[0], m = cmyk[1], y = cmyk[2], k = cmyk[3];
    var rgb1 = cmyk2rgb([c, 0, 0, 0]),
	rgb2 = cmyk2rgb([0, m, 0, 0]),
	rgb3 = cmyk2rgb([0, 0, y, 0]),
	rgb4 = cmyk2rgb([0, 0, 0, k]);
    getById("cyan_paint").style.backgroundColor    = "#" + strN6(rgb1);
    getById("magenta_paint").style.backgroundColor = "#" + strN6(rgb2);
    getById("yellow_paint").style.backgroundColor  = "#" + strN6(rgb3);
    getById("key_paint").style.backgroundColor     = "#" + strN6(rgb4);
    var cyan_num    = getById("cyan_num"),
	magenta_num = getById("magenta_num"),
	yellow_num  = getById("yellow_num"),
	key_num     = getById("key_num");
    cyan_num.innerHTML    = c;
    magenta_num.innerHTML = m;
    yellow_num.innerHTML  = y;
    key_num.innerHTML     = k;
    cyan_num.style.backgroundColor   = outOfRange(c)?"red":null;
    magenta.style.backgroundColor    = outOfRange(m)?"red":null;
    yellow_num.style.backgroundColor = outOfRange(y)?"red":null;
    key_num.style.backgroundColor    = outOfRange(k)?"red":null;
}

function slideChange(e) {
    var elem = e.target;
    var id = elem.id;
    switch(id) {
    case "red":
    case "green":
    case "blue":
	var r = parseInt(getById("red").value),
	    g = parseInt(getById("green").value),
	    b = parseInt(getById("blue").value);
	var rgb = [r, g, b];
	showColorRGB(rgb);
	var cmyk = rgb2cmyk(rgb);
	getById("cyan").value    = cmyk[0];
	getById("magenta").value = cmyk[1];
	getById("yellow").value  = cmyk[2];
	getById("key").value     = cmyk[3];
	showColorCMYK(cmyk);
	break;
    case "cyan":
    case "magenta":
    case "yellow":
    case "key":
	var c = parseInt(getById("cyan").value),
            m = parseInt(getById("magenta").value),
            y = parseInt(getById("yellow").value),
	    k = parseInt(getById("key").value);
        var cmyk = [c, m, y, k];
	showColorCMYK(cmyk);
	var rgb = cmyk2rgb(cmyk);
	getById("red").value   = rgb[0];
	getById("green").value = rgb[1];
	getById("blue").value  = rgb[2];
	showColorRGB(rgb);
	break;
    }
}

for (var i in RGBCMYK) {
    var elem = getById(RGBCMYK[i]);
    elem.addEventListener("input", slideChange);
}
