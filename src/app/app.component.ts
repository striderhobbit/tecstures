import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, RouterOutlet } from '@angular/router';
import { DocumentTableComponent } from '../components/document-table/document-table.component';
import { tabRoutes } from './app.routes';

@Component({
  selector: 'root',
  standalone: true,
  imports: [
    CommonModule,
    DocumentTableComponent,
    MatTabsModule,
    RouterModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly routes = tabRoutes;
}
