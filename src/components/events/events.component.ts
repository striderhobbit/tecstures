import { Component } from '@angular/core';
import { DocumentTableComponent } from '../document-table/document-table.component';

@Component({
  selector: 'events',
  standalone: true,
  imports: [DocumentTableComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {}
