import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum";
import { DistHeuristic } from "./heuristics.class";
import { ClosedList, OpenedList } from "./state.class";
import { State } from "./state.class";

export type NPuzzleSolver = (start: State, heuristic: DistHeuristic, openedList: OpenedList, closedList: ClosedList) => State

/**
 * Class where each method is a different solver.
 * 
 * Class where each method is static (no need new to access methods)
 */
export class Solvers {
    static solvers = {
        [NPuzzleAlgo.ASTAR]: Solvers.aStar,
        [NPuzzleAlgo.A_STAR_ALT]: Solvers.aStarAlt,
        [NPuzzleAlgo.WEIGHTED_ASTAR]: Solvers.aStar,
    }

    static aStarAlt(start: State, heuristic: DistHeuristic, openedList: OpenedList, closedList: ClosedList): State {
        openedList.addItem(start, start.getDist(heuristic));
        while (openedList.count() > 0) {
            const current = openedList.getFirst();
            for (const state of current.neighbours()) {
                const key: string = state.getClosedListKey();
                const closed: boolean = closedList.has(key);
                if (closed) continue
                if (state.board.toString() === start.final.toString()) {
                    return current
                }
                closedList.add(key);
                openedList.addItem(state, state.getDist(heuristic));
            }
        }
    }

    static aStar(start: State, heuristic: DistHeuristic, openedList: OpenedList, closedList: ClosedList): State {
        openedList.addItem(start, start.getDist(heuristic));
        while (openedList.count() > 0) {
            const current = openedList.getFirst();
            if (current.board.toString() === start.final.toString()) {
                return current
            }
            const key: string = current.getClosedListKey();
            const closed: boolean = closedList.has(key);
            if (closed) continue
            closedList.add(key);
            for (const state of current.neighbours()) {
                openedList.addItem(state, state.getDist(heuristic));
            }
        }
    }
}