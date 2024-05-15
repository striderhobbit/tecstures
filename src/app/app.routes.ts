import { Routes } from '@angular/router';
import { EventsComponent } from '../components/events/events.component';
import { MazeComponent } from '../components/maze/maze.component';
import { RubicsComponent } from '../components/rubics/rubics.component';
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
  {
    path: 'rubics',
    component: RubicsComponent,
  },
  {
    path: 'maze',
    component: MazeComponent,
  },
];

export const routes: Routes = tabRoutes.concat([
  {
    path: '',
    redirectTo: 'rubics',
    pathMatch: 'full',
  },
]);
