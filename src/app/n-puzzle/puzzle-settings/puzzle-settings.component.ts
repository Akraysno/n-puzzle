import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ColorType, Settings } from '../../_classes/settings.class';

@Component({
  selector: 'app-puzzle-settings',
  templateUrl: './puzzle-settings.component.html',
  styleUrls: ['./puzzle-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class PuzzleSettingsComponent implements OnInit {
  @Output() onChange: EventEmitter<Settings> = new EventEmitter()
  settings: Settings
  colorType = ColorType

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

  onColorChange(type: ColorType) {
    this.settings.colorType = type
    this.emit()
  }

  emit() {
    this.onChange.emit(this.settings)
  }

}
