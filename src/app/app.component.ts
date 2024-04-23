import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocumentTableComponent } from '../components/document-table/document-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DocumentTableComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
