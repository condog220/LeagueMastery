import { IdToName } from './API.js';
import { APIKey, getPuuid, getHistoryData, getMatchDetails, getPatch } from './API.js';

const searchBox = document.querySelector('.search input');
const searchButton = document.querySelector('.search button');

searchButton.addEventListener('click', () => {
    const input = searchBox.value.trim();
    const [gameName, tagLine] = input.split('#');
    const regionSelect = document.getElementById('region');
    const region = regionSelect.value;
    const server = region === 'NA1' ? 'americas' :
                   region === 'EUW1' || region === 'EUN1' ? 'europe' :
                   region === 'KR' || region === 'JP1' ? 'asia' :
                   region === 'BR1' || region === 'OC1' ? 'americas' : 'americas';

    if (gameName && tagLine) {
        getPuuid(gameName, tagLine, server, APIKey).then(puuid => {
            getHistoryData(puuid, server, APIKey).then(matchIds => {
                getSummonerInfo(puuid, region, APIKey).then(data =>{
                    displayRankInfo(data);
                });
                displayMatchHistory(matchIds, server, APIKey, puuid);
            }).catch(error => {
                console.error(error);
                alert('Error fetching match history.');
            });
        }).catch(error => {
            console.error(error);
            alert('Summoner not found.');
        });
    } else {
        alert("Please enter Riot ID as: name#tag");
    }
});

async function getSummonerInfo(puuid, region, APIKey){
    try{
        const response = await fetch(`https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${APIKey}`)
        if (!response.ok){
            throw new Error("Summoner not found");
        }
        const data = await response.json();
        displayRankInfo(data);
        return data;
    }
    catch (error){
        console.error(error);
        throw error;
    }
}

async function displayMatchHistory(matchIds, server, APIKey, puuid) {
    const container = document.querySelector('.match-history');
    container.innerHTML = '';

    const patch = await getPatch();
    console.log(patch);

    for(const matchId of matchIds.slice(0,20)) {
        try {
            const matchData = await getMatchDetails(matchId, server, APIKey);
            const historyCard = createCard(matchData, puuid,patch);
            container.appendChild(historyCard);
        }
        catch (error) {
            console.error('Error fetching match')
        }
    } 
}

function displayRankInfo(data){
    const profile = document.querySelector('.profile');
    profile.innerHTML = '';
    const rankInfo = document.createElement('div');
    rankInfo.classList.add('rankInfo');


    if(data && data.length > 0){
        const soloQ = data.find(entry => entry.queueType === "RANKED_SOLO_5x5") || data[0];
        const rank = soloQ.tier;
        const division = soloQ.rank;
        const wins = soloQ.wins;
        const loss = soloQ.losses;
        const winrate = wins/(wins+loss)*100;
        const rounded = winrate.toFixed(1);

        rankInfo.innerHTML = `
        <p id="rank">${rank} ${division}</p>
        <img src="./img/${rank}.png">
        <p><strong>${rounded}%</strong></p>
        <p>W: ${wins} L: ${loss}`;
    } else{
        rankInfo.innerHTML = `Unranked`;
    }

    profile.appendChild(rankInfo);

}

function createCard(matchData, puuid, patch){
    const card = document.createElement('div');
    card.classList.add('match-card');
    card.classList.add()

    const user = matchData.info.participants.find(p => p.puuid === puuid);

    if(!user){
        card.innerHTML = '<p>Not found in match.</p>';
        return card;
    }

    const champName = IdToName[user.championId] || '?';
    const kda = `${user.kills}/${user.deaths}/${user.assists}`;
    const creepScore = user.totalMinionsKilled + user.neutralMinionsKilled;
    const duration = matchData.info.gameDuration;
    const minutes = Math.floor(duration/60);
    const seconds = duration % 60;

    const items = [
        user.item0,
        user.item1,
        user.item2,
        user.item3,
        user.item4,
        user.item5,
    ].filter(itemId => itemId !== 0);

    const itemImages = items.map(itemId => `
    <img 
        src="https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${itemId}.png"
        width="32"
        alt="Item ${itemId}"
    >
    `).join('');
    
    if(user.win === true){
        card.classList.add('win');
    } else {
        card.classList.add('lose');
    }

    card.innerHTML = `
    <img class="champimg" src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${user.championId}.png" alt="${champName}" width="50">
        <div class="match-info">
            <div class="matchStats">
                <p>Match Duration: ${minutes}:${seconds}</p>
                <p><strong>${champName}</strong></p>
                <p>KDA: ${kda}</p>
                <p>Minions Killed: ${creepScore}</p>
            </div>
            <div class="items">
                ${itemImages}
            </div>
        </div>`;

    return card;

}
