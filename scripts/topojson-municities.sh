#!/usr/bin/env bash

SHAPEFILE="2023/processed"
GEOJSON="2023/geojson/municities"
TOPOJSON="2023/topojson/municities"

unzip -o $SHAPEFILE/PH_Adm4_BgySubMuns.shp.zip -d $SHAPEFILE/municities/

rm -rf $GEOJSON/*
rm -rf $TOPOJSON/*
mkdir -p $GEOJSON/hires
mkdir -p $GEOJSON/medres
mkdir -p $GEOJSON/lowres
mkdir -p $TOPOJSON/hires
mkdir -p $TOPOJSON/medres
mkdir -p $TOPOJSON/lowres

echo "[MUNICITIES] Generating Municipality and City List"
ogr2ogr -f CSV -select ADM3_PCODE municities_raw.csv $SHAPEFILE/provdists/phl_admbnda_adm3_psa_namria_20231106.shp
sed 1d municities_raw.csv > municities.csv # Remove header
rm municities_raw.csv
array=()

# Read the file in parameter and fill the array named "array"
getArray() {
  i=0
  while read line # Read a line
  do
    array[i]=$line # Put it into the array
    i=$(($i + 1))
  done < $1
}

echo "[MUNICITIES] Reading Array"
getArray "municities.csv"

for e in "${!array[@]}"
do
  f=`echo ${array[$e]} | tr -dc '[:alnum:]\n\r' | tr '[:upper:]' '[:lower:]'`
  echo "[BGYSUBMUNS] Processing $f"
  ogr2ogr -mapFieldType Date=String -where "ADM3_PCODE='$f'" -t_srs "EPSG:4326" -f GeoJSON $GEOJSON/bgysubmuns-municity-${f}.json $SHAPEFILE/municities/phl_admbnda_adm4_psa_namria_20231106.shp

  mapshaper $GEOJSON/bgysubmuns-municity-${f}.json -simplify 10% -o format=geojson id-field=ADM4_PCODE $GEOJSON/hires/bgysubmuns-municity-${f}.0.1.json
  mapshaper $GEOJSON/bgysubmuns-municity-${f}.json -simplify 1% -o format=geojson id-field=ADM4_PCODE $GEOJSON/medres/bgysubmuns-municity-${f}.0.01.json
  mapshaper $GEOJSON/bgysubmuns-municity-${f}.json -simplify 0.1% -o format=geojson id-field=ADM4_PCODE $GEOJSON/lowres/bgysubmuns-municity-${f}.0.001.json

  mapshaper $GEOJSON/bgysubmuns-municity-${f}.json -simplify 10% -o format=topojson id-field=ADM4_PCODE $TOPOJSON/hires/bgysubmuns-municity-${f}.topo.0.1.json
  mapshaper $GEOJSON/bgysubmuns-municity-${f}.json -simplify 1% -o format=topojson id-field=ADM4_PCODE $TOPOJSON/medres/bgysubmuns-municity-${f}.topo.0.01.json
  mapshaper $GEOJSON/bgysubmuns-municity-${f}.json -simplify 0.1% -o format=topojson id-field=ADM4_PCODE $TOPOJSON/lowres/bgysubmuns-municity-${f}.topo.0.001.json

  rm $GEOJSON/bgysubmuns-municity-${f}.json # Delete because this is a large file
done

rm municities.csv
