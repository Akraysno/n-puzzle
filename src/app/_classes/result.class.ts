import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum";
import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum";
import { TileMove } from "../__models/n-puzzle.entity";
import { State } from "./state.class";

export class Result {
    algo: NPuzzleAlgo;
    size: number;
    start: number[];
    final: number[];
    heuristic: NPuzzleHeuristics
    operations: TileMove[];
    nbMoves: number;
    durationResolve: number;
    durationTotal: number;
    solvable: boolean;
    nbOpenList: number;
    nbCloseList: number;

    constructor(base?: State, final?: State) {
        if (!base) return
        this.final = base.final
        this.size = base.size
        this.start = base.board
        this.algo = base.algo
        this.heuristic = base.heuristic
        this.solvable = base.isSolvable
        this.nbCloseList = base.closedList.size
        this.nbOpenList = base.openedList.count()
        this.durationResolve = base.execTime.diffT// / 1e6

        if (final) {
            let history = final.getHistory()
            this.nbMoves = history.length
            this.operations = history.map(s => s.move)
        }

    }
}