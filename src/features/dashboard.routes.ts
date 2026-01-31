import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {TraineeTableComponent} from './components/trainee-table/trainee-table.component';
import {AnalysisComponent} from './components/analysis/analysis.component';
import {MonitorComponent} from './components/monitor/monitor.component';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: TraineeTableComponent, title: 'Data' },
      { path: 'data', component: TraineeTableComponent, title: 'Data' },
      { path: 'analysis', component: AnalysisComponent, title: 'Analysis' },
      { path: 'monitor', component: MonitorComponent, title: 'Monitor' }
    ]
  }
];
