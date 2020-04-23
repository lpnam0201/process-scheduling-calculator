import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProcessChartComponent } from './process-chart/process-chart.component';
import { ProcessInputComponent } from './process-input/process-input.component';
import { ProcessTimeBlockComponent } from './process-time-block/process-time-block.component';
import { ProcessCalculationService } from './services/process-calculation-service';
import { TimeBlockProviderService } from './services/time-block-provider-service';
import { ProcessSchedulingResultComponent } from './process-scheduling-result/process-scheduling-result.component';
import { ProcessSchedulingProviderService } from './services/process-scheduling-provider-service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [
    AppComponent,
    ProcessChartComponent,
    ProcessInputComponent,
    ProcessTimeBlockComponent,
    ProcessSchedulingResultComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSliderModule
  ],
  providers: [
    ProcessCalculationService,
    TimeBlockProviderService,
    ProcessSchedulingProviderService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
