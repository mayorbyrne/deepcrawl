# deepcrawl
A DeepCrawl API wrapper for Node

This module currently assumes you are refreshing and storing your deepCrawl session token on a regular basis (via your provided api id and api key), and have a means of retrieving it.

```javascript
var DeepCrawl = require('./');

var deepCrawl = new DeepCrawl({
  // function (promise or value returning) used to return the session token, wherever it is stored. if this is
  // missing, and no 'sessionToken' arg is passed to the API calls, they will throw an error
  getSessionToken: [Function],
  accountId: '[your account id]' // must be passed here or with each respective call
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
