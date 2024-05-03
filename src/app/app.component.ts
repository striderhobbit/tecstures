import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UserSession } from 'contecst';
import { DocumentTableComponent } from '../components/document-table/document-table.component';
import { UserService } from '../services/user.service';
import { tabRoutes } from './app.routes';

@Component({
  selector: 'root',
  standalone: true,
  imports: [
    CommonModule,
    DocumentTableComponent,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    RouterModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly routes = tabRoutes;

  protected userSession?: UserSession | null;

  constructor(private readonly userService: UserService) {
    this.userService.userSession$.subscribe({
      next: (userSession) => (this.userSession = userSession),
    });
  }

  protected async loginUser(): Promise<UserSession> {
    return this.userService
      .loginUser({
        id: 'eiucSzQPIwMuKyQiEYLU',
        password: 'Cg@Cv055$2',
      })
      .then(() => this.userService.authenticateUser());
  }

  protected async logoutUser(): Promise<void> {
    return this.userService.logoutUser();
  }
}
