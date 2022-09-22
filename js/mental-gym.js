let currPage = -1;
let currActive = -1;
let selIndex = -1;
let arousalRunning = false;
const iframeIntervalTimeVal = 1000;
const breathingIntervalTimeVal = 30;

let curBreatheTime = 0;
let curMultiBreatheTime = 0;
let curBreatheTotalTime = 0;
let curMultiBreatheTotalTime = 0;
let mentalRelaxationRewardPoint = 0;

let aTime = 0;
let bTime = 0;
let bPreVal = 0;
let cTime = 0;
let cPreVal = 0;
let dTime = [0, 0, 0];
let dPreVal = [0, 0, 0];

let bodyRelaxationRewardPoint = 0;
let previousTemperatureValue = 0;
let greatestTempValue = 0;
let mindBodyBalanceRewardPoint = 0;
let multi_lf_dominantCount = 0;
let balance_lf_dominantCount = 0;
let hrv_lf_dominantCount = 0;
let notePosition = 0;
let temporaryTemperatureValue = 0;
let greatestTempValueInCelsius = 0;

const increaseVal = 0.5;
const itemsCount = 1500;

let isSoundEnable = false;
let isPreviousArousalValueReplaced = false;
let lastHandled = false;
let iframeLoaded = false;
let heartRateRunning = false;
let tempRunning = false;
let breatheRunning = false;

let isSoundTriggered = true;
let isCelsius = true;

const noteList = [
  'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'
];
let breatheData = [];

/**
 * Document query selector
 *
 * @param selector
 * @returns {*}
 * @private
 */
const _el = (selector) => document.querySelector(selector);

const arousalVideo = _el('#arousalVideo');
const arousalIframe = _el('#arousalIframe');
const tempVideo = _el('#TempVideo');
const tempIframe = _el('#TempIframe');
const tempValue = _el('#temp-value');
const sliderPercent = _el('#SliderPercent');
const sliderCircle = _el('#SliderCircle');
const balanceSliderPercent = _el('#BalanceSliderPercent');
const bloodPressureVideo = _el('#bloodPressureVideo');
const bloodPressureIframe = _el('#bloodPressureIframe');
const balanceSliderCircle = _el('#BalanceSliderCircle');
const bodyRelaxationPoint = _el('#bodyRelaxationPoint');
const arousalAnimVideo = _el('.arousalAnimVideo');
const hrvVideoContainer = _el('.hrvVideoContainer');
const hrvVideo = _el('#hrvVideo');
const hrvIframe = _el('#hrvIframe');

let arousalRewardPoint = null;
let setReward = null;
let initArousal = null;
let breathingInterval = null;
let arousalChart = null;
let hrvChart = null;
let tempChart = null;

let previousArousalValue = null;
let iframeReloadInterval = null;
let bloodPressureChart1_2 = null;
let bloodPressureChart2 = null;

let multiArousalChart = null;
let multiTempChart = null;
let multiBeatChart = null;

let initTemp = null;
let initHr = null;
let initBp = null;
let initTempInCelsius = null;
let initTempInFahrenheit = null;
let balanceBar = null;
let hrvBar = null;

const asc = (arr) => arr.sort((a, b) => a - b);

const quantile = (sorted, q) => {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + (pos - base) * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}

/**
 * Display selected page and push to history
 *
 * @param index
 */
function showSelectedPage(index) {
  selIndex = index;
  currPage = index;
  _el("[data-pageindex='" + index + "']").style.display = 'block';
  
  history.pushState(
    {state: index},
    "State " + index,
    "?state=" + index
  );
}

/**
 * Set page to hidden
 */
function setPageHidden() {
  _el("[data-pageindex='" + selIndex + "']").style.transform = 'translateY(0vh)';
  
  if (!_el('.Page').classList.contains('hidden')) {
    _el('.Page').classList += ' hidden';
  }
  
  switch (selIndex) {
    case 0:
      aTime = 0;
      mentalRelaxationRewardPoint = 0;
      loadArousal();
      break;
    case 1:
      hrv_lf_dominantCount = 0;
      bTime = 0;
      loadHRV();
      renderBreathePath();
      break;
    case 2:
      cTime = 0;
      loadTemp();
      break;
    case 3:
      dTime = [0, 0, 0];
      loadMultiChannel();
      renderMultiBreathePath();
      break;
    case 4:
      multi_lf_dominantCount = 0;
      balance_lf_dominantCount = 0;
      loadBloodPressure();
      break;
  }
}

function emitSound() {
  if (!isSoundTriggered) {
    return;
  }
  isSoundTriggered = false;
  // const synth = new Tone.Synth().toDestination();
  // synth.triggerAttackRelease(noteList[notePosition], "4n");
  setTimeout(() => {
    isSoundTriggered = true;
  }, 500);
}

/**
 * Update cookie value and render breathe path
 *
 * @param el
 * @param c_name
 * @param operator
 */
function updateCookie(el, c_name, operator) {
  el.innerHTML = parseFloat(el.innerHTML) + (increaseVal * operator);
  setCookie(c_name, el.innerHTML, exDays);
  renderBreathePath();
}

function setActivePage(j) {
  currActive = j;
  currPage = j;
  selIndex = j;
  
  const elems = _el('.TrainingOptions').children;
  for (let i = 0; i < elems.length; i++) {
    if (i !== j) {
      _el("[data-pageindex='" + i + "']").style.display = 'none';
    }
  }
}

/**
 * iFrame handle message
 *
 * @param msg
 */
function handleMessage(msg) {
  if (currActive === -1) return;
  if (!msg.data) return;
  
  let data = JSON.parse(msg.data);
  if (!data && !data.values) return;
  
  lastHandled = true;
  iframeLoaded = true;
  for (let v = 0; v < data.values.length; v++) {
    switch (currActive) {
      case 0:
        if (!arousalRunning) continue;
        const val = parseInt(data.values[v].gs);
        if (isNaN(val)) {
          continue;
        }
        if (initArousal === null) {
          initArousal = val;
          notePosition = 21;
          aTime = 0;
        } else {
          if (arousalVideo.style.display !== 'none') arousalVideo.pause();
          else
            arousalIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
          
          if (arousalAnimVideo.getBoundingClientRect().width !== 0 && initArousal > val) {
            if (arousalVideo.style.display !== 'none') arousalVideo.play();
            else
              arousalIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "playVideo" + '","args":""}',
                "*"
              );
          }
        }
        
        if (arousalChart) {
          arousalChart.series[0].update({
            zones: [
              {
                value: initArousal,
                color: "#67caf2",
              },
              {
                color: "#ff8382",
              },
            ],
          });
          
          if (arousalChart.series[0].data.length >= itemsCount)
            arousalChart.series[0].addPoint([aTime, val], true, true);
          else arousalChart.series[0].addPoint([aTime, val], true, false);
        }
        
        notePosition = Math.floor(((val - 25000) / 5000) * noteList.length);
        _el('#ArousalVal').innerHTML = 'AROUSAL LEVEL = ' + val;
        
        if (initArousal > val) {
          if (arousalRewardPoint === null) {
            arousalRewardPoint = setTimeout(() => {
              mentalRelaxationRewardPoint += 0.5;
              arousalRewardPoint = null;
            }, 1000);
          }
        } else {
          if (arousalRewardPoint !== null && initArousal < val) {
            clearTimeout(arousalRewardPoint);
            arousalRewardPoint = null;
          }
        }
        
        if (isSoundEnable) {
          emitSound();
        }
        
        if (!isPreviousArousalValueReplaced) {
          previousArousalValue = val;
          isPreviousArousalValueReplaced = true;
          setTimeout(() => {
            isPreviousArousalValueReplaced = false;
          }, 500);
        }
        
        _el('#mentalRelaxationPoint').innerHTML = mentalRelaxationRewardPoint;
        
        aTime += 200;
        break;
      
      case 1:
        if (!heartRateRunning) continue;
        const val1 = parseInt(data.values[v].hr);
        if (!isNaN(val1)) {
          if (hrvChart.series[0].data.length >= itemsCount)
            hrvChart.series[0].addPoint([bTime, val1], true, true);
          else hrvChart.series[0].addPoint([bTime, val1], true, false);
  
          bTime += 200;
  
          if (initHr == null) initHr = val1;
          if (hrvVideoContainer.style.display !== 'none') hrvVideo.pause();
          else
            hrvIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
          
          if (_el('.HeartRateBody2').getBoundingClientRect().width !== 0 && initHr <= val1) {
            if (hrvVideoContainer.style.display !== 'none') hrvVideo.play();
            else
              hrvIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "playVideo" + '","args":""}',
                "*"
              );
          }
        }
        
        const val2 = data.values[v].v_p_p_e;
        if (isNaN(val2)) {
          continue;
        }
        
        const vlf = parseFloat(data.values[v].v_p_p_e);
        const lf = parseFloat(data.values[v].l_p_p_e);
        const hf = parseFloat(data.values[v].h_p_p_e);
        
        if (lf > hf && lf > vlf) {
          hrv_lf_dominantCount++;
          if (setReward == null) {
            setReward = setTimeout(() => {
              mindBodyBalanceRewardPoint++;
              setReward = null;
            }, 10000);
          }
        }
        
        if (setReward !== null && (lf < hf || lf < vlf)) {
          clearTimeout(setReward);
          setReward = null;
        }
        
        hrvBar.series[0].update({
          data: [
            {
              name: "VLF%",
              y: vlf,
            },
            {
              name: "LF%",
              y: lf,
            },
            {
              name: "HF%",
              y: hf,
            },
          ],
        });
        
        const lfDominant = (hrv_lf_dominantCount / (bTime / 1000)) * 100;
        _el('#charge').style.height = lfDominant + "%";
        _el('#mindBodyBalancePoint').innerHTML = mindBodyBalanceRewardPoint;
        _el('.heartRateLfDomIValue').innerHTML = lfDominant.toFixed(1);
  
        const lfDivHf = (lf / hf).toFixed(2);
        _el('#RelaxationLevelValue').innerHTML = lfDivHf;
        if (lfDivHf < 1.5) {
          sliderPercent.innerHTML = '0%';
          sliderCircle.style.left = '0%';
        } else if (lfDivHf > 2) {
          sliderPercent.innerHTML = '100%';
          sliderCircle.style.left = '100%';
        } else {
          const pct = (((lfDivHf - 1.5) / 0.5) * 100).toFixed(2);
          sliderPercent.innerHTML = pct + '%';
          sliderCircle.style.left = pct + '%';
        }
        break;
      
      case 2:
        if (!tempRunning) continue;
        const val3 = parseInt(data.values[v].tmp);
        if (isNaN(val3)) {
          continue;
        }
  
        if (initTemp === null) {
          initTemp = val3;
          initTempInCelsius = (initTemp / 100).toFixed(2);
          initTempInFahrenheit = (((initTemp / 100) * 9) / 5 + 32).toFixed(2);
          greatestTempValue = initTemp;
          if (isCelsius)
            tempValue.innerHTML = (val3 / 100).toFixed(2) + ' <sup>o</sup>C';
          else
            tempValue.innerHTML = (((val3 / 100) * 9) / 5 + 32).toFixed(2) + ' <sup>o</sup>F';
          tempChart.series[0].addPoint([cTime, val3 / 100], true, false);
        } else {
          if (tempVideo.style.display !== "none") tempVideo.pause();
          else
            tempIframe.contentWindow.postMessage(
              '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
              "*"
            );
    
          if (_el('.TempVideo').getBoundingClientRect().width !== 0 && initTemp <= val) {
            if (tempVideo.style.display !== "none") tempVideo.play();
            else
              tempIframe.contentWindow.postMessage(
                '{"event":"command","func":"' + "playVideo" + '","args":""}',
                "*"
              );
          }
    
          if (isCelsius) {
            if (val3 > greatestTempValue) {
              greatestTempValue = val3;
              greatestTempValueInCelsius = (greatestTempValue / 100).toFixed(2);
              bodyRelaxationRewardPoint = ((greatestTempValueInCelsius - initTempInCelsius) / 0.2).toFixed(0);
            }
            tempValue.innerHTML = (val3 / 100).toFixed(2) + " <sup>o</sup>C";
            bodyRelaxationPoint.innerHTML = bodyRelaxationRewardPoint;
          } else {
            if (val3 > greatestTempValue) {
              greatestTempValue = val3;
              bodyRelaxationRewardPoint = (((((val3 / 100) * 9) / 5 +  32).toFixed(2) - initTempInFahrenheit) / 0.36).toFixed(0);
            }
            tempValue.innerHTML = (((val3 / 100) * 9) / 5 + 32).toFixed(2) + " <sup>o</sup>F";
            bodyRelaxationPoint.innerHTML = bodyRelaxationRewardPoint;
          }
    
          if (tempChart.series[0].data.length >= itemsCount) {
            tempChart.series[0].addPoint([cTime, val3 / 100], true, true);
            tempChart.series[1].addPoint([cTime, ((val3 / 100) * 9) / 5 + 32], true, true);
          } else {
            tempChart.series[0].addPoint([cTime, val3 / 100], true, false);
            tempChart.series[1].addPoint([cTime, ((val3 / 100) * 9) / 5 + 32], true, false);
          }
        }
        
        if (temporaryTemperatureValue < val3) {
          previousTemperatureValue = val3;
        }
        temporaryTemperatureValue = val3;
        
        cTime += 200;
        break;
      case 3:
        
        dTime[0] += 200;
        dTime[1] += 200;
        dTime[2] += 200;
        break;
      
      case 4:
        if (!breatheRunning) continue;
        break;
    }
  }
}

/**
 * Click go back button
 */
function goBack() {
  if (currPage === -1) {
    return;
  }
  
  document
    .querySelector("[data-pageindex='" + currPage + "']").style.transform = 'translateY(100vh)';
  
  setTimeout(() => {
    document
      .querySelector("[data-pageindex='" + currPage + "']").style.display = 'none';
    if (_el('.Page').classList.contains('hidden')) {
      document
        .querySelector('.Page')
        .classList
        .remove('hidden');
    }
  }, 500);
  
  if (currPage !== 3) {
    document
      .querySelector("[data-pageindex='" + currPage + "']")
      .querySelector('video')
      .pause();
    document
      .querySelector("[data-pageindex='" + currPage + "']")
      .querySelector('iframe')
      .contentWindow.postMessage(
      '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
      "*"
    );
    document
      .querySelector("[data-pageindex='" + currPage + "']")
      .querySelector('video')
      .currentTime = 0;
  }
  
  if (currPage === 0) {
    arousalRunning = false;
  } else if (currPage === 1) {
    heartRateRunning = false;
  } else if (currPage === 2) {
    tempRunning = false;
  } else if (currPage === 4) {
    breatheRunning = false;
  }
  
  currActive = -1;
  currPage = -1;
}

/**
 * load arousal chart
 */
function loadArousal() {
  arousalChart = window.Highcharts.chart('arousalGraph', {
    legend: {enabled: false},
    title: {
      text: '',
      style: {
        color: '#ffffff',
      },
    },
    xAxis: {
      type: 'datetime',
      isDirty: true,
      labels: {
        format: '{value:%H:%M:%S}',
        style: {
          color: '#ffffff',
        },
      },
      title: {
        text: 'Time reading in seconds',
        style: {
          color: '#ffffff',
        },
      },
    },
    yAxis: {
      labels: {
        style: {
          color: '#ffffff',
        },
      },
      title: {
        text: 'Arousal value',
        style: {
          color: '#ffffff',
        },
      },
      gridLineColor: '#fff3',
    },
    plotOptions: {
      series: {
        enableMouseTracking: false,
        states: {
          hover: {
            enabled: false,
          },
        },
      },
    },
    
    tooltip: {
      enabled: false,
      valueDecimals: 2,
      shared: true,
      headerFormat: 'Session_time: {point.x:%H:%M:%S}<br/>',
    },
    rangeSelector: {
      enabled: false,
    },
    chart: {
      panning: true,
      alignTicks: false,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    navigator: {
      enabled: false,
    },
    scrollbar: {
      enabled: false,
    },
    series: [
      {
        data: [],
        zoneAxis: 'y',
        marker: {
          enabled: false,
        },
        type: 'spline'
      },
    ],
  });
}

/**
 * load hrv chart
 */
function loadHRV() {
}

/**
 * render breathe path
 */
function renderBreathePath() {
}

/**
 * load temp chart
 */
function loadTemp() {
}

/**
 * load blood pressure chart
 */
function loadBloodPressure() {
}

/**
 * Load multiple channel charts
 */
function loadMultiChannel() {

}

/**
 * render multiple breathe path
 */
function renderMultiBreathePath() {
}

function renderMultiBreatheCircle() {
}

function renderBreatheCircle() {
}

function expand(e) {
  e.style.display = 'none';
  e.parentNode.children[1].style.display = 'block';
  _el('.multiChannelBreathsCont').style.display = 'none';
  const nodes = e.parentNode.parentNode.parentNode.children;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] !== e.parentNode.parentNode) {
      nodes[i].style.display = "none";
    }
  }
  
  const parent = e.parentNode.parentNode.querySelector('.graphCont');
  if (e.parentNode.parentNode.querySelector('#MultiChannelArousalChart') !== null) {
    if (multiArousalChart != null)
      multiArousalChart.setSize(
        parent.getBoundingClientRect().width,
        parent.getBoundingClientRect().height - 20,
        false
      );
  } else if (e.parentNode.parentNode.querySelector('#MultiChannelTempChart') !== null) {
    if (multiArousalChart !== null)
      multiTempChart.setSize(
        parent.getBoundingClientRect().width,
        parent.getBoundingClientRect().height - 20,
        false
      );
  } else if (e.parentNode.parentNode.querySelector('#MultiChannelBeatChart') !== null) {
    if (multiArousalChart !== null)
      multiBeatChart.setSize(
        parent.getBoundingClientRect().width,
        parent.getBoundingClientRect().height - 20,
        false
      );
  }
}

function shrink(e) {
  e.style.display = 'none';
  e.parentNode.children[0].style.display = 'block';
  _el('.multiChannelBreathsCont').style.display = 'block';
  const nodes = e.parentNode.parentNode.parentNode.children;
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].style.display = 'flex';
  }
  
  const parent = _el("#MultiChannelArousalChart").parentNode;
  
  if (multiArousalChart !== null)
    multiArousalChart.setSize(
      parent.getBoundingClientRect().width - 20,
      parent.getBoundingClientRect().height - 20,
      false
    );
  if (multiTempChart !== null)
    multiTempChart.setSize(
      parent.getBoundingClientRect().width - 20,
      parent.getBoundingClientRect().height - 20,
      false
    );
  if (multiBeatChart !== null)
    multiBeatChart.setSize(
      parent.getBoundingClientRect().width - 20,
      parent.getBoundingClientRect().height - 20,
      false
    );
}

function mentalGymInit() {
  const firstVideo = _el('#firstVideo');
  const secondVideo = _el('#secondVideo');
  const initialAnimation = _el('.initialAnimation');
  const tap_to_unmute = _el('.tap_to_unmute');
  
  firstVideo.play();
  firstVideo.addEventListener('ended', () => {
    firstVideo.style.display = 'none';
    secondVideo.play();
    initialAnimation.style.backgroundColor = '#d3def4';
  });
  
  secondVideo.addEventListener('ended', () => {
    initialAnimation.style.display = 'none';
  });
  
  document.querySelectorAll('.backButton').forEach((element, key) => {
    element.addEventListener('click', goBack);
  });
  
  initialAnimation.addEventListener('click', () => {
    tap_to_unmute.style.display = 'none';
    secondVideo.muted = false;
  });
  
  let requestIframe = null;
  /**
   * Detect loading data from iframe
   *
   * @type {number}
   */
  iframeReloadInterval = setInterval(() => {
    if (iframeLoaded === false) {
      _el('iframe').src = 'abc';
      requestIframe = requestAnimationFrame(() => {
        _el('iframe').src = 'http://localhost:8080';
      });
    } else {
      if (requestIframe) {
        cancelAnimationFrame(requestIframe);
      }
      
      clearInterval(iframeReloadInterval);
    }
  }, iframeIntervalTimeVal);
  
  /**
   * Click show all graphs tab
   */
  _el('#showAllGraphs').addEventListener('click', () => {
    setActivePage(3);
    showSelectedPage(selIndex);
    requestAnimationFrame(() => {
      setPageHidden();
    });
  });
  
  window.onpopstate = goBack;
  
  const arousalMinimizeAnimationBtn = _el('#arousalMinimizeAnimationBtn');
  const arousalShowAnimationBtn = _el('#arousalShowAnimationBtn');
  const arousalGraph = _el('#arousalGraph');
  const arousalBodyVideoCont = _el('.arousalBodyCont').querySelector('.videoCont');
  
  arousalMinimizeAnimationBtn.addEventListener('click', () => {
    arousalBodyVideoCont.style.display = 'none';
    arousalMinimizeAnimationBtn.style.display = 'none';
    arousalShowAnimationBtn.style.display = 'block';
    if (arousalChart !== null)
      arousalChart.setSize(
        arousalGraph.getBoundingClientRect().width,
        arousalGraph.getBoundingClientRect().height,
        false
      );
  });
  
  arousalMinimizeAnimationBtn.click();
  
  arousalShowAnimationBtn.addEventListener('click', () => {
    arousalBodyVideoCont.style.display = 'block';
    arousalShowAnimationBtn.style.display = 'none';
    arousalMinimizeAnimationBtn.style.display = 'block';
    _el('#arousalChosenItemText').innerHTML = 'Choose Your Animation';
    arousalVideo.src = "";
    
    if (window.innerWidth < 768) {
      if (arousalChart !== null)
        arousalChart.setSize(
          arousalGraph.getBoundingClientRect().width,
          arousalGraph.getBoundingClientRect().height,
          false
        );
    } else {
      if (arousalChart !== null)
        arousalChart.setSize(
          arousalGraph.getBoundingClientRect().width / 2,
          arousalGraph.getBoundingClientRect().height,
          false
        );
    }
  });
  
  const balanceHideAnimationBtn = _el("#BalanceHideAnimationBtn");
  const balanceShowAnimationBtn = _el("#BalanceShowAnimationBtn");
  const bloodPressureSubGraph2 = _el("#BloodPressureSubGraph2");
  const balanceVideoCont = _el(".BloodPressureRow1").querySelector('.videoCont');
  
  balanceHideAnimationBtn.addEventListener('click', () => {
    balanceVideoCont.style.display = 'none';
    balanceHideAnimationBtn.style.display = 'none';
    balanceShowAnimationBtn.style.display = 'block';
    if (bloodPressureChart1_2 !== null)
      bloodPressureChart1_2.setSize(
        bloodPressureSubGraph2.getBoundingClientRect().width,
        bloodPressureSubGraph2.getBoundingClientRect().height,
        false
      );
  });
  balanceHideAnimationBtn.click();
  balanceShowAnimationBtn.addEventListener('click', () => {
    balanceVideoCont.style.display = 'block';
    balanceShowAnimationBtn.style.display = 'none';
    balanceHideAnimationBtn.style.display = 'block';
    if (bloodPressureChart1_2 !== null)
      bloodPressureChart1_2.setSize(
        bloodPressureSubGraph2.getBoundingClientRect().width,
        bloodPressureSubGraph2.getBoundingClientRect().height,
        false
      );
  });
  
  _el('#StartArousalButton').addEventListener('click', () => {
    arousalRunning = true;
    
    
    setActivePage(0);
    showSelectedPage(selIndex);
    requestAnimationFrame(() => {
      setPageHidden();
    });
  });
  
  const startArousalSoundButton = _el("#StartArousalSoundButton");
  const pauseArousalSoundButton = _el("#PauseArousalSoundButton");
  
  startArousalSoundButton.addEventListener('click', () => {
    isSoundEnable = true;
    pauseArousalSoundButton.style.display = 'block';
    startArousalSoundButton.style.display = 'none';
  });
  
  pauseArousalSoundButton.addEventListener('click', () => {
    isSoundEnable = false;
    startArousalSoundButton.style.display = 'block';
    pauseArousalSoundButton.style.display = 'none';
  });
  
  const InhaleVal = _el('#InhaleVal');
  const ExhaleVal = _el('#ExhaleVal');
  const Hold1Val = _el('#Hold1Val');
  const Hold2Val = _el('#Hold2Val');
  
  InhaleVal.innerHTML = getCookie('hrv_inhale');
  ExhaleVal.innerHTML = getCookie('hrv_exhale');
  Hold1Val.innerHTML = getCookie('hrv_hold');
  Hold2Val.innerHTML = getCookie('hrv_hold2');
  
  _el('#IncInhaleBtn').addEventListener('click', () => {
    updateCookie(InhaleVal, 'hrv_inhale', 1);
  });
  
  _el('#DecInhaleBtn').addEventListener('click', () => {
    updateCookie(InhaleVal, 'hrv_inhale', -1);
  });
  
  _el('#IncHold1Btn').addEventListener('click', () => {
    updateCookie(Hold1Val, 'hrv_hold', 1);
  });
  
  _el('#DecHold1Btn').addEventListener('click', () => {
    updateCookie(Hold1Val, 'hrv_hold', -1);
  });
  
  _el('#IncExhaleBtn').addEventListener('click', () => {
    updateCookie(ExhaleVal, 'hrv_exhale', 1);
  });
  
  _el('#DecExhaleBtn').addEventListener('click', () => {
    updateCookie(ExhaleVal, 'hrv_exhale', -1);
  });
  
  _el('#IncHold2Btn').addEventListener('click', () => {
    updateCookie(Hold2Val, 'hrv_hold2', 1);
  });
  
  _el('#DecHold2Btn').addEventListener('click', () => {
    updateCookie(Hold2Val, 'hrv_hold2', -1);
  });
  
  const heartRatePacerStartButton = _el('#HeartRatePacerStartButton');
  const heartRatePacerStopButton = _el('#HeartRatePacerStopButton');
  heartRatePacerStartButton.addEventListener('click', () => {
    heartRatePacerStopButton.style.pointerEvents = 'all';
    heartRatePacerStartButton.style.pointerEvents = 'none';
    
    let curBreatheLastTime = new Date();
    breathingInterval = setInterval(() => {
      curBreatheTime += (new Date() - curBreatheLastTime) / 1000;
      curBreatheLastTime = new Date();
      if (curBreatheTime > curBreatheTotalTime) {
        curBreatheLastTime = new Date();
        curBreatheTime = 0;
        renderMultiBreatheCircle();
      }
      
      renderBreatheCircle();
    }, breathingIntervalTimeVal);
  });
  
  heartRatePacerStopButton.addEventListener('click', () => {
    heartRatePacerStopButton.style.pointerEvents = 'none';
    heartRatePacerStartButton.style.pointerEvents = 'all';
    
    curBreatheTime = 0;
    clearInterval(breathingInterval);
    renderBreatheCircle();
  });
  
  if (window.addEventListener) {
    window.addEventListener("message", handleMessage, false);
  } else if (window.attachEvent) {
    // ie8
    window.attachEvent("onmessage", handleMessage);
  }
  
  _el('#StartHeartRateButton').addEventListener('click', () => {
    heartRateRunning = true;
    
    setActivePage(1);
    showSelectedPage(selIndex);
    requestAnimationFrame(() => {
      setPageHidden();
    });
  });
  
  const heartRateShowAnimationBtn = _el('#HeartRateShowAnimationBtn');
  const heartRateHideAnimationBtn = _el('#HeartRateHideAnimationBtn');
  heartRateShowAnimationBtn.addEventListener('click', () => {
    hrvVideoContainer.style.display = 'block';
    heartRateShowAnimationBtn.style.display = 'none';
    heartRateHideAnimationBtn.style.display = 'block';
    renderBreathePath();
  });
  
  heartRateHideAnimationBtn.addEventListener('click', () => {
    hrvVideoContainer.style.display = 'none';
    
    heartRateShowAnimationBtn.style.display = 'block';
    heartRateHideAnimationBtn.style.display = 'none';
  });
  heartRateHideAnimationBtn.click();
  
  _el('#StartTempButton').addEventListener('click', () => {
    tempRunning = true;
    
    setActivePage(2);
    showSelectedPage(selIndex);
    requestAnimationFrame(() => {
      setPageHidden();
    });
  });
  
  const tempShowAnimationBtn = _el('#TempShowAnimationBtn');
  const tempHideAnimationBtn = _el('#TempHideAnimationBtn');
  const tempBody2 = _el('#TempBody2');
  const tempBodyCont = _el('#TempBodyCont');
  const tempGraph = _el('.TempGraph');
  tempShowAnimationBtn.addEventListener('click', () => {
    tempBody2.style.display = 'block';
    _el('#tempChosenItemText').innerHTML = 'Choose Your Animation';
    
    tempVideo.src = '';
    if (tempChart !== null) {
      if (window.innerWidth < 768) {
        tempChart.setSize(
          tempBodyCont.getBoundingClientRect().width,
          tempGraph.getBoundingClientRect().height,
          false
        );
      } else {
        tempChart.setSize(
          tempBodyCont.getBoundingClientRect().width / 2,
          tempGraph.getBoundingClientRect().height,
          false
        );
      }
    }
    
    tempShowAnimationBtn.style.display = 'none';
    tempHideAnimationBtn.style.display = 'block';
  });
  
  tempHideAnimationBtn.addEventListener('click', () => {
    tempBody2.style.display = 'none';
    
    tempShowAnimationBtn.style.display = 'block';
    tempHideAnimationBtn.style.display = 'none';
    if (tempChart !== null) {
      tempChart.setSize(
        tempBodyCont.getBoundingClientRect().width,
        tempGraph.getBoundingClientRect().height,
        false
      );
    }
  });
  tempHideAnimationBtn.click();
  
  const startBreatheButton = _el('#StartBreatheButton');
  const pauseBreatheButton = _el('#PauseBreatheButton');
  startBreatheButton.addEventListener('click', () => {
    breatheRunning = true;
    setActivePage(4);
    startBreatheButton.style.display = 'none';
    pauseBreatheButton.style.display = 'block';
  });
  
  pauseBreatheButton.addEventListener('click', () => {
    breatheRunning = false;
    startBreatheButton.style.display = 'block';
    pauseBreatheButton.style.display = 'none';
    if (bloodPressureVideo.style.display !== 'none') bloodPressureVideo.pause();
    else
      bloodPressureIframe.contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*"
      );
  });
  
  const tempChange = _el('#tempChange');
  tempChange.addEventListener('click', () => {
    isCelsius = !isCelsius;
    if (isCelsius) {
      tempChange.innerHTML = 'F';
      if (tempChart !== null) {
        tempChart.series[0].show();
        tempChart.series[1].hide();
      }
    } else {
      tempChange.innerHTML = 'C';
      if (tempChart !== null) {
        tempChart.series[1].show();
        tempChart.series[0].hide();
      }
    }
  });
  
  new audioClass(_el('.arousalButtons'));
  new audioClass(_el('.HeartRateButtons'));
  new audioClass(_el('.TempHeadCont'));
  new audioClass(_el('.BloodPressureTitleButtons'));
  new videoDropDown(_el('.arousalAnimVideo'));
  new videoDropDown(_el('.TempVideo'));
  new videoDropDown(_el('.heartRateAnimVideo'));
  new videoDropDown(_el('.balanceAnimVideo'));
  new GuidedClass(_el('.HeartRatePacerButtons'));
}

window.addEventListener('DOMContentLoaded', () => {
  mentalGymInit();
});