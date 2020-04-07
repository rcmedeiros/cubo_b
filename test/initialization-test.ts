import chai, { expect } from 'chai';
import { HttpResponse } from 'chai_http_ext';
import chaiHttp from 'chai-http';
import { describe, Done, it } from 'mocha';

import { DEFAULT_SERVER_PORT, ENDPOINT_HEALTH_CHECK, ENDPOINT_OPEN_API } from '../src/constants/defaults';
import { HttpStatusCode } from '../src/constants/http_status_code';
import { CubeServer } from '../src/server';


chai.use(chaiHttp);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const healthyStart: Function = (done: Done, endpoint: string, negativeTest?: boolean): void => {
    const s: CubeServer = new CubeServer();
    s.listen().then(() => {

        chai.request(`http://localhost:${process.env.CUBE_PORT || DEFAULT_SERVER_PORT}`)
            .get(endpoint)
            .end((err: Error, res: HttpResponse) => {
                if (!err) {
                    try {
                        const truthy = res.status >= HttpStatusCode.OK && res.status < HttpStatusCode.BAD_REQUEST;
                        if (!negativeTest) {
                            expect(truthy).to.be.true;
                        } else {
                            expect(truthy).to.be.false;
                        }
                    } catch (e) {
                        done(e);
                        return;
                    }
                    s.close().then(() => done()).catch((e: Error) => done(e));
                } else {
                    done(err);
                }
            });
    }).catch((err: Error) => done(err));
};

describe('Initializations', () => {
    it('Should start seamlessly', (done: Done) => { healthyStart(done, ENDPOINT_HEALTH_CHECK); });
    it('Should offer api docs', (done: Done) => { healthyStart(done, ENDPOINT_OPEN_API); });
    it('Should NOT offer in production', (done: Done) => {
        process.env.NODE_ENV = 'production';
        healthyStart(done, ENDPOINT_OPEN_API, true);
        process.env.NODE_ENV = 'undefined';
    });
});

