import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { TileColorType, Settings, BoardColorType, TileColor, Color } from '../../_classes/settings.class';

@Component({
  selector: 'app-puzzle-settings',
  templateUrl: './puzzle-settings.component.html',
  styleUrls: ['./puzzle-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PuzzleSettingsComponent implements OnInit {
  @Output() onChange: EventEmitter<Settings> = new EventEmitter()
  settings: Settings
  tileColorType = TileColorType
  boardColorType = BoardColorType
  color1: string = '#FFFFFF'
  color2: string = '#FFFFFF'

  constructor() { }

  ngOnInit() {
    this.settings = new Settings()
    console.log(this.settings)
    this.emit()
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

  emit() {
    this.onChange.emit(this.settings)
  }

  updateTileColor() {
    let color1 = Color.hexaToColor(this.color1)
    let color2 = Color.hexaToColor(this.color2)
    this.settings.tilesColor = new TileColor(this.settings.tileColorType, color1, color2)
    this.emit()
  }

}
