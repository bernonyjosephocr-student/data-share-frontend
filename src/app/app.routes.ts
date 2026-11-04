import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { UploadComponent } from './pages/upload/upload.component';
import { authGuard } from './core/guards/auth.guard';
import { FileDownloadComponent } from './pages/file-download/file-download.component';
import { MySpaceComponent } from './pages/my-space/my-space.component';

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
            },
            {
                path: 'upload',
                component: UploadComponent
            },
            {
                path: 'my-space',
                component: MySpaceComponent,
                canActivate: [authGuard]
            },
            {
                path: ':token',
                component: FileDownloadComponent
            }
        ]
    }
];
