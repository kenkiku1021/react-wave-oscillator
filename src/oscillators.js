import { toHaveDisplayValue } from "@testing-library/jest-dom/dist/matchers";

const MIN_FREQ = 80;
const MAX_FREQ = 22100;
const audioContext = new AudioContext();

class CompositeOscillator {
  constructor(oscillators) {
    this.oscillators = oscillators;
  }

  value(t) {
    const v = this.oscillators.reduce((prevValue, currentOscillator) => prevValue + currentOscillator.value(t), 0);
    return v;
  }
}

class SineOscillator {
  constructor(freq=440, amp=1) {
    this.node = undefined;
    this.setFreq(freq);
    this.amp = amp;
  }

  value(t) {
    return this.amp * Math.sin(2 * Math.PI * t *this.freq);
  }

  setFreq(freq) {
    this.freq = freq;
    if(this.node) {
      this.pause();
      this.play();
    }
  }

  isValidFreq() {
    return this.freq >= MIN_FREQ && this.freq <= MAX_FREQ;
  }

  play() {
    if(this.isValidFreq()) {
      this.node = audioContext.createOscillator();
      this.node.type = "sine";
      this.node.frequency.value = this.freq;
      this.node.connect(audioContext.destination);
      this.node.start();  
    }
  }

  pause() {
    if(this.node) {
      this.node.stop();
      this.node = undefined;  
    }
  }

  isPlaying() {
    return !!this.node;
  }
}

export {CompositeOscillator, SineOscillator};