import chaiHttp from 'chai-http';
import app from '../../src/app.js';
import chai, { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';

chai.use(chaiHttp);

describe('Fetch all active contract(s) for a profile -> fetchUserContracts', () => {
  it('should return error if profile not found', (done) => {
    chai.request(app)
      .get('/api/v1/contracts')
      .set('profile_id', 100)
      .end((_err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('No profile found');
        expect(res.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
        done();
      });
  });

  it(`Returns a list of contracts belonging to a user (client or contractor)`, (done) => {
    chai.request(app)
      .get('/api/v1/contracts')
      .set('profile_id', 2)
      .end((_err, res) => {
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Successfully fetched user active contracts');
        expect(res.statusCode).to.equal(StatusCodes.OK);
        done();
      });
  });
});
