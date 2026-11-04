import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, next)
    );

  const token = 'test-token';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should attach the bearer token to a backend request', () => {
    localStorage.setItem('authToken', token);

    const request = new HttpRequest(
      'GET',
      '/api/students'
    );

    const next = jest.fn().mockReturnValue(of(new HttpResponse()));

    interceptor(request, next).subscribe();

    expect(next).toHaveBeenCalledTimes(1);

    const forwardedRequest = next.mock.calls[0][0];

    expect(
      forwardedRequest.headers.get('Authorization')
    ).toBe(`Bearer ${token}`);
  });

  it('should not attach a token when no token exists', () => {
    const request = new HttpRequest(
      'GET',
      '/api/students'
    );

    const next = jest.fn().mockReturnValue(of(new HttpResponse()));

    interceptor(request, next).subscribe();

    const forwardedRequest = next.mock.calls[0][0];

    expect(
      forwardedRequest.headers.has('Authorization')
    ).toBe(false);
  });

  it('should not attach a token to the login endpoint', () => {
    localStorage.setItem('authToken', token);

    const request = new HttpRequest(
      'POST',
      '/api/login'
    );

    const next = jest.fn().mockReturnValue(of(new HttpResponse()));

    interceptor(request, next).subscribe();

    const forwardedRequest = next.mock.calls[0][0];

    expect(
      forwardedRequest.headers.has('Authorization')
    ).toBe(false);
  });

  it('should not attach a token to the registration endpoint', () => {
    localStorage.setItem('authToken', token);

    const request = new HttpRequest(
      'POST',
      '/api/register'
    );

    const next = jest.fn().mockReturnValue(of(new HttpResponse()));

    interceptor(request, next).subscribe();

    const forwardedRequest = next.mock.calls[0][0];

    expect(
      forwardedRequest.headers.has('Authorization')
    ).toBe(false);
  });

  it('should not attach a token to a non-backend request', () => {
    localStorage.setItem('authToken', token);

    const request = new HttpRequest(
      'GET',
      'https://example.com/data'
    );

    const next = jest.fn().mockReturnValue(of(new HttpResponse()));

    interceptor(request, next).subscribe();

    const forwardedRequest = next.mock.calls[0][0];

    expect(
      forwardedRequest.headers.has('Authorization')
    ).toBe(false);
  });
});