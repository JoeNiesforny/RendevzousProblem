/*
    Problem is precision from mathematic function and time step.
    Refresh ratio sets time steps for robots. If it is set to low
    value, than way of robots on circle is broken by precision.
*/
var interval;
const refreshRatio = 100;
const maxSpeed = 100;
var player;
var d;
var startTime = 0;
var ctx;
var road = [];
var abandon = false;

function set() {
    init(true);
}

function loadCanvas(){
    var canvas = document.getElementById('mainCanvas');
    window.addEventListener('resize', resizeCanvas, false);
    init();
    function resizeCanvas() {
            canvas.width = window.innerWidth-window.innerWidth*0.1;
            canvas.height = window.innerHeight-window.innerHeight*0.3;
            draw();
    }
    resizeCanvas();
}

function init(set = false) {
    clearTimeout(interval);
    road = [];
    abandon = false;
    var canvas = document.getElementById('mainCanvas');
    height = canvas.height;
    width = canvas.width;
    ctx = document.getElementById('mainCanvas').getContext('2d');
    player = [{
        x : Math.round(Math.random()*1000)%width,
        y : Math.round(Math.random()*1000)%height,
        x0 : 0,
        y0 : 0,
        color : '#0066ff',
        sight_color : '#80ccff',
        sight_length : 10,
        speed : Math.round(Math.random()*1000%maxSpeed),
        length : 0,
        rotation : 0,
        d : 0,
    }, {
        x : Math.round(Math.random()*1000)%width,
        y : Math.round(Math.random()*1000)%height,
        x0 : 0,
        y0 : 0,
        color : '#ff0000',
        sight_color : '#ff704d',
        sight_length : 10,
        speed : Math.round(Math.random()*1000%maxSpeed),
        length : 0,
        rotation : 0,
        d : 0,
    }];

    if (set) {
        player[0].x = document.getElementById('p1.x0').value - 0;
        player[0].y = document.getElementById('p1.y0').value - 0;
        player[1].x = document.getElementById('p2.x0').value - 0;
        player[1].y = document.getElementById('p2.y0').value - 0;
        player[0].speed = document.getElementById('p1.speed').value - 0;
        player[1].speed = document.getElementById('p2.speed').value - 0;
    }

    for (i = 0; i < 2; i++) {
        player[i].x0 = player[i].x;
        player[i].y0 = player[i].y;
    }

    d = distPlayer(player);
    document.getElementById('dist').value = d;
    document.getElementById('distBegin').value = d;
    document.getElementById('timer').value = 0;
    document.getElementById('p1.x0').value = player[0].x0;
    document.getElementById('p1.y0').value = player[0].y0;
    document.getElementById('p2.x0').value = player[1].x0;
    document.getElementById('p2.y0').value = player[1].y0;
    document.getElementById('p1.speed').value = player[0].speed;
    document.getElementById('p2.speed').value = player[1].speed;

    player[0].d = Math.round((player[0].speed * d) / (player[0].speed + player[1].speed));
    player[1].d = Math.round((player[1].speed * d) / (player[0].speed + player[1].speed));

    player[0].rotation = player[0].speed / player[0].d;
    player[1].rotation = player[1].speed / player[1].d;
    player[1].speed = -player[1].speed;

    console.log("d=" + d + ", d1=" + player[0].d + " d2=" + player[1].d);
    console.log("player 0 x=" + player[0].x + ", y=" + player[0].y + " speed=" + player[0].speed + " rotation=" + player[0].rotation);
    console.log("player 1 x=" + player[1].x + ", y=" + player[1].y + " speed=" + player[1].speed + " rotation=" + player[1].rotation);
    console.log("player 0 x0=" + player[0].x0 + ", y0=" + player[0].y0);
    console.log("player 1 x0=" + player[1].x0 + ", y0=" + player[1].y0);

    // Set speed to refresh ratio
    for (i = 0; i < 2; i++) {
        player[i].speed /= refreshRatio;
        player[i].rotation /= refreshRatio;
    }

    ctx.clearRect(0, 0, width, height);

    for (i = 0; i < 2; i++)
        drawPlayer(player[i]);
}


function start() {
    if (d <= player[0].sight_length + player[1].sight_length)
        return;
    if (abandon)
        abandon = false;
    else
        startTime = performance.now();
    interval = setInterval(draw, 1000/refreshRatio); // 1 secound divided by refresh ratio
}

function stop() {
    abandon = true;
}

function draw() {
    var canvas = document.getElementById('mainCanvas');
    height = canvas.height;
    width = canvas.width;
    ctx = document.getElementById('mainCanvas').getContext('2d');

    for (i = 0; i < 2; i++)
        move(player[i]);

    ctx.clearRect(0, 0, width, height);

    for (i = 0; i < 2; i++)
        drawPlayer(player[i]);

    document.getElementById('timer').value = performance.now() - startTime;
    document.getElementById('dist').value = d = distPlayer(player);
    document.getElementById('p1.length').value = player[0].length;
    document.getElementById('p2.length').value = player[1].length;

    if (d <= player[0].sight_length + player[1].sight_length || abandon) {
        clearTimeout(interval);
        // Draw a road if players meet.
        for (i = 0; i < road.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(road[i][0], road[i][1]);
            ctx.lineTo(road[i+1][0], road[i+1][1]);
            ctx.stroke()
            ctx.moveTo(road[i][2], road[i][3]);
            ctx.lineTo(road[i+1][2], road[i+1][3]);
            ctx.stroke()
            ctx.closePath();
        }
    }

    road.push([player[0].x, player[0].y, player[1].x, player[1].y]);
}

function drawPlayer(player) {
    ctx.beginPath();
    ctx.fillStyle = player.sight_color;
    ctx.arc(player.x, player.y, player.sight_length, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.arc(player.x, player.y, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
}

function distPlayer(players) {
    return distTP(players[0].x, players[0].y, players[1].x, players[1].y);
}

function move(player) {
    if (player.d !== 0)
    {
        if (player.length >= player.d) {
            prevx = player.x;
            prevy = player.y;
            console.log("prevx = " + prevx + " prevy = " + prevy);
            player.x = Math.cos(player.rotation) * (player.x - player.x0) -
                       Math.sin(player.rotation) * (player.y - player.y0) +
                       player.x0;
            player.y = Math.sin(player.rotation) * (player.x - player.x0) +
                       Math.cos(player.rotation) * (player.y - player.y0) +
                       player.y0;

            player.x = roundNumber(player.x, 8);
            player.y = roundNumber(player.y, 8);

            rot = distTP(player.x, player.y, player.x0, player.y0);
            newDist = distTP(player.x, player.y, prevx, prevy);
            player.length += newDist;
            console.log("rot = " + rot + " newDist = " + newDist + " length = " + player.length);
        }
        else {
            player.y += player.speed;
            player.length += Math.abs(player.speed);
            if (player.length > player.d)
            {
                player.y = player.y0 + player.speed / Math.abs(player.speed) * player.d;
                player.length = player.d;
            }
            player.y = roundNumber(player.y, 6);
            player.length = roundNumber(player.length, 6);
            console.log("speed = " + player.speed + " y = " + player.y + " length = " + player.length);
        }
    }
}

// Distance between two points
function distTP(x1, y1, x2, y2) {
    return Math.sqrt(Math.abs(x1 - x2)*Math.abs(x1 - x2) +
                     Math.abs(y1 - y2)*Math.abs(y1 - y2));
}
function roundNumber(num, pos) {
    return Math.round(num * Math.pow(10, pos)) / Math.pow(10, pos);
}
