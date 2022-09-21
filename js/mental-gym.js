class MentalGym {
  constructor(props) {
    this.currPage = props.currPage;
    this.currActive = props.currActive;
    this.selIndex = props.selIndex;
    
    this.iframeReloadInterval = null;
    this.iframeIntervalTimeVal = 100;
    this.iframeLoaded = false;
    
    this.arousalRunning = false;
    this.heartRateRunning = false;
    this.tempRunning = false;
    this.breatheRunning = false;
    this.curBreatheTime = 0;
    this.curMultiBreatheTime = 0;
    this.curBreatheLastTime = null;
    this.curBreatheTotalTime = 0;
    this.curMultiBreatheTotalTime = 0;
    this.arousalInterval = null;
    this.hrvInterval1 = null;
    this.hrvInterval2 = null;
    this.tempInterval = null;
    this.bloodPressureInterval1 = null;
    this.bloodPressureInterval2 = null;
    this.breathingInterval = null;
    this.arousalChart = null;
    this.mentalRelaxationRewardPoint = 0;
    this.isSoundEnable = false;
    this.isSoundTriggered = true;
    this.previousArousalValue = null;
    this.isPreviousArousalValueReplaced = false;
    this.notePosition = 0;
    this.noteList = [
      'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
      'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'
    ];
    this.isCelsius = true;
    this.lastHandled = false;
    this.initArousal = null;
    this.timeVal = 0;
    this.bodyRelaxationRewardPoint = 0;
    this.previousTemperatureValue = 0;
    this.greatestTempValue = 0;
    this.mindBodyBalanceRewardPoint = 0;
    this.ind = 0;
    this.multi_lf_dominantCount = 0;
    this.balance_lf_dominantCount = 0;
    
    this.breatheData = [];
    this.itemsCount = 1500;
    this.arousalVideo = document.querySelector('#arousalVideo');
    this.arousalIframe = document.querySelector('#arousalIframe');
    this.tempVideo = document.querySelector('#TempVideo');
    this.tempValue = document.querySelector('#temp-value');
    this.sliderPercent = document.querySelector('#SliderPercent');
    this.sliderCircle = document.querySelector('#SliderCircle');
    this.balanceSliderCircle = document.querySelector('#BalanceSliderCircle');
    this.bodyRelaxationPoint = document.querySelector('#bodyRelaxationPoint');
    this.arousalAnimVideo = document.querySelector('.arousalAnimVideo');
    this.hrvVideoContainer = document.querySelector('.hrvVideoContainer');
    this.arousalRewardPoint = null;
    this.setReward = null;
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
      _self.currPage = _self.selIndex = 3;
      _self._el("[data-pageindex='" + _self.selIndex + "']").style.display = 'block';
      
      history.pushState(
        {state: this.currPage},
        "State " + this.currPage,
        "?state=" + this.currPage
      );
      
      requestAnimationFrame(() => {
        _self._el("[data-pageindex='" + _self.selIndex + "']").style.transform = 'translateY(0vh)';
        
        if (!_self._el('.Page').classList.contains('hidden')) {
          _self._el('.Page').classList += ' hidden';
        }
        
        if (_self.selIndex === 3) {
          _self.currActive = 4;
          _self.timeVal = 0;
          _self.loadMultiChannel();
          _self.renderMultiBreathePath();
        }
      });
    });
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
   * Load multiple channel
   */
  loadMultiChannel() {
  
  }
  
  /**
   * render multiple breathe path
   */
  renderMultiBreathePath() {
  }
}