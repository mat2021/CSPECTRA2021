const express = require("express");
const router = express.Router();
const agregador = require("../controller/agregador.controller");
const annoyer = require("../controller/annoy.controller");
const texturizador = require("../controller/texturizador.controller");


let routes = (app) => {
  router.get('/', function(req, res) {
   //res.sendFile(path.join(__dirname, '/uploadaudio.html'));
  });
  router.post("/upload", agregador.upload);
  router.get("/files", agregador.getListFiles);
  router.get("/files/:name", agregador.download);

  router.get("/annoytest", annoyer.test);
  router.get("/annoybuild", annoyer.buildVectorSpace);

  router.post("/texturabasica", texturizador.texturabasica);
  app.use(router);
};

module.exports = routes;
