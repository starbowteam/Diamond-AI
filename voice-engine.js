// ==================== DIAMOND AI — VOICE GPT ENGINE v1.0 ====================
// Полный рабочий модуль для распознавания и синтеза речи.
// Работает через Web Speech API (Chrome, Edge, Safari).

(function(global) {
  'use strict';

  const LANG = 'ru-RU';
  let recognition = null;
  let isListening = false;
  let onResultCallback = null;
  let onStartCallback = null;
  let onEndCallback = null;
  let onVolumeCallback = null;
  let audioContext = null;
  let analyser = null;
  let microphoneStream = null;
  let animationFrame = null;

  // Инициализация модуля
  function init() {
    const SpeechRecognition = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Voice] Web Speech API не поддерживается в этом браузере.');
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = LANG;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResultCallback) onResultCallback(transcript);
    };

    recognition.onerror = (event) => {
      console.error('[Voice] Ошибка распознавания:', event.error);
      stopListening();
    };

    recognition.onend = () => {
      if (isListening) {
        // Режим continuous: перезапускаем, пока не остановят вручную
        try { recognition.start(); } catch(e) {}
      } else {
        stopListening();
      }
    };

    console.log('[Voice] Инициализирован Web Speech API');
  }

  // Запуск прослушивания
  async function start(callback, startCb, endCb, volumeCb) {
    if (!recognition) {
      console.error('[Voice] Модуль не инициализирован');
      return;
    }
    onResultCallback = callback;
    onStartCallback = startCb;
    onEndCallback = endCb;
    onVolumeCallback = volumeCb;

    try {
      // Запрашиваем доступ к микрофону для визуализации громкости
      microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new (global.AudioContext || global.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(microphoneStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!isListening) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const volume = avg / 128; // нормализуем до ~0..1.5
        if (onVolumeCallback) onVolumeCallback(volume);
        animationFrame = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      recognition.start();
      isListening = true;
      if (onStartCallback) onStartCallback();
    } catch (e) {
      console.error('[Voice] Ошибка доступа к микрофону:', e);
    }
  }

  // Остановка прослушивания
  function stop() {
    isListening = false;
    if (recognition) {
      try { recognition.stop(); } catch(e) {}
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(t => t.stop());
      microphoneStream = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    if (onEndCallback) onEndCallback();
  }

  // Синтез речи
  function speak(text) {
    if (!global.speechSynthesis) {
      console.warn('[Voice] SpeechSynthesis не поддерживается');
      return;
    }
    // Останавливаем текущую озвучку, если есть
    global.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    global.speechSynthesis.speak(utterance);
  }

  // Публичный API
  global.VoiceGPT = {
    init: init,
    start: start,
    stop: stop,
    speak: speak
  };

})(window);
