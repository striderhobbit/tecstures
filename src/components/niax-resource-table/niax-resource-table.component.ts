import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CdkHeaderRowDef } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { Router } from '@angular/router';
import { CollectionPath, Niax, PropertyPath } from 'contecst';
import { cloneDeep, keyBy, pick, pull, zipWith } from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { Subject, lastValueFrom, map, mergeMap } from 'rxjs';
import { CustomIconModule } from '../../classes/custom-icon.module';
import { FilterPipe } from '../../classes/filter.pipe';
import { IntersectionObserverDirective } from '../../classes/intersection-observer.directive';
import { RegExpValidatorDirective } from '../../classes/reg-exp-validator.directive';
import { ViewInitObserverDirective } from '../../classes/view-init-observer.directive';
import { DefaultService } from '../../core/openapi';
import {
  NiaxResourceItemPatchDialog,
  NiaxResourceItemPatchDialogComponent,
} from '../niax-resource-item-patch-dialog/niax-resource-item-patch-dialog.component';
import {
  NiaxResourceTableColumnToggleDialog,
  NiaxResourceTableColumnToggleDialogComponent,
} from '../niax-resource-table-column-toggle-dialog/niax-resource-table-column-toggle-dialog.component';

class RowsPlaceholder {
  constructor(public readonly pageToken: string) {}
}

type Row<C extends CollectionPath, I extends Niax.Item<C>> =
  | Niax.TableRow<C, I>
  | RowsPlaceholder;

@Component({
  selector: 'niax-resource-table',
  standalone: true,
  templateUrl: './niax-resource-table.component.html',
  styleUrl: './niax-resource-table.component.scss',
  imports: [
    CommonModule,
    CustomIconModule,
    DragDropModule,
    FilterPipe,
    FormsModule,
    IntersectionObserverDirective,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatTableModule,
    RegExpValidatorDirective,
    ViewInitObserverDirective,
  ],
  providers: [CookieService],
})
export class NiaxResourceTableComponent<
  C extends CollectionPath,
  I extends Niax.Item<C>
> implements OnInit
{
  @Input({ required: true }) query!: Niax.TableQuery<C>;

  @ViewChild(CdkHeaderRowDef) headerRowDef?: CdkHeaderRowDef;
  @ViewChild(MatTable) table?: MatTable<Row<C, I>>;

  #intersectionIgnored?: boolean;

  protected readonly dataSource = new MatTableDataSource<Row<C, I>>();

  protected readonly pull = pull;

  protected readonly selection = new SelectionModel<Row<C, I>>(false, []);

  protected get intersectionIgnored(): boolean | undefined {
    return this.#intersectionIgnored;
  }

  protected set intersectionIgnored(intersectionIgnored: boolean) {
    this.cookieService.set(
      'intersectionIgnored',
      JSON.stringify((this.#intersectionIgnored = intersectionIgnored))
    );
  }

  protected readonly resourceTable$ = new Subject<Niax.Table<C, I>>();

  protected resourceTable?: Niax.Table<C, I>;

  constructor(
    private readonly defaultService: DefaultService,
    private readonly cookieService: CookieService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.#intersectionIgnored =
      this.cookieService.get('intersectionIgnored') === 'true';

    this.resourceTable$
      .pipe(
        mergeMap((resourceTable) =>
          new Promise<void>((resolve) => {
            const rowsPages$ = this.resourceTable?.rowsPages$;

            if (rowsPages$ != null) {
              rowsPages$.subscribe({
                complete: resolve,
              });

              rowsPages$.complete();
            } else {
              resolve();
            }
          }).then(() => resourceTable)
        ),
        map((resourceTable) => {
          (resourceTable.rowsPages$ = new Subject<void>())
            .pipe(
              map(() =>
                resourceTable.rowsPages.flatMap<Row<C, I>>((rowsPage) =>
                  rowsPage.pending && this.isConnected(resourceTable, rowsPage)
                    ? new RowsPlaceholder(rowsPage.pageToken)
                    : rowsPage.items
                )
              ),
              mergeMap(async (rows) => {
                if (!this.selection.hasValue()) {
                  const activeRow = rows.find(
                    (row) =>
                      !(row instanceof RowsPlaceholder) &&
                      row.resourceId === resourceTable.query.resourceId
                  );

                  if (activeRow != null) {
                    await this.toggleRowIsSelected(activeRow, true);
                  }
                }

                return rows;
              })
            )
            .subscribe({
              next: (rows) => (this.dataSource.data = rows),
            });

          this.selection.clear();

          return resourceTable;
        })
      )
      .subscribe({
        next: (resourceTable) => {
          (this.resourceTable = resourceTable).rowsPages$?.next();
        },
      });

    this.fetchResourceTable(this.query);
  }

  #assertIsRowsPlaceholder(
    row?: Row<C, I>
  ): asserts row is RowsPlaceholder | undefined {
    if (!(row instanceof RowsPlaceholder)) {
      throw new TypeError();
    }
  }

  protected assertIsRowsPlaceholder(
    row?: Row<C, I>
  ): RowsPlaceholder | undefined {
    this.#assertIsRowsPlaceholder(row);

    return row;
  }

  #assertIsResourceTableRow(
    row?: Row<C, I>
  ): asserts row is Niax.TableRow<C, I> | undefined {
    if (row instanceof RowsPlaceholder) {
      throw new TypeError();
    }
  }

  protected assertIsResourceTableRow(
    row?: Row<C, I>
  ): Niax.TableRow<C, I> | undefined {
    this.#assertIsResourceTableRow(row);

    return row;
  }

  protected fetchResourceTable(query: Niax.TableQuery<C>): Promise<void> {
    return lastValueFrom(this.defaultService.getTable(query).pipe()).then(
      (resourceTable) =>
        this.resourceTable$.next(resourceTable as Niax.Table<C, I>)
    );
  }

  protected fetchResourceTableRows(
    resourceTable: Niax.Table<C, I>,
    pageToken: string
  ): Promise<void> {
    return lastValueFrom(
      this.defaultService.getTable({
        ...resourceTable.query,
        rowsPageToken: pageToken,
      })
    ).then((table: Niax.Table<C, I>) => {
      const rowsPage = resourceTable.rowsPages.find(
        (rowsPage) => rowsPage.pageToken === pageToken
      );

      rowsPage!.pending = false;
      rowsPage!.items = table.rowsPages.find(
        (rowsPage) => rowsPage.pageToken === pageToken
      )!.items;

      resourceTable.rowsPages$?.next();
    });
  }

  protected getType(value: any): string {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  }

  private isConnected(
    resourceTable: Niax.Table<C, I>,
    resourceTableRowsPage: Niax.TableRowsPage<C, I>
  ): boolean {
    const resourceTableRowsPagesDictionary = keyBy(
      resourceTable.rowsPages,
      'pageToken'
    );

    const { previousPageToken, nextPageToken } = resourceTableRowsPage;

    return (
      (previousPageToken == null && nextPageToken == null) ||
      (previousPageToken != null &&
        !resourceTableRowsPagesDictionary[previousPageToken].pending) ||
      (nextPageToken != null &&
        !resourceTableRowsPagesDictionary[nextPageToken].pending)
    );
  }

  protected isRowsPlaceholder(index: number, item: Row<C, I>): boolean {
    return item instanceof RowsPlaceholder;
  }

  protected async moveResourceTableColumns(
    resourceTable: Niax.Table<C, I>,
    { previousIndex, currentIndex, container }: CdkDragDrop<PropertyPath<I>[]>
  ): Promise<void> {
    if (previousIndex !== currentIndex) {
      const {
        data: { [previousIndex]: previousItem, [currentIndex]: currentItem },
      } = container;

      const [previousArray, currentArray] = [previousItem, currentItem].map(
        (path) =>
          resourceTable.primaryPaths.includes(path)
            ? resourceTable.primaryPaths
            : resourceTable.secondaryPaths
      );

      const [previousIndexInArray, currentIndexInArray] = zipWith(
        [previousArray, currentArray],
        [previousItem, currentItem],
        (array, item) => array.indexOf(item)
      );

      previousArray === currentArray
        ? moveItemInArray(
            previousArray,
            previousIndexInArray,
            currentIndexInArray
          )
        : transferArrayItem(
            previousArray,
            currentArray,
            previousIndexInArray,
            currentIndexInArray
          );

      await this.syncResourceTableColumns(resourceTable);
    }
  }

  protected openColumnToggleDialog(
    resourceTable: Niax.Table<C, I>
  ): Promise<void> {
    const dialogRef: NiaxResourceTableColumnToggleDialog<C, I>['ref'] =
      this.dialog.open<
        NiaxResourceTableColumnToggleDialogComponent<C, I>,
        NiaxResourceTableColumnToggleDialog<C, I>['data']
      >(NiaxResourceTableColumnToggleDialogComponent<C, I>, {
        data: resourceTable.columns,
      });

    return lastValueFrom(dialogRef.afterClosed()).then(
      async (resourceTableColumns) => {
        if (resourceTableColumns != null) {
          await this.updateResourceTableColumns(resourceTableColumns);
        }
      }
    );
  }

  protected openResourceItemPatchDialog(
    resourceTableField: Niax.TableField<C, I>
  ): Promise<void> {
    const dialogRef: NiaxResourceItemPatchDialog<C, I>['ref'] =
      this.dialog.open<
        NiaxResourceItemPatchDialogComponent<C, I>,
        NiaxResourceItemPatchDialog<C, I>['data']
      >(NiaxResourceItemPatchDialogComponent<C, I>, {
        data: cloneDeep(resourceTableField),
      });

    return lastValueFrom(dialogRef.afterClosed()).then(
      async (resourceTableField) => {
        if (resourceTableField != null) {
          await this.patchResourceItem(resourceTableField);
        }
      }
    );
  }

  protected patchResourceItem(
    resourceTableField: Niax.TableField<C, I>
  ): Promise<void> {
    return lastValueFrom(
      this.defaultService.updateTableField(resourceTableField)
    ).then(() =>
      this.updateResourceTable(pick(resourceTableField, 'resourceId'))
    );
  }

  protected async scrollToAnchor(fragment?: string): Promise<void> {
    await this.router.navigate([], {
      fragment,
      queryParamsHandling: 'preserve',
    });
  }

  protected syncResourceTableColumns(
    resourceTable: Niax.Table<C, I>
  ): Promise<void> {
    resourceTable.columns.forEach((column) => {
      column.sortIndex = resourceTable.primaryPaths.indexOf(column.path);

      if (column.sortIndex === -1) {
        delete column.sortIndex;
        delete column.order;
      }
    });

    return this.updateResourceTableColumns(resourceTable.columns);
  }

  protected async toggleRowIsSelected(
    row: Row<C, I>,
    forceState: boolean = !this.selection.isSelected(row)
  ): Promise<void> {
    this.#assertIsResourceTableRow(row);

    if (forceState) {
      this.selection.select(row);
    } else {
      this.selection.deselect(row);
    }

    if (this.resourceTable?.query != null) {
      this.resourceTable.query.resourceId = this.selection.isSelected(row)
        ? row.resourceId
        : void 0;
    }
  }

  protected async updateResourceTable(
    query: Partial<Niax.TableQuery<C>>
  ): Promise<void> {
    return this.fetchResourceTable({
      ...this.resourceTable!.query,
      ...query,
    });
  }

  protected updateResourceTableColumns(
    resourceTableColumns: Niax.TableColumn<C, I>[]
  ): Promise<void> {
    return this.updateResourceTable({
      cols: resourceTableColumns
        .filter((column) => column.include)
        .map((column) =>
          [
            column.path,
            column.sortIndex ?? '',
            column.order ?? '',
            column.filter ?? '',
          ].join(':')
        )
        .join(','),
    });
  }
}
