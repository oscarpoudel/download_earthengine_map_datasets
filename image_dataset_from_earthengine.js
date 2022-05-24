//upload the shape file of required area from Assets --> new --> select shape file
bhaktapur = ee.FeatureCollection("users/oscarPoudel/bhaktapur");
kathmandu = ee.FeatureCollection("users/oscarPoudel/kathmandu");
lalitpur = ee.FeatureCollection("users/oscarPoudel/lalitpur");

var bhkmerged= bhaktapur
var bhkmerged=bhkmerged.merge(kathmandu);
var bhkmerged=bhkmerged.merge(lalitpur);
//Enter start data here (must be same format)
var start = "04/10/2007";
//Enter end month for map bracket here
var end = "06/25/2007";
//Enter end year here
var upto_year = 2015;
//Enter the image database landsat8:"LANDSAT/LC08/C02/T1_L2" 
// landsat7:"LANDSAT/LE07/C02/T1_L2"
//sentinal2:"COPERNICUS/S2_SR"
var img_dat='LANDSAT/LE07/C02/T1_L2';

//Enter name for dataset (L7 or L8 or sen-2)
var dset = "_L7";

//Enter properties to filter 
//cloudcovers(Landsat7:'CLOUD_COVER_LAND',Sentinal2:'CLOUDY_SHADOW_PERCENTAGE')
//Examples : https://developers.google.com/earth-engine/datasets/catalog/LANDSAT_LE07_C02_T1_L2#image-properties
var prop = 'CLOUD_COVER'

//__________________________________________________________________________\\
var start_years = []
var end_years = []
var st_month = []
var end_month = []
var st_yr =new Date(start)

for (var i =st_yr.getFullYear();i<upto_year;i++){
    start_years.push(start.substring(0,6)+i)
    end_years.push(end.substring(0,6)+i)
}
function getFormattedDate(date1) {
    var year = date1.getFullYear();
    var month = (1 + date1.getMonth()).toString();
    var day = date1.getDate().toString();
    return year + '-' + month + '-' + day;
}
for (var j =0;j<start_years.length;j++){
    var mydate1 = new Date(start_years[j]);
    var mydate2 = new Date(end_years[j]);
    st_month.push(getFormattedDate(mydate1));
    end_month.push(getFormattedDate(mydate2));
}


for(i=0;i<end_month.length;i++){
    console.log("start month:"+st_month[i])
    console.log("End month:"+end_month[i])
    var dataset = ee.ImageCollection(img_dat)
    .filterBounds(bhkmerged)
    .filterDate(st_month[i], end_month[i])
    .filter(ee.Filter.lt(prop, 30))
    ;
    
    dataset = dataset.map(applyScaleFactors);
    var mosc = dataset.mosaic();
    var landsatb = dataset.median().clip(bhaktapur);
    var landsatl = dataset.median().clip(lalitpur);
    var landsatk = dataset.median().clip(kathmandu);
  var img_fill1 = landsatb.focal_mean(1, 'square', 'pixels', 8);
  var img_fill2 = landsatl.focal_mean(1, 'square', 'pixels', 8);
  var img_fill3 = landsatk.focal_mean(1, 'square', 'pixels', 8);
 Export.image.toDrive({
  image: img_fill1.blend(landsatb).clip(bhaktapur),
  description:i+dset+"_Bhaktapur_"+st_month[i].replace(/[&\/\\]/g, ''),
  scale:30,
  region:bhaktapur,
  folder:'gis',
})
 Export.image.toDrive({
  image: img_fill2.blend(landsatk).clip(kathmandu),
  description:i+dset+"_Kathmandu_"+st_month[i].replace(/[&\/\\]/g, ''),
  scale:30,
  region:kathmandu,
  folder:'gis',
})
 Export.image.toDrive({
  image: img_fill3.blend(landsatl).clip(lalitpur),
  description:i+dset+"_lalitpur_"+st_month[i].replace(/[&\/\\]/g, ''),
  scale:30,
  region:lalitpur,
  folder:'gis',
})
console.log("_______Date__"+st_month[i]+" done !!!________")
}

// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}

var dataset2 = ee.ImageCollection(img_dat)
    .filterDate('2007-4-10', '2007-6-25')
    .filter(ee.Filter.lt(prop, 30))
    .filterBounds(bhkmerged);
    dataset2 = dataset2.map(applyScaleFactors);
    var landsatbhktpur = dataset2.median().clip(bhkmerged);
    var landfinal=landsatbhktpur.focal_mean(1.5, 'square', 'pixels', 8);
    var landfinal2=landfinal.blend(landsatbhktpur).clip(bhkmerged);
    //var landfinal = landsatbhktpur.blend(dataset2).clip(bhaktapur)
    //var landsatl = dataset.median().clip(lalitpur);
    //var landsatk = dataset.median().clip(kathmandu);
    

var visualization = {
  bands: ['SR_B5', 'SR_B4', 'SR_B3'],
  min: 0,
  max: 0.3,
};
Map.setCenter(85.3287, 27.7259,12);
Map.addLayer(landfinal2, visualization, 'bhaktapur (432)');
//Map.addLayer(landsatl, visualization, 'lalitpur (432)');
//Map.addLayer(landsatk, visualization, 'kathmandu (432)');
