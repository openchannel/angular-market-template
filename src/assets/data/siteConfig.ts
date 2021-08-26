import { SiteConfig } from '@openchannel/angular-common-services';

export const siteConfig: SiteConfig = {
    title: '',
    tagline: 'All the apps and integrations that you need',
    metaTags: [
        { name: 'author', content: 'OpenChannel' },
        { name: 'description', content: 'Default text for the site description. You can change it as you wish.' },
        { name: 'generator', content: 'OpenChannel' },
    ],
    favicon: {
        href: 'assets/img/favicon.png',
        type: 'image/x-icon',
    },
};
