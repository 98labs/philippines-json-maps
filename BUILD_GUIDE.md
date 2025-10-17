# Build Guide: Generating Philippine Administrative Boundary Maps

This guide walks you through the complete process of building Philippine administrative boundary maps from source shapefiles to finished GeoJSON and TopoJSON files.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Download Source Data](#download-source-data)
3. [Setup Environment](#setup-environment)
4. [Build Process](#build-process)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Options](#advanced-options)

---

## Prerequisites

### Required Tools

You'll need the following tools installed on your system:

#### 1. GDAL (for ogr2ogr)

**macOS**:
```bash
brew install gdal
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install gdal-bin
```

**Windows**:
- Download from: https://gdal.org/download.html
- Or use OSGeo4W installer: https://trac.osgeo.org/osgeo4w/

**Verify installation**:
```bash
ogr2ogr --version
# Should show: GDAL 3.x.x or higher
```

#### 2. Mapshaper (for simplification)

**All platforms** (requires Node.js):
```bash
# Install Node.js first if needed
# macOS: brew install node
# Ubuntu: sudo apt-get install nodejs npm
# Windows: Download from https://nodejs.org

# Install mapshaper globally
npm install -g mapshaper

# Verify installation
mapshaper --version
# Should show: 0.6.x or higher
```

#### 3. Additional Tools

```bash
# Unzip utility (usually pre-installed)
unzip --version

# Git (optional, for version control)
git --version
```

### System Requirements

- **Disk Space**: At least 5 GB free space
  - Source shapefiles: ~900 MB
  - Intermediate files: ~2 GB (during processing)
  - Final output: ~500 MB

- **Memory**: At least 4 GB RAM (8 GB recommended for barangay-level processing)

- **Time**: Approximately 23-30 minutes for complete build
  - Country: < 1 minute
  - Regions: ~2 minutes
  - Provinces: ~5 minutes
  - Municipalities (barangays): ~20 minutes

---

## Download Source Data

### Option 1: UN OCHA (Recommended)

**Why UN OCHA?**
- Free and publicly available
- Regularly updated
- Standard field naming (ADM*_PCODE)

**Download Steps**:

1. **Visit UN OCHA HDX**:
   ```
   https://data.humdata.org/dataset/philippines-administrative-boundaries
   ```

2. **Download the dataset**:
   - Look for "Philippines - Subnational Administrative Boundaries"
   - Click the download button for the shapefile package
   - File size: ~882 MB (zipped)

3. **Save to repository root**:
   ```bash
   # Navigate to your repository
   cd /path/to/philippines-json-maps

   # Rename downloaded file if needed
   mv ~/Downloads/phl_admbnda*.zip phl_shapefiles.zip
   ```

4. **Verify the download**:
   ```bash
   # Check file size (should be ~880-890 MB)
   ls -lh phl_shapefiles.zip

   # Check file integrity
   unzip -t phl_shapefiles.zip | tail -n 5
   # Should show "No errors detected"
   ```

### Option 2: Alternative PSGC Shapefiles

If you prefer shapefiles with PSGC field naming:

```bash
# Clone the repository with LFS support
git clone https://github.com/altcoder/philippines-psgc-shapefiles.git
cd philippines-psgc-shapefiles
git lfs pull

# Copy shapefiles to your repo
cp -r shapefiles/*.zip /path/to/philippines-json-maps/
```

**Note**: If using PSGC shapefiles, use the original scripts (without `-fixed` suffix).

---

## Setup Environment

### 1. Clone or Navigate to Repository

```bash
# If cloning fresh
git clone https://github.com/98labs/philippines-json-maps.git
cd philippines-json-maps

# Or navigate to existing clone
cd /path/to/philippines-json-maps
```

### 2. Verify Directory Structure

```bash
# Check that you have the scripts directory
ls -la scripts/

# Should show:
# topojson-country.sh
# topojson-regions-fixed.sh
# topojson-provdists-fixed.sh
# topojson-municities-fixed.sh
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### 4. Create Output Directories (optional)

The scripts will create these automatically, but you can pre-create them:

```bash
mkdir -p 2023/geojson/{country,regions,provdists,municities}/{hires,medres,lowres}
mkdir -p 2023/topojson/{country,regions,provdists,municities}/{hires,medres,lowres}
mkdir -p scripts/2023/{processed,geojson,topojson}
```

---

## Build Process

### Step 1: Country Level (Regions)

This generates the nationwide map showing all 17 regions.

```bash
cd scripts
./topojson-country.sh
```

**Expected output**:
```
Extracting shapefiles...
Processing country-level data...
Generating GeoJSON...
Creating simplified versions...
  - High resolution (10%)
  - Medium resolution (1%)
  - Low resolution (0.1%)
Converting to TopoJSON...
Done! Files generated in ../2023/geojson/country/ and ../2023/topojson/country/
```

**Time**: < 1 minute

**Files generated**: 6 files (3 GeoJSON + 3 TopoJSON)

### Step 2: Regional Level (Provinces per Region)

This generates 17 regional maps, each showing provinces/districts within that region.

```bash
./topojson-regions-fixed.sh
```

**Expected output**:
```
Extracting regional shapefiles...
Processing region PH01 (Ilocos Region)...
Processing region PH02 (Cagayan Valley)...
...
Processing region PH19 (BARMM)...
Done! 17 regions processed.
Files generated in ../2023/geojson/regions/ and ../2023/topojson/regions/
```

**Time**: ~2-3 minutes

**Files generated**: 102 files (51 GeoJSON + 51 TopoJSON)

### Step 3: Provincial Level (Municipalities per Province)

This generates 88 provincial maps, each showing municipalities/cities within that province.

```bash
./topojson-provdists-fixed.sh
```

**Expected output**:
```
Extracting provincial shapefiles...
Processing province PH13 (NCR)...
Processing province PH0128 (Ilocos Norte)...
...
Done! 88 provinces/districts processed.
Files generated in ../2023/geojson/provdists/ and ../2023/topojson/provdists/
```

**Time**: ~5-7 minutes

**Files generated**: 528 files (264 GeoJSON + 264 TopoJSON)

### Step 4: Municipal Level (Barangays per Municipality)

This generates 1,642 municipal maps, each showing barangays within that municipality.

**Note**: This is the longest step (~20 minutes).

```bash
# Optional: Run in background with logging
./topojson-municities-fixed.sh > municities-build.log 2>&1 &

# Get the process ID
echo $!

# Monitor progress
tail -f municities-build.log
```

**Or run in foreground**:
```bash
./topojson-municities-fixed.sh
```

**Expected output**:
```
Extracting municipal shapefiles...
Processing 1,642 municipalities...
[1/1642] Processing municipality 1001301000...
[2/1642] Processing municipality 1001302000...
...
[1642/1642] Processing municipality 1903909000...
Done! 1,642 municipalities processed.
Files generated in ../2023/geojson/municities/ and ../2023/topojson/municities/
```

**Time**: ~20-25 minutes

**Files generated**: 9,852 files (4,926 GeoJSON + 4,926 TopoJSON)

### Complete Build Command

To run all steps sequentially:

```bash
cd scripts

# Run all scripts in order
./topojson-country.sh && \
./topojson-regions-fixed.sh && \
./topojson-provdists-fixed.sh && \
./topojson-municities-fixed.sh

echo "Build complete! Total time: ~23-30 minutes"
```

---

## Verification

### Check Generated Files

```bash
# Navigate back to repository root
cd ..

# Count generated files
find 2023/geojson -type f -name "*.json" | wc -l
# Should show: 5,244

find 2023/topojson -type f -name "*.json" | wc -l
# Should show: 5,244

# Total: 10,488 files
```

### Check File Sizes

```bash
# Check total output size
du -sh 2023/
# Should show: ~489 MB

# Check individual directories
du -sh 2023/geojson/
# Should show: ~356 MB

du -sh 2023/topojson/
# Should show: ~133 MB
```

### Verify Sample Files

```bash
# Test country file is valid JSON
jq empty 2023/geojson/country/lowres/country.0.001.json && echo "✓ Valid JSON"

# Check number of regions in country file
jq '.features | length' 2023/geojson/country/lowres/country.0.001.json
# Should show: 17

# Check a regional file
jq '.features | length' 2023/geojson/regions/lowres/provdists-region-ph13.0.001.json
# Should show: 17 (NCR has 17 cities/districts)

# View properties of first feature
jq '.features[0].properties' 2023/geojson/country/lowres/country.0.001.json
```

### Test with Web Demo

```bash
# Start a local server
python3 -m http.server 8000

# Open browser to:
# http://localhost:8000/public/demos/

# Test all 4 demo pages:
# - Country (17 regions)
# - Regions (88 provinces)
# - Provinces (1,642 municipalities)
# - Municipalities (barangays by municipality)
```

---

## Troubleshooting

### Issue: "ogr2ogr: command not found"

**Solution**:
```bash
# macOS
brew install gdal

# Ubuntu/Debian
sudo apt-get install gdal-bin

# Verify
ogr2ogr --version
```

### Issue: "mapshaper: command not found"

**Solution**:
```bash
# Install Node.js first if needed
node --version || brew install node  # macOS
node --version || sudo apt-get install nodejs npm  # Ubuntu

# Install mapshaper globally
npm install -g mapshaper

# Verify
mapshaper --version
```

### Issue: "Cannot find phl_shapefiles.zip"

**Solution**:
```bash
# Check if file exists in repository root
ls -lh phl_shapefiles.zip

# If not, download from UN OCHA
# See "Download Source Data" section above
```

### Issue: "Permission denied" when running scripts

**Solution**:
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run again
cd scripts
./topojson-country.sh
```

### Issue: Build fails midway through

**Check errors**:
```bash
# Review error messages in log
tail -100 municities-build.log

# Common issues:
# - Disk space full: df -h
# - Memory issues: Check system monitor
# - Corrupted shapefile: Re-download source
```

**Resume from failure**:
```bash
# Scripts are idempotent - safe to re-run
# They will skip existing files or overwrite

# Re-run specific step
./topojson-municities-fixed.sh
```

### Issue: "Invalid field name" errors

**Problem**: Using wrong script for shapefile type

**Solution**:
```bash
# For OCHA shapefiles (ADM*_PCODE fields)
./topojson-regions-fixed.sh      # ✓ Use -fixed scripts
./topojson-provdists-fixed.sh    # ✓
./topojson-municities-fixed.sh   # ✓

# For PSGC shapefiles (adm*_psgc fields)
./topojson-regions.sh            # ✓ Use original scripts
./topojson-provdists.sh          # ✓
./topojson-municities.sh         # ✓
```

### Issue: Output files are too large

This is expected for high-resolution files. Solutions:

**Use low-resolution files**:
```bash
# For web use, low resolution is usually sufficient
# Example: country.0.001.json (smallest)
```

**Enable gzip compression** on your web server:
```nginx
# nginx example
gzip on;
gzip_types application/json;
```

### Issue: Process is taking too long

**Check progress**:
```bash
# Watch log file
tail -f municities-build.log

# Count completed files
find 2023/geojson/municities/hires -name "*.json" | wc -l
# Compare to total: 1,642
```

**Run on faster machine**:
- Barangay processing is CPU and I/O intensive
- Consider running on a machine with SSD storage
- More RAM helps (8 GB+ recommended)

---

## Advanced Options

### Customize Simplification Levels

Edit the scripts to change simplification percentages:

```bash
# Edit script
nano scripts/topojson-regions-fixed.sh

# Find and modify these lines:
mapshaper ... -simplify 10% ...   # High resolution (0.1)
mapshaper ... -simplify 1% ...    # Medium resolution (0.01)
mapshaper ... -simplify 0.1% ...  # Low resolution (0.001)

# Change percentages as needed
# Examples:
# - 20% for even higher detail
# - 0.05% for ultra-low resolution
```

### Generate Only Specific Levels

```bash
# Only country level
./topojson-country.sh

# Only regions and provinces
./topojson-regions-fixed.sh && ./topojson-provdists-fixed.sh

# Skip barangays if not needed (saves ~20 minutes)
```

### Generate Only Specific Resolutions

Modify scripts to comment out unwanted resolutions:

```bash
# Edit script
nano scripts/topojson-regions-fixed.sh

# Comment out lines you don't need:
# mapshaper ... -simplify 10% ...  # Skip high resolution
mapshaper ... -simplify 1% ...      # Keep medium
mapshaper ... -simplify 0.1% ...    # Keep low
```

### Process Specific Regions/Provinces Only

Edit the scripts to filter specific administrative units:

```bash
# Edit script
nano scripts/topojson-regions-fixed.sh

# Find the loop that processes all regions
# Add a condition to process only specific ones:
if [[ "$PCODE" == "ph13" ]] || [[ "$PCODE" == "ph01" ]]; then
    # Process only NCR and Region I
    ...
fi
```

### Parallel Processing

For faster builds on multi-core systems:

```bash
# Install GNU Parallel
brew install parallel  # macOS
sudo apt-get install parallel  # Ubuntu

# Modify scripts to use parallel
# Example: Process multiple municipalities simultaneously
cat municipality_codes.txt | parallel -j 4 ./process_municipality.sh {}
# -j 4 = use 4 CPU cores
```

### Custom Output Directories

```bash
# Set environment variable before running
export OUTPUT_DIR="/custom/path/2023"
./topojson-country.sh

# Or modify scripts directly
nano scripts/topojson-country.sh
# Change: OUTPUT="../2023"
# To: OUTPUT="/custom/path/2023"
```

---

## Build Summary

After completing all steps, you should have:

### Generated Files

| Level | Description | Files | GeoJSON Size | TopoJSON Size |
|-------|-------------|-------|--------------|---------------|
| 0 | Country (regions) | 6 | ~300 KB | ~100 KB |
| 1 | Regions (provinces) | 102 | ~5 MB | ~2 MB |
| 2 | Provinces (municipalities) | 528 | ~50 MB | ~20 MB |
| 3 | Municipalities (barangays) | 9,852 | ~300 MB | ~110 MB |
| **Total** | **All levels** | **10,488** | **~356 MB** | **~133 MB** |

### Directory Structure

```
2023/
├── geojson/
│   ├── country/
│   │   ├── hires/ (2 files)
│   │   ├── medres/ (2 files)
│   │   └── lowres/ (2 files)
│   ├── regions/ (51 files per resolution)
│   ├── provdists/ (264 files per resolution)
│   └── municities/ (4,926 files per resolution)
└── topojson/
    └── [same structure as geojson]
```

### Cleanup (Optional)

After successful build, you can remove intermediate files to free up disk space.

**Intermediate build files** (~1.5 GB each):
- `2023/processed/` - Extracted shapefiles and intermediate conversions
- `public/2023/processed/` - Duplicate processed files
- `scripts/2023/processed/` - Build script workspace

```bash
# Check size before cleanup
du -sh 2023/processed/ public/2023/processed/
# Should show: ~1.5G each

# Remove all processed directories
rm -rf 2023/processed/
rm -rf public/2023/processed/
rm -rf scripts/2023/processed/

# Remove intermediate GeoJSON (if exists)
rm -rf scripts/2023/geojson/
rm -rf scripts/2023/topojson/

# Keep only final output in 2023/geojson/ and 2023/topojson/
```

**Note**: These directories are excluded in `.gitignore` and can be safely deleted. The build scripts will recreate them if you run the build process again.

---

## Next Steps

### 1. Test the Maps

```bash
# Start local server
python3 -m http.server 8000

# Open demos
open http://localhost:8000/public/demos/
```

### 2. Deploy to Web

See **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for instructions on deploying to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Azure Static Web Apps

### 3. Use in Your Project

See **[README.md](README.md)** for usage examples with:
- Leaflet.js
- D3.js
- React
- Vue
- Angular

### 4. Customize Web Component

See **[DEMO_GUIDE.md](DEMO_GUIDE.md)** for:
- Web component API
- Custom styling
- Data integration
- Framework integration

---

## Additional Resources

- **README.md** - Project overview and quick start
- **CLAUDE.md** - Technical documentation for developers
- **BUILD_SUMMARY.md** - Build statistics and completion status
- **DOWNLOAD_SOURCE_DATA.md** - Detailed source data download instructions
- **CHANGELOG.md** - Version history and changes

## Support

Need help?

- **Issues**: https://github.com/98labs/philippines-json-maps/issues
- **Discussions**: https://github.com/98labs/philippines-json-maps/discussions
- **Email**: See GitHub profile

---

**Last Updated**: October 16, 2024
**Build Version**: 2.0.0
**Data Version**: PSGC Q4 2023
