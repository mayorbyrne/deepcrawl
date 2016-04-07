'use strict';
const BPromise = require('bluebird'),
  schema = require('../schemas/v2.0.0'),
  needle = BPromise.promisifyAll(require('needle')),
  humps = require('humps'),
  _ = require('lodash');

class DeepCrawl {
  constructor(cfg) {
    cfg = cfg || {};

    this.apiId = cfg.apiId;
    this.apiKey = cfg.apiKey;
    this.getSessionToken = cfg.getSessionToken;
    this.accountId = cfg.accountId;

    this.schema = cfg.schema || schema;
    this.version = this.schema.version;
    this.baseUrl = this.schema.baseUrl;
  }

  createEndpoints (schema) {
    const API = {};
    for (const resource in schema.resources) {
      API[resource] = {};
    }
    return API;
  }

  generateRequest (url, options, method) {
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

  generateMethod (requiredFields, url, method) {
    return (options) => {
      options = options || {};
      if (!options.sessionToken && !this.getSessionToken) {
        throw new Error(`"sessionToken" or "getSessionToken" method required`);
      }

      requiredFields.forEach((field) => {
        if (!options[field] && !this[field]) {
          throw new Error(`${field} is required`);
        }
        // if the url contains {field}, replace {field} with the passed
        // in value
        if (url.indexOf(`{${field}}`) > -1) {
          url = url.replace(`{${field}}`, (options[field] || this[field]));
        }
      });

      return this.generateRequest(url, options, method);     
    };
  }

  addMethodsToEndpoints (API, schema) {
    for (const resource in API) {
      const resourceUrl = this.baseUrl + schema.resources[resource].route,
        requiredFields = _.clone(schema.resources[resource].requiredFields || []),
        id = schema.resources[resource].id;

      for (const action in schema.resources[resource].actions) {
        let actionRequiredFields = requiredFields,
          actionUrl = resourceUrl;
        // check to see whether the resource action has extra data associated with it
        const isString = typeof schema.resources[resource].actions[action] === 'string';
        // the following actions should all have an "id" field associated with them
        // we will append the id field to the required fields for the action, and
        // add /{id} to the url, which will be replaced later with the passed in
        // field
        if (action === 'read' || action === 'update' || action === 'delete') {
          actionRequiredFields = [id].concat(requiredFields);
          actionUrl = resourceUrl + `/{${id}}`;
        }
        // the action may still have extra requiredFields needed to append
        if (!isString && schema.resources[resource].actions[action].requiredFields) {
          actionRequiredFields = actionRequiredFields.concat(schema.resources[resource].actions[action].requiredFields);
        }
        // determine the request method ('get', 'patch', 'delete', etc)
        const method = (isString ? schema.resources[resource].actions[action] : schema.resources[resource].actions[action].type).toLowerCase();
        API[resource][action] = this.generateMethod(actionRequiredFields, actionUrl, method);    
      }
    }
  }

  getAPI (opts) {
    opts = opts || {};
    this.accountId = opts.accountId || this.accountId;
    // create the base API
    const API = this.createEndpoints(schema);
    this.addMethodsToEndpoints(API, schema);
    return API;
  }

  /**
   * Handle common deepCrawl response codes
   *
   */
  handleResponse (res) {
    if (res.statusCode === 401) {
      throw new Error('The request is unauthorized.  Please authenticate and try again.');
    }
    if (res.statusCode === 404) {
      throw new Error('The item was not found.  Please check the url and try again.');
    }
    if (res.statusCode === 409) {
      throw new Error('The request could not be completed due to a conflict with the current state of the resource');
    }
    if (res.statusCode === 422) {
      throw new Error(`There was a validation error. ${JSON.stringify(res.body)}`);
    }
    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 202 || res.statusCode === 204) {
      return res.body;
    }
  }
}

module.exports = DeepCrawl;
