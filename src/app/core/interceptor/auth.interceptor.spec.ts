import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpHandlerFn } from '@angular/common/http';
import { of } from 'rxjs';
import { jest } from '@jest/globals';

import { authInterceptor } from './auth.interceptor';
import { UserService } from '../service/user.service';

describe('authInterceptor', () => {
  let userService: {
    getToken: jest.Mock;
  };

  let forwardedRequest: HttpRequest<unknown> | undefined;

  const token = 'test-jwt-token';

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, next)
    );

  beforeEach(() => {
    userService = {
      getToken: jest.fn()
    };

    forwardedRequest = undefined;

    TestBed.configureTestingModule({
      providers: [
        { provide: UserService, useValue: userService }
      ]
    });
  });

  it('should attach the bearer token to a protected API request', () => {
    userService.getToken.mockReturnValue(token);

    const request = new HttpRequest('GET', '/api/files/my-files');

    const next: HttpHandlerFn = (req) => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    interceptor(request, next).subscribe();

    expect(forwardedRequest?.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not attach a token when no token exists', () => {
    userService.getToken.mockReturnValue(null);

    const request = new HttpRequest('GET', '/api/files/my-files');

    const next: HttpHandlerFn = (req) => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    interceptor(request, next).subscribe();

    expect(forwardedRequest?.headers.has('Authorization')).toBe(false);
  });

  it('should not attach a token to public authentication endpoints', () => {
    userService.getToken.mockReturnValue(token);

    const request = new HttpRequest('POST', '/api/auth/login');

    const next: HttpHandlerFn = (req) => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    interceptor(request, next).subscribe();

    expect(forwardedRequest?.headers.has('Authorization')).toBe(false);
  });

  it('should not attach a token to an external request', () => {
    userService.getToken.mockReturnValue(token);

    const request = new HttpRequest('GET', 'https://example.com/data');

    const next: HttpHandlerFn = (req) => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    interceptor(request, next).subscribe();

    expect(forwardedRequest?.headers.has('Authorization')).toBe(false);
  });

  it('should not attach a token to the registration endpoint', () => {
    userService.getToken.mockReturnValue(token);

    const request = new HttpRequest('POST', '/api/auth/register');

    const next: HttpHandlerFn = (req) => {
      forwardedRequest = req;
      return of(new HttpResponse());
    };

    interceptor(request, next).subscribe();

    expect(forwardedRequest?.headers.has('Authorization')).toBe(false);
  });
});