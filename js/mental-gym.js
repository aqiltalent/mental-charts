class MentalGym {
  constructor(props) {
    this.currPage = props.currPage;
    this.currActive = props.currActive;
    this.selIndex = props.selIndex;
    this.iframeIntervalTimeVal = 100;
  
    this.curBreatheTime = 0;
    this.curMultiBreatheTime = 0;
    this.curBreatheTotalTime = 0;
    this.curMultiBreatheTotalTime = 0;
    this.mentalRelaxationRewardPoint = 0;
    this.timeVal = 0;
    this.bodyRelaxationRewardPoint = 0;
    this.previousTemperatureValue = 0;
    this.greatestTempValue = 0;
    this.mindBodyBalanceRewardPoint = 0;
    this.ind = 0;
    this.multi_lf_dominantCount = 0;
    this.balance_lf_dominantCount = 0;
    this.hrv_lf_dominantCount = 0;
    this.notePosition = 0;
    this.increaseVal = 0.5;
    this.itemsCount = 1500;
    this.exDays = 1000;
  
    this.isSoundEnable = false;
    this.isPreviousArousalValueReplaced = false;
    this.lastHandled = false;
    this.iframeLoaded = false;
    this.arousalRunning = false;
    this.heartRateRunning = false;
    this.tempRunning = false;
    this.breatheRunning = false;
  
    this.isSoundTriggered = true;
    this.isCelsius = true;
  
    this.noteList = [
      'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
      'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'
    ];
    this.breatheData = [];
  
    this.arousalVideo = document.querySelector('#arousalVideo');
    this.arousalIframe = document.querySelector('#arousalIframe');
    this.tempVideo = document.querySelector('#TempVideo');
    this.tempIframe = document.querySelector('#TempIframe');
    this.tempValue = document.querySelector('#temp-value');
    this.sliderPercent = document.querySelector('#SliderPercent');
    this.sliderCircle = document.querySelector('#SliderCircle');
    this.balanceSliderPercent = document.querySelector('#BalanceSliderPercent');
    this.bloodPressureVideo = document.querySelector('#bloodPressureVideo');
    this.bloodPressureIframe = document.querySelector('#bloodPressureIframe');
    this.balanceSliderCircle = document.querySelector('#BalanceSliderCircle');
    this.bodyRelaxationPoint = document.querySelector('#bodyRelaxationPoint');
    this.arousalAnimVideo = document.querySelector('.arousalAnimVideo');
    this.hrvVideoContainer = document.querySelector('.hrvVideoContainer');
    this.hrvIframe = document.querySelector('#hrvIframe');
  
    this.arousalRewardPoint = null;
    this.setReward = null;
    this.initArousal = null;
    this.arousalInterval = null;
    this.hrvInterval1 = null;
    this.hrvInterval2 = null;
    this.tempInterval = null;
    this.bloodPressureInterval1 = null;
    this.bloodPressureInterval2 = null;
    this.breathingInterval = null;
    this.arousalChart = null;
    this.previousArousalValue = null;
    this.curBreatheLastTime = null;
    this.iframeReloadInterval = null;
    this.bloodPressureChart1_2 = null;
  }
  
  /**
   * Document query selector
   *
   * @param selector
   * @returns {*}
   * @private
   */
  _el(selector) {
    return document.querySelector(selector);
  }
  
  /**
   * Display selected page and push to history
   *
   * @param index
   */
  showSelectedPage(index) {
    this.currPage = index;
    this._el("[data-pageindex='" + index + "']").style.display = 'block';
    
    history.pushState(
      {state: index},
      "State " + index,
      "?state=" + index
    );
  }
  
  /**
   * Set page to hidden
   */
  setPageHidden() {
    this._el("[data-pageindex='" + this.selIndex + "']").style.transform = 'translateY(0vh)';
    
    if (!this._el('.Page').classList.contains('hidden')) {
      this._el('.Page').classList += ' hidden';
    }
  }
  
  /**
   * iFrame handle message
   *
   * @param msg
   */
  handleMessage(msg) {
  
  }
  
  /**
   * Click go back button
   */
  goBack() {
  
  }
  
  /**
   * load arousal chart
   */
  loadArousal() {
  }
  
  /**
   * load hrv chart
   */
  loadHRV() {
  }
  
  /**
   * render breathe path
   */
  renderBreathePath() {
  }
  
  /**
   * load temp chart
   */
  loadTemp() {
  }
  
  /**
   * load blood pressure chart
   */
  loadBloodPressure() {
  }
  
  /**
   * Load multiple channel charts
   */
  loadMultiChannel() {
  
  }
  
  /**
   * render multiple breathe path
   */
  renderMultiBreathePath() {
  }
  
  /**
   * Update cookie value and render breathe path
   *
   * @param el
   * @param c_name
   * @param operator
   */
  updateCookie(el, c_name, operator) {
    el.innerHTML = parseFloat(el.innerHTML) + (this.increaseVal * operator);
    setCookie(c_name, el.innerHTML, this.exDays);
    this.renderBreathePath();
  }
  
  init() {
    const firstVideo = this._el('#firstVideo');
    const secondVideo = this._el('#secondVideo');
    const initialAnimation = this._el('.initialAnimation');
    const tap_to_unmute = this._el('.tap_to_unmute');
    const _self = this;
    
    firstVideo.play();
    firstVideo.addEventListener('ended', function () {
      firstVideo.style.display = 'none';
      secondVideo.play();
      initialAnimation.style.backgroundColor = '#d3def4';
    });
    
    secondVideo.addEventListener('ended', function () {
      initialAnimation.style.display = 'none';
    });
    
    this._el('.backButton').forEach((element) => {
      element.addEventListener('click', this.goBack);
    });
    
    initialAnimation.addEventListener('click', function () {
      tap_to_unmute.style.display = 'none';
      secondVideo.muted = false;
    });
    
    /**
     * Detect loading data from iframe
     *
     * @type {number}
     */
    this.iframeReloadInterval = setInterval(() => {
      if (_self.iframeLoaded === false) {
        document.querySelector("iframe").src = "abc";
        requestAnimationFrame(() => {
          document.querySelector("iframe").src = "http://localhost:8080";
        });
      } else {
        clearInterval(_self.iframeReloadInterval);
      }
    }, _self.iframeIntervalTimeVal);
    
    /**
     * Click show all graphs tab
     */
    this._el('#showAllGraphs').addEventListener('click', () => {
      _self.selIndex = 4;
      _self.showSelectedPage(_self.selIndex);
      
      requestAnimationFrame(() => {
        _self.setPageHidden();
        
        if (_self.selIndex === 4) {
          _self.currActive = 4;
          _self.timeVal = 0;
          _self.loadMultiChannel();
          _self.renderMultiBreathePath();
        }
      });
    });
    
    const elems = this._el('.TrainingOptions').children;
    for (let i = 0; i < elems.length; i++) {
      this.selIndex = i;
      // add click event listener for each training options
      elems[i].addEventListener('click', () => {
        for (let j = 0; j < elems.length; j++) {
          if (_self.selIndex !== j) {
            _self._el("[data-pageindex='" + j + "']").style.display = 'none';
          } else {
            _self.showSelectedPage(_self.selIndex);
          }
          
          requestAnimationFrame(() => {
            _self.setPageHidden();
            _self.currActive = _self.selIndex;
            _self.timeVal = 0;
            
            switch (_self.selIndex) {
              case 0:
                _self.loadArousal();
                break;
              case 1:
                _self.hrv_lf_dominantCount = 0;
                _self.loadHRV();
                _self.renderBreathePath();
                break;
              case 2:
                _self.loadTemp();
                break;
              case 3:
                _self.multi_lf_dominantCount = 0;
                _self.balance_lf_dominantCount = 0;
                _self.loadBloodPressure();
                break;
              case 4:
                _self.loadMultiChannel();
                _self.renderMultiBreathePath();
                break;
            }
          });
        }
      });
    }
    
    window.onpopstate = this.goBack;
    
    const arousalMinimizeAnimationBtn = this._el('#arousalMinimizeAnimationBtn');
    const arousalShowAnimationBtn = this._el('#arousalShowAnimationBtn');
    const arousalGraph = this._el('#arousalGraph');
    const arousalBodyVideoCont = this._el('.arousalBodyCont').querySelector('.videoCont');
    
    arousalMinimizeAnimationBtn.addEventListener('click', () => {
      arousalBodyVideoCont.style.display = 'none';
      arousalMinimizeAnimationBtn.style.display = 'none';
      arousalShowAnimationBtn.style.display = 'block';
      if (_self.arousalChart !== null)
        _self.arousalChart.setSize(
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
      _self._el('#arousalChosenItemText').innerHTML = 'Choose Your Animation';
      _self.arousalVideo.src = "";
      
      if (window.innerWidth < 768) {
        if (_self.arousalChart !== null)
          _self.arousalChart.setSize(
            arousalGraph.getBoundingClientRect().width,
            arousalGraph.getBoundingClientRect().height,
            false
          );
      } else {
        if (_self.arousalChart !== null)
          _self.arousalChart.setSize(
            arousalGraph.getBoundingClientRect().width / 2,
            arousalGraph.getBoundingClientRect().height,
            false
          );
      }
    });
    
    const balanceHideAnimationBtn = this._el("#BalanceHideAnimationBtn");
    const balanceShowAnimationBtn = this._el("#BalanceShowAnimationBtn");
    const bloodPressureSubGraph2 = this._el("#BloodPressureSubGraph2");
    const balanceVideoCont = this._el(".BloodPressureRow1").querySelector('.videoCont');
    
    balanceHideAnimationBtn.addEventListener('click', () => {
      balanceVideoCont.style.display = 'none';
      balanceHideAnimationBtn.style.display = 'none';
      balanceShowAnimationBtn.style.display = 'block';
      if (_self.bloodPressureChart1_2 !== null)
        _self.bloodPressureChart1_2.setSize(
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
      if (_self.bloodPressureChart1_2 !== null)
        _self.bloodPressureChart1_2.setSize(
          bloodPressureSubGraph2.getBoundingClientRect().width,
          bloodPressureSubGraph2.getBoundingClientRect().height,
          false
        );
    });
    
    this._el('#StartArousalButton').addEventListener('click', () => {
      _self.arousalRunning = true;
    });
    
    const startArousalSoundButton = this._el("#StartArousalSoundButton");
    const pauseArousalSoundButton = this._el("#PauseArousalSoundButton");
    
    startArousalSoundButton.addEventListener('click', () => {
      _self.isSoundEnable = true;
      pauseArousalSoundButton.style.display = 'block';
      startArousalSoundButton.style.display = 'none';
    });
    
    pauseArousalSoundButton.addEventListener('click', () => {
      _self.isSoundEnable = false;
      startArousalSoundButton.style.display = 'block';
      pauseArousalSoundButton.style.display = 'none';
    });
    
    const InhaleVal = this._el('#InhaleVal');
    const ExhaleVal = this._el('#ExhaleVal');
    const Hold1Val = this._el('#Hold1Val');
    const Hold2Val = this._el('#Hold2Val');
    
    InhaleVal.innerHTML = getCookie('hrv_inhale');
    ExhaleVal.innerHTML = getCookie('hrv_exhale');
    Hold1Val.innerHTML = getCookie('hrv_hold');
    Hold2Val.innerHTML = getCookie('hrv_hold2');
    
    this._el('#IncInhaleBtn').addEventListener('click', () => {
      _self.updateCookie(InhaleVal, 'hrv_inhale', 1);
    });
    
    this._el('#DecInhaleBtn').addEventListener('click', () => {
      _self.updateCookie(InhaleVal, 'hrv_inhale', -1);
    });
    
    this._el('#IncHold1Btn').addEventListener('click', () => {
      _self.updateCookie(Hold1Val, 'hrv_hold', 1);
    });
    
    this._el('#DecHold1Btn').addEventListener('click', () => {
      _self.updateCookie(Hold1Val, 'hrv_hold', -1);
    });
    
    this._el('#IncExhaleBtn').addEventListener('click', () => {
      _self.updateCookie(ExhaleVal, 'hrv_exhale', 1);
    });
    
    this._el('#DecExhaleBtn').addEventListener('click', () => {
      _self.updateCookie(ExhaleVal, 'hrv_exhale', -1);
    });
    
    this._el('#IncHold2Btn').addEventListener('click', () => {
      _self.updateCookie(Hold2Val, 'hrv_hold2', 1);
    });
    
    this._el('#DecHold2Btn').addEventListener('click', () => {
      _self.updateCookie(Hold2Val, 'hrv_hold2', -1);
    });
  }
}