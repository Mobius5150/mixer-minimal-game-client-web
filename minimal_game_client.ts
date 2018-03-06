import {ShortcodeAuthClient} from 'mixer-shortcode-oauth/lib/src/ShortcodeAuthClient';
import {CookieTokenStore} from 'mixer-shortcode-oauth/lib/src/CookieTokenStore';
import {IAccessToken} from 'mixer-shortcode-oauth';
import {GameClient} from 'beam-interactive-node2';
import {loadFile, updateStatusText} from './util';

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

        this.client.on('open', () => this.mixerClientOpened());
        this.client.on('error', (e) => this.gameClientError(e));

        this.client
            .open(authToken)
            .catch(this.gameClientError);
    }

    private mixerClientOpened() {
        console.log('Mixer client opened');
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

loadFile(authfile, (error, contents) => {
    if (error) {
        console.error('Error loading auth token: ', error);
        return;
    }

    try {
        const interactiveClientInfo = JSON.parse(contents) as ClientInformation;
        if (typeof interactiveClientInfo.clientId !== 'string') {
            throw "clientId was not a string";
        }

        if (typeof interactiveClientInfo.clientSecret !== 'string' && interactiveClientInfo.clientSecret !== null) {
            throw "clientSecret was not a string or null";
        }

        if (typeof interactiveClientInfo.versionId !== 'number') {
            throw "versionId was not a number";
        }

        const authInfo = {
            client_id: interactiveClientInfo.clientId, 
            client_secret: interactiveClientInfo.clientSecret, 
            scopes: [
                'interactive:manage:self',
                'channel:teststream:view:self',
                'interactive:robot:self'
            ]
        };

        const store = new CookieTokenStore('mixerAuth');
        const auth = new ShortcodeAuthClient(authInfo, store);
        auth.on('code', (code) => {
            console.log(`Go to https://mixer.com/go and enter code ${code}...`);
            updateStatusText(`awaiting shortcode auth. Go to <a href='https://mixer.com/go?code=${code}' target='_blank'>https://mixer.com/go</a> and enter code ${code}`, 'orange');
        });

        auth.on('authorized', (token: IAccessToken) => {
            console.log("Got token!", token);
            updateStatusText('authorized', 'green');

            // @ts-ignore
            const _instance = new MinimalGameClient(
                {
                    authToken: token.access_token,
                    versionId: interactiveClientInfo.versionId
                });
        });

        auth.on('expired', () => {
            console.error('Auth request expired');
            updateStatusText('error: auth request expired', 'red');
        });

        auth.on('declined', () => {
            console.error('Auth request declined');
            updateStatusText('error: auth request expired', 'red');
        });

        auth.on('error', (e: Error) => {
            console.error('Auth error:', e);
            updateStatusText('error: ' + e.message, 'red');
        })

        auth.doAuth();
    }
    catch (e) {
        console.error('Error processing token: ', e);
        updateStatusText('unknown error', 'red');
    }
});