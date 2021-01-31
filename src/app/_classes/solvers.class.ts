import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum";
import { DistHeuristic } from "./heuristics.class";
import { PriorityQueue } from "./priority-queue-rework.class";
import { ClosedList, OpenedList } from "./state-rework.class";
import { State } from "./state-rework.class";

export type NPuzzleSolver = (start: State, heuristic: DistHeuristic, openedList: OpenedList, closedList: ClosedList) => State

/**
 * Class where each method is a different solver.
 * 
 * Class where each method is static (no need new to access methods)
 */
export class Solvers {
    static solvers = {
        [NPuzzleAlgo.ASTAR]: Solvers.aStar,
        [NPuzzleAlgo.BEST_FIRST]: null,
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
    
        function _bestFirst(start: State, heuristic: dist_heuristic): [State, number, number] {
            const opened = new PriorityQueue<State>();
            const closed = new Map<string, number>();
            let nb_tries = 0;
            opened.insert(start, start.get_h(heuristic));
            while (!opened.is_empty()) {
                nb_tries += 1;
                const state_e = opened.min();
                const state_e_hash = state_e.hash();
                const closed_dist = closed.get(state_e_hash);
                if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
                    continue;
                }
                if (state_e.get_h(heuristic) === 0) {
                    return [state_e, nb_tries, opened.size() + closed.size];
                }
                // console.log('state:', state_e);
                // console.log('opened:', opened.size(), 'closed:', closed.size);
                closed.set(state_e_hash, state_e.g);
                for (const state of state_e.expand()) {
                    opened.insert(state, state.get_h(heuristic));
                }
            }
            throw 'impossible';
        }
        */

    static aStar(start: State, heuristic: DistHeuristic, openedList: OpenedList, closedList: ClosedList): State {
        openedList.addItem(start, start.getDist(heuristic));
        while (openedList.count() > 0) {
            const current = openedList.getAndRemoveTop();
            if (current.getHeuristicValue(heuristic) === 0) {
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