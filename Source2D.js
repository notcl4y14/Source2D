let ToRadians = function(degrees) {
	return degrees * Math.PI / 180;
}

let Source2D = {};

Source2D.Vector = class {
	constructor (x, y) {
		this.x = x;
		this.y = y;
	};

	// Copy the properties from another vector
	copy (other) {
		this.x = other.x;
		this.y = other.y;
		return this;
	}

	// Rotate the vector by 90 degrees
	perp () {
		var x = this.x;
		this.x = this.y;
		this.y = -x;
		return this;
	};

	reverse () {
		// Nah, ima make it _ * -1
		// this.x = -this.x;
		// this.y = -this.y;

		this.x = this.x * -1;
		this.y = this.y * -1;
		return this;
	};

	normalize () {
		var len = this.len();
		if (len > 0) {
		  this.x = this.x / len;
		  this.y = this.y / len;
		}
		return this;
	};
	
	dot (other) {
		return (this.x * other.x) + (this.y * other.y);
	};

	// Project onto another vector
	project (other) {
		var amt = this.dot(other) / other.len2();
		this.x = amt * other.x;
		this.y = amt * other.y;
		return this;
	};

	// Get the squared length of the vector
	len2 () {
		return this.dot(this);
	};

	// Get the length of the vector
	len () {
		return Math.sqrt(this.len2());
	};
}

Source2D.loadImage = function (src) {
	let gfx = new Image();
	gfx.src = src;
	return gfx;
}

Source2D.Sprite = class {
	constructor (frames = [], interval = 2, loop = false, paused = false) {
		this.frame = 0;
		this.frames = frames;
		this.interval = interval;
		this.loop = loop;
		this.paused = paused;

		this.timer = 0;
	}

	getFrame (frame = this.frame) {
		return this.frames[frame];
	}

	// TODO: Fix this (frame goes to the limit of the frames)
	update () {
		if (this.paused) return;
		this.timer += 1;

		if (this.timer > this.interval) {
			this.timer = 0;
			this.frame += 1;
		}

		if (this.frame >= this.frames.length) {
			this.frame = this.frames.length - 1;
			this.paused = true;

			if (this.loop) {
				this.frame = 0;
				this.paused = false;
			}
		}
	}
	
	render (ctx, x, y) {
		let gfx = this.getFrame();

		if (gfx.complete) {
			ctx.drawImage(gfx, x, y);
		} else {
			ctx.fillText("Invalid Image Data", x, y);
		}
	}
}

Source2D.Assets = class {
	constructor () {
		this.gfx = {};
		this.sfx = {};
		this.mus = {};
		this.spr = {};
	}

	// ========================================

	get isLoaded () {
		return this.gfx_isLoaded &&
		       this.sfx_isLoaded &&
			   this.mus_isLoaded;
	}
	
	get gfx_isLoaded () {
		for (let [_, gfx] of Object.entries(this.gfx)) {
			if (!gfx.complete) return false;
		}

		return true;
	}
	
	get sfx_isLoaded () {
		for (let [_, sfx] of Object.entries(this.sfx)) {
			if (!sfx.complete) return false;
		}
		
		return true;
	}
	
	get mus_isLoaded () {
		for (let [_, mus] of Object.entries(this.mus)) {
			if (!mus.complete) return false;
		}
		
		return true;
	}

	// ========================================

	unloadGFX (gfx) {
		delete this.gfx[gfx];
	}
	unloadSFX (sfx) {
		delete this.sfx[sfx];
	}
	unloadMusic (mus) {
		delete this.mus[mus];
	}

	// ========================================

	loadGFX (name, gfx) {
		let mode = typeof(gfx) == "string";
		if (mode === true) gfx = Source2D.loadImage(gfx);

		this.gfx[name] = gfx;
	}

	loadSFX (name, sfx) {
		let mode = typeof(sfx) == "string";
		if (mode == true) sfx = new Audio(sfx);

		this.sfx[name] = sfx;
	}

	loadMusic (name, mus) {
		let mode = typeof(mus) == "string";
		if (mode == true) mus = new Audio(mus);

		this.mus[name] = mus;
	}

	loadSprite (name, spr) {
		this.spr[name] = spr;
	}

	// ========================================

	getGFX (gfx) {
		return this.gfx[gfx];
	}

	getSFX (sfx) {
		return this.sfx[sfx];
	}

	getMusic (mus) {
		return this.mus[mus];
	}

	getSprite (spr) {
		return this.spr[spr];
	}
}

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
		return this.layers[index];
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
	constructor (pos, polygon = [], width = 1, height = 1, angle = 0, pivot = new Source2D.Vector("center", "center")) {
		this.pos = pos || new Source2D.Vector(0, 0);
		this.polygon = polygon;
		this.width = width;
		this.height = height;
		this.angle = angle;
		this.pivot = pivot;

		this.vel = {x: 0, y: 0, angle: 0};
	}

	// ========================================

	get x () {
		return this.pos.x;
	};

	get y () {
		return this.pos.y;
	};

	get centerX() {
		return this.x + this.width / 2;
	};

	get centerY() {
		return this.y + this.height / 2
	};

	set x (x) {
		this.pos.x = x;
	};

	set y (y) {
		this.pos.y = y;
	};

	// ========================================

	applyVelocity () {
		this.x += this.vel.x;
		this.y += this.vel.y;
		this.angle += this.vel.angle;
	};

	applyGravity (x, y) {
		this.vel.x += x;
		this.vel.y += y;
	};

	addVelocity (x, y, angle = 0) {
		this.vel.x += x;
		this.vel.y += y;
		this.vel.angle += angle;
	};

	addFriction (x, y, angle = 0) {
		this.vel.x -= x;
		this.vel.y -= y;
		this.vel.angle -= angle;
	};
	
	stopVelocity (x = true, y = true, angle = false) {
		if (x) this.vel.x = 0;
		if (y) this.vel.y = 0;
		if (angle) this.vel.angle = 0;
	};

	// ========================================
	
	Pivot (pivot = this.pivot) {
		let x = pivot.x == "center" ? this.width / 2 : pivot.x;
		let y = pivot.y == "center" ? this.height / 2 : pivot.y;
		return {x, y};
	};

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
	};

	// ========================================

	moveAtAngle(speed, angle) {
		angle = angle || this.angle;

		let dirX = Math.cos(ToRadians(angle)) * speed;
		let dirY = Math.sin(ToRadians(angle)) * speed;

		this.x += dirX;
		this.y += dirY;
	};

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
				let x = line.x * this.width + translateX;
				let y = line.y * this.height + translateY;
				ctx.lineTo(x, y);
			}
			ctx.stroke();
			ctx.closePath();

		ctx.restore();
		
		if (angle) this.render_angle(ctx, true, 100);
	};

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
	};
}

Source2D.ShapeBox = class extends Source2D.Shape {
	constructor (pos, width, height, angle = 0, pivot = new Source2D.Vector("center", "center")) {
		super(pos, [], width, height, angle, pivot);
		
		this.polygon = [
			new Source2D.Vector(0, 0),
			new Source2D.Vector(1, 0),
			new Source2D.Vector(1, 1),
			new Source2D.Vector(0, 1),
			new Source2D.Vector(0, 0)
		];
		this.angle = angle;
		this.pivot = pivot;
	}

	render (ctx, text = true, renderAngle = true, angleText = true, length = 25) {

		// I SOMEHOW MANAGED TO FIX THIS AFTER ADDING PIVOTS
		let translateX = -this.Pivot().x;
		let translateY = -this.Pivot().y;

		let pivotX = this.x - this.Pivot().x;
		let pivotY = this.y - this.Pivot().y;

		let x = pivotX - translateX;
		let y = pivotY - translateY;

		// ctx.strokeStyle = "blue";
		// ctx.strokeRect(x, y, 1, 1);

		ctx.strokeStyle = "white";
		ctx.fillStyle = "rgba(0,0,255,0.25)";
		ctx.save();

		ctx.translate(x, y);
		ctx.rotate(ToRadians(this.angle));

		ctx.fillRect(translateX, translateY, this.width, this.height);
		ctx.strokeRect(translateX, translateY, this.width, this.height);

		ctx.beginPath();
		ctx.moveTo(translateX, translateY);
		ctx.lineTo(translateX + this.width, translateY + this.height);
		ctx.closePath();

		ctx.stroke();

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

	update () {
		this.spr.update();
	}

	render (ctx) {
		this.renderSprite(ctx);
	}

	renderSprite (ctx) {
		
		let translateX = -this.shape.Pivot().x;
		let translateY = -this.shape.Pivot().y;

		let pivotX = this.x + this.shape.Pivot().x;
		let pivotY = this.y + this.shape.Pivot().y;

		let x = pivotX + translateX;
		let y = pivotY + translateY;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(ToRadians(this.angle));

		if (this.spr) this.spr.render(ctx, translateX, translateY);

		ctx.restore();
	}
}