import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private base_url = 'https://fair.classics.ox.ac.uk/dated_inscriptions_api';
  constructor(
    private http: HttpClient,
  ) { }

  getAllInscriptions(filterData: any, page:any, limit:any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getAllInscriptions', filterData: filterData, page: page, limit: limit }));
  }

  downloadJSON(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'downloadJSON', filterData: filterData }));
  }

  downloadCSV(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'downloadCSV', filterData: filterData }));
  }

  downloadFile(filename: any): any {
    return firstValueFrom(this.http.get(`${this.base_url}/download.php`));
  }

  getSummaryTotalCount(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getSummaryTotalCount', filterData: filterData }));
  }

  getSummaryTotalDatasources(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getSummaryTotalDatasources', filterData: filterData }));
  }

  getSummaryTotalEvidences(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getSummaryTotalEvidences', filterData: filterData }));
  }

  getSummaryTotalGeoLocations(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getSummaryTotalGeoLocations', filterData: filterData }));
  }

  getSummaryTotalSourcesEvidence(filterData: any): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getSummaryTotalSourcesEvidence', filterData: filterData }));
  }

  getTotalCount(): any {
    return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getTotalCount' }));
  }

  // getFilteredInscriptions(filterData: any, page:any, limit:any): any {
  //   return firstValueFrom(this.http.post<any>(`${this.base_url}/index.php`, { method: 'getAllInscriptions', page: page, limit: limit }));
  // }
}
