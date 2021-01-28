import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonComponent implements OnInit {
  @Input() label: string = ''
  @Input() loading: boolean = false
  @Input() disabled: boolean = false
  @Input() fullWidth: boolean = false
  @Input() prefixIcon: string = ''
  @Input() color: string = 'primary'
  @Input() cssClass: string
  @Output() onClick: EventEmitter<any> = new EventEmitter()

  constructor() { }

  ngOnInit() { }

  click() {
    this.onClick.emit()
  }

}