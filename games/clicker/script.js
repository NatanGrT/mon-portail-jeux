let score = 0;
const scoreDisplay = document.getElementById('score');
const button = document.getElementById('click-me');

button.addEventListener('click', () => {
    score++;
    scoreDisplay.innerText = score;
    
    if(score === 10) {
        alert("Pas mal ! Continue !");
    }
});
