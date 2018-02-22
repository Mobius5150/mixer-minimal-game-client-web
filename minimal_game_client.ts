import {ShortcodeAuthClient, IAccessToken, LocalTokenStore} from '../mixer-shortcode-auth';
import { GameClient, setWebSocket, } from 'beam-interactive-node2';
import * as ws from 'ws';
import * as fs from 'fs';

// Place your app info in mixerauth.json, schema is:
// {
//     "clientId": "",
//     "clientSecret": null, /* optional if you don't have a cient secret */
//     "versionId": 0
// }
const authfile = 'mixerauth.json';

// Update this scene array if needed
const scenesArray = [
    {
      sceneID: "default",
      // @ts-ignore
      controls: [],

      // @ts-ignore
      containers: []
    }
  ];

interface AuthToken {
    authToken: string;
    versionId: number;
}

interface ClientInformation {
    clientId: string;
    clientSecret: string;
    versionId: number;
}

class MinimalGameClient {
    private client: GameClient = null;

    constructor(authToken: AuthToken) {
        this.client = new GameClient();

        this.client.on('open', () => { console.log("Interactive connected"); });
        this.client.on('error', e => console.error('interactive error: ', e));

        this.client
            .open(authToken)
            .then(() => this.mixerClientOpened())
            .catch(this.gameClientError);
    }

    private mixerClientOpened() {
        console.log('Mixer client opened');
        this.client.on('error', (e) => this.gameClientError(e));
        this.client.on('message', (err: any) => console.log('<<<', err));
        this.client.on('send', (err: any) => console.log('>>>', err));

        this.client
            .getScenes()
            .then(() => this.createScenes())
            .then(() => this.goLive())
            .catch(this.gameClientError);
    }

    private createScenes() {
        return this.client.updateScenes({ scenes: scenesArray as any });
    }

    private goLive() {
        console.log('going live');
        this.client.ready()
            .then(() => console.log('client ready'))
            .catch(e => {
                console.error('interactive client error readying: ', e);
                throw e;
            });
    }

    private gameClientError(error: any) {
        console.error('Gameclient error: ', error);
    }
}

setWebSocket(ws);
fs.readFile(authfile, { encoding: 'utf8' }, (error, contents) => {
    if (error) {
        console.error('Error loading auth token: ', error);
        process.exit(1);
    }

    try {
        let authToken = JSON.parse(contents) as ClientInformation;
        if (typeof authToken.clientId !== 'string') {
            throw "clientId was not a string";
        }

        if (typeof authToken.clientSecret !== 'string' && authToken.clientSecret !== null) {
            throw "clientSecret was not a string or null";
        }

        if (typeof authToken.versionId !== 'number') {
            throw "versionId was not a number";
        }

        const authInfo = {
            client_id: authToken.clientId, 
            client_secret: authToken.clientSecret, 
            scopes: [
                'interactive:manage:self',
                'interactive:play',
                'channel:teststream:view:self',
                'interactive:robot:self'
            ]
        };

        const store = new LocalTokenStore(__dirname + '/mixertoken.json');
        const auth = new ShortcodeAuthClient(authInfo, store);
        auth.on('code', (code) => {
            console.log(`Go to https://mixer.com/go and enter code ${code}...`);
        });

        auth.on('authorized', (token: IAccessToken) => {
            console.log("Got token!", token);

            // @ts-ignore
            const _instance = new MinimalGameClient(
                {
                    authToken: token.access_token,
                    versionId: authToken.versionId
                });
        });

        auth.on('expired', () => {
            console.error('Auth request expired');
            process.exit(1);
        });

        auth.on('declined', () => {
            console.error('Auth request declined');
            process.exit(1);
        });

        auth.on('error', (e: Error) => {
            console.error('Auth error:', e);
            process.exit(1);
        })

        auth.doAuth();
    }
    catch (e) {
        console.error('Error processing token: ', e);
        process.exit(1);
    }
});