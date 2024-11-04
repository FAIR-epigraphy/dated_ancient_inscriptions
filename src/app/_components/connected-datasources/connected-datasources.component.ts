import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-connected-datasources',
  templateUrl: './connected-datasources.component.html',
  styleUrls: ['./connected-datasources.component.css']
})
export class ConnectedDatasourcesComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) private graphContainer!: ElementRef;
  @Input() isDirected: boolean = false;

  datasetSizes = {
    'iSicily': 4720,
    'EDH': 81883,
    'EDR': 77539,
    'RIB': 13210,
    'PHI': 217863,
    'IGCYR-GVCYR': 973
  };

  colorMap: { [key: string]: string } = {
    'iSicily': '#1f77b4',   // Blue
    'EDH': '#ff7f0e',       // Orange
    'EDR': '#2ca02c',       // Green
    'RIB': '#d62728',       // Red
    'PHI': '#9467bd',       // Purple
    'IGCYR-GVCYR': '#8c564b' // Brown
  };

  colorScale = d3.scaleOrdinal(d3.schemeCategory10);  // Uses 10 different colors

  private links = [
    {
      "source": "iSicily",
      "target": "EDH"
    },
    {
      "source": "iSicily",
      "target": "EDR"
    },
    {
      "source": "iSicily",
      "target": "PHI"
    },
    {
      "source": "EDH",
      "target": "iSicily"
    },
    {
      "source": "EDH",
      "target": "EDR"
    },
    {
      "source": "EDH",
      "target": "RIB"
    },
    {
      "source": "EDH",
      "target": "PHI"
    },
    {
      "source": "EDR",
      "target": "iSicily"
    },
    {
      "source": "EDR",
      "target": "EDH"
    },
    {
      "source": "EDR",
      "target": "RIB"
    },
    {
      "source": "EDR",
      "target": "PHI"
    },
    {
      "source": "RIB",
      "target": "EDH"
    },
    {
      "source": "RIB",
      "target": "EDR"
    },
    {
      "source": "RIB",
      "target": "PHI"
    },
    {
      "source": "PHI",
      "target": "iSicily"
    },
    {
      "source": "PHI",
      "target": "EDH"
    },
    {
      "source": "PHI",
      "target": "EDR"
    },
    {
      "source": "PHI",
      "target": "RIB"
    },
    {
      "source": "PHI",
      "target": "IGCYR-GVCYR"
    },
    {
      "source": "IGCYR-GVCYR",
      "target": "PHI"
    }
  ]

  private nodes: any = Array.from(new Set(this.links.flatMap(l => [l.source, l.target]))).map(id => ({ id }));

  private svg: any;
  private width = 1000;
  private height = 600;
  private fontSize = '16px';
  private fontWeight = 'bold';

  ngOnInit(): void {
    if (this.isDirected === true) {
      this.createDirectedSVG();
      this.createDirectedGraph()
    }
    else {
      this.createSvg();
      this.createGraph();
    }
  }

  private createDirectedSVG(): void {
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Define arrow marker for directed edges
    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');
  }

  private createDirectedGraph(): void {
    // Scale to determine node radius based on dataset size
    const sizeScale = d3.scaleLinear()
      .domain([d3.min(Object.values(this.datasetSizes))!, d3.max(Object.values(this.datasetSizes))!]) // Input range: min to max dataset size
      .range([5, 50]); // Output range: smallest node radius to largest node radius

    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(250))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collide', d3.forceCollide().radius(50));

    const link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 4)
      .attr('marker-end', 'url(#arrowhead)');

    const node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('r', (d: any) => sizeScale(this.datasetSizes[d.id as keyof typeof this.datasetSizes])) // Set radius based on dataset size
      .attr('fill', (d: any) => this.colorMap[d.id])  // Use the color map for each node
      .call(d3.drag()
        .on('start', (event, d) => this.dragstarted(event, d, simulation))
        .on('drag', this.dragged)
        .on('end', (event, d) => this.dragended(event, d, simulation)));

    const text = this.svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(this.nodes)
      .enter().append('text')
      .text((d: any) => d.id)
      .attr('font-size', this.fontSize)
      .attr('font-weight', this.fontWeight)
      .attr('fill', '#333');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);  // Calculate distance between source and target
          const radius = sizeScale(this.datasetSizes[d.target.id as keyof typeof this.datasetSizes]);  // Target node's radius
          return d.target.x - (dx * radius) / distance;  // Adjust x2 based on target node's radius
        })
        .attr('y2', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);  // Calculate distance between source and target
          const radius = sizeScale(this.datasetSizes[d.target.id as keyof typeof this.datasetSizes]);  // Target node's radius
          return d.target.y - (dy * radius) / distance;  // Adjust y2 based on target node's radius
        });

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      text
        .attr('x', (d: any) => d.x + 12)
        .attr('y', (d: any) => d.y - 12);
    });
  }

  private createSvg(): void {
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private createGraph(): void {
    // Scale to determine node radius based on dataset size
    const sizeScale = d3.scaleLinear()
      .domain([d3.min(Object.values(this.datasetSizes))!, d3.max(Object.values(this.datasetSizes))!]) // Input range: min to max dataset size
      .range([5, 50]); // Output range: smallest node radius to largest node radius

    const simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    const link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 4);

    const node = this.svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('r', (d: any) => sizeScale(this.datasetSizes[d.id as keyof typeof this.datasetSizes])) // Set radius based on dataset size
      .attr('fill', (d: any) => this.colorScale(d.id))
      .call(d3.drag() // Enable dragging
        .on('start', (event, d) => this.dragstarted(event, d, simulation))
        .on('drag', this.dragged)
        .on('end', (event, d) => this.dragended(event, d, simulation)));

    const text = this.svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(this.nodes)
      .enter().append('text')
      .text((d: any) => d.id)
      .attr('font-size', this.fontSize)
      .attr('font-weight', this.fontWeight)
      .attr('fill', '#333');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      text
        .attr('x', (d: any) => d.x + 6)
        .attr('y', (d: any) => d.y - 6);
    });
  }

  /// Dragable 
  private dragstarted(event: any, d: any, simulation: any): void {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: any, d: any): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragended(event: any, d: any, simulation: any): void {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
