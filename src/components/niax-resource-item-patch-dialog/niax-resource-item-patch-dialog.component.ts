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
import { ChangeDetector } from '../../classes/change-detector';

export interface NiaxResourceItemPatchDialog<
  C extends CollectionPath,
  I extends Niax.Item<C>
> {
  ref: MatDialogRef<
    NiaxResourceItemPatchDialogComponent<C, I>,
    Niax.TableField<C, I>
  >;
  data: Niax.TableField<C, I>;
}

@Component({
  selector: 'niax-resource-item-patch-dialog',
  templateUrl: './niax-resource-item-patch-dialog.component.html',
  styleUrl: './niax-resource-item-patch-dialog.component.scss',
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
export class NiaxResourceItemPatchDialogComponent<
  C extends CollectionPath,
  I extends Niax.Item<C>
> extends ChangeDetector<Niax.TableField<C, I>> {
  protected readonly field: Niax.TableField<C, I>;

  protected readonly set = set;

  constructor(
    @Inject(MatDialogRef)
    protected readonly dialogRef: NiaxResourceItemPatchDialog<C, I>['ref'],
    @Inject(MAT_DIALOG_DATA)
    data: NiaxResourceItemPatchDialog<C, I>['data']
  ) {
    super(data);

    this.field = this.data;
  }

  protected override isEqual(
    fieldA: Niax.TableField<C, I>,
    fieldB: Niax.TableField<C, I>
  ): boolean {
    return isEqual(fieldA, fieldB);
  }
}
