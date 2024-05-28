import { Component } from '@angular/core';
import { Niax } from 'contecst';
import { NiaxTableComponent } from '../niax/niax-table/niax-table.component';

@Component({
  selector: 'users',
  standalone: true,
  imports: [NiaxTableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  protected readonly tableQuery: Niax.TableQuery<'users'> = {
    cols: 'data.name:::',
    resourceName: 'users',
  };
}
