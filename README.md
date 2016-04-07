# deepcrawl
A DeepCrawl API wrapper for Node

```javascript
var DeepCrawl = require('./');

var deepCrawl = new DeepCrawl({
  apiKey: '[your api key]',
  apiId: '[your api id]',
  // function used to return the session token (value or promise), wherever it is stored. if this is
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
