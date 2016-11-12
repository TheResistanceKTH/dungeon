/**
 * Created by TheSpine on 12/11/16.
 */

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

var players = {}
var occupiedPos = {}
var Dungeon = require("dungeon-generator")
var url = require('url')
var express = require('express')
var app = express()

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

dungeon.generate()

app.get('/', function (req, res) {
    res.send('Hello World!')
})

function createCharacter(x, y, name) {
    players[name] = new Character(x, y, name);
}

function moveCharacter(dx, dy, name) {
    var x = players[name].x;
    var y = players[name].y;
    var newX = x + dx;
    var newY = y + dy;
    console.log(newX);
    console.log(newY);
    if (output[newX][newY] === 0) { //not walking into wall
        output[x][y] = 0;
        output[newX][newY] = 2;
        players[name].move(dx, dy);
    }
}

var output = [];
var floors = [];
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

createDungeon()
app.get('/foo', function(req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    if (query.command !== 'scan') {
        console.log("hej")
    } else {
        console.log("scan?")
    }
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
    }
    if (query['command'] === 'move') {
        console.log("Am i here?")
        var dX = parseInt(query['dx']);
        var dY = parseInt(query['dy']);
        moveCharacter(dX, dY, query['name'])
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
        //console.log(sendArray)
        var foo = {Area: sendArray}
        res.send(foo)
    }
})

app.get('/bar', function (req, res) {
    res.send("ping")
})

app.use(express.static('public'));

var server = app.listen(3000);