# Trainee Management System

A modern Angular application for managing trainee information with advanced filtering, searching, and data visualization capabilities.

## 🚀 Features

- **Data Table**: Display and manage trainee information with pagination
- **Advanced Search & Filtering**:
  - Search by ID (`id:5`)
  - Filter by grade (`> 80`, `< 50`)
  - Filter by date (`> 2024-01-01`, `< 2024-12-31`)
  - General text search across name, subject, and grade
- **Trainee Details Panel**: View comprehensive trainee information
- **CRUD Operations**:
  - Add new trainees via modal dialog
  - Delete trainees from the table
  - View detailed trainee information
- **Analysis Dashboard**:
  - Drag-and-drop interface for comparing up to 3 trainees
  - Visual data representation
  - Swappable containers
- **Monitor View**:
  - Pass/fail status tracking (65 threshold)
  - Multi-select ID filtering
  - Name search
  - Status-based filtering (passed/failed)

## 🛠️ Technologies Used

- **Framework**: Angular 19 (Standalone Components)
- **UI Library**: Angular Material Design
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient
- **Drag & Drop**: Angular CDK
- **Testing**: Jasmine & Karma
- **Styling**: SCSS

## 📊 Data Source & API Integration

### JSONPlaceholder API Integration

This project uses [JSONPlaceholder](https://jsonplaceholder.typicode.com/) as the data source for trainee information.

#### Posts API (`IPosts`)
- **Endpoint**: `https://jsonplaceholder.typicode.com/posts`
- **Usage**: Primary data source for trainee list
- **Why "IPosts"?** The interface is named `IPosts` because we're consuming the `/posts` endpoint from JSONPlaceholder
- **Pagination Support**: Supports `_page` and `_limit` query parameters for pagination
  - Example: `?_page=1&_limit=10` returns 10 results per page

**Data Enhancement:**
Since JSONPlaceholder posts don't include trainee-specific fields, the following properties are randomly generated for each post:
- `grade` (0-100)
- `subject` (Mathematics, Physics, Chemistry, etc.)
- `date` (random date between 2020 and now)
- `name` (randomly generated first and last name)

#### Users API (`ITrainee`)
- **Endpoint**: `https://jsonplaceholder.typicode.com/users/{id}`
- **Usage**: Detailed trainee information when a table row is clicked
- **Data Merging**: User data from the API is merged with the additional trainee-specific fields (grade, subject, date, name) from the original post

#### API Limitations & Workarounds

**10 User Limit:**
JSONPlaceholder's `/users` endpoint only supports IDs 1-10. Requesting `/users/11` or higher returns no data.

**Solution Implemented:**
- The application detects when a trainee ID is greater than 10
- Automatically generates a comprehensive mock `ITrainee` object with:
  - Realistic address information
  - Company details
  - Contact information
  - Geographic coordinates
  - All trainee-specific fields (grade, subject, date)

This ensures a seamless user experience regardless of the trainee ID.
```typescript
// Example: ID > 10 triggers mock data generation
if (post.id > 10) {
  return mockTraineeData; // Fully populated ITrainee object
} else {
  return api.getUser(post.id); // Real API call
}
```

## 🏗️ Project Structure
```
src/
├── features/
│   └── components/
│       ├── trainee-table/     # Main data table with CRUD operations
│       ├── analysis/          # Drag-and-drop comparison dashboard
│       ├── monitor/           # Pass/fail tracking and filtering
│       └── dashboard/         # Main navigation container
├── shared/
│   ├── interfaces/
│   │   ├── trainee.interface.ts
│   │   └── filters.interface.ts
│   ├── services/
│   │   ├── trainees.service.ts
│   │   └── search-filter.service.ts
│   └── add-trainee-modal/    # Modal component for adding trainees
└── app.routes.ts
```

## 🎯 Key Interfaces

### IPosts (Trainee List Item)
```typescript
interface IPosts {
  id: number;
  userId: number;
  title: string;
  body: string;
  name: string;          // Generated
  subject: string;       // Generated
  date: string;          // Generated
  grade: number;         // Generated
}
```

### ITrainee (Detailed Trainee Information)
```typescript
interface ITrainee {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: IAddress;
  company: ICompany;
  grade: number;         // Added
  subject: string;       // Added
  date: string;          // Added
}
```

## 🔍 Search & Filter Capabilities

The application supports multiple search patterns:

| Pattern | Example | Description |
|---------|---------|-------------|
| ID Search | `id:5` | Find trainee by exact ID |
| Grade Filter | `> 80` | Find trainees with grade greater than 80 |
| Grade Filter | `< 50` | Find trainees with grade less than 50 |
| Date Filter | `> 2024-01-01` | Find trainees after specific date |
| Date Filter | `< 2024-12-31` | Find trainees before specific date |
| General Search | `John` | Search across name, subject, and grade |

## 📱 Pages & Features

### 1. Data Table (Trainee Table)
- Paginated table with 10 items per page
- Real-time search and filtering
- Click row to view details in side panel
- Add/Delete operations
- Responsive layout with Material Design

### 2. Analysis Dashboard
- Drag numbers (1-10) to containers
- Compare up to 3 trainees simultaneously
- Swap trainees between containers
- Visual data representation
- Third container is toggleable

### 3. Monitor View
- Pass/fail status indicator (green ≥65, red <65)
- Multi-select ID filter
- Name search filter
- Status checkboxes (show passed/failed)
- Comprehensive data grid

## 🧪 Testing

Comprehensive test coverage using Jasmine and Karma:
```bash
# Run tests
ng test

# Run tests with coverage
ng test --code-coverage
```

**Test Coverage Includes:**
- Component initialization and lifecycle
- Service method testing with mocks
- Signal reactivity
- Form validation
- Error handling
- HTTP request/response handling
- User interactions

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd trainee-management-system

# Install dependencies
npm install

# Start development server
ng serve

# Open browser
http://localhost:4200
```

### Build
```bash
# Production build
ng build --configuration production

# Output will be in dist/ directory
```

## 📦 Dependencies

### Core Dependencies
- `@angular/core`: ^19.0.0
- `@angular/material`: ^19.0.0
- `@angular/cdk`: ^19.0.0
- `rxjs`: ^7.8.0

### Development Dependencies
- `@angular-devkit/build-angular`
- `jasmine-core`
- `karma`
- `typescript`

## 🎨 Material Design Components Used

- **Data Display**: MatTable, MatCard, MatChip
- **Forms**: MatFormField, MatInput, MatSelect, MatCheckbox, MatDatepicker
- **Navigation**: MatButton, MatIcon
- **Feedback**: MatProgressSpinner, MatDialog
- **Layout**: MatDivider, MatPaginator
- **Drag & Drop**: CdkDrag, CdkDropList

## 🔄 State Management

The application uses Angular Signals for reactive state management:
```typescript
// Writable Signals
userData = signal<IPosts[]>([]);
filteredData = signal<IPosts[]>([]);
selectedTrainee = signal<ITrainee | null>(null);

// Computed Signals
availableIds = computed(() => [...new Set(this.allTrainees().map(t => t.id))]);
filteredTrainees = computed(() => this.applyFilters());
```

## 🐛 Known Limitations

1. **Data Persistence**: Data is not persisted (in-memory only)
2. **User Limit**: JSONPlaceholder only provides 10 real users (handled with mock data)
3. **Pagination Total**: Total items set to 100 (can be adjusted based on needs)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

Your Name - [Your Email/GitHub]

## 🙏 Acknowledgments

- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) for providing the free REST API
- [Angular Material](https://material.angular.io/) for the UI components
- Angular team for the amazing framework and Signals API

---

**Note**: This is a demonstration project showcasing Angular best practices, Material Design implementation, and modern state management with Signals.
