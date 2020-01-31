
var c = document.createElement("canvas");
var ctx = c.getContext("2d");

document.body.appendChild(c);


// Area in question for dragging + zooming
var xOffset = 0;
var yOffset = 0;
var zoomlevel = 2;
var aspect = window.innerWidth / window.innerHeight;
var max_iteration = 200;

var mandelbrot = function(x0, y0, xMin, xMax, yMin, yMax) {
    var x = lerp(xMin, xMax, x0/c.width);
    var y = lerp(yMin, yMax, y0/c.height);
    iteration = getIteration(x, y);
    var hsv = getColor(iteration);
    var rgbColor = hslToRgb(hsv.h, hsv.s, hsv.v);
    return rgbColor;
};

var getColor = function(iter) {
    if (iter >= max_iteration) {
        return {
            h: 0,
            s: 0,
            v: 0
        };
    }
    else {
        return {
            h: lerp(0, 1, iter/max_iteration),
            s: 100,
            v: 50
        };
    }
};

var hslToRgb = function(h, s, l){
    var r1, g1, b1;

    if(s == 0){
        r1 = g1 = b1 = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r1 = hue2rgb(p, q, h + 1/3);
        g1 = hue2rgb(p, q, h);
        b1 = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r1 * 255), 
        g: Math.round(g1 * 255), 
        b: Math.round(b1 * 255)
    };
};

var getIteration = function(x0, y0) {
    var x = 0;
    var y = 0;
    var iteration = 0;
    
    while (x*x + y*y <= 2*2 && iteration < max_iteration) {
        xtemp = x*x - y*y + x0;
        y = 2*x*y + y0;
        x = xtemp;
        iteration++;
    }
    return iteration;
};

var renderCanvas = function() {
    
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    var imData = ctx.createImageData(c.width, c.height);

    var data = imData.data;
    for (var i = 0; i < c.width; i++) {
        for (var j = 0; j < c.height; j++) {

            var colorVal = mandelbrot(i,j, -zoomlevel*aspect + xOffset, zoomlevel*aspect + xOffset, -zoomlevel + yOffset, zoomlevel + yOffset);

            data[4*i + 4*j*c.width] = colorVal.r;        // r
            data[1 + 4*i + 4*j*c.width] = colorVal.g;  // g
            data[2 + 4*i + 4*j*c.width] = colorVal.b;    // b
            data[3 + 4*i + 4*j*c.width] = 255;  // a
        }
    }
    ctx.putImageData(imData, 0, 0);
};

var renderSVG = function() {
    // TODO
};

var lerp = function(v0, v1, t) {
    return (1 - t) * v0 + t * v1;
};

var mouseIsDown = false;
var mdx = 0;
var mdy = 0;

var onMouseDown = function(evt) {
    mouseIsDown = true;
    var rect = c.getBoundingClientRect();
    mdx = evt.clientX;
    mdy = evt.clientY;
};

var onMouseUp = function(evt) {
    mouseIsDown = false;
    renderCanvas();
};

var onMouseMove = function(evt) {
    if (mouseIsDown) {
        xOffset += 2*zoomlevel*(mdx - evt.clientX)/c.width;
        yOffset += 2*zoomlevel*aspect*(mdy - evt.clientY)/c.height;
        mdx = evt.clientX;
        mdy = evt.clientY;
    }
};

var onScroll = function(evt) {
    if (evt.deltaY > 0) {
        zoomlevel /= 1 + (evt.deltaY * 0.1);
    }
    else {
        zoomlevel *= 1 + (evt.deltaY * 0.1);
    }
    renderCanvas();
};

var onKeyDown = function(evt) {
    if (evt.which == 38) {
        max_iteration += 100;
    }
    if (evt.which == 40) {
        max_iteration -= 100;
        if (max_iteration < 100) {
            max_iteration = 100;
        }
    }
    console.log("Max Iterations: " + max_iteration);
    renderCanvas();
}


c.addEventListener("wheel", onScroll);
c.addEventListener("mousemove", onMouseMove);
c.addEventListener("mousedown", onMouseDown);
c.addEventListener("mouseup", onMouseUp);
addEventListener("keydown", onKeyDown);

renderCanvas();