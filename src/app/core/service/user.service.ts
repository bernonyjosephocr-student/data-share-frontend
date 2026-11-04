import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Token, User } from '../interface/user';

@Injectable({
  providedIn: 'root'  //make the service available evewhere in the app
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly userEndpointBase = '/api/auth';  
  private readonly TOKEN_KEY = 'auth_token';

  /**
   *  Register a user
   * @param user 
   * @returns 
   */
  register(user: Pick<User, 'email' | 'password'>): Observable<void> {
    return this.http.post<void>(`${this.userEndpointBase}/register`, user);
  }

  /**
   * Authenticate the user
   * @param credentials 
   * @returns the user token
   */
  login(credentials: Pick<User, 'email' | 'password'>): Observable<Token> {
    return this.http.post<Token>(`${this.userEndpointBase}/login`, credentials);
  }

 /**
   * Saves the backend JWT token upon successful login/registration.
   */
  saveToken(token: string): void {
    console.info('Saving token to localStorage:', token);
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * 
   * @returns a token if it exists, valid and is not expired, otherwise null.
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    // 1. Basic check: does the token exist?
    if (!token || token.trim().length === 0) {
      console.warn('No token found in localStorage.');
      return null;
    }

    try {
      // 2. Extract the payload (the second segment of the JWT)
      const segments = token.split('.');
      if (segments.length !== 3) {
        // Malformed token
        console.warn('Malformed token. Expected 3 segments but found:', segments.length);
        return null; 
      }

      // 3. Decode the Base64 payload string
      const payloadJson = atob(segments[1]);
      const payload = JSON.parse(payloadJson);

      // 4. Check the expiration claim ('exp')
      if (!payload.exp) {
        // No expiration date found in token
        return null; 
      }

      // The 'exp' timestamp from the backend is in seconds.
      // Date.now() returns time in milliseconds, so we divide by 1000.
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      // Returns true if the current time is before the expiration time
      if (payload.exp > currentTimestampInSeconds) {
        console.info
        return token;
      } else {
        console.warn('Token has expired.');
        // Clear the expired token
        this.clearSession();
        return null;
      }

    }
    catch (error) {
      console.error('Error decoding token:', error);
      // Treat any decoding/parsing errors as an invalid token
      return null; 
    }
  }

  /**
   * Checks if the user has a valid and unexpired session token.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return token !== null;
    
  }


  /**
   * Destroys the current user session by removing the stored JWT.   * 
   */
  clearSession(): void {    
    localStorage.removeItem(this.TOKEN_KEY);
    console.info('User session cleared. Token removed from storage.');
  }

}
