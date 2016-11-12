/**
 * Created by TheSpine on 12/11/16.
 */
var Dungeon = require("dungeon-generator")
var posix = require('posix')
var express = require('express')
var url = require('url')

var players = {}
var occupiedPos = {}
var app = express()
var server = app.listen(3000);
var output = [];
var floors = [];
var scanCount = 0;

app.use(express.static('public'));

var dungeon = new Dungeon({
    size: [100, 100],
    rooms: {
        initial: {
            min_size: [2, 3],
            max_size: [5, 6],
            max_exits: 1,
            position: [0, 0] //OPTIONAL pos of initial room
        },
        any: {
            min_size: [2, 3],
            max_size: [5, 6],
            max_exits: 4
        }
    },
    max_corridor_length: 6,
    min_corridor_length: 2,
    corridor_density: 0.5, //corridors per room
    symmetric_rooms: false, // exits must be in the center of a wall if true
    interconnects: 1, //extra corridors to connect rooms and make circular paths. not 100% guaranteed
    max_interconnect_length: 10,
    room_count: 10
});

posix.setrlimit('nofile', { soft: 10000});
dungeon.generate()
createDungeon()

class Character{
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.name = name;
    }
    move(dX, dY) {
        this.x += dX;
        this.y += dY;
    }
}


function createCharacter(x, y, name) {
    players[name] = new Character(x, y, name);
}

function moveCharacter(dx, dy, name) {
    var x = players[name].x;
    var y = players[name].y;
    var newX = x + dx;
    var newY = y + dy;
    if (output[newX][newY] === 0) { //not walking into wall
        output[x][y] = 0;
        output[newX][newY] = 2;
        players[name].move(dx, dy);
    }
}


function createDungeon() {
    for (i = 0; i < dungeon.size[0]; i++) {
        var temp = [];
        for (j = 0; j < dungeon.size[1]; j++) {
            if (dungeon.walls.get([i, j]) === true) {
                temp.push(1);
            }
            else if (dungeon.walls.get([i, j]) === false) {
                temp.push(0);
                floors.push([i,j]);
                occupiedPos[[i,j]] = false;
            }
        }
        output.push(temp)
    }
}

app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.get('/foo', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    if (query['command'] === 'create') {
        do {
            var position = floors[Math.floor(Math.random()*floors.length)];
            var x = position[0]
            var y = position[1]
        }
        while (occupiedPos[[x,y]] === true);
        createCharacter(x, y, query['name']);
        occupiedPos[x,y] =  true
        output[x][y] = 2;
        res.send();
    }
    if (query['command'] === 'move') {
        var dX = parseInt(query['dx']);
        var dY = parseInt(query['dy']);
        moveCharacter(dX, dY, query['name'])
        res.send();
    }
    if (query['command'] === 'scan') {
        var sendArray = [];
        var x = players[query['name']].x;
        var y = players[query['name']].y;
        for (i = -3; i < 4; i++) {
            var line = []
            for (j = -3; j < 4; j++) {
                try {
                    line.push(output[x + i][y + j])
                } catch(e) {
                    line.push(1)
                }
            }
            sendArray.push(line);
        }
        var foo = {Area: sendArray}
        res.send(foo)
    }
})

