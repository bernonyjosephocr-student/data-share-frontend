import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { UserService } from '../core/service/user.service';

import { jest } from '@jest/globals';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  let userService: {
    isLoggedIn: jest.Mock;
    clearSession: jest.Mock;
  };

  let router: Router;
  

  beforeEach(async () => {
    userService = {
      isLoggedIn: jest.fn(),
      clearSession: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        { provide: UserService, useValue: userService },
        provideRouter([]),
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display the login button when user is not logged in', () => {
    userService.isLoggedIn.mockReturnValue(false);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Se connecter');
    expect(fixture.nativeElement.textContent).not.toContain('Mon espace');
  });

  it('should display the personal space button when user is logged in', () => {
    userService.isLoggedIn.mockReturnValue(true);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Mon espace');
    expect(fixture.nativeElement.textContent).not.toContain('Se connecter');
  });

  it('should clear the session and redirect to home when logging out', () => {
    component.logout();

    expect(userService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});