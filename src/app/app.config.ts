import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideApi, withApiConfiguration } from '../api.provider';
import { AuthInterceptor } from '../classes/auth-interceptor';
import { CustomRouteReuseStrategy } from '../classes/custom-route-reuse-strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    provideRouter(routes),
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideApi(
      withApiConfiguration({
        withCredentials: true,
      })
    ),
  ],
};
