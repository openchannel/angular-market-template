import { MetaTagsPageConfig, SiteConfig } from '@openchannel/angular-common-services';

export const metaTags: MetaTagsPageConfig = {
    defaultMetaTags: [
        { name: 'author', content: 'OpenChannel' },
        { name: 'generator', content: 'OpenChannel' },
        { name: 'og:url', definitionPath: 'windowUrl' },
    ],
    pages: [
        {
            routerLinkStartsWith: '/details',
            metaTags: [
                { name: 'description', content: '', definitionPath: 'app.customData.summary' },
                { name: 'og:title', content: '', definitionPath: 'app.name' },
                { name: 'og:image', content: '', definitionPath: 'app.customData.logo' },
                { name: 'og:description', content: '', definitionPath: 'app.customData.description' },
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
