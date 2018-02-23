# Mixer Minimal Game client
A minimal game client that connects to interactive and sends a scenes json array. Also does shortcode auth.

## Getting Started
First, add the information for your Mixer application and interactive project to `mixerauth.json`.

Then start:
```bash
git clone https://github.com/Mobius5150/mixer-minimal-game-client
cd mixer-minimal-game-client
npm i
npm run start
```

You'll receive a prompt in your command line to enter a shortcode on Mixer. Do that and the client should start.

## Custom Scene Data
If you need controls or scenes to be configured, add this to minimal_game_client.ts:
```javascript
const scenesArray = [
    {
      sceneID: "default",
      // @ts-ignore
      controls: [],

      // @ts-ignore
      containers: []
    }
  ];
```