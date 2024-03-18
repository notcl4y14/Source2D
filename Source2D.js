let ToRadians = function(degrees) {
	return degrees * Math.PI / 180;
}

let Source2D = {};

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
	constructor (x, y, polygon = [], angle = 0) {
		this.x = x;
		this.y = y;
		this.polygon = polygon;
		this.angle = angle;
		// this.width = width;
		// this.height = height;
		// this.radius = radius;
	}

	get centerX() {
		return this.x + this.width / 2;
	}

	get centerY() {
		return this.y + this.height / 2
	}

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

	moveAtAngle(speed, angle) {
		angle = angle || this.angle;

		let dirX = Math.cos(ToRadians(angle)) * speed;
		let dirY = Math.sin(ToRadians(angle)) * speed;

		this.x += dirX;
		this.y += dirY;
	}

	render (ctx) {
		let translateX = this.centerX;
		let translateY = this.centerY;

		ctx.strokeStyle = "white";
		// ctx.strokeRect(this.x, this.y, this.width, this.height);
		// ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		// ctx.stroke();

		ctx.save();
		
		ctx.translate(translateX, translateY);
		ctx.rotate(ToRadians(this.angle));

			ctx.beginPath();
			ctx.moveTo(
				this.polygon[0][0],
				this.polygon[0][1]
			);
			for (let i = 1; i < this.polygon.length; i += 1) {
				let line = this.polygon[i];
				let x = line[0];
				let y = line[1];
				ctx.lineTo(x, y);
			}
			ctx.stroke();
			ctx.closePath();

		ctx.restore();
	}

	render_angle(ctx, text = false, length = 25) {
		let dirX = Math.cos(ToRadians(this.angle)) * length;
		let dirY = Math.sin(ToRadians(this.angle)) * length;

		// console.log(ToRadians(this.angle));
		// console.log(Math.cos(ToRadians(this.angle)));
		// console.log(dirX);

		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(
			this.centerX,
			this.centerY
		);
		ctx.lineTo(
			this.centerX + dirX,
			this.centerY + dirY
		);
		ctx.stroke();
		ctx.closePath();

		if (text) {
			ctx.fillStyle = "white";
			ctx.fillText(this.angle + " Deg", this.centerX, this.centerY);
		}
	}
}

Source2D.ShapeBox = class extends Source2D.Shape {
	constructor (x, y, width, height, angle = 0) {
		super(x, y);
		this.polygon = [
			[0, 0],
			[width, 0],
			[width, height],
			[0, height],
			[0, 0]
		];
		this.angle = angle;
		// this.width = width;
		// this.height = height;
	}

	render (ctx, text = true, renderAngle = true, angleText = true, length = 25) {

		let translateX = this.centerX;
		let translateY = this.centerY;

		// ctx.strokeStyle = "blue";
		// ctx.strokeRect(translateX, translateY, 1, 1);

		ctx.strokeStyle = "white";
		ctx.save();

		ctx.translate(translateX, translateY);
		ctx.rotate(ToRadians(this.angle));

		ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

		ctx.restore();

		if (text) {
			let x = Math.floor(this.x);
			let y = Math.floor(this.y);
			ctx.fillStyle = "white";
			ctx.fillText(x + "; " + y, this.x, this.y - 5);
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

	set x (x) {
		this.shape.x = x;
	}

	set y (y) {
		this.shape.y = y;
	}
}