// frontend/src/app/login/login.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-insert-event',
  templateUrl: './insert-event.component.html',
  styleUrls: ['./insert-event.component.css'],
  
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
})
export class InsertEventComponent {
  showForm: boolean = false; // Flag to toggle form visibility

  event = {
    eventName: '',
    eventDate: '',
    eventLocation: '',
    description: ''
  };

  successMessage: string | undefined;
  errorMessage: string | undefined;

  constructor(private http: HttpClient, private router: Router) {}

  toggleFormVisibility(): void {
    this.showForm = !this.showForm; // Toggle form visibility
  }

  onSubmit(): void {
    const apiUrl = 'http://localhost:5000/api/events'; // Your API endpoint

    this.http.post(apiUrl, this.event).subscribe({
      next: (response: any) => {
        this.successMessage = 'Event added successfully!';
        this.errorMessage = undefined;
        this.resetForm();
        this.showForm = false; // Hide form after successful submission
      },
      error: (error) => {
        this.errorMessage = 'Failed to add event. Please try again.';
        this.successMessage = undefined;
        console.error('Error adding event:', error);
      }
    });
  }

  resetForm(): void {
    this.event = {
      eventName: '',
      eventDate: '',
      eventLocation: '',
      description: ''
    };
  }
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
