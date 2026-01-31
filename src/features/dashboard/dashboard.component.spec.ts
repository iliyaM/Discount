import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DashboardComponent} from './dashboard.component';
import {RouterModule} from '@angular/router';
import {TraineeTableComponent} from '../components/trainee-table/trainee-table.component';
import {AnalysisComponent} from '../components/analysis/analysis.component';
import {MonitorComponent} from '../components/monitor/monitor.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent,
        RouterModule.forRoot(
          [
            {path: '', component: TraineeTableComponent, title: 'Data'},
            {path: 'data', component: TraineeTableComponent, title: 'Data'},
            {path: 'analysis', component: AnalysisComponent, title: 'Analysis'},
            {path: 'monitor', component: MonitorComponent, title: 'Monitor'}
          ]
        )
      ],
      providers: []
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
