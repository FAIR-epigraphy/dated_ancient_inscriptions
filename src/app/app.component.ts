import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'dated_inscriptions';
  sharedFilterData: any = {
    dateRange: '',
    isNotEmptyBefore: false,
    isNotEmptyAfter: false,
    notBefore: '',
    notAfter: '',
    duration: '',
    startDuration: '',
    endDuration: ''
  }

  // Method to handle changes in filterData from Sibling1
  onFilterDataChange(updatedFilterData: any) {
    this.sharedFilterData = updatedFilterData;
  }
}
