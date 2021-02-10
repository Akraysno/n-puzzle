import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { TileColorType, Settings, BoardColorType } from '../../_classes/settings.class';

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
    this.emit()
  }

  onBoardColorChange(type: BoardColorType) {
    this.settings.boardColorType = type
    this.emit()
  }

  emit() {
    this.onChange.emit(this.settings)
  }

}
