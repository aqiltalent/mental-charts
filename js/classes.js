class GuidedClass {
    constructor(div) {
        let playing = false;
        const arrow = div.querySelector(".GuidedArrow");
        const GuidedButton = div.querySelector(".GuidedButton");
        const GuidedLanguageSelector = div.querySelector(".GuidedLanguageSelector");
        const HerbrewAudio = div.querySelector(".HerbrewAudio");
        const HerbrewEnglishAudio = div.querySelector(".HerbrewEnglishAudio");
        const StopGuidedButton = div.querySelector(".StopGuidedButton");
        const GuidedArrow = div.querySelector(".GuidedArrow");
        const toggleGuidedLanguageSelector = function (e) {
            if (e.target.classList.contains("GuidedLanguageSelector"))
                return;
            if (GuidedLanguageSelector.style.display === "flex") {
                GuidedLanguageSelector.style.display = "none"
                GuidedArrow.children[0].style.transform = "rotate(0deg)"
                window.removeEventListener("click", toggleGuidedLanguageSelector)
            
            } else {
                GuidedArrow.children[0].style.transform = "rotate(180deg)"
                GuidedLanguageSelector.style.display = "flex"
            }
        };
        arrow.addEventListener("click", function(e) {
            GuidedLanguageSelector.style.display = "flex";
            window.addEventListener("click", toggleGuidedLanguageSelector)
            e.stopPropagation();
            e.preventDefault();
            return false;
        })
        GuidedLanguageSelector.addEventListener("click", function(e) {
            if (e.target.classList.contains("Herbrew")) {
                GuidedButton.setAttribute("data-lang", "Herbrew")
                if (playing) {
                    HerbrewAudio.pause();
                    HerbrewAudio.currentTime = 0;
                    HerbrewEnglishAudio.play().then(r => {});
                }
            } else if (e.target.classList.contains("English")) {
                GuidedButton.setAttribute("data-lang", "English")
                if (playing) {
                    HerbrewEnglishAudio.pause();
                    HerbrewEnglishAudio.currentTime = 0;
                    HerbrewAudio.play().then(r => {});
                }
            }
            GuidedLanguageSelector.style.display = "none";
            e.preventDefault();
            e.stopPropagation();
            return false;
        })
        GuidedButton.addEventListener("click", function() {
            const lang = GuidedButton.getAttribute("data-lang");
            StopGuidedButton.style.display = "flex";
            GuidedButton.style.display = "none";
            if (lang === "English") {
                HerbrewEnglishAudio.play().then(r => {});
                playing = true;
            } else if (lang === "Herbrew") {
                HerbrewAudio.play().then(r => {});
                playing = true;
            }
        })
        StopGuidedButton.addEventListener("click", function() {
            StopGuidedButton.style.display = "none";
            GuidedButton.style.display = "flex";
            const lang = GuidedButton.getAttribute("data-lang");
            if (lang === "English") {
                HerbrewEnglishAudio.pause();
                HerbrewEnglishAudio.currentTime = 0;
                playing = false;
            } else if (lang === "Herbrew") {
                HerbrewAudio.pause();
                HerbrewAudio.currentTime = 0;
                playing = false;
            }
        })
    }
}

class videoDropDown {
    constructor(div) {
        const chosenItem = div.querySelector(".chosenItem");
        const chosenItemText = div.querySelector(".chosenItemText");
        const dropDownContainer = div.querySelector(".dropDownContainer");
        const video = div.querySelector("video");
        const iframe = div.querySelector("iframe");
        const toggleContainer = function (e) {
            if (e.target.classList.contains("youtubeLink")) {
                e.stopPropagation();
                return false;
            }
            if (e.target.classList.contains("gear")) {
                e.target.previousSibling.style.pointerEvents = "all";
                e.target.previousSibling.focus();
                e.target.previousSibling.setSelectionRange(0, e.target.previousSibling.value.length)
                e.target.previousSibling.style.backgroundColor = "#fff";
                e.stopPropagation();
                e.target.nextSibling.style.display = "block";
                e.target.style.display = "none";
                return false;
            }
            if (e.target.classList.contains("tick")) {
                e.target.previousSibling.previousSibling.style.pointerEvents = "none";
                e.target.previousSibling.previousSibling.style.backgroundColor = "rgba(255, 255, 255, 0)";
                e.stopPropagation();
                e.target.parentNode.setAttribute("data-src", e.target.previousSibling.previousSibling.value);
                e.target.previousSibling.style.display = "block";
                e.target.style.display = "none";
                return false;
            }
            if (dropDownContainer.parentNode.classList.contains("dropdownVisible")) {
                dropDownContainer.parentNode.classList.remove("dropdownVisible")
                if (e.target.classList.contains("youtube") || e.target.className === 'youtubeLink') {
                    const url = new URL(e.target.getAttribute("data-src"));
                    const v = url.searchParams.get("v");
                    if (v === "" || v == null) {
                        alert("invalid url");
                        return;
                    }
                    iframe.setAttribute("src", "https://www.youtube.com/embed/" + v + "?loop=1&enablejsapi=1");
                    video.pause();
                    iframe.style.display = "block";
                    video.style.display = "none";
                    const isVideoPlaying = video => !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
                    if (!isVideoPlaying)
                        iframe.contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
                    chosenItemText.innerHTML = e.target.getAttribute("data-src");
                } else {
                    iframe.style.display = "none";
                    iframe.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
                    video.style.display = "block";
                    video.src = "videos/" + e.target.getAttribute("data-src");
                    chosenItemText.innerHTML = e.target.innerHTML;
                }
                window.removeEventListener("click", toggleContainer);
            
            } else {
                dropDownContainer.parentNode.classList += " dropdownVisible";
                window.addEventListener("click", toggleContainer);
            }
            e.stopPropagation();
            return false;
        };
        chosenItem.addEventListener("click", toggleContainer)
    }
}

class audioClass {
    constructor(div) {
        const arousalAddAudioBtn = div.querySelector(".AddAudioBtn");
        const arousalAudio = div.querySelector(".Audio");
        const arousalAudioFile = div.querySelector(".AudioFile");
        const arousalPauseBtn = div.querySelector(".PauseBtn");
        const arousalStopBtn = div.querySelector(".StopBtn");
        const arousalPlayBtn = div.querySelector(".PlayBtn");
        arousalAudio.muted = false;
        arousalAudioFile.addEventListener("change", () => {
            const reader = new FileReader();
            reader.onload = function(e) {
                arousalAudio.src = this.result;
            };
            reader.readAsDataURL(arousalAudioFile.files[0]);
            arousalPlayBtn.style.display = "block";
            arousalStopBtn.style.display = "block";
            arousalAddAudioBtn.style.display = "none";
            arousalPlayBtn.click();
        })
        arousalPlayBtn.addEventListener("click", () => {
            arousalAudio.play().then(() => {
                arousalAudio.muted = false;
            });
            arousalPlayBtn.style.display = "none";
            arousalPauseBtn.style.display = "block";
            arousalStopBtn.style.display = "block";
            arousalAddAudioBtn.style.display = "none";
        })
        arousalPauseBtn.addEventListener("click", () => {
            arousalAudio.pause();
            arousalPauseBtn.style.display = "none";
            arousalPlayBtn.style.display = "block";
        })
        arousalStopBtn.addEventListener("click", () => {
            arousalAudio.pause();
            arousalAudio.currentTime = 0
            arousalPauseBtn.style.display = "none";
            arousalPlayBtn.style.display = "block";
            arousalStopBtn.style.display = "none";
            arousalAddAudioBtn.style.display = "block";
        })
        const audioDropDownArrow = div.querySelector(".audioDropDownArrow");
        const audioDropDownContainer = div.querySelector(".audioDropDownContainer");
        const toggleAudioDropDown = function (e) {
            if (e.target.classList.contains("dropdownAudio"))
                return;
            if (audioDropDownContainer.style.display === "block") {
                audioDropDownArrow.children[0].style.transform = "rotate(0deg)"
                audioDropDownContainer.style.display = "none";
                window.removeEventListener("click", toggleAudioDropDown);
            } else {
                audioDropDownContainer.style.display = "block";
                audioDropDownArrow.children[0].style.transform = "rotate(180deg)"
                window.addEventListener("click", toggleAudioDropDown);
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        audioDropDownArrow.addEventListener("click", toggleAudioDropDown);
        audioDropDownContainer.addEventListener("click", function(e) {
            if (e.target.classList.contains("dropdownAudio")) {
                arousalAudio.src = e.target.getAttribute("data-src");
                audioDropDownArrow.children[0].style.transform = "rotate(0deg)"
                audioDropDownContainer.style.display = "none";
                arousalPlayBtn.style.display = "block";
                arousalStopBtn.style.display = "block";
                arousalAddAudioBtn.style.display = "none";
            }
        })
    }

}

function setCookie(c_name, value, exdays) {
    const exDate = new Date();
    exDate.setDate(exDate.getDate() + exdays);
    const c_value = encodeURIComponent(value) + ((exdays == null) ? "" : "; expires=" + exDate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}

function getCookie(c_name) {
    let i, x, y, ARRCookies = document.cookie.split(";");
    for (i = 0; i < ARRCookies.length; i++) {
        x = ARRCookies[i].slice(0, ARRCookies[i].indexOf("="));
        y = ARRCookies[i].slice(ARRCookies[i].indexOf("=") + 1);
        x = x.replace(/^\s+|\s+$/g, "");
        if (x === c_name) {
            return decodeURIComponent(y);
        }
    }
}

const exDays = 1000;

if (!getCookie('hrv_inhale')) {
    setCookie('hrv_inhale', "1", exDays);
    setCookie('hrv_hold', "3", exDays);
    setCookie('hrv_exhale', "4", exDays);
    setCookie('hrv_hold2', "2", exDays);
}

if (!getCookie('multi_inhale')) {
    setCookie('multi_inhale', "1", exDays);
    setCookie('multi_hold', "3", exDays);
    setCookie('multi_exhale', "4", exDays);
    setCookie('multi_hold2', "2", exDays);
}