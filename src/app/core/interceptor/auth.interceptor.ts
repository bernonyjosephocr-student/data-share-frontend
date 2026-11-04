import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../service/user.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. FIXED: Removed 'private' keyword inside the function body
  const userService = inject(UserService);
  
  // 2. OPTIMIZED: Retrieve the token once and store it in a variable if it is not expired.
  const token = userService.getToken();

  // Attach the token for the following backend API paths
  const isBackendRequest =
    req.url.startsWith('http://localhost:8080/api/') ||
    req.url.startsWith('http://localhost:4200/api/') ||
    req.url.startsWith('/api/') ||
    req.url.startsWith('api/');

  // Do not attach the token for public authentication paths
  const isPublicEndpoint =
    req.url.endsWith('/api/login') ||
    req.url.endsWith('/api/register') ||
    req.url.endsWith('/api/files') ||
    req.url.endsWith('/api/files/download') ;

  // If no token exists or if it's an unrelated/public endpoint, skip modification
  if (!token || !isBackendRequest || isPublicEndpoint) {
    console.info('No token to attach for  {}', req.url);
    return next(req);
  }

  // Clone the request and inject the Bearer standard token header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  console.info(`Attaching token to request for {}:`, req.url);
  return next(authReq);
};
