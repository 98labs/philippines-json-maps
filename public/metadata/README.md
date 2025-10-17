# Metadata Directory

This directory contains administrative unit metadata for the Philippines in CSV format.

## Files

### municipalities.csv

Complete list of all 1,642 municipalities and cities in the Philippines.

**Size**: 54 KB
**Records**: 1,642
**Last Updated**: October 16, 2024
**Data Version**: PSGC Q4 2023

**Fields**:
- `ADM3_PCODE` - Municipality/City code (unique identifier)
- `ADM3_EN` - Municipality/City name (English)
- `ADM2_PCODE` - Parent province/district code
- `ADM2_EN` - Parent province/district name
- `ADM1_PCODE` - Parent region code
- `ADM1_EN` - Parent region name

**Sample Row**:
```csv
ADM3_PCODE,ADM3_EN,ADM2_PCODE,ADM2_EN,ADM1_PCODE,ADM1_EN
1380300000,Quezon City,ph13,National Capital Region,ph13,National Capital Region
```

**Use Cases**:
- Building municipality/city dropdown selectors
- Looking up municipality names from codes
- Finding which province a municipality belongs to
- Filtering municipalities by region
- Data validation and verification

---

### provinces.csv

Complete list of all 88 provinces and districts in the Philippines.

**Size**: 4.4 KB
**Records**: 88
**Last Updated**: October 16, 2024
**Data Version**: PSGC Q4 2023

**Fields**:
- `ADM2_PCODE` - Province/District code (unique identifier)
- `ADM2_EN` - Province/District name (English)
- `ADM1_PCODE` - Parent region code
- `ADM1_EN` - Parent region name

**Sample Row**:
```csv
ADM2_PCODE,ADM2_EN,ADM1_PCODE,ADM1_EN
ph13,National Capital Region,ph13,National Capital Region
```

**Use Cases**:
- Building province/district dropdown selectors
- Looking up province names from codes
- Finding which region a province belongs to
- Navigation between administrative levels
- Data validation and verification

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Load municipalities
fetch('public/metadata/municipalities.csv')
    .then(response => response.text())
    .then(csvText => {
        const rows = csvText.split('\n');
        const headers = rows[0].split(',');
        const data = rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header] = values[index];
                return obj;
            }, {});
        });
        console.log(data);
    });
```

### Python (pandas)

```python
import pandas as pd

# Load municipalities
municipalities = pd.read_csv('public/metadata/municipalities.csv')
print(municipalities.head())

# Filter by region
ncr_munis = municipalities[municipalities['ADM1_PCODE'] == 'ph13']
print(ncr_munis)

# Group by province
by_province = municipalities.groupby('ADM2_EN').size()
print(by_province)
```

### Node.js (csv-parser)

```javascript
const fs = require('fs');
const csv = require('csv-parser');

const municipalities = [];

fs.createReadStream('public/metadata/municipalities.csv')
    .pipe(csv())
    .on('data', (row) => {
        municipalities.push(row);
    })
    .on('end', () => {
        console.log(`Loaded ${municipalities.length} municipalities`);

        // Find municipalities in NCR
        const ncrMunicipalities = municipalities.filter(
            m => m.ADM1_PCODE === 'ph13'
        );
        console.log(`NCR has ${ncrMunicipalities.length} cities`);
    });
```

### Excel/Google Sheets

Simply open the CSV files in Excel or Google Sheets for viewing and analysis:
- Use Data > Text to Columns if needed
- Apply filters to find specific records
- Create pivot tables for analysis
- Use VLOOKUP for data joining

---

## Data Source

Both files are derived from:
- **UN OCHA - Humanitarian Data Exchange**
- **Philippine Statistics Authority (PSA) - PSGC**
- **Data Version**: Q4 2023 (December 31, 2023)
- **Projection**: EPSG:4326 (WGS84)

---

## Related Files

Map files corresponding to this metadata are available in the `2023/` directory:

- **Country level**: `2023/geojson/country/` (17 regions)
- **Regional level**: `2023/geojson/regions/` (88 provinces per region)
- **Provincial level**: `2023/geojson/provdists/` (1,642 municipalities per province)
- **Municipal level**: `2023/geojson/municities/` (42,048 barangays per municipality)

Each level has 3 resolutions (hires, medres, lowres) in both GeoJSON and TopoJSON formats.

---

## Administrative Hierarchy

```
Country (Philippines)
    └── Regions (17)
        └── Provinces/Districts (88)
            └── Municipalities/Cities (1,642)
                └── Barangays (42,048)
```

**Key Codes**:
- **ph01-ph19**: Region codes (ph15 and ph18 not used)
- **ph01-ph19 + digits**: Province codes
- **10-digit numbers**: Municipality codes (e.g., 1380300000 for Quezon City)

---

## Updates

These metadata files are updated when new PSGC data is released by PSA, typically quarterly. Check the [PSA website](https://psa.gov.ph/classification/psgc/) for the latest PSGC updates.

For questions or corrections, please [open an issue](https://github.com/98labs/philippines-json-maps/issues) on GitHub.
