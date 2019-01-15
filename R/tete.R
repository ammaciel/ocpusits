# library(sf)
# library(tidyverse)
# #setwd("~/Desktop")
#
# iowa<-st_read( dsn="~/Downloads/modis_grid", layer="sample", stringsAsFactors = F) # import data
#
# ## Make division
# r<-NULL
# for (row in 1:nrow(iowa)) {
#   r[[row]]<-st_make_grid(iowa[row,],n=c(4800,4800))
# }
#
# # Combine together
# region<-NULL
# for (row in 1:nrow(iowa)) {
#   region<-rbind(region,r[[row]]) # region[[row]] <-st_multipolygon(r[[row]])
# }
#
# region<-st_sfc(region,crs=4326) #convert to sfc
# reg_id<-data.frame(reg_id=1:length(region)) #make ID for dataframe
#
# # Make SF
# region_df<-st_sf(reg_id,region)
#
# plot(region)
#
#
# # https://stackoverflow.com/questions/50223267/dividing-individual-spatial-polygons-equally-in-r
#
