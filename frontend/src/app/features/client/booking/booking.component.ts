import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { format } from 'date-fns';
import { forkJoin, of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, switchMap, take, timeout } from 'rxjs/operators';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { Professional } from '../../../core/models/professional.model';
import { Service } from '../../../core/models/service.model';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../professional/services/appointment.service';
import { ProfessionalService } from '../../professional/services/professional.service';
import { ServiceManagementService } from '../../professional/services/service-management.service';
import { GuestInfoDialogComponent } from './guest-info-dialog.component';

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
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule
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
  private cdr = inject(ChangeDetectorRef);

  bookingForm: FormGroup;
  professional: Professional | null = null;
  services: Service[] = [];
  availableSlots: string[] = [];
  loading = false;
  initialLoading = true;
  error: string | null = null;
  selectedDate: Date | null = null;
  today = new Date();
  isLoggedIn = false;
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  constructor() {
    this.isLoggedIn = this.authService.isLoggedIn;

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
      this.loadData(professionalId);
    } else {
      this.error = 'Profissional não especificado.';
      this.initialLoading = false;
    }
  }

  loadData(professionalId: number): void {
    this.initialLoading = true;
    this.error = null;
 

    forkJoin({
      professional: this.professionalService.getProfessional(professionalId).pipe(take(1)),
      services: this.serviceManagementService.getServicesByProfessional(professionalId).pipe(
          take(1),
          catchError(err => {
              console.error('Error loading services, using professional services as fallback', err);
              return of([]);
          })
      )
    })
    .pipe(
      timeout(10000), // Force timeout after 10s
      finalize(() => {
        this.initialLoading = false;
        
        this.cdr.detectChanges(); // Force UI update
      })
    )
    .subscribe({
      next: ({ professional, services }) => {
        
        this.professional = professional;
        // If services endpoint returned empty but professional has embedded services, use them
        if (services.length === 0 && professional.services && professional.services.length > 0) {
            this.services = professional.services;
        } else {
            this.services = services;
        }
        this.setupDateChange();
      },
      error: (err) => {
        this.error = 'Erro ao carregar dados. Verifique sua conexão e tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  setupDateChange(): void {
    this.bookingForm.get('date')?.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap(date => {
          this.selectedDate = date;
          const service = this.bookingForm.get('service')?.value;
          this.availableSlots = [];

          if (!date || !service || !this.professional) {
            return of(null);
          }

          let formattedDate: string;
          try {
             // Ensure valid date object
             const d = (date instanceof Date) ? date : new Date(date);
             if (isNaN(d.getTime())) {
                 console.warn('Invalid date selected');
                 return of(null);
             }
             formattedDate = format(d, 'yyyy-MM-dd');
          } catch (e) {
              console.error('Date formatting error:', e);
              return of(null);
          }

          this.loading = true;

          return this.appointmentService.getAvailableSlots(
            this.professional.id,
            formattedDate,
            service.id
          ).pipe(
              catchError(err => {
                  console.error('Error loading slots:', err);
                  this.loading = false;
                  return of(null);
              })
          );
        })
      )
      .subscribe({
        next: (response: any) => {
           if (response === null) {
               return;
           }
           
           if (Array.isArray(response)) {
               this.availableSlots = response;
           } else {
               this.availableSlots = response.slots || [];
           }
           this.bookingForm.patchValue({ slot: null });
           this.loading = false;
           this.cdr.detectChanges(); // Force UI update
        },
        error: (err) => {
            console.error('Stream error:', err);
            this.loading = false;
            this.cdr.detectChanges(); // Force UI update
        }
      });
  }

  onServiceChange(): void {
    const dateControl = this.bookingForm.get('date');
    if (dateControl?.value) {
      dateControl.updateValueAndValidity({ emitEvent: true });
    }
    // Clear slots when service changes
    this.availableSlots = []; 
    this.bookingForm.patchValue({ slot: null });
  }

  formatSlot(slot: string): string {
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
        date_time: appointmentDate.toISOString(), 
        duration: formValue.service.duration,
        notes: formValue.observacoes,
        status: AppointmentStatus.PENDING
      };
      
      if (this.isLoggedIn) {
        this.appointmentService.createAppointment(appointment).subscribe({
          next: () => {
            this.router.navigate(['/client/appointments']);
          },
          error: (err) => {
              console.error('Error creating appointment:', err);
              this.error = 'Erro ao realizar agendamento.';
              this.loading = false;
          }
        });
      } else {
        const dialogRef = this.dialog.open(GuestInfoDialogComponent, {
          width: '500px',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(guestInfo => {
          if (guestInfo) {
            const guestData = {
              ...appointment,
              ...guestInfo
            };
            
            this.appointmentService.createGuestAppointment(guestData).subscribe({
              next: () => {
                 alert('Agendamento realizado com sucesso! Você receberá uma confirmação por e-mail.');
                 this.router.navigate(['/client/search']);
              },
              error: (err: any) => {
                  console.error('Error creating guest appointment:', err);
                  this.error = 'Erro ao realizar agendamento.';
                  this.loading = false;
              }
            });
          } else {
            // User cancelled the dialog, reset loading
            this.loading = false;
          }
        });
      }
    }
  }
}
