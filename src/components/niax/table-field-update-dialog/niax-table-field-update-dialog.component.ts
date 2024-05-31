import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CollectionPath, Niax } from 'contecst';
import { isEqual, set } from 'lodash';
import { ChangeDetector } from '../../../classes/change-detector';

export interface NiaxTableFieldUpdateDialog<
  C extends CollectionPath,
  I extends Niax.Item<C>
> {
  ref: MatDialogRef<
    NiaxTableFieldUpdateDialogComponent<C, I>,
    Niax.TableField<C, I>
  >;
  data: Niax.TableField<C, I>;
}

@Component({
  selector: 'niax-table-field-update-dialog',
  templateUrl: './niax-table-field-update-dialog.component.html',
  styleUrl: './niax-table-field-update-dialog.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
  ],
})
export class NiaxTableFieldUpdateDialogComponent<
  C extends CollectionPath,
  I extends Niax.Item<C>
> extends ChangeDetector<Niax.TableField<C, I>> {
  protected readonly set = set;

  protected readonly tableField: Niax.TableField<C, I>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: NiaxTableFieldUpdateDialog<C, I>['data'],
    @Inject(MatDialogRef)
    protected readonly dialogRef: NiaxTableFieldUpdateDialog<C, I>['ref']
  ) {
    super(data);

    this.tableField = this.data;
  }

  protected override isEqual(
    tableFieldA: Niax.TableField<C, I>,
    tableFieldB: Niax.TableField<C, I>
  ): boolean {
    return isEqual(tableFieldA, tableFieldB);
  }
}
