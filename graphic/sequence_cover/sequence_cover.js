var interval;
const refreshRatio = 100;
const maxSpeed = 1000;
const gridWidth = 20;
var player;
var d;
var startTime = 0;
var road = [];
var abandon = false;
var gridView = false;
var height;
var width;
var gridPoints;
var layerLimit;

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
        sight_length : Math.round(gridWidth / 2 * Math.pow(2, 1/2)),
        speed : Math.round(Math.random()*1000%maxSpeed) + 100,
        length : 0,
        onGrid : false,
        grid : {x : 0, y : 0},
        layerIter : 0,
        layerDirection : 1,
        sourceSquare : {x: 0, y: 0},
        squareIter : 0,
        squareDirection : 1,
        vertexIter : 0,
        connectorD : 0,
    }, {
        x : Math.round(Math.random()*1000)%width,
        y : Math.round(Math.random()*1000)%height,
        x0 : 0, // Beggining position
        y0 : 0,
        color : '#ff0000',
        sight_color : '#ff704d',
        sight_length : Math.round(gridWidth / 2 * Math.pow(2, 1/2)),
        speed : Math.round(Math.random()*1000%maxSpeed) + 100,
        length : 0,
        onGrid : false,
        grid : {x : 0, y : 0},
        layerIter : 0,
        layerDirection : 1,
        sourceSquare : {x: 0, y: 0},
        squareIter : 0,
        squareDirection : 1,
        vertexIter : 0,
        connectorD : 0,
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

    // Set speed to refresh ratio, set closest grid point and set begging coordinates.
    for (i = 0; i < 2; i++) {
        player[i].x0 = player[i].x;
        player[i].y0 = player[i].y;
        player[i].speed /= refreshRatio;
        grid = getClosestParentPoint(player[i]);//getClosestPoint(player[i]);
        player[i].grid = grid;
        player[i].sourceSquare = grid;
        console.log("player " + i + " closest point (" + grid.x + "," + grid.y + ")");
        //setHierarchicalList(player[i], distPlayer(player));
    }

    d = distPlayer(player);
    da = d / gridWidth;
    layerLimit = 0;
    while (da > Math.pow(2, layerLimit)){
            layerLimit++;
    };
    layerLimit = layerLimit * 2;

    console.log("layerLimit: " + layerLimit + " for d " + d + ", da " + da + " and gridWidth " + gridWidth);

    // Update user forms.
    document.getElementById('dist').value = distPlayer(player);
    document.getElementById('distBegin').value = distPlayer(player);
    document.getElementById('timer').value = 0;
    document.getElementById('p1.x0').value = player[0].x0;
    document.getElementById('p1.y0').value = player[0].y0;
    document.getElementById('p2.x0').value = player[1].x0;
    document.getElementById('p2.y0').value = player[1].y0;
    document.getElementById('p1.speed').value = Math.round(player[0].speed * refreshRatio);
    document.getElementById('p2.speed').value = Math.round(player[1].speed * refreshRatio);
    document.getElementById('p1.sight_length').value = player[0].sight_length;
    document.getElementById('p2.sight_length').value = player[1].sight_length;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 0.7;
    if (gridView)
        drawGrid(ctx);
    for (i = 0; i < 2; i++)
        drawPlayer(ctx, player[i]);
}

function start() {
    ctx.globalAlpha = 0.7;
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

function setGridView() {
    if (gridView)
        gridView = false;
    else
        gridView = true;
    draw();
}
function draw() {
    var canvas = document.getElementById('mainCanvas');
    height = canvas.height;
    width = canvas.width;
    ctx = document.getElementById('mainCanvas').getContext('2d');

    // Move player
    for (i = 0; i < 2; i++) {
        move(player[i]);
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    if (gridView)
        drawGrid(ctx)
    for (i = 0; i < 2; i++)
        drawPlayer(ctx, player[i]);

    // Update user elements with new values
    document.getElementById('timer').value = performance.now() - startTime;
    document.getElementById('dist').value = d = distPlayer(player);
    document.getElementById('p1.length').value = player[0].length;
    document.getElementById('p2.length').value = player[1].length;

    // Check if rendezvous or algorithm is paused
    if (d <= player[0].sight_length + player[1].sight_length || abandon) {
        clearTimeout(interval);
        ctx.globalAlpha = 1;
        // Draw a road if players meet.
        for (i = 0; i < road.length - 1; i++) {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(road[i][0], road[i][1]);
            ctx.lineTo(road[i+1][0], road[i+1][1]);
            ctx.strokeStyle = player[0].color;
            ctx.stroke()
            ctx.closePath();
            ctx.beginPath();
            ctx.moveTo(road[i][2], road[i][3]);
            ctx.lineTo(road[i+1][2], road[i+1][3]);
            ctx.strokeStyle = player[1].color;
            ctx.stroke()
            ctx.closePath();
        }
    }
    // Remember road.
    road.push([player[0].x, player[0].y, player[1].x, player[1].y]);
}

function drawPlayer(ctx, player) {
    ctx.beginPath();
    ctx.fillStyle = player.sight_color;
    ctx.arc(player.x, player.y, player.sight_length, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = player.color;
    ctx.arc(player.x, player.y, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
}

function drawGrid(ctx) {
    ctx.strokeStyle = 'black';
    for (var i = 0; i < width || i < height; i += gridWidth) {
        ctx.beginPath();
        ctx.lineWidth = 1;
        if (i < width) {
            ctx.moveTo(i,0);
            ctx.lineTo(i,height);
            ctx.stroke();
        }
        if (i < height) {
            ctx.moveTo(0,i);
            ctx.lineTo(width,i);
            ctx.stroke();
        }
        ctx.closePath();
    }
}

function setGridPoints() {
    for (var x = 0; x < width; i += gridWidth) {
        for (var y = 0; y < height; i += gridWidth) {
            gridPoints.push([x,y]);
        }
    }
}

// get central square closest point (layer 1)
function getClosestParentPoint(player) {
    var width = gridWidth * 2;
    var gridX = player.x - (player.x % width);
    if (player.x % width > width / 2)
        gridX += width;
    var gridY = player.y - (player.y % width);
    if (player.y % width > width / 2)
        gridY += width;
    return {x: gridX, y: gridY};
}

// get quad tree closest point (atomic square, layer 0)
function getClosestPoint(player) {
    var gridX = player.x - (player.x % gridWidth);
    if (player.x % gridWidth > gridWidth / 2)
        gridX += gridWidth;
    var gridY = player.y - (player.y % gridWidth);
    if (player.y % gridWidth > gridWidth / 2)
        gridY += gridWidth;
    return {x: gridX, y: gridY};
}

// According to pi layers (for not optimized version (O(d^4))):
// 1 - Q0, 2 - C1, 3 - Q1, 4 - C2, 5 - Q2, 6 - C3, 7 - Q3
// child is always top left corner
function findParent(x, y, layer) {
    var width = gridWidth; // one atomic square edge length
    if (layer < 1) // specified layer doesn't exist
        return -1;
    var parentX = x;
    var parentY = y;
    if (layer % 2 == 0) { // central square children, quad tree parent
        var widthChildrenLayer = width * Math.pow(2, layer/2);
        var widthParentLayer = widthChildrenLayer;
        x = parentX - widthParentLayer / 2;
        y = parentY - widthParentLayer / 2;
    }
    else { // quad tree children, central square parent
        var widthChildrenLayer = width * Math.pow(2, (layer - 1)/2);
        var widthParentLayer = width * Math.pow(2, (layer + 1)/2);
        x = parentX;
        y = parentY;
    }
}

function setHierarchicalList(player, d) {
    var px = player.grid.x;
    var py = player.grid.y;
    var width = gridWidth;
    var i = 0;
    for (var j = 0; j < layerLimit; j++) {
        //console.log("iter " + j + " layer " + i);
        if (j % 2 == 1)
            i++;
        var square = [ // Quad-tree hierarchy coordinates for square from layer i
                {x: px,                          y: py},
                {x: px + width * Math.pow(2, i), y: py},
                {x: px + width * Math.pow(2, i), y: py + width * Math.pow(2, i)},
                {x: px,                          y: py + width * Math.pow(2, i)},
            ];
        player.squareList.push(square);
        findParent(px, py, j+1);
    }
}

// Get vertex from square
// vertex counts from top left to left bottom (clockwise)
function getVertex(layer, square, vertex) {
    var squareLayer = computeLayer(layer);
    if (vertex < 0 && vertex > 4)
        return -1;
    var pt = {x: square.x, y: square.y};
    switch(vertex) {
        //case 0 and case 4 are pointing at the left top corner of square
        case 1:
            pt.x += gridWidth * Math.pow(2, squareLayer);
            break;
        case 2:
            pt.x += gridWidth * Math.pow(2, squareLayer);
            pt.y += gridWidth * Math.pow(2, squareLayer);
            break;
        case 3:
            pt.y += gridWidth * Math.pow(2, squareLayer);
            break;
    }
    return pt;
}

function computeLayer(layer) {
    return (layer + (layer % 2)) / 2;
}

function connectorD(player) {
    if (player.connectorD == 0) {
        player.sourceSquare.x = player.sourceSquare.x +
            Math.pow(2, computeLayer(player.layerIter)) * gridWidth / 2 * player.layerDirection;
        player.connectorD = 1;
    }
    else if (player.connectorD == 1) {
        player.sourceSquare.y = player.sourceSquare.y +
            Math.pow(2, computeLayer(player.layerIter)) * gridWidth / 2 * player.layerDirection;
        player.connectorD = 2;
    }
    player.grid = player.sourceSquare;
    player.squareIter = 4;
    player.vertexIter = 4;
}

function computeNewLayer(player) {
    if (player.layerIter % 2 == 1 && player.layerIter != 0 && player.connectorD < 2) {
        connectorD(player);
        return;
    }

    player.connectorD = 0;
    player.squareIter = 0;
    player.grid = player.sourceSquare;
    player.layerIter += player.layerDirection;

    if (player.layerIter > layerLimit) {
        player.layerDirection = -1;
        player.layerIter += player.layerDirection;
    } else if (player.layerIter < 0) {
        player.layerDirection = 1;
        player.layerIter += player.layerDirection;
    }
}

function move(player) {
    if (player.speed !== 0){
        if (player.onGrid == false) {
            movePlayerToGrid(player);
        } else {
            var vertex = getVertex(player.layerIter, player.grid, player.vertexIter);
            movePlayerToVertex(player, vertex);

            // Check if need to get new vertex
            if (player.x == vertex.x && player.y == vertex.y) {
                player.vertexIter++;
                if (player.vertexIter > 4) {
                    player.vertexIter = 0;
                    player.squareIter += player.squareDirection;
                    player.grid = getVertex(player.layerIter, player.sourceSquare, player.squareIter);

                    if (player.squareIter > 4) {
                        computeNewLayer(player);
                    }
                }
            }
        }
    }
}

function movePlayerToVertex(player, vertex) {
    var old = {x: player.x, y: player.y};
    if (player.x != vertex.x) {
        if (player.x < vertex.x) {
            player.x += player.speed;
            if (player.x > vertex.x)
                player.x = vertex.x;
        }
        else {
            player.x -= player.speed;
            if (player.x < vertex.x)
                player.x = vertex.x;
        }
    }

    if (player.y != vertex.y) {
        if (player.y < vertex.y) {
            player.y += player.speed;
            if (player.y > vertex.y)
                player.y = vertex.y;
        }
        else {
            player.y -= player.speed;
            if (player.y < vertex.y)
                player.y = vertex.y;
        }
    }
    // Add road that player did in this move
    player.length += Math.abs(old.x - player.x) + Math.abs(old.y - player.y);
}

// Set player on Grid
function movePlayerToGrid(player) {
    if (player.x % gridWidth != 0 || player.y % gridWidth != 0) {
        if (player.x != player.grid.x || player.y != player.grid.y) {
            var x1 = Math.abs(player.grid.x - player.x);
            var y1 = Math.abs(player.grid.y - player.y);
            var sum = x1 + y1;
            var speed = player.speed * player.speed;
            var speedX = Math.sqrt(speed * (x1 / sum));

            if (speedX != 0 && player.x < player.grid.x) {
                player.x += speedX;
                if (player.x > player.grid.x)
                    player.x = player.grid.x;
            }
            else {
                player.x -= speedX;
                if (player.x < player.grid.x)
                    player.x = player.grid.x;
            }

            var speedY = Math.sqrt(speed * (y1 / sum));
            if (speedY != 0 && player.y < player.grid.y) {
                player.y += speedY;
                if (player.y > player.grid.y)
                    player.y = player.grid.y;
            }
            else {
                player.y -= speedY;
                if (player.y < player.grid.y)
                    player.y = player.grid.y;
            }
            player.length += player.speed;
        }
    }
    else {
        player.onGrid = true;
    }
}

// Distance between two players
function distPlayer(players) {
    return distTP(players[0].x, players[0].y, players[1].x, players[1].y);
}
// Distance between two points
function distTP(x1, y1, x2, y2) {
    return Math.sqrt(Math.abs(x1 - x2)*Math.abs(x1 - x2) +
                     Math.abs(y1 - y2)*Math.abs(y1 - y2));
}
function roundNumber(num, pos) {
    return Math.round(num * Math.pow(10, pos)) / Math.pow(10, pos);
}
