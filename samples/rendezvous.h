
struct position {
    float x;
    float y;
};

struct additional{
    float di;
    float rot;
    int iter;
    float dir;
    struct position disk;
    float old;
};

struct player {
    int id;
    struct position pos;
    struct position pos0;
    float speed;
    float sight;
    float road;
    struct additional add;
};

struct algorithm {
    char name[32];
    void (*init)(player*, player*);
    void (*move)(player*, player*);
};

struct _global {
    float d;
    int step;
    int max_player;
};

extern _global global;

int initializeEnvironment();
int runAlgorithm(algorithm* alg);
void repeatAlgorithm(algorithm* alg, int r, int argc, char ** argv);
float getDistance(position* p1, position* p2);
