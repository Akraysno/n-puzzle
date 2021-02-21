import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { BoardColorType, Config, Settings, TileColorType } from '../../_classes/settings.class';
import { NPuzzleFinalState } from '../../__models/enums/n-puzzle-final-state.enum'
import { NPuzzleAlgo, NPuzzleAlgoLabel } from '../../__models/enums/n-puzzle-algo.enum'
import { NPuzzleHeuristics, NPuzzleHeuristicsLabel } from '../../__models/enums/n-puzzle-heuristics.enum'
import { TileMoveDirection } from '../../__models/enums/tile-move-direction.enum';
import { Board } from 'src/app/_classes/board.class';
import { NPuzzleService } from '../n-puzzle.service';
import { ActivatedRoute } from '@angular/router';
import { ErrorsService } from 'src/app/_services/errors.service';

@Component({
  selector: 'app-puzzle-config',
  templateUrl: './puzzle-config.component.html',
  styleUrls: [
    './puzzle-config.component.scss',
    '../puzzle.scss',
    '../popover.scss',
    '../side-menu.scss',
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
  sizes: number[] = [3, 4, 5]
  config: Config
  settings: Settings
  currentSize: number = 3
  currentFinalStateType: NPuzzleFinalState = NPuzzleFinalState.SPIRAL
  initialized: boolean = false
  currentHelp: HelpType
  customSize: number = 0
  
  tileMoveDirection = TileMoveDirection
  finalStateType = NPuzzleFinalState
  algorithms = NPuzzleAlgo
  algoLabel = NPuzzleAlgoLabel
  heuristics = NPuzzleHeuristics
  heuristicLabel = NPuzzleHeuristicsLabel
  tileColorType = TileColorType
  boardColorType = BoardColorType
  helpType = HelpType

  helpTooltip = {
    cost: `Valeur estimée du nombre de mouvements à faire pour arriver à la solution.`,
    openList: `La Liste Ouverte est la liste où sont stockées toutes les positions du puzzle à tester. Les positions sont triées par ordre croissant de coût.`,
    heuristic: `Voir l'aide de la section Heuristiques.`,
    algo: `Voir l'aide de la section Algorithmes.`,
    greedy: `Voir l'aide de la section Greedy Search.`,
    distance: `Dans notre cas la distance Cartésienne correspond aussi à la distance Euclidienne et à la distance de Pythagore soit: d = √(x² + y²) où x et y correspondent à la difference de coordonnées entre la position de départ et la position d'arrivée.`,
    conflicts: `Un conflit existe lorsque sur une même ligne, ou colonne, une pièce empêche une autre d'atteindre sa position finale.`,
    FIFO: `Une Queue FIFO (First In, First Out) est, comme son nom l'indique, une file ou les éléments sortent dans l'ordre où ils sont rentrés.`,
    mixingLevel: `Voir l'onglet Paramètres`
  }

  constructor(
    private nPuzzleService: NPuzzleService,
    private route: ActivatedRoute,
    private errorsService: ErrorsService,
  ) { }

  ngOnInit() {
    this.generateValidRandomBoard()
    this.route.queryParams.subscribe(params => {
      if (params && params.size) {
        let size = +params.size
        if (isNaN(size)) {
          this.errorsService.displayError(`La taille doit être un nombre. Taille par défaut utilisée.`)
        } else if (size < 2) {
          this.errorsService.displayError(`La taille doit être supérieur à 1. Taille par défaut utilisée.`)
        } else if (size > 20) {
          this.errorsService.displayError(`La taille doit être inférieur à 20, la taille est limité à 20 pour la lisibilité du rendu. Taille par défaut utilisée.`)
        } else {
          if (size < 3 || size > 5) {
            this.customSize = size
            this.sizes.push(size)
            this.sizes.sort((a, b) => a < b ? -1 : 1)
          }
          this.sizeChanged(size)
        }
      }
    })
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
        this.config.isSolvable = Board.validateInversions(this.config.size, this.config.startState, this.config.finalState)
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
    this.config.finalStateType = type
    this.config.finalState = Board.generateFinalBoard(this.config.size, type)
    this.config.isSolvable = Board.validateInversions(this.config.size, this.config.startState, this.config.finalState)
    this.currentFinalStateType = type
  }

  onAlgoChange(algo: NPuzzleAlgo) {
    this.config.algo = algo
  }

  onHeuristicChange(heuristic: NPuzzleHeuristics) {
    this.config.heuristic = heuristic
  }

  onGreedyChange(greedy: boolean) {
    this.config.greedySearch = greedy
  }

  private generateValidRandomBoard(size?: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): Config {
    if (!this.settings) return
    if (!size || size <= 0) {
      size = 3
    }
    let config = this.config || new Config()
    config.isSolvable = false
    config.size = size
    while (!config.isSolvable) {
      config.finalState = Board.generateFinalBoard(size, type)
      config.startState = Board.generateRandomBoard(size, config.finalState, this.settings.mixingComplexity)
      config.isSolvable = Board.validateInversions(config.size, config.startState, config.finalState)
    }
    this.config = config
    this.initialized = true
  }

  resolve() {
    this.nPuzzleService.sizeChanged.next(this.config.size)
    this.onResolve.emit(this.config)
  }

  showHelp(type: HelpType) {
    this.currentHelp = type
  }

  hideHelp() {
    this.currentHelp = null
  }

}

enum HelpType {
  SIZE = 'SIZE',
  ALGO = 'ALGO',
  HEURISTIC = 'HEURISTIC',
  GREEDY = 'GREEDY',
  START = 'START'
}