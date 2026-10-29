import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Token, User } from '../interface/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = 'http://localhost:8080/api/auth';

  register(user: Pick<User, 'email' | 'password'>): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/register`, user);
  }

  login(credentials: Pick<User, 'email' | 'password'>): Observable<Token> {
    return this.http.post<Token>(`${this.authUrl}/login`, credentials);
  }
}
