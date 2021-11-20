"use strict";

module.exports.CONTAINER = 'C';
module.exports.PLAINS = ' ';
module.exports.ROCK = 'r';
module.exports.STORAGE = 'S';
module.exports.SWAMP = '.';
module.exports.EXIT = 'E';
module.exports.EXTENSION = 'e';

class Room {
	constructor(map) {
		this.map = map;
		this.width = map[0].length;
		this.height = map.length;
	}

    dump() {
    	for (var y in this.map) {
    		console.log(this.map[y]);
    	}
    }

    get(pos) { return this.map[pos.y].charAt(pos.x); }

    set(pos, v)
    {
    	this.map[pos.y] = this.map[pos.y].substr(0, pos.x) + v + this.map[pos.y].substr(pos.x + 1);
    }

};

module.exports.Room = Room;
