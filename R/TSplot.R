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
#' @export
#'
#' @importFrom sits sits_plot
#'

TSplot <- function(ts_data = NULL){

  res <- ts_data %>%
    sits::sits_plot() %>%
    print()

  #return nothing
  #invisible()
}
