//$(function(){
$(document).ready(function () {

  //------------------
  // LEAFLET maps
  //------------------

  // global variables
  var lat1 = null;
  var long1 = null;
  var newMarker = {};

  //----- create map object, tell it to live in 'map' div and give initial latitude, longitude, zoom values
  var map = L.map('map', {
    fullscreenControl: true,
    cursor: false,
    minZoom: 5,
  }).setView([-13.224772, -56.245043], 13);

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

  //---- scale map
  L.control.scale().addTo(map);

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

  // icon leaflet example
  var markIcon = L.icon({
    iconUrl: 'maps-and-flags.png', //'leaf-green.png',
    iconSize: [50, 50], // size of the icon
    iconAnchor: [25, 50], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -50] // point from which the popup should open relative to the iconAnchor
  });

  //----- new marker according to click
  map.on('click', addMarker);

  function addMarker(e){
    //Clear existing marker,
    if (newMarker !== undefined) {
      map.removeLayer(newMarker);
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
  }

    //----- pan region marker from input lat long text
  $("#showLatLong").click(function () {
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
    // alert(lat + ' - ' + lng);

    return false; // To disable default popup.
  });

  //----- draw polygons in leaflet
  /* ----------------- Turf.js */
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
          color: '#bada55',
          fill: false,
        }
      },
      rectangle: {
        metric: true,
        shapeOptions: {
          clickable: true,
          color: '#bada55',
          fill: false,
        }
      },
      circle: {
        metric: true,
        shapeOptions: {
          color: '#bada55',
          fill: false,
        }
      }
      ,
      marker: false,
      //  marker: {
      //    icon: addMarker,
      //  }
    },
     edit: {
       featureGroup: drawnItems,
       remove: false
     }
  });
 //  map.addControl(drawControlFull);

  var turfLayer = L.geoJson(null, {
    style: function (feature) {
      var style = {
        color: '#bada55', //'#561196',
        //fillColor: null,
        weight: 3,
        fillOpacity: .0
      };
      return style;
    }
  }).addTo(map);

  var jsonCoords = null;

  //----- get points from polygon using a grid
  function getPointsPolygon(layer, measure) {

    // internal buffer to get MODIS pixel only within polygon
    var buffered = turf.buffer(layer.toGeoJSON(), measure, { units: 'meters' });
    //turfLayer.addData(buffered);
    //console.log('buffered: ', buffered); //JSON.stringify(buffered));

    // create bounding box of buffer layer
    var bbox = turf.bboxPolygon(turf.bbox(buffered));
    //console.log('bbox: ', bbox);

    // pass to array type
    var bbox_array = bbox.geometry.coordinates[0];
    //console.log('bbox_array: ', JSON.stringify(bbox_array));
    var array = [];
    array = bbox_array[0].concat(bbox_array[2]);

    // set options to squareGrid turf.js
    var options = {
      units: 'meters',
      mask: buffered, // use buffer as mask
    };
    var cellSide = 250;

    var squareGrid = turf.squareGrid(array, cellSide, options);
    turfLayer.addData(squareGrid);
    //console.log('squareGrid: ', squareGrid);

    console.log('Amount of features: ', squareGrid.features.length);

    // consider all squares and put a unique centroid for each one
    var allFeatures = [];
    for (var i = 0; i <= squareGrid.features.length; i++){
      var feature = squareGrid.features[i];
      if (typeof feature !== 'undefined') {
        var polygon = turf.polygon(feature.geometry.coordinates);
        allFeatures[i] = turf.centroid(polygon);
        //turfLayer.addData(allFeatures)
    }}
   // console.log('all features: ', allFeatures);

    //jsonCoords = JSON.parse(JSON.stringify(allFeatures));
    jsonCoords = JSON.stringify(allFeatures);
    console.log('json coordinates from shapefile: ', jsonCoords);
  }


  //----- create a new shapefile
  map.on("draw:created", function (e) {

    var layerShp = e.layer;
    //console.log('shp1: ', layerShp);
    drawnItems.clearLayers();
    turfLayer.clearLayers();

    layerShp.addTo(drawnItems);

    var type = e.layerType;

    if (type === 'polygon' || type === 'rectangle') {
      getPointsPolygon(layerShp, -230);

      var area = L.GeometryUtil.geodesicArea(layerShp.getLatLngs()); // meters by default
      areaInHa = (area / 10000).toFixed(2)
      console.log('area hectare:', areaInHa);

      if (areaInHa >= 6000) {
        var message = "Area more than 6000 ha: " + areaInHa  + " ha.";
        //document.getElementById('message').innerHTML = message; //.value
        alert(message);
        drawnItems.clearLayers();
        turfLayer.clearLayers();
      }
    } else if (type === 'circle') {

      var area = 0;
      var radius = layerShp.getRadius();
      area = (Math.PI) * (radius * radius);

      areaInHa = (area / 10000).toFixed(2)
      console.log('area hectare:', areaInHa);

      //-- internal buffer to get MODIS pixel only within polygon
      getPointsPolygon(layerShp, radius-230);

      if (areaInHa >= 6000) {
        var message = "Area more than 6000 ha: " + areaInHa + " ha.";
        //document.getElementById('message').innerHTML = message; //.value
        alert(message);
        drawnItems.clearLayers();
        turfLayer.clearLayers();
      }
    }
  });



  //------------------
  // OPENCPU with R
  //------------------

  // global variable used to save the session object
  var nrow = 0;
  var mySession_point = null;

  //----- define values of the input
  $("#services").change(function () {
    switch ($(this).val()) {
      case 'WTSS-INPE':
        $("#coverages").html("<option value='MOD13Q1'> MOD13Q1 </option>");
        $("#band").html("<option selected='selected' value='evi'> evi </option><option value='ndvi'> ndvi </option><option value='mir'> mir </option><option value='nir'> nir </option><option value='red'> red </option><option value='blue'> blue </option>");
        $("#band_shp").html("<option selected='selected' value='evi'> evi </option><option value='ndvi'> ndvi </option><option value='mir'> mir </option><option value='nir'> nir </option><option value='red'> red </option><option value='blue'> blue </option>");
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


  //----- define graphic properties D3.js C3
  function prepareData(data) {
    var mySeries = [];
    data.forEach(function (obj) {
      for (var i = 1; i < Object.keys(obj).length; i++) {
        mySeries.push({
          band: Object.keys(obj)[i],
          date: obj[Object.keys(obj)[0]],
          value: obj[Object.keys(obj)[i]]
        })
      }
    });
    return(mySeries)
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

  // plot map using D3.js C3
  // https://jsfiddle.net/qy4xh1km/
  // https://stackoverflow.com/questions/33164568/c3-js-fill-area-between-curves
  function plotChartShp(items) {
    //Draw chart
    var chart = c3.generate({
      bindto: '#plotdiv',
      data: {
        json: items,
        keys: {
          x: 'Index',
          value: ['ymin_sd', 'ymax_sd', 'mean'] //, 'quantile_25', 'quantile_75']
        },
        colors: {
          ymin_sd: '#699402', //'#33cc99',
          ymax_sd: '#0946B2', //'#33cc33',
          mean: '#C92918',  //'#0066ff',
          //quantile_25: '#ff3300',
          //quantile_75: '#cc0000'
        },
        //labels: true,
        names: {
          ymin_sd: 'standard deviation inferior',
          ymax_sd: 'standard deviation superior',
          mean: 'mean'
        },
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%Y-%m-%d' //'%Y-%m-%d'
          }
        },
      },
      subchart: {
        show: true
      },
      zoom: {
        enabled: false, // zoom with mouse scroll
        //disableDefaultBehavior: true,
      },
      type: 'area',
    });

    //   function fillArea() {
    //     var indexies = d3.range(items.length);
    //     console.log('id: ', indexies);
    //     var x = chart.internal.x;
    //     console.log('x: ', x);
    //     var y = chart.internal.y;
    //     console.log('y: ', y);

    //     var area = d3.area()
    //       .curve(d3.curveCardinal)
    //       .x(function (d) { return x(new Date(items[d].Index)); })
    //       .y0(function (d) { return y(items[d].ymin_sd); })
    //       .y1(function (d) { return y(items[d].ymax_sd); });

    //     d3.select("plotdiv")
    //       .append('path')
    //       .datum(indexies)
    //       .attr('class', 'area')
    //       .attr('fill', 'red')
    //       .attr('d', area);
    //  }
    //   fillArea();
  }

  //----- functions to table, remove and edit row
  var table = $('#tableSample').DataTable();
  $('#tableSample').on( 'click', 'tr', function () {
      if ( $(this).hasClass('selected') ) {
          $(this).removeClass('selected');
      }
      else {
          table.$('tr.selected').removeClass('selected');
          $(this).addClass('selected');
      }
  } );

  $('#deleteRow').click( function () {
      table.row('.selected').remove().draw( false );
  } );

  $('#clearTable').click( function () {
    table.clear().draw();
  } );
  var nrow = 1;

  //----- functions to capture a single point
  function timeSeriesRaw() {
    //mySession_point = null;

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
        mySession_point = session;

        session.getObject(function(data){
        // console.log('DATA: ', data);
          var myData = data[0].time_series;
          console.log('MyData: ', myData);
          var series = prepareData(myData);
          plotChart(series);

          // add row in table only if success plot time series
          $(function () {
            var start_date1 = $("#from").val();
            var end_date1 = $("#to").val();
            table.row.add([ nrow , long1, lat1, start_date1, end_date1, "No label" ]).draw();
            nrow += 1;
            //, '<button type="button" class="w3-large"><i class="fa fa-trash" aria-hidden="true"></i></button></td>'
            // nrow += 1;
            // var start_date1 = $("#from").val();
            // var end_date1 = $("#to").val();
            // var newRow = document.getElementById('tableSample').insertRow();
            // var dataService = "<td>" + nrow + "</td><td>" + long1 + "</td><td>" + lat1 + "</td><td contenteditable='true'>" + start_date1 + "</td><td contenteditable='true'>" + end_date1 + "</td><td contenteditable='true'>" + "No label" + "</td><td><button type='button' class='w3-large'><i class='fa fa-trash'aria-hidden='true'></i></button></td>";
            // //value='Delete'
            // newRow.innerHTML = dataService;
          });
        });
    }).always(function () { //after request complete, re-enable the button
      $("#submitbutton").removeAttr("disabled");
      $("#submitbuttonfilter").removeAttr("disabled");
    }).fail(function () { //if R returns an error, alert the error message
      alert("Failed to plot time series!\nDefine service, coverage and LatLong input!\nOr timeout with server!");
      $("#submitbutton").removeAttr("disabled");
    });
    }
  }

  // filters
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
      ts_data: mySession_point,
      type_filter: filter_selected,
      wh_lambda: wh_lambda_selected,
      wh_differences: wh_diff_selected,
      sg_order: sg_order_selected,
      sg_scale: sg_scale_selected,
    }, function (session) {
        //console.log('mySession_point: ', mySession_point);
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
    var band_selected = $("#band_shp").val();
    console.log('bands: ', band_selected);
     var pre_filter_selected = $("#pre_filter").val();
     console.log('pre filter: ', pre_filter_selected);
    //disable the button to prevent multiple clicks
    $("#submitbutton").attr("disabled", "disabled");

    if (typeof jsonCoords === null) {
        alert('Draw polygon!');
        $("#submitbutton").removeAttr("disabled");
      } else {

      var req = ocpu.call("TSoperationSHP", { // ocpu.rpc
        name_service: service_selected,
        coverage: coverage_selected,
        bands: band_selected,
        start_date: $("#from").val(),
        end_date: $("#to").val(),
        pre_filter: pre_filter_selected,
        shp_file: jsonCoords,
      }, function (session) {
          var mySession_shp = session;
          //console.log('mySession_shp: ', session);

          session.getObject(function (data) {
          // console.log('DATA: ', data[0]);
          plotChartShp(data[1]);
          // console.log('Coordinates shp: ', data);

          // add row in table only if success plot time series
          $(function () {
            var start_date1 = $("#from").val();
            var end_date1 = $("#to").val();
            // var lng = $(data[0]).map(function() {
            //   return this.longitude;
            // }).get()
            // var lat = $(data[0]).map(function() {
            //   return this.latitude;
            // }).get()
            obj = JSON.parse(jsonCoords);
            var lng = [];
            var lat = [];
            for (var i = 0; i < Object.keys(obj).length; i++) {
              lng[i] = obj[i].geometry.coordinates[0];
              lat[i] = obj[i].geometry.coordinates[1];
            }
            // add each line in a datatable
            for (var i = 0; i < lng.length; i++) {
              table.row.add([ nrow , lng[i], lat[i], start_date1, end_date1, "No label" ]).draw();
              nrow += 1;
            }
            
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

  //----- change the input mode, if point or polygon
  $('[name=mode-options]').change(function () {
    // hide inputs, divs ... for each mode-options
    $('#lat').toggle(this.value !== 'polygon');
    $('#long').toggle(this.value !== 'polygon');
    $('#showLatLong').toggle(this.value !== 'polygon');
    $('#band').toggle(this.value !== 'polygon');
    $('#band_shp').toggle(this.value !== 'point');
    $('#title-chart-filter').toggle(this.value !== 'polygon');
    $('#filter').toggle(this.value !== 'polygon');
    $('#filter-group').toggle(this.value !== 'polygon');
    $('#filter-whit').toggle(this.value !== 'polygon');
    $('#filter-sg').toggle(this.value !== 'polygon');
    $('#submitbuttonfilter').toggle(this.value !== 'polygon');

    if ($('#get-point').is(':checked')) {

      map.on('click', addMarker);
      drawnItems.clearLayers();
      turfLayer.clearLayers();
      map.removeControl(drawControlFull);

      // https://stackoverflow.com/questions/9240854/jquery-function-executed-more-than-once
      $("#submitbutton").unbind('click').click( function (e) {
        e.preventDefault();
        timeSeriesRaw();
        //$(this).off('click');
      });
    }
    else if ($('#get-polygon').is(':checked')) {

      map.off("click", addMarker)
      map.removeLayer(newMarker);
      map.addControl(drawControlFull);

      $("#submitbutton").unbind('click').click( function (e) {
        e.preventDefault();
        timeSeriesShp();
        //$(this).off('click');
      });
    }
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


$(function() {
  $('a[name=about]').on('click', function(e){
      e.preventDefault();
      $('#modal').load(this.href).dialog({ modal : true });
});
});
