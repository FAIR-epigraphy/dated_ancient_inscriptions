import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../_services/api.service';

@Component({
  selector: 'app-show-dated-inscriptions',
  templateUrl: './show-dated-inscriptions.component.html',
  styleUrls: ['./show-dated-inscriptions.component.css']
})
export class ShowDatedInscriptionsComponent implements OnInit {

  page = 1;
  limit = 20;  // number of items to fetch per page
  total = 0;   // total number of items in the database
  throttle = 50;
  scrollDistance = 2;
  direction = "";
  loading = false;
  showButton: boolean = false;
  inscriptions: any = [];
  filterData: any = {
    dateRange: '',
    isNotEmptyBefore: false,
    isNotEmptyAfter: false,
    notBefore: '',
    notAfter: '',
    duration: '',
    startDuration: '',
    endDuration: ''
  }

  @Output() filterDataChange = new EventEmitter<any>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private router: Router,
    private apiService: ApiService,
  ) { }

  async ngOnInit() {
    await this.getAllInscriptions();
  }

  scrollToTop(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollTo({ top: 0, behavior: 'smooth' });
    this.showButton = false
  }

  async getAllInscriptions() {
    let response = await this.apiService.getAllInscriptions('', this.page, this.limit);
    this.total = response.count;
    this.inscriptions = response.data;
    console.log(response)
    //this.total = await this.apiService.getTotalCount();
    console.log(this.total);
  }

  async fetchInscriptions() {
    if (this.loading) return;  // prevent multiple requests at once
    this.loading = true;
    let response = await this.apiService.getAllInscriptions(this.filterData.dateRange === '' ? '' : this.filterData, this.page, this.limit);
    this.inscriptions = [...this.inscriptions, ...response.data];//.filter((x: any) => x.isSold === '0');
    this.page++;
    this.loading = false;
  }

  async getFilterValues() {
    this.inscriptions = [];
    this.filterData.dateRange = ((document.getElementById('dateRange') as HTMLInputElement)?.value);
    this.filterData.duration = ((document.getElementById('duration') as HTMLInputElement)?.value);
    this.filterData.notBefore = parseInt(this.filterData.dateRange.split(',')[0])
    this.filterData.notAfter = parseInt(this.filterData.dateRange.split(',')[1])
    //console.log(this.filterData.duration)
    this.filterData.startDuration = parseInt(this.filterData.duration.split(',')[0])
    this.filterData.endDuration = parseInt(this.filterData.duration.split(',')[1])
    console.log(this.filterData)
    this.page = 1;
    this.limit = 20;
    this.total = 0;
    let response = await this.apiService.getAllInscriptions(this.filterData, this.page, this.limit);
    this.filterData = { ...this.filterData }; 
    this.filterDataChange.emit(this.filterData);
    this.inscriptions = response.data;
    this.total = response.count;
    (document.getElementsByClassName('btn-close')[0] as HTMLElement)?.click();
    console.log(this.total);
  }

  refreshSlider() {

  }

  async onScrollDown(ev: any) {
    if (this.inscriptions.length >= this.total) return; // no more items to load
    await this.fetchInscriptions();

    const container = this.scrollContainer.nativeElement;
    this.showButton = container.scrollTop > 100;
  }
}
