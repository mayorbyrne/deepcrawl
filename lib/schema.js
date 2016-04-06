'use strict';
module.exports = {
  projects: {
    url: '/accounts/{accountId}/projects',
    requiredFields: ['accountId'],
    list: {
      type: 'GET'
    },
    create: {
      type: 'POST',
      requiredFields: ['name', 'sitePrimary']
    },
    read: {
      url: '/{projectId}',
      type: 'GET',
      requiredFields: ['projectId']
    },    
    update: {
      url: '/{projectId}',
      type: 'PATCH',
      requiredFields: ['projectId']
    },    
    delete: {
      url: '/{projectId}',
      type: 'DELETE',
      requiredFields: ['projectId']
    }
  },
  crawls: {
    url: '/accounts/{accountId}/projects/{projectId}/crawls',
    requiredFields: ['accountId', 'projectId'],
    list: {
      type: 'GET'
    },
    create: {
      type: 'POST'
    },
    start: {
      type: 'POST'
    },
    read: {
      type: 'GET',
      url: '/{crawlId}',
      requiredFields: ['crawlId']
    },
    update: {
      type: 'PATCH',
      url: '/{crawlId}',
      requiredFields: ['crawlId']
    },
    delete: {
      type: 'DELETE',
      url: '/{crawlId}',
      requiredFields: ['crawlId']
    }
  },
  userAgents: {
    url: '/user_agents',
    list: {
      type: 'GET'
    },
    read: {
      url: '/{userAgentCode}',
      type: 'GET',
      requiredFields: ['userAgentCode']
    }
  }
};
