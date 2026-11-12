import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { jest } from '@jest/globals';

import { authGuard } from './auth.guard';
import { UserService } from '../service/user.service';

describe('authGuard', () => {
  let userService: {
    getToken: jest.Mock;
  };

  let router: Router;

  beforeEach(() => {
    userService = {
      getToken: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('should allow access when a token exists', () => {
    userService.getToken.mockReturnValue('test-jwt-token');

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it('should redirect to login when no token exists', () => {
    userService.getToken.mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});