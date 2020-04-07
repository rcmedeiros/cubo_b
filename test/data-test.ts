// cSpell:ignore wiggin dalinar kholin uthred ragnarson eragon bromssom
import chai, { expect } from 'chai';
import { HttpResponse } from 'chai_http_ext';
import chaiHttp from 'chai-http';
import { describe, Done, it } from 'mocha';

import { HttpStatusCode } from '../src/constants/http_status_code';
import { ERR_INVALID_PARTICIPATION } from '../src/constants/message';
import { ERR_INVALID_DATA_OBJECT } from '../src/constants/message';
import { Data } from '../src/model/data';
import { DATA_SVC, URI } from './setup';

chai.use(chaiHttp);

describe('Data service', () => {

    const testMass: Array<Data> = [
        { firstName: 'Ender', lastName: 'Wiggin', participation: 54 },
        { firstName: 'Dalinar', lastName: 'Kholin', participation: 14 },
        { firstName: 'Uthred', lastName: 'Ragnarson', participation: 29 },
        { firstName: 'Uthred', lastName: 'Ragnarson', participation: 32 },
    ]

    it('Should insert seamlessly', (done: Done) => {
        let count = 0;

        testMass.forEach((d: Data) => {
            chai.request(`${URI}`).post(DATA_SVC).set('content-type', 'application/json').send(JSON.stringify(d))
                .end((err: Error, res: HttpResponse) => {
                    expect(err).to.be.null;
                    expect(res.status).to.be.equal(HttpStatusCode.ACCEPTED);
                    count++;
                    if (count === testMass.length) {
                        done();
                    }
                });
        });
    });

    it('Should recover inserted results', (done: Done) => {

        chai.request(`${URI}`).get(DATA_SVC)
            .end((err: Error, res: HttpResponse) => {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(HttpStatusCode.OK);

                const b = JSON.stringify(res.body);

                expect(b).to.contain(JSON.stringify(testMass[0]));
                expect(b).to.contain(JSON.stringify(testMass[1]));
                expect(b).to.contain(JSON.stringify(testMass[3]));
                expect(b).to.not.contain(JSON.stringify(testMass[2]));
                done();
            });
    });


    it('Invalid data object should be denied', (done: Done) => {
        chai.request(`${URI}`).post(DATA_SVC).set('content-type', 'application/json').send('{"invalid": "json"}')
            .end((err: Error, res: HttpResponse) => {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(HttpStatusCode.BAD_REQUEST);
                expect((res.body as { error: string }).error).to.be.equal(ERR_INVALID_DATA_OBJECT);
                done();
            });
    });

    it('Percent overflowing should be denied', (done: Done) => {
        chai.request(`${URI}`).post(DATA_SVC).set('content-type', 'application/json')
            .send(JSON.stringify({ firstName: 'Eragon', lastName: 'Bromssom', participation: 55 }))
            .end((err: Error, res: HttpResponse) => {
                expect(err).to.be.null;
                expect(res.status).to.be.equal(HttpStatusCode.BAD_REQUEST);
                expect((res.body as { error: string }).error).to.be.equal(ERR_INVALID_PARTICIPATION);
                done();
            });
    });

});

