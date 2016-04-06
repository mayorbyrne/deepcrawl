'use strict';
const BPromise = require('bluebird'),
  schema = require('./schema.es'),
  needle = BPromise.promisifyAll(require('needle')),
  humps = require('humps'),
  _ = require('lodash');

class DeepCrawl {
  constructor(cfg) {
    cfg = cfg || {};
    if (!cfg.apiKey) {
      throw new Error('DeepCrawl called without required arg "apiKey"');
    }
    if (!cfg.apiId) {
      throw new Error('DeepCrawl called without required arg "apiId"');
    }

    this.apiKey = cfg.apiKey;
    this.apiId = cfg.apiId;
    this.getSessionToken = cfg.getSessionToken;
    this.accountId = cfg.accountId;
    this.baseUrl = 'https://prod-1-dc-api-oopeix3r.deepcrawl.com';
  }

  createEndpoints (schema) {
    const API = {};
    for (const endpoint in schema) {
      API[endpoint] = {};
    }

    return API;
  }

  generateRequest (url, options, method) {
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
        else {
          const data = humps.decamelizeKeys(options);
          return needle[`${method}Async`](url, data, requestOpts)
            .then(this.handleResponse);
        }
      });
  }

  generateMethod (requiredFields, url, requestMethod) {
    return (options) => {
      options = options || {};
      if (!options.sessionToken && !this.getSessionToken) {
        throw new Error(`"sessionToken" or "getSessionToken" method required`);
      }

      requiredFields.forEach((field) => {
        if (!options[field] && !this[field]) {
          throw new Error(`${field} is required`);
        }

        if (url.indexOf(`{${field}}`) > -1) {
          url = url.replace(`{${field}}`, (options[field] || this[field]));
        }
      });

      return this.generateRequest(url, options, requestMethod);     
    };
  }

  addMethodsToEndpoints (API, schema) {
    for (const endpoint in API) {
      const endpointUrl = this.baseUrl + schema[endpoint].url,
        requiredFields = _.clone(schema[endpoint].requiredFields || []);
      // remove the endpoint url and required fields from the schema
      delete schema[endpoint].requiredFields;
      delete schema[endpoint].url;
      // all we have left are methods for the endpoint
      for (const method in schema[endpoint]) {
        const methodRequiredFields = (schema[endpoint][method].requiredFields || []).concat(requiredFields);
        let methodUrl = endpointUrl;
        // we may need to append a url, depending on method
        if (schema[endpoint][method].url) {
          methodUrl += schema[endpoint][method].url;
        }
        API[endpoint][method] = this.generateMethod(methodRequiredFields, methodUrl, schema[endpoint][method].type.toLowerCase());    
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
    return res;
  }
}

module.exports = DeepCrawl;
