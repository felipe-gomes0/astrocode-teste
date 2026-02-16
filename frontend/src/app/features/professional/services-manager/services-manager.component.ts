import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Service } from '../../../core/models/service.model';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceManagementService } from '../services/service-management.service';
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
    MatDialogModule
  ],
  templateUrl: './services-manager.component.html',
  styleUrls: ['./services-manager.component.scss']
})
export class ServicesManagerComponent implements OnInit {
  private serviceManagementService = inject(ServiceManagementService);
  private dialog = inject(MatDialog);

  private authService = inject(AuthService);
  
  private cdr = inject(ChangeDetectorRef);
  
  services: Service[] = [];
  displayedColumns: string[] = ['name', 'duration', 'price', 'actions'];

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
         if (user && user.type === 'professional' && user.professional) {
             this.loadServices(user.professional.id);
         }
    });
  }

  loadServices(professionalId?: number): void {
      if (!professionalId) return;
      this.serviceManagementService.getServicesByProfessional(professionalId).subscribe(services => {
          this.services = services;
          this.cdr.detectChanges();
      });
  }

  openServiceDialog(service?: Service): void {
    const dialogRef = this.dialog.open(ServiceDialogComponent, {
      width: '500px',
      data: service || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
         // Reload list
         this.authService.currentUser.subscribe(user => {
             if (user && user.type === 'professional' && user.professional) {
                 this.loadServices(user.professional.id);
             }
         });
      }
    });
  }

  deleteService(service: Service): void {
    if(confirm('Tem certeza que deseja excluir este serviço?')) {
        this.serviceManagementService.deleteService(service.id).subscribe(() => {
            this.authService.currentUser.subscribe(user => {
                 if (user && user.type === 'professional' && user.professional) {
                     this.loadServices(user.professional.id);
                 }
            });
        });
    }
  }
}
