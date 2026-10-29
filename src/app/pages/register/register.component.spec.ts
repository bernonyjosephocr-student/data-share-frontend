import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { UserService } from '../../core/service/user.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: jasmine.createSpyObj('UserService', ['register']) }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
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
});
