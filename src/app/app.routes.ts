import { Routes } from '@angular/router';
import { EventsComponent } from '../components/events/events.component';
import { UsersComponent } from '../components/users/users.component';

export const tabRoutes: Routes = [
  {
    path: 'events',
    component: EventsComponent,
  },
  {
    path: 'users',
    component: UsersComponent,
  },
];

export const routes: Routes = tabRoutes.concat([
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
]);
