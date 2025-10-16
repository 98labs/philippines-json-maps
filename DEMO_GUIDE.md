# Philippines Cartogram Demo Guide

Complete guide for managing data in the demos and converting them into reusable web components.

## Table of Contents

1. [Managing Demo Data](#managing-demo-data)
2. [Converting to Web Components](#converting-to-web-components)
3. [Using Web Components in Applications](#using-web-components-in-applications)
4. [Advanced Customization](#advanced-customization)

---

## Managing Demo Data

### 1. Understanding the Data Structure

All demos use GeoJSON format with the following property structure:

```javascript
// Level 1 (Country - Regions)
{
  "ADM1_EN": "Region I (Ilocos Region)",
  "ADM1_PCODE": "PH01",
  "AREA_SQKM": 12840.18
}

// Level 2 (Regions - Provinces)
{
  "ADM2_EN": "Ilocos Norte",
  "ADM2_PCODE": "PH01028",
  "AREA_SQKM": 3467.89
}

// Level 3 (Provinces - Municipalities)
{
  "ADM3_EN": "Laoag City",
  "ADM3_PCODE": "ph0102812",
  "AREA_SQKM": 116.08
}

// Level 4 (Municipalities - Barangays)
{
  "ADM4_EN": "Barangay 1",
  "ADM4_PCODE": "ph010281201",
  "AREA_SQKM": 0.45
}
```

### 2. Replacing Random Data with Real Data

Currently, all demos generate random values:

```javascript
data.features.forEach(feature => {
    feature.properties.randomValue = Math.floor(Math.random() * 100);
});
```

#### Option A: Using a Data Object Mapping

Replace the random generation with your actual data mapped by PSGC code:

```javascript
// Your data indexed by PSGC code
const myData = {
    'PH01': 85.5,      // Region I
    'PH02': 72.3,      // Region II
    'PH03': 91.2,      // Region III
    // ... more data
};

// Apply your data
data.features.forEach(feature => {
    const code = feature.properties.ADM1_PCODE; // or ADM2_PCODE, ADM3_PCODE, etc.
    feature.properties.dataValue = myData[code] || 0;
});
```

#### Option B: Using API Data

Fetch data from an API and match it to features:

```javascript
// Fetch data from API
fetch('https://api.example.com/data')
    .then(response => response.json())
    .then(apiData => {
        // Create lookup object
        const dataLookup = {};
        apiData.forEach(item => {
            dataLookup[item.region_code] = item.value;
        });

        // Apply to features
        data.features.forEach(feature => {
            const code = feature.properties.ADM1_PCODE;
            feature.properties.dataValue = dataLookup[code] || 0;
        });

        // Render the map
        renderMap(data);
    });
```

#### Option C: Using CSV Data

Load data from a CSV file:

```javascript
// Using PapaParse library (include in HTML: <script src="https://unpkg.com/papaparse@5"></script>)
Papa.parse('data/region_data.csv', {
    download: true,
    header: true,
    complete: function(results) {
        const dataLookup = {};
        results.data.forEach(row => {
            dataLookup[row.code] = parseFloat(row.value);
        });

        data.features.forEach(feature => {
            const code = feature.properties.ADM1_PCODE;
            feature.properties.dataValue = dataLookup[code] || 0;
        });

        renderMap(data);
    }
});
```

### 3. Updating Color Schemes

Modify the `getColor()` function to match your data range:

```javascript
// Example: For percentage data (0-100)
function getColor(d) {
    return d > 80 ? '#006837' :
           d > 60 ? '#31A354' :
           d > 40 ? '#78C679' :
           d > 20 ? '#ADDD8E' :
                    '#D9F0A3';
}

// Example: For population density
function getColor(d) {
    return d > 10000 ? '#800026' :
           d > 5000  ? '#BD0026' :
           d > 1000  ? '#E31A1C' :
           d > 500   ? '#FC4E2A' :
           d > 100   ? '#FD8D3C' :
                       '#FFEDA0';
}
```

### 4. Data Sources and File Paths

**Current data files:**
- Level 1: `2023/geojson/country/lowres/country.0.001.json` (17 regions)
- Level 2: `2023/provdists-all.0.001.json` (88 provinces)
- Level 3: `2023/municities-all.0.001.json` (1,642 municipalities)
- Level 4: `2023/geojson/municities/lowres/bgysubmuns-municity-{code}.0.001.json` (barangays per municipality)

**To use different resolution levels:**
- High-res (10%): Change `lowres` to `hires` and `0.001` to `0.1`
- Medium-res (1%): Change `lowres` to `medres` and `0.001` to `0.01`

---

## Converting to Web Components

### 1. Basic Web Component Structure

Create a reusable `philippines-map` web component:

**File: `public/components/philippines-map.js`**

```javascript
class PhilippinesMap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['level', 'data-source', 'color-scheme', 'height'];
    }

    connectedCallback() {
        this.render();
        this.loadMap();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.shadowRoot.querySelector('#map')) {
            this.loadMap();
        }
    }

    render() {
        const height = this.getAttribute('height') || '600px';

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                #map {
                    width: 100%;
                    height: ${height};
                }
                .info {
                    padding: 6px 8px;
                    font: 14px/16px Arial, Helvetica, sans-serif;
                    background: white;
                    background: rgba(255,255,255,0.9);
                    box-shadow: 0 0 15px rgba(0,0,0,0.2);
                    border-radius: 5px;
                }
                .info h4 {
                    margin: 0 0 5px;
                    color: #777;
                }
                .legend {
                    line-height: 18px;
                    color: #555;
                    background: white;
                    background: rgba(255,255,255,0.9);
                    box-shadow: 0 0 15px rgba(0,0,0,0.2);
                    border-radius: 5px;
                    padding: 6px 8px;
                }
                .legend i {
                    width: 18px;
                    height: 18px;
                    float: left;
                    margin-right: 8px;
                    opacity: 0.7;
                }
            </style>
            <div id="map"></div>
        `;
    }

    getColorScheme() {
        const scheme = this.getAttribute('color-scheme') || 'green';

        const schemes = {
            green: (d) => {
                return d > 80 ? '#006837' :
                       d > 70 ? '#31A354' :
                       d > 60 ? '#78C679' :
                       d > 50 ? '#ADDD8E' :
                       d > 40 ? '#D9F0A3' :
                       d > 30 ? '#F7FCB9' :
                       d > 20 ? '#FFFFE5' :
                                '#FFFFCC';
            },
            red: (d) => {
                return d > 80 ? '#800026' :
                       d > 70 ? '#BD0026' :
                       d > 60 ? '#E31A1C' :
                       d > 50 ? '#FC4E2A' :
                       d > 40 ? '#FD8D3C' :
                       d > 30 ? '#FEB24C' :
                       d > 20 ? '#FED976' :
                                '#FFEDA0';
            },
            purple: (d) => {
                return d > 80 ? '#4A148C' :
                       d > 70 ? '#6A1B9A' :
                       d > 60 ? '#8E24AA' :
                       d > 50 ? '#AB47BC' :
                       d > 40 ? '#BA68C8' :
                       d > 30 ? '#CE93D8' :
                       d > 20 ? '#E1BEE7' :
                                '#F3E5F5';
            },
            blue: (d) => {
                return d > 80 ? '#00429d' :
                       d > 70 ? '#2e59a8' :
                       d > 60 ? '#4771b2' :
                       d > 50 ? '#5d8abd' :
                       d > 40 ? '#73a2c6' :
                       d > 30 ? '#8abccf' :
                       d > 20 ? '#a5d5d8' :
                                '#c1e7e3';
            }
        };

        return schemes[scheme] || schemes.green;
    }

    async loadMap() {
        // Wait for Leaflet to be available
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => this.initializeMap();
            document.head.appendChild(script);
        } else {
            this.initializeMap();
        }
    }

    async initializeMap() {
        const mapElement = this.shadowRoot.getElementById('map');

        // Clear existing map if any
        if (this.map) {
            this.map.remove();
        }

        // Initialize map
        this.map = L.map(mapElement).setView([12.8797, 121.7740], 6);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Load data
        const dataSource = this.getAttribute('data-source') || this.getDefaultDataSource();
        const response = await fetch(dataSource);
        const data = await response.json();

        // Get data from attribute or use random
        const dataAttr = this.getAttribute('data');
        let dataMapping = {};

        if (dataAttr) {
            try {
                dataMapping = JSON.parse(dataAttr);
            } catch (e) {
                console.error('Invalid data attribute:', e);
            }
        }

        // Apply data to features
        data.features.forEach(feature => {
            const code = this.getFeatureCode(feature);
            feature.properties.dataValue = dataMapping[code] !== undefined
                ? dataMapping[code]
                : Math.floor(Math.random() * 100);
        });

        // Render features
        const getColor = this.getColorScheme();

        this.geojsonLayer = L.geoJson(data, {
            style: (feature) => ({
                fillColor: getColor(feature.properties.dataValue),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            }),
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => this.highlightFeature(e),
                    mouseout: (e) => this.resetHighlight(e),
                    click: (e) => {
                        this.map.fitBounds(e.target.getBounds());
                        this.dispatchEvent(new CustomEvent('region-click', {
                            detail: { feature: feature.properties }
                        }));
                    }
                });
            }
        }).addTo(this.map);

        this.map.fitBounds(this.geojsonLayer.getBounds());

        // Add info control
        this.addInfoControl();

        // Add legend
        this.addLegend();
    }

    getDefaultDataSource() {
        const level = this.getAttribute('level') || '1';
        const sources = {
            '1': '../2023/geojson/country/lowres/country.0.001.json',
            '2': '../2023/provdists-all.0.001.json',
            '3': '../2023/municities-all.0.001.json'
        };
        return sources[level] || sources['1'];
    }

    getFeatureCode(feature) {
        const level = this.getAttribute('level') || '1';
        const codeFields = {
            '1': 'ADM1_PCODE',
            '2': 'ADM2_PCODE',
            '3': 'ADM3_PCODE',
            '4': 'ADM4_PCODE'
        };
        return feature.properties[codeFields[level]];
    }

    getFeatureName(feature) {
        const level = this.getAttribute('level') || '1';
        const nameFields = {
            '1': 'ADM1_EN',
            '2': 'ADM2_EN',
            '3': 'ADM3_EN',
            '4': 'ADM4_EN'
        };
        return feature.properties[nameFields[level]];
    }

    highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });
        layer.bringToFront();

        if (this.infoControl) {
            this.infoControl.update(layer.feature.properties);
        }
    }

    resetHighlight(e) {
        if (this.geojsonLayer) {
            this.geojsonLayer.resetStyle(e.target);
        }
        if (this.infoControl) {
            this.infoControl.update();
        }
    }

    addInfoControl() {
        const InfoControl = L.Control.extend({
            onAdd: (map) => {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            }
        });

        this.infoControl = new InfoControl({ position: 'topright' });

        this.infoControl.update = (props) => {
            const title = this.getAttribute('title') || 'Philippines Map';
            const valueName = this.getAttribute('value-name') || 'Value';

            this.infoControl._div.innerHTML = `<h4>${title}</h4>` +
                (props ?
                    `<b>${this.getFeatureName({ properties: props })}</b><br />` +
                    `${valueName}: ${props.dataValue !== undefined ? props.dataValue.toFixed(2) : 'N/A'}<br />` +
                    `Area: ${props.AREA_SQKM ? props.AREA_SQKM.toFixed(2) : 'N/A'} km²`
                    : 'Hover over a region');
        };

        this.infoControl.addTo(this.map);
    }

    addLegend() {
        const Legend = L.Control.extend({
            onAdd: (map) => {
                const div = L.DomUtil.create('div', 'legend');
                const grades = [0, 20, 30, 40, 50, 60, 70, 80];
                const getColor = this.getColorScheme();
                const valueName = this.getAttribute('value-name') || 'Value';

                div.innerHTML = `<h4>${valueName}</h4>`;

                for (let i = 0; i < grades.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                }

                return div;
            }
        });

        const legend = new Legend({ position: 'bottomright' });
        legend.addTo(this.map);
    }

    // Public method to update data
    setData(dataMapping) {
        if (!this.geojsonLayer) return;

        this.geojsonLayer.eachLayer((layer) => {
            const code = this.getFeatureCode(layer.feature);
            if (dataMapping[code] !== undefined) {
                layer.feature.properties.dataValue = dataMapping[code];
                const getColor = this.getColorScheme();
                layer.setStyle({
                    fillColor: getColor(dataMapping[code])
                });
            }
        });
    }
}

// Register the custom element
customElements.define('philippines-map', PhilippinesMap);
```

### 2. Simpler Component Version (Minimal)

For a lighter-weight component:

**File: `components/ph-map-simple.js`**

```javascript
class PHMapSimple extends HTMLElement {
    connectedCallback() {
        const level = this.getAttribute('level') || '1';
        const height = this.getAttribute('height') || '600px';

        this.innerHTML = `
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <div id="map-${this.id || 'default'}" style="width: 100%; height: ${height};"></div>
        `;

        // Load Leaflet and initialize
        if (typeof L === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => this.init();
            document.head.appendChild(script);
        } else {
            this.init();
        }
    }

    async init() {
        const mapId = `map-${this.id || 'default'}`;
        const map = L.map(mapId).setView([12.8797, 121.7740], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const dataSource = this.getAttribute('data-source');
        if (dataSource) {
            const response = await fetch(dataSource);
            const data = await response.json();
            L.geoJson(data).addTo(map);
        }
    }
}

customElements.define('ph-map-simple', PHMapSimple);
```

---

## Using Web Components in Applications

### 1. Basic HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Application</title>
</head>
<body>
    <!-- Include the component -->
    <script src="public/components/philippines-map.js"></script>

    <!-- Use the component -->
    <philippines-map
        level="1"
        title="Philippine Regions"
        value-name="Population (millions)"
        color-scheme="blue"
        height="800px">
    </philippines-map>
</body>
</html>
```

### 2. With Custom Data

```html
<philippines-map
    level="2"
    title="Provincial GDP"
    value-name="GDP (billion PHP)"
    color-scheme="green"
    height="600px"
    data='{"PH01028": 85.5, "PH01029": 72.3, "PH01033": 91.2}'>
</philippines-map>
```

### 3. Dynamic Data Updates (JavaScript)

```html
<philippines-map id="myMap" level="1"></philippines-map>

<script>
    const mapComponent = document.getElementById('myMap');

    // Fetch data from API
    fetch('https://api.example.com/population-data')
        .then(response => response.json())
        .then(data => {
            // Update map data
            mapComponent.setData(data);
        });

    // Listen to click events
    mapComponent.addEventListener('region-click', (event) => {
        console.log('Clicked region:', event.detail.feature);
        alert(`You clicked: ${event.detail.feature.ADM1_EN}`);
    });
</script>
```

### 4. React Integration

```jsx
import { useEffect, useRef, useState } from 'react';

function PhilippinesMapWrapper({ level, data, onRegionClick }) {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        // Load the web component script
        const script = document.createElement('script');
        script.src = '/components/philippines-map.js';
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (mapLoaded && mapRef.current && data) {
            mapRef.current.setData(data);
        }
    }, [data, mapLoaded]);

    useEffect(() => {
        const handleClick = (event) => {
            if (onRegionClick) {
                onRegionClick(event.detail.feature);
            }
        };

        const mapElement = mapRef.current;
        if (mapElement) {
            mapElement.addEventListener('region-click', handleClick);
            return () => {
                mapElement.removeEventListener('region-click', handleClick);
            };
        }
    }, [onRegionClick]);

    return (
        <philippines-map
            ref={mapRef}
            level={level}
            title="Philippine Regions"
            color-scheme="blue"
            height="600px"
        />
    );
}

// Usage
function App() {
    const [data, setData] = useState({});

    useEffect(() => {
        fetch('/api/region-data')
            .then(res => res.json())
            .then(setData);
    }, []);

    const handleRegionClick = (feature) => {
        console.log('Clicked:', feature);
    };

    return (
        <div>
            <h1>My Application</h1>
            <PhilippinesMapWrapper
                level="1"
                data={data}
                onRegionClick={handleRegionClick}
            />
        </div>
    );
}
```

### 5. Vue Integration

```vue
<template>
    <philippines-map
        ref="map"
        :level="level"
        :title="title"
        :color-scheme="colorScheme"
        height="600px"
        @region-click="handleRegionClick"
    />
</template>

<script>
export default {
    name: 'PhilippinesMapWrapper',
    props: {
        level: {
            type: String,
            default: '1'
        },
        title: {
            type: String,
            default: 'Philippines Map'
        },
        colorScheme: {
            type: String,
            default: 'blue'
        }
    },
    data() {
        return {
            mapData: {}
        };
    },
    mounted() {
        // Load web component
        const script = document.createElement('script');
        script.src = '/components/philippines-map.js';
        document.head.appendChild(script);

        // Load data
        this.loadMapData();
    },
    methods: {
        async loadMapData() {
            const response = await fetch('/api/region-data');
            this.mapData = await response.json();
            this.$refs.map.setData(this.mapData);
        },
        handleRegionClick(event) {
            console.log('Region clicked:', event.detail.feature);
            this.$emit('region-selected', event.detail.feature);
        }
    }
};
</script>
```

### 6. Angular Integration

```typescript
// philippines-map.component.ts
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-philippines-map',
    template: `
        <philippines-map
            #mapElement
            [attr.level]="level"
            [attr.title]="title"
            [attr.color-scheme]="colorScheme"
            height="600px">
        </philippines-map>
    `
})
export class PhilippinesMapComponent implements OnInit {
    @ViewChild('mapElement') mapElement!: ElementRef;
    @Input() level: string = '1';
    @Input() title: string = 'Philippines Map';
    @Input() colorScheme: string = 'blue';
    @Input() data: any = {};
    @Output() regionClick = new EventEmitter<any>();

    ngOnInit() {
        // Load web component script
        const script = document.createElement('script');
        script.src = '/assets/components/philippines-map.js';
        document.head.appendChild(script);
    }

    ngAfterViewInit() {
        // Set data when component is ready
        setTimeout(() => {
            if (this.mapElement && this.data) {
                (this.mapElement.nativeElement as any).setData(this.data);
            }
        }, 1000);

        // Listen to events
        this.mapElement.nativeElement.addEventListener('region-click', (event: any) => {
            this.regionClick.emit(event.detail.feature);
        });
    }

    ngOnChanges(changes: any) {
        if (changes.data && this.mapElement) {
            (this.mapElement.nativeElement as any).setData(this.data);
        }
    }
}
```

---

## Advanced Customization

### 1. Multiple Data Layers

Display multiple datasets on the same map:

```javascript
class MultiLayerMap extends PhilippinesMap {
    setLayers(layers) {
        // layers = [{ name, data, color }, ...]
        this.layers = layers;

        layers.forEach((layer, index) => {
            const layerGroup = L.geoJson(layer.data, {
                style: {
                    fillColor: layer.color,
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.5
                }
            });

            // Add to layer control
            this.layerControl.addOverlay(layerGroup, layer.name);
        });
    }
}
```

### 2. Using Labels and Tooltips

**Show tooltips on hover (default):**
```html
<philippines-map
    level="1"
    show-tooltips="true">
</philippines-map>
```

**Show permanent labels on all regions:**
```html
<philippines-map
    level="1"
    show-labels="true">
</philippines-map>
```

**Disable tooltips (only use info panel):**
```html
<philippines-map
    level="1"
    show-tooltips="false">
</philippines-map>
```

**Toggle labels dynamically:**
```javascript
const map = document.querySelector('philippines-map');

// Show labels
map.toggleLabels(true);

// Hide labels
map.toggleLabels(false);

// Enable tooltips
map.toggleTooltips(true);

// Disable tooltips
map.toggleTooltips(false);
```

### 3. Export Map as Image

```javascript
exportMap() {
    leafletImage(this.map, (err, canvas) => {
        const img = document.createElement('img');
        img.src = canvas.toDataURL();

        // Download
        const link = document.createElement('a');
        link.download = 'philippines-map.png';
        link.href = img.src;
        link.click();
    });
}
```

### 4. Filtering and Search

```javascript
filterRegions(searchTerm) {
    this.geojsonLayer.eachLayer(layer => {
        const name = this.getFeatureName(layer.feature);
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
            layer.setStyle({ opacity: 1, fillOpacity: 0.7 });
        } else {
            layer.setStyle({ opacity: 0.3, fillOpacity: 0.2 });
        }
    });
}
```

---

## Component API Reference

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `level` | string | `"1"` | Administrative level (1-4) |
| `data-source` | string | auto | Path to GeoJSON file |
| `data` | JSON string | `{}` | Data mapping object |
| `title` | string | `"Philippines Map"` | Map title |
| `value-name` | string | `"Value"` | Name of the data metric |
| `color-scheme` | string | `"green"` | Color scheme (green/red/purple/blue) |
| `height` | string | `"600px"` | Map height |
| `show-labels` | boolean | `false` | Show permanent labels on all regions |
| `show-tooltips` | boolean | `true` | Show tooltips on hover |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `setData(mapping)` | Object | Update map data |
| `toggleLabels(show)` | boolean | Show/hide permanent labels |
| `toggleTooltips(show)` | boolean | Enable/disable hover tooltips |
| `getMap()` | - | Returns Leaflet map instance |
| `fitBounds()` | - | Fit map to data bounds |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `region-click` | `{ feature }` | Fired when region is clicked |
| `data-loaded` | `{ features }` | Fired when GeoJSON is loaded |
| `map-ready` | `{ map }` | Fired when map initialization is complete |

---

## Best Practices

1. **Performance**: Use lowres files for large datasets (all provinces/municipalities)
2. **Data Updates**: Debounce frequent data updates to avoid performance issues
3. **Error Handling**: Always provide fallback values for missing data
4. **Accessibility**: Add ARIA labels and keyboard navigation
5. **Responsive Design**: Use percentage-based heights or container queries
6. **Data Validation**: Validate data mapping objects before applying to features

---

## Troubleshooting

**Map not displaying:**
- Ensure Leaflet CSS and JS are loaded
- Check browser console for errors
- Verify GeoJSON file paths are correct

**Data not updating:**
- Use browser DevTools to verify data structure
- Check that PSGC codes match between data and GeoJSON
- Call `setData()` after component is fully loaded

**Styling issues in Shadow DOM:**
- Leaflet CSS must be loaded inside Shadow DOM
- Use `::part()` for external styling if needed

---

## Examples

See the `public/demos/` folder for complete working examples:

**Static HTML Demos:**
- `country.html` - Level 1 (Regions)
- `regions.html` - Level 2 (All Provinces)
- `provdists.html` - Level 3 (All Municipalities)
- `municities.html` - Level 4 (Barangays with selector)

**Web Component Examples:**
- `component-example.html` - Interactive controls and event handling
- `component-labels-example.html` - Labels and tooltips demonstration

---

## License

MIT License - Same as main repository
