#include <cmath>
#include <iostream>
#define PI 3.14159265

#include "rendezvous.h"

void initUnknownDistance(player*, player*);
void moveUnknownDistance(player*, player*);

algorithm unknownDistanceAlgorithm = {
    "Unknown Distance",
    initUnknownDistance,
    moveUnknownDistance
};

void _initUnknownDistance(player* p) {
    p->add.iter = 1;
    p->add.old = 0;
    p->add.dir = (rand() % ((int)round(2.0 * PI * 1000.0))) / 1000.0;
    p->add.disk.x = p->sight * cos(p->add.dir) + p->pos.x;
    p->add.disk.y = p->sight * sin(p->add.dir) + p->pos.y;
    p->add.rot = p->speed / getDistance(&p->pos, &p->add.disk);
}

void initUnknownDistance(player* p1, player* p2) {
    _initUnknownDistance(p1);
    _initUnknownDistance(p2);
}

void setNewDisk(player* p) {
    p->add.disk.x = p->sight * cos(p->add.dir) * p->add.iter * pow(-1, p->add.iter + 1) + p->pos.x;
    p->add.disk.y = p->sight * sin(p->add.dir) * p->add.iter * pow(-1, p->add.iter + 1) + p->pos.y;
    p->add.rot = p->speed / getDistance(&p->pos, &p->add.disk);
}

void _moveUnknownDistance(player*);

void moveUnknownDistance(player* p1, player* p2) {
    if (p1->road >= (p1->add.old + getDistance(&p1->pos, &p1->add.disk) * PI)) {
        p1->add.iter++;
        setNewDisk(p1);
        p1->add.old = p1->road;
    }
    _moveUnknownDistance(p1);
    auto d = getDistance(&p1->pos, &p2->pos);
    if (d <= p1->sight || d <= p2->sight)
        return;
    if (p2->road >= (p2->add.old + getDistance(&p2->pos, &p2->add.disk) * PI)) {
        p2->add.iter++;
        setNewDisk(p2);
        p2->add.old = p2->road;
    }
    _moveUnknownDistance(p2);
}

void _moveUnknownDistance(player* p) {
    if (p->speed != 0){
        position prev = p->pos;
        p->pos.x = cos(p->add.rot) * (p->pos.x - p->add.disk.x) -
                sin(p->add.rot) * (p->pos.y - p->add.disk.y) +
                p->add.disk.x;
        p->pos.y = sin(p->add.rot) * (p->pos.x - p->add.disk.x) +
                cos(p->add.rot) * (p->pos.y - p->add.disk.y) +
                p->add.disk.y;
        p->road = p->road + getDistance(&p->pos, &prev);
    }
}
