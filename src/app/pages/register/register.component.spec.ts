import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { jest } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  let userService: {
    register: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      register: jest.fn().mockReturnValue(of(undefined))
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the registration fields and login link', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#register-title')?.textContent).toContain('Créer un compte');
    expect(element.querySelectorAll('.register-fields input').length).toBe(3);
    expect(element.querySelector('.login-link')?.getAttribute('href')).toBe('/login');
    expect(element.querySelector('.register-button')?.textContent).toContain('Créer mon compte');
  });

  it('should display an error when required fields are missing', () => {
    component.onSubmit();

    expect(component.errorMessage).toBe('Tous les champs sont obligatoires.');
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('should display an error when passwords do not match', () => {
    component.email = 'user@example.com';
    component.password = 'password123';
    component.passwordConfirmation = 'different123';

    component.onSubmit();

    expect(component.errorMessage).toBe('Les mots de passe ne correspondent pas.');
    expect(userService.register).not.toHaveBeenCalled();
  });

  it('should register the user and navigate to login', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.email = ' user@example.com ';
    component.password = 'password123';
    component.passwordConfirmation = 'password123';

    component.onSubmit();

    expect(userService.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });

    expect(component.successMessage).toBe(
      'Votre compte a été créé. Vous pouvez maintenant vous connecter.'
    );
    expect(component.isSubmitting).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
 
});