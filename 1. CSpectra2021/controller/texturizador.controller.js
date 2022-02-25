const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:3000/files/";
const mongoose = require('mongoose');
const audioDB = mongoose.model('audioDB');
var wavFileInfo = require('wav-file-info');
var ffmpeg = require('fluent-ffmpeg');
const yaml = require('js-yaml');
const Annoy = require('annoy');
const {
  getAudioDurationInSeconds
} = require('get-audio-duration');

const {
  v4: uuidv4
} = require('uuid');

const {
  exec
} = require("child_process");

const texturabasica = async (req, res) => {
  upload(req, res);
};

const upload = async (req, res) => {
  try {
    req.randomName = uuidv4() + "_ORIGINAL";
    await uploadFile(req, res);
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Please upload a file!"
      });
    }

    convertirAWav(req.randomName, res);
  } catch (err) {
    console.log(err);
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

function convertirAWav(filename, res) {
  try {
    var baseroot = __basedir + "/resources/static/assets/uploads/";
    var fileinput = baseroot + filename;
    var fileoutput = baseroot + filename.slice(0, -9)
    //fs.mkdirSync(baseroot + filename.slice(0,-9));
    //var fileloc = __basedir + "/resources/static/assets/uploads/filename/" + "raw"
    console.log("inicia conversion");
    ffmpeg()
      .input(fileinput)
      .audioChannels(1)
      .noVideo()
      .output(fileoutput + ".wav")
      .on('end', function() {
        console.log('Processing finished !');
        console.log("termina conversion a wav");
        analizar_audio(fileoutput + ".wav", res);
      })
      .run()
  } catch (e) {
    console.log(e.code);
    console.log(e.msg);
  }
}

function analizar_audio(filenameofpart, res) {
  console.log("entra a analisis " + filenameofpart);
  var comando = __basedir + "/streaming_extractor_freesound " + filenameofpart + " " + filenameofpart + ".json"
  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log("ya termine analisis de parte");
    obtenerSimilares(filenameofpart, res);
  });
}

async function obtenerSimilares(filenameofpart, res) {
  let statisticsFile = fs.readFileSync(filenameofpart + ".json_statistics.yaml");
  let lowlevelstatistics = yaml.load(statisticsFile)["lowlevel"];
  var data = [];
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
  var neighbors = annoy.getNNsByVector(dflat, 10, -1, false);
  console.log(neighbors);
  var neighXnombre = [];
  for (var i = 0; i < neighbors.length; i++) {
    var doc = await audioDB.findOne({
      annoyid: neighbors[i]
    }, {
      "nombre": 1,
      "statistics.sfx.duration": 1
    });
    neighXnombre.push({
      "nombre": doc.nombre,
      "dur": doc.statistics.sfx.duration
    });
  }
  console.log("done building array")
  concatenateMixed(neighXnombre, res);
}


var concatenateMixed = async function(fileNameList, res) {
  var baseroot = __basedir + "/resources/static/assets/uploads/";
  var comando = "sox "
  var outputFileName = uuidv4() + ".wav";
  var parameters = [];
  var currentTime = 0;
  fileNameList.forEach(function addInput(fileName) {
    //TODO hacer mejor crossfade en función de tamaños de audios
    if (fileName.dur > 0.5) {
      comando += fileName.nombre + " ";
      currentTime += fileName.dur;
      parameters.push(currentTime + ",0.1");
    }
  });
  comando += baseroot + outputFileName + " splice -q ";
  comando += parameters.slice(0, -1).join(" ")

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      console.log("ya termine de concatenar con error");
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log("ya termine de concatenar");

    applyFadeINOUT(outputFileName, res);
  });
}

function applyFadeINOUT(fileInput, res) {
  var baseroot = __basedir + "/resources/static/assets/uploads/";
  getAudioDurationInSeconds(baseroot + fileInput).then((duration) => {
    console.log(duration);
    comando = "sox ";
    comando += baseroot + fileInput + " ";
    comando += baseroot + fileInput.slice(0, -4) + "_FADE.wav" + " ";
    comando += 'fade ' + 0.5 + ' ' + duration + ' ' + 0.5;

    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        console.log("ya termine de fadeinout con error");
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log("ya termine de fadeinout");

      res.status(200).send({
        message: "OK", url: fileInput.slice(0, -4) + "_FADE.wav"
      });
    });
  });
}

module.exports = {
  texturabasica
};
