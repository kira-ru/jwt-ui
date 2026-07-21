import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.accessToken();

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  return next(
    req.clone({
      withCredentials: true,
      ...(headers ? { setHeaders: headers } : {}),
    })
  );
};
