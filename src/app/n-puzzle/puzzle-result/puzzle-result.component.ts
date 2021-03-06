import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Result } from 'src/app/_classes/result.class';
import { NPuzzleAlgoLabel } from 'src/app/__models/enums/n-puzzle-algo.enum';
import { NPuzzleHeuristicsLabel } from 'src/app/__models/enums/n-puzzle-heuristics.enum';
import { TileMoveDirection } from 'src/app/__models/enums/tile-move-direction.enum';

@Component({
  selector: 'app-puzzle-result',
  templateUrl: './puzzle-result.component.html',
  styleUrls: [
    './puzzle-result.component.scss',
    '../side-menu.scss',
    '../popover.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})

export class PuzzleResultComponent implements OnInit {
  @Input() result: Result
  @Input() loading: boolean = false
  @Output() stepChange: EventEmitter<number> = new EventEmitter()
  currentHelp: HelpType

  algoLabel = NPuzzleAlgoLabel
  heuristicLabel = NPuzzleHeuristicsLabel
  tileMoveDirection = TileMoveDirection
  helpType = HelpType

  helpTooltip = {
    cost: `Valeur estimée du nombre de mouvements à faire pour arriver à la solution.`,
    openList: `La Liste Ouverte est la liste où sont stockées toutes les positions du puzzle à tester. Les positions sont triées par ordre croissant de coût.`,
    closeList: `La Liste Fermée est la liste des positions du puzzle déjà trouvées (ou testée)`,
    heuristic: `Voir l'aide de la section Heuristiques.`,
    algo: `Voir l'aide de la section Algorithmes.`,
    greedy: `Voir l'aide de la section Greedy Search.`,
    distance: `Dans notre cas la distance Cartésienne correspond aussi à la distance Euclidienne et à la distance de Pythagore soit: d = √(x² + y²) où x et y correspondent à la difference de coordonnées entre la position de départ et la position d'arrivée.`,
    conflicts: `Un conflit existe lorsque sur même ligne, ou colonne, une pièce empêche une autre d'atteindre sa position finale.`,
    FIFO: `Une Queue FIFO (First In, First Out) est, comme sont nom l'indique, une file ou les éléments sortent dans l'ordre où ils sont rentrés.`
  }

  constructor() { }

  ngOnInit() { }

  formatDuration(value: number) {
    let mn: number = 0
    let s: number = 0;
    let ms: number = 0;
    ms = value % 1000
    value = Math.floor(value / 1000)
    s = value % 60
    mn = Math.floor(value / 60)
    let res: string = ''
    if (mn > 0) {
      res += `${mn}mn`
    }
    if (s > 0) {
      res += ` ${s}s`
    }
    if (ms > 0) {
      res += ` ${ms}ms`
    }
    return res
  }

  goToStep(index: number) {
    this.stepChange.emit(index)
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
  RESOLVE_TIME = 'RESOLVE_TIME',
  NB_MOVE = 'NB_MOVES',
  SIZE_COMPLEXITY = 'SIZE_COMPLEXITY',
  TIME_COMPLEXITY = 'TIME_COMPLEXITY',
  MOVEMENTS = 'MOVEMENTS',
}