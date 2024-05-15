import { Component, HostBinding, Input } from '@angular/core';
import { AnimationScheduler } from '../../classes/animation-scheduler';
import { Move, TransformDirection } from './maze.component';

export class Cell {
  readonly i: number;
  readonly j: number;

  constructor({ i, j }: { i: number; j: number }) {
    this.i = i;
    this.j = j;
  }
}

@Component({
  selector: 'maze-cell',
  standalone: true,
  styleUrl: './maze-cell.component.scss',
  template: '',
})
export class MazeCellComponent {
  @Input({ required: true }) cell!: Cell;
  @Input() animationScheduler?: AnimationScheduler<Move>;

  @HostBinding('attr.index')
  get index(): [number, number] {
    return [this.cell.i, this.cell.j];
  }

  @HostBinding('attr.transform-direction')
  get transformDirection(): TransformDirection | undefined {
    const { direction, index } = this.animationScheduler?.currentMove ?? {};

    if (
      ((direction === 'ltr' || direction === 'rtl') && this.cell.i === index) ||
      ((direction === 'ttb' || direction === 'btt') && this.cell.j === index)
    ) {
      return direction;
    }

    return;
  }
}
