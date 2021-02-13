import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Result } from 'src/app/_classes/result.class';
import { NPuzzleAlgoLabel } from 'src/app/__models/enums/n-puzzle-algo.enum';
import { NPuzzleHeuristicsLabel } from 'src/app/__models/enums/n-puzzle-heuristics.enum';
import { TileMoveDirection } from 'src/app/__models/enums/tile-move-direction.enum';

@Component({
  selector: 'app-puzzle-result',
  templateUrl: './puzzle-result.component.html',
  styleUrls: ['./puzzle-result.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PuzzleResultComponent implements OnInit {
  @Input() result: Result
  @Input() loading: boolean = false
  @Output() stepChange: EventEmitter<number> = new EventEmitter()
  algoLabel = NPuzzleAlgoLabel
  heuristicLabel = NPuzzleHeuristicsLabel
  tileMoveDirection = TileMoveDirection

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

}
