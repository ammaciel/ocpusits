#' @title TS Plot
#' @name TSplot
#' @aliases TSplot
#' @author Adeline Maciel
#'
#' @description Plot acquired time series from service
#'
#' @usage TSplot(ts_data = NULL)
#'
#' @param ts_data       data set with point via WTSS.
#' @return Plot time series information according to the bands and time
## @export
#'
#' @importFrom sits sits_plot
# @importFrom sp plot
# @importFrom rgeos readWKT
#'

#TSplot <- function(ts_data = NULL){
TSplot <- function(ts_data = NULL){

  res <- ts_data %>%
   sits::sits_plot() # %>%
   #print()

  # wkt_file <- ts_data
  # crs <- "+proj=longlat +datum=WGS84 +no_defs +ellps=WGS84 +towgs84=0,0,0"
  #
  # sp::plot(rgeos::readWKT(text = wkt_file, p4s = crs))
}

