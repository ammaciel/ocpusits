#' @title TS Operation
#' @name TSoperation
#' @aliases TSoperation
#' @author Adeline Maciel
#'
#' @description Acquire time series tibble from service
#'
#' @usage TSoperation(name_service = c("WTSS", "SATVEG"),
#' coverage = c("MOD13Q1", "terra", "aqua", "comb"), longitude = NULL,
#' latitude = NULL, bands = c("ndvi", "evi", "nir", "mir", "blue", "red"),
#' start_date = NULL, end_date = NULL)
#'
#' @param name_service  information of service, like WTSS or SATVEG.
#' @param coverage      name of coverage from service.
#' @param longitude     longitude information.
#' @param latitude      latitude information.
#' @param bands         set of bands from coverage
#' @param start_date    first date of interval
#' @param end_date      last date of the interval
#' @return Data set with time series data
#' @export
#' @import wtss
#' @importFrom sits sits_cube sits_get_data
#'

TSoperation <- function(name_service = c("WTSS", "SATVEG"), coverage = c("MOD13Q1", "terra", "aqua", "comb"), longitude = NULL, latitude = NULL, bands = c("ndvi", "evi", "nir", "mir", "blue", "red"), start_date = NULL, end_date = NULL){

  #input validation
  name_service <- match.arg(name_service)
  coverage <- match.arg(coverage)

  if(name_service == "WTSS" & coverage == "MOD13Q1"){
    cube_wtss <- sits::sits_cube(type = name_service, name = coverage, URL = "http://www.esensing.dpi.inpe.br/wtss/")
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(cube = cube_wtss, longitude = as.numeric(longitude),
                                   latitude = as.numeric(latitude),
                                   bands = c(bands), start_date = start_date, end_date = end_date)
    return(point.tb)
  }

  if(name_service == "SATVEG" & (coverage == "terra" | coverage == "aqua" | coverage == "comb")){
    cube_satveg <- sits::sits_cube(type = name_service, name = coverage)
    # retrieve the time series associated with the point from the WTSS server
    point.tb <- sits::sits_get_data(cube = cube_satveg,
                                    longitude = as.numeric(longitude),
                                    latitude = as.numeric(latitude))
    return(point.tb)
  }
}

# ocpusits::TSoperation(name_service = "WTSS", coverage = "MOD13Q1", longitude = -56.245043, latitude = -13.224772, bands = "evi", start_date = "2004-02-14", end_date = "2018-05-12")

# ocpusits::TSoperation(name_service = "SATVEG", coverage = "terra", longitude = -56.245043, latitude = -13.224772)

# as in ocpu documentation
# curl localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -H "Content-Type: application/json" -d '{"name_service":"WTSS", "coverage":"MOD13Q1", "bands":"evi", "longitude":-56, "latitude":"-12", "start_date":"2001-01-01", "end_date":"2002-01-01"}'

# save file
# curl -o opencpu_output_file.json localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# only json
# curl localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# information
# curl -v localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# headers information
# curl -i -H "Accept: application/json" localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# curl -H "Accept: application/json" localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# curl -H "Accept: application/json" localhost:5656/ocpu/user/adeline/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

# curl https://public.opencpu.org/ocpu/library/stats/R/rnorm/json \ -H "Content-Type: application/json" -d '{"n":3, "mean": 10, "sd":10}'

