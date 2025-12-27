import { APIKey } from './API.js';
import { IdToName } from './API.js';
import { fetchRotationData } from './API.js';

fetchRotationData(APIKey).then(data => {
    const freeChampionIds = data.freeChampionIds;
    displayChampions(freeChampionIds);
}).catch(error => {
    console.error(error);
    alert('Error fetching champion rotation data.');
});

function displayChampions(championIds) {
    const championList = document.querySelector('.rotation-list');
    championIds.forEach(id => {
        const championName = IdToName[id];
        const listItem = document.createElement('div');
        listItem.classList.add('mastery-card');
        listItem.innerHTML = `<img src="https://ddragon.leagueoflegends.com/cdn/12.18.1/img/champion/${championName}.png" alt="${championName}" />
        <h3>${championName}</h3>`;
        championList.appendChild(listItem);
    });
}