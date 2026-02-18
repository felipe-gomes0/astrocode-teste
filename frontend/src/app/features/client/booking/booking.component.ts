import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { format } from 'date-fns';
import { switchMap } from 'rxjs/operators';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { Professional } from '../../../core/models/professional.model';
import { Service } from '../../../core/models/service.model';
import { AppointmentService } from '../../professional/services/appointment.service';
import { ProfessionalService } from '../../professional/services/professional.service';
import { ServiceManagementService } from '../../professional/services/service-management.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatChipsModule,
    MatInputModule
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private professionalService = inject(ProfessionalService);
  private serviceManagementService = inject(ServiceManagementService);
  private appointmentService = inject(AppointmentService);

  bookingForm: FormGroup;
  professional: Professional | null = null;
  services: Service[] = [];
  availableSlots: string[] = [];
  loading = false;
  selectedDate: Date | null = null;
  today = new Date();

  constructor() {
    this.bookingForm = this.fb.group({
      service: [null, Validators.required],
      date: [null, Validators.required],
      slot: [null, Validators.required],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    const professionalId = Number(this.route.snapshot.paramMap.get('professionalId'));
    if (professionalId) {
      this.loadProfessional(professionalId);
      this.loadServices(professionalId);
      this.setupDateChange();
    }
  }

  loadProfessional(id: number): void {
    this.professionalService.getProfessional(id).subscribe({
      next: (professional) => {
        this.professional = professional;
      }
    });
  }

  loadServices(professionalId: number): void {
    this.serviceManagementService.getServicesByProfessional(professionalId).subscribe({
      next: (services: Service[]) => {
        this.services = services;
      }
    });
  }

  setupDateChange(): void {
    this.bookingForm.get('date')?.valueChanges
      .pipe(
        switchMap(date => {
          this.selectedDate = date;
          const service = this.bookingForm.get('service')?.value;
          
          if (!date || !service || !this.professional) {
            return [];
          }

          const formattedDate = format(date, 'yyyy-MM-dd');
          return this.appointmentService.getAvailableSlots(
            this.professional.id,
            formattedDate,
            service.id
          );
        })
      )
      .subscribe({
        next: (response: any) => { // Type check workaround or update service return type
           if (Array.isArray(response)) { // Handle if service returns just array or object
               this.availableSlots = response;
           } else {
               this.availableSlots = response.slots || [];
           }
          this.bookingForm.patchValue({ slot: null });
        },
        error: () => {
            this.availableSlots = [];
        }
      });
  }

  onServiceChange(): void {
    const dateControl = this.bookingForm.get('date');
    if (dateControl?.value) {
      dateControl.updateValueAndValidity({ emitEvent: true });
    }
  }

  formatSlot(slot: string): string {
    const date = new Date(slot); // If slot is full ISO string
    // If slot is HH:MM, just return it. 
    // Backend likely returns HH:MM strings based on working hours or ISO strings?
    // Let's assume HH:MM for now or ISO.
    // If it scans as date, format it.
    if (slot.includes('T')) {
        return format(new Date(slot), 'HH:mm');
    }
    return slot;
  }

  onSubmit(): void {
    if (this.bookingForm.valid && this.professional) {
      this.loading = true;
      
      const formValue = this.bookingForm.value;
      const [hours, minutes] = formValue.slot.split(':').map(Number);
      const appointmentDate = new Date(this.selectedDate!);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const appointment: any = {
        professional_id: this.professional.id,
        service_id: formValue.service.id,
        data_hora: appointmentDate.toISOString(), 
        duracao: formValue.service.duration,
        observacoes: formValue.observacoes,
        status: AppointmentStatus.PENDENTE
      };
      
      this.appointmentService.createAppointment(appointment).subscribe({
        next: () => {
          this.router.navigate(['/client/appointments']);
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
