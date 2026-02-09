let secretNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

const input = document.getElementById('guess-input');
const btn = document.getElementById('guess-btn');
const msg = document.getElementById('message');
const attDisplay = document.getElementById('attempts');

btn.addEventListener('click', () => {
    let userGuess = Number(input.value);
    attempts++;
    attDisplay.innerText = attempts;

    if (userGuess === secretNumber) {
        msg.innerText = "BRAVO ! 🎉 C'était bien " + secretNumber;
        msg.style.color = "#4ade80";
        btn.disabled = true;
    } else if (userGuess < secretNumber) {
        msg.innerText = "C'est PLUS ! ⬆️";
        msg.style.color = "#38bdf8";
    } else {
        msg.innerText = "C'est MOINS ! ⬇️";
        msg.style.color = "#f87171";
    }
    input.value = "";
});
