import { NPuzzleAlgo } from './enums/n-puzzle-algo.enum';
import { TileMoveDirection } from './enums/tile-move-direction.enum';

export class NPuzzle {
    type: NPuzzleAlgo;
    size: number;
    origin: number[];
    final: number[];
    operations: TileMove[];
    nbMoves: number;
    duration: number;
    solvable: boolean;
    nbOpenList: number;
    nbCloseList: number;
}

export class TileMove {
    tile: number
    direction: TileMoveDirection

    constructor(tile: number, direction: TileMoveDirection) {
        this.tile = tile 
        this.direction = direction
    }
}