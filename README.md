# League of Legends Stats App

A comprehensive web application for tracking League of Legends player statistics and game information.

## Features

### Mastery Tracker (`index.html`)
- **Search by Riot ID**: Find any summoner using their Game Name and Tag Line (e.g., `Name#Tag`).
- **Top Masteries**: View top champions with mastery levels and points.
- **Customizable**: Select how many top champions to display (1-9).
- **Region Support**: Select from multiple regions (NA, EUW, EUN, KR, JP, BR, OCE).

### Match History (`history.html`)
- **Recent Games**: View the last 20 matches.
- **Match Details**: See outcome (Win/Loss), KDA, champion played, items built, and CS.
- **Ranked Stats**: Display current Solo Queue rank, division, and winrate.
- **Visuals**: Includes champion icons, runes, ally icons.

### Free Champion Rotation (`top.html`)
- **Free Rotation**: View the current list of free-to-play champions.

## Setup & Usage

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/condog220/LeagueMastery.git
    cd LeagueMastery
    ```

2.  **Get a Riot Games API Key**:
    - Go to the [Riot Developer Portal](https://developer.riotgames.com/).
    - Log in and copy your development API key.

3.  **Configure the API Key**:
    - Open `API.js` in a text editor.
    - Find the line `const APIKey = '...';` (or similar).
    - Replace the placeholder with your actual development API key.
