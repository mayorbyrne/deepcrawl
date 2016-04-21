'use strict';
require('should')
const DeepCrawl = require('../'),
  sinon = require('sinon-bluebird'),
  schema = require('../schemas/v2.0.0.js');

let needle = {
    getAsync: sinon.stub(),
    postAsync: sinon.stub(),
    patchAsync: sinon.stub(),
    deleteAsync: sinon.stub()
  },
  deepCrawl,
  API;

function resetNeedle() {
  deepCrawl.needle.getAsync.reset();
  deepCrawl.needle.postAsync.reset();
  deepCrawl.needle.patchAsync.reset();
  deepCrawl.needle.deleteAsync.reset();
}

describe('lib/deepcrawl', function () {

  describe('constructor', function () {
    it('should throw an error if no baseUrl is passed in', function () {
      (function () {
        deepCrawl = new DeepCrawl()
      }).should.throw('No baseUrl provided');
    });

    it('should throw an error if invalid baseUrl is passed in', function () {
      (function () {
        deepCrawl = new DeepCrawl({
          baseUrl: 'helloworld.com'
        })
      }).should.throw('helloworld.com should have a protocol and slashes.');
    });

    it('should strip a trailing slash from the baseUrl', function () {
      deepCrawl = new DeepCrawl({
        baseUrl: 'http://www.helloworld.com/'
      });
      deepCrawl.baseUrl.should.equal('http://www.helloworld.com');
    });

    it('constructor should accept valid options', function () {
      deepCrawl = new DeepCrawl({
        accountId: '9999',
        getSessionToken: sinon.stub(),
        baseUrl: 'http://www.unittest.com'
      });
      deepCrawl.accountId.should.equal('9999');
      deepCrawl.baseUrl.should.equal('http://www.unittest.com');
      deepCrawl.getSessionToken.callCount.should.equal(0);
    });
  });

  describe('parseSchema', function () {
    before(function () {
      deepCrawl = new DeepCrawl({
        needle, //overwrite needle lib with custom stubbed lib
        accountId: '9999',
        getSessionToken: sinon.stub().resolves('testSessionToken'),
        baseUrl: 'http://api.unittest.com'
      });
    });

    describe('given schemas/v2.0.0.js', function () {
      before(function () {
        API = deepCrawl.parseSchema(schema);
      });

      describe('projects', function () {
        describe('list projects', function () {
          it('should require accountId', function () {
            deepCrawl.accountId = null;
            API.projects.list.bind(API).should.throw('accountId is required');
            deepCrawl.accountId = '9999';
          });

          it('on success, should return res.body', function (done) {
            deepCrawl.needle.getAsync.onCall(0).resolves({
              statusCode: 200,
              body: {
                test: 'body'
              }
            })
            API.projects.list()
              .then((res) => {
                res.test.should.equal('body');
                // make sure the request arguments are correct
                deepCrawl.needle.getAsync.callCount.should.equal(1);
                const request = deepCrawl.needle.getAsync.getCall(0);
                // should replace {accountId} in the url
                request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects');
                request.args[1].headers['X-Auth-Token'].should.equal('testSessionToken');
                done();
              });
          });

          it('on failure, should catch and handle error', function (done) {
            deepCrawl.needle.getAsync.onCall(1).resolves({
              statusCode: 404,
              body: {
                test: 'body'
              }
            });

            API.projects.list()
              .catch(err => {
                err.message.should.equal('The item was not found.  Please check the url and try again.');
                done();
              });
          });
        });

        describe('create project', function () {
          it('should require name', function () {
            deepCrawl.accountId = null;
            API.projects.create.bind(API).should.throw('name is required');
          });

          it('should require sitePrimary', function () {
            API.projects.create.bind(API, {
              name: 'unitTest'
            }).should.throw('sitePrimary is required');
          });

          it('should require accountId', function () {
            API.projects.create.bind(API, {
              name: 'unitTest',
              sitePrimary: 'http://www.unittest.com'
            }).should.throw('accountId is required');
            deepCrawl.accountId = '9999';
          });

          it('on success, should return res.body', function (done) {
            deepCrawl.needle.postAsync.onCall(0).resolves({
              statusCode: 201,
              body: {
                test: 'body',
                id: 'someProjectId'
              }
            })
            API.projects.create({
                name: 'unitTest',
                sitePrimary: 'http://www.unittest.com'
              })
              .then((res) => {
                res.test.should.equal('body');
                // make sure the request arguments are correct
                deepCrawl.needle.postAsync.callCount.should.equal(1);
                const request = deepCrawl.needle.postAsync.getCall(0);
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
            deepCrawl.needle.postAsync.onCall(1).resolves({
              statusCode: 409,
              body: ''
            });

            API.projects.create({
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
            API.projects.read.bind(API).should.throw('projectId is required');
          });

          it('should require accountId', function () {
            deepCrawl.accountId = null;
            API.projects.read.bind(API, {
              projectId: 'someProjectId'
            }).should.throw('accountId is required');
            deepCrawl.accountId = '9999';
          });

          it('on success, should return res.body', function (done) {
            deepCrawl.needle.getAsync.onCall(0).resolves({
              statusCode: 200,
              body: {
                test: 'body',
                id: 'someProjectId',
                name: 'unitTest',
                sitePrimary: 'http://www.unittest.com'
              }
            })
            API.projects.read({
                projectId: 'someProjectId'
              })
              .then((res) => {
                res.test.should.equal('body');
                // make sure the request arguments are correct
                deepCrawl.needle.getAsync.callCount.should.equal(1);
                const request = deepCrawl.needle.getAsync.getCall(0);
                // should replace {accountId} and {projectId} in the url
                request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId');
                request.args[1].headers['X-Auth-Token'].should.equal('testSessionToken');
                done();
              });
          });

          it('on failure, should catch and handle error', function (done) {
            deepCrawl.needle.getAsync.onCall(1).resolves({
              statusCode: 503,
              body: 'resource unavailable'
            });

            API.projects.read({
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
            // let's tweak the route on crawls to make sure handling of extra/missing slashes works
            // remove the leading slash and add a trailing one
            // the tests should pass with or without this line
            schema.resources.crawls.route = 'accounts/{accountId}/projects/{projectId}/crawls/';
            API = deepCrawl.parseSchema(schema);
          });
          describe('list crawls', function () {
            it('should require accountId', function () {
              deepCrawl.accountId = null;
              API.crawls.list.bind(API).should.throw('accountId is required');
              deepCrawl.accountId = '9999';
            });

            it('should require projectId', function () {
              API.crawls.list.bind(API).should.throw('projectId is required');
            });

            it('on success, should return res.body', function (done) {
              deepCrawl.needle.getAsync.onCall(0).resolves({
                statusCode: 200,
                body: {
                  test: 'body'
                }
              })
              API.crawls.list({
                  projectId: 'someProjectId'
                })
                .then((res) => {
                  res.test.should.equal('body');
                  // make sure the request arguments are correct
                  deepCrawl.needle.getAsync.callCount.should.equal(1);
                  const request = deepCrawl.needle.getAsync.getCall(0);
                  // should replace {accountId} and {projectId} in the url
                  request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId/crawls');
                  request.args[1].headers['X-Auth-Token'].should.equal('testSessionToken');
                  done();
                });
            });

            it('on failure, should catch and handle error', function (done) {
              deepCrawl.needle.getAsync.onCall(1).resolves({
                statusCode: 404,
                body: {
                  test: 'body'
                }
              });

              API.crawls.list({
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
              API.crawls.update.bind(API).should.throw('crawlId is required');
            });

            it('should require projectId', function () {
              API.crawls.update.bind(API, {
                crawlId: 'someCrawlId'
              }).should.throw('projectId is required');
            });

            it('should require accountId', function () {
              deepCrawl.accountId = null;
              API.crawls.update.bind(API, {
                crawlId: 'someCrawlId',
                projectId: 'someProjectId'
              }).should.throw('accountId is required');
              deepCrawl.accountId = '9999';
            });

            it('on success, should return res.body', function (done) {
              deepCrawl.needle.patchAsync.onCall(0).resolves({
                statusCode: 201,
                body: {
                  test: 'body',
                  id: 'someCrawlId'
                }
              })
              API.crawls.update({
                  crawlId: 'someCrawlId',
                  projectId: 'someProjectId',
                  status: 'crawling'
                })
                .then((res) => {
                  res.id.should.equal('someCrawlId');
                  // make sure the request arguments are correct
                  deepCrawl.needle.patchAsync.callCount.should.equal(1);
                  const request = deepCrawl.needle.patchAsync.getCall(0);
                  // should replace {accountId} {projectId} and {crawlId} in the url
                  request.args[0].should.equal('http://api.unittest.com/accounts/9999/projects/someProjectId/crawls/someCrawlId');
                  request.args[1]['status'].should.equal('crawling');
                  request.args[2].headers['X-Auth-Token'].should.equal('testSessionToken');
                  done();
                });
            });

            it('on failure, should catch and handle error', function (done) {
              deepCrawl.needle.patchAsync.onCall(1).resolves({
                statusCode: 409,
                body: ''
              });

              API.crawls.update({
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
              API.crawls.delete.bind(API).should.throw('crawlId is required');
            });

            it('should require projectId', function () {
              API.crawls.delete.bind(API, {
                crawlId: 'someCrawlId'
              }).should.throw('projectId is required');
            });

            it('should require accountId', function () {
              deepCrawl.accountId = null;
              API.crawls.delete.bind(API, {
                crawlId: 'someCrawlId',
                projectId: 'someProjectId'
              }).should.throw('accountId is required');
              deepCrawl.accountId = '9999';
            });

            it('on success, should return res.body', function (done) {
              deepCrawl.needle.deleteAsync.onCall(0).resolves({
                statusCode: 204,
                body: {
                  test: 'body',
                  id: 'someCrawlId'
                }
              })
              API.crawls.delete({
                  projectId: 'someProjectId',
                  crawlId: 'someCrawlId'
                })
                .then((res) => {
                  res.id.should.equal('someCrawlId');
                  // make sure the request arguments are correct
                  deepCrawl.needle.deleteAsync.callCount.should.equal(1);
                  const request = deepCrawl.needle.deleteAsync.getCall(0);
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
              deepCrawl.needle.deleteAsync.onCall(1).resolves({
                statusCode: 503,
                body: 'resource unavailable'
              });

              API.crawls.delete({
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
