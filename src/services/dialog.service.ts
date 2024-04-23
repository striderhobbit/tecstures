import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { DocumentTableFieldEditorComponent } from '../components/document-table-field-editor/document-table-field-editor.component';
import { DocumentTableField } from '../components/document-table/document-table.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private readonly dialog: MatDialog) {}

  public async editDocumentTableField<D>(
    field: DocumentTableField<D>
  ): Promise<void> {
    const dialogRef: MatDialogRef<DocumentTableFieldEditorComponent<D>> =
      this.dialog.open<
        DocumentTableFieldEditorComponent<D>,
        DocumentTableField<D>
      >(DocumentTableFieldEditorComponent, {
        data: field,
      });

    return lastValueFrom(dialogRef.afterClosed());
  }
}
