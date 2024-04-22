import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { lastValueFrom, tap } from 'rxjs';
import {
    CollectionPath,
    DefaultService
} from '../../../build/openapi';
import { Collection } from "../../../node_modules/contecst/src/models/collection";

interface Column<K extends CollectionPath> {
  id: keyof Collection[K] & string;
  label: string;
}

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatTableModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
})
export class CollectionComponent<
  K extends CollectionPath,
  T extends Collection[K] = Collection[K]
> {
  @Input({ required: true }) collectionPath!: K;
  @Input({ required: true }) columns!: Column<K>[];

  protected readonly dataSource = new MatTableDataSource<T>();

  protected get displayedColumns(): Array<keyof T> {
    const keys: Array<keyof T> = [];

    for (const column of this.columns) {
      keys.push(column.id);
    }

    return keys;
  }

  constructor(private readonly defaultService: DefaultService) {}

  ngOnInit(): void {
    this.updateDataSource();
  }

  private async updateDataSource(): Promise<void> {
    await lastValueFrom(
      this.defaultService
        .getCollectionObjects(this.collectionPath)
        .pipe(
          tap(
            (result) =>
              (this.dataSource.data = Object.values(
                result[this.collectionPath] ?? {}
              ))
          )
        )
    );
  }
}
