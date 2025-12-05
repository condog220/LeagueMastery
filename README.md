# League Mastery Tracker

A web application that allows users to view top champion masteries.

## Features

- **Search by Riot ID**: Enter a summoner's Game Name and Tag Line (e.g., `Name#Tag`).
- **Customizable Results**: Choose how many top champions to display (1-9).
- **Detailed Display**: Shows champion icon, name, mastery level, and mastery points.

## Setup & Usage

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/condog220/LeagueMastery.git
    ```

    ```bash
    cd LeagueMastery
    ```

2.  **Get a Riot Games API Key**:
    - Go to the [Riot Developer Portal](https://developer.riotgames.com/).
    - Log in and copy your development API key.

3.  **Configure the API Key**:
    - Open `index.js` in a text editor.
    - Find the line `const APIKey = '...';`.
    - Replace the existing key with your new API key.

4.  **Run the App**:
    - Open `index.html` in your web browser.
