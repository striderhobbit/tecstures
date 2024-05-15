import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { times } from 'lodash';
import { AnimationScheduler } from '../../classes/animation-scheduler';
import { RotatableTouchComponent } from '../../classes/rotatable-touch.component';
import { Cube } from '../../classes/rubics/cube';
import { Move } from '../../classes/rubics/move';

@Component({
  selector: 'rubics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rubics.component.html',
  styleUrls: ['./rubics.component.scss'],
})
export class RubicsComponent extends RotatableTouchComponent {
  @HostBinding('attr.twist-axis')
  get twistAxis(): string | undefined {
    return this.animationScheduler.currentMove?.twist.axis;
  }

  protected readonly animationScheduler = new AnimationScheduler<Move>({
    callback: (move) => this.cube.permutation.apply(move.permutation),
    count: 27,
  });

  protected cube = new Cube();

  protected readonly times = times;

  constructor() {
    super();

    this.animationScheduler.subscribe();

    this.animationScheduler.next(new Move({ key: 'R', exp: -2 }));
    this.animationScheduler.next(new Move({ key: 'l', exp: 1 }));
    this.animationScheduler.next(new Move({ key: 'u', exp: 1 }));
  }
}
