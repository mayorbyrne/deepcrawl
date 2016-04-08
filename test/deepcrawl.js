'use strict';
const DeepCrawl = require('../'),
  should = require('should'),
  sinon = require('sinon-bluebird');

describe('lib/deepcrawl', function () {

  it('constructor should accept valid options', function () {
    const deepCrawl = new DeepCrawl({
      accountId: '9999',
      getSessionToken: sinon.stub(),
      baseUrl: 'http://www.unittest.com',
      schema: {
        version: 'testVersion'
      }
    });
    deepCrawl.accountId.should.equal('9999');
    deepCrawl.baseUrl.should.equal('http://www.unittest.com');
    deepCrawl.version.should.equal('testVersion');
    deepCrawl.getSessionToken.callCount.should.equal(0);
  });

});
