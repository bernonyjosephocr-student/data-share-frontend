import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

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
      error: () => {
        this.errorMessage =
          'Inscription impossible. Vérifiez les informations saisies.';
        this.isSubmitting = false;
      }
    });
  }  
}
