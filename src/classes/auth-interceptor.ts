import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { configDotenv } from 'dotenv';
import { Observable } from 'rxjs';

configDotenv();

export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');

    if (token) {
      return next.handle(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${process.env['API_KEY']},${token}`,
          },
        })
      );
    }

    return next.handle(req);
  }
}
