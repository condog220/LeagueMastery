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
                console.log(matchIds)
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

// Get history details to be sent to create our card.

async function displayMatchHistory(matchIds, server, APIKey, puuid) {
    const container = document.querySelector('.match-history');
    container.innerHTML = '';

    const patch = await getPatch();
    console.log(patch);

    for(const matchId of matchIds.slice(0,20)) {
        try {
            const matchData = await getMatchDetails(matchId, server, APIKey);
            const historyCard = await createCard(matchData, puuid,patch);
            container.appendChild(historyCard);
            requestAnimationFrame(() => {
                historyCard.classList.add('visible');
            });
        }
        catch (error) {
            console.error('Error fetching match')
        }
    } 
}

// Display rank information for user entered.

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
    requestAnimationFrame(() => {
        rankInfo.classList.toggle('visible');
    });

}

function getItems(user){
    if(!user) return [];

    const items = [
        user.item0,
        user.item1,
        user.item2,
        user.item3,
        user.item4,
        user.item5
    ].filter(itemId => itemId !== 0);

    return items;

}

function getAlliedChamps(matchData, puuid, team){
    const alliedChampions = matchData.info.participants
    .filter(p => p.teamId === team && p.puuid !== puuid)
    .map(p => ({
        champ: p.championName
    }));

    return alliedChampions;

}

let cachedRunes = null;

async function getRunesData(patch) {
    if (cachedRunes) return cachedRunes;

    const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/runesReforged.json`
    );
    cachedRunes = await res.json();
    return cachedRunes;
}

function getRunes(keystoneId, secondaryTreeId, runesData) {
    let keystone = null;
    let secondaryTree = null;

    for (const tree of runesData) {
        if (tree.id === secondaryTreeId) {
            secondaryTree = tree;
        }
        

        for (const slot of tree.slots) {
            for (const rune of slot.runes) {
                if (rune.id === keystoneId) {
                    keystone = rune;
                }
            }
        }
    }

    return { keystone, secondaryTree };
}




async function createCard(matchData, puuid, patch){
    const card = document.createElement('div');
    card.classList.add('match-card');
    card.classList.add()

    const user = matchData.info.participants.find(p => p.puuid === puuid);
    const team = user.teamId;

    const win = user.win ? 'Win' : 'Lose';


    

    if(!user){
        card.innerHTML = '<p>Not found in match.</p>';
        return card;
    }

    // Retrieve important details
    const champName = IdToName[user.championId] || '?';
    const kda = `${user.kills}/${user.deaths}/${user.assists}`;
    const creepScore = user.totalMinionsKilled + user.neutralMinionsKilled;
    const totalKills = matchData.info.participants
        .filter(p => p.teamId === team)
        .reduce((sum, p) => sum + p.kills, 0);

    const killParticipation = totalKills > 0 ?
        (((user.kills + user.assists) / totalKills) * 100).toFixed(1) :
        '0';

    // Retrieve runes
    
    const runes =  user.perks.styles;
    const primaryRune = runes.find(p => p.description === "primaryStyle");
    const secondaryRune = runes.find(p => p.description === "subStyle");

    const mainKeystone = primaryRune.selections[0].perk;
    const secondaryKeystone = secondaryRune.style;

    const runesData = await getRunesData(patch);
    const { keystone, secondaryTree } = getRunes(mainKeystone, secondaryKeystone, runesData);

    // Displaying time and CS/Min

    const duration = matchData.info.gameDuration;
    const minutes = Math.floor(duration/60);
    const seconds = duration % 60;
    const csMin = (creepScore/minutes).toFixed(1);

    // Add item build

    const items = getItems(user)

    const itemImages = items.map(itemId => `
    <img 
        src="https://ddragon.leagueoflegends.com/cdn/${patch}/img/item/${itemId}.png"
        width="32px"
        alt="Item ${itemId}"
    </img>
    `).join('');

    // Set win/lose class

    const outcomeClass = user.win ? 'outcome-win' : 'outcome-lose';
    
    if(user.win === true){
        card.classList.add('win');
    } else {
        card.classList.add('lose');
    }

    // Add ally team icons 

    const allies = getAlliedChamps(matchData, puuid, team)

    const allyTeamHTML = allies
    .map(ally => `
        <img
            class="ally-champ"
            src="https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${ally.champ}.png"
            alt="${ally.champ}"
            title="${ally.champ}"
        />
    `)
    .join('');

    // Generate the card.

    card.innerHTML = `
    <div class="champIcons">
        <div class="MainChamp">
            <img 
                class="champimg" 
                src="https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${user.championId}.png" 
                title="${champName}" 
                width="50px"
            />
        </div>
        <div class="allyTeam">
            ${allyTeamHTML}
        </div>
    </div>
        <div class="match-info">
            <div class="matchStats">
                <p id="length">Match Duration: ${minutes}:${seconds} <span class="outcome ${outcomeClass}">${win}</span></p>
                <p><strong>${champName}</strong></p>
                <div class="runes">
                    <img
                        src="https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}"
                        width="32px"
                        title="${keystone.name}"
                    />
                    <img
                        src="https://ddragon.leagueoflegends.com/cdn/img/${secondaryTree.icon}"
                        width="24px"
                        title="${secondaryTree.name}"
                    />
                </div>
                <p>KDA: ${kda} (${killParticipation}% KP)</p>
                <p>CS: ${creepScore} (${csMin}/min)</p>
            </div>
            <div class="items">
                ${itemImages}
            </div>
            <button class="details-btn">Details</button>
        </div>
        <div class="match-details">
            <p>Damage Dealt: ${user.totalDamageDealtToChampions}</p>
            <p>Vision Score: ${user.visionScore}</p>
            <p>Wards Placed: ${user.wardsPlaced}</p>
            <p>Gold Earned: ${user.goldEarned}</p>
        </div>
        `;

    const detailsBtn = card.querySelector('.details-btn');
    const matchDetails = card.querySelector('.match-details');

    detailsBtn.addEventListener('click', () => {
        matchDetails.classList.toggle('expanded');
    });

    return card;

}

