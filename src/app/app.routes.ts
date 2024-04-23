import { Routes } from '@angular/router';
import { EventsComponent } from '../components/events/events.component';
import { UsersComponent } from '../components/users/users.component';

export const routes: Routes = [
  {
    path: 'events',
    component: EventsComponent,
  },
  {
    path: 'users',
    component: UsersComponent,
  },
];
