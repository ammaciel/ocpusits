#' @title TS Operation shapefile
#' @name TSoperation_shp
#' @aliases TSoperation_shp
#' @author Adeline Maciel
#'
#' @description Acquire time series tibble from service
#'
#' @usage TSoperation_shp(name_service = c("WTSS-INPE", "SATVEG"),
#' coverage = c("MOD13Q1", "terra", "aqua", "comb"), longitude = NULL,
#' latitude = NULL, bands = c("ndvi", "evi", "nir", "mir", "blue", "red"),
#' start_date = NULL, end_date = NULL, pre_filter = "1", shp_file = NULL)
#'
#' @param name_service  information of service, like WTSS-INPE or SATVEG.
#' @param coverage      name of coverage from service.
#' @param longitude     longitude information.
#' @param latitude      latitude information.
#' @param bands         set of bands from coverage
#' @param start_date    first date of interval
#' @param end_date      last date of the interval
#' @param pre_filter    a string ("0" none, "1" no data correction, "2" cloud correction, "3" no data and cloud correction). Information of sits package.
#' @param shp_file      receive a shapefile (polygon) data
#' @return Data set with time series data
#' @export
#'
#' @importFrom sits sits_coverage sits_get_data
#'

TSoperation_shp <- function(name_service = c("WTSS-INPE", "SATVEG"), coverage = c("MOD13Q1", "terra", "aqua", "comb"), longitude = NULL, latitude = NULL, bands = c("ndvi", "evi", "nir", "mir", "blue", "red"), start_date = NULL, end_date = NULL, pre_filter = "1", shp_file = NULL){

  # #input validation
  name_service <- match.arg(name_service)
  coverage <- match.arg(coverage)

  TSoperation(name_service = name_service, coverage = coverage, longitude = longitude, latitude = latitude, bands = bands, start_date = start_date, end_date = end_date, pre_filter = pre_filter )

  if(name_service == "WTSS-INPE" & coverage == "MOD13Q1"){
    coverage_wtss.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(coverage = coverage_wtss.tb, longitude = as.numeric(longitude),
                                    latitude = as.numeric(latitude),
                                    bands = c(bands), start_date = start_date, end_date = end_date,
                                    file = shp_file)
    return(point.tb)
  }

  if(name_service == "SATVEG" & (coverage == "terra" | coverage == "aqua" | coverage == "comb")){
    coverage_satveg.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(coverage = coverage_satveg.tb,
                                    longitude = as.numeric(longitude),
                                    latitude = as.numeric(latitude),
                                    prefilter = as.character(pre_filter),
                                    file = shp_file)
    return(point.tb)
  }
}


# coverage_wtss <- sits::sits_coverage(service = "WTSS-INPE", name = "MOD13Q1")
# shp_file <- system.file("extdata/shapefiles/santa_cruz_minas.shp", package = "sits")
# munic.tb <- sits::sits_get_data(coverage = coverage_wtss, file = shp_file)
#
# sf_shape <- sf::read_sf(shp_file)
# bbox <- sf::st_bbox(sf_shape)
# longitudes_shp <- munic.tb$longitude
#
# all(unique(longitudes_shp) > bbox["xmin"])
# all(unique(longitudes_shp) < bbox["xmax"])
#
# sits::sits_plot(munic.tb)

