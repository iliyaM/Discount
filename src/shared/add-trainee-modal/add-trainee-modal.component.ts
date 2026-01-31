import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule, provideNativeDateAdapter} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {IPosts} from '../interfaces/trainee.interface';

@Component({
  selector: 'app-add-trainee-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './add-trainee-modal.component.html',
  styleUrl: './add-trainee-modal.component.scss'
})
export class AddTraineeModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddTraineeModalComponent>);
  traineeForm: FormGroup;

  constructor() {
    this.traineeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      subject: ['', [Validators.required, Validators.minLength(2)]],
      grade: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
    });
  }

  onSubmit() {
    if (this.traineeForm.valid) {
      const traineeData: Partial<IPosts> = {
        name: this.traineeForm.value.name,
        subject: this.traineeForm.value.subject,
        grade: this.traineeForm.value.grade,
        date: this.traineeForm.value.date,
      };

      this.dialogRef.close(traineeData);
    } else {
      this.traineeForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.traineeForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }

    if (field?.hasError('email')) {
      return 'Invalid email format';
    }

    if (field?.hasError('pattern')) {
      return 'Invalid phone number (10-15 digits)';
    }

    if (field?.hasError('min')) {
      return 'Grade must be at least 0';
    }

    if (field?.hasError('max')) {
      return 'Grade cannot exceed 100';
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      subject: 'Subject',
      grade: 'Grade',
      date: 'Date',
      email: 'Email',
      phone: 'Phone'
    };
    return labels[fieldName] || fieldName;
  }
}
