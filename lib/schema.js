'use strict';
module.exports = {
  projects: {
    route: '/accounts/{accountId}/projects',
    requiredFields: ['accountId'],
    id: 'projectId',
    list: 'GET',
    create: {
      type: 'POST',
      requiredFields: ['name', 'sitePrimary']
    },
    read: 'GET',
    update: 'PATCH',
    delete: 'DELETE',
  },
  crawls: {
    route: '/accounts/{accountId}/projects/{projectId}/crawls',
    requiredFields: ['accountId', 'projectId'],
    id: 'crawlId',
    list: 'GET',
    create: 'POST',
    start: 'POST',
    read: 'GET',
    update: 'PATCH',
    delete: 'DELETE'
  },
  userAgents: {
    route: '/user_agents',
    id: 'userAgentCode',
    list: 'GET',
    read: 'GET'
  }
};
