import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom, map, tap } from 'rxjs';
import { DefaultService, UserCredentials, UserSession } from '../core/openapi';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  readonly #userSession$ = new BehaviorSubject<UserSession | null>(null);

  public get userSession$(): Observable<UserSession | null> {
    return this.#userSession$;
  }

  constructor(private readonly defaultService: DefaultService) {
    this.authenticateUser();
  }

  public async authenticateUser(): Promise<UserSession> {
    return lastValueFrom(
      this.defaultService
        .authenticateUser()
        .pipe(tap((session) => this.#userSession$.next(session)))
    );
  }

  public async loginUser(credentials: UserCredentials): Promise<void> {
    return lastValueFrom(
      this.defaultService
        .loginUser(credentials)
        .pipe(map(({ token }) => localStorage.setItem('access_token', token)))
    );
  }
}
