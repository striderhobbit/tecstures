import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
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
import { keyBy, pick, pull, zipWith } from 'lodash';
import { CookieService } from 'ngx-cookie-service';
import { Subject, lastValueFrom, map, mergeMap, switchMap, tap } from 'rxjs';
import { CustomIconModule } from '../../../classes/custom-icon.module';
import { FilterPipe } from '../../../classes/filter.pipe';
import { IntersectionObserverDirective } from '../../../classes/intersection-observer.directive';
import { RegExpValidatorDirective } from '../../../classes/reg-exp-validator.directive';
import { ViewInitObserverDirective } from '../../../classes/view-init-observer.directive';
import { DefaultService } from '../../../core/openapi';
import {
  NiaxTableColumnToggleDialog,
  NiaxTableColumnToggleDialogComponent,
} from '../niax-table-column-toggle-dialog/niax-table-column-toggle-dialog.component';
import {
  NiaxTableFieldUpdateDialog,
  NiaxTableFieldUpdateDialogComponent,
} from '../niax-table-field-update-dialog/niax-table-field-update-dialog.component';

class TableRowsPlaceholder {
  constructor(public pageToken: string) {}
}

type TableRow<C extends CollectionPath, I extends Niax.Item<C>> =
  | Niax.TableRow<C, I>
  | TableRowsPlaceholder;

@Component({
  selector: 'niax-table',
  standalone: true,
  templateUrl: './niax-table.component.html',
  styleUrl: './niax-table.component.scss',
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
export class NiaxTableComponent<
  C extends CollectionPath,
  I extends Niax.Item<C>
> implements OnInit
{
  @Input({ alias: 'query', required: true })
  initialTableQuery!: Niax.TableQuery<C>;

  @ViewChild(MatTable) matTable?: MatTable<TableRow<C, I>>;

  dataSource = new MatTableDataSource<TableRow<C, I>>();

  dataSourceUpdate$ = new Subject<void>();

  #intersectionIgnored?: boolean;

  get intersectionIgnored(): boolean | undefined {
    return this.#intersectionIgnored;
  }

  set intersectionIgnored(intersectionIgnored: boolean) {
    this.cookieService.set(
      'intersectionIgnored',
      JSON.stringify((this.#intersectionIgnored = intersectionIgnored))
    );
  }

  pull = pull;

  selectionModel = new SelectionModel<TableRow<C, I>>(false, []);

  #table?: Niax.Table<C, I>;

  get table(): Niax.Table<C, I> | undefined {
    return this.#table;
  }

  set table(table: Niax.Table<C, I>) {
    this.selectionModel.clear();
    this.dataSource.data = [];

    this.#table = table;

    this.dataSourceUpdate$.next();
  }

  tableRowsPagesUpdate$ = new Subject<Niax.TableRowsPage<C, I>>();

  constructor(
    private readonly defaultService: DefaultService,
    private readonly cookieService: CookieService,
    private readonly dialog: MatDialog,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.#intersectionIgnored =
      this.cookieService.get('intersectionIgnored') === 'true';

    this.dataSourceUpdate$
      .pipe(
        switchMap(async () => {
          const table = this.table;

          if (table == null) {
            return [];
          }

          const tableRows = table.rowsPages.flatMap<TableRow<C, I>>(
            (tableRowsPage) =>
              tableRowsPage.pending && this.isConnected(table, tableRowsPage)
                ? new TableRowsPlaceholder(tableRowsPage.pageToken)
                : tableRowsPage.items
          );

          if (!this.selectionModel.hasValue()) {
            const activeTableRow = tableRows.find(
              (tableRow) =>
                !(tableRow instanceof TableRowsPlaceholder) &&
                tableRow.resourceId === table.query.resourceId
            );

            if (activeTableRow != null) {
              await this.toggleTableRowIsSelected(activeTableRow, true);
            }
          }

          return tableRows;
        }),
        tap((tableRows) => (this.dataSource.data = tableRows))
      )
      .subscribe();

    this.tableRowsPagesUpdate$
      .pipe(
        map((sourceTableRowsPage) => {
          const targetTableRowsPage = this.table?.rowsPages.find(
            (targetTableRowsPage) =>
              targetTableRowsPage.pageToken === sourceTableRowsPage.pageToken
          );

          if (targetTableRowsPage != null) {
            targetTableRowsPage.pending = false;
            targetTableRowsPage.items = sourceTableRowsPage.items;
          }
        }),
        tap(() => this.dataSourceUpdate$.next())
      )
      .subscribe();

    this.fetchTable(this.initialTableQuery);
  }

  #assertIsTableRow(
    tableRow?: TableRow<C, I>
  ): asserts tableRow is Niax.TableRow<C, I> | undefined {
    if (tableRow instanceof TableRowsPlaceholder) {
      throw new TypeError();
    }
  }

  assertIsTableRow(tableRow?: TableRow<C, I>): Niax.TableRow<C, I> | undefined {
    this.#assertIsTableRow(tableRow);

    return tableRow;
  }

  #assertIsTableRowsPlaceholder(
    tableRow?: TableRow<C, I>
  ): asserts tableRow is TableRowsPlaceholder | undefined {
    if (!(tableRow instanceof TableRowsPlaceholder)) {
      throw new TypeError();
    }
  }

  assertIsTableRowsPlaceholder(
    tableRow?: TableRow<C, I>
  ): TableRowsPlaceholder | undefined {
    this.#assertIsTableRowsPlaceholder(tableRow);

    return tableRow;
  }

  async fetchTable(tableQuery: Niax.TableQuery<C>): Promise<Niax.Table<C, I>> {
    return lastValueFrom(this.defaultService.getTable(tableQuery).pipe()).then(
      (table) => (this.table = table as Niax.Table<C, I>)
    );
  }

  async fetchTableRows(
    table: Niax.Table<C, I>,
    pageToken: string
  ): Promise<void> {
    return lastValueFrom(
      this.defaultService.getTable({
        ...table.query,
        rowsPageToken: pageToken,
      })
    ).then((table: Niax.Table<C, I>) => {
      const tableRowsPage = table.rowsPages.find(
        (tableRowsPage) => tableRowsPage.pageToken === pageToken
      );

      this.tableRowsPagesUpdate$.next(tableRowsPage!);
    });
  }

  getType(value: any): string {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  }

  isConnected(
    table: Niax.Table<C, I>,
    tableRowsPage: Niax.TableRowsPage<C, I>
  ): boolean {
    const tableRowsPagesDictionary = keyBy(table.rowsPages, 'pageToken');

    const { previousPageToken, nextPageToken } = tableRowsPage;

    return (
      (previousPageToken == null && nextPageToken == null) ||
      (previousPageToken != null &&
        !tableRowsPagesDictionary[previousPageToken].pending) ||
      (nextPageToken != null &&
        !tableRowsPagesDictionary[nextPageToken].pending)
    );
  }

  isTableRowsPlaceholder(index: number, item: TableRow<C, I>): boolean {
    return item instanceof TableRowsPlaceholder;
  }

  async moveTableColumns(
    table: Niax.Table<C, I>,
    { previousIndex, currentIndex, container }: CdkDragDrop<PropertyPath<I>[]>
  ): Promise<void> {
    if (previousIndex !== currentIndex) {
      const {
        data: { [previousIndex]: previousItem, [currentIndex]: currentItem },
      } = container;

      const [previousArray, currentArray] = [previousItem, currentItem].map(
        (path) =>
          table.primaryPaths.includes(path)
            ? table.primaryPaths
            : table.secondaryPaths
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

      await this.syncTableColumns(table);
    }
  }

  async openTableColumnToggleDialog(table: Niax.Table<C, I>): Promise<void> {
    const dialogRef: NiaxTableColumnToggleDialog<C, I>['ref'] =
      this.dialog.open<
        NiaxTableColumnToggleDialogComponent<C, I>,
        NiaxTableColumnToggleDialog<C, I>['data']
      >(NiaxTableColumnToggleDialogComponent<C, I>, {
        data: table.columns,
      });

    return lastValueFrom(
      dialogRef.afterClosed().pipe(
        mergeMap(async (columns) => {
          if (columns != null) {
            await this.updateTableColumns({
              ...table,
              columns,
            });
          }
        })
      )
    );
  }

  async openTableFieldUpdateDialog(
    table: Niax.Table<C, I>,
    tableField: Niax.TableField<C, I>
  ): Promise<void> {
    const dialogRef: NiaxTableFieldUpdateDialog<C, I>['ref'] = this.dialog.open<
      NiaxTableFieldUpdateDialogComponent<C, I>,
      NiaxTableFieldUpdateDialog<C, I>['data']
    >(NiaxTableFieldUpdateDialogComponent<C, I>, {
      data: tableField,
    });

    return lastValueFrom(
      dialogRef.afterClosed().pipe(
        mergeMap(async (tableField) => {
          if (tableField != null) {
            await this.updateTableField(table, tableField);
          }
        })
      )
    );
  }

  async scrollToAnchor(fragment?: string): Promise<void> {
    await this.router.navigate([], {
      fragment,
      queryParamsHandling: 'preserve',
    });
  }

  async syncTableColumns(table: Niax.Table<C, I>): Promise<Niax.Table<C, I>> {
    table.columns.forEach((tableColumn) => {
      tableColumn.sortIndex = table.primaryPaths.indexOf(tableColumn.path);

      if (tableColumn.sortIndex === -1) {
        delete tableColumn.sortIndex;
        delete tableColumn.order;
      }
    });

    return this.updateTableColumns(table);
  }

  async toggleTableRowIsSelected(
    tableRow: TableRow<C, I>,
    forceState: boolean = !this.selectionModel.isSelected(tableRow)
  ): Promise<void> {
    this.#assertIsTableRow(tableRow);

    if (forceState) {
      this.selectionModel.select(tableRow);
    } else {
      this.selectionModel.deselect(tableRow);
    }

    if (this.table?.query != null) {
      this.table.query.resourceId = this.selectionModel.isSelected(tableRow)
        ? tableRow.resourceId
        : void 0;
    }
  }

  async updateTable(
    table: Niax.Table<C, I>,
    tableQuery: Partial<Niax.TableQuery<C>>
  ): Promise<Niax.Table<C, I>> {
    return this.fetchTable({
      ...table.query,
      ...tableQuery,
    });
  }

  async updateTableColumns(table: Niax.Table<C, I>): Promise<Niax.Table<C, I>> {
    return this.updateTable(table, {
      cols: table.columns
        .filter((tableColumn) => tableColumn.include)
        .map((tableColumn) =>
          [
            tableColumn.path,
            tableColumn.sortIndex ?? '',
            tableColumn.order ?? '',
            tableColumn.filter ?? '',
          ].join(':')
        )
        .join(','),
    });
  }

  async updateTableField(
    table: Niax.Table<C, I>,
    tableField: Niax.TableField<C, I>
  ): Promise<Niax.Table<C, I>> {
    return lastValueFrom(
      this.defaultService
        .updateTableField(tableField)
        .pipe(
          mergeMap(() =>
            this.updateTable(table, pick(tableField, 'resourceId'))
          )
        )
    );
  }

  trackByIndex(index: number): number {
    return index;
  }
}
