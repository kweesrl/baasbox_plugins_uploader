//==>> grunt deploy
deploy a specific build on server

- codebase: ["ALL", "LIBS", "ENDPOINTS"], default "ALL"
- target: ["DEV", "TEST", "PROD"], default "DEV"
- build: "arbitaryString", default ""
- rmdel: true/false, default false

ex. grunt deploy -codebase=libs -target=test -build=14 -rmdl=true



//==>> grunt list
generate a proposal for Config.sources.libsToDeploy.js



//==>> grunt delete
delete a specific build on server, TODO..

- codebase: ["ALL", "LIBS", "ENDPOINTS"], default "ALL"
- target: ["DEV", "TEST", "PROD"], default "DEV"
- build: "arbitaryString", default ""

ex. grunt delete -codebase=libs -target=test -build=14