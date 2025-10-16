# Changelog

All notable changes to the Philippines JSON Maps project.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] - 2024-10-16

Major release with interactive demos, web components, and comprehensive documentation.

### Added

#### Interactive Demos (`public/demos/`)

- **Four interactive HTML demos** using Leaflet.js and OpenStreetMap:
  - `country.html` - Displays all 17 Philippine regions with hover effects and color-coded choropleth
  - `regions.html` - Shows ALL 88 provinces/districts across the Philippines on a single map
  - `provdists.html` - Displays ALL 1,642 municipalities/cities across the Philippines on a single map
  - `municities.html` - Shows barangays for any municipality with interactive dropdown selector (1,642 options)

- **Demo features**:
  - **Resolution Selector**: Switch between low/medium/high resolution on-the-fly (all demos)
  - **Show/Hide Code**: View source code with syntax highlighting (all demos)
  - Interactive hover effects with real-time data display
  - Color-coded choropleth maps based on data values
  - Click-to-zoom functionality
  - Info control panel (upper-right) showing region details
  - Legend control (lower-right) showing color scale
  - Responsive design for desktop and mobile

- **Demo landing page** (`public/demos/index.html`):
  - Overview of all 4 demo levels
  - Feature descriptions
  - Quick navigation to each demo

- **Demo documentation** (`public/demos/README.md`):
  - Complete setup instructions
  - Data source information
  - Customization guide
  - Browser compatibility information
  - Web component usage examples

#### Web Component System

- **Reusable Web Component** (`public/components/philippines-map.js`, 17KB):
  - Custom HTML element `<philippines-map>` for easy integration
  - Shadow DOM encapsulation for styling isolation
  - Support for all 4 administrative levels (regions, provinces, municipalities, barangays)
  - Four built-in color schemes (green, red, purple, blue)
  - Automatic data loading and rendering
  - Event system for interactivity
  - Public API for programmatic control

- **Component Features**:
  - **Tooltips**: Display region name and value on hover (enabled by default)
  - **Permanent Labels**: Show labels directly on all shapefiles
  - **Info Panel**: Upper-right control showing detailed information
  - **Legend**: Color scale with customizable value ranges
  - **Dynamic Data Updates**: Update map data without reloading
  - **Toggle Controls**: Show/hide labels and tooltips programmatically

- **Component Examples**:
  - `component-example.html` - Interactive demo with live controls for level, color scheme, title, and data updates
  - `component-labels-example.html` - Dedicated example showcasing tooltips and permanent labels

- **Component API**:
  - **Attributes**: `level`, `data-source`, `data`, `title`, `value-name`, `color-scheme`, `height`, `show-labels`, `show-tooltips`
  - **Methods**: `setData()`, `toggleLabels()`, `toggleTooltips()`, `getMap()`, `fitBounds()`
  - **Events**: `region-click`, `map-ready`, `data-updated`, `map-error`

#### Documentation

- **BUILD_GUIDE.md** (NEW - 22KB):
  - Complete step-by-step guide for building maps from source
  - Prerequisites and tool installation (GDAL, mapshaper)
  - Downloading source data from UN OCHA (882 MB)
  - Setup and environment preparation
  - Detailed build process for all 4 administrative levels
  - Verification steps and file counts
  - Comprehensive troubleshooting section
  - Advanced options for customization
  - Build summary with timings and file sizes

- **DOWNLOAD_SOURCE_DATA.md** (NEW - 8KB):
  - Detailed instructions for downloading source shapefiles
  - UN OCHA direct download links
  - Alternative sources (GitHub, PSA)
  - File verification steps
  - Troubleshooting download issues

- **CLAUDE.md** (15KB):
  - Comprehensive technical documentation for AI assistants and developers
  - Complete directory structure with descriptions
  - Data processing pipeline documentation
  - Field mapping tables (OCHA vs PSGC)
  - Web demos and components overview
  - Known issues and troubleshooting tips
  - Performance optimization guidelines
  - Development workflow instructions
  - Quick reference section with file paths, region codes, and useful commands
  - Related resources and links

- **README.md** (18KB - Complete rewrite):
  - Professional header with badges and quick navigation
  - "What's Included" statistics section
  - Enhanced Quick Start with three usage options
  - Interactive demos table with features
  - Web component integration guide with attributes
  - Administrative levels table with file counts
  - File naming convention documentation
  - Consolidated files explanation
  - Resolution guide with recommendations
  - Data sources section with OCHA and PSGC information
  - Legacy versions comparison
  - Complete build process documentation
  - Usage examples (Leaflet.js, D3.js, React)
  - Features checklist (12 items)
  - Contributing guidelines
  - License and acknowledgments
  - Support information

- **DEMO_GUIDE.md** (27KB):
  - Complete guide for managing demo data
  - Instructions for replacing random data with real data (3 methods: object mapping, API, CSV)
  - Color scheme customization guide
  - Full web component implementation documentation
  - Integration guides for React, Vue, and Angular
  - Advanced customization examples
  - API reference
  - Troubleshooting guide
  - Best practices

- **DEPLOYMENT_GUIDE.md** (26KB):
  - GitHub Pages deployment instructions
  - Static hosting setup (Netlify, Vercel, AWS S3, Azure, Cloudflare Pages)
  - Domain configuration
  - CI/CD pipeline examples
  - Performance optimization tips

- **BUILD_SUMMARY.md** (5KB):
  - Build completion status
  - File statistics (10,488 files, 489 MB)
  - Resolution levels explanation
  - Directory structure
  - Source data information
  - Build tools and versions
  - File naming conventions
  - Field mappings
  - Interactive demos overview

#### Data Files

- **Combined GeoJSON Files** for improved performance:
  - `2023/provdists-all.0.001.json` (620KB) - All 88 provinces/districts in one file
  - `2023/municities-all.0.001.json` (1.8MB) - All 1,642 municipalities/cities in one file
  - Generated using mapshaper's combine-files and merge-layers features

- **Data Helper Files**:
  - `public/demos/provinces-data.js` (7.1KB) - JavaScript array of all 88 provinces with codes and regions
  - `public/demos/municipalities-data.js` (105KB) - JavaScript array of all 1,642 municipalities with codes and provinces

- **Metadata Directory** (`metadata/`):
  - `metadata/municipalities.csv` (54KB) - Complete list of all 1,642 municipalities/cities with PCODE, names, and parent province codes
  - `metadata/provinces.csv` (4.4KB) - Complete list of all 88 provinces/districts with PCODE, names, and parent region codes
  - `metadata/README.md` (5KB) - Metadata documentation with usage examples in JavaScript, Python, Node.js, and Excel
  - Organized in dedicated folder for better project structure
  - Useful for dropdowns, lookups, data joining, and validation

#### Build Process Documentation

- **BUILD_SUMMARY.md**:
  - Comprehensive build statistics (10,488 files generated, 489 MB total)
  - Build timeline and process documentation
  - Tool versions used (gdal 3.11.4, mapshaper 0.6.113)
  - Data source information (UN OCHA)

- **Fixed Build Scripts**:
  - `scripts/topojson-regions-fixed.sh` - Uses ADM1_PCODE instead of adm1_psgc
  - `scripts/topojson-provdists-fixed.sh` - Uses ADM2_PCODE and ADM3_PCODE fields
  - `scripts/topojson-municities-fixed.sh` - Processes all 1,642 municipalities (~23 minutes)

### Fixed

#### Demo Property Names

- **Fixed country.html** (Level 1):
  - Changed `props.adm1_en` to `props.ADM1_EN` (uppercase)
  - Changed `props.area_km2` to `props.AREA_SQKM` (proper field name)
  - Fixed "undefined" region names in info panel

#### Data Structure Compatibility

- **Field Name Mappings**:
  - Mapped OCHA shapefile fields to expected format:
    - `ADM1_PCODE` → `adm1_psgc` (regions)
    - `ADM2_PCODE` → `adm2_psgc` (provinces)
    - `ADM3_PCODE` → `adm3_psgc` (municipalities)
    - `ADM4_PCODE` → `adm4_psgc` (barangays)

- **Shapefile Compatibility**:
  - Created symlinks for file naming compatibility
  - Handled OCHA data format differences from original GitHub sources

### Changed

#### Demo Behavior

- **regions.html**: Changed from single-region selector to showing ALL provinces simultaneously
  - Previously: Dropdown to select one of 17 regions, showing only that region's provinces
  - Now: Displays all 88 provinces/districts on a single map
  - Provides better overview of the entire country

- **provdists.html**: Changed from single-province selector to showing ALL municipalities simultaneously
  - Previously: Dropdown to select one of 88 provinces, showing only that province's municipalities
  - Now: Displays all 1,642 municipalities/cities on a single map
  - Better performance using lowres (0.1%) simplified geometries

- **municities.html**: Retained dropdown selector (necessary due to 42,048 barangays)
  - Selector allows choosing from all 1,642 municipalities
  - Loads barangays on-demand for selected municipality

#### Data Sources

- **Switched from GitHub LFS to UN OCHA**:
  - Original: altcoder/philippines-psgc-shapefiles (Git LFS - bandwidth limit exceeded)
  - New: UN OCHA Humanitarian Data Exchange (882MB direct download)
  - URL: https://data.humdata.org/dataset/caf116df-f984-4deb-85ca-41b349d3f313

#### Build Infrastructure

- **Comprehensive `.gitignore`** to exclude build artifacts and temporary files:
  - **Intermediate build files**: `scripts/*/geojson/`, `scripts/*/topojson/`, `**/processed/`
  - **Processed directories**: `2023/processed/`, `2019/processed/`, `2011/processed/`, `public/*/processed/` (~1.5 GB each)
  - **Source shapefiles**: `*.zip`, `*.shp`, `*.shx`, `*.dbf`, `*.prj`, `*.cpg`, `*.sbn`, `*.sbx`
  - **Build logs**: `*.log`, `municities-build.log`
  - **OS-specific files**: `.DS_Store`, `.AppleDouble`, `.LSOverride`, `Thumbs.db`, `Desktop.ini`
  - **Editor/IDE files**: `.vscode/`, `.idea/`, `*.swp`, `*.swo`, `*~`, `.sublime-*`
  - **Node.js**: `node_modules/`, `npm-debug.log*`, `yarn-*.log*`, `package-lock.json`
  - **Python**: `__pycache__/`, `*.py[cod]`, `venv/`, `.venv`, `ENV/`
  - **Temporary files**: `*.tmp`, `*.temp`, `*.bak`, `*.backup`, `*.orig`
  - **Environment files**: `.env`, `.env.local`, `.env.*.local`
  - **Claude Code**: `.claude/` directory

- **Updated BUILD_GUIDE.md** with cleanup instructions:
  - Documented that processed directories are temporary and can be safely deleted after build
  - Added disk space information (~1.5 GB per processed directory)
  - Provided cleanup commands to free disk space

### Technical Details

#### File Structure

```
philippines-json-maps/
├── README.md (COMPLETELY REWRITTEN - 18KB)
├── CLAUDE.md (NEW - 15KB)
├── CHANGELOG.md (NEW - 12KB)
├── DEMO_GUIDE.md (NEW - 28KB)
├── DEPLOYMENT_GUIDE.md (NEW - 26KB)
├── BUILD_SUMMARY.md (NEW - 5KB)
├── metadata/ (NEW)
│   ├── municipalities.csv (NEW - 54KB)
│   └── provinces.csv (NEW - 4.4KB)
├── municities-build.log (Build process log)
├── phl_shapefiles.zip (Source data - 882MB)
├── 2023/
│   ├── provdists-all.0.001.json (NEW - 635KB)
│   ├── provdists-all.0.01.json (NEW - 5.5MB)
│   ├── provdists-all.0.1.json (NEW - 52MB)
│   ├── municities-all.0.001.json (NEW - 1.8MB)
│   ├── municities-all.0.01.json (NEW - 7.7MB)
│   ├── municities-all.0.1.json (NEW - 60MB)
│   ├── geojson/
│   │   ├── country/
│   │   │   ├── hires/*.json (2 files - country & country layers)
│   │   │   ├── medres/*.json (2 files)
│   │   │   └── lowres/*.json (2 files)
│   │   ├── regions/
│   │   │   ├── hires/*.json (17 files)
│   │   │   ├── medres/*.json (17 files)
│   │   │   └── lowres/*.json (17 files)
│   │   ├── provdists/
│   │   │   ├── hires/*.json (88 files)
│   │   │   ├── medres/*.json (88 files)
│   │   │   └── lowres/*.json (88 files)
│   │   └── municities/
│   │       ├── hires/*.json (1,642 files)
│   │       ├── medres/*.json (1,642 files)
│   │       └── lowres/*.json (1,642 files)
│   ├── topojson/
│   │   └── [same structure as geojson]
│   └── processed/ (Intermediate build files)
├── 2019/ (Legacy version)
├── 2011/ (Legacy version)
├── public/ (NEW)
│   ├── index.html (Main landing page)
│   ├── README.md (Public directory documentation)
│   ├── 2023/ (Symlink or copy of selected 2023 files)
│   ├── components/
│   │   └── philippines-map.js (NEW - 18KB)
│   └── demos/
│       ├── index.html (Demo gallery)
│       ├── country.html (Resolution selector & code viewer)
│       ├── regions.html (Resolution selector & code viewer)
│       ├── provdists.html (Resolution selector & code viewer)
│       ├── municities.html (Dropdown + resolution selector & code viewer)
│       ├── component-example.html (NEW - Web component demo)
│       ├── component-labels-example.html (NEW - Labels demo)
│       ├── README.md (NEW - Demo documentation)
│       ├── provinces-data.js (NEW - 7KB)
│       └── municipalities-data.js (NEW - 108KB)
├── scripts/
│   ├── topojson-country.sh
│   ├── topojson-regions.sh
│   ├── topojson-regions-fixed.sh (NEW - for OCHA data)
│   ├── topojson-provdists.sh
│   ├── topojson-provdists-fixed.sh (NEW - for OCHA data)
│   ├── topojson-municities.sh
│   ├── topojson-municities-fixed.sh (NEW - for OCHA data)
│   └── 2023/
│       ├── processed/ (Working directory)
│       ├── geojson/ (Intermediate files)
│       └── topojson/ (Intermediate files)
└── phl_shapefiles_extracted/ (Extracted source shapefiles)
```

#### Generated Files

- **Total files generated**: 10,488
  - 5,244 GeoJSON files
  - 5,244 TopoJSON files
- **Total size**: 489 MB
- **Resolution levels**: hires (10%), medres (1%), lowres (0.1%)

#### Dependencies Used

- **Leaflet.js**: 1.9.4 (interactive maps)
- **OpenStreetMap**: Tile layer provider
- **gdal**: 3.11.4 (shapefile conversion)
- **mapshaper**: 0.6.113 (geometry simplification)

#### Browser Compatibility

All demos and web components work in modern browsers supporting:
- ES6 JavaScript
- Fetch API
- CSS Grid
- Web Components (Custom Elements v1)
- Shadow DOM

### Performance Optimizations

- **Used lowres (0.1%) files** for all demos to ensure fast loading
- **Reduced file sizes**:
  - Country: ~100KB
  - All Provinces: 620KB (vs loading 17 separate files)
  - All Municipalities: 1.8MB (vs loading 88 separate files)
- **Shadow DOM** in web component prevents style conflicts
- **Event delegation** for efficient hover/click handling
- **Lazy loading** of map data with proper error handling

### Integration Support

The web component can be integrated with:

- **Vanilla JavaScript**: Direct HTML usage
- **React**: Custom hook wrapper provided in documentation
- **Vue**: Composition API example provided
- **Angular**: Component wrapper example provided
- **Any framework**: Standards-compliant Web Component (Custom Elements v1)

### Examples of Usage

#### Basic HTML
```html
<script src="public/components/philippines-map.js"></script>
<philippines-map
    level="1"
    title="Philippine Regions"
    color-scheme="blue"
    height="600px">
</philippines-map>
```

#### With Custom Data
```javascript
const map = document.querySelector('philippines-map');
map.setData({
    'PH01': 85.5,
    'PH02': 72.3,
    'PH03': 91.2
});
```

#### With Labels
```html
<philippines-map
    level="2"
    show-labels="true"
    title="All Provinces with Labels">
</philippines-map>
```

### Migration Notes

For users migrating from previous versions:

1. **No breaking changes** to existing data files
2. **New demos folder** is completely optional
3. **Web component** is opt-in, doesn't affect existing usage
4. **Combined JSON files** are supplementary, individual files still available
5. **All original functionality** remains unchanged

### Known Issues

- None at this time

### Future Enhancements (Potential)

- [ ] Export map as PNG/SVG
- [ ] Data filtering and search functionality
- [ ] Multiple data layers support
- [ ] Animation/transitions for data updates
- [ ] Mobile-optimized controls
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] TypeScript definitions for web component
- [ ] NPM package distribution

---

## [1.0.0] - 2023-12-31

Initial release with 2023 PSGC data.

### Added

- **2023 Map Data**: Complete set of Philippine administrative boundaries based on Q4 2023 PSGC
  - Country level (17 regions)
  - Regional level (88 provinces/districts)
  - Provincial level (1,642 municipalities/cities)
  - Municipal level (42,048 barangays)

- **Multiple Formats**: GeoJSON and TopoJSON for all levels

- **Three Resolutions**: High (10%), Medium (1%), Low (0.1%) simplification

- **Build Scripts**:
  - `topojson-country.sh`
  - `topojson-regions.sh`
  - `topojson-provdists.sh`
  - `topojson-municities.sh`

- **Documentation**: Basic README with conversion process

### Data Source

- Shapefiles from UN OCHA Humanitarian Data Exchange
- PSGC data as of December 31, 2023
- Projection: EPSG:4326 (WGS84)

---

## [0.9.0] - 2019

Legacy release with 2019 PSGC data.

### Features

- 2019 administrative boundaries
- GeoJSON and TopoJSON formats
- Multiple resolution levels
- Different directory structure from 2023 version

---

## [0.5.0] - 2011

Initial legacy release with 2011 data.

### Features

- 2011 administrative boundaries
- GeoJSON and TopoJSON formats
- Original directory structure

---

## Project Information

**Project**: Philippines JSON Maps
**Repository**: https://github.com/faeldon/philippines-json-maps
**License**: MIT
**Current Version**: 2.0.0
**Data Source**: UN OCHA Humanitarian Data Exchange (PSA/NAMRIA 2023 Q4 shapefiles)
**Last Updated**: October 16, 2024
**Maintained By**: faeldon and contributors

## Contributors

- **faeldon** - Original project creator and maintainer
- **Contributors** - Demos, web components, and documentation enhancements
- **Data Sources**: UN OCHA, Philippine Statistics Authority (PSA), NAMRIA

## Links

- **Repository**: https://github.com/faeldon/philippines-json-maps
- **Issues**: https://github.com/faeldon/philippines-json-maps/issues
- **Discussions**: https://github.com/faeldon/philippines-json-maps/discussions
- **PSGC Official**: https://psa.gov.ph/classification/psgc/
- **UN OCHA Data**: https://data.humdata.org/dataset/philippines-administrative-boundaries

---

## Version History

### Summary of Changes by Category

| Category | Files Added | Files Modified | Lines of Code |
|----------|-------------|----------------|---------------|
| Demos (HTML) | 9 | 0 | ~1,500 |
| Web Components | 3 | 0 | ~800 |
| Documentation (Markdown) | 8 | 1 | ~5,700 |
| Data Files (GeoJSON) | 6 | 0 | N/A (binary) |
| Metadata Files (CSV + MD) | 3 | 0 | ~700 |
| Helper Data (JS) | 2 | 0 | ~1,000 |
| Build Scripts | 3 | 0 | ~300 |
| **Total** | **34** | **1** | **~10,000** |

### File Size Summary

| File Type | Count | Total Size | Notes |
|-----------|-------|------------|-------|
| **Documentation** | | | |
| README.md | 1 (rewrite) | 18 KB | Complete rewrite with examples |
| BUILD_GUIDE.md | 1 | 22 KB | Complete build process guide |
| DOWNLOAD_SOURCE_DATA.md | 1 | 8 KB | Source data download instructions |
| CLAUDE.md | 1 | 15 KB | Technical docs for developers/AI |
| CHANGELOG.md | 1 | 12 KB | This file |
| DEMO_GUIDE.md | 1 | 28 KB | Demos & web component guide |
| DEPLOYMENT_GUIDE.md | 1 | 26 KB | Hosting & deployment |
| BUILD_SUMMARY.md | 1 | 5 KB | Build statistics |
| public/demos/README.md | 1 | 6 KB | Demo-specific docs |
| **Demo HTML** | | | |
| HTML Demos | 9 | ~120 KB | Interactive maps with Leaflet |
| **Web Components** | | | |
| philippines-map.js | 1 | 18 KB | Reusable web component |
| **Data Files** | | | |
| Combined GeoJSON (low) | 2 | ~2.4 MB | provdists + municities consolidated |
| Combined GeoJSON (med) | 2 | ~13 MB | Medium resolution |
| Combined GeoJSON (high) | 2 | ~112 MB | High resolution |
| **Helper Data** | | | |
| provinces-data.js | 1 | 7 KB | Province lookup data (public/demos) |
| municipalities-data.js | 1 | 108 KB | Municipality lookup data (public/demos) |
| **Metadata Directory** | | | |
| metadata/municipalities.csv | 1 | 54 KB | Municipality metadata (all fields) |
| metadata/provinces.csv | 1 | 4 KB | Province metadata (all fields) |
| metadata/README.md | 1 | 5 KB | Metadata documentation and usage examples |
| **Build Scripts** | 3 | ~12 KB | Fixed scripts for OCHA data |
| **Total New/Modified** | **30** | **~127 MB** | Excluding map generation |

### Repository Statistics

**Before This Release**:
- Map files only (2011, 2019, 2023 data)
- Basic README
- No demos or web components
- ~490 MB total

**After This Release (v2.0.0)**:
- All previous map files
- 9 interactive demos
- 1 reusable web component
- 7 comprehensive documentation files
- 6 consolidated GeoJSON files
- 2 metadata CSV files
- Build scripts for OCHA data
- **~620 MB total** (including all resolutions of consolidated files)

---

## Upgrade Guide

### From v1.0.0 to v2.0.0

**No Breaking Changes** - All existing map files remain unchanged and compatible.

**New Features Available**:
1. **Interactive Demos**: Explore `public/demos/` for ready-to-use examples
2. **Web Component**: Use `<philippines-map>` for quick integration
3. **Consolidated Files**: Use `municities-all.json` and `provdists-all.json` for full-country maps
4. **Enhanced Documentation**: Refer to DEMO_GUIDE.md, DEPLOYMENT_GUIDE.md, and updated README.md

**Optional Steps**:
1. Run a local server to view demos: `python3 -m http.server 8000`
2. Copy `public/components/philippines-map.js` to your project for web component usage
3. Use consolidated files for better performance in country-wide visualizations
4. Check CLAUDE.md for technical details and build instructions

**For Developers**:
- Use `-fixed` scripts if working with OCHA data
- Refer to BUILD_SUMMARY.md for complete build statistics
- Check municipalities.csv and provinces.csv for metadata lookups

### From 2019 or 2011 Versions

**Major Changes**:
- Directory structure changed (2023 uses different organization)
- Field names updated to match OCHA format (ADM*_PCODE instead of adm*_psgc)
- File naming convention updated
- Region codes now use 'ph' prefix (ph01, ph02, etc.)

**Migration Steps**:
1. Update file paths in your code to reflect new structure
2. Update property names in your code (e.g., `adm1_en` → `ADM1_EN`)
3. Test with new data to verify boundaries match your expectations
4. Refer to CLAUDE.md for field mapping tables

---

## Support

Found an issue or have a question?

- **Report Bugs**: [GitHub Issues](https://github.com/faeldon/philippines-json-maps/issues)
- **Ask Questions**: [GitHub Discussions](https://github.com/faeldon/philippines-json-maps/discussions)
- **Contribute**: See [Contributing Guidelines](.github/CODE_OF_CONDUCT.md)
- **Documentation**: Check README.md, DEMO_GUIDE.md, or CLAUDE.md

---

*This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format.*

**Made with ❤️ for the Philippines**
