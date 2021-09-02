import { MetaTagsPageConfig, SiteConfig } from '@openchannel/angular-common-services';

export const metaTags: MetaTagsPageConfig = {
    defaultMetaTags: [
        { name: 'author', content: 'OpenChannel' },
        { name: 'description', content: 'OpenChannel' },
        { name: 'generator', content: 'OpenChannel' },
        { name: 'og:url', definitionPath: 'windowUrl' },
        { name: 'og:title', content: 'OpenChannel' },
        { name: 'og:image', content: 'OpenChannel' },
        { name: 'og:description', content: 'OpenChannel' },
    ],
    pages: [
        {
            routerLinkStartsWith: '/',
            metaTags: [
                { name: 'description', content: 'OpenChannel' },
                { name: 'og:title', content: 'OpenChannel' },
                { name: 'og:image', content: 'OpenChannel' },
                { name: 'og:description', content: 'OpenChannel' },
            ],
        },
        {
            routerLinkStartsWith: '/browse',
            metaTags: [
                { name: 'description', content: 'OpenChannel' },
                { name: 'og:title', content: 'OpenChannel' },
                { name: 'og:image', content: 'OpenChannel' },
                { name: 'og:description', content: 'OpenChannel' },
            ],
        },
        {
            routerLinkStartsWith: '/details',
            metaTags: [
                {
                    name: 'description',
                    content: 'OpenChannel',
                    definitionPath: 'app.customData.summary',
                },
                { name: 'og:title', content: 'OpenChannel', definitionPath: 'app.name' },
                { name: 'og:image', content: 'OpenChannel', definitionPath: 'app.customData.logo' },
                { name: 'og:description', content: 'OpenChannel', definitionPath: 'app.customData.description' },
            ],
        },
    ],
};

export const siteConfig: SiteConfig = {
    title: '',
    tagline: 'All the apps and integrations that you need',
    metaTags: [],
    favicon: {
        href: 'assets/img/favicon.png',
        type: 'image/x-icon',
    },
};
