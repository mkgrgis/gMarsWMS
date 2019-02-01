// js lib for OpenPlanetWMS , GPL v3.0

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