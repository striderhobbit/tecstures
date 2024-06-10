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
    const apiKey =
      'eyJhbGciOiJIUzI1NiJ9.NWUwN2QyZDU5YmIwMDViNTlkZjM4ZjIyOTljNjdiZGI0YzAwZDg2OWE5M2Q1YWY3MDhiZWRhMDRhZTMwMTU2OTFmODRmMDM3OTYwOTY0Zjk5ZjQxMzZiODRlNWFiMWUzMjg1NDliZmJkZGRkZjgxYTU5MWU5NjY1MGZjZTA0OWM.yu3GV7ZfYBtnwp62UB1tBvqtSh3-GxqHNRQUUIYJcZg';
    const token = localStorage.getItem('access_token');

    if (token) {
      return next.handle(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${apiKey},${token}`,
          },
        })
      );
    }

    return next.handle(req);
  }
}
