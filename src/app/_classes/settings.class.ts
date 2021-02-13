import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum"
import { NPuzzleFinalState } from "../__models/enums/n-puzzle-final-state.enum"
import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum"
import { Board } from "./board.class"

export class Config {
    size: number = 3
    startState: number[] = []
    finalState: number[] = []
    selectedTile: number = undefined
    isSolvable: boolean = false
    heuristic: NPuzzleHeuristics = NPuzzleHeuristics.MANHATTAN
    algo: NPuzzleAlgo = NPuzzleAlgo.WEIGHTED_ASTAR
}

export class Settings {
    nbShuffleIterations: number = 100
    boardColorType: BoardColorType = BoardColorType.DARK
    tileColorType: TileColorType = TileColorType.UNITED
    tilesColor: TileColor = new TileColor(this.tileColorType, new Color(255, 255, 255))
}

export class TileColor {
    static sizes: number[] = [3, 4, 5]
    3: string[] = []
    4: string[] = []
    5: string[] = []

    constructor(type: TileColorType, startColor: Color, endColor?: Color) {
        this.fillColors(type, startColor, endColor)
    }

    fillColors(type: TileColorType, startColor: Color, endColor?: Color) {
        switch (type) {
            case TileColorType.UNITED: this.setUnitedColor(startColor); break;
            case TileColorType.DIAGONAL: this.setDiagonalColor(startColor, endColor || startColor); break;
            case TileColorType.SPIRAL: this.setSpiralColor(startColor, endColor || startColor); break;
            default: this.setUnitedColor(startColor); break;
        }
    }

    private setSpiralColor(startColor: Color, endColor: Color) {
        for (let s of TileColor.sizes) {
            let nbStep: number = (s * s) - 1
            let redInterval: number = this.getColorInterval(startColor.red, endColor.red, nbStep)
            let greenInterval: number = this.getColorInterval(startColor.green, endColor.green, nbStep)
            let blueInterval: number = this.getColorInterval(startColor.blue, endColor.blue, nbStep)
            let spiralBoard = Board.generateFinalBoard(s, NPuzzleFinalState.SPIRAL)
            let colorTiles = new Array(s * s).fill(startColor.toHex())
            for (let [index, tile] of colorTiles.entries()) {
                let tileNumber = spiralBoard[index] - 1
                console.log(tileNumber, nbStep)
                if (tileNumber === 0) {
                    colorTiles[index] = startColor.toHex()
                } else if (tileNumber === nbStep) {
                    colorTiles[index] = endColor.toHex()
                } else {
                    let tileColor = new Color(startColor.red + (redInterval * tileNumber), startColor.green + (greenInterval * tileNumber), startColor.blue + (blueInterval * tileNumber))
                    colorTiles[index] = tileColor.toHex()
                }
            }
            this[s] = colorTiles
        }
    }

    private setDiagonalColor(startColor: Color, endColor: Color) {
        for (let s of TileColor.sizes) {
            let nbStep: number = (s - 1) + (s - 1)
            let redInterval: number = this.getColorInterval(startColor.red, endColor.red, nbStep)
            let greenInterval: number = this.getColorInterval(startColor.green, endColor.green, nbStep)
            let blueInterval: number = this.getColorInterval(startColor.blue, endColor.blue, nbStep)
            let colorTiles = new Array(s * s).fill(startColor.toHex())
            for (let [index, tile] of colorTiles.entries()) {
                let currentStep = (index % s) + Math.floor(index / s)
                if (currentStep === 0) {
                    colorTiles[index] = startColor.toHex()
                } else if (currentStep === nbStep) {
                    colorTiles[index] = endColor.toHex()
                } else {
                    let tileColor = new Color(startColor.red + (redInterval * currentStep - 1), startColor.green + (greenInterval * currentStep - 1), startColor.blue + (blueInterval * currentStep - 1))
                    colorTiles[index] = tileColor.toHex()
                }
            }
            this[s] = colorTiles
        }
    }

    private setUnitedColor(color: Color) {
        for (let s of TileColor.sizes) {
            this[s] = new Array(s * s).fill(color.toHex())
        }
    }

    private getColorInterval(c1: number, c2: number, nbStep: number) {
        return Math.floor((c2 - c1)  / nbStep)
    }

}

export class Color {
    static hexaChars: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    red: number
    green: number
    blue: number

    constructor(r: number, g: number, b: number) {
        this.red = r >= 0 ? (r <= 255 ? r : 255) : 0
        this.green = g >= 0 ? (g <= 255 ? g : 255) : 0
        this.blue = b >= 0 ? (b <= 255 ? b : 255) : 0
    }

    toHex(): string {
        let color: string = `#`
        color += Color.hexaChars[Math.floor(this.red / 16)]
        color += Color.hexaChars[this.red % 16]
        color += Color.hexaChars[Math.floor(this.green / 16)]
        color += Color.hexaChars[this.green % 16]
        color += Color.hexaChars[Math.floor(this.blue / 16)]
        color += Color.hexaChars[this.blue % 16]
        return color
    }

    static hexaToColor(hexa: string): Color {
        let currentHexa: string = hexa
        if (!currentHexa || !currentHexa.length) {
            return new Color(255, 255, 255)
        }
        if (currentHexa[0] === '#') {
            currentHexa = currentHexa.slice(1)
        }
        if (currentHexa.length !== 6) {
            return new Color(255, 255, 255)
        }
        currentHexa = currentHexa.toUpperCase()
        let red: number = Color.hexaChars.indexOf(currentHexa[0]) * 16 + Color.hexaChars.indexOf(currentHexa[1])
        let green: number = Color.hexaChars.indexOf(currentHexa[2]) * 16 + Color.hexaChars.indexOf(currentHexa[3])
        let blue: number = Color.hexaChars.indexOf(currentHexa[4]) * 16 + Color.hexaChars.indexOf(currentHexa[5])
        return new Color(red, green, blue)
    }
}

export enum BoardColorType {
    LIGHT = 'LIGHT',
    DARK = 'DARK',
}

export enum TileColorType {
    UNITED = 'UNITED',
    SPIRAL = 'SPIRAL',
    DIAGONAL = 'DIAGONAL'
}