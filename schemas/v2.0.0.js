'use strict';
module.exports = {
  version: '2.0.0',
  baseUrl: 'https://prod-1-dc-api-oopeix3r.deepcrawl.com',
  resources: {
    projects: {
      route: '/accounts/{accountId}/projects',
      requiredFields: ['accountId'],
      id: 'projectId',
      actions: {
        list: 'GET',
        create: {
          type: 'POST',
          requiredFields: ['name', 'sitePrimary']
        },
        read: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    crawls: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls',
      requiredFields: ['accountId', 'projectId'],
      id: 'crawlId',
      actions: {  
        list: 'GET',
        create: 'POST',
        start: 'POST',
        read: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    userAgents: {
      route: '/user_agents',
      id: 'userAgentCode',
      actions: {
        list: 'GET',
        read: 'GET'
      }
    }
  }
};
