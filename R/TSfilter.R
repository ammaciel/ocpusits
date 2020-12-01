#' @title TS Filter
#' @name TSfilter
#' @aliases TSfilter
#' @author Adeline Maciel
#'
#' @description Apply a filter over time series based on SITS package \url{https://github.com/e-sensing/sits}
#'
#' @usage TSfilter(ts_data = NULL,
#' type_filter = c("No-filter", "Whittaker", "Savitsky-Golay"),
#' wh_lambda = "1.0", sg_order = "3", sg_length = "5", sg_scaling = "1")
#'
#' @param ts_data       data set with point via WTSS
#' @param type_filter   name of the filter to be applied
#' @param wh_lambda     smoothing factor to be applied (default 1.0). See sits_whittaker in sits package {sits}
#' @param sg_order      filter order (default 3). See sits_sgolay in sits package {sits}
#' @param sg_length     Filter length (must be odd, default 5). See sits_sgolay in sits package {sits}
#' @param sg_scaling    time scaling (default 1). See sits_sgolay in sits package {sits}
#'
#' @return Plot time series filtered
#' @export
#'
#' @importFrom sits sits_whittaker sits_sgolay sits_merge
#' @importFrom magrittr "%>%"
#'

TSfilter <- function(ts_data = NULL, type_filter = c("No-filter", "Whittaker", "Savitsky-Golay"), wh_lambda = "1.0", sg_order = "3", sg_length = "5", sg_scaling = "1"){

  # "Original no filter"
  if(type_filter == "No-filter"){

    res <- ts_data
    return(res)
  }

  # "Whittaker filter"
  if(type_filter == "Whittaker"){

    res <- sits::sits_whittaker(data = ts_data, lambda = as.numeric(wh_lambda), bands_suffix = "wt" ) %>%
      sits::sits_merge (ts_data)
    return(res)
  }

  # Savitsky-Golay filter
  if(type_filter == "Savitsky-Golay"){

    res <- sits::sits_sgolay(data = ts_data, order = as.numeric(sg_order), length = as.numeric(sg_length),
                             scaling = as.numeric(sg_scaling), bands_suffix = "sg" ) %>%
      sits::sits_merge (ts_data)
    return(res)
  }
}

# test <- TSoperation(name_service = "WTSS", coverage = "MOD13Q1", longitude = -56.245043, latitude = -13.224772, bands = "EVI", start_date = "2004-02-14", end_date = "2018-05-12")
# plot.ts(test$time_series[[1]]$EVI, type="l", col="black" )

# test.sg <- TSfilter(ts_data = test, type_filter = "Savitsky-Golay")
# lines(test.sg$time_series[[1]]$EVI.sg, col="red")

# test.wf <- TSfilter(ts_data = test, type_filter = "Whittaker")
# lines(test.wf$time_series[[1]]$EVI.wt, col="red")



