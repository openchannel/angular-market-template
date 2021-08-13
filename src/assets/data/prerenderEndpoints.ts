import { PrerenderEndpointsConfig } from '@openchannel/angular-common-services';

export const prerenderEndpoints: PrerenderEndpointsConfig = {
    excludeAPICall: ['/v2/stats/increment/'],
    error301: ['/v2/apps/bySafeName/'],
};
