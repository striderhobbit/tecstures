import { NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { CollectionPath, Niax } from 'contecst';
import { zipWith } from 'lodash';
import { ChangeDetector } from '../../classes/change-detector';

export interface NiaxResourceTableColumnToggleDialog<
  C extends CollectionPath,
  I extends Niax.Item<C>
> {
  ref: MatDialogRef<
    NiaxResourceTableColumnToggleDialogComponent<C, I>,
    Niax.TableColumn<C, I>[]
  >;
  data: Niax.TableColumn<C, I>[];
}

@Component({
  selector: 'niax-resource-table-column-toggle-dialog',
  templateUrl: './niax-resource-table-column-toggle-dialog.component.html',
  styleUrls: [],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatListModule, NgFor],
})
export class NiaxResourceTableColumnToggleDialogComponent<
  C extends CollectionPath,
  I extends Niax.Item<C>
> extends ChangeDetector<Niax.TableColumn<C, I>[]> {
  protected readonly columns: Niax.TableColumn<C, I>[];

  constructor(
    @Inject(MatDialogRef)
    protected readonly dialogRef: NiaxResourceTableColumnToggleDialog<C, I>['ref'],
    @Inject(MAT_DIALOG_DATA)
    data: NiaxResourceTableColumnToggleDialog<C, I>['data']
  ) {
    super(data);

    this.columns = this.data;
  }

  protected override isEqual(
    columnsA: Niax.TableColumn<C, I>[],
    columnsB: Niax.TableColumn<C, I>[]
  ): boolean {
    return zipWith(
      columnsA,
      columnsB,
      (columnA, columnB) => !columnA.include === !columnB.include
    ).every(Boolean);
  }
}
