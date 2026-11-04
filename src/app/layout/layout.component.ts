import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { UserService } from '../core/service/user.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  public readonly userService = inject(UserService);
  public readonly router = inject(Router);

  /**
   * Clears the session of the user and redirect to the home page
   */
  logout(): void {
    // delete token
    this.userService.clearSession();
    this.router.navigate(['/']);
  }
}
