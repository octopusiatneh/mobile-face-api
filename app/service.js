require('@tensorflow/tfjs-node');
const faceapi = require("face-api.js")
const canvas = require("canvas")
const fs = require("fs")
const path = require("path")

// mokey pathing the faceapi canvas
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })

const faceDetectionNet = faceapi.nets.ssdMobilenetv1

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408
const scoreThreshold = 0.5

// MtcnnOptions
const minFaceSize = 50
const scaleFactor = 0.8

function getFaceDetectorOptions(net) {
  return net === faceapi.nets.ssdMobilenetv1
    ? new faceapi.SsdMobilenetv1Options({ minConfidence })
    : (net === faceapi.nets.tinyFaceDetector
      ? new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
      : new faceapi.MtcnnOptions({ minFaceSize, scaleFactor })
    )
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)

// simple utils to save files
const baseDir = path.resolve(__dirname, '../out')

function saveFile(fileName, buf) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir)
  }
  // this is ok for prototyping but using sync methods
  // is bad practice in NodeJS
  fs.writeFileSync(path.resolve(baseDir, fileName), buf)
}
async function detectAllLabeledFaces() {
  const labels = ["Nancy", "Suzy", "Top"];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 1; i <= 5; i++) {
        const img = await canvas.loadImage(
          `./images/${label}/${i}.jpg`
        );
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detection.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

async function run() {

  // load weights
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('weights')
  await faceapi.nets.faceRecognitionNet.loadFromDisk('weights')
  await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')

  // load the image
  const img = await canvas.loadImage('./images/testSuzy.jpg');

  // Detect face
  const results = await faceapi
    .detectSingleFace(img, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();

  // Recognize Face
  const labeledFaceDescriptors = await detectAllLabeledFaces();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5);

  const bestMatch = faceMatcher.findBestMatch(results.descriptor);
  return res = { faceAnnotations: results.detection, faceRecognitions: bestMatch.toString() };

  // Save the new canvas as image
  //saveFile('faceLandmarkDetection.jpg', out.toBuffer('image/jpeg'))
  //console.log('done, saved results to out/faceLandmarkDetection.jpg')
}

exports.detectAllFace = async (req, res) => {
  const resp = await run()
    .then(data => {
      res.send(data)
    })
};
