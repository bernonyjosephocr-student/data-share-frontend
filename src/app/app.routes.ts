import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
    {
        path: '', // The root URL, for example http://localhost:4200/.
        component: LayoutComponent, // Display the shared application layout.
        children: [
            // Keep application pages inside the shared layout.
            {
                path: '',
                component: HomeComponent
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            }
        ]
    }
];
