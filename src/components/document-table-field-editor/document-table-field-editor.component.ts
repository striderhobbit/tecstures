import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { cloneDeep } from 'lodash';
import { lastValueFrom, map } from 'rxjs';
import { DefaultService } from '../../core/openapi';
import { DocumentTableField } from '../document-table/document-table.component';

@Component({
  selector: 'document-table-field-editor',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './document-table-field-editor.component.html',
  styleUrl: './document-table-field-editor.component.scss',
})
export class DocumentTableFieldEditorComponent<D> {
  protected readonly field: DocumentTableField<D>;

  constructor(
    private readonly defaultService: DefaultService,
    @Inject(MAT_DIALOG_DATA)
    private readonly dialogData: DocumentTableField<D>,
    private readonly dialogRef: MatDialogRef<
      DocumentTableFieldEditorComponent<D>
    >
  ) {
    this.field = cloneDeep(this.dialogData);
  }

  protected async submit(): Promise<void> {
    const {
      document: { collection, id, data },
    } = this.field;

    return lastValueFrom(
      this.defaultService
        .updateDocument(collection, id, data ?? {})
        .pipe(map(() => this.dialogRef.close()))
    );
  }
}
