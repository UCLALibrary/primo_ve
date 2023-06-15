# Keep this close to what Ex Libris uses, which currently is Node 16.17.0
# per https://github.com/ExLibrisGroup/primo-explore-devenv
FROM node:16-bullseye

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
