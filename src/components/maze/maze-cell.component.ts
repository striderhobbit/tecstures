import { Component, HostBinding, Input } from '@angular/core';
import { AnimationScheduler } from '../../classes/animation-scheduler';
import { Move, TransformDirection } from './maze.component';

export class Cell {
  readonly i: number;
  readonly j: number;
  readonly tile?: string;

  constructor({ i, j, tile }: { i: number; j: number; tile?: string }) {
    this.i = i;
    this.j = j;
    this.tile = tile;
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

  @HostBinding('style.backgroundImage')
  get backgroundImage(): string | undefined {
    return this.cell.tile && `url("${this.cell.tile}")`;
  }
}
