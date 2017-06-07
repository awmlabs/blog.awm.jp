"use strict";
/*
  (c) 2016/4/13- yoya@awm.jp . All Rights Reserved.
*/
(function() {
    console.debug("color.js main");
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var hrange = document.getElementById("hrange");
    var srange = document.getElementById("srange");
    var lrange = document.getElementById("lrange");
    var hue = 0;
    var salute = 100;
    var luminant = 50;
    var hueHitMap = {};
    var toneHitMap = {}
    init();
    canvas.addEventListener("mousedown", mousedown, false);
    canvas.addEventListener("mousemove", mousedown, false);
    hrange.addEventListener("input", hrangeinput, false);
    srange.addEventListener("input", srangeinput, false);
    lrange.addEventListener("input", lrangeinput, false);
    function init() {
	var width  = canvas.width;
	var height = canvas.height;
	setHue(0);
	setSalute(100);
	setLuminant(50);
	update(width, height);
    }
    function setHue(h) {
	hue = h;
	var e = document.getElementById("hue");
	e.innerHTML = h;
	hrange.value = h;
    }
    function setSalute(s) {
	salute = s;
	var e = document.getElementById("salute");
	e.innerHTML = s;
	srange.value = s;
    }
    function setLuminant(l) {
	luminant = l;
	var e = document.getElementById("luminant");
	e.innerHTML = l;
	lrange.value = l;
    }
    function update() {
	var width  = canvas.width;
	var height = canvas.height;
	canvas.width = width;
	toneFigure(width, height);
	hueRing(width, height);
    }
    function mousedown(event) {
//	if (event.buttons === 0) {
//	    return ; // no button push state
//	}
	var x = event.offsetX;
	var y = event.offsetY;
	for (var key in hueHitMap) {
	    var hit = hueHitMap[key];
	    var dx = x - hit[0];
	    var dy = y - hit[1];
	    var r = hit[2];
	    if ((dx*dx+dy*dy) < r*r) {
		setHue(key);
		update();
		return ; // tone skip
	    }
	}
	for (var key in toneHitMap) {
	    var hit = toneHitMap[key];
	    var dx = x - hit[0];
	    var dy = y - hit[1];
	    var r = hit[2];
	    if ((dx*dx+dy*dy) < r*r) {
		var keys = key.split(",");
		setSalute(keys[0]);
		setLuminant(keys[1]);
		update();
	    }
	}
    }
    function hrangeinput(event) {
	var v = hrange.value;
	setHue(parseInt(v));
	update();
    }
    function srangeinput(event) {
	var v = srange.value;
	setSalute(parseInt(v))
	update();
    }
    function lrangeinput(event) {
	var v = lrange.value;
	setLuminant(parseInt(v));
	update();
    }
    //
    function circle(x, y, r, c) {
	// console.debug("circle:", x, y, r, c);
	ctx.fillStyle = c;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI, true);
	ctx.fill();
    }
    //
    function hueRing(width, height) {
	var center_x = width / 2;
	var center_y = height / 2;
	var PI2 = 2 * Math.PI;
	var delta  = PI2 / 20;
	for (var t = 0 ; t < PI2 ; t += delta ) {
	    var t2 = t - Math.PI/2;
	    var x = center_x + 260 * Math.cos(t2);
	    var y = center_y + 260 * Math.sin(t2);
	    var r = 40;
	    var h = (360 * t / PI2) | 0;
	    var c = "hsl("+h+", "+salute+"%, "+luminant+"%)";
	    circle(x, y, r, c);
	    hueHitMap[h] = [x, y, r];
	}
    }
    function toneFigure(width, height) {
	var center_x = width / 2;
	var center_y = height / 2;
	var x_n = 5;
	for (var x = 0 ; x < x_n ; x++) {
	    var y_n = x_n - x;
	    for (var y = 0 ; y < y_n ; y++) {
		var x2 = center_x + (1.1 + x - (x_n/2))*72;
		var y2 = center_y + (0.5 + y - (y_n/2))*80;
		var r = 40;
		var s = (100 * (x+1) / x_n) | 0;
		var l = (100 * (y_n - y-0.5) / y_n) | 0;
		var c = "hsl("+hue+", "+s+"%, "+l+"%)";
		circle(x2, y2, r, c);
		toneHitMap[s+","+l] = [x2, y2, r];
	    }
	}

    }
})();
