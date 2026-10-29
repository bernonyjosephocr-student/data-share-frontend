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

    const request = httpTestingController.expectOne('http://localhost:8080/api/auth/register');
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

    const request = httpTestingController.expectOne('http://localhost:8080/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);
    request.flush(token);
    expect(response).toEqual(token);
  });
});
