window.onload = function () {
	initGraphics();
	load();

	loop();
}

// ==================================

let initGraphics = function () {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
}

let load = function () {}

// ==================================

let layout = new Source2D.Layout();
layout.addLayer(0, "main");
layout.getLayer("main").objects.push({
	update: function() {},
	render: function(ctx) {
		ctx.fillStyle = "white";
		ctx.fillRect(10, 10, 50, 50);
	}
})

// ==================================

let loop = function () {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	update();
	render();
	
	window.requestAnimationFrame(loop);
}

let portal = function(val, min, max) {
	if(val < min) val = max + val;
	if(val > max) val = max - val;

	return val;
}

let box = new Source2D.ShapeBox(100, 100, 50, 50);
let shape = new Source2D.Shape(200, 200, [[0,0], [20,20], [0,20], [0,0]], 0);

let update = function () {
	layout.update();

	box.moveAtAngle(1);
	box.angle = portal(box.angle + 1, 0, 360);
}

let render = function () {
	layout.render(ctx);
	box.render(ctx);
	shape.render(ctx);
}