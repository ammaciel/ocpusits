//$(function(){
$(document).ready(function () {

  //------------------
  // LEAFLET maps
  //------------------

    var lat1;
    var long1;
    var newMarker = {};

    //  create map object, tell it to live in 'map' div and give initial latitude, longitude, zoom values
    var map = L.map('map', {
      fullscreenControl: true
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

    // search data
    var searchControl = new L.esri.Controls.Geosearch().addTo(map);

    var results = new L.LayerGroup().addTo(map);

    searchControl.on('results', function (data) {
      results.clearLayers();
      for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));
      }
    });

    setTimeout(function () { $('.pointer').fadeOut('slow'); }, 3400);

    // icon
    var greenIcon = L.icon({
      iconUrl: 'leaf-green.png',
      iconSize: [50, 50], // size of the icon
      iconAnchor: [25, 50], // point of the icon which will correspond to marker's location
      popupAnchor: [0, -50] // point from which the popup should open relative to the iconAnchor
    });

    // new marker according to click
    newMarkerGroup = new L.LayerGroup();
    map.on('click', addMarker);
    //map.on('click', zoomTo);

    function addMarker(e){
      //Clear existing marker,
      if (newMarker !== undefined) {
        map.removeLayer(newMarker);
      }
      // Add marker to map at click location; add popup window
      newMarker = L.marker([e.latlng.lat, e.latlng.lng], {
        icon: greenIcon
      }).addTo(map).bindPopup("Latitude: " + e.latlng.lat + ", Longitude: " +  e.latlng.lng);//.openPopup;
      lat1 = e.latlng.lat;
      long1 = e.latlng.lng;
      document.getElementById('long').value = long1;
      document.getElementById('lat').value = lat1;
      console.log("Latitude: " + lat1 + ", Longitude: " + long1);
    }

    // pan region marker from input lat long
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
        icon: greenIcon
      }).addTo(map).bindPopup("Latitude: " + lat1 + ", Longitude: " + long1);//.openPopup;
    });
    

  //------------------
  // OPENCPU with R
  //------------------

 // global variable used to save the session object
  var mysession = null;
  var nrow = 0;
  var nextTab = 0;
    
  $("#services").change(function () {
    switch ($(this).val()) {
      case 'WTSS-INPE':
        $("#coverages").html("<option value='MOD13Q1'> MOD13Q1 </option>");
        $("#band").html("<option selected='selected' value='evi'> evi </option><option value='ndvi'> ndvi </option><option value='mir'> mir </option><option value='nir'> nir </option><option value='red'> red </option><option value='blue'> blue </option>");
        break;
      case 'SATVEG':
        $("#coverages").html("<option value='terra'>Terra</option><option value='aqua'>Aqua</option><option value='comb'>Combination</option>");
        //$("#band").html("<option value='evi'> evi </option><option value='ndvi'> ndvi</option>");
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
        $("#coverages").html("<option value=''>-- select one --</option>");
    }
 });

  function timeSeriesRaw() {
    var service_selected = $("#services option:selected").val();
    console.log('service: ', service_selected);
    var coverage_selected = $("#coverages option:selected").val();
    console.log('coverage: ', coverage_selected);
    var band_selected = $("#band").val();
    console.log('bands: ', band_selected);
    //disable the button to prevent multiple clicks
    $("#submitbutton").attr("disabled", "disabled");
    var req = ocpu.call("TSoperation", {
        name_service: service_selected,
        coverage: coverage_selected,
        longitude: $("#long").val(),
        latitude: $("#lat").val(),
        bands: band_selected,
        start_date: $("#from").val(),
        end_date: $("#to").val()
    }, function(session){
      mysession = session;
      console.log('data: ', mysession);
      //console.log("Latitude: " + lat1 + ", Longitude: " + long1);
      var req1 = $("#plotdiv").rplot("TSplot", {
        ts_data: mysession,
      }).always(function () { //after request complete, re-enable the button
        $("#submitbutton").removeAttr("disabled");
        // add row in table only if success plot time series
        $(function(){
          nrow+=1;
          var start_date1 = $("#from").val();
          var end_date1 = $("#to").val();
          var newRow = document.getElementById('tableSample').insertRow();
          var dataService = "<td>" + nrow + "</td><td>" + long1 + "</td><td>" + lat1 + "</td><td>" + start_date1 + "</td><td>" + end_date1 + "</td><td contenteditable='true'>"+ "No label" +"</td><td><button type='button' class='w3-large'><i class='fa fa-trash'aria-hidden='true'></i></button></td>";
          //value='Delete'
          newRow.innerHTML = dataService;
      });
      }).fail(function () { //if R returns an error, alert the error message
        alert("Failed to plot time series: " + req1.responseText);
        $("#submitbutton").removeAttr("disabled");
      });
    }).always(function () { //after request complete, re-enable the button
        $("#submitbutton").removeAttr("disabled");
      }).fail(function () { //if R returns an error, alert the error message
        alert("Failed to plot time series!\nDefine service, coverage and LatLong input!");
        $("#submitbutton").removeAttr("disabled");
      });
  }

  function timeSeriesFilter() {
    var filter_selected = $("#filter option:selected").val();
    console.log('filter: ', filter_selected);
    //disable the button to prevent multiple clicks
    $("#submitbuttonfilter").attr("disabled", "disabled");
    var req = ocpu.call("TSfilter", {
      ts_data : mysession,
      type_filter : filter_selected }, function(session){
        var req1 = $("#plotdiv").rplot("TSfilter", {
          ts_data : mysession,
          type_filter : filter_selected
        }).always(function () { //after request complete, re-enable the button
          $("#submitbuttonfilter").removeAttr("disabled");
        }).fail(function () { //if R returns an error, alert the error message
          alert("Failed to plot time series filtered: " + req1.responseText);
        });
      }).always(function () { //after request complete, re-enable the button
          $("#submitbuttonfilter").removeAttr("disabled");
        }).fail(function () { //if R returns an error, alert the error message
          alert("Failed to plot time series filtered!\nAcquire the time series first!");
        });
  }


  // //button handler
  // $("#submitbutton").on("click", function (e) {
  //   $(function () {
  //     e.preventDefault();
  //     timeSeriesRaw();
  //     nextTab += 1;
  //     console.log('tab counter: ', nextTab);
  //     // create the tab
  //     //$('<li class="nav-item"> <a href="#tab" ' + nextTab + ' " data-toggle="tab"> Tab ' + nextTab + '</a></li>').appendTo('#myTab');
  //     $('<li class="nav-item"><a class="nav-link ripple" data-toggle="tab" href="#tab' + nextTab + '" data-toggle="tab">Tab ' + nextTab + '</a></li>').appendTo('#myTab');
  //     //create the tab content
  //     //$('<div id="plotdiv"> Plot: ' + nextTab + '</div>').appendTo('#contentTab');
  //     //$('<div class="tab-pane fade" id="tab' + nextTab + '">tab' + nextTab + ' content</div>').appendTo('.tab-content');
  //     $('<div class="tab-pane fade" id="tab' + nextTab + '" id="plotdiv">tab' + nextTab + ' content<div id="plotdiv"></div></div>').appendTo('.tab-content');
  //     // make new tab active
  //     $('#myTab a:last').tab('show');
  //   });
  // });

  //button handler
  $("#submitbutton").on("click", function (e) {
      e.preventDefault();
      timeSeriesRaw();
      //addDataTable();
  });

  //button handler
  $("#submitbuttonfilter").on("click", function (e) {
      e.preventDefault();
      timeSeriesFilter();
  });
  //init
  //drawplot();

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

