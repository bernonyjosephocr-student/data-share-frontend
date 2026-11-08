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
        console.info('Login successful. Received token:', token);
        this.userService.saveToken(token);
        this.isSubmitting = false;
        void this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        
        // Handling the error message
        if (error.error && typeof error.error === 'object' && error.error.message) {
          // JSON msg
          this.errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          // Text msg
          this.errorMessage = error.error;
        } else if (error.status === 500) {
          // Server down
          this.errorMessage = 'Impossible de joindre le serveur. Veuillez vérifier votre connexion.';
        } else {
          // Worst case
          this.errorMessage = `Erreur (${error.status}) : ${error.statusText || 'Connexion impossible. Vérifiez votre email et votre mot de passe.'}`;
        }
        console.error(error);
      }
    });
  }
}
