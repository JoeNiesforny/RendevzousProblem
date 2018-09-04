
#include <stdlib.h>
#include <time.h>
#include <iostream>
#include <math.h>
#include <string.h>

#include "rendezvous.h"

_global global;

const int randLimit = 100;

int initializeEnvironment() {
    srand (time(NULL));
}

struct position getNewPosition() {
    struct position pos;
    pos.x = rand() % randLimit;
    pos.y = rand() % randLimit;
    return pos;
}

float getRandomValue(int limit) {
    return rand() % limit;
}

void displayPlayerPosition(player* p) {
    std::cout << "p" << p->id << " x: " << p->pos.x << ", y: " << p->pos.y << ", v: " << p->speed << std::endl;
}

void displayPlayer0Position(player* p) {
    std::cout << "p" << p->id << " x0: " << p->pos0.x << ", y0: " << p->pos0.y << std::endl;
}

int setPlayer(player* p) {
    p->pos = getNewPosition();
    p->pos0 = p->pos;
    p->speed = getRandomValue(100)/100;
    p->sight = 1;
#ifdef DEBUG
    displayPlayerPosition(p);
#endif
}

float getDistance(position* p1, position* p2) {
    return sqrt(((p1->x - p2->x) * (p1->x - p2->x)) +
                ((p1->y - p2->y) * (p1->y - p2->y)));
}

int runAlgorithm(algorithm* alg) {
    printf("Algorithm: %s\n", alg->name);
    player p1 = {1};
    player p2 = {2};

    do {
        setPlayer(&p1);
        setPlayer(&p2);
    } while (p1.speed == 0 && p2.speed == 0);

    displayPlayerPosition(&p1);
    displayPlayerPosition(&p2);

    float d = getDistance(&p1.pos, &p2.pos);
    global.d = d;
    global.step = 0;
    short success = 1;

    std::cout << "Initial distance beetwen players: " << d << std::endl;
    if (alg == NULL)
        return -1;

    // algorithm init
    alg->init(&p1, &p2);
    while (d > p1.sight && d > p2.sight) {
        // algorithm move
        alg->move(&p1, &p2);
        d = getDistance(&p1.pos, &p2.pos);
        if (global.step > 100000) {
            success = 0;
            break;
        }
#ifdef DEBUG
        if (global.step % 1000) std::cout << "d: " << d << std::endl;
#endif
        global.step++;
    }
    if (success)
        std::cout << "Finished! Step: " << global.step << ", road: " << (p1.road + p2.road) << std::endl;
    else
        std::cout << "Finished without success. Step: " << global.step << ", p1 road: " << p1.road << ", p2 road: " << p2.road << std::endl;
    std::cout << "Last distance beetween players: " << d << std::endl;
#ifdef DEBUG
    displayPlayerPosition(&p1); displayPlayer0Position(&p1);
    displayPlayerPosition(&p2); displayPlayer0Position(&p2);
#endif
}

typedef struct{
    float speed1;
    float speed2;
    float sight;
    float delay;
} player_parameters;
const char* name_par[] = {"v1","v2","sight","delay"};

void parse_par(float* par, int argc, char ** argv) {
    for (int i = 0; i < argc; i++) {
        for (int j = 0; j < 4; j++) {
            if (strcmp(name_par[j], argv[i]) == 0) {
                i++;
                if (i < argc)
                    par[j] = atof(argv[i]);
            }
        }
    }
}

void repeatAlgorithm(algorithm* alg, int repeat_count, int argc, char ** argv) {
    printf("Algorithm: %s\n", alg->name);
    player_parameters par = {1, 1, 1, 0};
    parse_par((float*)&par, argc, argv);
    printf("Player 1 speed: %f; Player 2 speed: %f; Players sight: %f; Delay: %f.\n",
            par.speed1, par.speed2, par.sight, par.delay);

    const char* format = "%4i | %12.4f | %12.4f | %7d | %7d |\n";
    printf("iter | init dist    | sum road     | step    | success |\n");
    for (int i = 0; i < repeat_count; i++) {
        player p1 = {1};
        player p2 = {2};
        short success = 1;
        setPlayer(&p1);
        setPlayer(&p2);

        p1.speed = par.speed1;
        p2.speed = par.speed2;
        p1.sight = p2.sight = par.sight;

        float d = getDistance(&p1.pos, &p2.pos);
        global.d = d;
        global.step = 0;

        if (alg == NULL)
            return;

        // algorithm init
        alg->init(&p1, &p2);
        while (d > p1.sight && d > p2.sight) {
            if (global.step >= 1000000) {
                success = 0;
                break;
            }
            if (par.delay > 0) {
                if (global.step == 0)
                    p2.speed = 0;
                else
                    if (global.step == par.delay)
                        p2.speed = par.speed2;
            }
            // algorithm move
            alg->move(&p1, &p2);
            d = getDistance(&p1.pos, &p2.pos);
            global.step++;
        }
        auto road = p1.road + p2.road;
        printf(format, (i+1), global.d, road, global.step, success);
    }
}
