let ToRadians = function(degrees) {
	return degrees * Math.PI / 180;
}

// AKA Vector2D
let Position = function (x, y) {
	return {x, y};
}

let Source2D = {};

Source2D.Input = class {
	constructor () {
		this.keys = {};
		this.mouse = {};
		
		window.onkeydown = (e) => {
			this.keys[e.code] = true;
		}
		window.onkeyup = (e) => {
			this.keys[e.code] = false;
		}

		window.onmousedown = (e) => {
			this.mouse[e.button] = true;
		}
		window.onmouseup = (e) => {
			this.mouse[e.button] = false;
		}
	}

	isKeyDown (key) {
		return this.keys[key] == true;
	}

	isKeyUp (key) {
		return this.keys[key] === false;
	}

	isMouseDown (button) {
		return this.mouse[button] == true;
	}

	isMouseUp (button) {
		return this.mouse[button] === false;
	}
}

Source2D.Layout = class {
	constructor (layers = []) {
		this.layers = layers;
	}

	// ========================================

	addLayer (index, name) {
		this.layers[index] = new Source2D.Layer(name);
	}

	removeLayer (name) {
		let index = this.getLayerIndex(name);
		this.layers.splice(index, 1);
	}
	
	getLayer (name) {
		for (let layer of this.layers) {
			if (layer.name == name) return layer;
		}

		return null;
	}

	getLayerIndex (name) {
		for (let [index, _] of this.layers) {
			if (layer.name == name) return index;
		}

		return null;
	}

	// ========================================

	update () {
		this.layers.forEach((layer) => layer.update());
	}

	render (ctx) {
		this.layers.forEach((layer) => layer.render(ctx));
	}
}

Source2D.Layer = class {
	constructor (name) {
		this.name = name;
		this.objects = [];
	}

	// ========================================

	update () {
		this.objects.forEach((obj) => obj.update());
	}

	render (ctx) {
		this.objects.forEach((obj) => obj.render(ctx));
	}
}

Source2D.Shape = class {
	constructor (x, y, polygon = [], angle = 0, pivot = ["center", "center"]) {
		this.x = x;
		this.y = y;
		this.polygon = polygon;
		this.original_polygon = polygon;
		this.angle = angle;
		this.pivot = pivot;
	}

	// ========================================

	get centerX() {
		return this.x + this.width / 2;
	}

	get centerY() {
		return this.y + this.height / 2
	}

	// ========================================

	get width() {
		let max = 0;

		for (let line of this.polygon) {
			if (line[0] > max) max = line[0];
		}

		return max;
	}

	get height() {
		let max = 0;

		for (let line of this.polygon) {
			if (line[1] > max) max = line[1];
		}

		return max;
	}

	// ========================================

	// Broken Ig, don't use this
	// set width (width) {
	// 	let sides = [];

	// 	for (let i = 0; i < this.polygon.length; i += 1) {
	// 		let line = this.polygon[i];
	// 		sides[i] = line[0];
	// 	}

	// 	for (let i = 0; i < sides.length; i += 1) {
	// 		if (!sides[i]) continue;
	// 		this.polygon[i][0] = this.original_polygon[i][0] * width;
	// 	}
	// }

	// ========================================
	
	Pivot (pivot = this.pivot) {
		let x = pivot[0] == "center" ? this.width / 2 : pivot[0];
		let y = pivot[1] == "center" ? this.height / 2 : pivot[1];
		return [x, y];
	}

	// ========================================

	getBoundingBox (side) {
		switch (side) {
			case "left": return this.x - this.width / 2;
			case "right": return this.width;
			case "up":
			case "top":
				return this.y - this.height / 2;
			case "down":
			case "bottom":
				return this.height;
		}
	}

	// ========================================

	moveAtAngle(speed, angle) {
		angle = angle || this.angle;

		let dirX = Math.cos(ToRadians(angle)) * speed;
		let dirY = Math.sin(ToRadians(angle)) * speed;

		this.x += dirX;
		this.y += dirY;
	}

	// ========================================

	render (ctx, angle = true) {
		let translateX = -this.Pivot().x;
		let translateY = -this.Pivot().y;

		let pivotX = this.x + this.Pivot().x;
		let pivotY = this.y + this.Pivot().y;

		let x = pivotX + translateX;
		let y = pivotY + translateY;

		ctx.strokeStyle = "white";
		ctx.save();
		
		ctx.translate(x, y);
		ctx.rotate(ToRadians(this.angle));

			ctx.beginPath();
			ctx.moveTo(
				this.polygon[0].x + translateX,
				this.polygon[0].y + translateY
			);
			for (let i = 1; i < this.polygon.length; i += 1) {
				let line = this.polygon[i];
				let x = line.x + translateX;
				let y = line.y + translateY;
				ctx.lineTo(x, y);
			}
			ctx.stroke();
			ctx.closePath();

		ctx.restore();
		
		if (angle) this.render_angle(ctx, true, 100);
	}

	render_angle(ctx, text = false, length = 25) {
		let dirX = Math.cos(ToRadians(this.angle)) * length;
		let dirY = Math.sin(ToRadians(this.angle)) * length;

		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(
			this.x,
			this.y
		);
		ctx.lineTo(
			this.x + dirX,
			this.y + dirY
		);
		ctx.stroke();
		ctx.closePath();

		if (text) {
			ctx.fillStyle = "white";
			ctx.fillText(this.angle + " Deg", this.x, this.y);
		}
	}
}

Source2D.ShapeBox = class extends Source2D.Shape {
	constructor (x, y, width, height, angle = 0, pivot = ["center", "center"]) {
		super(x, y);

		// Ok, I think maybe changing these "width"-s and "height"-s with 1's
		// And then multiply them by custom width and height
		// TODO: Change this
		this.polygon = [
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0]
		];
		this.angle = angle;
		this.pivot = pivot;
	}

	render (ctx, text = true, renderAngle = true, angleText = true, length = 25) {

		// I SOMEHOW MANAGED TO FIX THIS AFTER ADDING PIVOTS
		let translateX = -this.Pivot()[0];
		let translateY = -this.Pivot()[1];

		let pivotX = this.x + this.Pivot()[0];
		let pivotY = this.y + this.Pivot()[1];

		let x = pivotX + translateX;
		let y = pivotY + translateY;

		// ctx.strokeStyle = "blue";
		// ctx.strokeRect(x, y, 1, 1);

		ctx.strokeStyle = "white";
		ctx.save();

		ctx.translate(x, y);
		ctx.rotate(ToRadians(this.angle));

		ctx.strokeRect(translateX, translateY, this.width, this.height);

		ctx.restore();

		if (text) {
			let x = Math.floor(this.x);
			let y = Math.floor(this.y);
			let _x = this.getBoundingBox("left");
			let _y = this.getBoundingBox("up");
			ctx.fillStyle = "white";
			ctx.fillText(x + "; " + y, _x, _y - 5);
		}

		if (renderAngle) this.render_angle(ctx, angleText, length);
	}
}

Source2D.Object = class {
	constructor (spr, shape) {
		this.spr = spr;
		this.shape = shape;
	}

	// ========================================

	get x () {
		return this.shape.x;
	}

	get y () {
		return this.shape.y;
	}

	get angle () {
		return this.shape.angle;
	}

	// ========================================

	set x (x) {
		this.shape.x = x;
	}

	set y (y) {
		this.shape.y = y;
	}

	set angle (angle) {
		this.shape.angle = angle;
	}

	// ========================================

	update () {}

	render () {
		this.renderSprite();
	}

	renderSprite () {
		
		// let translateX = -this.shape.Pivot()[0];
		// let translateY = -this.shape.Pivot()[1];

		// let pivotX = this.x + this.shape.Pivot()[0];
		// let pivotY = this.y + this.shape.Pivot()[1];

		// let x = pivotX + translateX;
		// let y = pivotY + translateY;

		// ctx.translate(x, y);
		// ctx.rotate(ToRadians(this.angle));
		
		// if (this.spr) ctx.drawImage(this.spr, translateX, translateY);
		// else ctx.fillText("Invalid Image Data", translateX, translateY);

		// ctx.restore();
		
		if (this.spr) ctx.drawImage(this.spr, this.x, this.y);
		else ctx.fillText("Invalid Image Data", this.x, this.y);
	}
}