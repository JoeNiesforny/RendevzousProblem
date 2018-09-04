#include <cmath>
#include <iostream>
#define PI 3.14159265

#include "rendezvous.h"

void initSquareCover(player*, player*);
void moveSquareCover(player*, player*);

algorithm squareCoverAlgorithm = {
    "Square Cover",
    initSquareCover,
    moveSquareCover
};

static int layerLimit;

static struct squareCoverPlayer {
    bool onGrid;
    struct position grid;
    int layerIter;
    int layerDirection;
    struct position sourceSquare;
    int squareIter;
    int squareDirection;
    int vertexIter;
    int connectorD;
} ps[] = {{
    0
}, {
    0
}
};

#define psc(p) ps[(p->id - 1)]

static struct position getClosestParentPoint(player* p) {
    struct position newGrid;
    auto width = 2;
    newGrid.x = p->pos.x - fmod(p->pos.x, width);
    if (fmod(p->pos.x, width) > 1)
        newGrid.x += width;
    newGrid.y = p->pos.y - fmod(p->pos.y, width);
    if (fmod(p->pos.y, width) > 1)
        newGrid.y += width;
    return newGrid;
}

static void _initSquareCover(player* p) {
    psc(p) = {0};
    psc(p).layerDirection = 1;
    psc(p).squareDirection = 1;
    psc(p).grid = getClosestParentPoint(p);
    psc(p).sourceSquare = psc(p).grid;
}

void initSquareCover(player* p1, player* p2) {
    auto d = getDistance(&p1->pos, &p2->pos);
    layerLimit = 0;
    while (d > pow(2, layerLimit)){
            layerLimit++;
    };
    layerLimit *= 2;
#ifdef DEBUG
    printf("Set layer limit to %i\n", layerLimit);
#endif
    _initSquareCover(p1);
    _initSquareCover(p2);
}

static void _moveSquareCover(player*);

void moveSquareCover(player* p1, player* p2) {
    _moveSquareCover(p1);
    auto d = getDistance(&p1->pos, &p2->pos);
    if (d <= p1->sight || d <= p2->sight)
        return;
    _moveSquareCover(p2);
}

static void movePlayerToGrid(player* p);
static struct position getVertex(int layer, struct position square, int vertex);
static void movePlayerToVertex(player* p, struct position vertex);
static void computeNewLayer(player* p);

static void _moveSquareCover(player* p) {
    if (p->speed != 0){
        if (psc(p).onGrid == false) {
            movePlayerToGrid(p);
        } else {
            struct position vertex = getVertex(psc(p).layerIter, psc(p).grid, psc(p).vertexIter);
            movePlayerToVertex(p, vertex);
            // Check if need to get new vertex
            if (p->pos.x == vertex.x && p->pos.y == vertex.y) {
                psc(p).vertexIter++;
                if (psc(p).vertexIter > 4) {
                    psc(p).vertexIter = 0;
                    psc(p).squareIter += psc(p).squareDirection;
                    psc(p).grid = getVertex(psc(p).layerIter, psc(p).sourceSquare, psc(p).squareIter);

                    if (psc(p).squareIter > 4) {
                        computeNewLayer(p);
                    }
                }
            }
        }
    }
}

static void movePlayerToGrid(player* p) {
    if (fmod(p->pos.x, 1) != 0 || fmod(p->pos.y, 1) != 0) { // ToDo Check
        if (p->pos.x != psc(p).grid.x || p->pos.y != psc(p).grid.y) {
            auto old = p->pos;
            auto x1 = fabs(psc(p).grid.x - p->pos.x);
            auto y1 = fabs(psc(p).grid.y - p->pos.y);
            auto sum = x1 + y1;

            auto speed = p->speed * p->speed;
            auto speedX = sqrt(speed * (x1 / sum));

            if (speedX != 0 && p->pos.x < psc(p).grid.x) {
                p->pos.x += speedX;
                if (p->pos.x > psc(p).grid.x)
                    p->pos.x = psc(p).grid.x;
            }
            else {
                p->pos.x -= speedX;
                if (p->pos.x < psc(p).grid.x)
                    p->pos.x = psc(p).grid.x;
            }

            auto speedY = sqrt(speed * (y1 / sum));
            if (speedY != 0 && p->pos.y < psc(p).grid.y) {
                p->pos.y += speedY;
                if (p->pos.y > psc(p).grid.y)
                    p->pos.y = psc(p).grid.y;
            }
            else {
                p->pos.y -= speedY;
                if (p->pos.y < psc(p).grid.y)
                    p->pos.y = psc(p).grid.y;
            }
#ifdef WARNING
            if (getDistance(&old, &p->pos) != p->speed)
                printf("Warning! Player%i: distance = %f, speed = %f, old x:%f, y:%f, new x:%f, y:%f\n",
                    p->id, getDistance(&old, &p->pos), p->speed, old.x, old.y, p->pos.x, p->pos.y);
#endif
            p->road += p->speed;
        }
    }
    else {
        psc(p).onGrid = true;
    }
}

static int computeLayer(int layer) {
    return (layer + (layer % 2)) / 2;
}

// Get vertex from square
// vertex counts from top left to left bottom (clockwise)
static struct position getVertex(int layer, struct position square, int vertex) {
    auto squareLayer = computeLayer(layer);
    if (vertex < 0 && vertex > 4)
        return {-1};
    struct position pt = {square.x, square.y};
    switch(vertex) {
        //case 0 and case 4 are pointing at the left top corner of square
        case 1:
            pt.x += pow(2, squareLayer);
            break;
        case 2:
            pt.x += pow(2, squareLayer);
            pt.y += pow(2, squareLayer);
            break;
        case 3:
            pt.y += pow(2, squareLayer);
            break;
    }
    return pt;
}

static void movePlayerToVertex(player* p, struct position vertex) {
    struct position old = {p->pos.x, p->pos.y};
    if (p->pos.x != vertex.x) {
        if (p->pos.x < vertex.x) {
            p->pos.x += p->speed;
            if (p->pos.x > vertex.x)
                p->pos.x = vertex.x;
        }
        else {
            p->pos.x -= p->speed;
            if (p->pos.x < vertex.x)
                p->pos.x = vertex.x;
        }
    }

    if (p->pos.y != vertex.y) {
        if (p->pos.y < vertex.y) {
            p->pos.y += p->speed;
            if (p->pos.y > vertex.y)
                p->pos.y = vertex.y;
        }
        else {
            p->pos.y -= p->speed;
            if (p->pos.y < vertex.y)
                p->pos.y = vertex.y;
        }
    }
    // Add road that player did in this move
    p->road += fabs(old.x - p->pos.x) + fabs(old.y - p->pos.y);
}

static void connectorD(player* p) {
    if (psc(p).connectorD == 0) {
        psc(p).sourceSquare.x = psc(p).sourceSquare.x +
            pow(2, computeLayer(psc(p).layerIter)) / 2 * psc(p).layerDirection;
        psc(p).connectorD = 1;
    }
    else if (psc(p).connectorD == 1) {
        psc(p).sourceSquare.y = psc(p).sourceSquare.y +
            pow(2, computeLayer(psc(p).layerIter)) / 2 * psc(p).layerDirection;
        psc(p).connectorD = 2;
    }
    psc(p).grid = psc(p).sourceSquare;
    psc(p).squareIter = 4;
    psc(p).vertexIter = 4;
}

static void computeNewLayer(player* p) {
    if (psc(p).layerIter % 2 == 1 && psc(p).layerIter != 0 && psc(p).connectorD < 2) {
        connectorD(p);
        return;
    }

    psc(p).connectorD = 0;
    psc(p).squareIter = 0;
    psc(p).grid = psc(p).sourceSquare;
    psc(p).layerIter += psc(p).layerDirection;

    if (psc(p).layerIter > layerLimit) {
        psc(p).layerDirection = -1;
        psc(p).layerIter += psc(p).layerDirection;
    } else if (psc(p).layerIter < 0) {
        psc(p).layerDirection = 1;
        psc(p).layerIter += psc(p).layerDirection;
    }
}