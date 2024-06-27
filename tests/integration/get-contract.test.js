import chaiHttp from 'chai-http';
import app from '../../src/app.js';
import chai, { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';

chai.use(chaiHttp);

describe('Fetch profile contract -> fetchContractById', () => {
  it('should return error if profile not found', (done) => {
    chai.request(app)
      .get('/api/v1/contracts/1')
      .set('profile_id', 2000)
      .end((_err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('No profile found');
        expect(res.statusCode).to.equal(StatusCodes.UNAUTHORIZED);
        done();
      });
  });

  it('should return error if contract does not belong to profile', (done) => {
    chai.request(app)
      .get('/api/v1/contracts/1')
      .set('profile_id', 6)
      .end((_err, res) => {
        expect(res.body.status).to.equal('error');
        expect(res.body.message).to.equal('No contract found for this profile');
        expect(res.statusCode).to.equal(StatusCodes.NOT_FOUND);
        done();
      });
  });

  it(`should successfully return profile's contract: (client)`, (done) => {
    chai.request(app)
      .get('/api/v1/contracts/1')
      .set('profile_id', 1)
      .end((_err, res) => {
        expect(res.body.status).to.equal('success');
        expect(res.body.message).to.equal('Successfully fetched profile contract');
        expect(res.statusCode).to.equal(StatusCodes.OK);
        done();
      });
  });
});
