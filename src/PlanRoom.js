"use strict";

var template = [
"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
"r  rrrrrrrrr         rrrrrrrr              rrrrrr",
"E     rr       ..      rrrrrrrr          rrrrrrrr",
"E           .....      rrrrrrrX          rrrrrrrr",
"E           .....        rrrrrr             rrrrr",
"E              ..          r                  rrr",
"E              ..          r                  rrr",
"E                                             rrr",
"E                                             rrr",
"E           .....        rrrrrr             rrrrr",
"E           .....      Xrrrrrrr          rrrrrrrr",
"E     rr       ..      rrrrrrrr          rrrrrrrr",
"r  rrrrrrrrr         rrrrrrrr              rrrrrr",
"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr"];

class RoomPlan {	

    constructor(template) {
        this.currentRoom = template;
        this.CONTAINER = 'C';
        this.PLAINS = ' ';
        this.ROCK = 'r';
        this.STORAGE = 'S';
        this.SWAMP = '.';
        this.EXIT = 'E';
        this.EXTENSION = 'e';
    }

    dump(room) {
    	for (var y in room) {
    		console.log(room[y]);
    	}
    }

    find(character) {
    	var result = [];
        for (var row = 0; row < this.currentRoom.length; row++) {
        	var col = -1;
        	do {
        		col = this.currentRoom[row].indexOf(character, col + 1);
        		if (col >= 0) {
        			result.push({"x":col, "y":row});
        		}
        	} while (col >= 0 && col < this.width());
        }

        return result;
    }

    /**
     * Takes an array of positions and returns a location that is roughly in the middle.
     *
     * This can be refactored to use a cost surface and find the point in the cost surface that
     * minimizes all the distances.
     */
    findMiddle(positions) {
    	var mx = 0;
    	var my = 0;

    	for (var i = 0; i < positions.length; i++) {
    		mx = mx + positions[i].x;
    		my = my + positions[i].y;
    	}

    	var x = Math.floor(mx / positions.length);
    	var y = Math.floor(my / positions.length);


    	return {x: x, y: y};
    }

    /**
     * Given a position, find a nearby open cell with at least buffer cells around it.
     */
    findOpenCell(pos, criteria) {
    	var r = 0;

    	while (r < Math.max(this.height(), this.width())) {
    		for (var dr = -r; dr <= r; dr++) {
    			// look at the horizonal rows above and below by r.
    			if (criteria(pos.x + dr, pos.y + r)) return {x: pos.x + dr, y: pos.y + r};
    			if (criteria(pos.x + dr, pos.y - r)) return {x: pos.x + dr, y: pos.y - r};
    			// look at the vertical columns left and right by r, but skip the first/last b/c we
    			// already checked them above.
    			if (dr != -r && dr != r) {
    				if (criteria(pos.x + r, pos.y + dr)) return {x: pos.x + r, y: pos.y + dr};
    				if (criteria(pos.x - r, pos.y + dr)) return {x: pos.x - r, y: pos.y + dr};
    			}
    		}
    		r++;

    	}

    }

    findSources() { return this.find('X'); }

    get(pos) { return this.currentRoom[pos.y].charAt(pos.x); }

    height() { return this.currentRoom.length; }

    isBlocked(pos) {
    	if (pos.y < 0 || pos.x < 0 || pos.y >= this.height() || pos.x >= this.width()) {
    		return true;
    	}
    	var c = this.get(pos);
    	return c == this.ROCK || c == this.EXIT;
    }

    isOpen(pos) {
    	console.log(JSON.stringify(pos));
    	if (pos.y < 0 || pos.x < 0 || pos.y >= this.height() || pos.x >= this.width()) {
    		return false;
    	}
    	var c = this.get(pos);
    	console.log(">" + c + "<");
    	return c == this.PLAINS || c == this.SWAMP;
    }

    isOpenRect(upperLeft, lowerRight, debug=false) {
    	for (var x = upperLeft.x; x <= lowerRight.x; x++) {
    		for (var y = upperLeft.y; y <= lowerRight.y; y++) {
    			if (debug) console.log(x + ", " + y);
    			if (this.isOpen({x:x, y:y}) == false) {
    				return false;
    			}
    		}
    	}
    	return true;
    }

    planContainers() {
    	var pos = {};
    	var sources = this.findSources();
    	for (var i in sources) {
    		var s = sources[i];
    		for (var dx = -1; dx <= 1; dx++) {
    			pos.x = s.x + dx;
    			for (var dy = -1; dy <= 1; dy++) {
  					pos.y = s.y + dy;
    				if ((dx != 0 || dy != 0) && this.isBlocked(pos) == false) {
    					this.set(pos, this.CONTAINER);
    				}
    			}
    		}
    	}
    }

    planExtensions(center) {
    	var count = 30;
    	var t = this;
    	var pos = this.findOpenCell(center, function(x, y) {
    		var pos = {x:x,y:y};
    		if (x % 2 == y % 2 && t.isOpen(pos)) {
    			t.set(pos, t.EXTENSION);
    			count--;
    		}
    		if (count == 0) return true;
    	} );
    }

    planRoom() {
    	this.planContainers();
    	var storage = this.planStorage();
    	this.planExtensions(storage);
    }

    planStorage() {
    	var buffer = 2;
    	var desiredPos = this.findMiddle(this.findSources());
    	console.log(JSON.stringify(desiredPos));
    	var t = this;
    	var pos = this.findOpenCell(desiredPos, function(x, y) {
    		var upperLeft = {x:x-buffer,y:y-buffer};
    		var lowerRight = {x:x+buffer,y:y+buffer};
    		if (x % 2 == y % 2) return false;
    	 	return t.isOpenRect(upperLeft, lowerRight); 
    	} );
    	console.log(JSON.stringify(pos));
    	this.set(pos, this.STORAGE);
    	return pos;
    }

    set(pos, v)
    {
    	this.currentRoom[pos.y] = this.currentRoom[pos.y].substr(0, pos.x) + v + this.currentRoom[pos.y].substr(pos.x + 1);
    }

    width() {
    	return this.currentRoom[0].length;
    }
}


var rp = new RoomPlan(template);

rp.planRoom();

rp.dump(rp.currentRoom);
console.log(rp.get({x:22,y:2}));

var exports = {
    RoomPlan: RoomPlan
}
