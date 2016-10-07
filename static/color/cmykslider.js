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

function cssColor(cspace, r, g, b) {
    return cspace + "("+r+","+g+","+b+")";
}

// https://www.w3.org/TR/css-color-4/#cmyk-rgb
function rgb2cmyk(rgb) {
    var [r, g, b] = rgb;
    var k = 255 - Math.max(r, g, b);
    if (k === 255) {
        return [0, 0, 0, 255];
    }
    var c = 255 * (255 - r - k) / (255 - k)
    var m = 255 * (255 - g - k) / (255 - k)
    var y = 255 * (255 - b - k) / (255 - k)
    return [c >>> 0, m >>> 0, y >>> 0, k >>> 0];
}

function cmyk2rgb(cmyk) {
    var [c, m, y, k] = cmyk;
    var r = 255 - Math.min(255, c * (255 - k)/255 + k)
    var g = 255 - Math.min(255, m * (255 - k)/255 + k)
    var b = 255 - Math.min(255, y * (255 - k)/255 + k)
    return [r >>> 0, g >>> 0, b >>> 0];
}

function showColorRGBpaint(rgb) {
    var [r, g, b] = rgb;
    var rgb_paint = getById("rgb_paint");
    rgb_paint.style.backgroundColor = "black";
    var ctx = rgb_paint.getContext("2d");
    var width = rgb_paint.width, height = rgb_paint.height;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter"; // 加法混色
    ctx.beginPath();
    ctx.fillStyle = cssColor("rgb", r, 0, 0);
    ctx.arc(150, 110, 110, 0, 2 * Math.PI, false);
    ctx.fill();
    //
    ctx.beginPath();
    ctx.fillStyle = cssColor("rgb", 0, g, 0);
    ctx.arc(110, 190, 110, 0, 2 * Math.PI, false);
    ctx.fill();
    //
    ctx.beginPath();
    ctx.fillStyle = cssColor("rgb", 0, 0, b);
    ctx.arc(190, 190, 110, 0, 2 * Math.PI, false);
    ctx.fill();
    // #" + strN6([r, g, b], true);
}


function showColorRGB(rgb) {
    // console.debug("showColorRGB:", rgb);
    var [r, g, b] = rgb;
    showColorRGBpaint(rgb);
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

function distance2(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    return dx*dx + dy*dy;
}

function showColorCMYKpaint(cmyk) {
    var [c, m, y, k] = cmyk;
    var cmyk_paint = getById("cmyk_paint");
    cmyk_paint.style.backgroundColor = "white";
    var ctx = cmyk_paint.getContext("2d");
    var width = cmyk_paint.width, height = cmyk_paint.height;
    ctx.clearRect(0, 0, width, height);
    var data = ctx.createImageData(width, height);
    var d = data.data;
    var o = 0;
    for (var j = 0 ; j < height ; j++) {
	for (var i = 0 ; i < width ; i++) {
	    var cc = 0, mm = 0, yy = 0, kk = 0;
	    if (distance2(i, j, 110, 110) <= 110*110) {
		cc = c;
	    }
	    if (distance2(i, j, 110, 190) <= 110*110) {
		mm = m;
	    }
	    if (distance2(i, j, 190, 110) <= 110*110) {
		yy = y;
	    }
	    if (distance2(i, j, 190, 190) <= 110*110) {
		kk = k;
	    }
	    //
	    var [r, g, b] = cmyk2rgb([cc, mm, yy, kk]);
	    // console.debug(r, g, b);
	    d[o++] = r;
	    d[o++] = g;
	    d[o++] = b;
	    d[o++] = 255;
	}
    }
    ctx.putImageData(data, 0, 0);
}

function showColorCMYK(cmyk) {
    // console.debug("showColorCMYK:", ycbcr);
    var [c, m, y, k] = cmyk;
    showColorCMYKpaint(cmyk);
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
	var [c, m, y, k] = cmyk;
	getById("cyan").value    = c;
	getById("magenta").value = m;
	getById("yellow").value  = y;
	getById("key").value     = k;
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
	var [r, g, b] = rgb;
	getById("red").value   = r;
	getById("green").value = g;
	getById("blue").value  = b;
	showColorRGB(rgb);
	break;
    }
    getById("paint").style.background  = cssColor("rgb", r, g, b);
}

for (var i in RGBCMYK) {
    var elem = getById(RGBCMYK[i]);
    elem.addEventListener("input", slideChange);
}
