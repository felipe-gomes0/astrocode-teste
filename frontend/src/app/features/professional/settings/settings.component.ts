import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../../environments/environment';
import { Professional } from '../../../core/models/professional.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProfessionalService } from '../../professional/services/professional.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private professionalService = inject(ProfessionalService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);

  profileForm: FormGroup;
  workingHoursForm: FormGroup;
  currentProfessional: Professional | null = null;
  loading = false;

  // Photo upload
  photoPreview: string | null = null;
  uploadingPhoto = false;

  daysOfWeek = [
    { id: 0, name: 'Segunda-feira' },
    { id: 1, name: 'Terça-feira' },
    { id: 2, name: 'Quarta-feira' },
    { id: 3, name: 'Quinta-feira' },
    { id: 4, name: 'Sexta-feira' },
    { id: 5, name: 'Sábado' },
    { id: 6, name: 'Domingo' }
  ];

  constructor() {
    this.profileForm = this.fb.group({
      speciality: [''],
      description: [''],
      address: [''],
      photo_url: ['']
    });

    this.workingHoursForm = this.fb.group({
      hours: this.fb.array([])
    });
  }

  get hoursArray() {
    return this.workingHoursForm.get('hours') as FormArray;
  }

  ngOnInit(): void {
    this.daysOfWeek.forEach(day => {
        this.hoursArray.push(this.fb.group({
            dayId: [day.id],
            dayName: [day.name],
            active: [true],
            start: ['09:00', Validators.required],
            end: ['18:00', Validators.required]
        }));
    });

    this.authService.currentUser.subscribe(user => {
        const userWithProf = user as any;
        if (userWithProf?.professional?.id) {
            this.professionalService.getProfessional(userWithProf.professional.id).subscribe({
                next: (prof) => {
                    this.currentProfessional = prof;
                    this.photoPreview = prof.photo_url || null;
                    this.loadProfile();
                    this.loadWorkingHours();
                },
                error: (err) => {
                    console.error('Erro ao carregar dados do profissional:', err);
                    this.snackBar.open('Erro ao carregar perfil.', 'Fechar', { duration: 3000 });
                }
            });
        }
    });
  }

  loadProfile(): void {
    if (this.currentProfessional) {
        this.profileForm.patchValue({
            speciality: this.currentProfessional.speciality,
            description: this.currentProfessional.description,
            address: this.currentProfessional.address,
            photo_url: this.currentProfessional.photo_url
        });
    }
  }

  loadWorkingHours(): void {
      if (!this.currentProfessional) return;

      this.http.get<any[]>(`${environment.apiUrl}/working-hours/?professional_id=${this.currentProfessional.id}`).subscribe({
          next: (hours) => {
              hours.forEach(hour => {
                 const control = this.hoursArray.controls.find(c => c.value.dayId === hour.day_of_week);
                 if (control) {
                     control.patchValue({
                         active: hour.active,
                         start: hour.start_time,
                         end: hour.end_time
                     });
                 }
              });
          }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Formato inválido. Use JPG, PNG ou WebP.', 'Fechar', { duration: 3000 });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('Arquivo muito grande. Máximo 5MB.', 'Fechar', { duration: 3000 });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    // Upload to backend
    this.uploadingPhoto = true;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ url: string }>(`${environment.apiUrl}/upload/photo`, formData).subscribe({
      next: (result) => {
        this.uploadingPhoto = false;
        this.photoPreview = result.url;
        this.profileForm.patchValue({ photo_url: result.url });
        this.snackBar.open('Foto atualizada com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.uploadingPhoto = false;
        this.snackBar.open(err.error?.detail || 'Erro ao enviar foto.', 'Fechar', { duration: 3000 });
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentProfessional) {
        this.professionalService.updateProfessional(this.currentProfessional.id, this.profileForm.value).subscribe({
            next: () => {
                this.snackBar.open('Perfil atualizado!', 'Fechar', { duration: 3000 });
            },
            error: (err) => {
                console.error('Erro ao atualizar perfil:', err);
                const errorMessage = err.error?.detail || 'Erro ao atualizar perfil.';
                this.snackBar.open(errorMessage, 'Fechar', { duration: 3000 });
            }
        });
    }
  }

  updateWorkingHours(): void {
      if (!this.currentProfessional) return;

      const payload = this.hoursArray.controls.map(c => {
          const val = c.value;
          return {
              professional_id: this.currentProfessional!.id,
              day_of_week: val.dayId,
              start_time: val.start,
              end_time: val.end,
              active: val.active
          };
      });

      this.http.post(`${environment.apiUrl}/working-hours/batch`, payload).subscribe({
          next: () => {
              this.snackBar.open('Horários atualizados!', 'Fechar', { duration: 3000 });
              this.workingHoursForm.markAsPristine();
          },
          error: (err) => {
              console.error(err);
              this.snackBar.open('Erro ao atualizar horários.', 'Fechar', { duration: 3000 });
          }
      });
  }
}
