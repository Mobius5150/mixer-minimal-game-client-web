# Mixer Minimal Game client for Browsers
A minimal game client that connects to interactive and sends a scenes json array __within a browser__. Also does shortcode auth.

If you're looking for the regular minimal game client sample (not for browsers) see [Mobius5150/mixer-minimal-game-client](https://github.com/Mobius5150/mixer-minimal-game-client).

## Getting Started
First, add the information for your Mixer application and interactive project to `mixerauth.json`.

Then start:
```bash
git clone https://github.com/Mobius5150/mixer-minimal-game-client-web
cd mixer-minimal-game-client
npm i
npm run build
npm run start
```

This will start a simple local http server. Go to the address output by `npm run start` and click the link to authenticate with a shortcode. Accept the prompt and come back to the page. Now open your browsers developer tools:

 - __Firefox__: `Right Click` + `Q`
 - __Chrome__: `Ctrl` + `Shift` + `I`
 - __Edge__: `F12`

## Custom Scene Data
If you need controls or scenes to be configured, add this to `minimal_game_client.ts`:
```javascript
const scenesArray = [
    {
	  sceneID: "default",
	  
	  /* Define controls */
	  controls: [],

	  /* Define containers (optional, remove if not used) */
	  containers: []
    }
  ];
```