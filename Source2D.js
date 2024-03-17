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