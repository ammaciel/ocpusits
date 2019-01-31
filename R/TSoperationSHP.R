#' @title TS Operation shapefile
#' @name TSoperationSHP
#' @aliases TSoperationSHP
#' @author Adeline Maciel
#'
#' @description Acquire time series tibble from service
#'
#' @usage TSoperationSHP(name_service = c("WTSS-INPE", "SATVEG"),
#' coverage = c("MOD13Q1", "terra", "aqua", "comb"),
#' bands = c("ndvi", "evi", "nir", "mir", "blue", "red"),
#' start_date = NULL, end_date = NULL, pre_filter = "1", shp_file = NULL)
#'
#' @param name_service  information of service, like WTSS-INPE or SATVEG.
#' @param coverage      name of coverage from service.
#' @param bands         set of bands from coverage
#' @param start_date    first date of interval
#' @param end_date      last date of the interval
#' @param pre_filter    a string ("0" none, "1" no data correction, "2" cloud correction, "3" no data and cloud correction). Information of sits package.
#' @param shp_file      receive a shapefile (polygon) data
#' @return Data set with time series data
#' @export
#'
#' @importFrom sits sits_coverage sits_get_data
#' @importFrom sf st_read
#'

TSoperationSHP <- function(name_service = c("WTSS-INPE", "SATVEG"), coverage = c("MOD13Q1", "terra", "aqua", "comb"), bands = c("ndvi", "evi", "nir", "mir", "blue", "red"), start_date = NULL, end_date = NULL, pre_filter = "1", shp_file = NULL){

  # #input validation
  name_service <- match.arg(name_service)
  coverage <- match.arg(coverage)
  shp_file <- shp_file # sf::st_read(rgdal::readOGR

  if(name_service == "WTSS-INPE" & coverage == "MOD13Q1"){
    coverage_wtss.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(coverage = coverage_wtss.tb, bands = c(bands),
                                    start_date = start_date, end_date = end_date,
                                    file = shp_file)
    return(point.tb)
  }

  if(name_service == "SATVEG" & (coverage == "terra" | coverage == "aqua" | coverage == "comb")){
    coverage_satveg.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(coverage = coverage_satveg.tb,
                                    prefilter = as.character(pre_filter),
                                    file = shp_file)
    return(point.tb)
  }
}


# # update.packages(ask = FALSE, checkBuilt = TRUE)
# shp_file = system.file("extdata/shapefiles/santa_cruz_minas.shp",
#                         package = "sits")
#
# ocpusits::TSoperationSHP(name_service = "WTSS-INPE", coverage = "MOD13Q1",
#                 shp_file = shp_file)
#
# coverage_wtss <- sits::sits_coverage(service = "WTSS-INPE", name = "MOD13Q1")
# shp_file <- system.file("extdata/shapefiles/santa_cruz_minas.shp", package = "sits")
# munic.tb <- sits::sits_get_data(coverage = coverage_wtss, file = shp_file)
# munic.tb
#
# sf_shape <- sf::read_sf(shp_file)
# bbox <- sf::st_bbox(sf_shape)
# longitudes_shp <- munic.tb$longitude
#
# sits::sits_plot(munic.tb)

# file_js = geojsonR::FROM_GeoJson(url_file_string = "/home/inpe/Downloads/data.geojson")
# file_js
# sp::plot(file_js)
#
# coverage_wtss <- sits::sits_coverage(service = "WTSS-INPE", name = "MOD13Q1")
# shp_file <- system.file("extdata/shapefiles/santa_cruz_minas.shp", package = "sits")
# munic.tb <- sits::sits_get_data(coverage = coverage_wtss, file = shp_file)
# munic.tb
#
# shp <- sf::st_read(shp_file)
# sp::plot(shp$geometry, lwd=0.1)
#
# sf::st_crs(shp)
# crs <- sf::st_crs(shp)
# crs$epsg == 4326




