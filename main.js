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

let load = function () {
	assets = new Source2D.Assets();
	
	assets.loadGFX("controls_1", Source2D.loadImage("controls.png"));
	assets.loadGFX("controls_2", Source2D.loadImage("controls-1.png"));
	assets.loadGFX("controls_3", Source2D.loadImage("controls-2.png"));
	
	sprites = {
		controls: new Source2D.Sprite(
			[
				assets.getGFX("controls_1"),
				assets.getGFX("controls_2"),
				assets.getGFX("controls_3")
			], 12, true, false)
	};
	
	layout.addLayer(0, "main");
	layout.getLayer("main").objects.push(
		new Source2D.Object(
			sprites.controls,
			new Source2D.ShapeBox(300, 50, 157, 104, 0, ["center", "center"])
		)
	);
	layout.getLayer("main").objects.push( new Rectangle(10, 10, 50, 50) );

	layout.getLayer("main").objects[0].update = function () {
		let sin = Math.sin,
		    floor = Math.floor,
			now = performance.now();
		this.spr.update();
		this.angle = sin( now / 1000 ) * 10;
	}
}

// ==================================

let CreateCirclePolygon = function (radius) {
	let shape = [];

	let x = -radius;
	let y = -radius;

	for (let i = 0; i < 2 * Math.PI; i += 1) {
		x += radius * Math.cos(i);
		y += radius * Math.sin(i);
		console.log(x, y);

		shape.push([x, y]);
	}

	return shape;
}

// ==================================

let Rectangle = class extends Source2D.Object {
	constructor (x, y, width, height, angle = 0, pivot = ["center", "center"]) {
		super();
		this.shape = new Source2D.ShapeBox(x, y, width, height, angle, pivot);
	}
	
	update () {
		let left = input.isKeyDown("ArrowLeft");
		let right = input.isKeyDown("ArrowRight");
		let up = input.isKeyDown("ArrowUp");
		let down = input.isKeyDown("ArrowDown");

		let forward = input.isKeyDown("KeyW");
		let backward = input.isKeyDown("KeyS");
		let rotate_left = input.isKeyDown("KeyA");
		let rotate_right = input.isKeyDown("KeyD");

		let dirX = (right - left);
		let dirY = (down - up);

		let dirForward = (forward - backward);
		let dirAngle = (rotate_right - rotate_left);

		this.x += dirX;
		this.y += dirY;

		this.angle += dirAngle;
		this.shape.moveAtAngle(dirForward);

		// this.shape.width = Math.sin(Date.now());
	}

	render (ctx) {
		let translateX = -this.shape.Pivot()[0];
		let translateY = -this.shape.Pivot()[1];

		let pivotX = this.x + this.shape.Pivot()[0];
		let pivotY = this.y + this.shape.Pivot()[1];

		let x = pivotX + translateX;
		let y = pivotY + translateY;

		ctx.strokeStyle = "white";
		ctx.save();

		ctx.translate(x, y);
		ctx.rotate(ToRadians(this.angle));

		ctx.fillStyle = "black";
		ctx.fillRect(translateX, translateY, this.shape.width, this.shape.height);

		ctx.restore();

		this.shape.render(ctx);
	}
}

let Circle = class extends Source2D.Object {
	constructor (x, y, radius = 0, angle = 0, pivot = ["center", "center"]) {
		super();
		this.shape = new Source2D.Shape(x, y, CreateCirclePolygon(radius), angle, pivot);
	}
	
	update () {
		// this.shape.width = Math.sin(Date.now());
	}

	render (ctx) {
		this.shape.render(ctx);
	}
}

// ==================================

let assets = {};
let sprites = {};

let input = new Source2D.Input();
let layout = new Source2D.Layout();

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
	if (!assets.isLoaded) {	
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = "white";
		ctx.fillText("Loading...", 0, 10);
		return;
	}

	layout.render(ctx);
}