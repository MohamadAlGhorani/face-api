const video = document.getElementById('video')

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startWebcam)

function startWebcam() {
  var vid = document.querySelector('video');
  // request cam
  navigator.mediaDevices.getUserMedia({
      video: true
    })
    .then(stream => {
      // save stream to variable at top level so it can be stopped lateron
      webcamStream = stream;
      // show stream from the webcam on te video element
      vid.srcObject = stream;
      // returns a Promise to indicate if the video is playing
      return vid.play();
    })
    .then(() => {
      // enable the 'take a snap' button
      var btn = document.querySelector('#takeSnap');
      btn.disabled = false;
      // when clicked
      btn.onclick = e => {
        takeSnap()
          .then(blob => {
            analyseImage(blob, params, showResults);
          })
      };
    })
    .catch(e => console.log('error: ' + e));
}

video.addEventListener('play', () => {
  const canvas = document.createElement("canvas");
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})