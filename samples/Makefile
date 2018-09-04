CC=gcc
CFLAGS=-I. -std=gnu99
SRC=main.c kissing_circles.c environment.c towardsEachOther.c unknown_distance.c square_cover.c square_cover_optimized.c
OUT=simulation

build:
	$(CC) $(SRC) -o ${OUT} $(CFLAGS)
debug:
	$(CC) $(SRC) -o ${OUT} $(CFLAGS) -DDEBUG
verbose:
	$(CC) $(SRC) -o ${OUT} $(CFLAGS) -DDEBUG -DVERBOSE
clean:
	rm -f $(OUT)
