#include <cmath>
#include <iostream>

#include "rendezvous.h"

void initKissingCircles(player*, player*);
void moveKissingCircles(player*, player*);

algorithm kissingCirclesAlgorithm = {
    "Kissing circles",
    initKissingCircles,
    moveKissingCircles
};

void _moveKissingCircles(player* p);

void initKissingCircles(player* p1, player* p2) {
    p1->add.di = global.d * p1->speed / (p1->speed + p2->speed);
    p2->add.di = global.d * p2->speed / (p1->speed + p2->speed);
    p1->add.rot = p1->speed != 0 ? p1->speed / p1->add.di : 0;
    p2->add.rot = p2->speed != 0 ? p2->speed / p2->add.di : 0;
#ifdef DEBUG
    printf("p1rot:%f, p2rot:%f\n", p1->add.rot, p2->add.rot);
#endif
    p2->speed = -p2->speed;
}

void moveKissingCircles(player* p1, player* p2) {
    _moveKissingCircles(p1);
    auto d = getDistance(&p1->pos, &p2->pos);
    if (d <= p1->sight || d <= p2->sight)
        return;
    _moveKissingCircles(p2);
}

void _moveKissingCircles(player* p) {
    if (p->speed != 0) {
        if (p->road >= p->add.di) {
            position prev = {};
            prev.x = p->pos.x;
            prev.y = p->pos.y;
            p->pos.x = cos(p->add.rot) * (p->pos.x - p->pos0.x) -
                       sin(p->add.rot) * (p->pos.y - p->pos0.y) +
                       p->pos0.x;
            p->pos.y = sin(p->add.rot) * (p->pos.x - p->pos0.x) +
                       cos(p->add.rot) * (p->pos.y - p->pos0.y) +
                       p->pos0.y;

            float rot = getDistance(&p->pos, &p->pos0);
            float newDist = getDistance(&p->pos, &prev);
            p->road += newDist;
    #ifdef VERBOSE
            std::cout << "rot " << rot <<  "newDist = " << newDist << " road = " << p->road << std::endl;
    #endif
        }
        else {
            p->pos.y += p->speed;
            p->road += fabs(p->speed);
            if (p->road > p->add.di)
            {
                p->pos.y = p->pos0.y + (p->speed / fabs(p->speed)) * p->add.di;
                p->road = p->add.di;
            }
    #ifdef VERBOSE
            std::cout << "speed = " << p->speed << " y = " << p->pos.y << " road = " << p->road << std::endl;
    #endif
        }
    }
}
