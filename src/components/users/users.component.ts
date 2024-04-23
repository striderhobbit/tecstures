import { Component } from '@angular/core';
import { DocumentTableComponent } from '../document-table/document-table.component';

@Component({
  selector: 'users',
  standalone: true,
  imports: [DocumentTableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {}
