import { Component, HostListener } from '@angular/core';
import { RotatableMouseComponent } from './rotatable-mouse.component';

@Component({
  template: '',
})
export class RotatableTouchComponent extends RotatableMouseComponent {
  @HostListener('touchstart')
  onTouchStart(): void {
    this.onMouseDown();
  }

  @HostListener('touchcancel')
  onTouchcancel(): void {
    this.onMouseLeave();

    delete this.previousTouch;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];

    if (this.previousTouch != null) {
      this.rotate(
        touch.screenX - this.previousTouch.screenX,
        touch.screenY - this.previousTouch.screenY
      );
    }

    this.previousTouch = touch;
  }

  @HostListener('touchend')
  onTouchEnd(): void {
    this.onMouseUp();

    delete this.previousTouch;
  }

  private previousTouch?: Touch;
}
