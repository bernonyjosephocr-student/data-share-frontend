import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';
import { UI_CONSTRAINTS } from '../../core/config/validation.constraints';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  protected readonly constraints = UI_CONSTRAINTS;

  email = '';
  password = '';
  passwordConfirmation = '';
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim() || !this.password || !this.passwordConfirmation) {
      this.errorMessage = 'Tous les champs sont obligatoires.';
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isSubmitting = true;

    this.userService.register({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.successMessage =
          'Votre compte a été créé. Vous pouvez maintenant vous connecter.';
        this.isSubmitting = false;
        void this.router.navigate(['/login']);
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
          this.errorMessage = `Erreur (${error.status}) : ${error.statusText || 'Inscription impossible. Vérifiez les informations saisies.'}`;
        }
        console.error(error);
      }
    });
  }  
}
