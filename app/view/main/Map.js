
var projection_epsg_no = '900913';
// Set the variable for storing the workspace:layername
var coupureaerien_layername = 'test:elec_appareil_coupure_aerien_hta';
// Creating the full vectorTile url
var coupureaerien_url = '/geoserver/gwc/service/tms/1.0.0/' + coupureaerien_layername + '@EPSG%3A' + projection_epsg_no + '@pbf/{z}/{x}/{-y}.pbf';

var coupureaerien_source = new ol.source.VectorTile({
  tilePixelRatio: 1, // oversampling when > 1
  tileGrid: ol.tilegrid.createXYZ({maxZoom: 19}),
  format: new ol.format.MVT({dataProjection: 'EPSG: 900913'}),
  //defaultDataProjection: 'EPSG: 3297',
  url: coupureaerien_url,
});

var t_coupureaerien_source = new ol.source.VectorTile({
          format: new ol.format.MVT(),
          url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
            'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
        })

var coupureaerien_style = new ol.style.Style({
  image: new ol.style.RegularShape({
    points: 5,
    radius: 4,
    fill: new ol.style.Fill({
      color: '#0cc38c',
    }),
    stroke: new ol.style.Stroke({
      color: [0,0,0], width:1
    })
  })
});

var t_coupureaerien_style = new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({
          color: '#319FD3',
          width: 1
        }),
      });


var coupureaerien_layer = new ol.layer.VectorTile({
  title: 'Coupure Aerien HTA',
  style: coupureaerien_style,
  source: coupureaerien_source,
  });

var t_coupureaerien_layer = new ol.layer.VectorTile({
  title: 'Coupure Aerien HTA',
  style: t_coupureaerien_style,
  source: t_coupureaerien_source,
  });

var osm_source = new ol.source.OSM({
  url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
});
var osm_basemap = new ol.layer.Tile({
  title: 'OSM basemap',
  source: osm_source,
})

var view = new ol.View({
  center: ol.proj.fromLonLat([-149.3, -17.7]),
  zoom: 7
});

// var container = document.getElementById('popup');
// var content = document.getElementById('popup-content');
// var closer = document.getElementById('popup-closer');
//
// var overlay = new ol.Overlay({
//   element: container,
//   autoPan: true,
//   autoPanAnimation: {
//     duration: 250
//   }
// });
//
// closer.onclick = function() {
//   console.log("got here");
//   overlay.setPosition(undefined);
//   closer.blur();
//   return false;
// };
//
// var info = document.getElementById('info');
//
// function showInfo(event) {
//   var coordinate = event.coordinate;
//   console.log(coordinate);
//   var hdms = toStringHDMS(toLonLat(coordinate));
//   var features = window.map.getFeaturesAtPixel(event.pixel);
//   if (!features) {
//     info.innerText = '';
//     info.style.opacity = 0;
//     return;
//   }
//   var properties = features[0].getProperties();
//   console.log(properties);
//   content.innerText = JSON.stringify(properties, null, 2);
//   overlay.setPosition(coordinate);
//   //content.style.opacity = 1;
// }

window.my_map = new ol.Map({
  controls: ol.control.defaults().extend([new ol.control.ScaleLine]),
  target: 'map',
  view: view,
  layers: [
    new ol.layer.Group({
      title: 'Fond de plans',
      layers: [osm_basemap],
    }),
    new ol.layer.Group({
      title: 'Réseau Secosud',
      layers: [t_coupureaerien_layer]
    })
  ],
  //overlays: [overlay],
});

Ext.define('SIG.view.main.Map',{
    // extend: "Ext.panel.Panel",
    extend: "GeoExt.component.Map",
    xtype: 'mappanel',
    requires: [
        'SIG.view.main.MapController',
        'SIG.view.main.MapModel'
    ],

    controller: 'main-map',
    viewModel: {
        type: 'main-map'
    },
    // html: "Hello, World!!"
    map: window.my_map,
});

popup = Ext.create('GeoExt.component.Popup', {
  map: window.my_map,
  width: 140
});

window.my_map.on('click', function(evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
      coordinate, 'EPSG:3857', 'EPSG:4326')
  );
  // Insert a linebreak after either N or S in hdms
  hdms = hdms.replace(/([NS])/, '$1<br>');

  var features = window.my_map.getFeaturesAtPixel(evt.pixel);
  if (!features) {
    popup.setHtml('');
    //info.style.opacity = 0;
    return;
  }
  var properties = features[0].getProperties();
  console.log(properties);
  var attributes = JSON.stringify(properties, null, 2);
  // set content and position popup
  popup.setHtml('<p><strong>Pointer rested on</strong>' +
      '<br /><code>' + hdms + '</code></p>'+ attributes);
  popup.position(coordinate);
  popup.show();
});

// function showInfo(event) {
//   var coordinate = event.coordinate;
//   console.log(coordinate);
//   var hdms = toStringHDMS(toLonLat(coordinate));
//   var features = window.map.getFeaturesAtPixel(event.pixel);
//   if (!features) {
//     info.innerText = '';
//     info.style.opacity = 0;
//     return;
//   }
//   var properties = features[0].getProperties();
//   console.log(properties);
//   content.innerText = JSON.stringify(properties, null, 2);
//   overlay.setPosition(coordinate);
//   //content.style.opacity = 1;
// }

// hide the popup once it isn't on the map any longer
window.my_map.on('pointerrestout', popup.hide, popup);

description = Ext.create('Ext.panel.Panel', {
    contentEl: 'description',
    title: 'Description',
    region: 'east',
    width: 300,
    border: false,
    bodyPadding: 5
});

// Ext.create('Ext.Viewport', {
//     layout: 'border',
//     items: [
//         mapComp,
//         description
//     ]
// });
