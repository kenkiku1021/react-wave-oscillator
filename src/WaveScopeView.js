import {useState} from "react";
import { CompositeOscillator, SineOscillator } from "./oscillators";
import agh from "agh.sprintf";

const MIN_TIME_SCALE = 1;
const MAX_TIME_SCALE = 100;
const MAX_OSCILLATORS_COUNT = 4;

function WaveScopeView() {
  const [oscillators, setOscillators] = useState([new SineOscillator()]);
  const [timeScale, setTimeScale] = useState(5); // 5ms
  const [timeScaleRatio, setTimeScaleRatio] = useState(1); // x1
  const compositeOscillator = new CompositeOscillator(oscillators);
  let width = 800;
  let height = 500;
  let valueScale = 4;
  if(window.innerWidth < width) {
    width = window.innerWidth;
    height = width * 0.75;
  }

  return <div className="wave-scope">
    <svg width={width} height={height}>
      {oscillators.map((oscillator, idx) => {
        return <WaveView 
                  width={width} 
                  height={height} 
                  oscillator={oscillator} 
                  timeScale={timeScale * timeScaleRatio} 
                  valueScale={valueScale}
                  className={`line${idx+1}`} 
                  key={`oscillator-${idx}`} />
      })}
      {oscillators.length > 1 ? 
        <WaveView 
          width={width}
          height={height}
          oscillator={compositeOscillator}
          timeScale={timeScale * timeScaleRatio}
          valueScale={valueScale}
          className="composite-line"
        /> : ""}
      <ScopeGridView width={width} height={height} />
      <text x={width-5} y={height/2 + 15} textAnchor="end" className="time-scale-text">{agh.sprintf("%.1f [ms]", timeScale * timeScaleRatio)}</text>
    </svg>

    <div className="row justify-content-center timescale-setting">
      <div className="col-4">
        <label htmlFor="time-scale-range" className="form-label">時間スケール</label>
        <input type="range" className="form-range" id="time-scale-range"
          min={MIN_TIME_SCALE} 
          max={MAX_TIME_SCALE} 
          value={timeScale}
          onChange={e => {
            const newTimeScale = Number(e.target.value);
            setTimeScale(newTimeScale);
          }} />
      </div>
      <div className="col-2">
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="inlineRadioRatio" id="inlineRadioX1" value="x1" 
            checked={timeScaleRatio === 1}
            onClick={e => {
              setTimeScaleRatio(1);
            }} />
          <label className="form-check-label" htmlFor="inlineRadioX1">×1</label>
        </div>
        <div className="form-check form-check-inline">
          <input className="form-check-input" type="radio" name="inlineRadioRatio" id="inlineRadioX10" value="x10"
            checked={timeScaleRatio === 10}
            onClick={e => {
              setTimeScaleRatio(10);
            }} />
          <label className="form-check-label" htmlFor="inlineRadioX10">×10</label>
        </div>
      </div>
    </div>

    <div className="row oscillator-settings">
      {oscillators.map((oscillator, idx) => {
        return <OscillatorSettingView oscillator={oscillator} index={idx+1} key={`oscillator-setting-${idx}`}
          onChangeFreq={newValue => {
            const newOscillators = oscillators.map((currentOscillator, i) => {
              if(i === idx) {
                const newOscillator = new SineOscillator(newValue);
                if(currentOscillator.isPlaying()) {
                  currentOscillator.pause();
                  newOscillator.play();
                }
                return newOscillator;
              }
              else {
                return currentOscillator;
              }
            });
            setOscillators(newOscillators);
          }}
          onAddOscillator={() => {
            if(oscillators.length < MAX_OSCILLATORS_COUNT) {
              const newOscillators = oscillators.map(o => o);
              newOscillators.push(new SineOscillator());
              setOscillators(newOscillators);                
            }
          }}
          onRemoveOscillator={() => {
            oscillator.pause();
            const newOscillators = oscillators.filter(o => o !== oscillator);
            setOscillators(newOscillators);
          }}
        />
      })}
    </div>

  </div>
}

function OscillatorSettingView({oscillator, index, onChangeFreq = f => f, onAddOscillator = f => f, onRemoveOscillator = f => f}) {
  const [playing, setPlaying] = useState(false);
  const freqInputClassName = "form-control " + (oscillator.isValidFreq() ? "" : "invalid-freq");

  return <div className="col-3 oscillator-setting">
    <h2 className={`text-color${index}`}>
      <div className="row">
        <div className="col">発振器 {index}</div>
        <div className="col text-end">
          {index < 4  ? <AddOscillatorBtn onAddOscillator={onAddOscillator} /> : "" }
          {index !== 1 ? <RemoveOscillatorBtn onRemoveOscillator={onRemoveOscillator} /> : ""}
        </div>
      </div>
    </h2>
    <div className="input-group mb-3">
      <input type="number" className={freqInputClassName} placeholder="周波数" aria-label="周波数" value={oscillator.freq} onChange={e => onChangeFreq(e.target.value)}  />
      <span className="input-group-text" >Hz</span>
    </div>
    <div className="text-center">
      <button type="button" className="btn btn-primary"
        onClick={e => {
          if(playing) {
            oscillator.pause();
          }
          else {
            oscillator.play();
          }
          setPlaying(!playing);
        }}>
          {playing ? "Pause" : "Play"}
        </button>
    </div>
  </div>
}

function AddOscillatorBtn({onAddOscillator = f => f}) {
  return <button type="button" className="btn btn-sm btn-secondary add-remove-btn" onClick={e => onAddOscillator()}>+</button>
}

function RemoveOscillatorBtn({onRemoveOscillator = f => f}) {
  return <button type="button" className="btn btn-sm btn-secondary add-remove-btn" onClick={e => onRemoveOscillator()}>-</button>
}

function WaveView({width, height, oscillator, timeScale, valueScale, className}) {
  const dt = (timeScale / 1000) / width;
  const dy = (height / 2) / valueScale;
  const pathList = [...Array(width)].map((n, i) => {
    const t = dt * i;
    const value = oscillator.value(t);
    const y = (height / 2) + dy * (-1 * value);
    const cmd = i === 0 ? "M" : "L";
    return `${cmd} ${i}, ${y}`;
  });
  const d = pathList.join(" ");

  return <path className={className} d={d} />
}

function ScopeGridView({width, height}) {
  return [
    <line x1={0} y1={height/2} x2={width} y2={height/2} className="axis-line" key="x-axis"></line>,
  ];
}

export {WaveScopeView};