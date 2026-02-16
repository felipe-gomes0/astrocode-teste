import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfessionalService } from '../../professional/services/professional.service';
import { Professional } from '../../../core/models/professional.model';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
    MatTabsModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private professionalService = inject(ProfessionalService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient); // Direct usage for Working Hours

  profileForm: FormGroup;
  workingHoursForm: FormGroup;
  currentProfessional: Professional | null = null;
  loading = false;
  
  daysOfWeek = [
    { id: 0, name: 'Segunda-feira' }, // Adjust 0 based on backend logic. Usually 0=Sunday or Monday. Python datetime.weekday() 0=Monday.
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
    // Initialize working hours form
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
            this.currentProfessional = userWithProf.professional;
            this.loadProfile();
            this.loadWorkingHours();
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
      
      this.http.get<any[]>(`${environment.apiUrl}/working-hours/professional/${this.currentProfessional.id}`).subscribe({
          next: (hours) => {
              // Map backend hours to form
              // This logic depends on backend response structure.
              hours.forEach(hour => {
                 const control = this.hoursArray.controls.find(c => c.value.dayId === hour.dia_semana);
                 if (control) {
                     control.patchValue({
                         active: hour.ativo,
                         start: hour.hora_inicio,
                         end: hour.hora_fim
                     });
                 }
              });
          }
      });
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentProfessional) {
        this.professionalService.updateProfessional(this.currentProfessional.id, this.profileForm.value).subscribe({
            next: () => {
                this.snackBar.open('Perfil atualizado!', 'Fechar', { duration: 3000 });
            }
        });
    }
  }

  updateWorkingHours(): void {
      if (!this.currentProfessional) return;
      
      const requests = this.hoursArray.controls
        .filter(c => c.dirty) // Only update changed
        .map(c => {
            const val = c.value;
            const payload = {
                professional_id: this.currentProfessional!.id,
                dia_semana: val.dayId,
                hora_inicio: val.start,
                hora_fim: val.end,
                ativo: val.active
            };
            return this.http.post(`${environment.apiUrl}/working-hours/`, payload);
        });

      if (requests.length === 0) {
          this.snackBar.open('Nenhuma alteração para salvar.', 'Fechar', { duration: 3000 });
          return;
      }

      let completed = 0;
      requests.forEach(obs => obs.subscribe(() => {
          completed++;
          if (completed === requests.length) {
              this.snackBar.open('Horários atualizados!', 'Fechar', { duration: 3000 });
          }
      }));
  }
}
