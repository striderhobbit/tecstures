import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize, lastValueFrom } from 'rxjs';
import { OverlayComponent } from '../components/overlay/overlay.component';

@Injectable({
  providedIn: 'root',
})
export class OverlayService {
  private readonly overlay = inject(Overlay);

  private overlayRef?: OverlayRef;

  private close(): void {
    this.overlayRef?.dispose();
  }

  public async open<T>(observable: Observable<T>): Promise<T> {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      height: '100%',
      width: '100%',
    });

    this.overlayRef.attach(new ComponentPortal(OverlayComponent));

    return lastValueFrom(observable.pipe(finalize(() => this.close())));
  }
}
