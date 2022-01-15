'use strict'

const init = () => {

  const audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();

  // canvasを取得
  const canvas = document.getElementById('canvas');
  // canvas.width = window.innerWidth -4;
  // canvas.height = window.innerHeight -4;

  // 適当に、ウィンドウサイズよりやや小さめに
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;

  // canvasのcontextを取得
  const canvasCtx = canvas.getContext("2d");
  // canvasCtx.fillStyle = 'rgb(16, 16, 24)';
  canvasCtx.fillStyle = 'rgb(255, 255, 255)';
  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(124, 224, 255)';

  canvasCtx.strokeStyle = 'rgb(124, 224, 255)';

  // 目盛りの設定
  const spcW = 40;            // Y軸左のスペース
  const spcH = 50;            // X軸下のスペース
  const groundW = canvas.width - spcW; // グラフ領域W
  const groundH = canvas.height - spcH;// グラフ領域H
  const groundX0 = spcW;
  const groundY0= groundH;   // 原点位置
  // const pichX = groundW / datas.length;            // X目盛ピッチ
  // const pichX = 20; //対数表示したい
  // const DmYMx = Math.pow(10, Math.ceil(Math.log(yMax) / Math.log(10)));
  // const cnstH= 210 / DmYMx;
  // const pichH = DmYMx / 4;//Y目盛ピッチ

  analyser.fftSize = 512;
  console.log("Sample Rate:", audioCtx.sampleRate);
  console.log("fftSize:", analyser.fftSize);
  // 周波数分解能を求める
  const freqReso = audioCtx.sampleRate / analyser.fftSize
  console.log("Frequency Resolution:", freqReso);
  // const pichX = audioCtx.sampleRate ;
  const pichX = freqReso;
  // console.log("pichX:", pichX);

  // X軸描画
  canvasCtx.textAlign = "left";
  canvasCtx.textBaseline = "middle";
  canvasCtx.font = "6pt Arial";
  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx
  // canvasCtx.strokeStyle = "rgb(0, 0, 0)";
  canvasCtx.moveTo( groundX0, groundY0 );
  canvasCtx.lineTo( groundX0+groundW-20, groundY0 );

  for (let i = 0; i < freqReso; i++){
  // for (let i = 0; i <freqReso ; i++){
    canvasCtx.moveTo( groundX0 + groundW * i /freqReso , groundY0 );
    canvasCtx.lineTo( groundX0 +  groundW * i/ freqReso, groundY0 + 10 );
    canvasCtx.save()
    //回転の中心を移動
    canvasCtx.translate(groundX0+  groundW * i / freqReso , groundY0 +10);
    canvasCtx.rotate( 90 * Math.PI / 180);
    canvasCtx.fillText( i* freqReso, 0, 0);
    canvasCtx.restore();
    // canvasCtx.fillText( "ffff", groundX0 + i * pichX, 300 );

  }

  canvasCtx.stroke();
  canvasCtx.fillStyle = 'rgb(255, 255, 255)';

  // 初起表示
  // canvasCtx.fillRect(spcW, spcH, groundW, groundH);
  canvasCtx.beginPath();
  canvasCtx.moveTo(spcW, groundH / 2);
  canvasCtx.lineTo(groundW, groundH / 2);
  canvasCtx.stroke();

  const upload_file = document.getElementById('uploadedFile');
  const audioEl = document.getElementById('audioController');
  audioEl.volume = 0.05;

  //
  //
  upload_file.addEventListener('change', (e) => {
    const audio_blob = e.target.files[0];

    audioEl.src = URL.createObjectURL(audio_blob);

    const AudioBufferSourceNode = audioCtx.createMediaElementSource(audioEl);
    const MediaElementAudioSourceNode = audioCtx.createBufferSource();
    console.log("createBufferSource:", MediaElementAudioSourceNode);
    console.log("createMediaElementSource", AudioBufferSourceNode)

    AudioBufferSourceNode.connect(audioCtx.destination);
    AudioBufferSourceNode.connect(analyser);

    audioEl.load()
    audioEl.play()
    MediaElementAudioSourceNode.start(0);
    draw();

  });


  const draw = () => {
    const dataArray = new Uint8Array(analyser.fftSize);
    // dataArrayが解析されたデータで満たされる
    analyser.getByteTimeDomainData(dataArray);
    // console.log("analyser", analyser)
    // console.log("dataArray", dataArray);

    /* spectrums */
    const spectrums = new Uint8Array(analyser.frequencyBinCount);  // Array size is 1024 (half of FFT size)
    analyser.getByteFrequencyData(spectrums);
    // console.log("spectrums", spectrums)

    // const sliceWidth = canvas.width / analyser.fftSize;
    const sliceWidth = canvas.width / analyser.frequencyBinCount;

    canvasCtx.beginPath();
    // canvasCtx.fillRect(spcW, spcH, groundW, groundH);
    // canvasCtx.moveTo(spcW, groundY0 + (groundH / 2));


    /* spectrums */
    const len = spectrums.length;
    canvasCtx.moveTo(groundX0, groundY0)
    for (let i = 0; i < len; i++) {
      const y = 1 - (spectrums[i] / 255);
      canvasCtx.lineTo((i / len)  * groundW + groundX0, y * groundH );
    }

    // canvasCtx.lineTo(canvas.width, groundY0 + (groundH / 2));
    canvasCtx.fillRect(spcW, spcH, groundW - spcW, groundH -spcH);

    canvasCtx.stroke();


    // 毎アニメーションでdrawを呼ぶ
    requestAnimationFrame(draw);
  }

}


window.onload = init();