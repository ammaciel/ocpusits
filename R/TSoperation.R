#' @title TS Operation
#' @name TSoperation
#' @aliases TSoperation
#' @author Adeline Maciel
#'
#' @description Acquire time series tibble from service
#'
#' @usage TSoperation(name_service = c("WTSS-INPE", "SATVEG"),
#' coverage = c("MOD13Q1", "terra", "aqua", "comb"), longitude = NULL,
#' latitude = NULL, bands = c("ndvi", "evi", "nir", "mir", "blue", "red"),
#' start_date = NULL, end_date = NULL, pre_filter = "1")
#'
#' @param name_service  information of service, like WTSS-INPE or SATVEG.
#' @param coverage      name of coverage from service.
#' @param longitude     longitude information.
#' @param latitude      latitude information.
#' @param bands         set of bands from coverage
#' @param start_date    first date of interval
#' @param end_date      last date of the interval
#' @param pre_filter    a string ("0" none, "1" no data correction, "2" cloud correction, "3" no data and cloud correction). Information of sits package.
#' @return Data set with time series data
#' @export
#'
#' @importFrom sits sits_coverage sits_get_data
#'

TSoperation <- function(name_service = c("WTSS-INPE", "SATVEG"), coverage = c("MOD13Q1", "terra", "aqua", "comb"), longitude = NULL, latitude = NULL, bands = c("ndvi", "evi", "nir", "mir", "blue", "red"), start_date = NULL, end_date = NULL, pre_filter = "1"){

  # #input validation
  name_service <- match.arg(name_service)
  coverage <- match.arg(coverage)

  if(name_service == "WTSS-INPE" & coverage == "MOD13Q1"){
    coverage_wtss.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(coverage = coverage_wtss.tb, longitude = as.numeric(longitude),
                                   latitude = as.numeric(latitude),
                                   bands = c(bands), start_date = start_date, end_date = end_date)
    return(point.tb)
  }

  if(name_service == "SATVEG" & (coverage == "terra" | coverage == "aqua" | coverage == "comb")){
    coverage_satveg.tb <- sits::sits_coverage(service = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(coverage = coverage_satveg.tb,
                                    longitude = as.numeric(longitude),
                                    latitude = as.numeric(latitude),
                                    prefilter = as.character(pre_filter))
    return(point.tb)
  }
}

# TSoperation(name_service = "WTSS-INPE", coverage = "MOD13Q1", longitude = -56.245043, latitude = -13.224772, bands = "evi", start_date = "2004-02-14", end_date = "2018-05-12")

# TSoperation(name_service = "SATVEG", coverage = "terra", longitude = -56.245043, latitude = -13.224772)

# as in ocpu documentation
# curl localhost:5656/ocpu/user/inpe/library/ocpusits/R/TSoperation/json -H "Content-Type: application/json" -d '{"name_service":"WTSS-INPE", "coverage":"MOD13Q1", "bands":"evi", "longitude":-56, "latitude":"-12", "start_date":"2001-01-01", "end_date":"2002-01-01"}'

# save file
# curl -o file.json localhost:5656/ocpu/user/inpe/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# only json
# curl localhost:5656/ocpu/user/inpe/library/ocputest/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# information
# curl -v localhost:5656/ocpu/user/inpe/library/ocputest/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# headers information
#curl -i -H "Accept: application/json" localhost:5656/ocpu/user/inpe/library/ocputest/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

#curl -H "Accept: application/json" localhost:5656/ocpu/user/inpe/library/ocputest/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

#curl -H "Accept: application/json" 150.163.17.239:5656/ocpu/user/inpe/library/ocputest/R/TSoperation/json -d 'name_service="WTSS-INPE"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# curl https://public.opencpu.org/ocpu/library/stats/R/rnorm/json \ -H "Content-Type: application/json" -d '{"n":3, "mean": 10, "sd":10}'
#
# curl -v https://demo.ocpu.io/stocks/R/smoothplot -d 'ticker="GOOG"&from="2013-01-01"'

