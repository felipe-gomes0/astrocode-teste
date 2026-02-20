import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './login/login';

// Client Components
import { AppointmentsComponent } from './features/client/appointments/appointments.component';
import { BookingComponent } from './features/client/booking/booking.component';
import { SearchComponent } from './features/client/search/search.component';

// Professional Components
import { DashboardComponent } from './features/professional/dashboard/dashboard.component';
import { ServicesManagerComponent } from './features/professional/services-manager/services-manager.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Login - AstroCode' },
    { 
        path: 'register', 
        loadComponent: () => import('./features/common/register/register.component').then(m => m.RegisterComponent),
        title: 'Cadastro - AstroCode'
    },
    
    // Public Client Routes
    { path: 'client/search', component: SearchComponent, title: 'Buscar Profissionais - AstroCode' },

// Protected Client Routes
    { 
        path: 'client',
        canActivate: [AuthGuard],
        children: [
            { path: 'booking/:professionalId', component: BookingComponent, title: 'Agendamento - AstroCode' },
            { path: 'appointments', component: AppointmentsComponent, title: 'Meus Agendamentos - AstroCode' },
            { 
                path: 'settings', 
                loadComponent: () => import('./features/client/settings/settings').then(m => m.Settings),
                title: 'Configurações - AstroCode' 
            },
            { path: '', redirectTo: 'search', pathMatch: 'full' }
        ]
    },

    // Professional Routes
    {
        path: 'professional',
        canActivate: [AuthGuard, roleGuard],
        data: { role: 'professional' },
        children: [
            { path: 'dashboard', component: DashboardComponent, title: 'Dashboard - AstroCode' },
            { path: 'services', component: ServicesManagerComponent, title: 'Gerenciar Serviços - AstroCode' },
            { 
                path: 'blocks', 
                loadComponent: () => import('./features/professional/block-manager/block-manager.component').then(m => m.BlockManagerComponent),
                title: 'Gerenciar Bloqueios - AstroCode'
            },
            { 
                path: 'settings', 
                loadComponent: () => import('./features/professional/settings/settings.component').then(m => m.SettingsComponent), 
                title: 'Configurações - AstroCode' 
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    { path: '', redirectTo: '/client/search', pathMatch: 'full' }
];
