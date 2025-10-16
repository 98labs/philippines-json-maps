# Philippines Cartogram Demos

Interactive cartogram demonstrations of Philippine administrative boundaries using Leaflet.js and OpenStreetMap.

## Features

- **Interactive Maps**: Hover over regions to see random data values
- **Choropleth Visualization**: Color-coded maps based on data values
- **Resolution Selector**: Switch between low, medium, and high resolution on-the-fly
- **Zoom Controls**: Click on any region to zoom in
- **Responsive Design**: Works on desktop and mobile devices
- **Pure Frontend**: HTML/CSS/JavaScript only, no build tools required

## Demos

### 1. Country (Regions)
**File**: `country.html`
**Data**: All 17 regions of the Philippines
**Level**: Administrative Level 1
Shows the 17 regions of the Philippines with different colors based on random values.

### 2. Regions (Provinces/Districts)
**File**: `regions.html`
**Data**: ALL 88 provinces/districts displayed on one map
**Level**: Administrative Level 2
Displays all provinces and districts across the Philippines simultaneously. Hover over any province to see details, click to zoom.

### 3. Provinces (Municipalities/Cities)
**File**: `provdists.html`
**Data**: ALL 1,642 municipalities/cities displayed on one map
**Level**: Administrative Level 3
Shows all municipalities and cities across the Philippines simultaneously. Hover over any municipality to see details, click to zoom.

### 4. Municipalities (Barangays)
**File**: `municities.html`
**Data**: Barangays for ALL 1,642 municipalities (42,048 total)
**Level**: Administrative Level 4
**Interactive Selector**: Choose any municipality to view its barangays
**Resolution Selector**: Switch between low, medium, and high resolution
Displays barangay-level boundaries within any selected municipality.

## How to Use

### Local Development
1. Open any HTML file in a web browser
2. **Important**: Due to browser CORS restrictions, you need to serve the files via a local web server

### Using Python
```bash
# From the repository root
python3 -m http.server 8000
# Then open: http://localhost:8000/demos/
```

### Using Node.js (http-server)
```bash
# Install http-server globally (one time)
npm install -g http-server

# From the repository root
http-server -p 8000
# Then open: http://localhost:8000/demos/
```

### Using PHP
```bash
# From the repository root
php -S localhost:8000
# Then open: http://localhost:8000/demos/
```

## Resolution Selector

All demos (country.html, regions.html, provdists.html, municities.html) now include a **Resolution Selector** in the top-left corner:
- **Low (fast)**: 0.1% simplification - Smallest files, fastest loading (default)
- **Medium**: 1% simplification - Balanced quality and performance
- **High (detailed)**: 10% simplification - Highest quality, larger files

Switch resolutions on-the-fly without reloading the page!

## Data Source

All demos default to **low-resolution** GeoJSON files, but support all three resolution levels:
- `2023/geojson/country/{lowres,medres,hires}/country.{0.001,0.01,0.1}.json` - All 17 regions
- `2023/provdists-all.{0.001,0.01,0.1}.json` - All 88 provinces/districts combined
- `2023/municities-all.{0.001,0.01,0.1}.json` - All 1,642 municipalities/cities combined
- `2023/geojson/municities/{lowres,medres,hires}/bgysubmuns-municity-*.{0.001,0.01,0.1}.json` - Individual barangay files per municipality (all resolutions)

## Customization

### Change the Region/Province/Municipality
Edit the `fetch()` URL in the HTML file to use a different PSGC code:

```javascript
// Example: Change to a different region
fetch('../2023/geojson/regions/lowres/provdists-region-130000000.0.001.json')
```

### Change the Color Scheme
Modify the `getColor()` function in each HTML file:

```javascript
function getColor(d) {
    return d > 80 ? '#800026' :
           d > 70 ? '#BD0026' :
           d > 60 ? '#E31A1C' :
           // ... add your colors
}
```

### Use Real Data Instead of Random Values
Replace this code:
```javascript
data.features.forEach(feature => {
    feature.properties.randomValue = Math.floor(Math.random() * 100);
});
```

With your actual data:
```javascript
data.features.forEach(feature => {
    // Map your data to the feature based on PSGC code
    feature.properties.randomValue = yourDataMap[feature.id];
});
```

## Technologies Used

- [Leaflet.js](https://leafletjs.com/) - Interactive map library
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- GeoJSON - Geographic data format
- Vanilla JavaScript - No frameworks required

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- Fetch API
- CSS Grid

## Web Component

A reusable web component is available for easy integration into web applications:

**File**: `../components/philippines-map.js`
**Example**: `component-example.html`

### Quick Usage

```html
<script src="../components/philippines-map.js"></script>

<philippines-map
    level="1"
    title="Philippine Regions"
    value-name="Population"
    color-scheme="blue"
    resolution="low"
    height="600px">
</philippines-map>
```

**Resolution Options:**
- `resolution="low"` - Low resolution (0.1% simplification) - Default, fastest loading
- `resolution="medium"` - Medium resolution (1% simplification) - Balanced quality
- `resolution="high"` - High resolution (10% simplification) - Most detailed

### With Custom Data

```javascript
const map = document.querySelector('philippines-map');

// Load your data
map.setData({
    'PH01': 85.5,
    'PH02': 72.3,
    'PH03': 91.2
});

// Listen to events
map.addEventListener('region-click', (event) => {
    console.log('Clicked:', event.detail.feature);
});
```

For complete documentation on managing data and using the web component, see **[DEMO_GUIDE.md](../DEMO_GUIDE.md)** in the root directory.

## License

Same as the main repository (MIT License)
