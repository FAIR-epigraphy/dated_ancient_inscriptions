import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../_services/api.service';
import * as L from 'leaflet';
import 'leaflet.heat';

@Component({
  selector: 'app-summary-dated-inscriptions',
  templateUrl: './summary-dated-inscriptions.component.html',
  styleUrls: ['./summary-dated-inscriptions.component.css']
})
export class SummaryDatedInscriptionsComponent implements OnInit, OnChanges {

  count = -1;
  totalDatasources: any = undefined;
  totalEvidences: any = undefined;
  geoLocations: any = undefined;
  totalSourcesEvidences: any = undefined;
  heatData: any[] = [];

  private map!: L.Map;
  private heatLayer!: L.Layer;  // Store reference to heatLayer

  @Input() sharedFilterData: any;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.initMap();
    await this.getCompleteInscriptions();
  }

  // Initialize Leaflet map
  private initMap(): void {
    this.map = L.map('map', {
      center: [41.9028, 12.4964], // Centered on Italy
      zoom: 4
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  async getCompleteInscriptions() {
    this.count = await this.apiService.getSummaryTotalCount(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.totalDatasources = await this.apiService.getSummaryTotalDatasources(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.totalEvidences = await this.apiService.getSummaryTotalEvidences(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.geoLocations = await this.apiService.getSummaryTotalGeoLocations(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.totalSourcesEvidences = await this.apiService.getSummaryTotalSourcesEvidence(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    //console.log(this.totalEvidences);
    //this.inscriptions = response;
    //this.filterData.dateRange = '';
  }

  showMap() {
    console.log(this.map);
    setTimeout(() => {
      this.map.invalidateSize();
      this.heatData = []
      // Loop through geonames and get coordinates for each
      this.geoLocations.forEach(async (loc: any, index: any) => {
        if (loc.lat !== null && loc.lng !== null) {
          let lat = parseFloat(loc.lat);
          let lon = parseFloat(loc.lng);
          this.heatData.push([lat, lon, loc.count]);
        }
      });

      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);  // Remove the existing heat layer
      }

      // Once we have coordinates for all, create the heat layer
      this.heatLayer = L.heatLayer(this.heatData, {
        radius: 25,
        blur: 10,
        maxZoom: 10,
        max: Math.max(...this.geoLocations.map((loc: any) => loc.count)) // Set max intensity based on the highest count
      }).addTo(this.map);
    }, 500);
  }

  ngOnChanges(changes: any) {
    if (changes['sharedFilterData'] && !changes['sharedFilterData'].firstChange) {
      this.totalDatasources = undefined;
      this.totalEvidences = undefined;
      this.totalSourcesEvidences = undefined;
      this.getCompleteInscriptions();
      this.cdr.detectChanges();  // Trigger change detection manually
    }
  }
}
