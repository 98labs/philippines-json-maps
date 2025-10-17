/**
 * Philippines Map Web Component
 *
 * A reusable web component for displaying Philippine administrative boundaries
 * with customizable data visualization.
 *
 * Usage:
 *   <philippines-map level="1" color-scheme="blue" height="600px"></philippines-map>
 *
 * See DEMO_GUIDE.md for complete documentation
 */

class PhilippinesMap extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.map = null;
        this.geojsonLayer = null;
        this.infoControl = null;
        this.isLoading = false;
        this.isInitialized = false;
    }

    static get observedAttributes() {
        return ['level', 'data-source', 'color-scheme', 'height', 'data', 'show-labels', 'show-tooltips', 'resolution'];
    }

    connectedCallback() {
        this.render();
        this.loadMap();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.shadowRoot.querySelector('#map')) {
            if (name === 'data') {
                try {
                    const dataMapping = JSON.parse(newValue);
                    this.setData(dataMapping);
                } catch (e) {
                    console.error('Invalid data attribute:', e);
                }
            } else {
                this.loadMap();
            }
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
                    position: relative;
                }
                :host ::ng-deep .leaflet-control {
                    z-index: 1000;
                }
                .leaflet-top.leaflet-right {
                    top: 10px;
                    right: 10px;
                }
                .leaflet-bottom.leaflet-right {
                    bottom: 10px;
                    right: 10px;
                }
                .info {
                    padding: 10px 12px;
                    font: 14px/16px Arial, Helvetica, sans-serif;
                    background: white;
                    background: rgba(255,255,255,0.95);
                    box-shadow: 0 0 20px rgba(0,0,0,0.3);
                    border-radius: 8px;
                    border: 2px solid #666;
                    min-width: 200px;
                }
                .info h4 {
                    margin: 0 0 8px;
                    color: #333;
                    font-weight: bold;
                    font-size: 15px;
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
                .legend h4 {
                    margin: 0 0 5px;
                    color: #777;
                }
                .legend i {
                    width: 18px;
                    height: 18px;
                    float: left;
                    margin-right: 8px;
                    opacity: 0.7;
                }
                .leaflet-tooltip {
                    background-color: rgba(255, 255, 255, 0.95);
                    border: 2px solid #666;
                    border-radius: 4px;
                    padding: 8px 12px;
                    font-weight: bold;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }
                .leaflet-tooltip-top:before,
                .leaflet-tooltip-bottom:before,
                .leaflet-tooltip-left:before,
                .leaflet-tooltip-right:before {
                    border-top-color: #666;
                }
                .label-value {
                    color: #0066cc;
                    font-size: 0.9em;
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
        await this.ensureLeafletLoaded();
        this.initializeMap();
    }

    async ensureLeafletLoaded() {
        // If Leaflet is already loaded, return immediately
        if (typeof L !== 'undefined') {
            return Promise.resolve();
        }

        // Check if Leaflet is currently being loaded
        if (!window.__leafletLoadingPromise) {
            window.__leafletLoadingPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Failed to load Leaflet'));
                document.head.appendChild(script);
            });
        }

        return window.__leafletLoadingPromise;
    }

    async initializeMap() {
        // Prevent multiple simultaneous initializations
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;

        const mapElement = this.shadowRoot.getElementById('map');

        // Ensure map element exists
        if (!mapElement) {
            console.error('Map element not found');
            this.isLoading = false;
            return;
        }

        // Clear existing map if any
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.geojsonLayer = null;
            this.infoControl = null;
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

        try {
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
                    // Add tooltip if enabled
                    const showTooltips = this.getAttribute('show-tooltips') !== 'false';
                    const showLabels = this.getAttribute('show-labels') === 'true';

                    if (showTooltips || showLabels) {
                        const name = this.getFeatureName(feature.properties);
                        const value = feature.properties.dataValue;
                        const valueName = this.getAttribute('value-name') || 'Value';

                        const tooltipContent = `
                            <div style="text-align: center;">
                                <strong>${name}</strong><br/>
                                <span class="label-value">${valueName}: ${value !== undefined ? value.toFixed(2) : 'N/A'}</span>
                            </div>
                        `;

                        layer.bindTooltip(tooltipContent, {
                            permanent: showLabels,
                            direction: 'center',
                            className: 'region-label',
                            opacity: showLabels ? 0.9 : 1
                        });
                    }

                    layer.on({
                        mouseover: (e) => this.highlightFeature(e),
                        mouseout: (e) => this.resetHighlight(e),
                        click: (e) => {
                            this.map.fitBounds(e.target.getBounds());
                            this.dispatchEvent(new CustomEvent('region-click', {
                                detail: { feature: feature.properties },
                                bubbles: true,
                                composed: true
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

            // Dispatch loaded event
            this.dispatchEvent(new CustomEvent('map-ready', {
                detail: { map: this.map, features: data.features },
                bubbles: true,
                composed: true
            }));

            // Mark as initialized
            this.isInitialized = true;
            this.isLoading = false;

        } catch (error) {
            console.error('Error loading map data:', error);
            this.isLoading = false;
            this.dispatchEvent(new CustomEvent('map-error', {
                detail: { error },
                bubbles: true,
                composed: true
            }));
        }
    }

    getDefaultDataSource() {
        const level = this.getAttribute('level') || '1';
        const resolution = this.getAttribute('resolution') || 'low';

        // Map resolution attribute values to folder/suffix
        const resolutionMap = {
            'low': { folder: 'lowres', suffix: '0.001' },
            'medium': { folder: 'medres', suffix: '0.01' },
            'high': { folder: 'hires', suffix: '0.1' }
        };

        const res = resolutionMap[resolution] || resolutionMap['low'];

        const sources = {
            '1': `../../2023/geojson/country/${res.folder}/country.${res.suffix}.json`,
            '2': `../../2023/provdists-all.${res.suffix}.json`,
            '3': `../../2023/municities-all.${res.suffix}.json`
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

    getFeatureName(props) {
        const level = this.getAttribute('level') || '1';
        const nameFields = {
            '1': 'ADM1_EN',
            '2': 'ADM2_EN',
            '3': 'ADM3_EN',
            '4': 'ADM4_EN'
        };
        return props[nameFields[level]];
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
            onAdd: function(map) {
                this._div = L.DomUtil.create('div', 'info');
                this._div.style.display = 'block';
                this._div.style.visibility = 'visible';
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
                    `<b>${this.getFeatureName(props)}</b><br />` +
                    `${valueName}: <strong>${props.dataValue !== undefined ? props.dataValue.toFixed(2) : 'N/A'}</strong><br />` +
                    `Area: ${props.AREA_SQKM ? props.AREA_SQKM.toFixed(2) : 'N/A'} km²`
                    : '<i>Hover over a region</i>');
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

    /**
     * Public API: Update map data
     * @param {Object} dataMapping - Object mapping PSGC codes to values
     */
    setData(dataMapping) {
        if (!this.geojsonLayer) return;

        const getColor = this.getColorScheme();
        const valueName = this.getAttribute('value-name') || 'Value';
        const showTooltips = this.getAttribute('show-tooltips') !== 'false';
        const showLabels = this.getAttribute('show-labels') === 'true';

        this.geojsonLayer.eachLayer((layer) => {
            const code = this.getFeatureCode(layer.feature);
            if (dataMapping[code] !== undefined) {
                layer.feature.properties.dataValue = dataMapping[code];
                layer.setStyle({
                    fillColor: getColor(dataMapping[code])
                });

                // Update tooltip content
                if (showTooltips || showLabels) {
                    const name = this.getFeatureName(layer.feature.properties);
                    const value = dataMapping[code];

                    const tooltipContent = `
                        <div style="text-align: center;">
                            <strong>${name}</strong><br/>
                            <span class="label-value">${valueName}: ${value !== undefined ? value.toFixed(2) : 'N/A'}</span>
                        </div>
                    `;

                    layer.setTooltipContent(tooltipContent);
                }
            }
        });

        this.dispatchEvent(new CustomEvent('data-updated', {
            detail: { data: dataMapping },
            bubbles: true,
            composed: true
        }));
    }

    /**
     * Public API: Toggle label visibility
     * @param {boolean} show - Whether to show labels
     */
    toggleLabels(show) {
        this.setAttribute('show-labels', show ? 'true' : 'false');

        if (!this.geojsonLayer) return;

        this.geojsonLayer.eachLayer((layer) => {
            const tooltip = layer.getTooltip();
            if (tooltip) {
                tooltip.options.permanent = show;
                if (show) {
                    layer.openTooltip();
                } else {
                    layer.closeTooltip();
                }
            }
        });
    }

    /**
     * Public API: Toggle tooltip visibility on hover
     * @param {boolean} show - Whether to show tooltips
     */
    toggleTooltips(show) {
        this.setAttribute('show-tooltips', show ? 'true' : 'false');

        if (!this.geojsonLayer) return;

        this.geojsonLayer.eachLayer((layer) => {
            if (show) {
                if (!layer.getTooltip()) {
                    const name = this.getFeatureName(layer.feature.properties);
                    const value = layer.feature.properties.dataValue;
                    const valueName = this.getAttribute('value-name') || 'Value';

                    const tooltipContent = `
                        <div style="text-align: center;">
                            <strong>${name}</strong><br/>
                            <span class="label-value">${valueName}: ${value !== undefined ? value.toFixed(2) : 'N/A'}</span>
                        </div>
                    `;

                    layer.bindTooltip(tooltipContent, {
                        permanent: false,
                        direction: 'center',
                        className: 'region-label'
                    });
                }
            } else {
                layer.unbindTooltip();
            }
        });
    }

    /**
     * Public API: Get Leaflet map instance
     * @returns {L.Map}
     */
    getMap() {
        return this.map;
    }

    /**
     * Public API: Fit map to bounds
     */
    fitBounds() {
        if (this.geojsonLayer && this.map) {
            this.map.fitBounds(this.geojsonLayer.getBounds());
        }
    }
}

// Register the custom element
customElements.define('philippines-map', PhilippinesMap);
