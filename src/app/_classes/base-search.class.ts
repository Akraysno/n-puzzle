import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum"
import { Node } from "./node.class"
import { PriorityQueue } from "./priority-queue.class"
import { State } from "./state.class"

export class SearchUsingAStar {
    root: Node
    start: State
    goal: State
    heuristic: NPuzzleHeuristics
    solution: Node[] = []
    solved: boolean = false
    openList: PriorityQueue = new PriorityQueue()
    closedList: Set<String> = new Set()

    constructor(start: State, goal: State, heuristic: NPuzzleHeuristics) {
        this.start = start
        this.goal = goal
        this.heuristic = heuristic
        this.root = new Node(start, 0, null);
    }

    isClosed(state: State) {
        return !!this.closedList.has(state.arr.toString())
    }

    addToCloseList(node: Node) {
        let key = node.state.arr.toString()
        this.closedList.add(key)
    }

    search() {
        this.openList = new PriorityQueue();
        this.openList.add(this.root);
        this.addToCloseList(this.root);
        let solution: Node[] = []

        while (this.openList.count() > 0) {
            let current: Node = this.openList.getAndRemoveTop();
            if (this.goal.equals(current.state, this.goal)) {
                // fill the solution.
                let s: Node = current;
                do {
                    solution.unshift(s);
                    s = s.parent;
                } while (s != null);
                let us = solution.map(uss => {
                    return {
                        cost: uss.cost,
                        depth: uss.depth,
                        board: uss.state.arr
                    }
                })
                console.log(JSON.stringify(us))
                let nbMove = solution.length - 1 // don't count start state
                console.log(`Solution found.. [${this.closedList.size}]\nTotal moves needed : ${nbMove}`)
                this.solution = solution
                this.solved = true
                break
            }

            let zero: number = current.state.findEmptyTileIndex();
            let neighbours: number[] = current.state.getNeighboursForIndex(zero)

            for (let next of neighbours) {
                let state: State = new State(current.state, current.state.goal);
                state.swapWithEmpty(next);
                if (!this.isClosed(state)) {
                    let n: Node = new Node(state, current.depth + 1);
                    n.parent = current;
                    this.openList.add(n);
                    this.addToCloseList(n)
                }
            }
        }
        return this.solution
    }

}

