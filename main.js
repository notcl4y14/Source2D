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

let update = function () {
	layout.update();
}

let render = function () {
	layout.render(ctx);
}