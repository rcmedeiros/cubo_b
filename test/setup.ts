import { after, before, Done } from 'mocha';

import { DEFAULT_SERVER_PORT, ENDPOINT_API } from '../src/constants/defaults';
import { CubeServer } from '../src/server';

export const URI = `http://localhost:${DEFAULT_SERVER_PORT}`;
export const DATA_SVC = `${ENDPOINT_API}/data`;

const s: CubeServer = new CubeServer();
before((done: Done) => {
    s.listen().then(() => {
        done();
    }).catch(console.error);
});

after((done: Done) => {
    s.close()
        .then(() => {
            done();
        })
        .catch((err: Error) => {
            done(err);
        });
});
