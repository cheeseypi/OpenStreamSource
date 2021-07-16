var x = new WebSocket('ws://localhost:8080');
x.addEventListener('open', function (event) {
    console.log("Opened Socket");
});
x.addEventListener('message', function (event) {
    console.debug("Message Recieved:", event);
    let message = JSON.parse(event.data);
    if (message.type === 'chat') {
        const messageEl = document.createElement('p');
        messageEl.innerText = message.author + ": " + message.content;
        const target = document.getElementById('messageBox');
        target.appendChild(messageEl);
    }
    else if(message.type==='system'){
        console.log("Recieved System Event: ", message.content)
    }
});