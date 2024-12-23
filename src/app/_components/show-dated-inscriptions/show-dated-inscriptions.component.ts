import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../_services/api.service';

declare var $: any;  // Declare jQuery (to avoid type issues)

@Component({
  selector: 'app-show-dated-inscriptions',
  templateUrl: './show-dated-inscriptions.component.html',
  styleUrls: ['./show-dated-inscriptions.component.css']
})
export class ShowDatedInscriptionsComponent implements OnInit, OnChanges {

  page = 1;
  limit = 20;  // number of items to fetch per page
  total = 0;   // total number of items in the database
  throttle = 50;
  scrollDistance = 2;
  direction = "";
  loading = false;
  isRequestDone = false;
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
    endDuration: '',
    dataset: '',
    country: '',
    evidences: ''
  }

  selDataset = '';
  selModernCountry = ''
  selEvidence = ''
  totalDatasources: any = undefined;
  countries: any = undefined;
  totalEvidences: any = undefined;

  isFilterData = false;

  @Output() filterDataChange = new EventEmitter<any>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private router: Router,
    private apiService: ApiService,
  ) { }

  async ngOnInit() {
    //await getConnectedDatasources(); // This method for me to check the sources
    await this.getAllInscriptions();
    this.totalDatasources = await this.apiService.getSummaryTotalDatasources('');
    this.totalEvidences = await this.getAllEvidences();
    this.countries = await this.apiService.getAllModernCountries();
    this.isRequestDone = true;
    //console.log(this.countries)
    // Initialize the bootstrap-select
    $('.selectpicker').selectpicker();
    setTimeout(() => {
      $('.selectpicker').selectpicker('refresh');
    }, 500);
  }

  ngOnChanges(changes: any): void {
    // Refresh the select picker when options change
    setTimeout(() => {
      $('.selectpicker').selectpicker('refresh');
    }, 1000);
  }

  async getAllEvidences() {
    let evidences = await this.apiService.getSummaryTotalEvidences('');
    evidences = evidences.filter((e: any) => e.evidence !== null).map((x: any) => x.evidence)
    // Run the function on the input
    let actualEvidences = this.splitPhrases(evidences);
    return actualEvidences;
  }

  // Helper function to handle the splitting
  splitPhrases(input: any) {
    let result = new Set();
    let replaceMapping: any = {};

    // Regular expression to detect phrases with commas that need to be kept intact
    const commaPhraseRegex = /[^;,\s]+(?:,\s?[^;,\s]+)+/g;

    // Function to handle splitting based on the logic
    input.forEach((entry: any) => {
      // First, preserve phrases with commas
      const commaPhrases = [];
      let modifiedEntry = entry;

      // Extract comma-separated phrases and replace them temporarily with a placeholder
      modifiedEntry = modifiedEntry.replace(commaPhraseRegex, (match: any) => {
        const placeholder = `__COMMA__${match.trim().replace(',', '').replace(' ', '').trim()}__`;
        commaPhrases.push(match); // Store the original comma-separated phrase
        replaceMapping[placeholder] = match
        return placeholder; // Replace with a unique placeholder
      });

      // Now split the remaining entry by semicolon and space
      const parts = modifiedEntry.split(';').map((e: any) => e.trim());
      parts.forEach((part: any) => {
        // Split by spaces but preserve comma-phrases as they are
        let subParts = part.split(' ').map((e: any) => e.trim());
        //console.log(subParts)
        subParts.forEach((subPart: any) => {
          // If it's a placeholder, replace with the original comma-phrase
          result.add(subPart);
        });

        // Add the combination of the entire part if it has more than one word
        if (subParts.length > 1) {
          result.add(subParts.join(' '));
        }
      });

      if (parts.length > 1) {
        result.add(parts.join('; '));
      }
    });

    result = this.replaceWords(Array.from(result), replaceMapping)

    // Convert the set to an array and sort it
    return Array.from(result).sort();
  }

  replaceWords(mainStrings: any, replacements: any) {
    return mainStrings.map((str: any) => {
      // Split the string into words and replace each word if it exists in the mapping
      return str.split(' ').map((word: any) => {
        // Remove punctuation (optional, depending on your needs)
        const cleanWord = word.replace(";", "").trim();
        //  console.log(cleanWord)
        // Replace the word if it's in the replacement mapping
        return replacements[cleanWord] ? word.replace(cleanWord, replacements[cleanWord]) : word;
      }).join(' ');
    });
  }

  async getConnectedDatasources() {
    let resp = await this.apiService.getConnectedDatasources();
    console.log(resp);
    const links: { source: string, target: string }[] = [];

    resp.forEach((item: any) => {
      // Get the source (first key)
      const source = Object.keys(item)[0];

      // Loop through other keys to find targets (values > 1)
      Object.keys(item).forEach((key) => {
        if (key !== source && parseInt(item[key], 10) > 1) {
          links.push({ source, target: key });
        }
      });
    });

    console.log(links)
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
    try {
      this.isRequestDone = false;
      (document.getElementsByClassName('btn-close')[0] as HTMLElement)?.click();
      this.inscriptions = [];
      this.filterData.dateRange = ((document.getElementById('dateRange') as HTMLInputElement)?.value);
      this.filterData.duration = ((document.getElementById('duration') as HTMLInputElement)?.value);
      this.filterData.notBefore = parseInt(this.filterData.dateRange.split(',')[0])
      this.filterData.notAfter = parseInt(this.filterData.dateRange.split(',')[1])
      //console.log(this.filterData.duration)
      this.filterData.startDuration = parseInt(this.filterData.duration.split(',')[0])
      this.filterData.endDuration = parseInt(this.filterData.duration.split(',')[1])
      this.filterData.dataset = this.selDataset;
      this.filterData.country = this.selModernCountry;
      this.filterData.evidences = this.selEvidence;
      //console.log(this.filterData)
      this.page = 1;
      this.limit = 20;
      this.total = 0;
      let response = await this.apiService.getAllInscriptions(this.filterData, this.page, this.limit);
      this.filterData = { ...this.filterData };
      this.filterDataChange.emit(this.filterData);
      this.inscriptions = response.data;
      this.total = response.count;
      //console.log(this.total);
      this.isFilterData = true;
    } catch (error) {
      console.error(error);
    } finally {
      this.isRequestDone = true;
    }
  }

  refreshSlider() {

  }

  async downloadFile(ele: any, format: any) {
    (document.getElementsByClassName('dropdown-menu-end')[0] as HTMLElement).classList.remove('show');
    (document.getElementsByClassName('btnSpinner')[0] as HTMLElement).classList.toggle('disabled');
    Array.from(document.getElementsByClassName('spinnerLoader')).forEach(element => {
      element.classList.toggle('d-none')
    });
    try {
      let fData = this.isFilterData === false ? '' : this.filterData;
      if (format === 'json') {
        var resp = await this.apiService.downloadJSON(fData)
      }
      else {
        var resp = await this.apiService.downloadCSV(fData)
      }
      this.saveFile(resp);
    } catch (error) {
      console.log(error)
    } finally {
      (document.getElementsByClassName('btnSpinner')[0] as HTMLElement).classList.toggle('disabled');
      Array.from(document.getElementsByClassName('spinnerLoader')).forEach(element => {
        element.classList.toggle('d-none')
      });
    }
  }

  saveFile(filename: string) {
    const link = document.createElement('a');
    const url = `https://fair.classics.ox.ac.uk/dated_inscriptions_api/${filename}`;
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async onScrollDown(ev: any) {
    if (this.inscriptions.length >= this.total) return; // no more items to load
    await this.fetchInscriptions();

    const container = this.scrollContainer.nativeElement;
    this.showButton = container.scrollTop > 100;
  }
}
