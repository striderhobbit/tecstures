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
import { ChangeDetector } from '../../../classes/change-detector';

export interface NiaxTableColumnToggleDialog<
  C extends CollectionPath,
  I extends Niax.Item<C>
> {
  ref: MatDialogRef<
    NiaxTableColumnToggleDialogComponent<C, I>,
    Niax.TableColumn<C, I>[]
  >;
  data: Niax.TableColumn<C, I>[];
}

@Component({
  selector: 'niax-table-column-toggle-dialog',
  templateUrl: './niax-table-column-toggle-dialog.component.html',
  styleUrls: [],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatListModule, NgFor],
})
export class NiaxTableColumnToggleDialogComponent<
  C extends CollectionPath,
  I extends Niax.Item<C>
> extends ChangeDetector<Niax.TableColumn<C, I>[]> {
  protected readonly tableColumns: Niax.TableColumn<C, I>[];

  constructor(
    @Inject(MatDialogRef)
    protected readonly dialogRef: NiaxTableColumnToggleDialog<C, I>['ref'],
    @Inject(MAT_DIALOG_DATA)
    data: NiaxTableColumnToggleDialog<C, I>['data']
  ) {
    super(data);

    this.tableColumns = this.data;
  }

  protected override isEqual(
    tableColumnsA: Niax.TableColumn<C, I>[],
    tableColumnsB: Niax.TableColumn<C, I>[]
  ): boolean {
    return zipWith(
      tableColumnsA,
      tableColumnsB,
      (tableColumnA, tableColumnB) =>
        !tableColumnA.include === !tableColumnB.include
    ).every(Boolean);
  }
}
