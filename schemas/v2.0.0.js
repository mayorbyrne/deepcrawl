'use strict';
module.exports = {
  version: '2.0.0',
  resources: {
    accounts: {
      route: '/accounts',
      id: 'accountId',
      actions: {
        list: 'GET',
        read: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    projects: {
      route: '/accounts/{accountId}/projects',
      requiredFields: ['accountId'],
      id: 'projectId',
      actions: {
        list: 'GET',
        create: {
          method: 'POST',
          requiredFields: ['name', 'sitePrimary']
        },
        read: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    projectUploads: {
      route: '/accounts/{accountId}/projects/{projectId}/uploads',
      requiredFields: ['accountId', 'projectId'],
      id: 'uploadId',
      actions: {
        list: 'GET',
        create: 'POST',
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
    reports: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls/{crawlId}/reports',
      requiredFields: ['accountId', 'projectId', 'crawlId'],
      id: 'reportId',
      actions: {
        list: 'GET',
        read: 'GET'
      }
    },
    reportRows: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls/{crawlId}/reports/{reportId}/report_rows',
      requiredFields: ['accountId', 'projectId', 'crawlId', 'reportId'],
      id: 'reportRowId',
      actions: {
        list: 'GET',
        read: 'GET'
      }
    },
    reportDownloads: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls/{crawlId}/reports/{reportId}/downloads',
      requiredFields: ['accountId', 'projectId', 'crawlId', 'reportId'],
      id: 'downloadId',
      actions: {
        list: 'GET',
        create: 'POST',
        read: 'GET',
        delete: 'DELETE'
      }
    },
    //reportTemplates: {},
    pages: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls/{crawlId}/pages',
      requiredFields: ['accountId', 'projectId', 'crawlId'],
      id: 'pageId',
      actions: {
        read: 'GET'
      }
    },
    locations: {
      route: '/locations',
      id: 'locationCode',
      actions: {
        list: 'GET',
        read: 'GET'
      }
    },
    staticLocations: {
      route: '/static_locations',
      id: 'staticLocationCode',
      actions: {
        list: 'GET',
        read: 'GET'
      }
    },
    domainResponses: {
      route: '/domain_responses?url={url}',
      requiredFields: ['url'],
      actions: {
        list: 'GET'
      }
    },
    supportEmail: {
      route: '/send_support_email',
      actions: {
        create: 'POST'
      }
    },
    issues: {
      route: '/accounts/{accountId}/projects/{projectId}/issues',
      requiredFields: ['accountId', 'projectId'],
      id: 'issueId',
      actions: {
        list: 'GET',
        read: 'GET',
        create: 'POST',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    accountIssues: {
      route: '/accounts/{accountId}/issues',
      requiredFields: ['accountId'],
      actions: {
        list: 'GET'
      }
    },
    crawlDownloads: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls/{crawlId}/downloads',
      requiredFields: ['accountId', 'projectId', 'crawlId'],
      actions: {
        list: 'GET'
      }
    },
    userAgents: {
      route: '/user_agents',
      id: 'userAgentCode',
      actions: {
        list: 'GET',
        read: 'GET'
      }
    },
    crawlSitemaps: {
      route: '/accounts/{accountId}/projects/{projectId}/crawls/{crawlId}/sitemaps',
      requiredFields: ['accountId', 'projectId', 'crawlId'],
      id: ['sitemapCode'],
      actions: {
        list: 'GET',
        read: 'GET'
      }
    },
    projectSitemaps: {
      route: '/accounts/{accountId}/projects/{projectId}/sitemaps',
      requiredFields: ['accountId', 'projectId'],
      id: ['sitemapCode'],
      actions: {
        list: 'GET',
        create: 'POST',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    schedules: {
      route: '/accounts/{accountId}/projects/{projectId}/schedules',
      requiredFields: ['accountId', 'projectId'],
      id: 'scheduleId',
      actions: {
        list: 'GET',
        create: 'POST',
        read: 'GET',
        update: 'PATCH',
        delete: 'DELETE'
      }
    },
    accountSchedules: {
      route: '/accounts/{accountId}/schedules',
      requiredFields: ['accountId'],
      actions: {
        list: 'GET'
      }
    }
  }
};
