// Edit the initial year and number of tabs to match your GeoJSON data and tabs in index.html
var year = "1900";
var tabs = 12;

// Edit the center point and zoom level
var map = L.map('map', {
  center: [41.79, -72.6],
  zoom: 10,
  scrollWheelZoom: false
});

// Edit links to your GitHub repo and data source credit
map.attributionControl.setPrefix('View \
  <a href="http://github.com/jackdougherty/otl-racial-change" target="_blank"> \
  data and code on GitHub</a>, created with <a href="http://leafletjs.com" \
  title="A JS library for interactive maps">Leaflet</a>; design by \
  <a href="http://ctmirror.org">CT Mirror</a>');

// Basemap layer
new L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright"> \
  OpenStreetMap</a> contributors, &copy; \
  <a href="http://cartodb.com/attributions">CartoDB</a>'
}).addTo(map);

// Edit to upload GeoJSON data from layers folder
$.getJSON("layers/" + year + ".geojson", function (data) {
  geoJsonLayer = L.geoJson(data, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);
});

// places a star on state capital of Hartford, CT
var starIcon = L.icon({
  iconUrl: 'star-18.png',
  iconRetinaUrl: 'star-18@2x.png',
  iconSize: [18, 18]
});
L.marker([41.764, -72.682], {icon: starIcon}).addTo(map);

// Edit range cutoffs and colors to match your data; see http://colorbrewer.org
// Any values not listed in the ranges below displays as the last color
function getColor(d) {
  return d > 2.0 ? '#006d2c' :
         d > 1.5 ? '#31a354' :
         d > 1.0 ? '#74c476' :
         d > 0.5 ? '#bae4b3' :
         d > 0.1 ? '#edf8e9' :
                   'gray' ;
}

// Edit the getColor property to match data properties in your GeoJSON layers
// In this example, columns follow this pattern: index1910, index1920...
function style(feature) {
  return {
    fillColor: getColor(parseFloat(feature.properties.temp)),
    weight: 1,
    opacity: 1,
    color: 'black',
    fillOpacity: 0.9
  };
}

// This highlights the polygon on hover, also for mobile
function highlightFeature(e) {
  resetHighlight(e);
  var layer = e.target;
  layer.setStyle({
    weight: 4,
    color: 'black',
    fillOpacity: 0.7
  });
  info.update(layer.feature.properties);
}

// This resets the highlight after hover moves away
function resetHighlight(e) {
  geoJsonLayer.setStyle(style);
  info.update();
}

// This instructs highlight and reset functions on hover movement
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: highlightFeature
  });
}

// Creates an info box on the map
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// Edit info box labels (such as props.name) to match properties of the GeoJSON data
info.update = function (props) {
  var areaName = "Hover over areas";
  var areaLabel = "Percent White";
  var areaValue = "--";

  if (props) {
    areaName = props.name;
    areaValue = checkNull(props.temp);
  }

  this._div.innerHTML = '<div class="areaName">' + areaName +
    '</div><div class="areaLabel"><div class="areaValue">' + areaLabel +
    '</div>' + areaValue + '</div>';
};
info.addTo(map);

// When a new tab is selected, this removes/adds the GeoJSON data layers
$(".tabItem").click(function() {
  $(".tabItem").removeClass("selected");
  $(this).addClass("selected");
  year = $(this).html();
  // year = $(this).html().split("-")[1];  /* use for school years, eg 2010-11 */

  map.removeLayer(geoJsonLayer);

  $.getJSON("layers/" + year + ".geojson", function (data) {
    geoJsonLayer = L.geoJson(data, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
  });

  geoJsonLayer.setStyle(style);
});

// Edit grades in legend to match the range cutoffs inserted above
// In this example, the last grade will appear as "2+"
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0.1, 0.5, 1.0, 1.5, 2],
    labels = [],
    from, to;
  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];
    // manually inserted from + 0.1 to start one step above default 0 = white color
    labels.push(
      '<i style="background:' + getColor(from + 0.1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }
  div.innerHTML = labels.join('<br>');
  return div;
};
legend.addTo(map);

// In info.update, this checks if GeoJSON data contains a null value, and if so displays "--"
function checkNull(val) {
  if (val != null || val == "NaN") {
    return comma(val);
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed as a percentage
function checkThePct(a,b) {
  if (a != null && b != null) {
    return Math.round(a/b*1000)/10 + "%";
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed with commas (such as 123,456)
function comma(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}

// This watches for arrow keys to advance the tabs
$("body").keydown(function(e) {
    var selectedTab = parseInt($(".selected").attr('id').replace('tab', ''));
    var nextTab;

    // previous tab with left arrow
    if (e.keyCode == 37) {
        nextTab = (selectedTab == 1) ? tabs : selectedTab - 1;
    }
    // next tab with right arrow
    else if (e.keyCode == 39)  {
        nextTab = (selectedTab == tabs) ? 1 : selectedTab + 1;
    }

    $('#tab' + nextTab).click();
});
