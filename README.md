# deepcrawl

[![CircleCI](https://img.shields.io/circleci/project/BrightFlair/PHP.Gt.svg?maxAge=2592000?style=plastic)](https://circleci.com/gh/L7labs/deepcrawl)
[![npm](https://img.shields.io/npm/v/deepcrawl.svg?maxAge=2592000)](https://www.npmjs.com/package/deepcrawl)
[![npm](https://img.shields.io/npm/dm/deepcrawl.svg?maxAge=2592000?style=plastic)](https://www.npmjs.com/package/deepcrawl)

A DeepCrawl API wrapper for Node.

*Note that this library only supports DeepCrawl API version 2.0+*

The DeepCrawl API requires authentication with an API key and returns a session token. The session token expires after 6 hours. This module assumes you are refreshing and storing the session token on a regular basis, and have a means of retrieving it.

```javascript
var DeepCrawl = require('deepcrawl');

var getSessionToken = function() {
  //
}

var deepCrawl = new DeepCrawl({
  // function (promise or value returning) used to return the session token, wherever it is stored. if this is
  // missing, and no 'sessionToken' arg is passed to the API calls, they will throw an error
  getSessionToken: [Function],
  accountId: '[your account id]', // must be passed here or with each respective call
  baseUrl: 'http://api.deepcrawl.com'
});

var API = deepCrawl.getAPI();

API.projects.read({
  projectId: '4351'
})
.then(function(res) {
  console.log(res);
})
.catch(function(err) {
  console.log(err.stack);
});
```
