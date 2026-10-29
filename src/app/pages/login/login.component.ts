import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  onSubmit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    this.userService.login({ email: this.email, password: this.password }).subscribe({
      next: ({ token }) => {
        sessionStorage.setItem('token', token);
        this.isSubmitting = false;
        void this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Connexion impossible. Vérifiez votre email et votre mot de passe.';
        this.isSubmitting = false;
      }
    });
  }
}
