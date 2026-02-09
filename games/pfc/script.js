const pScore = document.getElementById('player-score');
const cScore = document.getElementById('computer-score');
const pChoiceDisplay = document.getElementById('player-choice');
const cChoiceDisplay = document.getElementById('computer-choice');
const resultText = document.getElementById('result-text');
const buttons = document.querySelectorAll('.choice-btn');

let playerScore = 0;
let computerScore = 0;

const choices = ["pierre", "feuille", "ciseaux"];

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const playerChoice = button.getAttribute('data-choice');
        const computerChoice = choices[Math.floor(Math.random() * 3)];
        
        playRound(playerChoice, computerChoice);
    });
});

function playRound(player, computer) {
    pChoiceDisplay.innerText = player.toUpperCase();
    cChoiceDisplay.innerText = computer.toUpperCase();

    if (player === computer) {
        resultText.innerText = "Égalité ! 🤝";
    } else if (
        (player === "pierre" && computer === "ciseaux") ||
        (player === "feuille" && computer === "pierre") ||
        (player === "ciseaux" && computer === "feuille")
    ) {
        playerScore++;
        pScore.innerText = playerScore;
        resultText.innerText = "Tu as gagné ! 🎉";
    } else {
        computerScore++;
        cScore.innerText = computerScore;
        resultText.innerText = "L'ordinateur gagne ! 🤖";
    }
}
