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
#' @importFrom jsonlite fromJSON
#' @importFrom tibble tibble
#'

TSoperationSHP <- function(name_service = c("WTSS-INPE", "SATVEG"), coverage = c("MOD13Q1", "terra", "aqua", "comb"), bands = c("ndvi", "evi", "nir", "mir", "blue", "red"), start_date = NULL, end_date = NULL, pre_filter = "1", shp_file = NULL){

  # #input validation
  name_service <- match.arg(name_service)
  coverage <- match.arg(coverage)
  #shp_file <- shp_file
  json_data <- jsonlite::fromJSON(shp_file)

  myPolygon <- tibble::tibble(longitude = numeric(),
                              latitude = numeric())

  myPolygon <- tibble::tibble(longitude = sapply(json_data$geometry$coordinates, `[[`, 1),
                               latitude = sapply(json_data$geometry$coordinates, `[[`, 2))

  if(name_service == "WTSS-INPE" & coverage == "MOD13Q1"){

    coverage_wtss.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    # point.tb <- sits::sits_get_data(coverage = coverage_wtss.tb, bands = c(bands),
    #                                 start_date = start_date, end_date = end_date,
    #                                 file = shp_file)
    points = list()
    for (i in 1:nrow(myPolygon)){
      points[[i]] <- sits::sits_get_data(coverage = coverage_wtss.tb,
                                      longitude = as.numeric(myPolygon$longitude[i]),
                                      latitude = as.numeric(myPolygon$latitude[i]),
                                      bands = bands, start_date = start_date,
                                      end_date = end_date)
    }
    point.tb <- do.call(rbind, points)
    #return(point.tb)
    data.ts <- .summary_ts(point.tb)
    return(data.ts)
  }

  if(name_service == "SATVEG" & (coverage == "terra" | coverage == "aqua" | coverage == "comb")){
    coverage_satveg.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    # point.tb <- sits::sits_get_data(coverage = coverage_satveg.tb,
    #                                 prefilter = as.character(pre_filter),
    #                                 file = shp_file)
    points = list()
    for (i in 1:nrow(myPolygon)){
      points[[i]] <- sits::sits_get_data(coverage = coverage_satveg.tb,
                                         longitude = as.numeric(myPolygon$longitude[i]),
                                         latitude = as.numeric(myPolygon$latitude[i]),
                                         prefilter = as.character(pre_filter))
    }
    point.tb <- do.call(rbind, points)
    #return(point.tb)
    data.ts <- .summary_ts(point.tb)
    return(data.ts)

  }
}


#ts_data <- TSoperationSHP(name_service = "WTSS-INPE", coverage = "MOD13Q1", bands = "evi", start_date = "2000-02-01", end_date = "2017-08-21", shp_file = json_file)

#TSoperationSHP(name_service = "SATVEG", coverage = "terra", shp_file = json_file)

#' @title TS Summary
#' @name .summary_ts
#' @aliases .summary_ts
#' @author Adeline Maciel
#'
#' @description Acquire summary of time series tibble from shapefile
#'
#' @usage .summary_ts(ts_data)
#'
#' @param ts_data  time series from polygon
#' @return Data set with summary data
#'
#' @importFrom tibble tibble
#' @importFrom stats setNames sd quantile
#'

.summary_ts <- function(ts_data){
  shp.list <- ts_data$time_series
  colnames <- c("Index","value")
  shp.list <- lapply(shp.list, stats::setNames, colnames)

  data.df <- data.frame(sapply(shp.list, `[[`, 2))

  points.df <- data.frame(
    tibble::tibble(Index = as.Date(shp.list[[1]][[1]]),
                   mean = apply(data.df, 1, mean),
                   sd = apply(data.df, 1, stats::sd),
                   ymin_sd = mean - sd,
                   ymax_sd = mean + sd,
                   quantile_25 = apply(data.df, 1,
                                       function(x) stats::quantile(x, probs=c(1/4))),
                   quantile_75 = apply(data.df, 1,
                                       function(x) stats::quantile(x, probs=c(3/4)))))
  # plot(x = data.tb$Index, y = data.tb$mean, type = "l")
  # plot.ts(data.tb)
  return(points.df)

}




