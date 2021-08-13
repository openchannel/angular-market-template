import { PrerenderEndpointsConfig } from '@openchannel/angular-common-services';

export const prerenderEndpoints: PrerenderEndpointsConfig = {
    excludeAPICall: ['/v2/stats/increment/'],
};
