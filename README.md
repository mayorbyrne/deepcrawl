# deepcrawl

[![Circle CI](https://img.shields.io/circleci/project/L7labs/deepcrawl.svg)](https://circleci.com/gh/L7labs/deepcrawl)
[![npm](https://img.shields.io/npm/v/deepcrawl.svg?maxAge=2592000)](https://www.npmjs.com/package/deepcrawl)
[![npm](https://img.shields.io/npm/dm/deepcrawl.svg?maxAge=2592000?style=flat)](https://www.npmjs.com/package/deepcrawl)

A DeepCrawl API wrapper for Node.

*Note that this library only supports DeepCrawl API version 2.0+*

**DeepCrawl 2.0 API is currently in private beta, so this library will not be finalized until the API is released publicly.**

The DeepCrawl API requires authentication with an API key and returns a session token. The session token expires after 6 hours. This module assumes you are refreshing and storing the session token on a regular basis, and have a means of retrieving it.

```javascript
var DeepCrawl = require('deepcrawl');

var dc = new DeepCrawl({
  accountId: '[your account id]',
  baseUrl: 'http://api.deepcrawl.com'
});

dc.api.projects.read({
  projectId: '4351'
})
.then(function(res) {
  console.log(res);
})
.catch(function(err) {
  console.log(err.stack);
});
```
