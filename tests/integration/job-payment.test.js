import chaiHttp from 'chai-http';
import app from '../../src/app.js';
import chai, { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';

chai.use(chaiHttp);

describe('Job payment -> jobPayment', () => {
  it('should return error if profile not found', (done) => {
    chai.request(app)
      .post('/api/v1/jobs/2/pay')
      .set('profile_id', 100)
      .end((_err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('No profile found');
        expect(res.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
        done();
      });
  });

  it(`return error if profile is not a client. (Only clients can pay for a job)`, (done) => {
    chai.request(app)
      .post('/api/v1/jobs/2/pay')
      .set('profile_id', 5)
      .end((_err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('Only client can pay for a job');
        expect(res.statusCode).to.equal(StatusCodes.BAD_REQUEST);
        done();
      });
  });
});
