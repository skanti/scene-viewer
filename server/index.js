const env = require('dotenv').config()
require('dotenv-expand')(env)
global.__basedir = __dirname;

const path = require('path');
const fs = require('fs');
const express = require('express');
const history = require('connect-history-api-fallback');
const bodyParser = require('body-parser');
const http = require('http');
const axios = require('axios');
const cors = require('cors');
const assert = require('assert').strict;
const glob = require("glob");
const { spawnSync } = require('child_process');

// express setup
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.get("/api/experiments", function (req, res, next) {
  const { project_dir } = req.query;
  const search_dir = project_dir + "/*";
  const options = { };
  spawnSync('ls', [search_dir]);
  glob(search_dir, options, function (err, experiments) {
    if (err)
      return res.send(err);
    experiments = experiments.map(x => path.basename(x));
    res.send(experiments);
  });

});

app.get("/api/outputs", function (req, res, next) {
  const { project_dir, experiment_name } = req.query;
  const search_dir = project_dir + "/" + experiment_name + "/*";
  const options = { };
  spawnSync('ls', [search_dir]);
  glob(search_dir, options, function (err, outputs) {
    if (err)
      return res.send(err);
    outputs = outputs.filter(x => fs.lstatSync(x).isDirectory());
    outputs = outputs.filter(x => x !== "lightning_logs");
    outputs = outputs.map(x => path.basename(x));
    res.send(outputs);
  });
});

app.get("/api/download", function (req, res, next) {
  const { project_dir, experiment_name, output_name, out } = req.query;
  const out_path = `${project_dir}/${experiment_name}/${output_name}/${out}.json`;
  spawnSync('ls', [out_path]);
  res.sendFile(out_path);
});

// timeout helper function
const timeout = function(s) {
  return new Promise(resolve => setTimeout(resolve, s*1000));
}

// vue client static
const middleware_static = express.static('../client/dist');
app.use(middleware_static);
app.use(history({ }));
app.use(middleware_static);


// start server
assert.ok(process.env.SERVER_HOSTNAME);
assert.ok(process.env.SERVER_PORT);
assert.ok(process.env.SERVER_URL);
let server = http.createServer(app);
console.log("hostname", process.env.SERVER_HOSTNAME)
server.listen({"port" : process.env.SERVER_PORT, host: process.env.SERVER_HOSTNAME}, () => {
  app.emit( "app_started" )
  console.log(`Server running at ${process.env.SERVER_URL}`);
});

