import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './login/login';

// Client Components
import { AppointmentsComponent } from './features/client/appointments/appointments.component';
import { BookingComponent } from './features/client/booking/booking.component';
import { SearchComponent } from './features/client/search/search.component';

// Professional Components
import { DashboardComponent } from './features/professional/dashboard/dashboard.component';
import { ServicesManagerComponent } from './features/professional/services-manager/services-manager.component';
import { SettingsComponent } from './features/professional/settings/settings.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { 
        path: 'register', 
        loadComponent: () => import('./features/common/register/register.component').then(m => m.RegisterComponent) 
    },
    
    // Public Client Routes
    { path: 'client/search', component: SearchComponent },

    // Protected Client Routes
    { 
        path: 'client',
        canActivate: [AuthGuard],
        children: [
            { path: 'booking/:professionalId', component: BookingComponent },
            { path: 'appointments', component: AppointmentsComponent },
            { path: '', redirectTo: 'search', pathMatch: 'full' }
        ]
    },

    // Professional Routes
    {
        path: 'professional',
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'services', component: ServicesManagerComponent },
            { 
                path: 'blocks', 
                loadComponent: () => import('./features/professional/block-manager/block-manager.component').then(m => m.BlockManagerComponent) 
            },
            { path: 'settings', component: SettingsComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '', redirectTo: '/client/search', pathMatch: 'full' }
];
