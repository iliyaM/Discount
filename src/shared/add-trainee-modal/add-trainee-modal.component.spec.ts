import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {AddTraineeModalComponent} from './add-trainee-modal.component';

describe('AddTraineeModalComponent', () => {
  let component: AddTraineeModalComponent;
  let fixture: ComponentFixture<AddTraineeModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AddTraineeModalComponent>>;

  beforeEach(async () => {
    // Create mock DialogRef
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        AddTraineeModalComponent,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTraineeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.traineeForm.get('name')?.value).toBe('');
      expect(component.traineeForm.get('subject')?.value).toBe('');
      expect(component.traineeForm.get('grade')?.value).toBe('');
      expect(component.traineeForm.get('date')?.value).toBe('');
      expect(component.traineeForm.get('email')?.value).toBe('');
      expect(component.traineeForm.get('phone')?.value).toBe('');
    });

    it('should have all required validators', () => {
      const nameControl = component.traineeForm.get('name');
      const subjectControl = component.traineeForm.get('subject');
      const gradeControl = component.traineeForm.get('grade');
      const dateControl = component.traineeForm.get('date');
      const emailControl = component.traineeForm.get('email');
      const phoneControl = component.traineeForm.get('phone');

      expect(nameControl?.hasError('required')).toBe(true);
      expect(subjectControl?.hasError('required')).toBe(true);
      expect(gradeControl?.hasError('required')).toBe(true);
      expect(dateControl?.hasError('required')).toBe(true);
      expect(emailControl?.hasError('required')).toBe(true);
      expect(phoneControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when empty', () => {
      expect(component.traineeForm.valid).toBe(false);
    });
  });

  describe('Name Field Validation', () => {
    it('should be invalid when name is empty', () => {
      const nameControl = component.traineeForm.get('name');
      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when name has less than 2 characters', () => {
      const nameControl = component.traineeForm.get('name');
      nameControl?.setValue('A');
      expect(nameControl?.hasError('minlength')).toBe(true);
    });

    it('should be valid when name has 2 or more characters', () => {
      const nameControl = component.traineeForm.get('name');
      nameControl?.setValue('John Doe');
      expect(nameControl?.valid).toBe(true);
    });
  });

  describe('Subject Field Validation', () => {
    it('should be invalid when subject is empty', () => {
      const subjectControl = component.traineeForm.get('subject');
      subjectControl?.setValue('');
      expect(subjectControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when subject has less than 2 characters', () => {
      const subjectControl = component.traineeForm.get('subject');
      subjectControl?.setValue('M');
      expect(subjectControl?.hasError('minlength')).toBe(true);
    });

    it('should be valid when subject has 2 or more characters', () => {
      const subjectControl = component.traineeForm.get('subject');
      subjectControl?.setValue('Mathematics');
      expect(subjectControl?.valid).toBe(true);
    });
  });

  describe('Grade Field Validation', () => {
    it('should be invalid when grade is empty', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue('');
      expect(gradeControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when grade is less than 0', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(-5);
      expect(gradeControl?.hasError('min')).toBe(true);
    });

    it('should be invalid when grade is greater than 100', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(105);
      expect(gradeControl?.hasError('max')).toBe(true);
    });

    it('should be valid when grade is 0', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(0);
      expect(gradeControl?.valid).toBe(true);
    });

    it('should be valid when grade is 100', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(100);
      expect(gradeControl?.valid).toBe(true);
    });

    it('should be valid when grade is between 0 and 100', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(85);
      expect(gradeControl?.valid).toBe(true);
    });
  });

  describe('Date Field Validation', () => {
    it('should be invalid when date is empty', () => {
      const dateControl = component.traineeForm.get('date');
      dateControl?.setValue('');
      expect(dateControl?.hasError('required')).toBe(true);
    });

    it('should be valid when date is provided', () => {
      const dateControl = component.traineeForm.get('date');
      dateControl?.setValue(new Date('2024-01-15'));
      expect(dateControl?.valid).toBe(true);
    });
  });

  describe('Email Field Validation', () => {
    it('should be invalid when email is empty', () => {
      const emailControl = component.traineeForm.get('email');
      emailControl?.setValue('');
      expect(emailControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when email format is incorrect', () => {
      const emailControl = component.traineeForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should be invalid when email is missing @', () => {
      const emailControl = component.traineeForm.get('email');
      emailControl?.setValue('invalidemail.com');
      expect(emailControl?.hasError('email')).toBe(true);
    });

    it('should be valid when email format is correct', () => {
      const emailControl = component.traineeForm.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBe(true);
    });
  });

  describe('Phone Field Validation', () => {
    it('should be invalid when phone is empty', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('');
      expect(phoneControl?.hasError('required')).toBe(true);
    });

    it('should be invalid when phone has less than 10 digits', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('123456789');
      expect(phoneControl?.hasError('pattern')).toBe(true);
    });

    it('should be invalid when phone has more than 15 digits', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('1234567890123456');
      expect(phoneControl?.hasError('pattern')).toBe(true);
    });

    it('should be invalid when phone contains non-numeric characters', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('123-456-7890');
      expect(phoneControl?.hasError('pattern')).toBe(true);
    });

    it('should be valid when phone has 10 digits', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('1234567890');
      expect(phoneControl?.valid).toBe(true);
    });

    it('should be valid when phone has 15 digits', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('123456789012345');
      expect(phoneControl?.valid).toBe(true);
    });
  });

  describe('onSubmit()', () => {
    it('should close dialog with trainee data when form is valid', () => {
      // Fill form with valid data
      component.traineeForm.patchValue({
        name: 'John Doe',
        subject: 'Mathematics',
        grade: 85,
        date: new Date('2024-01-15'),
        email: 'john@example.com',
        phone: '1234567890'
      });

      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        name: 'John Doe',
        subject: 'Mathematics',
        grade: 85,
        date: jasmine.any(Date)
      });
    });

    it('should not close dialog when form is invalid', () => {
      component.traineeForm.patchValue({
        name: 'J', // Too short
        subject: '',
        grade: 150, // Too high
        date: '',
        email: 'invalid-email',
        phone: '123'
      });

      component.onSubmit();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when form is invalid', () => {
      component.onSubmit();

      expect(component.traineeForm.get('name')?.touched).toBe(true);
      expect(component.traineeForm.get('subject')?.touched).toBe(true);
      expect(component.traineeForm.get('grade')?.touched).toBe(true);
      expect(component.traineeForm.get('date')?.touched).toBe(true);
      expect(component.traineeForm.get('email')?.touched).toBe(true);
      expect(component.traineeForm.get('phone')?.touched).toBe(true);
    });

    it('should only include name, subject, grade, and date in output', () => {
      component.traineeForm.patchValue({
        name: 'Jane Smith',
        subject: 'Physics',
        grade: 92,
        date: new Date('2024-06-20'),
        email: 'jane@example.com',
        phone: '9876543210'
      });

      component.onSubmit();

      const closedData = mockDialogRef.close.calls.mostRecent().args[0];
      expect(closedData).toEqual({
        name: 'Jane Smith',
        subject: 'Physics',
        grade: 92,
        date: jasmine.any(Date)
      });
      expect(closedData.email).toBeUndefined();
      expect(closedData.phone).toBeUndefined();
    });
  });

  describe('onCancel()', () => {
    it('should close dialog without data', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return required error message for empty name', () => {
      const nameControl = component.traineeForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      const errorMessage = component.getErrorMessage('name');
      expect(errorMessage).toBe('Name is required');
    });

    it('should return minlength error message for short name', () => {
      const nameControl = component.traineeForm.get('name');
      nameControl?.setValue('A');
      nameControl?.markAsTouched();

      const errorMessage = component.getErrorMessage('name');
      expect(errorMessage).toBe('Minimum 2 characters required');
    });

    it('should return email error message for invalid email', () => {
      const emailControl = component.traineeForm.get('email');
      emailControl?.setValue('invalid');
      emailControl?.markAsTouched();

      const errorMessage = component.getErrorMessage('email');
      expect(errorMessage).toBe('Invalid email format');
    });

    it('should return pattern error message for invalid phone', () => {
      const phoneControl = component.traineeForm.get('phone');
      phoneControl?.setValue('123');
      phoneControl?.markAsTouched();

      const errorMessage = component.getErrorMessage('phone');
      expect(errorMessage).toBe('Invalid phone number (10-15 digits)');
    });

    it('should return min error message for negative grade', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(-5);
      gradeControl?.markAsTouched();

      const errorMessage = component.getErrorMessage('grade');
      expect(errorMessage).toBe('Grade must be at least 0');
    });

    it('should return max error message for grade over 100', () => {
      const gradeControl = component.traineeForm.get('grade');
      gradeControl?.setValue(150);
      gradeControl?.markAsTouched();

      const errorMessage = component.getErrorMessage('grade');
      expect(errorMessage).toBe('Grade cannot exceed 100');
    });

    it('should return empty string when field is valid', () => {
      const nameControl = component.traineeForm.get('name');
      nameControl?.setValue('John Doe');

      const errorMessage = component.getErrorMessage('name');
      expect(errorMessage).toBe('');
    });

    it('should return empty string for non-existent field', () => {
      const errorMessage = component.getErrorMessage('nonexistent');
      expect(errorMessage).toBe('');
    });
  });

  describe('getFieldLabel()', () => {
    it('should return correct label for name', () => {
      const label = (component as any).getFieldLabel('name');
      expect(label).toBe('Name');
    });

    it('should return correct label for subject', () => {
      const label = (component as any).getFieldLabel('subject');
      expect(label).toBe('Subject');
    });

    it('should return correct label for grade', () => {
      const label = (component as any).getFieldLabel('grade');
      expect(label).toBe('Grade');
    });

    it('should return correct label for date', () => {
      const label = (component as any).getFieldLabel('date');
      expect(label).toBe('Date');
    });

    it('should return correct label for email', () => {
      const label = (component as any).getFieldLabel('email');
      expect(label).toBe('Email');
    });

    it('should return correct label for phone', () => {
      const label = (component as any).getFieldLabel('phone');
      expect(label).toBe('Phone');
    });

    it('should return field name if label not found', () => {
      const label = (component as any).getFieldLabel('unknownField');
      expect(label).toBe('unknownField');
    });
  });

  describe('Form Integration', () => {
    it('should have valid form when all fields are filled correctly', () => {
      component.traineeForm.patchValue({
        name: 'Alice Johnson',
        subject: 'Chemistry',
        grade: 78,
        date: new Date('2024-03-10'),
        email: 'alice@example.com',
        phone: '5551234567'
      });

      expect(component.traineeForm.valid).toBe(true);
    });

    it('should be invalid if any required field is missing', () => {
      component.traineeForm.patchValue({
        name: 'Bob Smith',
        subject: 'Biology',
        grade: 88,
        date: new Date('2024-02-05'),
        email: 'bob@example.com'
        // phone is missing
      });

      expect(component.traineeForm.valid).toBe(false);
    });
  });
});
