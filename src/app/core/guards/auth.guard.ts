import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../service/user.service';

export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const token = userService.getToken();

  //If No token is found, redirect to login page
  if (!token) {
    console.warn('No token found. Redirecting to login page.');
    localStorage.removeItem('authToken');
    return router.createUrlTree(['/login']);
  }else{
    return true;
  }
};

