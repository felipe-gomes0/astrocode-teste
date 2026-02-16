import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Service } from '../../../core/models/service.model';
import { ServiceManagementService } from '../services/service-management.service';

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

  services: Service[] = [];
  displayedColumns: string[] = ['name', 'duration', 'price', 'actions'];

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    // We need to get professional ID from auth user first in a real app
    // For now assuming the service handles "my services" or we pass ID
    // The service-management service likely needs a 'getMyServices' method
    // Or we fetch current user's professional ID.
    
    // Placeholder implementation
    /*
    this.serviceManagementService.getMyServices().subscribe(services => {
        this.services = services;
    });
    */
  }

  openServiceDialog(service?: Service): void {
    // Open dialog logic
  }

  deleteService(service: Service): void {
    if(confirm('Tem certeza que deseja excluir este serviço?')) {
        this.serviceManagementService.deleteService(service.id).subscribe(() => {
            this.loadServices();
        });
    }
  }
}
