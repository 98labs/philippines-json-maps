#!/usr/bin/env bash

SHAPEFILE="2023/processed"
GEOJSON="2023/geojson/provdists"
TOPOJSON="2023/topojson/provdists"

unzip -o $SHAPEFILE/PH_Adm3_MuniCities.shp.zip -d $SHAPEFILE/provdists/

rm -rf $GEOJSON/*
rm -rf $TOPOJSON/*
mkdir -p $GEOJSON/hires
mkdir -p $GEOJSON/medres
mkdir -p $GEOJSON/lowres
mkdir -p $TOPOJSON/hires
mkdir -p $TOPOJSON/medres
mkdir -p $TOPOJSON/lowres

echo "[PROVDISTS] Generating Province and District List"
ogr2ogr -f CSV -select ADM2_PCODE provdists_raw.csv $SHAPEFILE/regions/phl_admbnda_adm2_psa_namria_20231106.shp
sed 1d provdists_raw.csv > provdists.csv # Remove header
rm provdists_raw.csv
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

echo "[PROVDISTS] Reading Array"
getArray "provdists.csv"

for e in "${!array[@]}"
do
  f=`echo ${array[$e]} | tr -dc '[:alnum:]\n\r' | tr '[:upper:]' '[:lower:]'`
  echo "[MUNICITIES] Processing $f"
  ogr2ogr -mapFieldType Date=String -where "ADM2_PCODE='$f'" -t_srs "EPSG:4326" -f GeoJSON $GEOJSON/municities-provdist-${f}.json $SHAPEFILE/provdists/phl_admbnda_adm3_psa_namria_20231106.shp

  mapshaper $GEOJSON/municities-provdist-${f}.json -simplify 10% -o format=geojson id-field=ADM3_PCODE $GEOJSON/hires/municities-provdist-${f}.0.1.json
  mapshaper $GEOJSON/municities-provdist-${f}.json -simplify 1% -o format=geojson id-field=ADM3_PCODE $GEOJSON/medres/municities-provdist-${f}.0.01.json
  mapshaper $GEOJSON/municities-provdist-${f}.json -simplify 0.1% -o format=geojson id-field=ADM3_PCODE $GEOJSON/lowres/municities-provdist-${f}.0.001.json

  mapshaper $GEOJSON/municities-provdist-${f}.json -simplify 10% -o format=topojson id-field=ADM3_PCODE $TOPOJSON/hires/municities-provdist-${f}.topo.0.1.json
  mapshaper $GEOJSON/municities-provdist-${f}.json -simplify 1% -o format=topojson id-field=ADM3_PCODE $TOPOJSON/medres/municities-provdist-${f}.topo.0.01.json
  mapshaper $GEOJSON/municities-provdist-${f}.json -simplify 0.1% -o format=topojson id-field=ADM3_PCODE $TOPOJSON/lowres/municities-provdist-${f}.topo.0.001.json

  rm $GEOJSON/municities-provdist-${f}.json # Delete because this is a large file
done

rm provdists.csv
