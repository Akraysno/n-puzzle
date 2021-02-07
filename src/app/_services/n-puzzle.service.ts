import { Injectable } from "@angular/core";
import * as _ from 'lodash'
import { Observable } from "rxjs";
import { NPuzzleFinalState } from "../__models/enums/n-puzzle-final-state.enum";

@Injectable()
export class NPuzzleService {

  constructor() { }

  checkPuzzle(startState: number[], finalState: number[], size: number): Observable<boolean> {
    return new Observable((obs) => {
      if (size < 1) {
        obs.error('Taille du puzzle incorrecte.')
      } else if (size * size !== startState.length) {
        obs.error(`La taille de l'état de départ ne correspond pas à la taille indiquée.`)
      } else if (size * size !== finalState.length) {
        obs.error(`La taille de l'état final ne correspond pas à la taille indiquée.`)
      } else {
        let startNumberList = startState.map(v => v).sort((a, b) => a > b ? 1 : -1)
        let failIndex = startNumberList.findIndex((val: number, index: number) => val !== index)
        if (failIndex !== -1) {
          obs.error(`Les nombres de l'état de départ sont incorrects.`)
        } else {
          let finalNumberList = finalState.map(v => v).sort((a, b) => a > b ? 1 : -1)
          let failIndex = finalNumberList.findIndex((val: number, index: number) => val !== index)
          if (failIndex !== -1) {
            obs.error(`Les nombres de l'état final sont incorrects.`)
          } else {
            obs.next(true)
            obs.complete()
          }
        }
      }
    })
  }

  validateInversions(boardSize: number, board: number[], finalBoard: number[]) {
    let start: number[][] = this.chunkArray(board, boardSize)
    let final: number[][] = this.chunkArray(finalBoard, boardSize)
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

  generateRandomBoard(size: number, finalBoard: number[], nbShuffleIterations: number = 100): number[] {
    const getRandomIndex = (i: number, size: number) => {
      const indexes = [];
      if (i % size > 0) indexes.push(i - 1);
      if (i % size < size - 1) indexes.push(i + 1);
      if (i / size > 0) indexes.push(i - size);
      if (i / size < size - 1) indexes.push(i + size);
      return indexes[Math.floor(Math.random() * indexes.length)];
    };

    if (!size || size <= 0) {
      size = 3
    }
    let shuffleArray: number[] = []
    if (nbShuffleIterations < 0) {
      let tmpArray: number[] = Array(Math.pow(size, 2)).fill(-1).map((v, i) => i)
      while (tmpArray.length > 0) {
        let r = Math.floor(Math.random() * tmpArray.length);
        shuffleArray.push(tmpArray.splice(r, 1)[0])
      }
    } else {
      let i = 0;
      shuffleArray = [...finalBoard];
      while (i < nbShuffleIterations) {
        const index = shuffleArray.findIndex(el => el === 0);
        let next: number = -1;
        while (next >= shuffleArray.length || next < 0) {
          next = getRandomIndex(index, size);
        }
        shuffleArray[index] = shuffleArray[next];
        shuffleArray[next] = 0;
        i += 1;
      }
    }
    console.log(shuffleArray)
    return shuffleArray
  }

  generateFinalBoard(size: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): number[] {
    let final: number[][] = []
    if (type === NPuzzleFinalState.LINE) {
      let len = Math.pow(size, 2)
      let finalBoard: number[] = Array(len).fill(0, 0, len).map((v, i) => (i + 1) === len ? 0 : (i + 1))
      final = this.chunkArray(finalBoard, size)
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
    return this.flattenArray(final)
  }

  private chunkArray(arr: any[], size: number) {
    let resultArray: any[][] = []
    let nbRow: number = Math.ceil(arr.length / size)
    for (let i = 0; i < nbRow; i++) {
      let index = i * size
      resultArray.push(arr.slice(index, index + size))
    }
    return resultArray
  }

  private flattenArray(arr: any[][]) {
    let resultArray: any[] = []
    for (let cell of arr) {
      resultArray = resultArray.concat(cell)
    }
    return resultArray
  }

}
