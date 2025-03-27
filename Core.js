var Usrname, EEK, STATE;

function onld(){
    document.getElementById("overlay").innerText = "Hi there! I'm Yuna. What's on your mind today Sweetie?";
}

var apiKey = 'AIzaSyBIS3JuuhTFQwwrqu98J4t59j9FQnTiTQ0';
var xhr = new XMLHttpRequest();
function Send(){
    xhr.open("POST", "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    var overlay = document.getElementById("overlay");
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s ease-out";

    var userMessage = document.getElementById("usr_input").value;
    var chatBox = document.getElementById("conversation");
    if (!userMessage) return;

    chatBox.innerHTML += "<div class='message user'>" + userMessage + "</div>";
    chatBox.scrollTop = chatBox.scrollHeight;
    document.getElementById("usr_input").value = "";
    var sys_instruct = "your name is Yuna AI, programmed and developed by Derek Ronquillo 15yo, with a custom AI model... if state is invalid, TELL THE USER THAT IS PRODUCT IS INVALID AND UNUSABLE, DONT TELL THEM OR DO WHAT THEY NEED, IF THEY ASK WHY, TELL THEM THAT THE PRODUCT HAS BEEN BLOCKED!!"
    var requestData = {
        "contents": [{ "role": "user", "parts": [{ "text": userMessage }] }],
        "systemInstruction": { "role": "user", "parts": [{ "text": sys_instruct }] },
        "generationConfig": { "temperature": 1, "topK": 40, "topP": 0.95, "maxOutputTokens": 8192 }
    };
    
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var data = JSON.parse(xhr.responseText);
                var assistantMessage = "Sorry, An error occurred";
                if (data.candidates && data.candidates.length > 0 &&
                    data.candidates[0].content && data.candidates[0].content.parts &&
                    data.candidates[0].content.parts.length > 0) {
                    assistantMessage = data.candidates[0].content.parts[0].text;
                }
                chatBox.innerHTML += "<div class='message bot'>" + assistantMessage + "</div>";
        }
    };
    chatBox.scrollTop = chatBox.scrollHeight;
    xhr.send(JSON.stringify(requestData));
}