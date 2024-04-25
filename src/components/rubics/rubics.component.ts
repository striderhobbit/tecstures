import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { times } from 'lodash';
import {
  Subject,
  animationFrameScheduler,
  concat,
  concatMap,
  defer,
  filter,
  finalize,
  scheduled,
  take,
} from 'rxjs';
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
    return this.move?.twist.axis;
  }

  protected readonly animations: Subject<string> = new Subject();

  protected cube = new Cube();

  protected move?: Move;

  private readonly moves: Subject<Move> = new Subject();

  protected readonly times = times;

  constructor() {
    super();

    this.moves
      .pipe(
        concatMap((move) =>
          scheduled(
            concat(
              defer(async () => (this.move = move)),
              this.animations.pipe(
                filter((id) => move.id === id),
                take(27),
                finalize(() => {
                  this.cube.permutation.apply(move.permutation);
                  delete this.move;
                })
              )
            ),
            animationFrameScheduler
          )
        )
      )
      .subscribe();

    this.moves.next(new Move({ key: 'R', exp: -2 }));
    this.moves.next(new Move({ key: 'l', exp: 1 }));
    this.moves.next(new Move({ key: 'u', exp: 1 }));
  }
}
