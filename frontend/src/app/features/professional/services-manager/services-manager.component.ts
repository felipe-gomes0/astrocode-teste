import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Service } from '../../../core/models/service.model';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceManagementService } from '../../professional/services/service-management.service';
import { ServiceDialogComponent } from './service-dialog/service-dialog.component';

@Component({
  selector: 'app-services-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './services-manager.component.html',
  styleUrls: ['./services-manager.component.scss']
})
export class ServicesManagerComponent implements OnInit {
  private serviceManagementService = inject(ServiceManagementService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  services: Service[] = [];
  displayedColumns: string[] = ['name', 'duration', 'price', 'actions'];
  loading = false;
  currentProfessionalId: number | null = null;

  ngOnInit(): void {
    // Improve: get professional ID from currentUser -> professional relationship
    this.authService.currentUser.subscribe(user => {
      // Assuming user has professional data or we fetch it.
      // For now, let's assume we can get it or we might need to fetch /me with professional data.
      // Backend /users/me returns User, which has professional (ProfessionalSchema)
      // Frontend User model needs professional property?
      // Yes, User interface in frontend/src/app/core/models/user.model.ts does NOT have professional field yet.
      // But endpoint returns it. 
      // Let's assume user.professional?.id exists if typed correctly.
      // I need to update User model or cast it.
       const userWithProf = user as any; 
       if (userWithProf?.professional?.id) {
           this.currentProfessionalId = userWithProf.professional.id;
           this.loadServices();
       }
    });
  }

  loadServices(): void {
    if (!this.currentProfessionalId) return;
    
    this.loading = true;
    this.serviceManagementService.getServicesByProfessional(this.currentProfessionalId).subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openDialog(service?: Service): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '400px',
      data: service || { professional_id: this.currentProfessionalId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (service) {
            this.updateService(service.id, result);
        } else {
            this.createService(result);
        }
      }
    });
  }

  createService(data: Partial<Service>): void {
    if (!this.currentProfessionalId) return;
    data.professional_id = this.currentProfessionalId;
    
    this.serviceManagementService.createService(data).subscribe({
      next: () => {
        this.loadServices();
        this.snackBar.open('Serviço criado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  updateService(id: number, data: Partial<Service>): void {
    this.serviceManagementService.updateService(id, data).subscribe({
      next: () => {
        this.loadServices();
        this.snackBar.open('Serviço atualizado com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  deleteService(service: Service): void {
    if (confirm(`Tem certeza que deseja excluir o serviço "${service.name}"?`)) {
        this.serviceManagementService.deleteService(service.id).subscribe({
            next: () => {
                this.loadServices();
                this.snackBar.open('Serviço excluído com sucesso!', 'Fechar', { duration: 3000 });
            }
        });
    }
  }
}
