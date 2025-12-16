import { Component } from "@angular/core";
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css'],
})
export class LeadsComponent {
  // Component logic goes here
}
