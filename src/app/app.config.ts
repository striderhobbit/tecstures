import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  RouteReuseStrategy,
  provideRouter,
  withHashLocation,
} from '@angular/router';
import { provideApi, withApiConfiguration } from '../api.provider';
import { CustomRouteReuseStrategy } from '../classes/custom-route-reuse-strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    provideRouter(routes, withHashLocation()),
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy,
    },
    provideAnimationsAsync(),
    provideHttpClient(),
    provideApi(
      withApiConfiguration({
        withCredentials: true,
      })
    ),
  ],
};
