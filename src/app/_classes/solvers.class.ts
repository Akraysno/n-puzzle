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
        [NPuzzleAlgo.BEST_FIRST]: Solvers.bestFirst,
        [NPuzzleAlgo.SLOW_ASTAR]: null,
        [NPuzzleAlgo.WEIGHTED_ASTAR]: null,
    }
    /*
        static _aStarStandard(start: State, heuristic: dist_heuristic): [State, number, number] {
            const opened = new PriorityQueue<State>();
            const closed = new Map<string, number>();
            let nb_tries = 0;
            opened.insert(start, start.totalDist(heuristic));
            while (!opened.is_empty()) {
                nb_tries += 1;
                const state_e = opened.min();
                if (state_e.get_h(heuristic) === 0) {
                    return [state_e, nb_tries, opened.length + closed.size];
                }
                closed.set(state_e.hash(), state_e.g);
                for (const state of state_e.expand()) {
                    const similar_state: State | undefined = opened.get(state);
                    if (similar_state) {
                        if (state.g < similar_state.g) {
                            opened.insert(state, state.totalDist(heuristic));
                        }
                        continue;
                    }
                    const closed_dist = closed.get(state.hash());
                    if (typeof closed_dist !== 'undefined') {
                        if (state.g < closed_dist) {
                            opened.insert(state, state.totalDist(heuristic));
                            closed.delete(state.hash());
                        }
                        continue;
                    }
                    opened.insert(state, state.totalDist(heuristic));
                }
            }
            throw 'impossible';
        }
    
        static aStarStandard(start: State, heuristic: DistHeuristic) {
            const opened = new PriorityQueue();
            const closed: Set<String> = new Set()
            let nb_tries = 0;
            opened.add(start, start.totalDist(heuristic));
            while (!opened.is_empty()) {
                nb_tries += 1;
                const state_e = opened.min();
                if (state_e.get_h(heuristic) === 0) {
                    return [state_e, nb_tries, opened.length + closed.size];
                }
                closed.set(state_e.hash(), state_e.g);
                for (const state of state_e.expand()) {
                    const similar_state: State | undefined = opened.get(state);
                    if (similar_state) {
                        if (state.g < similar_state.g) {
                            opened.insert(state, state.totalDist(heuristic));
                        }
                        continue;
                    }
                    const closed_dist = closed.get(state.hash());
                    if (typeof closed_dist !== 'undefined') {
                        if (state.g < closed_dist) {
                            opened.insert(state, state.totalDist(heuristic));
                            closed.delete(state.hash());
                        }
                        continue;
                    }
                    opened.insert(state, state.totalDist(heuristic));
                }
            }
            throw 'impossible';
        }
        */


    static bestFirst(start: State, heuristic: DistHeuristic, openedList: OpenedList, closedList: ClosedList): State {
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