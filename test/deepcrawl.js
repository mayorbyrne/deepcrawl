'use strict';

require('should');

const DeepCrawl = require('../'),
  sinon = require('sinon-bluebird'),
  apiVersion = '2.0.0';

let needle = {
    getAsync: sinon.stub(),
    postAsync: sinon.stub(),
    patchAsync: sinon.stub(),
    deleteAsync: sinon.stub()
  },
  dc;

function resetNeedle() {
  dc.needle.getAsync.reset();
  dc.needle.postAsync.reset();
  dc.needle.patchAsync.reset();
  dc.needle.deleteAsync.reset();
}

describe('lib/deepcrawl', function () {

  describe('constructor', function () {
    it('should throw an error if no apiVersion is passed in', function () {
      (function () {
        dc = new DeepCrawl();
      }).should.throw('You must specify apiVersion');
    });

    it('should throw an error if no baseUrl is passed in', function () {
      (function () {
        dc = new DeepCrawl({
          apiVersion: apiVersion
        });
      }).should.throw('You must specify baseUrl');
    });

    it('should throw an error if invalid baseUrl is passed in', function () {
      (function () {
        dc = new DeepCrawl({
          apiVersion: apiVersion,
          baseUrl: 'helloworld.com'
        });
      }).should.throw('helloworld.com should have a protocol and slashes.');
    });

    it('should strip a trailing slash from the baseUrl', function () {
      dc = new DeepCrawl({
        apiVersion: apiVersion,
        baseUrl: 'http://www.helloworld.com/'
      });
      dc.baseUrl.should.equal('http://www.helloworld.com');
    });

    it('constructor should accept valid options', function () {
      dc = new DeepCrawl({
        apiVersion: apiVersion,
        accountId: '9999',
        getSessionToken: sinon.stub(),
        baseUrl: 'http://www.unittest.com'
      });
      dc.accountId.should.equal('9999');
      dc.baseUrl.should.equal('http://www.unittest.com');
      dc.getSessionToken.callCount.should.equal(0);
    });
  });

  describe('loadSchema', function () {
    before(function () {
      dc = new DeepCrawl({
        apiVersion: apiVersion,
        needle, //overwrite needle lib with custom stubbed lib
        accountId: '9999',
        getSessionToken: sinon.stub().resolves('testSessionToken'),
        baseUrl: 'http://api.unittest.com'
      });
    });

    describe('given version ' + apiVersion, function () {
      describe('projects', function () {
        describe('list projects', function () {
          it('should require accountId', function () {
            var id = dc.accountId;
            delete dc.accountId;
            dc.api.projects.list.bind(dc.api).should.throw('accountId is required');
            dc.accountId = id;
          });

          it('on success, should return res.body', function (done) {
            dc.needle.getAsync.onCall(0).resolves({
              statusCode: 200,
              body: {
                test: 'body'
              }
            })
            dc.api.projects.list()
              .then((res) => {
                res.test.should.equal('body');
                // make sure the request arguments are correct
                dc.needle.getAsync.callCount.should.equal(1);
                const request = dc.needle.getAsync.getCall(0);
                // should replace {accountId} in the url
                request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects');
                request.args[1].headers['X-Auth-Token'].should.equal('testSessionToken');
                done();
              });
          });

          it('on failure, should catch and handle error', function (done) {
            dc.needle.getAsync.onCall(1).resolves({
              statusCode: 404,
              body: {
                test: 'body'
              }
            });

            dc.api.projects.list()
              .catch(err => {
                err.message.should.equal('The item was not found.  Please check the url and try again.');
                done();
              });
          });
        });

        describe('create project', function () {
          it('should require name', function () {
            dc.accountId = null;
            dc.api.projects.create.bind(dc.api).should.throw('name is required');
          });

          it('should require sitePrimary', function () {
            dc.api.projects.create.bind(dc.api, {
              name: 'unitTest'
            }).should.throw('sitePrimary is required');
          });

          it('should require accountId', function () {
            dc.api.projects.create.bind(dc.api, {
              name: 'unitTest',
              sitePrimary: 'http://www.unittest.com'
            }).should.throw('accountId is required');
            dc.accountId = '9999';
          });

          it('on success, should return res.body', function (done) {
            dc.needle.postAsync.onCall(0).resolves({
              statusCode: 201,
              body: {
                test: 'body',
                id: 'someProjectId'
              }
            })
            dc.api.projects.create({
                name: 'unitTest',
                sitePrimary: 'http://www.unittest.com'
              })
              .then((res) => {
                res.test.should.equal('body');
                // make sure the request arguments are correct
                dc.needle.postAsync.callCount.should.equal(1);
                const request = dc.needle.postAsync.getCall(0);
                // should replace {accountId} in the url
                request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects');
                request.args[1].name.should.equal('unitTest');
                // the argument should be underscored instead of camelcase
                request.args[1]['site_primary'].should.equal('http://www.unittest.com');
                request.args[2].headers['X-Auth-Token'].should.equal('testSessionToken');
                done();
              });
          });

          it('on failure, should catch and handle error', function (done) {
            dc.needle.postAsync.onCall(1).resolves({
              statusCode: 409,
              body: ''
            });

            dc.api.projects.create({
                name: 'unitTest',
                sitePrimary: 'http://www.unittest.com'
              })
              .catch(err => {
                err.message.should.equal('The request could not be completed due to a conflict with the current state of the resource');
                done();
              });
          });
        });

        describe('read project', function () {
          before(function () {
            resetNeedle();
          });

          it('should require projectId', function () {
            dc.api.projects.read.bind(dc.api).should.throw('projectId is required');
          });

          it('should require accountId', function () {
            dc.accountId = null;
            dc.api.projects.read.bind(dc.api, {
              projectId: 'someProjectId'
            }).should.throw('accountId is required');
            dc.accountId = '9999';
          });

          it('on success, should return res.body', function (done) {
            dc.needle.getAsync.onCall(0).resolves({
              statusCode: 200,
              body: {
                test: 'body',
                id: 'someProjectId',
                name: 'unitTest',
                sitePrimary: 'http://www.unittest.com'
              }
            })
            dc.api.projects.read({
                projectId: 'someProjectId'
              })
              .then((res) => {
                res.test.should.equal('body');
                // make sure the request arguments are correct
                dc.needle.getAsync.callCount.should.equal(1);
                const request = dc.needle.getAsync.getCall(0);
                // should replace {accountId} and {projectId} in the url
                request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId');
                request.args[1].headers['X-Auth-Token'].should.equal('testSessionToken');
                done();
              });
          });

          it('on failure, should catch and handle error', function (done) {
            dc.needle.getAsync.onCall(1).resolves({
              statusCode: 503,
              body: 'resource unavailable'
            });

            dc.api.projects.read({
                projectId: 'someProjectId'
              })
              .catch(err => {
                err.message.should.equal('The resource is not currently available. "resource unavailable"');
                done();
              });
          });
        });

        describe('crawls', function () {
          before(function () {
            resetNeedle();
            dc.loadSchema(apiVersion);
          });
          describe('list crawls', function () {
            it('should require accountId', function () {
              dc.accountId = null;
              dc.api.crawls.list.bind(dc.api).should.throw('accountId is required');
              dc.accountId = '9999';
            });

            it('should require projectId', function () {
              dc.api.crawls.list.bind(dc.api).should.throw('projectId is required');
            });

            it('on success, should return res.body', function (done) {
              dc.needle.getAsync.onCall(0).resolves({
                statusCode: 200,
                body: {
                  test: 'body'
                }
              })
              dc.api.crawls.list({
                  projectId: 'someProjectId'
                })
                .then((res) => {
                  res.test.should.equal('body');
                  // make sure the request arguments are correct
                  dc.needle.getAsync.callCount.should.equal(1);
                  const request = dc.needle.getAsync.getCall(0);
                  // should replace {accountId} and {projectId} in the url
                  request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId/crawls');
                  request.args[1].headers['X-Auth-Token'].should.equal('testSessionToken');
                  done();
                });
            });

            it('on failure, should catch and handle error', function (done) {
              dc.needle.getAsync.onCall(1).resolves({
                statusCode: 404,
                body: {
                  test: 'body'
                }
              });

              dc.api.crawls.list({
                  projectId: 'someProjectId'
                })
                .catch(err => {
                  err.message.should.equal('The item was not found.  Please check the url and try again.');
                  done();
                });
            });
          });

          describe('update crawl', function () {
            it('should require crawlId', function () {
              dc.api.crawls.update.bind(dc.api).should.throw('crawlId is required');
            });

            it('should require projectId', function () {
              dc.api.crawls.update.bind(dc.api, {
                crawlId: 'someCrawlId'
              }).should.throw('projectId is required');
            });

            it('should require accountId', function () {
              dc.accountId = null;
              dc.api.crawls.update.bind(dc.api, {
                crawlId: 'someCrawlId',
                projectId: 'someProjectId'
              }).should.throw('accountId is required');
              dc.accountId = '9999';
            });

            it('on success, should return res.body', function (done) {
              dc.needle.patchAsync.onCall(0).resolves({
                statusCode: 201,
                body: {
                  test: 'body',
                  id: 'someCrawlId'
                }
              })
              dc.api.crawls.update({
                  crawlId: 'someCrawlId',
                  projectId: 'someProjectId',
                  status: 'crawling'
                })
                .then((res) => {
                  res.id.should.equal('someCrawlId');
                  // make sure the request arguments are correct
                  dc.needle.patchAsync.callCount.should.equal(1);
                  const request = dc.needle.patchAsync.getCall(0);
                  // should replace {accountId} {projectId} and {crawlId} in the url
                  request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId/crawls/someCrawlId');
                  request.args[1]['status'].should.equal('crawling');
                  request.args[2].headers['X-Auth-Token'].should.equal('testSessionToken');
                  done();
                });
            });

            it('on failure, should catch and handle error', function (done) {
              dc.needle.patchAsync.onCall(1).resolves({
                statusCode: 409,
                body: ''
              });

              dc.api.crawls.update({
                  crawlId: 'someCrawlId',
                  projectId: 'someProjectId',
                  status: 'crawling'
                })
                .catch(err => {
                  err.message.should.equal('The request could not be completed due to a conflict with the current state of the resource');
                  done();
                });
            });
          });

          describe('delete crawl', function () {
            before(function () {
              resetNeedle();
            });

            it('should require crawlId', function () {
              dc.api.crawls.delete.bind(dc.api).should.throw('crawlId is required');
            });

            it('should require projectId', function () {
              dc.api.crawls.delete.bind(dc.api, {
                crawlId: 'someCrawlId'
              }).should.throw('projectId is required');
            });

            it('should require accountId', function () {
              dc.accountId = null;
              dc.api.crawls.delete.bind(dc.api, {
                crawlId: 'someCrawlId',
                projectId: 'someProjectId'
              }).should.throw('accountId is required');
              dc.accountId = '9999';
            });

            it('on success, should return res.body', function (done) {
              dc.needle.deleteAsync.onCall(0).resolves({
                statusCode: 204,
                body: {
                  test: 'body',
                  id: 'someCrawlId'
                }
              })
              dc.api.crawls.delete({
                  projectId: 'someProjectId',
                  crawlId: 'someCrawlId'
                })
                .then((res) => {
                  res.id.should.equal('someCrawlId');
                  // make sure the request arguments are correct
                  dc.needle.deleteAsync.callCount.should.equal(1);
                  const request = dc.needle.deleteAsync.getCall(0);
                  // should replace {accountId} {projectId} and {crawlId} in the url
                  request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId/crawls/someCrawlId');
                  // the arguments should be underscored instead of camelcase
                  request.args[1]['project_id'].should.equal('someProjectId');
                  request.args[1]['crawl_id'].should.equal('someCrawlId');
                  request.args[2].headers['X-Auth-Token'].should.equal('testSessionToken');
                  done();
                });
            });

            it('on failure, should catch and handle error', function (done) {
              dc.needle.deleteAsync.onCall(1).resolves({
                statusCode: 503,
                body: 'resource unavailable'
              });

              dc.api.crawls.delete({
                  projectId: 'someProjectId',
                  crawlId: 'someCrawlId'
                })
                .catch(err => {
                  err.message.should.equal('The resource is not currently available. "resource unavailable"');
                  done();
                });
            });

          });

        });
      });
    });
  });
});
