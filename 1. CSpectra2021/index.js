const cors = require("cors");
const express = require("express");
const app = express();
const mongoose = require('mongoose');

global.__basedir = __dirname;

var corsOptions = {
  origin: "http://localhost:3001"
};

app.use(cors(corsOptions));

require("./models/audio");

const initRoutes = require("./routes/routes");

app.use(express.static('public'));

app.use(express.urlencoded({
  extended: true
}));
initRoutes(app);

let port = 3000;

mongoose.connect('mongodb://localhost/texturasurbanasdb', function(err, res) {
  if (err) {
    console.log('ERROR: connecting to Database. ' + err);
  }
  else {
    console.log('Base de datos creadada OK');
  }
  app.listen(port, () => {
    console.log(`Running at localhost:${port}`);
  });
});
