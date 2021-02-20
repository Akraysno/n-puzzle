import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { Subscription } from 'rxjs';
import { TileColorType, Settings, BoardColorType, Color, GradientType } from '../../_classes/settings.class';
import { NPuzzleService } from '../n-puzzle.service';

@Component({
  selector: 'app-puzzle-settings',
  templateUrl: './puzzle-settings.component.html',
  styleUrls: [
    './puzzle-settings.component.scss',
    '../popover.scss',
    '../side-menu.scss',
  ],
  encapsulation: ViewEncapsulation.None,
})

export class PuzzleSettingsComponent implements OnInit {
  @Output() onChange: EventEmitter<Settings> = new EventEmitter()
  settings: Settings
  color1: string = '#FFFFFF'
  color2: string = '#FFFFFF'
  currentHelp: HelpType
  size: number = 3
  gradientType = GradientType
  tileColorType = TileColorType
  boardColorType = BoardColorType
  helpType = HelpType

  sizeChanged$: Subscription

  constructor(
    private nPuzzleService: NPuzzleService,
  ) { }

  ngOnInit() {
    this.settings = new Settings()
    this.emit()
    this.sizeChanged$ = this.nPuzzleService.sizeChanged.subscribe(size => {
      this.size = size
      this.updateTileColor()
    })
  }

  ngOnDestoy() {
    if (this.sizeChanged$) {
      this.sizeChanged$.unsubscribe()
      this.sizeChanged$ = null
    }
  }

  nbIterationsChange(event: MatSliderChange) {
    this.settings.nbShuffleIterations = event.value
    this.emit()
  }

  iterationLabel(value: number) {
    return value > 0 ? value : ''
  }

  onTileColorChange(type: TileColorType) {
    this.settings.tileColorType = type
    this.updateTileColor()
  }

  onBoardColorChange(type: BoardColorType) {
    this.settings.boardColorType = type
    this.emit()
  }

  onGradientTypeChange(type: GradientType) {
    this.settings.gradientType = type
    this.updateTileColor()
  }

  emit() {
    this.onChange.emit(this.settings)
  }

  updateTileColor() {
    let color1 = Color.hexaToColor(this.color1)
    let color2 = Color.hexaToColor(this.color2)
    this.settings.refreshColors(this.settings.tileColorType, this.size, color1, color2, this.settings.gradientType)
    this.emit()
  }

  showHelp(type: HelpType) {
    this.currentHelp = type
  }

  hideHelp() {
    this.currentHelp = null
  }

}

enum HelpType {
  SHUFFLE = 'SHUFFLE',
  GRADIENT = 'GRADIENT'
}