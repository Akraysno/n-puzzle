import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NPuzzleFinalState } from '../__models/enums/n-puzzle-final-state.enum'
import { NPuzzleAlgo, NPuzzleAlgoLabel } from '../__models/enums/n-puzzle-algo.enum'
import { NPuzzleHeuristics, NPuzzleHeuristicsLabel } from '../__models/enums/n-puzzle-heuristics.enum'
import { TileMove } from '../__models/n-puzzle.entity'
import { TileMoveDirection } from '../__models/enums/tile-move-direction.enum';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { State } from '../_classes/state.class';
import { Result } from '../_classes/result.class';
import { ErrorsService } from '../_services/errors.service';
import { BoardColorType, Config, Settings, TileColorType } from '../_classes/settings.class';

const TILE_SIZE: number = 100

@Component({
  selector: 'app-n-puzzle',
  templateUrl: './n-puzzle.component.html',
  styleUrls: [
    './n-puzzle.component.scss',
    './puzzle.scss'
  ],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('moveRight', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX({{tileSlide}}px)', offset: 0.8 }),
          style({ transform: 'translateX({{tileSlide}}px)', offset: 1 }),
        ])), { params: { tileSlide: TILE_SIZE } }
      )
    ]),
    trigger('moveLeft', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-{{tileSlide}}px)', offset: 0.8 }),
          style({ transform: 'translateX(-{{tileSlide}}px)', offset: 1 }),
        ])), { params: { tileSlide: TILE_SIZE } }
      )
    ]),
    trigger('moveBottom', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY({{tileSlide}}px)', offset: 0.8 }),
          style({ transform: 'translateY({{tileSlide}}px)', offset: 1 }),
        ])), { params: { tileSlide: TILE_SIZE } }
      )
    ]),
    trigger('moveTop', [
      transition('* => true',
        animate('500ms linear', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(-{{tileSlide}}px)', offset: 0.8 }),
          style({ transform: 'translateY(-{{tileSlide}}px)', offset: 1 }),
        ])), { params: { tileSlide: TILE_SIZE } }
      )
    ])
  ]
})

export class NPuzzleComponent implements OnInit {
  resultTileSize: number = TILE_SIZE
  settings: Settings
  config: Config
  loading: boolean = false
  result: PuzzleSolution
  tileMoveDirection = TileMoveDirection
  finalStateType = NPuzzleFinalState
  algorithms = NPuzzleAlgo
  algoLabel = NPuzzleAlgoLabel
  heuristics = NPuzzleHeuristics
  heuristicLabel = NPuzzleHeuristicsLabel
  tileColorType = TileColorType
  boardColorType = BoardColorType
  menuTab = MenuTab
  currentMenuTab: MenuTab = MenuTab.CONFIGURATION

  constructor(
    private errorsService: ErrorsService,
  ) { }

  ngOnInit() {
    this.settings = new Settings()
  }

  resolve(config: Config) {
    this.config = config
    this.loading = true
    this.result = null
    setTimeout(() => {
      let state = new State(this.config.startState, this.config.finalState, this.config.size)
      state.solve(this.config.algo, this.config.heuristic, this.config.algo === NPuzzleAlgo.WEIGHTED_ASTAR ? 2 : 1).subscribe(res => {
        console.log(res)
        this.result = new PuzzleSolution(res)
        this.loading = false
        this.currentMenuTab = MenuTab.RESULT
      }, err => {
        this.result = null
        this.loading = false
        this.errorsService.displayError(err)
      })
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
    let nextMove: TileMove = this.result.puzzle.operations[nextStepIndex + (back === true ? 1 : 0)]
    nextMove.back = back
    this.result.nextStepIndex = nextStepIndex
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
      this.result.running = false
      this.result.currentStepIndex = this.result.nextStepIndex
      this.result.progress = ((this.result.currentStepIndex + 1) / this.result.maxStep) * 100
      setTimeout(() => {
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

  resetPuzzlePosition() {
    this.result.reset()
  }

  tabMenuChange(event: number) {
    console.log(event)
    this.currentMenuTab = event
  }

}

class PuzzleSolution {
  running: boolean = false
  puzzle: Result
  currentState: number[]
  nextState: number[]
  currentStepIndex: number
  nextStepIndex: number
  maxStep: number
  progress: number
  currentMove: TileMove
  autoRun: boolean
  nbCloseList: number
  nbOpenList: number
  duration: number

  constructor(puzzle: Result) {
    if (!puzzle) return
    this.puzzle = puzzle
    this.reset()
  }

  reset() {
    this.running = false
    this.currentState = [...this.puzzle.start]
    this.currentStepIndex = 0
    this.maxStep = this.puzzle.nbMoves
    this.progress = ((this.currentStepIndex + 1) / this.maxStep) * 100
    this.currentMove = null
    this.autoRun = false
  }
}

enum MenuTab {
  CONFIGURATION = 0,
  RESULT,
  SETTINGS
}