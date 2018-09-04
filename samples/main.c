#include <cstdio>
#include <iostream>
#include <string.h>

#include "rendezvous.h"

//##
//Algorithms
//##
extern algorithm kissingCirclesAlgorithm;
extern algorithm towardsEachOtherAlgorithm;
extern algorithm unknownDistanceAlgorithm;
extern algorithm squareCoverAlgorithm;
extern algorithm squareCoverOptAlgorithm;

typedef struct{
    char name[16];
    algorithm alg;
} algorithm_option;

algorithm_option options[] = {
    {"towards", towardsEachOtherAlgorithm},
    {"kissing", kissingCirclesAlgorithm},
    {"unknown", unknownDistanceAlgorithm},
    {"square", squareCoverAlgorithm},
    {"squareopt", squareCoverOptAlgorithm},
};

void choose_algorithm(char* name, algorithm* alg) {
    for (int i = 0; i < 5; i++)
        if (strcmp(name, options[i].name) == 0)
            *alg = options[i].alg;
}

const char* usage = "Rendezvous algorithm simulation. \n"
                    "Command:\n"
                    "   run             run once simulation\n"
                    "   repeat <count>  run specific times simulation\n"
                    "\n"
                    "Options:\n"
                    "   towards         towards each other strategy\n"
                    "   kissing         kissing circles strategy\n"
                    "   unknown         unknown distance between players strategy\n"
                    "   square          square cover using H_QC algorithm\n"
                    "   squareopt       square cover using H*_QC(optimized) algorithm\n"
                    "\n"
                    "Players parameters(only use with 'repeat' command):\n"
                    "   v1 <speed>      speed of player 1 (Default: 1)\n"
                    "   v2 <speed>      speed of player 2 (Default: 1)\n"
                    "   sight <length>  sight length of players (Default: 1)\n"
                    "   delay <step>    delay of player 2 (Default: 0)\n"
                    "\n"
                    "Default value is use when parameter is not specified.\n";

int main(int argc, char ** argv) {
    initializeEnvironment();
    if (argc > 2) {
        char* cmd = argv[1];
        if (strcmp(cmd,"run") == 0) {
            algorithm sim_alg = {0};
            choose_algorithm(argv[2], &sim_alg);
            if (strlen(sim_alg.name) > 0)
                runAlgorithm(&sim_alg);
            else
                printf("ERROR: Typed algorithm '%s' does not exist!\n", argv[2]);
        } else if (strcmp(cmd,"repeat") == 0) {
            if (argc > 3) {
                    int repeat = atoi(argv[2]);
                    algorithm sim_alg = {0};
                    choose_algorithm(argv[3], &sim_alg);
                    if (strlen(sim_alg.name) > 0) {
                        argv += 3;
                        argc -= 3;
                        repeatAlgorithm(&sim_alg, repeat, argc, argv);
                    } else
                        printf("ERROR: Typed algorithm '%s' does not exist!\n", argv[3]);
            } else {
                    printf("ERROR: Invalid command!\n");
                    printf("%s\n", usage);
            }
        }
    }
    else
        printf("%s\n", usage);
}
