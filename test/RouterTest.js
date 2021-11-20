"use strict";

var assert = require('assert');
var room = require('../src/Room.js');
var router = require('../src/Router.js');

var map = [
"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
"r  rrrrrrrr              rrrrrr",
"E    rrrrrrrr          rrrrrrrr",
"E    rrrrrrrX          rrrrrrrr",
"E      rrrrrr             rrrrr",
"E        r                  rrr",
"E        r                  rrr",
"E                           rrr",
"E                           rrr",
"E      rrrrrr             rrrrr",
"E    Xrrrrrrr          rrrrrrrr",
"E    rrrrrrrr          rrrrrrrr",
"r  rrrrrrrr              rrrrrr",
"rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr"];

describe('Router', function() {
    describe('#buildCostSurface', function() {
        it('should build a valid cost surface', function() {
        	console.log(room);
        	var testRoom = new room.Room(map);
            var uut = new router.Router(testRoom);
            uut.buildCostSurface([{x:19,y:2}]);

            console.log(uut.costSurface.toString());
        });
    });
});
