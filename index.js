import { APIKey } from './API.js';
import { getPuuid } from './API.js';
import { getMasteryData } from './API.js';
import { IdToName } from './API.js';

const searchBox = document.querySelector('.search input');
const searchButton = document.querySelector('.search button');


searchButton.addEventListener('click', () => {
    const countInput = document.querySelector('.count input');
    const count = countInput.value;
    const input = searchBox.value.trim();
    const [gameName, tagLine] = input.split('#');
    const regionSelect = document.getElementById('region');
    const region = regionSelect.value;
    const server = region === 'NA1' ? 'americas' :
                   region === 'EUW1' || region === 'EUN1' ? 'europe' :
                   region === 'KR' || region === 'JP1' ? 'asia' :
                   region === 'BR1' || region === 'OC1' ? 'americas' : 'americas';

    if (gameName && tagLine) {
        getPuuid(gameName, tagLine, server, APIKey).then(id => {
            getMasteryData(id, region, count, APIKey).then(masteryData => {
                displayMasteryData(masteryData);
            }).catch(error => {
                console.error(error);
                alert('Error fetching mastery data.');
            });
        }).catch(error => {
            console.error(error);
            alert('Summoner not found.');
        });
    } else {
        alert("Please enter Riot ID as: name#tag");
    }
});

function displayMasteryData(masteryData) {
    const masteryCard = document.querySelector('.masteries');
    masteryCard.innerHTML = '';

    masteryData.forEach(champion => {
        const champName = IdToName[champion.championId];

        const champDiv = document.createElement('div');
        champDiv.classList.add('mastery-card');

        champDiv.innerHTML = `
            <img src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champion.championId}.png">
            <h3>${champName}</h3>
            <p>Mastery Level: ${champion.championLevel}</p>
            <p>Mastery Points: ${champion.championPoints.toLocaleString()}</p>
            `;

        masteryCard.appendChild(champDiv);
    });



}