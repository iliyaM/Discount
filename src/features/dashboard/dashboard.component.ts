import {Component} from '@angular/core';
import {ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterOutlet,
    MatButton,
    RouterLinkActive,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(private router: Router, private route: ActivatedRoute) {

  }

  navigate(navigationPath: 'data' | 'analysis' | 'monitor') {
    this.router.navigate([navigationPath], {relativeTo: this.route});
  }

}
