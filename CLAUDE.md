# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains Philippine administrative boundary maps in GeoJSON and TopoJSON formats at multiple resolutions. Maps are organized by year (2011, 2019, 2023) and cover all four administrative levels of the Philippines using PSGC (Philippine Standard Geographic Code) data.

The project includes:
- **Vector map data** in GeoJSON and TopoJSON formats (3 resolutions per level)
- **Interactive demos** using Leaflet.js with resolution selectors
- **Reusable web component** (`<philippines-map>`) for easy integration
- **Build scripts** for regenerating maps from source shapefiles
- **Comprehensive documentation** for developers and users

## Administrative Hierarchy

The maps follow the Philippines' 4-level administrative structure:
- **Level 0**: Country (entire Philippines)
- **Level 1**: Regions (e.g., NCR, CAR, Region I-XIII, BARMM)
- **Level 2**: Provinces and Districts (provdists)
- **Level 3**: Municipalities and Cities (municities)
- **Level 4**: Barangays and Sub-municipalities (bgysubmuns)

## Data Organization

### Root Directory Structure
```
philippines-json-maps/
├── 2023/                    # Latest maps (2023 PSGC data)
├── 2019/                    # Legacy maps (2019 data)
├── 2011/                    # Legacy maps (2011 data)
├── public/                  # Web demos and components
├── scripts/                 # Build scripts
├── metadata/                # Administrative unit metadata (CSV)
│   ├── municipalities.csv  # All 1,642 municipalities/cities
│   └── provinces.csv       # All 88 provinces/districts
├── phl_shapefiles_extracted/  # Extracted source shapefiles
├── phl_shapefiles.zip      # Source shapefile archive (882 MB)
├── municities-build.log    # Build process log
├── README.md               # Main documentation
├── CLAUDE.md               # This file - AI assistant guidance
├── BUILD_SUMMARY.md        # Build statistics and status
├── DEMO_GUIDE.md           # Interactive demos documentation
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── CHANGELOG.md            # Version history
```

### 2023 Data Directory (Current)
```
2023/
├── geojson/
│   ├── country/     # Nationwide regional boundaries (Level 0)
│   │   ├── hires/   # 10% simplification (0.1)
│   │   ├── medres/  # 1% simplification (0.01)
│   │   └── lowres/  # 0.1% simplification (0.001)
│   ├── regions/     # Province/district boundaries per region (Level 1)
│   ├── provdists/   # Municipality/city boundaries per province (Level 2)
│   └── municities/  # Barangay boundaries per municipality (Level 3)
├── topojson/
│   └── [same structure as geojson]
├── processed/       # Intermediate build files
│   ├── country/
│   ├── regions/
│   ├── provdists/
│   └── municities/
├── municities-all.0.1.json     # All municipalities consolidated (60 MB)
├── municities-all.0.01.json    # All municipalities consolidated (7.7 MB)
├── municities-all.0.001.json   # All municipalities consolidated (1.8 MB)
├── provdists-all.0.1.json      # All provinces consolidated (52 MB)
├── provdists-all.0.01.json     # All provinces consolidated (5.5 MB)
└── provdists-all.0.001.json    # All provinces consolidated (635 KB)
```

### Public Directory (Demos & Components)
```
public/
├── index.html                    # Main landing page
├── demos/
│   ├── index.html               # Demo gallery
│   ├── country.html             # Level 0: All 17 regions
│   ├── regions.html             # Level 1: All 88 provinces/districts
│   ├── provdists.html           # Level 2: All 1,642 municipalities
│   ├── municities.html          # Level 3: Barangays (with dropdown)
│   ├── component-example.html   # Web component demo
│   ├── component-labels-example.html  # Web component with labels
│   ├── municipalities-data.js   # Municipality lookup data (108 KB)
│   ├── provinces-data.js        # Province lookup data (7 KB)
│   └── README.md                # Demo documentation
├── components/
│   └── philippines-map.js       # Reusable web component (18 KB)
└── 2023/                        # Symlink or copy of 2023 data
```

### Scripts Directory
```
scripts/
├── 2023/
│   ├── processed/     # Working directory for shapefile extraction
│   ├── geojson/       # Generated GeoJSON intermediate files
│   └── topojson/      # Generated TopoJSON files
├── topojson-country.sh          # Generate country-level maps
├── topojson-regions.sh          # Generate region-level maps (original)
├── topojson-regions-fixed.sh    # Generate region-level maps (OCHA fields)
├── topojson-provdists.sh        # Generate province-level maps (original)
├── topojson-provdists-fixed.sh  # Generate province-level maps (OCHA fields)
├── topojson-municities.sh       # Generate municipality maps (original)
└── topojson-municities-fixed.sh # Generate municipality maps (OCHA fields)
```

### Legacy Data (2011, 2019)
**Note**: Older versions use different naming conventions:
- **2011/2019**: `barangays/`, `municities/`, `provinces/`, `regions/`
- **2023**: `municities/` (barangays), `provdists/` (provinces), `regions/` (provinces per region)

### Resolution Levels
Each administrative level has three resolution subdirectories:
- `hires/`: 10% simplification (0.1 suffix)
- `medres/`: 1% simplification (0.01 suffix)
- `lowres/`: 0.1% simplification (0.001 suffix)

### File Naming Convention
Files are named using PSGC codes (numeric identifiers):
- Country: `country.{0.1|0.01|0.001}.json`
- Regions: `provdists-region-{REGION_PSGC}.{0.1|0.01|0.001}.json`
- Provinces/Districts: `municities-provdist-{PROVDIST_PSGC}.{0.1|0.01|0.001}.json`
- Municipalities/Cities: `bgysubmuns-municity-{MUNICITY_PSGC}.{0.1|0.01|0.001}.json`
- TopoJSON files have `.topo` before the resolution suffix

## Data Processing Pipeline

### Prerequisites
```bash
brew install gdal       # GDAL 3.11.4 or later
npm install -g mapshaper  # Mapshaper 0.6.113 or later
```

### Source Data

**Current (2023)**:
- Shapefiles from **UN OCHA - Humanitarian Data Exchange**
- Dataset: Philippines Administrative Boundaries (PSGC)
- Date: November 6, 2023
- Size: 882 MB (compressed)
- Projection: EPSG:4326 (WGS84)
- Place `phl_shapefiles.zip` in the repository root
- Field names use OCHA convention (ADM1_PCODE, ADM2_PCODE, etc.)

**Alternative Source**:
- [altcoder/philippines-psgc-shapefiles](https://github.com/altcoder/philippines-psgc-shapefiles)
- Uses PSGC field names (adm1_psgc, adm2_psgc, etc.)
- Requires original scripts (without `-fixed` suffix)
- Projection: EPSG:32651 (Lat/Long WGS84)

### Generation Process

#### Option 1: Using OCHA Data (Recommended)
Run fixed scripts in order from `scripts/` directory:

```bash
cd scripts
./topojson-country.sh
./topojson-regions-fixed.sh       # Uses ADM1_PCODE, ADM2_PCODE
./topojson-provdists-fixed.sh     # Uses ADM2_PCODE, ADM3_PCODE
./topojson-municities-fixed.sh    # Uses ADM3_PCODE, ADM4_PCODE
```

#### Option 2: Using PSGC Shapefiles
Run original scripts in order from `scripts/` directory:

```bash
cd scripts
./topojson-country.sh
./topojson-regions.sh             # Uses adm1_psgc, adm2_psgc
./topojson-provdists.sh           # Uses adm2_psgc, adm3_psgc
./topojson-municities.sh          # Uses adm3_psgc, adm4_psgc
```

**Build Time**: ~23 minutes total (barangay level takes longest)

### Script Architecture
Each script follows the same pattern:
1. Unzip source shapefile to `scripts/2023/processed/{level}/`
2. Extract PSGC codes using `ogr2ogr` to generate a CSV list
3. Iterate through each administrative unit:
   - Filter shapefile by PSGC code using `ogr2ogr -where`
   - Convert to GeoJSON with WGS84 projection
   - Generate three resolution levels using `mapshaper -simplify`
   - Convert each resolution to TopoJSON
   - Set appropriate PSGC field as ID (`id-field`)
4. Clean up intermediate files

### Key Tools
- **ogr2ogr**: Shapefile filtering, format conversion, projection transformation
- **mapshaper**: Geometry simplification, GeoJSON/TopoJSON generation

### Field Mapping: OCHA vs PSGC

The two data sources use different field naming conventions:

| OCHA Field | PSGC Field | Description |
|------------|------------|-------------|
| ADM1_PCODE | adm1_psgc | Region code |
| ADM2_PCODE | adm2_psgc | Province/District code |
| ADM3_PCODE | adm3_psgc | Municipality/City code |
| ADM4_PCODE | adm4_psgc | Barangay/Sub-municipality code |

**Important**: Always use the `-fixed` scripts when working with OCHA data from UN Humanitarian Data Exchange.

### Consolidated Files

For convenience, consolidated files combining all administrative units at a given level are available:

- `2023/municities-all.{resolution}.json` - All 1,642 municipalities in one file
- `2023/provdists-all.{resolution}.json` - All 88 provinces/districts in one file

These files are useful for:
- Full-country visualizations at municipality or province level
- Simplified data loading (single HTTP request)
- Desktop GIS applications

**Note**: Barangay-level consolidated files are not generated due to size (~600+ MB)

## Web Demos & Components

### Interactive Demos

Four interactive map demos are available in `public/demos/`:

1. **country.html** - All 17 regions (Level 0)
2. **regions.html** - All 88 provinces/districts (Level 1)
3. **provdists.html** - All 1,642 municipalities/cities (Level 2)
4. **municities.html** - Barangays by municipality (Level 3, dropdown selector)

**Features**:
- Resolution selector (low/medium/high)
- Show/hide code viewer with syntax highlighting
- Interactive hover effects and click-to-zoom
- Info panels and legends
- Built with Leaflet.js and OpenStreetMap tiles

**Running Locally**:
```bash
python3 -m http.server 8000
# or
npx http-server -p 8000
```
Then open: http://localhost:8000/public/demos/

### Reusable Web Component

A `<philippines-map>` web component (`public/components/philippines-map.js`) provides:
- Zero-configuration map rendering
- Customizable colors, height, and labels
- Built-in loading states and error handling
- Works with vanilla HTML, React, Vue, Angular

**Example**:
```html
<script src="public/components/philippines-map.js"></script>

<philippines-map
    level="1"
    title="Philippine Regions"
    color-scheme="blue"
    height="600px">
</philippines-map>
```

See **DEMO_GUIDE.md** for complete documentation on demos and web components.

## Important PSGC Notes

- PSGC codes are numeric identifiers that uniquely identify each administrative unit
- NCR (National Capital Region) districts are treated as provinces for mapping purposes
- Special handling: Davao City is NOT part of Davao del Sur province (see git history for fixes)
- The scripts normalize PSGC codes by removing non-alphanumeric characters and converting to lowercase for file naming

## Documentation Files

The repository includes several documentation files:

- **README.md** - Main user-facing documentation, getting started guide
- **BUILD_GUIDE.md** - Complete step-by-step guide for building maps from source shapefiles (prerequisites, download, build, verify, troubleshoot)
- **DOWNLOAD_SOURCE_DATA.md** - Detailed instructions for downloading source shapefiles from UN OCHA
- **CLAUDE.md** (this file) - Technical guidance for AI assistants and developers
- **BUILD_SUMMARY.md** - Build statistics, file counts, sizes, and completion status
- **DEMO_GUIDE.md** - Comprehensive guide for interactive demos and web components
- **DEPLOYMENT_GUIDE.md** - Instructions for deploying demos to GitHub Pages or other hosts
- **CHANGELOG.md** - Version history and notable changes

## Metadata Directory

Administrative unit metadata is available in the `metadata/` directory:

- **metadata/municipalities.csv** - All 1,642 municipalities/cities with PCODE, names, and parent codes
- **metadata/provinces.csv** - All 88 provinces/districts with PCODE, names, and parent region codes

These CSV files are useful for:
- Building dropdowns and selection menus
- Looking up administrative unit names from codes
- Joining external data with map features
- Creating data validation lists
- Generating documentation or reports

## Common Issues & Tips

### Known Issues

1. **Field Name Mismatch**: OCHA shapefiles use `ADM*_PCODE` while PSGC shapefiles use `adm*_psgc`
   - **Solution**: Use `-fixed` scripts for OCHA data, original scripts for PSGC data

2. **NCR Districts Mapping**: National Capital Region (NCR) districts treated as provinces
   - **Reference**: Commit c389e081
   - Districts: Manila, Caloocan, Las Piñas, Makati, Malabon, Mandaluyong, Marikina, Muntinlupa, Navotas, Parañaque, Pasay, Pasig, Pateros, Quezon City, San Juan, Taguig, Valenzuela

3. **Davao City Province**: Davao City is NOT part of Davao del Sur province
   - **Reference**: Commits 8bea49f3, 8eeead56
   - Davao City is a highly urbanized city (HUC) and independent from any province

4. **Large File Sizes**: Barangay-level files total ~400+ MB
   - Use low-resolution TopoJSON for web applications
   - Consider loading municipality-specific barangay files instead of consolidated files
   - `processed/` directories contain temporary build files (~1.5 GB each) that should be cleaned up manually

### Performance Tips

1. **Web Applications**: Always use low-resolution TopoJSON (0.001) for initial loads
2. **Build Process**:
   - Barangay processing takes 15-20 minutes
   - Intermediate files in `processed/` directories (~1.5 GB each) should be cleaned up after build
   - These directories are excluded in `.gitignore` (2023/processed/, public/*/processed/, scripts/processed/)
   - Build logs saved to `municities-build.log` for debugging
3. **File Serving**: Enable gzip compression on your web server (60-80% size reduction)
4. **Data Loading**: Use consolidated `-all` files for country-wide visualizations at municipality/province level

### Development Workflow

When regenerating maps:
1. Ensure `phl_shapefiles.zip` is in repository root
2. Run scripts from `scripts/` directory (not from root)
3. Scripts output to `../2023/` relative paths
4. Check build logs if errors occur
5. Validate output files have correct PCODE IDs
6. Test with demos in `public/demos/` before committing

### Git Large Files

- Repository uses `.gitattributes` for LFS tracking of large files
- GeoJSON/TopoJSON files in `2023/` are tracked
- Source shapefiles (`phl_shapefiles.zip`) should be downloaded separately
- Total repository size: ~500 MB (with 2023 data)

## Quick Reference

### File Counts (2023 Data)

| Level | Description | Count | Formats | Total Files |
|-------|-------------|-------|---------|-------------|
| 0 | Country (Regions) | 1 | GeoJSON + TopoJSON | 6 |
| 1 | Regions (Provinces) | 17 | GeoJSON + TopoJSON | 102 |
| 2 | Provinces (Municipalities) | 88 | GeoJSON + TopoJSON | 528 |
| 3 | Municipalities (Barangays) | 1,642 | GeoJSON + TopoJSON | 9,852 |
| **Total** | | **1,748** | | **10,488** |

Each file has 3 resolutions × 2 formats (GeoJSON + TopoJSON) = 6 variants

### Key File Paths

**Country-wide maps**:
```
2023/geojson/country/lowres/country.0.001.json           # All regions
2023/topojson/country/lowres/country.topo.0.001.json     # All regions (smaller)
```

**Regional maps (example: NCR)**:
```
2023/geojson/regions/lowres/provdists-region-ph13.0.001.json
2023/topojson/regions/lowres/provdists-region-ph13.topo.0.001.json
```

**Provincial maps (example: Metro Manila)**:
```
2023/geojson/provdists/lowres/municities-provdist-ph13.0.001.json
2023/topojson/provdists/lowres/municities-provdist-ph13.topo.0.001.json
```

**Municipality maps (example: Quezon City - 1380300000)**:
```
2023/geojson/municities/lowres/bgysubmuns-municity-1380300000.0.001.json
2023/topojson/municities/lowres/bgysubmuns-municity-1380300000.topo.0.001.json
```

**Consolidated files**:
```
2023/municities-all.0.001.json      # All 1,642 municipalities (1.8 MB)
2023/provdists-all.0.001.json       # All 88 provinces (635 KB)
```

**Metadata files**:
```
metadata/municipalities.csv         # All 1,642 municipalities with PCODE and names (54 KB)
metadata/provinces.csv              # All 88 provinces with PCODE and names (4.4 KB)
metadata/README.md                  # Metadata documentation and usage examples
```

### Region Codes (PCODE)

| Code | Region Name |
|------|-------------|
| ph01 | Region I (Ilocos Region) |
| ph02 | Region II (Cagayan Valley) |
| ph03 | Region III (Central Luzon) |
| ph04 | Region IV-A (CALABARZON) |
| ph05 | Region V (Bicol Region) |
| ph06 | Region VI (Western Visayas) |
| ph07 | Region VII (Central Visayas) |
| ph08 | Region VIII (Eastern Visayas) |
| ph09 | Region IX (Zamboanga Peninsula) |
| ph10 | Region X (Northern Mindanao) |
| ph11 | Region XI (Davao Region) |
| ph12 | Region XII (SOCCSKSARGEN) |
| ph13 | NCR (National Capital Region) |
| ph14 | CAR (Cordillera Administrative Region) |
| ph16 | Region XIII (Caraga) |
| ph17 | Region IV-B (MIMAROPA) |
| ph19 | BARMM (Bangsamoro Autonomous Region) |

### Useful Commands

**Count files**:
```bash
find 2023/geojson -type f | wc -l
find 2023/topojson -type f | wc -l
```

**Check disk usage**:
```bash
du -sh 2023/
du -sh 2023/geojson/
du -sh 2023/topojson/
```

**Validate JSON**:
```bash
jq empty 2023/geojson/country/lowres/country.0.001.json
```

**Extract PCODE list**:
```bash
jq -r '.features[].properties.ADM1_PCODE' 2023/geojson/country/lowres/country.0.001.json
```

**Start local server**:
```bash
python3 -m http.server 8000
# Then open: http://localhost:8000/public/demos/
```

### Related Resources

- **PSGC Official**: https://psa.gov.ph/classification/psgc/
- **UN OCHA Data**: https://data.humdata.org/dataset/philippines-administrative-boundaries
- **Mapshaper Online**: https://mapshaper.org/
- **GeoJSON Validator**: http://geojson.io/
- **TopoJSON Specification**: https://github.com/topojson/topojson-specification

---

**Last Updated**: October 16, 2025
**Data Version**: PSGC Q4 2023 (December 31, 2023)
