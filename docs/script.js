'use strict'

const init = () => {

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  // canvasを取得
  const canvas = document.getElementById('canvas');
  canvas.width = 512;
  canvas.height = 288;

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
    console.log(e);
    console.log(e.target.files[0]);

    const audio_blob = e.target.files[0];

    audioEl.src = URL.createObjectURL(audio_blob);


    // audioEl.load();
    // audioEl.play();

    const fr = new FileReader();
    fr.onload = function() {
        // バイナリデータ
        const arrayBuffer = fr.result;
        console.log("arrayBuffer: ", arrayBuffer);
        decode(arrayBuffer);
    };
    fr.readAsArrayBuffer(audio_blob);

    // draw(audioEl, audio_blob);
  });



  // decode処理
  const decode = (arrayBuffer) => {
    audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
        // AudioNodeを作成
        const source = audioCtx.createBufferSource();
        const source_test = audioCtx.createMediaElementSource(audioEl);
        console.log(source_test);
        // bufferプロパティにAudioBufferを指定（????）
        // source.buffer = audioBuffer;
        // 音声出力先を指定
        source_test.connect(audioCtx.destination);
        // AnalyserNodeを指定
        source_test.connect(analyser);

        analyser.fftSize = 128;

        audioEl.play()

        // // 再生開始
        // audioEl.play()
        console.log(source);

        source.start(0);
        // audioEl.src = source;
        // audioEl.load();
        // audioEl.play();
        draw();
    });
  };

  const draw = () => {
    const dataArray = new Uint8Array(analyser.fftSize);
    console.log(dataArray);
    // dataArrayが解析されたデータで満たされる
    analyser.getByteTimeDomainData(dataArray);
    console.log(analyser)

    const sliceWidth = canvas.width / analyser.fftSize;

    canvasCtx.beginPath();
    // canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    canvasCtx.moveTo(0, canvas.height / 2);

    for (let i = 0; i < analyser.fftSize; i++) {
        var x = sliceWidth * i;
        // dataArrayの中身は0から255の数値
        var v = dataArray[i] / 128;
        var y = v * canvas.height / 2;
        canvasCtx.lineTo(x, y);
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

    // 毎アニメーションでdrawを呼ぶ
    requestAnimationFrame(draw);
  }
}


window.onload = init();