// js lib for OpenPlanetWMS , GPL v3.0

var templateRe = /\{ *([\w_-]+) *\}/g;
	function template(str, data) {
		return str.replace(templateRe, function (str, key) {
			var value = data[key];
	
			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
	
			} else if (typeof value === 'function') {
				value = value(data);
			}
		return value;
		});
	}

//L.TileLayer.OPM_tms = L.TileLayer ;/*	
L.TileLayer.OPM_tms = L.TileLayer.extend({
	initialize: function (url, options) { // (String, Object)
		this._url = url;		
		//this.catalogue = options.catalogue;
		L.setOptions(this, options);
		},
	onAdd: function (map) {
		L.TileLayer.prototype.onAdd.call(this, map);
	},
	getTileUrl: function (c) {		
		var dim = Math.pow(2, c.z);			
		c.y = dim - c.y - 1;
		c.x = dim - c.x - 1 ;
		var url = template(this._url, c);
		console.table(" z " + c.z + " x " + c.x + " y " + c.y + ' URL ' + url);
		return url;
	}
}); // */


function OPM_layers_mars()
{
  var baseUrl = 'http://s3-eu-west-1.amazonaws.com/whereonmars.cartodb.net/';
  var opmAttribution = '<a href="https://github.com/openplanetary/opm/wiki/OPM-Basemaps" target="blank">OpenPlanetaryMap</a>'

  // Set basemaps
  var OPM_MarsBasemap_noLabels = new L.TileLayer.OPM_tms('https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-mars-basemap-v0-1/0,1,2,3,4/{z}/{x}/{y}.png', {
    maxNativeZoom: 9,
    zoom: 3,
    tms: false,
    attribution: opmAttribution
  });//.setZIndex(0);

  var basemapTexture = new L.TileLayer.OPM_tms(baseUrl + 'celestia_mars-shaded-16k_global/{z}/{x}/{y}.png', {
    maxNativeZoom: 9,
    zoom: 3,
    tms: true,
    attribution: 'Celestia/praesepe | ' + opmAttribution
  });

  var basemapMOLAGrey = new L.TileLayer.OPM_tms(baseUrl + 'mola-gray/{z}/{x}/{y}.png', {
    attribution: 'NASA/MOLA | ' + opmAttribution,
    tms:true,
    maxNativeZoom: 9,
  });

  var basemapMOLAColor = new L.TileLayer.OPM_tms(baseUrl + 'mola-color/{z}/{x}/{y}.png', {
    attribution: 'NASA/MOLA | ' + opmAttribution,
    tms: true,
    maxNativeZoom: 6,
  });

  var basemapViking = new L.TileLayer.OPM_tms(baseUrl + 'viking_mdim21_global/{z}/{x}/{y}.png', {
    attribution: 'NASA/Viking/USGS | ' + opmAttribution,
    tms:true,
    maxNativeZoom: 7,
  });

  var basemapHillshade = new L.TileLayer.OPM_tms('https://s3.us-east-2.amazonaws.com/opmmarstiles/hillshade-tiles/{z}/{x}/{y}.png', {
    attribution: 'NASA/MOLA | ' + opmAttribution,
    tms:true,
    maxNativeZoom: 7,
  });

  var Layer_gr = {
	group: '<b>OpenPlanetaryMap</b>',
	collapsed: false,
	layers:[]
  };

var gd = {
	"OPM Mars Basemap (no labels) v0.1": OPM_MarsBasemap_noLabels,
	"OPM Shaded Mars Surface Texture Map": basemapTexture,
	"OPM Shaded Grayscale MOLA Elevation": basemapMOLAGrey,
	"OPM Shaded Colour MOLA Elevation": basemapMOLAColor,
	"OPM Global Viking MDIM2.1 Colorized Mosaic": basemapViking,
	"OPM Global Hillshade Map": basemapHillshade
	};

for (var n in gd){
	Layer_gr.layers.push(
		{
			name : n,
			layer: gd[n]
		}
	);
}
return Layer_gr;
}


function USGS_layers (XML, context)
{
	var T_ = XML.getElementsByTagName('Service')[0].getElementsByTagName('Title')[0];
	var Title = T_.textContent
	var Layer_ = XML.getElementsByTagName('Capability')[0].getElementsByTagName('Layer')[0];
	var Layers = Layer_.getElementsByTagName('Layer');
	var WMS_group = [];

	for (var il in Layers) {
		var l = Layers[il];
		if (typeof l != 'object')
			continue;
		var bb = l.getElementsByTagName('BoundingBox')[0];
		var CRS = bb ? bb.getAttribute('CRS') : null;
		WMS_group.push({
			name: l.getElementsByTagName('Title')[0].textContent,
			layer: L.tileLayer.wms(
				context.usgs_base,
				{
					format: 'image/jpeg',
					version: '1.1.1',
					request: 'GetMap',
					map: context.usgs_group,
					layers: l.getElementsByTagName('Name')[0].textContent,
					srs: CRS ? CRS : 'EPSG:4326',
					width: 256,
					height: 256
				}
			)
		}); // push
	};
	return {
		group: Title + '<b> (' + context.usgs_base.split('/')[2]+ ')</b>',
		collapsed: false,
		layers: WMS_group
	};
}

function NASA_mars_layer_group (NASA_WMS, URI_base, lingua){
	function Mars_layer(id, WMS_dir, ext, z, attribution){
		var tl = new L.TileLayer(WMS_dir + '/{z}/{y}/{x}' + ext ,{
			maxZoom: z-1,
			attribution: attribution,
			id: 'mars.' + id
		});
		return tl;
	}
	var def_WMS ='/1.0.0/default/default028mm';
	var cr = 'NASA/ESA';
	var g = [];
	for (id in NASA_WMS){
		g.push({
			name: NASA_WMS[id].text[lingua],
			layer: Mars_layer(id, URI_base + '/' + NASA_WMS[id].adr + def_WMS, NASA_WMS[id].ext, NASA_WMS[id].z, cr)
		});
	}
	return g;
}

function default_graticule (){
	return [
		{
			name: "1°",
			layer: L.graticule({
				interval: 1,
				style: {
					color: '#ffffff',
					weight: 1
				}
			})
		},
		{
			name: "10°",
			layer: L.graticule({
				interval: 10,
				style: {
					color: '#EDF714',
					weight: 1
				}
			})
		}
	];	
}

function doubleToDegree(c60){
	var degree = Math.floor(c60);
	var rawMinute = Math.abs((c60 % 1) * 60);		
	var minute = Math.floor(rawMinute);
	var  second = Math.floor(Math.round((rawMinute % 1) * 60));
	return degree + '°' + minute + '′' + second + '″';
}

// Display coordinates
function onCoord(e){
		var c = e.latlng;
    document.getElementById('lat').innerHTML = "&nbspφ " + c.lat.toFixed(5);
    document.getElementById('lon').innerHTML = "&nbspλ " + c.lng.toFixed(5);
    document.getElementById('lat_60').innerHTML = "&nbspφ " + doubleToDegree(c.lat);
    document.getElementById('lon_60').innerHTML = "&nbspλ " + doubleToDegree(c.lng);
}
