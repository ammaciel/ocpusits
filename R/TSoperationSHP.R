#' @title TS Operation shapefile
#' @name TSoperationSHP
#' @aliases TSoperationSHP
#' @author Adeline Maciel
#'
#' @description Acquire time series tibble from service
#'
#' @usage TSoperationSHP(name_service = c("WTSS", "SATVEG"),
#' coverage = c("MOD13Q1", "terra", "aqua", "comb"),
#' bands = c("NDVI", "EVI", "NIR", "MIR", "BLUE", "RED"),
#' start_date = NULL, end_date = NULL, geojson_points = NULL)
#'
#' @param name_service  information of service, like WTSS or SATVEG.
#' @param coverage      name of coverage from service.
#' @param bands         set of bands from coverage
#' @param start_date    first date of interval
#' @param end_date      last date of the interval
#' @param geojson_points   receive a GeoJSON with all points from polygon
#' @return Data set with time series data
#' @export
#' @import wtss
#' @importFrom sits sits_cube sits_get_data
#' @importFrom jsonlite fromJSON
#' @importFrom tibble tibble
#'

TSoperationSHP <- function(name_service = c("WTSS", "SATVEG"), coverage = c("MOD13Q1", "terra", "aqua", "comb"), bands = c("NDVI", "EVI", "NIR", "MIR", "BLUE", "RED"), start_date = NULL, end_date = NULL, geojson_points = NULL){

  # input validation
  name_service <- match.arg(name_service)
  coverage <- match.arg(coverage)
  json_data <- jsonlite::fromJSON(geojson_points)

  myPolygon <- tibble::tibble(longitude = numeric(),
                              latitude = numeric())

  myPolygon <- tibble::tibble(longitude = sapply(json_data$geometry$coordinates, `[[`, 1),
                               latitude = sapply(json_data$geometry$coordinates, `[[`, 2))

  if(name_service == "WTSS" & coverage == "MOD13Q1"){

    cube_wtss <- sits::sits_cube(type = name_service, name = coverage, URL = "http://www.esensing.dpi.inpe.br/wtss/")
    points = list()
    for (i in 1:nrow(myPolygon)){
      points[[i]] <- sits::sits_get_data(cube = cube_wtss,
                                      longitude = as.numeric(myPolygon$longitude[i]),
                                      latitude = as.numeric(myPolygon$latitude[i]),
                                      bands = bands, start_date = start_date,
                                      end_date = end_date)
    }
    point.tb <- do.call(rbind, points)
    data.ts <- .summary_ts(point.tb)
    result <- list(point.tb[,1:5], data.ts)
    return(result)
  }

  if(name_service == "SATVEG" & (coverage == "terra" | coverage == "aqua" | coverage == "comb") ){
    cube_satveg <- sits::sits_cube(type = name_service, name = coverage)
    points = list()
    for (i in 1:nrow(myPolygon)){
      points[[i]] <- sits::sits_get_data(cube = cube_satveg,
                                         longitude = as.numeric(myPolygon$longitude[i]),
                                         latitude = as.numeric(myPolygon$latitude[i]))
    }
    point.tb <- do.call(rbind, points)
    data.ts <- .summary_ts(point.tb)
    result <- list(point.tb[,1:5], data.ts)
    return(result)
  }
}

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
                                       function(x) stats::quantile(x, probs=c(3/4)))) )
  # plot(x = data.tb$Index, y = data.tb$mean, type = "l")
  # plot.ts(data.tb)
  return(points.df)
}

# ## Example
# library("ocpusits")
# json_file <- '[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-56.29034729510528,-13.240025261100111]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-56.29034729510528,-13.2377769601908]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-56.28803758114594,-13.240025261100111]}},{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[-56.28803758114594,-13.2377769601908]}}]'

# ts_data <- TSoperationSHP(name_service = "WTSS", coverage = "MOD13Q1", bands = "evi", start_date = "2000-02-18", end_date = "2017-08-21", geojson_points = json_file)
# plot.ts(x = ts_data[[2]]$Index, y = ts_data[[2]]$mean, type = "l")

# ts_dataSV <- TSoperationSHP(name_service = "SATVEG", coverage = "terra", geojson_points = json_file)
# plot.ts(x = ts_dataSV[[2]]$Index, y = ts_dataSV[[2]]$mean, type = "l", col = "blue")




