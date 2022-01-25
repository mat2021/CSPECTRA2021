const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:3000/files/";
const mongoose = require('mongoose');
const audioDB = mongoose.model('audioDB');
//var ffmpeg = require('ffmpeg');
var wavFileInfo = require('wav-file-info');
var ffmpeg = require('fluent-ffmpeg');
const yaml = require('js-yaml');

const {
  v4: uuidv4
} = require('uuid');
var path = require('path');

const {
  exec
} = require("child_process");

function cortar_audio(filename) {
  console.log("entra a aubiocut " + filename);

  var baseroot = __basedir + "/resources/static/assets/uploads/";
  var fileinput = baseroot + filename + ".wav";
  var diroutput = baseroot + filename + "/";
  fs.mkdirSync(diroutput);
  var comando = "aubiocut " + fileinput + " -c -O specflux -t 0.6 -o " + diroutput
  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      console.log("ya termine de cortar con error");
      analizar_todos_los_audio(diroutput);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.log("ya termine de cortar");
  });
}

function analizar_todos_los_audio(diroutput) {
  fs.readdir(diroutput, function(err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function(file) {
      analizar_audio(diroutput + file)
    });
  });
}

function analizar_audio(filenameofpart) {
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
    agrega_data_a_db(filenameofpart);
  });
}

function agrega_data_a_db(filenameofpart){
      let analisisFile = fs.readFileSync(filenameofpart + ".json_frames.json");
      let audioanalisis = JSON.parse(analisisFile);
      let statisticsFile = fs.readFileSync(filenameofpart + ".json_statistics.yaml");
      let statistics = yaml.load(statisticsFile);
      console.log(statistics);
      var audioItem = new audioDB({
        nombre: filenameofpart,
        analisis: audioanalisis,
        statistics: statistics
      });

      audioItem.save(function(err, audio) {
        if (err) {
          console.log(err)
          console.log("error al grabar en db")
        } else {
          console.log("bien grabado en db hacemos fiesta")
        }
      });
}

function convertirAWav(filename) {
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
        cortar_audio(filename.slice(0, -9));
        //cortarEnSecciones(filename.slice(0,-9)); POR EL MOMENTO NO
      })
      .run()
  } catch (e) {
    console.log(e.code);
    console.log(e.msg);
  }
}

const upload = async (req, res) => {
  try {
    req.randomName = uuidv4() + "_ORIGINAL";
    await uploadFile(req, res);
    if (req.file == undefined) {
      return res.status(400).send({
        message: "Please upload a file!"
      });
    }
    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
    convertirAWav(req.randomName);
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

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function(err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  upload,
  getListFiles,
  download
};
