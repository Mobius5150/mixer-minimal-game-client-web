import * as http from 'http';

export function loadFile(fileName: string, callback: (error: any, contents: string) => void): void {
    http.get(fileName, (response) => {
        let data: string[] = [];
        response.on('data', chunk => {
            if (typeof chunk === 'string') {
                data.push(chunk);
            } else {
                data.push(chunk.toString('utf8'));
            }
        });

        response.on('end', () => {
            try {
                if (response.statusCode === 200) {
                    callback(null, data.join(''));
                } else {
                    throw 'An error occured talking to Mixer';
                }
            } catch (e) {
                callback(e, null);
            }
        });

        response.on('error', e => callback(e, null));
    });
}

export function updateStatusText(innerHtml: string, color: string) {
    const status = document.getElementById('status');
    if (status) {
        status.innerHTML = innerHtml;
        status.style.color = color;
    }
}