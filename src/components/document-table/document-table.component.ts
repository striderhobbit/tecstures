import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Collection, CollectionPath, Document } from 'contecst';
import { lastValueFrom, map } from 'rxjs';
import { DefaultService } from '../../core/openapi';
import { DialogService } from '../../services/dialog.service';

interface DocumentTableColumn<D> {
  key: keyof D & string;
  label: string;
}

export interface DocumentTableField<D> {
  column: DocumentTableColumn<D>;
  document: Document<D>;
}

@Component({
  selector: 'document-table',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './document-table.component.html',
  styleUrl: './document-table.component.scss',
})
export class DocumentTableComponent<
  K extends CollectionPath,
  D extends Collection[K]
> {
  @Input({ required: true }) collection!: K;
  @Input({ required: true }) columns!: DocumentTableColumn<D>[];

  protected readonly dataSource = new MatTableDataSource<Document<D>>();

  protected get displayedColumns(): Array<keyof D> {
    const keys: Array<keyof D> = [];

    for (const column of this.columns) {
      keys.push(column.key);
    }

    return keys;
  }

  constructor(
    private readonly defaultService: DefaultService,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.updateDataSource();
  }

  private async updateDataSource(): Promise<void> {
    return lastValueFrom(
      this.defaultService.readDocuments(this.collection).pipe(
        map((docs) => {
          this.dataSource.data = docs.map((doc) => doc as Document<D>);
        })
      )
    );
  }

  protected async editField(field: DocumentTableField<D>): Promise<void> {
    return this.dialogService
      .editDocumentTableField(field)
      .then(() => this.updateDataSource());
  }
}
