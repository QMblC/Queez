async function getPlayersAndScores() {
  await fetch(`/api/activequiz/score/${window.location.search}`)
    .then((response) => response.json())
    .then(async (data) => {
      drawPlayers(data);
    });
}

function drawPlayers(playersList) {
  const players = document.querySelector(".players-table");
  players.innerHTML = ``;
  for (const player of playersList) {
    const playerCard = document.createElement("div");
    const playerName = document.createElement("p");
    const playerScore = document.createElement("p");
    playerName.textContent = player.nickname;
    playerScore.textContent = player.score;

    // для наглядности, без стилей, убрать
    const aaa = document.createElement("button");
    aaa.textContent = `${player.nickname} ${player.score}`;
    playerCard.append(aaa);

    // вернуть
    // playerCard.append(playerName);
    players.append(playerCard);
  }
}

getPlayersAndScores();
