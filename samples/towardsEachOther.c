#include <cmath>
#include <iostream>

#include "rendezvous.h"

void initTowardsEachOther(player*, player*);
void moveTowardsEachOther(player*, player*);

algorithm towardsEachOtherAlgorithm = {
    "Towards each other",
    initTowardsEachOther,
    moveTowardsEachOther
};

void _moveTowardsEachOther(player* p, position* s);

void initTowardsEachOther(player* p1, player* p2) {
}

void moveTowardsEachOther(player* p1, player* p2) {
    position p1_pos = p1->pos;
    position p2_pos = p2->pos;
    _moveTowardsEachOther(p1, &p2_pos);
    auto d = getDistance(&p1->pos, &p2->pos);
    if (d <= p1->sight || d <= p2->sight)
        return;
    _moveTowardsEachOther(p2, &p1_pos);
}

//#define WARNING

void _moveTowardsEachOther(player* p, position* s) {
    if (p->speed != 0) {
        auto old = p->pos;
        auto x1 = fabs(s->x - p->pos.x);
        auto y1 = fabs(s->y - p->pos.y);
        auto sum = x1 + y1;
        auto speed = p->speed * p->speed;
        auto speedX = sqrt(speed * (x1 / sum));
        p->pos.x = (p->pos.x < s->x) ? p->pos.x + speedX : p->pos.x - speedX;

        auto speedY = sqrt(speed * (y1 / sum));
        p->pos.y = (p->pos.y < s->y) ? p->pos.y + speedY : p->pos.y - speedY;
#ifdef WARNING
        if (getDistance(&old, &p->pos) != p->speed)
            printf("Warning! Player%i: distance = %f, speed = %f, old x:%f, y:%f, new x:%f, y:%f\n",
                    p->id, getDistance(&old, &p->pos), p->speed, old.x, old.y, p->pos.x, p->pos.y);
#endif
        p->road += p->speed;
    }
}
