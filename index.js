'use strict';
const BPromise = require('bluebird'),
  schema = require('./schemas/v2.0.0'),
  needle = BPromise.promisifyAll(require('needle')),
  humps = require('humps'), // my lovely lady lumps
  _ = require('lodash'),
  parseUrl = require('url').parse;

class DeepCrawl {
  constructor(cfg) {
    cfg = cfg || {};

    this.apiId = cfg.apiId;
    this.apiKey = cfg.apiKey;
    this.getSessionToken = cfg.getSessionToken;
    this.accountId = cfg.accountId;

    this.schema = cfg.schema || schema;
    this.version = this.schema.version;
    this.baseUrl = this.verifyUrl(cfg.baseUrl);
  }

  /**
   * Performs a few simple checks against the passed in url,
   * and throws an error if the url is not how we expect it to be.
   *
   * @return {String} url
   */
  verifyUrl (url) {
    if (!url) {
      throw new Error('No baseUrl provided');
    }
    if (url[url.length - 1] === '/') {
      throw new Error(`${url} should not end in a slash.`);
    }
    const parsedUrl = parseUrl(url);
    if (!parsedUrl.protocol || !parsedUrl.slashes) {
      throw new Error(`${url} should have a protocol and slashes.`);
    }
    return url;
  }

  /**
   * Performs the actual request to the DeepCrawl API.
   *
   * @param {String} url
   * @param {Object} options
   * @param {String} method ('get', 'post', etc)
   * @return {Promise}
   *
   */
  performRequest (url, options, method) {
    // first, get the sessionToken and generate the request options and headers
    return BPromise.resolve(options.sessionToken || this.getSessionToken())
      .then((sessionToken) => {
        const requestOpts = {
          json: true,
          headers: {
            'X-Auth-Token': sessionToken
          }
        };

        if (method === 'get') {
          return needle.getAsync(url, requestOpts)
            .then(this.handleResponse);
        }

        // convert all camelCased options to _ for deepcrawl
        const data = humps.decamelizeKeys(options);
        return needle[`${method}Async`](url, data, requestOpts)
          .then(this.handleResponse);
      });
  }

  /**
   * Generates the dynamic method call, given the provided
   * action object.
   *
   * @param {Object} action
   * @param {Array}  action.requiredFields
   * @param {String} action.url
   * @param {String} action.method ('get', 'post', etc)
   *
   * @return {Function} The dynamic method call
   */
  generateMethod (action) {
    action = action || {};
    if (!action.url || !action.method || !action.requiredFields) {
      throw new Error('All actions must have a url, method, and requiredFields.  Make sure all schema ' +
        'actions are either a string with the method ("GET", "POST", etc.) or an object with "method" ' +
        'and "requiredFields" fields.');
    }
    // returning this function as a closure here is the key
    // to constructing this as a dynamic method call
    return (options) => {
      options = options || {};
      if (!options.sessionToken && !this.getSessionToken) {
        throw new Error(`"sessionToken" or "getSessionToken" method required`);
      }

      action.requiredFields.forEach((field) => {
        if (!options[field] && !this[field]) {
          throw new Error(`${field} is required`);
        }
        // if the url contains {field}, replace {field} with the passed
        // in value
        if (action.url.indexOf(`{${field}}`) > -1) {
          action.url = action.url.replace(`{${field}}`, (options[field] || this[field]));
        }
      });
      return this.performRequest(action.url, options, action.method);     
    };
  }

  /**
   * Performs a few simple checks against the provided route, and throws an
   * error if the route is invalid.  If the route is valid, appends it to the
   * baseUrl and returns the value.
   *
   * @param {String} route The resource route
   * @return {String} complete route url
   */
  generateResourceUrl (route) {
    if (route[route.length - 1] === '/') {
      throw new Error(`The route ${route} incorrectly ends with a trailing slash. Routes should only begin with a slash.`);
    }
    if (route[0] !== '/') {
      throw new Error(`The route ${route} incorrectly starts without a slash.  Routes should begin with a slash.`);
    }

    return this.baseUrl + route;
  }

  /**
   * Parses a schema and returns an API
   *
   * @param {Object} schema
   * @param {Object} schema.resources
   * @param {Object} schema.resources.actions
   *
   */
  parseSchema (schema) {
    const API = {};
    for (const resource in schema.resources) {
      API[resource] = {};
      const resourceUrl = this.generateResourceUrl(schema.resources[resource].route),
        requiredFields = _.clone(schema.resources[resource].requiredFields || []),
        id = schema.resources[resource].id;

      for (const actionName in schema.resources[resource].actions) {
        let action = schema.resources[resource].actions[actionName];
        if (typeof action === 'string') {
          action = {
            method: action.toLowerCase(), // we know the action in this case is the request method
            requiredFields // use the resource's required fields, since there are none to append
          };
        }
        else {
          action.method = action.method.toLowerCase();
          // since this action is not a string, there may be extra required fields associated
          // with it.  So we will append any extra required fields to the resource's existing
          // required fields
          action.requiredFields = (action.requiredFields || []).concat(requiredFields);
        }
        action.url = resourceUrl;
        // the following actions should all have an "id" field associated with them.
        // We will append the id field to the required fields for the action, and
        // add /{id} to the url, which will be replaced later in generateMethod
        if (actionName.match(/read|update|delete/i)) {
          action.requiredFields = [id].concat(action.requiredFields);
          action.url = resourceUrl + `/{${id}}`;
        }
        API[resource][actionName] = this.generateMethod(action);    
      }
    }
    return API;
  }

  getAPI () {
    return this.parseSchema(schema);
  }

  /**
   * Handle common deepCrawl response codes
   *
   */
  handleResponse (res) {
    if (String(res.statusCode).startsWith('4') || String(res.statusCode).startsWith('5')) {
      switch(res.statusCode) {
        case 401:
          throw new Error('The request is unauthorized.  Please authenticate and try again.');
        case 404:
          throw new Error('The item was not found.  Please check the url and try again.');
        case 409:
          throw new Error('The request could not be completed due to a conflict with the current state of the resource');
        case 422:
          throw new Error(`There was a validation error. ${JSON.stringify(res.body)}`);
        case 503:
          throw new Error(`The resource is not currently available. ${JSON.stringify(res.body)}`);
        default:
          throw new Error(`There was a ${res.statusCode} error handling the request: ${JSON.stringify(res.body)}`);
      }
    }
    if (String(res.statusCode).startsWith('2')) {
      return res.body;
    }
    throw new Error(`There was an unexpected ${res.statusCode} response: ${JSON.stringify(res.body)}`);
  }
}

module.exports = DeepCrawl;
