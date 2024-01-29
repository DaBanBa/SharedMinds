document.getElementById("thoughtInput").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    displayThrought(this.value);
    this.value = "";
  }
  if (this.value.length > 20) {
    this.value = this.value.slice(0, 20);
    alert("No More Than 20 Letters!")
  }
});

function displayThrought(throught) {
  const throughtMessage = document.createElement("div");
  throughtMessage.className = "aThought";
  throughtMessage.innerText = throught;
  document.getElementById("thoughtsCont").appendChild(throughtMessage);

  const x = (Math.random() * (window.innerWidth - 100)) + 50;
  const y = (Math.random() * (window.innerHeight - 100)) + 50;
  const fs = Math.floor(Math.random() * (40) + 24);
  throughtMessage.style.left = `${x}px`;
  throughtMessage.style.top = `${y}px`;
  throughtMessage.style.fontSize = `${fs}px`;

  fadeOut(throughtMessage);
}

function fadeOut(throughtElement) {
  const fadeOutDuration = 60000;
  const fadeOutInterval = 10;
  const fade = fadeOutDuration / fadeOutInterval;
  let timeOut = 0;

  const fadeOut = setInterval(function () {
    const opacity = 1 - timeOut / fade;
    throughtElement.style.opacity = opacity;

    timeOut++;

    if (timeOut === fade) {
      clearInterval(fadeOut);
      throughtElement.remove();
    }
  }, fadeOutInterval);
}