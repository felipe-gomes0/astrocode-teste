import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, tap } from 'rxjs/operators';
import { Professional } from '../../../core/models/professional.model';
import { ProfessionalService } from '../../professional/services/professional.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private professionalService = inject(ProfessionalService);
  private router = inject(Router);

  searchForm: FormGroup;
  professionals$!: Observable<Professional[]>;
  loading = false;

  constructor() {
    this.searchForm = this.fb.group({
      especialidade: ['']
    });
  }

  ngOnInit(): void {
    this.professionals$ = this.searchForm.get('especialidade')!.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(term => 
        this.professionalService.searchProfessionals(term).pipe(
          catchError(error => {
            console.error('Error searching professionals:', error);
            return of([]);
          }),
          tap(() => this.loading = false)
        )
      )
    );
  }

  viewProfessional(professional: Professional): void {
    this.router.navigate(['/client/booking', professional.id]);
  }
}
