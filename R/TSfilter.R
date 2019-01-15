#' @title TS Filter
#' @name TSfilter
#' @aliases TSfilter
#' @author Adeline Maciel
#'
#' @description Apply a filter over time series based on SITS package \url{https://github.com/e-sensing/sits}
#'
#' @usage TSfilter(ts_data = NULL,
#' type_filter = c("No-filter", "Whittaker", "Savitsky-Golay"),
#' wh_lambda = "1.0", wh_differences = "3", sg_order = "3",
#' sg_scale = "1")
#'
#' @param ts_data       data set with point via WTSS
#' @param type_filter   name of the filter to be applied
#' @param wh_lambda     smoothing factor to be applied (default 1.0). See sits_whittaker in sits package {sits}
#' @param wh_differences the order of differences of contiguous elements (default 3). See sits_whittaker in sits package {sits}
#' @param sg_order       filter order (default 3). See sits_sgolay in sits package {sits}
#' @param sg_scale       time scaling (default 1). See sits_sgolay in sits package {sits}
#'
#' @return Plot time series filtered
#' @export
#'
#' @importFrom sits sits_whittaker sits_sgolay sits_merge sits_plot
#' @importFrom magrittr "%>%"
#'

TSfilter <- function(ts_data = NULL, type_filter = c("No-filter", "Whittaker", "Savitsky-Golay"), wh_lambda = "1.0", wh_differences = "3", sg_order = "3", sg_scale = "1"){

  # "Original no filter"
  if(type_filter == "No-filter"){

    res <- ts_data
    return(res)
  }

  # "Whittaker filter"
  if(type_filter == "Whittaker"){

    res <- sits::sits_whittaker(data.tb = ts_data, lambda = as.numeric(wh_lambda),
                                differences = as.numeric(wh_differences)) %>%
      sits::sits_merge (ts_data)
    return(res)
  }

  # Savitsky-Golay filter
  if(type_filter == "Savitsky-Golay"){

    res <- sits::sits_sgolay(data.tb = ts_data, order = as.numeric(sg_order),
                             scale = as.numeric(sg_scale)) %>%
      sits::sits_merge (ts_data)
    return(res)
  }
}

# test <- TSoperation(name_service = "WTSS-INPE", coverage = "MOD13Q1", longitude = -56.245043, latitude = -13.224772, bands = "evi", start_date = "2004-02-14", end_date = "2018-05-12")

# test.fi <- TSfilter(ts_data = test, type_filter = "Savitsky-Golay") #Whittaker



