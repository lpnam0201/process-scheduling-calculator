import { Component } from '@angular/core';
import { TimeBlockProviderService } from './services/time-block-provider-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TimeBlockProviderService]
})
export class AppComponent {
  title = 'process-scheduling';
}
