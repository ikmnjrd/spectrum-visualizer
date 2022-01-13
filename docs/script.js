'use strict'

const init = () => {

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  // canvasを取得
  const canvas = document.getElementById('canvas');
  // canvas.width = window.innerWidth -4;
  // canvas.height = window.innerHeight -4;

  // 適当に、ウィンドウサイズよりやや小さめに
  canvas.width = window.innerWidth * 0.6;
  canvas.height = window.innerHeight * 0.6;

  // canvasのcontextを取得
  const canvasCtx = canvas.getContext("2d");
  canvasCtx.fillStyle = 'rgb(16, 16, 24)';
  canvasCtx.fillStyle = 'rgb(255, 255, 255)';
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(124, 224, 255)';

  // 目盛りの設定
  const spcW = 40;            // Y軸左のスペース
  const spcH = 30;            // X軸下のスペース
  const groundW = canvas.width - spcW; // グラフ領域W
  const groundH = canvas.height - spcH;// グラフ領域H
  const groundX0 = spcW;
  const groundY0= groundH;   // 原点位置
  // const pichX = groundW / datas.length;            // X目盛ピッチ
  const pichX = 20; //対数表示したい
  // const DmYMx = Math.pow(10, Math.ceil(Math.log(yMax) / Math.log(10)));
  // const cnstH= 210 / DmYMx;
  // const pichH = DmYMx / 4;//Y目盛ピッチ

  // X軸描画
  // canvasCtx.textAlign = "center";
  // canvasCtx.textBaseline = "top";
  canvasCtx.strokeStyle = "rgb(0, 0, 0)";
  canvasCtx.moveTo( groundX0, groundY0 );
  canvasCtx.lineTo( groundX0+groundW-20, groundY0 );
  // 10の部分はpitchXが入っていた
  for (let i = 0; i < groundW / pichX; i++){
    canvasCtx.moveTo( groundX0 + i * pichX, groundY0 );
    canvasCtx.lineTo( groundX0 + i * pichX, groundY0 - 5 );
    canvasCtx.fillText(i, groundX0 + i * pichX, groundY0 + 2 );
  }





  canvasCtx.stroke();
  canvasCtx.restore();                    //描画条件を元に戻す
  canvasCtx.save();                       //現在の描画条件を保管
  canvasCtx.beginPath();                  //現在のパスをリセット


  // 初起表示
  // canvasCtx.fillRect(spcW, spcH, groundW, groundH);
  canvasCtx.beginPath();
  canvasCtx.moveTo(spcW, groundH / 2);
  canvasCtx.lineTo(groundW, groundH / 2);
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
    canvasCtx.fillRect(spcW, spcH, groundW, groundH);
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
      canvasCtx.lineTo(x * canvas.width + spcW, y * canvas.height + spcH);
  }

    canvasCtx.lineTo(groundW, groundH / 2);
    canvasCtx.stroke();

    canvasCtx.beginPath();


    // 毎アニメーションでdrawを呼ぶ
    requestAnimationFrame(draw);
  }


  const drawLabel =()=> {

  }
}


window.onload = init();