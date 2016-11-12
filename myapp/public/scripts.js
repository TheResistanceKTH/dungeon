/**
 * Created by TheSpine on 12/11/16.
 */


var name;
function moveChar(dx,dy) {
    $.ajax({
        url: "/foo?command=move&dx=" + dx + "&dy=" + dy + "&name=" + name,
        context: document.body
    })
}

document.onkeydown = function (e) {
    if (!hasCreatedChar) {
        return;
    }
    if(e.keyCode == 87) {
        moveChar(0, -1);
    }
    else if (e.keyCode == 65) {
        moveChar(-1,0);
    }
    else if (e.keyCode == 83) {
        moveChar(0, 1);
    }
    else if (e.keyCode == 68) {
        moveChar(1, 0);
    }
}

var hasCreatedChar = false
function createChar(inputName) {
    if (event.keyCode === 13 && !hasCreatedChar) {
        name = inputName
        $.ajax({
            url: "/foo?command=create&name=" + name,
            context: document.body
        }).done(function() {
        });
        hasCreatedChar = true;
    }
}

function scan() {
    $.ajax({
        url: "/foo?command=scan&name=" + name,
        context: document.body
    }).done(function(arg) {
        drawDungeon(arg['Area']);
    });
}

setInterval(function () {
    if (hasCreatedChar) {
        scan()
    }
}, 100);

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');
var squareSize = 100;

function drawDungeon(inputArray) {
    ctx.clearRect(0, 0, canvas.width, canvas.width);
    for (i = 0; i < inputArray.length; i++) {
        var line = inputArray[i];
        for (j = 0; j < line.length; j++) {
            var square = line[j];
            if (square === 1) {
                ctx.fillRect(squareSize * i, squareSize * j, squareSize, squareSize);
            }
            if (square === 0) {
                ctx.strokeRect(squareSize * i, squareSize * j, squareSize, squareSize);
            }
            if (square === 2) {
                ctx.fillStyle="#FF0000";
                ctx.fillRect(squareSize * i, squareSize * j, squareSize, squareSize)
                ctx.fillStyle="#000000";
            }
        }
    }
}