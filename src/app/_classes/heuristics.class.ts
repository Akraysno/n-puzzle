import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum";

export type DistHeuristic = (board: number[], final: number[], size: number) => number;
export type Coords = {
    x: number,
    y: number
}

export class Heuristics {
    static heuristics = {
        [NPuzzleHeuristics.CARTESIAN]: Heuristics.cartesian,
        [NPuzzleHeuristics.HAMMING]: Heuristics.hamming,
        [NPuzzleHeuristics.LINEAR_CONFLICT]: Heuristics.linearConflict,
        [NPuzzleHeuristics.MANHATTAN]: Heuristics.manhattan,
    }

    /** Returns the number of misplaced nodes, it's extremely bad */
    hamming: number
    static hamming(board: number[], final: number[], size: number): number {
        let dist: number = 0
        for (let i = 0; i < size * size; i++) {
            if (board[i] !== 0 && board[i] !== final[i]) {
                dist++
            }
        }
        return dist
    }

    /** Returns sum of tile distance on plane, not great for n-puzzles */
    static cartesian(board: number[], final: number[], size: number): number {
        let dist: number = 0
        for (let [index, tile] of board.entries()) {
            if (tile === 0) continue
            let finalIndex = final.indexOf(tile)
            if (finalIndex === index) continue
            let currentPos: Coords = {
                x: index % size,
                y: Math.floor(index / size)
            }
            let finalPos: Coords = {
                x: finalIndex % size,
                y: Math.floor(finalIndex / size)
            }
            let currentDist: number = Math.sqrt(Math.pow(currentPos.x - finalPos.x, 2) + Math.pow(currentPos.y - finalPos.y, 2));
            dist += currentDist;
        }
        return dist
    }

    /** Returns sum of tile distance on a grid, great heuristic for our use */
    static manhattan(board: number[], final: number[], size: number): number {
        let dist: number = 0;
        for (let [index, tile] of board.entries()) {
            if (tile === 0) continue
            let finalIndex = final.indexOf(tile)
            if (finalIndex === index) continue
            let currentPos: Coords = {
                x: index % size,
                y: Math.floor(index / size)
            }
            let finalPos: Coords = {
                x: finalIndex % size,
                y: Math.floor(finalIndex / size)
            }
            let currentCost: number = Math.abs(currentPos.x - finalPos.x) + Math.abs(currentPos.y - finalPos.y);
            dist += currentCost;
        }
        return dist;
    }

    /**
     * TODO: more in-depth checks
     * The best heuristic, by far
     * 
     * TODO2: Check if work with spiral pattern
     */
    static linearConflict(board: number[], final: number[], size: number): number {
        const sort2 = (a: number, b: number): [number, number] => {
            return (a < b) ? [a, b] : [b, a]
        };

        let conflicts: number = 0;
        for (let y = 0; y < size; y++) {
            console.log('y:', y)
            for (let x = 0; x < size; x++) {
                console.log('x:', x)
                const index = y * size + x;
                console.log('index:', index)
                if (board[index] === 0) continue
                const correct_cell = [(board[index] - 1) % size, Math.floor((board[index] - 1) / size)];
                console.log(x, y, correct_cell[0], correct_cell[1])
                // cell is in correct position
                if ([x, y] === correct_cell) continue
                if (x === correct_cell[0]) {
                    // cell is in correct column
                    console.log('cell is in correct column')
                    const [start, end] = sort2(correct_cell[1], y);
                    for (let y1 = start; y1 < end; y1++) {
                        console.log('y1:', y1)
                        const index1 = y1 * size + x;
                        const curr_cell_x = (board[index1] - 1) % size;
                        if (curr_cell_x === x) {
                            console.log('CONFLIT X')
                            conflicts++
                        }
                    }
                } else if (y === correct_cell[1]) {
                    // cell is in correct row
                    console.log('cell is in correct row')
                    const [start, end] = sort2(correct_cell[0], x);
                    for (let x1 = start; x1 < end; x1++) {
                        console.log('x1:', x1)
                        const index1 = y * size + x1;
                        const curr_cell_y = Math.floor((board[index1] - 1) / size);
                        if (curr_cell_y === y) {
                            console.log('CONFLIT Y')
                            conflicts++
                        }
                    }
                }
            }
        }
        return this.manhattan(board, final, size) + conflicts * 2;
    }
}