"use strict";

var binaryHeap = require('./BinaryHeap.js');
var room = require('./Room.js');

class Matrix {
	constructor(width, height, value) {
		this.width = width;
		this.height = height;
		this.data = [];

		// create a zero filled matrix.
		for (var i = 0; i < width; i++) {
			this.data[i] = Array.apply(null, Array(height)).map(Number.prototype.valueOf, value);
		}
	}

	pad(n, width) {
	  	n = n + '';
	  	return n.length >= width ? n : new Array(width - n.length + 1).join(' ') + n;
	}

	toString() {
		var result = '';

		for (var i = 0; i < this.height; i++) {
			for (var j = 0; j < this.width; j++) {
				var d = this.data[j][i];
				var s = isFinite(d) ? d.toFixed(0) : "-";
				result = result + " " + this.pad(s, 2);
			}
			result = result + "\n";
		}
		return result;
	}
}

class Router {
	constructor(room) {
		this.room = room;

	}

	static allEqualFriction(c) {
		var result = -1;
		switch (c) {
			case room.CONTAINER:
			case room.PLAINS:
			case room.SWAMP:
			case room.EXIT:
				result = 1;
		}
		return result;
	}

	buildCostSurface(sources) {
		if (this.frictionSurface == undefined) {
			this.buildFrictionSurface();
		}

		this.costSurface = new Matrix(this.room.width, this.room.height, Infinity);

		var heap = new binaryHeap.BinaryHeap(function(s) { return s.v; });

		for (var s in sources) {
			var p = sources[s];
			this.costSurface.data[p.x][p.y] = 0;
			heap.push({x:p.x,y:p.y,v:0});
		}


		while (heap.size() > 0) {
			var e = heap.pop();

			// evaluate the eight neighbors.
			this.evaluateCell(e, {x:e.x - 1,y:e.y}, heap, 1);
			this.evaluateCell(e, {x:e.x + 1,y:e.y}, heap, 1);
			this.evaluateCell(e, {x:e.x,y:e.y - 1}, heap, 1);
			this.evaluateCell(e, {x:e.x,y:e.y + 1}, heap, 1);
			this.evaluateCell(e, {x:e.x - 1,y:e.y - 1}, heap, 1.414);
			this.evaluateCell(e, {x:e.x - 1,y:e.y + 1}, heap, 1.414);
			this.evaluateCell(e, {x:e.x + 1,y:e.y - 1}, heap, 1.414);
			this.evaluateCell(e, {x:e.x + 1,y:e.y + 1}, heap, 1.414);
		}
	}

	/**
	 * Build a cost surface for routing using the specified cost function.
	 */
	buildFrictionSurface(frictionFunction) {
		if (frictionFunction == undefined) {
			frictionFunction = Router.allEqualFriction
		}

		this.frictionSurface = new Matrix(this.room.width, this.room.height, -1);

		for (var x = 0; x < this.room.width; x++) {
			for (var y = 0; y < this.room.height; y++) {
				this.frictionSurface.data[x][y] = frictionFunction(this.room.get({x:x,y:y}));
			}
		}
		console.log(this.frictionSurface.toString());
	}

	evaluateCell(src, dest, heap, w) {
		if (dest.x >= 0 && dest.x < this.room.width && dest.y >= 0 && dest.y < this.room.height) {
			var srcF = this.frictionSurface.data[src.x][src.y];
			var destF = this.frictionSurface.data[dest.x][dest.y];
			if (destF >= 0) {
				var v = (srcF + destF) / 2 * w;
				var c = v + this.costSurface.data[src.x][src.y];

				var oldC = this.costSurface.data[dest.x][dest.y];
				if (c < oldC) {
					this.costSurface.data[dest.x][dest.y] = c;
					heap.push({x:dest.x,y:dest.y,v:c});
				}
			}
		}
	}

};

module.exports.Matrix = Matrix;
module.exports.Router = Router;
