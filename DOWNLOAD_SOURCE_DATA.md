# Downloading Source Data

The source shapefiles are **not included** in this repository due to their large size (883 MB). If you need to regenerate the maps or access the original shapefiles, follow these instructions:

## 📥 Download from UN OCHA

**Source**: UN OCHA - Humanitarian Data Exchange
**Dataset**: Philippines - Subnational Administrative Boundaries
**Size**: 882 MB (zipped)
**Format**: Shapefiles (SHP)
**Last Updated**: November 6, 2023
**PSGC Version**: Q4 2023 (December 31, 2023)

### Direct Download Link

**Primary Source**:
```
https://data.humdata.org/dataset/philippines-administrative-boundaries
```

**Dataset ID**: `caf116df-f984-4deb-85ca-41b349d3f313`

### Download Steps

1. **Visit the UN OCHA HDX page**:
   - Go to: https://data.humdata.org/dataset/philippines-administrative-boundaries
   - Or search for "Philippines Administrative Boundaries" on https://data.humdata.org

2. **Download the shapefile package**:
   - Look for the main shapefile download (usually named `phl_admbnda_adm*.zip` or similar)
   - Click the download button
   - File size should be approximately 882 MB

3. **Save to repository root**:
   ```bash
   # Rename the downloaded file to:
   phl_shapefiles.zip

   # Place it in the root of this repository:
   philippines-json-maps/phl_shapefiles.zip
   ```

4. **Extract (optional)**:
   ```bash
   # The build scripts will extract automatically, but you can extract manually:
   unzip phl_shapefiles.zip -d phl_shapefiles_extracted/
   ```

## 📋 What's Included

The shapefile package contains administrative boundaries for:
- **Level 1**: 17 Regions
- **Level 2**: 88 Provinces/Districts
- **Level 3**: 1,642 Municipalities/Cities
- **Level 4**: 42,048 Barangays/Sub-municipalities

### Field Names (OCHA Format)

The OCHA shapefiles use these field names:
- `ADM1_PCODE` - Region code
- `ADM2_PCODE` - Province/District code
- `ADM3_PCODE` - Municipality/City code
- `ADM4_PCODE` - Barangay code
- `ADM*_EN` - English names
- `ADM*_PCODE` - Parent administrative unit codes
- `AREA_SQKM` - Area in square kilometers

## 🔧 Using the Source Data

Once downloaded, you can regenerate the maps using the build scripts:

```bash
cd scripts

# Use scripts for OCHA data
./topojson-country.sh
./topojson-regions.sh
./topojson-provdists.sh
./topojson-municities.sh
```

**Build Time**: Approximately 30 minutes total

## 🔄 Alternative Sources

### Option 1: PSGC Shapefiles (GitHub)

If you prefer shapefiles with PSGC field naming convention:

**Repository**: https://github.com/altcoder/philippines-psgc-shapefiles
**Format**: Shapefiles with `adm*_psgc` field names
**Note**: Requires original scripts (without `-fixed` suffix)

### Option 2: Official PSA Data

For the latest PSGC updates and official data:

**Philippine Statistics Authority (PSA)**:
- Website: https://psa.gov.ph/classification/psgc/
- PSGC Updates: https://psa.gov.ph/classification/psgc/downloads

**Note**: PSA provides PSGC codes but not necessarily shapefiles. Use for verification and latest code changes.

## ⚠️ Important Notes

1. **Do not commit `phl_shapefiles.zip` to Git**
   - File is added to `.gitignore`
   - Too large for GitHub (883 MB exceeds 100 MB limit)
   - Should be downloaded from source as needed

2. **Extracted files are also ignored**
   - `phl_shapefiles_extracted/` is in `.gitignore`
   - Build scripts will extract to `scripts/2023/processed/` automatically

3. **License and Attribution**
   - Source data is from UN OCHA
   - Based on PSA/NAMRIA official boundaries
   - Check UN OCHA HDX for specific license terms
   - Always provide proper attribution when using

## 🆘 Troubleshooting

### Download fails or file is corrupted

1. Try the direct UN OCHA link again
2. Check your internet connection
3. Verify file size (should be ~882 MB)
4. Use a download manager for large files

### Wrong file format

Make sure you download:
- ✅ Shapefiles (`.shp`, `.shx`, `.dbf`, `.prj` files in ZIP)
- ❌ Not GeoJSON or other formats

### Field names don't match

- OCHA data: Use `-fixed` scripts
- PSGC data: Use original scripts
- Check field names with `ogrinfo` before processing

### Build scripts fail

1. Ensure file is named exactly: `phl_shapefiles.zip`
2. Place in repository root (not in subdirectory)
3. Check that GDAL and mapshaper are installed
4. Review build logs for specific errors

## 📞 Support

If you encounter issues downloading or using the source data:

1. **Check UN OCHA Status**: https://data.humdata.org/
2. **Report Issues**: https://github.com/faeldon/philippines-json-maps/issues
3. **Discussions**: https://github.com/faeldon/philippines-json-maps/discussions

---

**Last Updated**: October 16, 2024
**Data Version**: PSGC Q4 2023 (December 31, 2023)
