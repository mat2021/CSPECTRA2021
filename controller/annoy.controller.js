const fs = require("fs");
const mongoose = require('mongoose');
const audioDB = mongoose.model('audioDB');
const Annoy = require('annoy');

//al iniciar el programa ES GLOBAL SUCIO_FEO
annoy = new Annoy(142, 'Angular');
annoy.load("annoy.ann");
console.log("annoy ha sido leida " + annoy);

function buildVectorSpace(req, res) {
  var annoyLocal = new Annoy(142, 'Angular');
  var counter = 0;
  audioDB.find({}).stream()
    .on('data', function(doc) {
      //console.log("*******" + doc._id)
      var data = [];
      var lowlevelstatistics = doc.statistics.lowlevel;
      var keys = Object.keys(lowlevelstatistics);
      if (lowlevelstatistics["average_loudness"] != undefined)
        data.push(lowlevelstatistics["average_loudness"]);
      keys.forEach(item => {
        if (lowlevelstatistics[item].mean != undefined)
          data.push(lowlevelstatistics[item].mean);
        //else console.log(item, lowlevelstatisatics[item].mean)
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
          //console.log("vientos")
        }
      });

      counter++;
      //console.log(dflat.length);
    })
    .on('error', function(err) {
      // handle error
    })
    .on('end', function() {
      // final callback
      console.log("modelo creado");
      annoyLocal.build();
      annoyLocal.save("annoy.ann");
      annoy = annoyLocal;
      res.send("modelo ha sido actualizado");
    });
}

function test() {
  var annoyIndex1 = new Annoy(10, 'Angular');
  annoyIndex1.addItem(0, [-5.0, -4.5, -3.2, -2.8, -2.1, -1.5, -0.34, 0, 3.7, 6]);
  annoyIndex1.addItem(1, [5.0, 4.5, 3.2, 2.8, 2.1, 1.5, 0.34, 0, -3.7, -6]);
  annoyIndex1.addItem(2, [0, 0, 0, 0, 0, -1, -1, -0.2, 0.1, 0.8]);
  annoyIndex1.build();
  annoyIndex1.save("annoyPath.ann");
  var annoyIndex2 = new Annoy(10, 'Angular');
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
