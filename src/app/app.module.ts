import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // <<<< import it here

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppComponent } from './app.component';
import { NavBarComponent } from './_components/nav-bar/nav-bar.component';
import { ShowDatedInscriptionsComponent } from './_components/show-dated-inscriptions/show-dated-inscriptions.component';
import { SummaryDatedInscriptionsComponent } from './_components/summary-dated-inscriptions/summary-dated-inscriptions.component';
import { ConnectedDatasourcesComponent } from './_components/connected-datasources/connected-datasources.component';

import { AngularD3CloudModule } from 'angular-d3-cloud'

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    ShowDatedInscriptionsComponent,
    SummaryDatedInscriptionsComponent,
    ConnectedDatasourcesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    InfiniteScrollModule,
    FormsModule,
    AngularD3CloudModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
