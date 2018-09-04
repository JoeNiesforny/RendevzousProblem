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
        x0 : 0, // Beggining position
        y0 : 0,
        color : '#0066ff',
        sight_color : '#80ccff',
        sight_length : 25,
        speed : Math.round(Math.random()*1000%maxSpeed),
        length : 0,
        rotation : 0,
        diskX: 0, // Postion X of circle center
        diskY: 0, // Postion Y of circle center
        iteration: 1,
        old: 0, // Remember last road before new iteration
        direction : Math.round(Math.random()*100%(2*Math.PI)), // Direction to disk center
    }, {
        x : Math.round(Math.random()*1000)%width,
        y : Math.round(Math.random()*1000)%height,
        x0 : 0, // Beggining position
        y0 : 0,
        color : '#ff0000',
        sight_color : '#ff704d',
        sight_length : 25,
        speed : Math.round(Math.random()*1000%maxSpeed),
        length : 0,
        rotation : 0,
        diskX: 0, // Postion X of circle center
        diskY: 0, // Postion Y of circle center
        iteration: 1,
        old: 0, // Remember last road before new iteration
        direction : Math.round(Math.random()*100%(2*Math.PI)), // Direction to disk center
    }];

    if (set) {
        player[0].x = document.getElementById('p1.x0').value - 0;
        player[0].y = document.getElementById('p1.y0').value - 0;
        player[1].x = document.getElementById('p2.x0').value - 0;
        player[1].y = document.getElementById('p2.y0').value - 0;
        player[0].speed = document.getElementById('p1.speed').value - 0;
        player[1].speed = document.getElementById('p2.speed').value - 0;
        player[0].sight_length = document.getElementById('p1.sight_length').value - 0;
        player[1].sight_length = document.getElementById('p2.sight_length').value - 0;
    }

    for (i = 0; i < 2; i++) {
        player[i].x0 = player[i].x;
        player[i].y0 = player[i].y;
        player[i].diskX = player[i].sight_length * Math.cos(player[i].direction) + player[i].x;
        player[i].diskY = player[i].sight_length * Math.sin(player[i].direction) + player[i].y;
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
    document.getElementById('p1.sight_length').value = player[0].sight_length;
    document.getElementById('p2.sight_length').value = player[1].sight_length;

    player[0].rotation = player[0].speed / distToDisk(player[0]);
    player[1].rotation = player[1].speed / distToDisk(player[1]);

    //console.log("d=" + d + ", d1=" + player[0].d + " d2=" + player[1].d);
    //console.log("player 0 x=" + player[0].x + ", y=" + player[0].y + " speed=" + player[0].speed + " rotation=" + player[0].rotation);
    //console.log("player 1 x=" + player[1].x + ", y=" + player[1].y + " speed=" + player[1].speed + " rotation=" + player[1].rotation);
    //console.log("player 0 x0=" + player[0].x0 + ", y0=" + player[0].y0);
    //console.log("player 1 x0=" + player[1].x0 + ", y0=" + player[1].y0);

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

    // Move player
    for (i = 0; i < 2; i++) {
        console.log(i + " length" + player[i].length +"  >= " + (player[i].old + player[i].iteration * distToDisk(player[i]) * Math.PI));
        if (player[i].length >= (player[i].old + distToDisk(player[i]) * Math.PI)) {
            player[i].iteration++;
            SetNewDisk(player[i]);
            player[i].old = player[i].length;
        }
        move(player[i]);
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    for (i = 0; i < 2; i++)
        drawPlayer(player[i]);

    // Update user elements with new values
    document.getElementById('timer').value = performance.now() - startTime;
    document.getElementById('dist').value = d = distPlayer(player);
    document.getElementById('p1.length').value = player[0].length;
    document.getElementById('p2.length').value = player[1].length;

    // Check if rendezvous or algorithm is paused
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

function move(player) {
    if (player.speed !== 0){
        prevx = player.x;
        prevy = player.y;
        console.log("prevx = " + prevx + " prevy = " + prevy);
        player.x = Math.cos(player.rotation) * (player.x - player.diskX) -
                Math.sin(player.rotation) * (player.y - player.diskY) +
                player.diskX;
        player.y = Math.sin(player.rotation) * (player.x - player.diskX) +
                Math.cos(player.rotation) * (player.y - player.diskY) +
                player.diskY;

        player.x = roundNumber(player.x, 8);
        player.y = roundNumber(player.y, 8);

        rot = distTP(player.x, player.y, player.x0, player.y0);
        newDist = distTP(player.x, player.y, prevx, prevy);
        player.length += newDist;
        //console.log("rot = " + rot + " newDist = " + newDist + " length = " + player.length);
    }
}

// Set bigger circle to move
function SetNewDisk(player) {
    player.diskX = player.sight_length * Math.cos(player.direction) * player.iteration * Math.pow(-1, player.iteration + 1) + player.x;
    player.diskY = player.sight_length * Math.sin(player.direction) * player.iteration * Math.pow(-1, player.iteration + 1) + player.y;
    //player.diskX = player.sight_length * player.iteration * Math.pow(-1, player.iteration + 1);
    player.rotation = player.speed / distToDisk(player);
}
// Distance between two players
function distPlayer(players) {
    return distTP(players[0].x, players[0].y, players[1].x, players[1].y);
}
// Distance between player and the center of disk
function distToDisk(player) {
    return distTP(player.x, player.y, player.diskX, player.diskY);
}
// Distance between two points
function distTP(x1, y1, x2, y2) {
    return Math.sqrt(Math.abs(x1 - x2)*Math.abs(x1 - x2) +
                     Math.abs(y1 - y2)*Math.abs(y1 - y2));
}
function roundNumber(num, pos) {
    return Math.round(num * Math.pow(10, pos)) / Math.pow(10, pos);
}
