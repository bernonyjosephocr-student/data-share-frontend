import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { jest } from '@jest/globals';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let userService: {
    login: jest.Mock;
    saveToken: jest.Mock;
  };

  let router: Router;

  beforeEach(async () => {
    userService = {
      login: jest.fn(),
      saveToken: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: userService
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display an error when required fields are empty', () => {
    component.email = '';
    component.password = '';

    component.onSubmit();

    expect(component.errorMessage).toBe('Tous les champs sont obligatoires.');
    expect(userService.login).not.toHaveBeenCalled();
  });

  it('should login successfully and redirect to home', () => {
    userService.login.mockReturnValue(of({ token: 'fake-jwt-token' }));

    component.email = 'test@example.com';
    component.password = 'password123';

    component.onSubmit();

    expect(userService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(userService.saveToken).toHaveBeenCalledWith('fake-jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.isSubmitting).toBe(false);
  });

});