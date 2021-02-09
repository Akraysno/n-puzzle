import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Config, Settings } from '../../_classes/settings.class';
import { NPuzzleService } from '../../_services/n-puzzle.service'
import { NPuzzleFinalState } from '../../__models/enums/n-puzzle-final-state.enum'
import { NPuzzleAlgo, NPuzzleAlgoLabel } from '../../__models/enums/n-puzzle-algo.enum'
import { NPuzzleHeuristics, NPuzzleHeuristicsLabel } from '../../__models/enums/n-puzzle-heuristics.enum'
import { TileMoveDirection } from '../../__models/enums/tile-move-direction.enum';

@Component({
  selector: 'app-puzzle-config',
  templateUrl: './puzzle-config.component.html',
  styleUrls: [
    './puzzle-config.component.scss',
    '../puzzle.scss'
  ],
  encapsulation: ViewEncapsulation.None,
})

export class PuzzleConfigComponent implements OnInit {
  @Input('settings') set setSettings(settings: Settings) {
    this.settings = settings || new Settings()
    if (!this.initialized) {
      this.generateValidRandomBoard()
    }
  }
  @Input() loading: boolean = false
  @Output() onResolve: EventEmitter<Config> = new EventEmitter()
  config: Config
  settings: Settings
  currentSize: number = 3
  currentFinalStateType: NPuzzleFinalState = NPuzzleFinalState.SPIRAL
  tileMoveDirection = TileMoveDirection
  finalStateType = NPuzzleFinalState
  algorithms = NPuzzleAlgo
  algoLabel = NPuzzleAlgoLabel
  heuristics = NPuzzleHeuristics
  heuristicLabel = NPuzzleHeuristicsLabel
  initialized: boolean = false

  constructor(
    private nPuzzleService: NPuzzleService,
  ) { }

  ngOnInit() {
    this.generateValidRandomBoard()
  }

  sizeChanged(size: number) {
    if (size !== this.currentSize) {
      this.currentSize = size
      this.generateValidRandomBoard(size, this.currentFinalStateType)
    }
  }

  selectTile(tile: number) {
    if (this.config.selectedTile >= 0) {
      if (this.config.selectedTile === tile) {
        this.config.selectedTile = undefined
      } else {
        let tileA: number = this.config.selectedTile
        let tileB: number = tile
        let indexTileA: number = this.config.startState.indexOf(tileA)
        let indexTileB: number = this.config.startState.indexOf(tileB)
        this.config.startState[indexTileA] = tileB
        this.config.startState[indexTileB] = tileA
        this.config.selectedTile = undefined
        this.config.isSolvable = this.nPuzzleService.validateInversions(this.config.size, this.config.startState, this.config.finalState)
      }
    } else {
      this.config.selectedTile = tile
    }
  }

  onGenerateRandomBoard() {
    if (!this.config || !this.config.size) return
    this.generateValidRandomBoard(this.config.size, this.currentFinalStateType)
  }

  onFinalStateTypeChange(type: NPuzzleFinalState) {
    this.config.finalState = this.nPuzzleService.generateFinalBoard(this.config.size, type)
    this.config.isSolvable = this.nPuzzleService.validateInversions(this.config.size, this.config.startState, this.config.finalState)
    this.currentFinalStateType = type
  }

  onAlgoChange(algo: NPuzzleAlgo) {
    this.config.algo = algo
  }

  onHeuristicChange(heuristic: NPuzzleHeuristics) {
    this.config.heuristic = heuristic
  }

  private generateValidRandomBoard(size?: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): Config {
    if (!this.settings) return
    if (!size || size <= 0) {
      size = 3
    }
    let config = new Config()
    config.isSolvable = false
    config.size = size
    while (!config.isSolvable) {
      config.finalState = this.nPuzzleService.generateFinalBoard(size, type)
      config.startState = this.nPuzzleService.generateRandomBoard(size, config.finalState, this.settings.nbShuffleIterations)
      config.isSolvable = this.nPuzzleService.validateInversions(config.size, config.startState, config.finalState)
    }
    this.config = config
    this.initialized = true
  }

  resolve() {
    this.onResolve.emit(this.config)
  }

}
