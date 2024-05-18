import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (new URL(req.url).pathname !== '/api/user/login') {
      const token = localStorage.getItem('access_token');

      if (token) {
        return next.handle(
          req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          })
        );
      }
    }

    return next.handle(req);
  }
}
