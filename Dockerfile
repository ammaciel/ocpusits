FROM opencpu/base

# update sources list
RUN apt-get clean
RUN apt-get update
RUN apt-get install -y --no-install-recommends apt-utils

# install basic apps, one per line for better caching
RUN apt-get -qy install libudunits2-dev
RUN apt-get -qy install libcurl4-openssl-dev
RUN apt-get -qy install libxml2-dev
RUN apt-get -qy install gdal-bin
RUN apt-get -qy install python-gdal
RUN apt-get -qy install python3-gdal
RUN apt-get -qy install libgdal-dev
RUN apt-get -qy install libproj-dev
RUN apt-get -qy install libgeos-dev
RUN apt-get -qy install libproj-dev

# cleanup
RUN apt-get -qy autoremove

# install R packages
RUN R -e 'install.packages("devtools")'
RUN R -e 'devtools::install_github("e-sensing/sits")'
RUN R -e 'devtools::install_github("ammaciel/ocpusits")'

RUN \
echo 'Redirect /index.html /ocpu/library/ocpusits/www' > /etc/apache2/sites-enabled/app.conf
