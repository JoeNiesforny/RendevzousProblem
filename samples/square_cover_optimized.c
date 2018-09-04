#include <cmath>
#include <iostream>
#define PI 3.14159265

#include "rendezvous.h"

void initSquareCoverOpt(player*, player*);
void moveSquareCoverOpt(player*, player*);

algorithm squareCoverOptAlgorithm = {
    "Square Cover Optimized",
    initSquareCoverOpt,
    moveSquareCoverOpt
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

static void _initSquareCoverOpt(player* p) {
    psc(p) = {0};
    psc(p).layerDirection = 1;
    psc(p).squareDirection = 1;
    psc(p).grid = getClosestParentPoint(p);
    psc(p).sourceSquare = psc(p).grid;
}

void initSquareCoverOpt(player* p1, player* p2) {
    auto d = getDistance(&p1->pos, &p2->pos);
    layerLimit = 0;
    while (d > pow(2, layerLimit)){
            layerLimit++;
    };
    layerLimit = layerLimit - floor(layerLimit / 8) + 1; // Optimized version
#ifdef DEBUG
    printf("Set layer limit to %i\n", layerLimit);
#endif
    _initSquareCoverOpt(p1);
    _initSquareCoverOpt(p2);
}

static void _moveSquareCoverOpt(player*);

void moveSquareCoverOpt(player* p1, player* p2) {
    _moveSquareCoverOpt(p1);
    auto d = getDistance(&p1->pos, &p2->pos);
    if (d <= p1->sight || d <= p2->sight)
        return;
    _moveSquareCoverOpt(p2);
}

static void movePlayerToGrid(player* p);
static struct position getVertex(int layer, struct position square, int vertex);
static void movePlayerToVertex(player* p, struct position vertex);
static void computeNewLayerOpt(player* p);

static void _moveSquareCoverOpt(player* p) {
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
                        computeNewLayerOpt(p);
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

static int computeLayerOpt(int layer) {
    return layer - (floor((layer - (layer % 8)) / 4)) - (floor(layer % 8) > 3 ? (floor(layer % 8) > 5 ? 2 : 1) : 0);
}

// Get vertex from square
// vertex counts from top left to left bottom (clockwise)
static struct position getVertex(int layer, struct position square, int vertex) {
    auto squareLayer = computeLayerOpt(layer);
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
            pow(2, computeLayerOpt(psc(p).layerIter)) / 2 * psc(p).layerDirection;
        psc(p).connectorD = 1;
    }
    else if (psc(p).connectorD == 1) {
        psc(p).sourceSquare.y = psc(p).sourceSquare.y +
            pow(2, computeLayerOpt(psc(p).layerIter)) / 2 * psc(p).layerDirection;
        psc(p).connectorD = 2;
    }
    psc(p).grid = psc(p).sourceSquare;
    psc(p).squareIter = 4;
    psc(p).vertexIter = 4;
}

static void computeNewLayerOpt(player* p) {
    if (psc(p).layerIter % 8 > 3) { // Optimized for block sequence (z+4) = 8
        if (psc(p).layerIter % 2 == 0 && psc(p).layerIter != 0 && psc(p).connectorD < 2) {
            connectorD(p);
            return;
        }
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