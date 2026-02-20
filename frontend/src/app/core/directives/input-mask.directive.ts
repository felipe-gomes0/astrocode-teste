import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appInputMask]',
  standalone: true
})
export class InputMaskDirective {
  @Input('appInputMask') maskType: 'date' | 'time' = 'date';

  constructor(
    private el: ElementRef,
    @Optional() @Self() private ngControl: NgControl
  ) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    if (this.maskType === 'date') {
      // Limit to 8 digits (ddMMyyyy)
      if (value.length > 8) value = value.substring(0, 8);

      // Format: dd/MM/yyyy
      if (value.length > 4) {
        value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
      }
    } else if (this.maskType === 'time') {
      // Limit to 4 digits (HHmm)
      if (value.length > 4) value = value.substring(0, 4);

      // Format: HH:mm
      if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,2})/, '$1:$2');
      }
    }

    input.value = value;
    
    // Propagate change to form control to ensure validators run
    if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(value, { emitEvent: false });
    }
  }
}
