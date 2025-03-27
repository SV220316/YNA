var Usrname, EEK, STATE;
var apiKey = 'AIzaSyBIS3JuuhTFQwwrqu98J4t59j9FQnTiTQ0';
var xhr = new XMLHttpRequest();
var txr = new XMLHttpRequest();

var AudioSTATE = "off";
function onld(){
    document.getElementById("overlay").innerText = "Hi there! I'm Yuna. What's on your mind today Sweetie?";
    document.getElementById("audio").muted = true;
    setupVoiceRecognition();
    document.getElementById("overlay").innerText = "Hi there! I'm Yuna. What's on your mind today Sweetie?";
    document.getElementById("audio").muted = true;
    document.getElementById("cc").style.marginTop = "1vh";
    document.getElementById("cc").style.animation = "mmg";
    document.getElementById("cc").style.animationDuration = "2s";
    document.getElementById("ic").style.animation = "fade";
    document.getElementById("ic").style.animationDuration = "2s";
    document.getElementById("ic").style.opacity = "1";
}

function Send(){
    xhr.open("POST", "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    txr.open("POST", "https://api.soundoftext.com/sounds", true);
    txr.setRequestHeader("Content-Type", "application/json");

    var overlay = document.getElementById("overlay");
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s ease-out";

    var userMessage = document.getElementById("usr_input").value;
    var chatBox = document.getElementById("conversation");
    if (!userMessage) return;

    chatBox.innerHTML += "<div class='message user'>" + userMessage + "</div>";
    chatBox.scrollTop = chatBox.scrollHeight;
    document.getElementById("usr_input").value = "";

    var requestData = {
        "contents": [{ "role": "user", "parts": [{ "text": userMessage }] }],
        "systemInstruction": { "role": "user", "parts": [{ "text": "sys_instruct" }] },
        "generationConfig": { "temperature": 1, "topK": 40, "topP": 0.95, "maxOutputTokens": 8192 }
    };
    xhr.onreadystatechange = function () {
        if(xhr.readyState === 4 && xhr.status === 200){
            var data = JSON.parse(xhr.responseText);
            var assistantMessage = "Sorry, I couldn't get a response.";
            if (data.candidates && data.candidates.length > 0 &&
                data.candidates[0].content && data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0) {
                assistantMessage = data.candidates[0].content.parts[0].text;
            }
            chatBox.innerHTML += "<div class='message bot'>" + assistantMessage + "</div>";

            txr.send(JSON.stringify({
                data: {
                    text: assistantMessage,
                    voice: "en-US"
                }
            }));

            if(AudioSTATE == "on"){
                txr.onreadystatechange = function() {
                    if(txr.readyState === 4 && txr.status === 200){
                        var input_msg = JSON.parse(txr.responseText);
                        if (input_msg.id) {
                            checkStatus(input_msg.id);
                        }
                    }
                };
            }
        }
    };
    chatBox.scrollTop = chatBox.scrollHeight;
    xhr.send(JSON.stringify(requestData));
}

function checkStatus(id) {
    var interval = setInterval(function() {
        var xxr = new XMLHttpRequest();
        xxr.open("GET", "https://api.soundoftext.com/sounds/" + id, true);
        xxr.onreadystatechange = function() {
            if (xxr.readyState === 4 && xxr.status === 200) {
                var data_output = JSON.parse(xxr.responseText);
                if (data_output.status === "Done") {
                    clearInterval(interval);
                    var audio = document.getElementById('audio');
                    audio.src = data_output.location;
                    audio.style.display = "none";
                   if(AudioSTATE == "on"){
                        document.getElementById("audio").muted = false;
                        audio.play();
                   }
                }
            }
        };
        xxr.send();
    }, 10);
}
function setupVoiceRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = function(event) {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
            document.getElementById("usr_input").value = transcript;
            resetSilenceTimer();
        };

        recognition.onend = function() {
            if (AudioSTATE === "on") {
                recognition.start();
            }
        };
    }
}

function resetSilenceTimer() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(function() {
        if (document.getElementById("usr_input").value.trim() !== "") {
            Send();
        }
    }, 5000);
}

function togAud() {
    if (AudioSTATE === "off") {
        AudioSTATE = "on";
        console.log("Audio is now on");
        if (recognition) recognition.start();
    } else {
        AudioSTATE = "off";
        console.log("Audio is now off");
        if (recognition) recognition.stop();
    }
}
