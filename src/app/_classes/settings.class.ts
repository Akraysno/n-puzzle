import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum"
import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum"

export class Config {
    size: number = 3
    startState: number[] = []
    finalState: number[] = []
    selectedTile: number = undefined
    isSolvable: boolean = false
    heuristic: NPuzzleHeuristics = NPuzzleHeuristics.MANHATTAN
    algo: NPuzzleAlgo = NPuzzleAlgo.ASTAR
}

export class Settings {
    nbShuffleIterations: number = 100
}
  