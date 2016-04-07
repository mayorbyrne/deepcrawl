const DeepCrawl = require('../'),
  should = require('should'),
  sinon = require('sinon-bluebird');

describe('lib/deepcrawl', function () {

  it('constructor should fail without apiId', function() {
    (function () {
      new DeepCrawl()
    }).should.throw('DeepCrawl called without required arg "apiId"');
  });

  it('constructor should fail without apiKey', function() {
    (function () {
      new DeepCrawl({
        apiId: '1234'
      })
    }).should.throw('DeepCrawl called without required arg "apiKey"');    
  });

  it('constructor should accept valid options', function () {
    const deepCrawl = new DeepCrawl({
      apiId: '1234',
      accountId: '9999',
      apiKey: 'xxxx',
      getSessionToken: sinon.stub(),
      baseUrl: 'http://www.unittest.com'
    });
    deepCrawl.apiId.should.equal('1234');
    deepCrawl.accountId.should.equal('9999');
    deepCrawl.apiKey.should.equal('xxxx');
    deepCrawl.baseUrl.should.equal('http://www.unittest.com');
    deepCrawl.getSessionToken.callCount.should.equal(0);
  });

});
