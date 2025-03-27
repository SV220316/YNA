var Usrname, EEK, STATE;
var apiKey = 'AIzaSyBIS3JuuhTFQwwrqu98J4t59j9FQnTiTQ0';
var xhr = new XMLHttpRequest();
var txr = new XMLHttpRequest();

var AudioSTATE = "off";
function onld(){
    document.getElementById("overlay").innerText = "Hi there! I'm Yuna. What's on your mind today Sweetie?";
    document.getElementById("audio").muted = true;
}

function Send(){
    // Open the Model API
    xhr.open("POST", "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    //Open the TTS API
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
        // IF 200 LOGIC
        if(xhr.readyState === 4 && xhr.status === 200){
            
                //AI DATA
                var data = JSON.parse(xhr.responseText);
                var assistantMessage = "Sorry, I couldn't get a response.";
                if (data.candidates && data.candidates.length > 0 &&
                    data.candidates[0].content && data.candidates[0].content.parts &&
                    data.candidates[0].content.parts.length > 0) {
                    assistantMessage = data.candidates[0].content.parts[0].text;
                }
                chatBox.innerHTML += "<div class='message bot'>" + assistantMessage + "</div>";

                //DATA: FROM AI TO TTS
                txr.send(JSON.stringify({
                    data: {
                        text: assistantMessage,//READ AI DATA
                        voice: "en-US"
                    }
                }));

                // ENABLE TTS
                if(AudioSTATE == "on"){
                txr.onreadystatechange = function() {
                    if(txr.readyState === 4 && txr.status === 200){
                        var input_msg = JSON.parse(txr.responseText);
                        if (input_msg.id) {
                            checkStatus(input_msg.id);
                        } else {
                            document.getElementById('status').innerText = "Error: Invalid response.";
                        }
                    }
                }};
                if(AudioSTATE == "off"){
                    txr.onreadystatechange = function() {
                        if(txr.readyState === 4 && txr.status === 200){
                            var input_msg = JSON.parse(txr.text==".");
                            if (input_msg.id) {
                                checkStatus(input_msg.id);
                            } else {
                                document.getElementById('status').innerText = "Error: Invalid response.";
                            }
                        }
                    }};
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
                   }if(AudioSTATE == "off"){
                    document.getElementById("audio").muted = true;
                    audio.play();
                   }
                }
            }
        };
        xxr.send();
    }, 10);
}

function togAud() {
    if (AudioSTATE === "off") {
        AudioSTATE = "on";
        console.log("Audio is now on");
        
    } else {
        AudioSTATE = "off";
        console.log("Audio is now off");
        
    }
}