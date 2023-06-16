# Keep this close to what Ex Libris uses, which currently is Node 16.17.0
# per https://github.com/ExLibrisGroup/primo-explore-devenv
FROM node:16-bullseye

# Add dependencies needed to fix problem with "npm install" of primo-explore-devenv (below) on Mac M1 ARM64,
# which does not have pre-built node-canvas packages.
# https://github.com/Automattic/node-canvas/wiki/Installation:-Ubuntu-and-other-Debian-based-systems
# Note that libgif-dev, librsvg2-dev and libjpeg-dev are optional, and only required if you want gif, svg and jpeg support, respectively.
# apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev

# Install primo-explore-devenv
# This, and the npm install, will show lots of deprecation warnings due to the old
# Ex Libris environment being used here.
WORKDIR /home/node
RUN npm install -g gulp
RUN git clone --progress --verbose https://github.com/ExLibrisGroup/primo-explore-devenv
WORKDIR /home/node/primo-explore-devenv
RUN npm install

# Expose ports
EXPOSE 8003
EXPOSE 3001

# Run, using variables passed in via docker-compose
CMD [ "/bin/bash", "-c", "node_modules/.bin/gulp run --view $VIEW --proxy $PROXY --ve" ]
