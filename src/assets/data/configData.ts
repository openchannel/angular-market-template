export const pageConfig = {
    fieldMappings: {
        icon: 'icon',
        logo: 'logo',
        summary: 'summary',
        description: 'description',
        video: 'video-url',
        images: 'images',
        categories: 'categories',
        author: 'author',
        gallery: 'gallery',
    },
    appListPage: [
        {
            name: 'Your App Store Platform',
            description: 'A design template for implementing your app store with OpenChannel',
            type: 'search',
        },
        {
            name: 'Featured',
            description: '',
            type: 'featured-apps',
            filter: '{"attributes.featured": "yes"}',
            filterId: 'collections',
            valueId: 'featured',
            sort: '{randomize: 1}',
        },
    ],
    appDetailsPage: {
        'listing-actions': [
            {
                type: 'purchase',
                appTypes: ['web_plugin', 'marketing', 'code_with_fun'],
                button: {
                    class: 'oc-button_primary',
                    text: 'Buy now',
                },
                statistic: 'installs',
            },
            {
                type: 'form',
                appTypes: ['web_plugin', 'marketing', 'code_with_fun'],
                formId: 'contact-us',
                message: {
                    success: "Thank you for submitting, we'll get back to you shortly",
                    fail: 'Due to an error, we were not able to send your form',
                    notFound: 'Contact us form is not available',
                },
                button: {
                    class: 'oc-button_secondary',
                    text: 'Contact',
                },
                statistic: 'leads',
            },
            {
                type: 'install',
                appTypes: ['web_plugin', 'web_integration', 'internal_feature'],
                unowned: {
                    message: {
                        success: 'Your app has been installed',
                        fail: 'Due to an error we were not able to install your app',
                    },
                    button: {
                        class: 'oc-button_primary',
                        text: 'Install',
                    },
                },
                owned: {
                    message: {
                        success: 'Your app has been uninstalled',
                        fail: 'Due to an error we were not able to uninstall your app',
                    },
                    button: {
                        class: 'oc-button_primary',
                        text: 'Uninstall',
                    },
                },
                statistic: 'installs',
            },
            {
                type: 'download',
                appTypes: ['downloadable'],
                fileField: 'customData.releases[0].file',
                button: {
                    class: 'oc-button_primary',
                    text: 'Download',
                },
                statistic: 'downloads',
            },
        ],
    },
};
