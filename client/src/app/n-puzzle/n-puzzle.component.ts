import { Component, OnInit } from '@angular/core';
import { NPuzzleFinalState } from '../../../../shared/models/enums/n-puzzle-final-state.enum'
import { NPuzzleAlgo } from '../../../../shared/models/enums/n-puzzle-algo.enum'
import { NPuzzleHeuristics } from '../../../../shared/models/enums/n-puzzle-heuristics.enum'
import { NPuzzle, TileMove } from '../../../../shared/models/n-puzzle.entity'
import { NPuzzleService } from '../_services/n-puzzle.service'
import { ErrorsService } from '../_services/errors.service';
import { TileMoveDirection } from '../../../../shared/models/enums/tile-move-direction.enum';
import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-n-puzzle',
  templateUrl: './n-puzzle.component.html',
  styleUrls: ['./n-puzzle.component.scss'],
  animations: [
    trigger('moveRight', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(100px)', offset: 0.8 }),
          style({ transform: 'translateX(100px)', offset: 1 }),
        ])),
      )
    ]),
    trigger('moveLeft', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-100px)', offset: 0.8 }),
          style({ transform: 'translateX(-100px)', offset: 1 }),
        ])),
      )
    ]),
    trigger('moveBottom', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(100px)', offset: 0.8 }),
          style({ transform: 'translateY(100px)', offset: 1 }),
        ])),
      )
    ]),
    trigger('moveTop', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(-100px)', offset: 0.8 }),
          style({ transform: 'translateY(-100px)', offset: 1 }),
        ])),
      )
    ])
  ]
})

export class NPuzzleComponent implements OnInit {
  sizes = [3, 4, 5]
  currentSize: number = 3
  currentFinalStateType: NPuzzleFinalState = NPuzzleFinalState.SPIRAL
  currentAlgo: NPuzzleAlgo = NPuzzleAlgo.ASTAR
  currentHeuristic: NPuzzleHeuristics = NPuzzleHeuristics.MANHATTAN
  settings: Settings
  loading: boolean = false
  result: PuzzleResult

  tileMoveDirection = TileMoveDirection
  finalStateType = NPuzzleFinalState
  algorithms = NPuzzleAlgo
  heuristics = NPuzzleHeuristics

  constructor(
    private nPuzzleService: NPuzzleService,
    private errorsService: ErrorsService,
  ) { }

  ngOnInit() {
    this.settings = this.generateValidRandomBoard(this.currentSize)
  }

  sizeChanged(size: number) {
    if (size !== this.currentSize) {
      this.currentSize = size
      this.settings = this.generateValidRandomBoard(size, this.currentFinalStateType)
    }
  }

  selectTile(tile: number) {
    if (this.settings.selectedTile >= 0) {
      if (this.settings.selectedTile === tile) {
        this.settings.selectedTile = undefined
      } else {
        let tileA: number = this.settings.selectedTile
        let tileB: number = tile
        let indexTileA: number = this.settings.startState.indexOf(tileA)
        let indexTileB: number = this.settings.startState.indexOf(tileB)
        this.settings.startState[indexTileA] = tileB
        this.settings.startState[indexTileB] = tileA
        this.settings.selectedTile = undefined
        this.settings.isSolvable = this.nPuzzleService.validateInversions(this.settings.size, this.settings.startState, this.settings.finalState)
      }
    } else {
      this.settings.selectedTile = tile
    }
  }

  onGenerateRandomBoard() {
    if (!this.settings || !this.settings.size) return
    this.settings = this.generateValidRandomBoard(this.settings.size, this.currentFinalStateType)
  }

  onFinalStateTypeChange(type: NPuzzleFinalState) {
    this.settings.finalState = this.nPuzzleService.generateFinalBoard(this.settings.size, type)
    this.settings.isSolvable = this.nPuzzleService.validateInversions(this.settings.size, this.settings.startState, this.settings.finalState)
    this.currentFinalStateType = type
  }

  onAlgoChange(algo: NPuzzleAlgo) {
    this.currentAlgo = algo
  }

  onHeuristicChange(heuristic: NPuzzleHeuristics) {
    this.currentHeuristic = heuristic
  }

  private generateValidRandomBoard(size?: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): Settings {
    if (!size || size <= 0) {
      size = 3
    }
    let settings = new Settings()
    settings.isSolvable = false
    settings.size = size
    while (!settings.isSolvable) {
      settings.startState = this.nPuzzleService.generateRandomBoard(size)
      settings.finalState = this.nPuzzleService.generateFinalBoard(size, type)
      settings.isSolvable = this.nPuzzleService.validateInversions(settings.size, settings.startState, settings.finalState)
    }
    return settings
  }

  resolve() {
    this.loading = true
    this.result = null
    this.nPuzzleService.resolvePuzzle(this.currentAlgo, this.settings.size, this.settings.startState, this.settings.finalState).subscribe((res: CustomNPuzzle) => {
      console.log(res)
      this.result = new PuzzleResult(res)
      this.loading = false
    }, err => {
      this.errorsService.displayError(err)
      this.loading = false
    })
  }

  nextMove(back: boolean) {
    if (!this.result || !this.result.puzzle || this.result.running) return
    let nextStepIndex = this.result.currentStepIndex + (back === true ? -1 : 1)
    if (nextStepIndex >= this.result.maxStep || nextStepIndex < 0) {
      this.result.autoRun = false
      return
    }
    this.result.running = true
    let nextMove = this.result.puzzle.operations[nextStepIndex + (back === true ? 1 : 0)]
    nextMove.back = back
    this.result.currentStepIndex = nextStepIndex
    this.result.currentMove = nextMove
    let p = this.result.currentState.map(v => v)
    let tileIndex = p.indexOf(nextMove.tile)
    let zeroIndex = p.indexOf(0)
    p[zeroIndex] = nextMove.tile
    p[tileIndex] = 0
    this.result.nextState = p
  }

  goToNextStep(event: any, direction: TileMoveDirection) {
    if (event.totalTime > 0 && event.phaseName === 'done' && event.toState === true) {
      if (!this.result || !this.result.puzzle || !this.result.currentMove || !this.result.running) return
      if (direction !== this.result.currentMove.direction) return
      this.result.currentMove = null
      this.result.currentState = this.result.nextState
      this.result.nextState = null
      this.result.progress = ((this.result.currentStepIndex + 1) / this.result.maxStep) * 100
      setTimeout(() => {
        this.result.running = false
        if (this.result.puzzle.final.join(',') === this.result.currentState.join(',')) {
          this.result.autoRun = false
        }
        if (this.result.autoRun) {
          this.nextMove(false)
        }
      })
    }
  }

  moveTile(autoRun: boolean, back: boolean = false) {
    this.result.autoRun = !!autoRun
    this.nextMove(back)
  }

  pause() {
    this.result.autoRun = false
  }
}

class Settings {
  size: number
  startState: number[]
  finalState: number[]
  selectedTile: number
  isSolvable: boolean
}

class CustomNPuzzle extends NPuzzle {
  operations: CustomTileMove[]
}

class CustomTileMove extends TileMove {
  back: boolean
}

class PuzzleResult {
  running: boolean = false
  puzzle: CustomNPuzzle
  currentState: number[]
  nextState: number[]
  currentStepIndex: number
  maxStep: number
  progress: number
  currentMove: TileMove
  autoRun: boolean
  nbCloseList: number
  nbOpenList: number
  duration: number

  constructor(puzzle: CustomNPuzzle) {
    if (!puzzle) return
    this.running = false
    this.puzzle = puzzle
    this.currentState = puzzle.origin.map(v => v)
    this.currentStepIndex = 0
    this.maxStep = puzzle.nbMoves
    this.progress = ((this.currentStepIndex + 1) / this.maxStep) * 100
    this.currentMove = null
    this.autoRun = false
  }
}