// Store our API endpoint as queryUrl.
let queryUrl = "https://coronavirus.m.pipedream.net";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.rawData object to the createFeatures function.
  createFeatures(data.rawData);
});

// Create a function for marker size based on country
function markerSize(Deaths) {
  let deathCount = parseInt(Deaths);
  if (deathCount > 0) {
    return Math.log(deathCount) *2;
  } else {
    return 0;
  }
}

// Function to determine marker color by death
function markerColor(Deaths) {
  let deathCount = parseInt(Deaths);
  if(deathCount > 100000) {
      return "#ea2c2c";
  }
  else if (deathCount > 90000) {
      return "#ea822c";
  }
  else if (deathCount > 75000) {
      return "#eec400";
  }
  else if (deathCount > 50000) {
      return "#d5ee00";
  }
  else if (deathCount > 25000) {
      return "#bdd500";
  }
  else {
      return "#67a200";
  }
}

function createFeatures(covidData) {
  // Transform the covidData array into GeoJSON format
// Transform the covidData array into GeoJSON format
  let geoData = covidData.map(function (item) {
  // Parse the coordinates and skip if invalid
  let latitude = parseFloat(item.Lat);
  let longitude = parseFloat(item.Long_);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return null;
  }

  return {
    type: "Feature",
    properties: item,  // Keep the properties as they are
    geometry: {
      type: "Point",
      coordinates: [longitude, latitude]  // Create geometry
    }
  };
}).filter(Boolean);

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place death rate.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h1>Location: ${feature.properties.Country_Region}</h1><hr><h3>Deaths: ${feature.properties.Deaths}</h3>`);
  }

  // Create a GeoJSON layer that contains the features array on the covidData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let covidDeaths = L.geoJSON(geoData, {
    pointToLayer: function(feature, _) {
      // feature.geometry.coordinates contains [longitude, latitude], not [latitude, longitude]
      let coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
      return L.circleMarker(coordinates, {
        radius: markerSize(feature.properties.Deaths),
        fillColor: markerColor(feature.properties.Deaths),
        fillOpacity: 0.6,
        color: markerColor(feature.properties.Deaths),
        stroke: true,
        weight: 0.9
      });
    },
    onEachFeature: onEachFeature
  });

  // Send our covidDeaths layer to the createMap function.
  createMap(covidDeaths);
}

function createMap(covidDeaths) {

// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

let terrain = L.tileLayer('http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
});

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Terrain Map": terrain
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    covidDeaths: covidDeaths
  };

  // Create our map, giving it the streetmap and coviddeaths layers to display on load.
  let myMap = L.map("map", {
    center: [
      0, 0
    ],
    zoom: 2,
    layers: [street, covidDeaths]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

};