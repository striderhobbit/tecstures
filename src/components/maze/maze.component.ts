import { CommonModule } from '@angular/common';
import { Component, HostBinding, OnInit } from '@angular/core';
import { range, shuffle, uniqueId } from 'lodash';
import { AnimationScheduler } from '../../classes/animation-scheduler';
import { Cell, MazeCellComponent } from './maze-cell.component';

export type TransformDirection = 'ltr' | 'rtl' | 'ttb' | 'btt';

export class Move {
  readonly id: string = uniqueId();
  readonly direction: TransformDirection;
  readonly index: number;

  constructor({
    direction,
    index,
  }: {
    direction: TransformDirection;
    index: number;
  }) {
    this.direction = direction;
    this.index = index;
  }
}

@Component({
  selector: 'maze',
  standalone: true,
  imports: [CommonModule, MazeCellComponent],
  templateUrl: './maze.component.html',
  styleUrl: './maze.component.scss',
})
export class MazeComponent implements OnInit {
  @HostBinding('style.--size')
  size: number = 9;

  protected readonly animationScheduler = new AnimationScheduler<Move>({
    count: this.size,
  });

  protected readonly cells: Cell[][] = [];

  constructor() {
    this.animationScheduler.next(new Move({ direction: 'btt', index: 1 }));
  }

  ngOnInit(): void {
    const tiles = shuffle(range(50));

    for (
      let i = 0, row: Cell[] = [];
      i < this.size;
      i++, this.cells.push(row.splice(0))
    ) {
      for (let j = 0; j < this.size; j++) {
        const isInnerCell =
          0 < Math.min(i, j) && Math.max(i, j) < this.size - 1;

        row.push(
          new Cell({
            i,
            j,
            tile: isInnerCell
              ? `assets/images/tiles/tile (${tiles.splice(0, 1)[0]}).png`
              : void 0,
          })
        );
      }
    }
  }
}
