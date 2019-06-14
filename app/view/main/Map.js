/**
 * A plugin for Ext.grid.column.Column s that overwrites the internal cellTpl to
 * support legends.
 */
Ext.define('BasicTreeColumnLegends', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.basic_tree_column_legend',

  /**
     * @private
     */
  originalCellTpl: Ext.clone(Ext.tree.Column.prototype.cellTpl).join(''),

  /**
     * The Xtemplate strings that will be used instead of the plain {value}
     * when rendering
     */
  valueReplacementTpl: [
    '{value}',
    '<tpl if="this.hasLegend(values.record)"><br />',
    '<tpl for="lines">',
    '<img src="{parent.blankUrl}"',
    ' class="{parent.childCls} {parent.elbowCls}-img ',
    '{parent.elbowCls}-<tpl if=".">line<tpl else>empty</tpl>"',
    ' role="presentation"/>',
    '</tpl>',
    '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
    '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
    '<img src="{blankUrl}" class="{childCls} x-tree-elbow-img">',
    '{[this.getLegendHtml(values.record)]}',
    '</tpl>'
  ],

  /**
     * The context for methods available in the template
     */
  valueReplacementContext: {
    hasLegend: function(rec) {
      var isChecked = rec.get('checked');
      var layer = rec.data;
      return isChecked && !(layer instanceof ol.layer.Group);
    },
    getLegendHtml: function(rec) {
      var layer = rec.data;
      var legendUrl = layer.get('legendUrl');
      if (!legendUrl) {
        legendUrl = 'https://geoext.github.io/geoext2/' + 'website-resources/img/GeoExt-logo.png';
      }
      return '<img class="legend" src="' + legendUrl + '" height="32" />';
    }
  },

  init: function(column) {
    var me = this;
    if (!(column instanceof Ext.grid.column.Column)) {
      Ext.log.warn('Plugin shall only be applied to instances of' + ' Ext.grid.column.Column');
      return;
    }
    var valuePlaceHolderRegExp = /\{value\}/g;
    var replacementTpl = me.valueReplacementTpl.join('');
    var newCellTpl = me.originalCellTpl.replace(valuePlaceHolderRegExp, replacementTpl);

    column.cellTpl = [newCellTpl, me.valueReplacementContext];
  }
});
/*
 * End plugin
 **/

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
  url: coupureaerien_url
});

var t_coupureaerien_source = new ol.source.VectorTile({
  format: new ol.format.MVT(),
  url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' + 'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
})

var coupureaerien_style = new ol.style.Style({
  image: new ol.style.RegularShape({
    points: 5,
    radius: 4,
    fill: new ol.style.Fill({color: '#0cc38c'}),
    stroke: new ol.style.Stroke({
      color: [
        0, 0, 0
      ],
      width: 1
    })
  })
});

var t_coupureaerien_style = new ol.style.Style({
  fill: new ol.style.Fill({color: 'rgba(255, 255, 255, 0.6)'}),
  stroke: new ol.style.Stroke({color: '#319FD3', width: 1})
});

var coupureaerien_layer = new ol.layer.VectorTile({
  title: 'Coupure Aerien HTA',
  style: coupureaerien_style,
  source: coupureaerien_source,
  legendUrl: 'http://192.9.200.16:8080/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER='+ coupureaerien_layername,
  name: 'Appareil de coupure aerien'});

var t_coupureaerien_layer = new ol.layer.VectorTile({
  title: 'Coupure Aerien HTA',
  style: t_coupureaerien_style,
  source: t_coupureaerien_source,
  legendUrl: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' + 'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
  name: 'Appareil de coupure aerien'
});

var osm_source = new ol.source.OSM({url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"});
var osm_basemap = new ol.layer.Tile({
  title: 'OSM basemap',
  source: osm_source,
  //legendUrl: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  name: 'OSM basemap'})

var view = new ol.View({
  center: ol.proj.fromLonLat([-149.3, -17.7]),
  zoom: 7
});

window.my_map = new ol.Map({
  controls: ol.control.defaults().extend([new ol.control.ScaleLine]),
  target: 'map',
  view: view,
  layers: [
    new ol.layer.Group({title: 'Fond de plans', layers: [osm_basemap], name: 'Fond de plans'}),
    new ol.layer.Group({title: 'Réseau Secosud', layers: [coupureaerien_layer], name: 'Réseau Secosud'})
  ],
  //overlays: [overlay],
});

var mapview = Ext.define('SIG.view.main.Map', {
  // extend: "Ext.panel.Panel",
  extend: "GeoExt.component.Map",
  xtype: 'mappanel',
  //region: 'center',
  requires: [
    'SIG.view.main.MapController', 'SIG.view.main.MapModel'
  ],

  controller: 'main-map',
  viewModel: {
    type: 'main-map'
  },
  // html: "Hello, World!!"
  map: window.my_map
});

// var store = Ext.create('Ext.data.TreeStore', {
//   root: {
//     expanded: true,
//     children: [
//       { text: 'detention', leaf: true },
//       { text: 'homework', expanded: true, children: [
//         { text: 'book report', leaf: true },
//         { text: 'algebra', leaf: true}
//       ] },
//       { text: 'buy lottery tickets', leaf: true }
//     ]
//   }
// });

var treeStore = Ext.create('GeoExt.data.store.LayersTree', {layerGroup: window.my_map.getLayerGroup()});

var layerTreePanel = Ext.create('Ext.tree.Panel', {
  title: 'Couches',
  width: 300,
  flex: 1,
  collapsible: true,
  split: true,
  store: treeStore,
  rootVisible: false,
  region: 'east',
  columns: {
    header: false,
    items: [
      {
        xtype: 'treecolumn',
        dataIndex: 'text',
        flex: 1,
        plugins: [
          {
            ptype: 'basic_tree_column_legend'
          }
        ]
      }
    ]
  },
  viewConfig: {
    plugins: {
      ptype: 'treeviewdragdrop'
    }
  }
});

popup = Ext.create('GeoExt.component.Popup', {
  map: window.my_map,
  width: 140
});

window.my_map.on('click', function(evt) {
  var coordinate = evt.coordinate;
  var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'));
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
  popup.setHtml('<p><strong>Pointer rested on</strong>' + '<br /><code>' + attributes + '</code></p>');
  popup.position(coordinate);
  popup.show();
});

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

// var maplayout = Ext.create('Ext.panel.Panel', {
//   layout: 'border',
//   height: '100%',
//   width: '100%',
//   defaults: {
//     collapsible: true,
//     split: true,
//     bodyStyle: 'padding:15px'
//   },
//   items: [
//     mapview,
//     layerTreePanel
//   ]
// });
