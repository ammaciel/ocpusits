//$(function(){
$(document).ready(function () {

  //------------------
  // LEAFLET maps
  //------------------

    var lat1 = -13.224772;
    var long1 = -56.245043;
    var newMarker = {};
    var newSquare = {};
    
    //----- create map object, tell it to live in 'map' div and give initial latitude, longitude, zoom values
    var map = L.map('map', {
      fullscreenControl: true,
      cursor: false,
    }).setView([lat1, long1], 13);

    // zoom crontrol when mouse over
    map.scrollWheelZoom.disable();
    map.on('focus', () => { map.scrollWheelZoom.enable(); });
    map.on('blur', () => { map.scrollWheelZoom.disable(); });

    //  add base map tiles from OpenStreetMap and attribution info to 'map' div
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
	 }).addTo(map);

    //L.esri.basemapLayer('Imagery').addTo(map);
    L.esri.basemapLayer('ImageryLabels').addTo(map);

    //----- search data
    var searchControl = new L.esri.Controls.Geosearch().addTo(map);

    var results = new L.LayerGroup().addTo(map);

    searchControl.on('results', function (data) {
      results.clearLayers();
      for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));
      }
    });

    setTimeout(function () { $('.pointer').fadeOut('slow'); }, 3400);

    //----- draw rectangle with pixel size
    // var sideInMeters = 250;
    // //drawSquare(map, center, { color: 'blue', weight: 1 }, sideInMeters);

    // function drawBoxPixelSizeMODIS(map, center, properties, sideLengthInMeters) {
    //   var circle = L.circle(center, sideLengthInMeters / 2).addTo(map);
    //   var bounds = circle.getBounds();
    //   map.removeLayer(circle); //hide circle
    //   var rect = L.rectangle(bounds, properties).addTo(map);
    //   return rect;
    // }

    // icon leaflet example
    var markIcon = L.icon({
      iconUrl: 'maps-and-flags.png', //'leaf-green.png',
      iconSize: [50, 50], // size of the icon
      iconAnchor: [25, 50], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -50] // point from which the popup should open relative to the iconAnchor
    });

    //----- new marker according to click
    function addMarker(e){
      //Clear existing marker,
      if (newMarker !== undefined) {
        map.removeLayer(newMarker);
        //map.removeLayer(newSquare);
      }
      // Add marker to map at click location; add popup window
      newMarker = L.marker([e.latlng.lat, e.latlng.lng], {
        icon: markIcon
      }).addTo(map).bindPopup("Latitude: " + e.latlng.lat + ", Longitude: " +  e.latlng.lng);//.openPopup;
            
      lat1 = e.latlng.lat;
      long1 = e.latlng.lng;
      document.getElementById('long').value = long1;
      document.getElementById('lat').value = lat1;
      console.log("Latitude: " + lat1 + ", Longitude: " + long1);
      
      //newSquare = drawBoxPixelSizeMODIS(map, [e.latlng.lat, e.latlng.lng], { color: 'yellow', fillOpacity: 0 }, sideInMeters); //, weight: 1
    }
    map.on('click', addMarker);
    // map.on('click', zoomTo);

    //----- pan region marker from input lat long text
    $("button").click(function () {
      //Clear existing marker,
      if (newMarker !== undefined) {
        map.removeLayer(newMarker);
      }
      lat1 = document.getElementById("lat").value;
      long1 = document.getElementById("long").value;
      console.log("Latitude: " + lat1 + ", Longitude: " + long1);
      map.panTo(new L.LatLng(lat1, long1));
      // Add marker to map at click location; add popup window
      newMarker = L.marker([lat1, long1], {
        icon: markIcon,
        draggable: true
      }).addTo(map).bindPopup("Latitude: " + lat1 + ", Longitude: " + long1);//.openPopup;
    });

    // mousemove text with coordinates
    var lat, lng, coords;
    map.addEventListener('mousemove', function (ev) {
      lat = ev.latlng.lat;
      lng = ev.latlng.lng;
      coords = "Lng: " + lng + ", Lat" + lat;

      document.getElementById('coord').innerHTML = coords; //.value
      // console.log("Coordinates: " + lat + ', ' + lng);
      // alert(lat + ' - ' + lng);

      return false; // To disable default popup.
    });

  //----- draw polygons in leaflet
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  // draw control
  var drawControlFull = new L.Control.Draw({
    position: 'topright',
    draw: {
      polyline: false, //{
        //metric: true
      //},
      polygon: {
        metric: true,
        allowIntersection: false,
        showArea: true,
        drawError: {
          color: '#b00b00',
          timeout: 1000
        },
        shapeOptions: {
          color: '#bada55'
        }
      },
      rectangle: {
        metric: true,
        shapeOptions: {
          clickable: true
        }
      },
      circle: {
        metric: true,
        shapeOptions: {
          color: '#0000FF',
          color: '#662d91'
        }
      },
      marker: false,
      // marker: { //true
      //   icon: addMarker,
      // }
    },
    // edit: {
    //   featureGroup: drawnItems,
    //   remove: true
    // }
  });

  var drawControlEditOnly = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems,
      remove: true
    },
    draw: false
  });

  map.addControl(drawControlFull);

  var shpfile = null;

  //----- enable and disable marker or polygon draw tool
  map.on("draw:created", function (e) {
    var layerShp = e.layer;
    console.log('shp1: ', layerShp);

    layerShp.addTo(drawnItems);
    drawControlFull.removeFrom(map);
    drawControlEditOnly.addTo(map)
    
    var type = e.layerType;
    if (type === 'polygon' || type === 'rectangle') {
      var area = L.GeometryUtil.geodesicArea(layerShp.getLatLngs()); // squareMeters by default
      areaInHa = (area / 10000).toFixed(2)
      console.log(areaInHa);

      shpfile = layerShp.toGeoJSON(layerShp);
      console.log('shp2: ', shpfile);

      if (areaInHa >= 6000) {  
        var message = "Area more than 6000 ha: " + areaInHa  + " ha.";
        //document.getElementById('message').innerHTML = message; //.value
        alert(message);
        drawnItems.clearLayers();
        drawControlFull.addTo(map);
        drawControlEditOnly.removeFrom(map)        
      } // 6 ha
    }
    else if (type === 'circle' ) {
      var area = 0;
      var radius = e.layer.getRadius();
      area = (Math.PI) * (radius * radius);
      
      areaInHa = (area / 10000).toFixed(2)
      console.log(areaInHa);

      if (areaInHa >= 6000) {
        var message = "Area more than 6000 ha: " + areaInHa + " ha.";
        //document.getElementById('message').innerHTML = message; //.value
        alert(message);
        drawnItems.clearLayers();
        drawControlFull.addTo(map);
        drawControlEditOnly.removeFrom(map)
      } // 6 ha
    } else {
      var popupContent = areaInHa;
      layerShp.addPopup(layerShp);
    }

  });

  map.on("draw:deleted", function (e) {
    check = Object.keys(drawnItems._layers).length;
    console.log(check);
    if (check === 0) {
      drawControlEditOnly.removeFrom(map);
      drawControlFull.addTo(map);
    };
  });

  //---------
  // var mixButton = document.getElementById("mixButton");

  // mixButton.addEventListener("click", capturePoint);

  // //map.on("click", addMarker)
  
  
  // function drawShape() {
  //   console.log("drawShape - ok");
  //   mixButton.removeEventListener("click", drawShape);
  //   mixButton.addEventListener("click", capturePoint);
  //   mixButton.value = "Capture Point";

  //   drawnItems.clearLayers();
  //   drawControlFull.removeFrom(map);
  //   drawControlEditOnly.removeFrom(map);
    
  // }

  // function capturePoint() {
  //   console.log("capturePoint - ok");
  //   mixButton.removeEventListener("click", capturePoint);
  //   mixButton.addEventListener("click", drawShape);
  //   mixButton.value = "Draw Shape";

  //   //mixButton.removeEventListener("click", addMarker);
  //   map.addControl(drawControlFull);
  //   map.off("click", addMarker)
  
  // }
//---------





//------------------
// OPENCPU with R
//------------------

// global variable used to save the session object
var nrow = 0;
// var nextTab = 0;

  $("#services").change(function () {
    switch ($(this).val()) {
      case 'WTSS-INPE':
        $("#coverages").html("<option value='MOD13Q1'> MOD13Q1 </option>");
        $("#band").html("<option selected='selected' value='evi'> evi </option><option value='ndvi'> ndvi </option><option value='mir'> mir </option><option value='nir'> nir </option><option value='red'> red </option><option value='blue'> blue </option>");
        $("#pre_filter").find("option").each(function () {
          $(this).attr("disabled", "disabled");
        });
        break;
      case 'SATVEG':
        $("#coverages").html("<option value='terra'>Terra</option><option value='aqua'>Aqua</option><option value='comb'>Combination</option>");
        //$("#band").html("<option value='evi'> evi </option><option value='ndvi'> ndvi</option>");
        $("#pre_filter").html("<option value='0'> 0 - none </option><option selected='selected' value='1'> 1 - no data correction </option><option value='2'> 2 - cloud correction </option><option value='3'> 3 - no data and cloud correction </option>");
        $("#band").find("option").each(function (){
          $(this).attr("disabled", "disabled");
        });
        $("#from").find("input").each(function (){
          $(this).attr("disabled", "disabled");
        });
        $("#to").find("input").each(function (){
          $(this).attr("disabled", "disabled");
        });
        break;
      default:
        $("#coverages").html("<option value=''>-- Coverage --</option>");
    }
 });

  $("#filter").change(function () {
    switch ($(this).val()) {
      case 'No-filter':
        $("#wh-lambda").prop("disabled", true);
        $("#wh-differences").prop("disabled", true);
        $("#sg-order").prop("disabled", true);
        $("#sg-scale").prop("disabled", true);
        break;
      case 'Whittaker':
        $("#wh-lambda").prop("disabled", false);
        $("#wh-differences").prop("disabled", false);
        $("#sg-order").prop("disabled", true);
        $("#sg-scale").prop("disabled", true);
        break;
      case 'Savitsky-Golay':
        $("#wh-lambda").prop("disabled", true);
        $("#wh-differences").prop("disabled", true);
        $("#sg-order").prop("disabled", false);
        $("#sg-scale").prop("disabled", false);
        break;
    }
  });


  //curl -v localhost:5656/ocpu/user/inpe/library/ocputest/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

  function prepareData(myData) {
    var mySeries = [];
    myData.forEach(function (obj) {
      for (var i = 1; i < Object.keys(obj).length; i++) {
        mySeries.push({
          band: Object.keys(obj)[i],
          date: obj[Object.keys(obj)[0]],
          value: obj[Object.keys(obj)[i]]
        })
      }
    });
    //console.log('mySeries: ', mySeries);

    return(mySeries)
    // let series = mySeries.reduce((acc, curr) => {
    //   if (acc.some(obj => obj.name === curr.name)) {
    //     acc.forEach(obj => {
    //       if (obj.name === curr.name) {
    //         obj.data = obj.data + ", " + curr.data;
    //       }
    //     });
    //   } else {
    //     acc.push(curr);
    //   }
    //   return acc;
    // }, []);
    }

  // plot map using D3.js C3
  function plotChart(mySeries) {
    //Draw chart
    var nestedData = d3.nest().key(function (d) { return d.date; }).entries(mySeries);
    var bands = d3.set();
    var formattedData = nestedData.map(function (entry) {
      var values = entry.values;
      var obj = {};
      values.forEach(function (value) {
        obj[value.band] = value.value;
        bands.add(value.band);
      })
      obj.date = entry.key;
      return obj;
    });

    var chart = c3.generate({
      bindto: '#plotdiv',
      data: {
        json: formattedData,
        keys: {
          x: 'date', // it's possible to specify 'x' when category axis
          value: bands.values(),
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d' //'%Y-%m-%d'
          }
        }
      },
      subchart: {
        show: true
      },
      zoom: {
        enabled: false, // zoom with mouse scroll
        //disableDefaultBehavior: true,
      },
      type: 'spline',
    });
  }

  var mySession = null;

   function timeSeriesRaw() {
    var service_selected = $("#services option:selected").val();
    console.log('service: ', service_selected);
    var coverage_selected = $("#coverages option:selected").val();
    console.log('coverage: ', coverage_selected);
    var band_selected = $("#band").val();
    console.log('bands: ', band_selected);
     var pre_filter_selected = $("#pre_filter").val();
     console.log('pre filter: ', pre_filter_selected);
    //disable the button to prevent multiple clicks
    $("#submitbutton").attr("disabled", "disabled");

     if ($('#long').val() == '' || $('#lat').val() == '') {
       alert('Enter with longitude and latitude!');
       $("#submitbutton").removeAttr("disabled");
     } else {

    var req = ocpu.call("TSoperation", { // ocpu.rpc
      name_service: service_selected,
      coverage: coverage_selected,
      longitude: $("#long").val(),
      latitude: $("#lat").val(),
      bands: band_selected,
      start_date: $("#from").val(),
      end_date: $("#to").val(),
      pre_filter: pre_filter_selected
    }, function (session) {
        mySession = session;

        session.getObject(function(data){
         // console.log('DATA: ', data);
          var myData = data[0].time_series;
          console.log('MyData: ', myData);
          var series = prepareData(myData);
          plotChart(series);

          // add row in table only if success plot time series
          $(function () {
            nrow += 1;
            var start_date1 = $("#from").val();
            var end_date1 = $("#to").val();
            var newRow = document.getElementById('tableSample').insertRow();
            var dataService = "<td>" + nrow + "</td><td>" + long1 + "</td><td>" + lat1 + "</td><td contenteditable='true'>" + start_date1 + "</td><td contenteditable='true'>" + end_date1 + "</td><td contenteditable='true'>" + "No label" + "</td><td><button type='button' class='w3-large'><i class='fa fa-trash'aria-hidden='true'></i></button></td>";
            //value='Delete'
            newRow.innerHTML = dataService;
          });
        });
    }).always(function () { //after request complete, re-enable the button
      $("#submitbutton").removeAttr("disabled");
      $("#submitbuttonfilter").removeAttr("disabled");
    }).fail(function () { //if R returns an error, alert the error message
      alert("Failed to plot time series!\nDefine service, coverage and LatLong input!");
      $("#submitbutton").removeAttr("disabled");
    });
    }
  }

  function timeSeriesFilter() {
    var filter_selected = $("#filter option:selected").val();
    console.log('filter: ', filter_selected);
    var wh_lambda_selected = $("#wh-lambda").val();
    console.log('wh-lambda: ', wh_lambda_selected);
    var wh_diff_selected = $("#wh-differences").val();
    console.log('wh-differences: ', wh_diff_selected);
    var sg_order_selected = $("#sg-order").val();
    console.log('sg-order: ', sg_order_selected);
    var sg_scale_selected = $("#sg-scale").val();
    console.log('sg-scale: ', sg_scale_selected);

    //disable the button to prevent multiple clicks
    $("#submitbuttonfilter").attr("disabled", "disabled");

    var req = ocpu.call("TSfilter", { //rpc
      ts_data: mySession,
      type_filter: filter_selected,
      wh_lambda: wh_lambda_selected,
      wh_differences: wh_diff_selected,
      sg_order: sg_order_selected,
      sg_scale: sg_scale_selected,
    }, function (session) {
        //console.log('mySession: ', mySession);
          session.getObject(function (data) {
          var myData = data[0].time_series;
          //console.log('MyData filter: ', myData);
          var series = prepareData(myData);
          //console.log('series: ', series);

          var str = JSON.stringify(series).replace(/.whit/g, "_whit"); //convert to JSON string
          str = str.replace(/.sg/g, "_sg");
          var series2 = JSON.parse(str);    //convert back to array
          console.log('series filter: ', series2);

          plotChart(series2);
        });
    }).always(function () { //after request complete, re-enable the button
      $("#submitbuttonfilter").removeAttr("disabled");
    }).fail(function () { //if R returns an error, alert the error message
      alert("Failed to plot time series filtered!\nAcquire the time series first!");
    });
  }


function timeSeriesShp() {
    var service_selected = $("#services option:selected").val();
    console.log('service: ', service_selected);
    var coverage_selected = $("#coverages option:selected").val();
    console.log('coverage: ', coverage_selected);
    var band_selected = $("#band").val();
    console.log('bands: ', band_selected);
     var pre_filter_selected = $("#pre_filter").val();
     console.log('pre filter: ', pre_filter_selected);
    //disable the button to prevent multiple clicks
    $("#submitbutton").attr("disabled", "disabled");

  if (typeof shpfile !== "object" && shpfile === null) {
    //(typeof shpfile !== "object" && shpfile === null) {
       alert('Enter with the polygon!');
       $("#submitbutton").removeAttr("disabled");
    } else {

    console.log('shp3: ', shpfile);
   
    var req = ocpu.call("TSoperationSHP", { // ocpu.rpc
      name_service: service_selected,
      coverage: coverage_selected,
      //longitude: $("#long").val(),
      //latitude: $("#lat").val(),
      bands: band_selected,
      start_date: $("#from").val(),
      end_date: $("#to").val(),
      pre_filter: pre_filter_selected,
      shp_file: shpfile,
      
    }, function (session) {
        
      
        
        mySession = session;
        console.log('session: ', session);
        

        session.getObject(function(data){
         // console.log('DATA: ', data);
          var myData = data[0].time_series;
          console.log('MyData: ', myData);
          var series = prepareData(myData);
          plotChart(series);

          // add row in table only if success plot time series
          $(function () {
            nrow += 1;
            var start_date1 = $("#from").val();
            var end_date1 = $("#to").val();
            var newRow = document.getElementById('tableSample').insertRow();
            var dataService = "<td>" + nrow + "</td><td>" + long1 + "</td><td>" + lat1 + "</td><td contenteditable='true'>" + start_date1 + "</td><td contenteditable='true'>" + end_date1 + "</td><td contenteditable='true'>" + "No label" + "</td><td><button type='button' class='w3-large'><i class='fa fa-trash'aria-hidden='true'></i></button></td>";
            //value='Delete'
            newRow.innerHTML = dataService;
          });
        });
    }).always(function () { //after request complete, re-enable the button
      $("#submitbutton").removeAttr("disabled");
      $("#submitbuttonfilter").removeAttr("disabled");
    }).fail(function () { //if R returns an error, alert the error message
      alert("Failed to plot time series!\nDefine service, coverage and LatLong input!");
      $("#submitbutton").removeAttr("disabled");
    });
    }
  }



  //button handler
  $("#submitbutton").on("click", function (e) {
      e.preventDefault();
      timeSeriesShp();
      //timeSeriesRaw();     
  });

  //button handler
  $("#submitbuttonfilter").on("click", function (e) {
      e.preventDefault();
      timeSeriesFilter();
  });

  //------------------
  // TABLE add samples
  //------------------

   // remove row of table
    $('#tableSample').on('click', 'button[type="button"]', function () { //'input[type="button"]'
      $(this).closest('tr').remove();
    });
    $('p button[type="button"]').click(function () {
      $('#tableSample').append('<tr><td></td><td><input type="button" value="Delete" /></td></tr>');
  });

    // SAVE table in file
// source: https://stackoverflow.com/questions/40428850/how-to-export-data-from-table-to-csv-file-using-jquery
  $('#saveCSV').click(function() {
    var titles = [];
    var data = [];
    /*Get the table headers, this will be CSV headers
    The count of headers will be CSV string separator */
    $('.tableSample th').each(function() {
      titles.push($(this).text());
    });
    // Get the actual data, this will contain all the data, in 1 array
    $('.tableSample td').each(function() {
      data.push($(this).text());
    });
    // Convert our data to CSV string
    var CSVString = prepCSVRow(titles, titles.length, '');
    CSVString = prepCSVRow(data, titles.length, CSVString);
    // Make CSV downloadable
    var downloadLink = document.createElement("a");
    var blob = new Blob(["\ufeff", CSVString]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = "samples.csv";
    // Actually download CSV
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
  /*
  * Convert data array to CSV string
  * @param arr {Array} - the actual data
  * @param columnCount {Number} - the amount to split the data into columns
  * @param initial {String} - initial string to append to CSV string
  * return {String} - ready CSV string
  */
  function prepCSVRow(arr, columnCount, initial) {
    var row = ''; // this will hold data
    var delimeter = ','; // data slice separator, in excel it's `;`, in usual CSv it's `,`
    var newLine = '\r\n'; // newline separator for CSV row
    /*
      * Convert [1,2,3,4] into [[1,2], [3,4]] while count is 2
    * @param _arr {Array} - the actual array to split
    * @param _count {Number} - the amount to split
    * return {Array} - splitted array
    */
      function splitArray(_arr, _count) {
        var splitted = [];
        var result = [];
        _arr.forEach(function(item, idx) {
          if ((idx + 1) % _count === 0) {
            splitted.push(item);
            result.push(splitted);
            splitted = [];
          } else {
            splitted.push(item);
          }
        });
        return result;
      }
    var plainArr = splitArray(arr, columnCount);
    // don't know how to explain this
    // you just have to like follow the code
    // and you understand, it's pretty simple
    // it converts `['a', 'b', 'c']` to `a,b,c` string
    plainArr.forEach(function(arrItem) {
      arrItem.forEach(function(item, idx) {
        row += item + ((idx + 1) === arrItem.length ? '' : delimeter);
      });
      row += newLine;
    });
    return initial + row;
  }

});

