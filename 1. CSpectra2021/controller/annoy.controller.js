const fs = require("fs");
const mongoose = require('mongoose');
const audioDB = mongoose.model('audioDB');
const Annoy = require('annoy');

//Inicia Annoy
annoy = new Annoy(142, 'euclidean');
annoy.load("annoy.ann");
console.log("Annoy leida " + annoy);

function buildVectorSpace(req, res) {
  var annoyLocal = new Annoy(142, 'euclidean');
  var counter = 0;
  audioDB.find({}).stream()
    .on('data', function(doc) {
      var data = [];
      var lowlevelstatistics = doc.statistics.lowlevel;
      var keys = Object.keys(lowlevelstatistics);
      if (lowlevelstatistics["average_loudness"] != undefined)
        data.push(lowlevelstatistics["average_loudness"]);
      keys.forEach(item => {
        if (lowlevelstatistics[item].mean != undefined)
          data.push(lowlevelstatistics[item].mean);
      });
      //para hacer el flatten
      var dflat = data.reduce((acc, val) => acc.concat(val), []);
      annoyLocal.addItem(counter, dflat);
      //  console.log(counter);
      audioDB.findByIdAndUpdate(
        doc._id
      , {
        "annoyid": counter
      }, function(err, result) {
        if (err) {
          console.log("error" + err)
        } else {
        }
      });

      counter++;
    })
    .on('error', function(err) {
    })
    .on('end', function() {
      console.log("Modelo creado");
      annoyLocal.build();
      annoyLocal.save("annoy.ann");
      annoy = annoyLocal;
      res.send("Modelo ha sido actualizado");
    });
}

function test() {
  var annoyIndex2 = new Annoy(10, 'euclidean');
  var sum = [];

  if (annoyIndex2.load("annoyPath.ann")) {
    var v1 = annoyIndex2.getItem(0);
    var v2 = annoyIndex2.getItem(1);
    console.log('Gotten vectors:', v1, v2);

    for (var i = 0; i < v1.length; ++i) {
      sum.push(v1[i] + v2[i]);
    }

    var neighbors = annoyIndex2.getNNsByVector(sum, 10, -1, false);
    console.log('Nearest neighbors to sum', neighbors);

    var neighborsAndDistances = annoyIndex2.getNNsByVector(sum, 10, -1, true);
    console.log('Nearest neighbors to sum with distances', neighborsAndDistances);
  }
}

module.exports = {
  test,
  buildVectorSpace
};
