import { Component } from '@angular/core';
import { Niax } from 'contecst';
import { NiaxTableComponent } from '../niax/niax-table/niax-table.component';

@Component({
  selector: 'events',
  standalone: true,
  imports: [NiaxTableComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {
  protected readonly tableQuery: Niax.TableQuery<'events'> = {
    cols: 'data.name:::,data.participants:::',
    resourceName: 'events',
  };
}
