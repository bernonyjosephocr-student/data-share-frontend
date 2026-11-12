import { jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user with the backend', () => {
    const user = { email: 'user@example.com', password: 'securePassword123' };
    let response: void | undefined;

    service.register(user).subscribe((result) => response = result);

    const request = httpTestingController.expectOne('/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(user);
    request.flush(null);
    expect(response).toBeNull();
  });

  it('should authenticate a user and receive a token', () => {
    const credentials = { email: 'user@example.com', password: 'securePassword123' };
    const token = { token: 'jwt-token' };
    let response: typeof token | undefined;

    service.login(credentials).subscribe((result) => response = result);

    const request = httpTestingController.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(token);
    expect(response).toEqual(token);
  });

  it('should save the authentication token in localStorage', () => {
    const token = 'jwt-token';

    service.saveToken(token);

    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('should return null when no token exists', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return null when token is malformed', () => {
    localStorage.setItem('auth_token', 'invalid.token');

    expect(service.getToken()).toBeNull();
  });

  it('should return null when token has no expiration', () => {
    const payload = btoa(JSON.stringify({ sub: 'user@example.com' }));
    localStorage.setItem('auth_token', `header.${payload}.signature`);

    expect(service.getToken()).toBeNull();
  });

  it('should return the token when it is valid and not expired', () => {
    const payload = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const token = `header.${payload}.signature`;

    localStorage.setItem('auth_token', token);

    expect(service.getToken()).toBe(token);
  });

  it('should clear the session when token is expired', () => {
    const payload = btoa(JSON.stringify({ exp: 1 }));
    localStorage.setItem('auth_token', `header.${payload}.signature`);

    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('should return true when user is logged in', () => {
    const payload = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    localStorage.setItem('auth_token', `header.${payload}.signature`);

    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false when user is not logged in', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should remove the token from localStorage', () => {
    localStorage.setItem('auth_token', 'jwt-token');

    service.clearSession();

    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});