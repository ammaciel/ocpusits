OpenCPU App: ocpusits (OpenCPU Satellite Image Time Series)
------------------

Simple OpenCPU Application. 

The overview of the OpenCPU application architecture is here:

<table width="700" border="0">
<tr>
<td align="center" valign="center">
<img src="inst/extdata/figures/opencpu-design.png" alt="Fig. 1. Application design using OpenCPU" />
<p class="caption">
Fig. 1. Application design using OpenCPU
</p>
</td>
</tr>
</table>

With a webhook, every push to Github will be mirrored onto the OpenCPU server. You can access thin app inn http://ammaciel.ocpu.io/ocpusits/www 


## Prerequisites:

- Running [opencpu](https://www.opencpu.org/) server.
- devtools R package

## Installation and execution in RStudio

    ## In R terminal:

    library(opencpu)
    ocpu_start_server()

    ## In RStudio terminal:
    
    devtools::install_github("ammaciel/ocpusits")

    ocpusits::TSoperation(name_service = "WTSS", coverage = "MOD13Q1", longitude = -56.245043, latitude = -13.224772, bands = "evi", start_date = "2004-02-14", end_date = "2018-05-12")
    
    ## In a browser:
    http://localhost:5656/ocpu/library/ocpusits/www/

## Installation and execution via Docker

    ## In a terminal using a docker image:
    
    docker run -d -p 8004:8004 ammaciel/ocpusits

    # And then, access web page with application:
    
    http://localhost:8004/ocpu/library/ocpusits/www/

    # Lookup the container ID
    docker ps

    # Run in a terminal via docker
    docker exec -i -t container_id /bin/bash
    exit

    ## In a terminal 
    
    # Send a specific data in a POST request to the localhost (docker image)
    curl -v localhost:8004/ocpu/library/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'

    # Or sends the specified data in a POST request to the OpenCPU server
    curl -v http://ammaciel.ocpu.io/ocpusits/R/TSoperation/json -d 'name_service="WTSS"&coverage="MOD13Q1"&bands="evi"&longitude="-56"&latitude="-12"&start_date="2001-01-01"&end_date="2002-01-01"'


  
    
