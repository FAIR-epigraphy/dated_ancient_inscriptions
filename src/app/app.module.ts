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

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
    ShowDatedInscriptionsComponent,
    SummaryDatedInscriptionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    InfiniteScrollModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
