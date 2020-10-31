import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash'
import { NPuzzleFinalState } from '../../../../entities/n-puzzle/enums/n-puzzle-final-state.enum'

@Component({
  selector: 'app-n-puzzle',
  templateUrl: './n-puzzle.component.html',
  styleUrls: ['./n-puzzle.component.scss']
})
export class NPuzzleComponent implements OnInit {
  sizes = [3, 4, 5]
  currentSize: number = 3
  currentFinalStateType: NPuzzleFinalState = NPuzzleFinalState.SPIRAL
  settings: Settings
  finalStateType = NPuzzleFinalState

  constructor() { }

  ngOnInit() {
    this.settings = this.generateValidRandomBoard(this.currentSize)
  }

  sizeChanged(size: number) {
    if (size !== this.currentSize) {
      this.currentSize = size
      this.settings = this.generateValidRandomBoard(size)
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
    this.settings = this.generateValidRandomBoard(this.settings.size)
  }

  onFinalStateTypeChange(type: NPuzzleFinalState) {
    this.settings.finalState = this.generateFinalBoard(this.settings.size, type)
    this.settings.isSolvable = this.validateInversions(this.settings.size, this.settings.startState, this.settings.finalState)
    this.currentFinalStateType = type
  }

  private generateValidRandomBoard(size?: number): Settings {
    if (!size || size <= 0) {
      size = 3
    }
    let settings = new Settings()
    settings.isSolvable = false
    settings.size = size
    while (!settings.isSolvable) {
      settings.startState = this.generateRandomBoard(size)
      settings.finalState = this.generateFinalBoard(size)
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

  private validateInversions(boardSize: number, board: number[], final: number[]) {
    let size = boardSize * boardSize - 1
    let CountNumberOfRegularInversions = (toCheck: number[]) => {
      let num: number = 0;
      for (let i = 0; i < size; i++) {
        if (toCheck[i] !== 0) {
          for (let j = i + 1; j < size + 1; j++) {
            if (toCheck[j] !== 0 && toCheck[i] > toCheck[j]) {
              num++;
            }
          }
        }
      }
      return num;
    }

    let numberOfInversions: number = CountNumberOfRegularInversions(board)
    let numberOfInversionsSolution: number = CountNumberOfRegularInversions(final)
    let chunkedBoard: number[][] = _.chunk(board, boardSize)
    let chunkedFinal: number[][] = _.chunk(final, boardSize)
    let start0Index: number = -1;
    let goal0Index: number = -1;

    for (let i = 0; i < chunkedBoard.length; i++) {
      start0Index = chunkedBoard[i].findIndex(c => c === 0);
      if (start0Index > -1) {
        start0Index = i * chunkedBoard.length + start0Index;
        break;
      }
    }
    for (let i = 0; i < chunkedFinal.length; i++) {
      goal0Index = chunkedFinal[i].findIndex(c => c === 0);
      if (goal0Index > -1) {
        goal0Index = i * chunkedFinal.length + goal0Index;
        break;
      }
    }
    if (chunkedBoard.length % 2 === 0) { // In this case, the row of the '0' tile matters
      numberOfInversions += start0Index / chunkedBoard.length;
      numberOfInversionsSolution += goal0Index / chunkedFinal.length;
    }

    if (numberOfInversions % 2 !== numberOfInversionsSolution % 2) {
      return false
    }
    return true
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

}

class Settings {
  size: number
  startState: number[]
  finalState: number[]
  selectedTile: number
  isSolvable: boolean
}
