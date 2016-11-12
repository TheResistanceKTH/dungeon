/**
 * Created by TheSpine on 12/11/16.
 */

var name;
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');
var squareSize = 100;
var hasCreatedChar = false
var time = Date.now();

document.onkeydown = function (e) {
    var nowTime = Date.now();
    if (nowTime - time < 500) {
        return;
    }
    if (!hasCreatedChar) {
        return;
    }
    if(e.keyCode == 87) {
        time = nowTime
        moveChar(0, -1);
    }
    else if (e.keyCode == 65) {
        time = nowTime
        moveChar(-1,0);
    }
    else if (e.keyCode == 83) {
        time = nowTime
        moveChar(0, 1);
    }
    else if (e.keyCode == 68) {
        time = nowTime
        moveChar(1, 0);
    }
}

function moveChar(dx,dy) {
    $.ajax({
        url: "/foo?command=move&dx=" + dx + "&dy=" + dy + "&name=" + name,
        context: document.body
    })
}

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