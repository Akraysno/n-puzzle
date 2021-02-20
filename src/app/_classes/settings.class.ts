import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum"
import { NPuzzleFinalState } from "../__models/enums/n-puzzle-final-state.enum"
import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum"
import { Board } from "./board.class"
import * as chroma from 'chroma-js'

export class Config {
    size: number = 3
    startState: number[] = []
    finalState: number[] = []
    selectedTile: number = undefined
    isSolvable: boolean = false
    heuristic: NPuzzleHeuristics = NPuzzleHeuristics.MANHATTAN
    algo: NPuzzleAlgo = NPuzzleAlgo.WEIGHTED_ASTAR
    greedySearch: boolean = false
}

export class Settings {
    private defaultTileColor: string = '#FFFFFF'
    private defaultTextColor: string = '#000000'
    nbShuffleIterations: number = 100
    boardColorType: BoardColorType = BoardColorType.DARK
    tileColorType: TileColorType = TileColorType.UNITED
    gradientType: GradientType = GradientType.HSL
    currentSizeColor: number = 3
    colors: string[] = TileColor.calcColors(this.tileColorType, 3, new Color(255, 255, 255))
    textColors: string[] = TileColor.calcTextColor(this.colors)

    refreshColors(tileColorType: TileColorType, size: number, color1: Color, color2: Color, gradientType: GradientType) {
        this.currentSizeColor = size
        this.tileColorType = tileColorType
        this.colors = TileColor.calcColors(this.tileColorType, this.currentSizeColor, color1, color2, gradientType)
        this.textColors = TileColor.calcTextColor(this.colors)
        this.gradientType = gradientType
    }

    calcColor(tileIndex: number, size: number): string {
        if (this.tileColorType === TileColorType.UNITED) {
            if (this.colors && this.colors.length) {
                return this.colors[0]
            }
        } else if (size === this.currentSizeColor && tileIndex < this.colors.length && tileIndex >= 0) {
            return this.colors[tileIndex]
        }
        return this.defaultTileColor
    }

    calcTextColor(tileIndex: number, size: number) {
        if (this.tileColorType === TileColorType.UNITED) {
            if (this.textColors && this.textColors.length) {
                return this.textColors[0]
            }
        } else if (size === this.currentSizeColor && tileIndex < this.textColors.length && tileIndex >= 0) {
            return this.textColors[tileIndex]
        }
        return this.defaultTextColor
    }
}

export class TileColor {
    static calcColors(type: TileColorType, size: number, startColor: Color, endColor?: Color, gradientType: GradientType = GradientType.HSL): string[] {
        let colors: string[] = []
        switch (type) {
            case TileColorType.UNITED: colors = TileColor.calcUnitedColor(startColor); break;
            case TileColorType.DIAGONAL: colors = TileColor.calcDiagonalColor(size, startColor, endColor || startColor, gradientType); break;
            case TileColorType.SPIRAL: colors = TileColor.calcSpiralColor(size, startColor, endColor || startColor, gradientType); break;
            default: colors = TileColor.calcUnitedColor(startColor); break;
        }
        return colors
    }

    static calcSpiralColor(size: number, startColor: Color, endColor: Color, gradientType: GradientType = GradientType.HSL): string[] {
        let nbStep: number = (size * size) - 1

        let baseColor = chroma.scale([startColor.toHex(), endColor.toHex()]).mode(gradientType)
        let spiralBoard = Board.generateFinalBoard(size, NPuzzleFinalState.SPIRAL)
        let colorTiles = new Array(size * size).fill(startColor.toHex())
        for (let [index, tile] of colorTiles.entries()) {
        //for (let i = 0; i < nbStep; i++) {
            let tileNumber = spiralBoard[index] - 1
            let s = (1 / nbStep) * tileNumber
            let col = baseColor(s).hex()
            colorTiles[index] = col
        }
        return colorTiles
    }

    static calcDiagonalColor(size: number, startColor: Color, endColor: Color, gradientType: GradientType = GradientType.HSL) {
        let nbStep: number = (size - 1) + (size - 1)
        let baseColor = chroma.scale([startColor.toHex(), endColor.toHex()]).mode(gradientType)
        let colorTiles = new Array(size * size).fill(startColor.toHex())
        for (let [index, tile] of colorTiles.entries()) {
            let currentStep = (index % size) + Math.floor(index / size)
            let s = (1 / nbStep) * currentStep
            let col = baseColor(s).hex()
            colorTiles[index] = col
        }
        return colorTiles
    }

    static calcUnitedColor(color: Color) {
        return [color.toHex()]
    }

    static getColorInterval(c1: number, c2: number, nbStep: number) {
        return Math.floor((c2 - c1) / nbStep)
    }

    static calcTextColor(colors: string[]) {
        let textColors: string[] = []

        const isLight = (color: Color) => {
            let hsp = Math.sqrt(0.299 * (color.red * color.red) + 0.587 * (color.green * color.green) + 0.114 * (color.blue * color.blue))
            if (hsp > 127.5) {
                return true
            } else {
                return false
            }
        }

        for (let c of colors) {
            if (isLight(Color.hexaToColor(c)) === true) {
                textColors.push('#000000')
            } else {
                textColors.push('#FFFFFF')
            }
        }
        return textColors
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

export enum GradientType {
    HCL = 'hcl',
    HSI = 'hsi',
    HSL = 'hsl',
    HSV = 'hsv',
    LAB = 'lab',
    LCH = 'lch',
    LRGB = 'lrgb',
    RGB = 'rgb'
}