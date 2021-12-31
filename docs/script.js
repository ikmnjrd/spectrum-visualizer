'use strict'

const init = () => {

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  // canvasを取得
  const canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth -4;
  canvas.height = window.innerHeight -4;

  // canvasのcontextを取得
  const canvasCtx = canvas.getContext("2d");
  canvasCtx.fillStyle = 'rgb(16, 16, 24)';
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(124, 224, 255)';
  // 初起表示
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
  canvasCtx.beginPath();
  canvasCtx.moveTo(0, canvas.height / 2);
  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();

  const upload_file = document.getElementById('uploadedFile');
  const audioEl = document.getElementById('audioController');

  upload_file.addEventListener('change', (e) => {
    const audio_blob = e.target.files[0];

    audioEl.src = URL.createObjectURL(audio_blob);

    const AudioBufferSourceNode = audioCtx.createMediaElementSource(audioEl);
    const MediaElementAudioSourceNode = audioCtx.createBufferSource();
    console.log("createBufferSource:", MediaElementAudioSourceNode);
    console.log("createMediaElementSource", AudioBufferSourceNode)

    AudioBufferSourceNode.connect(audioCtx.destination);
    AudioBufferSourceNode.connect(analyser);

    analyser.fftSize = 512;
    audioEl.load()
    audioEl.play()
    MediaElementAudioSourceNode.start(0);
    draw();

  });


  const draw = () => {
    const dataArray = new Uint8Array(analyser.fftSize);
    // dataArrayが解析されたデータで満たされる
    analyser.getByteTimeDomainData(dataArray);
    console.log("analyser", analyser)
    console.log("dataArray", dataArray);

    /* spectrums */
    const spectrums = new Uint8Array(analyser.frequencyBinCount);  // Array size is 1024 (half of FFT size)
    analyser.getByteFrequencyData(spectrums);
    console.log("spectrums", spectrums)

    // const sliceWidth = canvas.width / analyser.fftSize;
    const sliceWidth = canvas.width / analyser.frequencyBinCount;

    canvasCtx.beginPath();
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    // canvasCtx.moveTo(0, canvas.height / 2);

    /* 元のやつ */
    // for (let i = 0; i < analyser.fftSize; i++) {
    //     var x = sliceWidth * i;
    //     // dataArrayの中身は0から255の数値
    //     var v = dataArray[i] / 128;
    //     var y = v * canvas.height / 2;
    //     canvasCtx.lineTo(x, y);
    // }

    /* spectrums */
    const len = spectrums.length;
    for (let i = 0; i < len; i++) {
      const x = i / len;
      const y = 1 - (spectrums[i] / 255);
      canvasCtx.lineTo(x * canvas.width, y * canvas.height);
  }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

    // 毎アニメーションでdrawを呼ぶ
    requestAnimationFrame(draw);
  }
}


window.onload = init();