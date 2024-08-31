function markersize(mag) {
    let radius = 1;

    if (mag > 0) {
        radius = mag ** 7;
    }

    return radius
}

function chooseColor(depth) {
    let color = "black";

    if (depth <= 10) {
        color = "#98EE00";
      } else if (depth <= 30) {
        color = "#D4EE00";
      } else if (depth <= 50) {
        color = "#EECC00";
      } else if (depth <= 70) {
        color = "#EE9C00";
      } else if (depth <= 90) {
        color = "#EA822C";
      } else {
        color = "#EA2C2C";
      }

    return (color);
    
}

function createMap(data, geo_data) {
    
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    
      let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });

    let markers = L.markerClusterGroup();
    let heatArray = [];
    let circleArray = [];

    for (let i = 0; i < data.length; i++){
        let row = data[i];
        let location = row.geometry;

        if (location) {
            let point = [location.coordinates[1], location.coordinates[0]];

            let marker = L.marker(point);
            let popup = `<h1>${row.properties.title}</h1>`;
            marker.bindPopup(popup);
            markers.addLayer(marker);

            heatArray.push(point);

            let circleMarker = L.circle(point, {
                fillOpacity: 0.75,
                color: chooseColor(location.coordinates[2]),
                fillColor: chooseColor(location.coordinates[2]),
                radius: markersize(row.properties.mag)
            }).bindPopup(popup);

            circleArray.push(circleMarker);
        }
    }

    let heatLayer = L.heatLayer(heatArray, {
        radius: 25,
        blur: 20
    });

    let circleLayer = L.layerGroup(circleArray);

    let geo_layer = L.geoJSON(geo_data, {
        style: {
            "color": "firebrick",
            "weight": 5
        }
    });

    let baseLayers = {
        Street: street,
        Topography: topo
    };

    let overlayLayers = {
        Markers: markers,
        Heatmap: heatLayer,
        Circles: circleLayer,
        "Tectonic Plates": geo_layer
    }

    let myMap = L.map("map", {
        center: [40.7, -94.5],
        zoom:3,
        layers: [street, markers, geo_layer]
    });


    L.control.layers(baseLayers, overlayLayers).addTo(myMap);

    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");

        let legendInfo = "<h4>Legend</h4>";
        legendInfo += "<i style='background: #98EE00'></i>-10-10<br/>";
        legendInfo += "<i style='background: #D4EE00'></i>10-30<br/>";
        legendInfo += "<i style='background: #EECC00'></i>30-50<br/>";
        legendInfo += "<i style='background: #EE9C00'></i>50-70<br/>";
        legendInfo += "<i style='background: #EA822C'></i>70-90<br/>";
        legendInfo += "<i style='background: #EA2C2C'></i>90+";
    
        div.innerHTML = legendInfo;
        return div;
    };

    legend.addTo(myMap);
}

function doWork() {

    let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    let url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

    d3.json(url).then(function (data) {
        d3.json(url2).then(function (geo_data) {
            let data_rows = data.features;

            createMap(data_rows, geo_data);
        });
    });
}

doWork();