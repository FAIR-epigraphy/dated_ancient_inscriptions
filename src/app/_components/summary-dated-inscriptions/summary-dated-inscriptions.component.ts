import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../_services/api.service';
import * as L from 'leaflet';
import 'leaflet.heat';
import * as d3 from 'd3';
//declare let d3: any;

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

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
  lineChartData: any = undefined;

  datasetColors: { [key: string]: string } = {
    'iSicily': '#1f77b4',   // Blue
    'EDH': '#ff7f0e',       // Orange
    'EDR': '#2ca02c',       // Green
    'RIB': '#d62728',       // Red
    'PHI': '#9467bd',       // Purple
    'IGCYR-GVCYR': '#8c564b' // Brown
  };

  heatData: any[] = [];
  private map!: L.Map;
  private heatLayer!: L.Layer;  // Store reference to heatLayer

  dsHeatData: any[] = [];
  private mapDSHeat!: L.Map;
  private dsHeatLayer!: L.Layer;  // Store reference to heatLayer
  private dsHeatLayers: any = []
  private legendControl: L.Control | null = null; // Store the legend reference
  private isDSMapLoaded = false;

  langHeatData: any[] = [];
  private maplangHeat!: L.Map;
  private langHeatLayer!: L.Layer;  // Store reference to heatLayer
  private langHeatLayers: any = []
  private isLangMapLoaded = false;

  evidenceCloudData: any = undefined;

  @Input() sharedFilterData: any;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.initMap();
    await this.getCompleteInscriptions();
    //this.applyZoom();
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

    //////////////////////////////////////////////////
    // Initial DS heatmap
    this.mapDSHeat = L.map('mapDSHeat', {
      center: [41.9028, 12.4964], // Centered on Italy
      zoom: 4
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.mapDSHeat);

    //////////////////////////////////////////////////
    // Initial DS heatmap
    this.maplangHeat = L.map('maplangHeat', {
      center: [41.9028, 12.4964], // Centered on Italy
      zoom: 4
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.maplangHeat);
  }

  async getCompleteInscriptions() {
    this.count = await this.apiService.getSummaryTotalCount(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.totalDatasources = await this.apiService.getSummaryTotalDatasources(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.totalEvidences = await this.apiService.getSummaryTotalEvidences(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.geoLocations = await this.apiService.getSummaryTotalGeoLocations(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);
    this.totalSourcesEvidences = await this.apiService.getSummaryTotalSourcesEvidence(this.sharedFilterData.dateRange === '' ? '' : this.sharedFilterData);

    this.evidenceCloudData = this.totalEvidences.map(function (d: any) {
      let newValue = Math.log(d.count + 1)
      newValue = newValue === undefined ? 1 : newValue;
      return { text: d.evidence === null ? 'NULL' : d.evidence, value: d.evidence === null ? newValue * 3 : newValue * 2 };
    })

    if (this.sharedFilterData.dateRange !== '') {
      await this.renderChartData()
    }
  }

  async renderChartData() {
    let inscriptions: any = []
    for (let page = 1; inscriptions.length < parseInt(this.count.toString()); page++) {
      let response = await this.apiService.getAllInscriptions(this.sharedFilterData, page, 10000);
      inscriptions = [...inscriptions, ...response.data];//.filter((x: any) => x.isSold === '0');
    }

    this.lineChartData = inscriptions.map((d: any) => {
      return { dataset: d.source, start: d.notBefore, end: d.notAfter, evidence: d.evidence }
    })

  }

  applyZoom() {
    let div = document.getElementById('divCloud')
    const svg = d3.select(div).select('svg'); // Assuming the word cloud is rendered inside an <svg> element
    const zoom: any = d3.zoom()
      .scaleExtent([1, 10]) // Set zoom limits (min: 1, max: 10)
      .on('zoom', (event: any) => {
        svg.attr('transform', event.transform); // Apply zoom and pan transformations
      });

    svg.call(zoom); // Apply zoom behavior to the SVG element
  }

  downloadSummaryDataCSV(data: any, filename: any) {
    const csvData = this.convertToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(objArray: any[]) {
    // const headers = Object.keys(objArray[0]).join(',') + '\n';
    // const rows = objArray.map(obj => Object.values(obj).join(',')).join('\n');
    // return headers + rows;
    const headers = Object.keys(objArray[0]).join(',') + '\n';
    const rows = objArray.map(obj =>
      Object.values(obj)
        .map((value: any) => {
          // Check if the value contains commas or quotes
          value = value === null ? '' : value;
          let formattedValue = value.toString();
          if (formattedValue.includes('"')) {
            // Escape double quotes by doubling them
            formattedValue = formattedValue.replace(/"/g, '""');
          }
          if (formattedValue.includes(',') || formattedValue.includes('"')) {
            // Wrap in double quotes if it contains commas or quotes
            formattedValue = `"${formattedValue}"`;
          }
          return formattedValue;
        })
        .join(',')
    ).join('\n');
    return headers + rows;
  }

  showMap() {
    //console.log(this.map);
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

  showMapDSHeat() {
    //console.log(this.map);
    if (!this.isDSMapLoaded) {
      setTimeout(() => {
        this.mapDSHeat.invalidateSize();

        if (this.dsHeatLayer) {
          for (let layer of this.dsHeatLayers) {
            this.mapDSHeat.removeLayer(layer);  // Remove the existing heat layer
          }
          this.mapDSHeat.removeLayer(this.dsHeatLayer);
        }

        let groupSources = (<any>Object).groupBy(this.geoLocations, ({ source }: any) => source)
        Object.keys(groupSources).forEach((datasetName: string) => {

          this.dsHeatData = []

          groupSources[datasetName].forEach((loc: any) => {
            datasetName = datasetName.indexOf('RIB') > -1 ? 'RIB' : datasetName;

            if (loc.lat !== null && loc.lng !== null) {
              let lat = parseFloat(loc.lat);
              let lon = parseFloat(loc.lng);
              this.dsHeatData.push([lat, lon, loc.count]);
            }
          })

          this.dsHeatData = this.dsHeatData.filter(x => x.lat !== null && x.lng !== null);

          const color = this.datasetColors[datasetName] || 'gray'; // Default to gray if the color is undefined

          // Create heatmap layer for each dataset
          this.dsHeatLayer = L.heatLayer(this.dsHeatData, {
            radius: 25,
            blur: 15,
            gradient: { 0.4: color, 1: color }
          }).addTo(this.mapDSHeat);

          this.dsHeatLayers.push(this.dsHeatLayer);  // Store heat layer
        });

        // Create the legend and add it to the map
        this.createLegend(this.datasetColors, this.mapDSHeat, this.legendControl);
        this.isDSMapLoaded = true;
      }, 500);
    }
  }

  showMapLangHeat() {
    if (!this.isLangMapLoaded) {
      setTimeout(() => {
        this.maplangHeat.invalidateSize();

        if (this.langHeatLayer) {
          for (let layer of this.langHeatLayers) {
            this.maplangHeat.removeLayer(layer);  // Remove the existing heat layer
          }
          this.maplangHeat.removeLayer(this.langHeatLayer);
        }

        let groupLanguages = (<any>Object).groupBy(this.geoLocations, ({ language }: any) => language);

        const langNames = Object.keys(groupLanguages);
        let langColours: { [key: string]: string } = {};

        langNames.forEach((langName: any) => {
          if (langName !== "null")
            langColours[langName] = this.generateRandomColor();
        });

        Object.keys(groupLanguages).forEach((langName: string) => {

          this.langHeatData = []

          groupLanguages[langName].forEach((loc: any) => {
            if (loc.lat !== null && loc.lng !== null) {
              let lat = parseFloat(loc.lat);
              let lon = parseFloat(loc.lng);
              this.langHeatData.push([lat, lon, loc.count]);
            }
          })

          this.langHeatData = this.langHeatData.filter(x => x.lat !== null && x.lng !== null && x.language !== null);

          const color = langColours[langName] || 'gray'; // Default to gray if the color is undefined

          // Create heatmap layer for each dataset
          this.langHeatLayer = L.heatLayer(this.langHeatData, {
            radius: 25,
            blur: 15,
            gradient: { 0.4: color, 1: color }
          }).addTo(this.maplangHeat);

          this.langHeatLayers.push(this.langHeatLayer);  // Store heat layer
        });

        // Create the legend and add it to the map
        this.createLegend(langColours, this.maplangHeat, this.legendControl);
        this.isLangMapLoaded = true;
      }, 500);
    }
  }

  private createLegend(datasetColors: { [key: string]: string }, map: any, legendControl: any): void {
    // Extend the L.Control class to create a custom legend control
    const LegendControl = L.Control.extend({
      options: { position: 'bottomright' },

      onAdd: function () {
        const div = L.DomUtil.create('div', 'info legend');

        if (Object.keys(datasetColors).length > 6) {
          div.setAttribute('style', `background: white !important;
                    padding: 10px !important;
                    border-radius: 5px !important;
                    font-size: 14px !important;
                    height: 40vh;
                    overflow-y: scroll;
                    display: inline;`
          )
        }
        else {
          div.setAttribute('style', `background: white !important;
                    padding: 10px !important;
                    border-radius: 5px !important;
                    font-size: 14px !important;`
          )
        }


        const labels: any = [];

        // Generate HTML for the legend
        Object.keys(datasetColors).forEach(dataset => {
          const color = datasetColors[dataset];
          labels.push(
            `<i style="background:${color}; width: 18px; height: 18px; display:inline-block; margin-right: 8px;"></i>${dataset}`
          );
        });

        div.innerHTML = labels.join('<br>');
        return div;
      }
    });

    if (legendControl) {
      map.removeControl(legendControl)
    }
    // Add the legend control to the map
    // Create a new instance of the legend control and add it to the map
    legendControl = new LegendControl();
    legendControl.addTo(map);
  }

  private generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  showCharts() {
    let element = (document.getElementById('divLineChart') as HTMLElement);
    element.innerHTML = '';
    (document.getElementById('divCharts') as HTMLElement).innerHTML = ''

    document.getElementById('nav-sepds-tab')?.click();
    document.getElementById('nav-allds-tab')?.click();

    // Clean and filter data
    const cleanedData = this.lineChartData.filter((d: any) => {
      d.start = parseInt(d.start);
      d.end = parseInt(d.end);
      return !isNaN(d.start) && !isNaN(d.end) && d.start !== null && d.end !== null;
    });

    let interval = setInterval(() => {
      let rect: any = element.parentElement?.getBoundingClientRect()
      if (rect.width > 0) {
        let divWidth = rect.width - 200;
        let divHeight = 600; //rect.height;// - 200;
        // Initialize binned data with datasets
        const datasets: any = [...new Set(cleanedData.map((d: any) => d.dataset))];  // Extract unique datasets
        let steps = 2;
        if (this.sharedFilterData.endDuration - this.sharedFilterData.startDuration > 20) {
          steps = 5;
        }
        // Color scale for datasets
        const color: any = d3.scaleOrdinal()
          .domain(datasets)
          .range(d3.schemeCategory10);

        this.displayCharts(divWidth, divHeight, this.lineChartData, '#divLineChart', color, steps);

        ////////////////////////////////////////////
        // Separate Data sources
        let divClass = 'col-md-6';
        steps = 2;
        divHeight = 360;
        if (datasets.length > 4) {
          divClass = 'col-md-4'
          divWidth = rect.width / 3;
        }
        else {
          divWidth = rect.width / 2;
        }

        if (this.sharedFilterData.endDuration - this.sharedFilterData.startDuration > 20) {
          steps = 10
        }

        datasets.forEach((ds: any) => {
          let data = cleanedData.filter((x: any) => x.dataset === ds)
          let chartEle = document.getElementById('divCharts');
          let n = document.createElement('div')
          n.classList.add(divClass)
          n.id = `chart-${ds.replaceAll(' ', '-').replaceAll('.', '')}`
          chartEle?.append(n);
          this.displayCharts(divWidth, divHeight, data, `#${n.id}`, color, steps);
        })

        clearInterval(interval);
      }
    }, 500);
  }

  displayCharts(divWidth: any, divHeight: any, cleanedData: any, divId: any, color: any, steps: any) {

    // Define bins
    const binRanges: any = []; //[1, 5, 10, 20, 50, 100];

    for (let r = this.sharedFilterData.startDuration; r <= this.sharedFilterData.endDuration; r += steps) {
      binRanges.push(r);
    }

    // Initialize binned data with datasets
    const datasets: any = [...new Set(cleanedData.map((d: any) => d.dataset))];  // Extract unique datasets

    const binnedData: any = binRanges.map((range: any) => ({
      range,
      totalCount: 0,
      datasets: datasets.reduce((obj: any, dataset: any) => {
        obj[dataset] = { count: 0, evidenceEntries: [] };
        return obj;
      }, {})
    }));

    // Populate binned data
    cleanedData.forEach((d: any) => {
      const duration = Math.abs(d.end - d.start);
      const bin = binRanges.find((r: any) => duration <= r);
      if (bin) {
        const binIndex = binRanges.indexOf(bin);
        const datasetEntry = binnedData[binIndex].datasets[d.dataset];
        datasetEntry.count += 1;
        if (d.evidence) {
          datasetEntry.evidenceEntries.push(d.evidence);
        }
        binnedData[binIndex].totalCount += 1;
      }
    });
    //////////////////
    /// D3 Implementatin
    const maxTotalCount: any = d3.max(binnedData, (d: any) => typeof d.totalCount === 'number' ? d.totalCount : 0);

    // Set up chart dimensions
    const margin = { top: 30, right: 60, bottom: 50, left: 60 },
      width = divWidth - margin.left - margin.right,
      height = divHeight - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select(divId)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip div
    const tooltip = d3.select(divId)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("pointer-events", "none");

    // X-axis
    const x: any = d3.scaleBand()
      .domain(binnedData.map((d: any) => d.range + " years"))
      .range([0, width])
      .padding(0.2);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y-axis
    const y = d3.scaleLinear()
      .domain([0, maxTotalCount])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));


    // Line generator
    const line = d3.line()
      .x((d: any) => x(d.range + " years") + x.bandwidth() / 2)
      .y((d: any) => y(d.count))
    //.curve(d3.curveBasis);

    // Draw lines for each dataset
    datasets.forEach((dataset: any) => {
      const lineData = binnedData.map((d: any) => ({
        range: d.range,
        count: d.datasets[dataset].count
      }));

      // Draw the line
      svg.append("path")
        .datum(lineData)
        .attr("class", `line ${dataset.replaceAll(' ', '-').replaceAll('.', '')}`)  // Add a class for filtering
        .attr("fill", "none")
        .attr("stroke", color(dataset) as string)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Draw circles on the line for each data point
      svg.selectAll(`.dot-${dataset.replaceAll(' ', '-').replaceAll('.', '')}`)
        .data(lineData)
        .enter().append("circle")
        .attr("class", `dot dot-${dataset.replaceAll(' ', '-').replaceAll('.', '')}`)
        .attr("cx", (d: any) => x(d.range + " years") + x.bandwidth() / 2)
        .attr("cy", (d: any) => y(d.count))
        .attr("r", 4)
        .attr("fill", color(dataset) as string)
        .on("mouseover", (event, d: any) => {
          const bin = binnedData.find((b: any) => b.range === d.range);
          const evidenceList = bin.datasets[dataset].evidenceEntries.length ?
            bin.datasets[dataset].evidenceEntries.join(", ") : "No evidence";
          //alert(`Dataset: ${dataset}\nEvidence: ${evidenceList}`);
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(`Dataset: ${dataset}<br>Evidence: ${evidenceList}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      // // Position labels at the midpoint of the line
      // const midIndex = Math.floor(lineData.length / 2);
      // const midPoint = lineData[midIndex];

      // // Direct labels at the end of each line
      // svg.append("text")
      //   .attr("x", x(midPoint.range + " years") + x.bandwidth() / 2)
      //   .attr("y", y(midPoint.count) - 10) // Offset above the line
      //   .attr("dy", 5)
      //   .attr("dx", 10)
      //   .style("fill", color(dataset) as string)
      //   .text(dataset);

      // Draw lines for all datasets
      //datasets.forEach(drawDataset);

      // Create a legend
      const legend = svg.append("g")
        .attr("transform", `translate(${width + margin.right - 120}, 0)`);  // Adjust position

      datasets.forEach((dataset: any, i: any) => {
        // Create a legend item
        const legendItem = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`)  // Spacing between legend items

        // Legend colored box
        legendItem.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color(dataset) as string)
          .style("cursor", "pointer")
          .on("click", () => {
            const isActive: any = legendItem.classed("active");
            legendItem.classed("active", !isActive);
            svg.selectAll(`.line.${dataset}`).style("display", isActive ? "none" : "");
            svg.selectAll(`.dot.dot-${dataset}`).style("display", isActive ? "none" : "");
          });

        // Legend text
        legendItem.append("text")
          .attr("x", 25)
          .attr("y", 14)
          .text(dataset);
      });
    });
  }

  // closeChartModal(){
  //   document.getElementById('nav-allds-tab')?.classList.add('active')
  //   document.getElementById('nav-allds')?.classList.add('active')
  //   document.getElementById('nav-allds')?.classList.add('show')

  //   document.getElementById('nav-sepds-tab')?.classList.remove('active')
  //   document.getElementById('nav-allds')?.classList.remove('active')
  //   document.getElementById('nav-allds')?.classList.remove('show')
  // }

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
