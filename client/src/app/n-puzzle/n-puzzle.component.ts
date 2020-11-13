import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash'
import { NPuzzleFinalState } from '../../../../entities/n-puzzle/enums/n-puzzle-final-state.enum'
import { NPuzzleAlgo } from '../../../../entities/n-puzzle/enums/n-puzzle-algo.enum'
import { NPuzzle, TileMove } from '../../../../entities/n-puzzle/n-puzzle.entity'
import { NPuzzleService } from '../_services/n-puzzle.service'
import { ErrorsService } from '../_services/errors.service';
import { TileMoveDirection } from '../../../../entities/n-puzzle/enums/tile-move-direction.enum';
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
    ]),
  ]
})

export class NPuzzleComponent implements OnInit {
  sizes = [3, 4, 5]
  currentSize: number = 3
  currentFinalStateType: NPuzzleFinalState = NPuzzleFinalState.SPIRAL
  currentAlgo: NPuzzleAlgo = NPuzzleAlgo.ASTAR
  settings: Settings
  finalStateType = NPuzzleFinalState
  algorithms = NPuzzleAlgo
  loading: boolean = false
  currentSolvedPuzzle: CustomNPuzzle
  nextStepSolvedPuzzle: CustomNPuzzle
  tileMoveDirection = TileMoveDirection
  autoMove: boolean = true

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
        this.settings.isSolvable = this.validateInversions(this.settings.size, this.settings.startState, this.settings.finalState)
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
    this.settings.finalState = this.generateFinalBoard(this.settings.size, type)
    this.settings.isSolvable = this.validateInversions(this.settings.size, this.settings.startState, this.settings.finalState)
    this.currentFinalStateType = type
  }

  onAlgoChange(algo: NPuzzleAlgo) {
    this.currentAlgo = algo
  }

  private generateValidRandomBoard(size?: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): Settings {
    if (!size || size <= 0) {
      size = 3
    }
    let settings = new Settings()
    settings.isSolvable = false
    settings.size = size
    while (!settings.isSolvable) {
      settings.startState = this.generateRandomBoard(size)
      settings.finalState = this.generateFinalBoard(size, type)
      settings.isSolvable = this.validateInversions(settings.size, settings.startState, settings.finalState)
    }
    return settings
  }

  private generateRandomBoard(size?: number): number[] {
    if (!size || size <= 0) {
      size = 3
    }
    let tmpArray: number[] = Array(Math.pow(size, 2)).fill(-1).map((v, i) => i)
    let shuffleArray: number[] = []
    while (tmpArray.length > 0) {
      let r = Math.floor(Math.random() * tmpArray.length);
      shuffleArray.push(tmpArray.splice(r, 1)[0])
    }
    return shuffleArray
  }

  private validateInversions(boardSize: number, board: number[], finalBoard: number[]) {
    let start: number[][] = _.chunk(board, boardSize)
    let final: number[][] = _.chunk(finalBoard, boardSize)
    const findD = () => {
      let xi: number
      let yi: number
      let xf: number
      let yf: number
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (start[i][j] === 0) {
            xi = j
            yi = i
            break
          }
        }
      }
      if (boardSize % 2 !== 0) {
        xf = Math.ceil(boardSize / 2)
        yf = Math.ceil(boardSize / 2)
      } else {
        xf = boardSize / 2 - 1
        yf = boardSize / 2
      }
      let d = Math.abs(xf - xi) + Math.abs(yf - yi)
      return d
    }
    const findP = () => {
      let tab: number[] = []
      let p: number = 0
      for (let line of start) {
        tab = tab.concat(line)
      }
      let finalTab: number[] = []
      for (let line of final) {
        finalTab = finalTab.concat(line)
      }

      for (let i = 0; i < tab.length; i++) {
        for (let j = 0; j < tab.length; j++) {
          if (finalTab.indexOf(tab[i]) > finalTab.indexOf(tab[j])) {
            let tmp = tab[j]
            tab[j] = tab[i]
            tab[i] = tmp
            p++
          }
        }
      }
      return p
    }

    return (findD() % 2) === (findP() % 2)
  }

  private generateFinalBoard(size: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): number[] {
    let final: number[][] = []
    if (type === NPuzzleFinalState.LINE) {
      let len = Math.pow(size, 2)
      let finalBoard: number[] = Array(len).fill(0, 0, len).map((v, i) => (i + 1) === len ? 0 : (i + 1))
      final = _.chunk(finalBoard, size)
    } else if (type === NPuzzleFinalState.SPIRAL) {
      final = Array(size).fill(null, 0, size).map(row => {
        return Array(size).fill(-1, 0, size)
      })

      let nbCase: number = size * size
      let dirIsHoriz: boolean = true
      let x: number = 0
      let y: number = 0
      let xNeg: boolean = false
      let yNeg: boolean = false
      let nbCaseFilled: number = 0

      while (nbCase !== nbCaseFilled) {
        final[x][y] = nbCaseFilled + 1 < nbCase ? nbCaseFilled + 1 : 0
        if (dirIsHoriz === true) {
          if (y < size - 1) {
            if (final[x][y + (yNeg ? -1 : 1)] === -1) {
              y += (yNeg ? -1 : 1)
            } else {
              x += (xNeg ? -1 : 1)
              dirIsHoriz = false
              yNeg = !yNeg
            }
          } else {
            x += (xNeg ? -1 : 1)
            dirIsHoriz = false
            yNeg = !yNeg
          }
        } else {
          if (x < size - 1) {
            if (final[x + (xNeg ? -1 : 1)][y] === -1) {
              x += (xNeg ? -1 : 1)
            } else {
              y += (yNeg ? -1 : 1)
              dirIsHoriz = true
              xNeg = !xNeg
            }
          } else {
            y += (yNeg ? -1 : 1)
            dirIsHoriz = true
            xNeg = !xNeg
          }
        }
        nbCaseFilled++
      }
      final
    }
    return _.flatten(final)
  }

  resolve() {
    this.loading = true
    this.nPuzzleService.resolve(this.currentAlgo, this.settings.size, this.settings.startState, this.settings.finalState).subscribe((res: CustomNPuzzle) => {
      console.log(res)
      res.currentState = res.origin
      res.stateIndex = 0
      this.currentSolvedPuzzle = res
      this.loading = false
    }, err => {
      this.errorsService.displayError(err)
      this.loading = false
    })
  }

  nextMove() {
    if (!this.currentSolvedPuzzle) return

    let currentStep = this.currentSolvedPuzzle.operations[this.currentSolvedPuzzle.stateIndex]
    let nextStepIndex = this.currentSolvedPuzzle.stateIndex + 1

    if (nextStepIndex >= this.currentSolvedPuzzle.nbMoves) return
    
    let nextStep = this.currentSolvedPuzzle.operations[nextStepIndex]
    this.currentSolvedPuzzle.stateIndex = nextStepIndex
    let nextStepSolvedPuzzle = _.cloneDeep(this.currentSolvedPuzzle)
    this.currentSolvedPuzzle.currentOperation = nextStep

    nextStepSolvedPuzzle.currentOperation = null
    let p = nextStepSolvedPuzzle.currentState
    let tileIndex = p.indexOf(nextStep.tile)
    let zeroIndex = p.indexOf(0)
    p[zeroIndex] = nextStep.tile
    p[tileIndex] = 0
    this.nextStepSolvedPuzzle = nextStepSolvedPuzzle
  }

  goToNextStep(event: any, direction: TileMoveDirection) {
    if (!this.nextStepSolvedPuzzle || !this.currentSolvedPuzzle || !this.currentSolvedPuzzle.currentOperation) return
    if (direction === this.currentSolvedPuzzle.currentOperation.direction) {
      if (event.totalTime > 0 && event.phaseName === 'done' && event.toState === true) {
        this.currentSolvedPuzzle = this.nextStepSolvedPuzzle
        if (this.autoMove) {
          setTimeout(() => this.nextMove(), 100)
        }
      }
    }
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
  currentState: number[]
  stateIndex: number
  currentOperation: TileMove
}