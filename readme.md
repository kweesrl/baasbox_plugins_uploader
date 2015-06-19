INTRO

Create, update, delete your BB plugins with grunt.


HOW TO..

0. fill Config.sources.js
1. rename and fill Config.rest.sample.js
2. fill libsToDeploy with your libs in the right order
3. grunt list 


TASK

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