export type ButtonType = 'purchase' | 'form' | 'install' | 'uninstall' | 'download';
export type ButtonStatistic = 'purchase' | 'contact-us' | 'leads' | 'installs' | 'downloads';

interface ButtonTypeModel<T extends ButtonType> {
    type: T;
    statistic: ButtonStatistic;
    showForAppTypes: string[];
    showButton: {
        type: 'primary' | 'secondary';
        text: string;
    };
    showToaster: {
        successMessage: string;
        errorMessage: string;
    };
}

export interface BuyNowButtonType extends ButtonTypeModel<'purchase'> {}

export interface InstallButtonType extends ButtonTypeModel<'install'> {}

export interface UninstallButtonType extends ButtonTypeModel<'uninstall'> {}

export interface DownloadButtonType extends ButtonTypeModel<'download'> {
    pathToFile: string;
}

export interface FormButtonType extends ButtonTypeModel<'form'> {
    formId: string;
    showToaster: {
        successMessage: string;
        errorMessage: string;
        notFoundFormMessage: string;
    };
}

export type ActionButton = BuyNowButtonType | FormButtonType | InstallButtonType | UninstallButtonType | DownloadButtonType;

export const buyNowButton: ActionButton = {
    type: 'purchase',
    statistic: 'purchase',
    showForAppTypes: [],
    showButton: {
        type: 'primary',
        text: 'Buy now',
    },
    showToaster: {
        successMessage: null,
        errorMessage: null,
    },
};

export const contactUsButton: ActionButton = {
    type: 'form',
    formId: 'contact-us',
    statistic: 'leads',
    showForAppTypes: ['web_plugin', 'marketing', 'code_with_fun'],
    showButton: {
        type: 'secondary',
        text: 'Contact',
    },
    showToaster: {
        successMessage: "Thank you for submitting, we'll get back to you shortly",
        errorMessage: 'Due to an error, we were not able to send your form',
        notFoundFormMessage: 'Contact us form is not available',
    },
};

const ownershipAppTypes = ['web_plugin', 'web_integration', 'internal_feature'];

export const installButton: ActionButton = {
    type: 'install',
    statistic: 'installs',
    showForAppTypes: ownershipAppTypes,
    showButton: {
        type: 'primary',
        text: 'Install',
    },
    showToaster: {
        successMessage: 'Your app has been installed',
        errorMessage: 'Due to an error we were not able to install your app',
    },
};

export const uninstallButton: ActionButton = {
    type: 'uninstall',
    statistic: 'installs',
    showForAppTypes: ownershipAppTypes,
    showButton: {
        type: 'primary',
        text: 'Delete',
    },
    showToaster: {
        successMessage: 'Your app has been uninstalled',
        errorMessage: 'Due to an error we were not able to uninstall your app',
    },
};

// todo add toaster handler for 404 error.
export const downloadButton: ActionButton = {
    type: 'download',
    statistic: 'downloads',
    pathToFile: 'customData.releases[0].file',
    showForAppTypes: ['downloadable'],
    showButton: {
        type: 'primary',
        text: 'Download',
    },
    showToaster: {
        successMessage: '',
        errorMessage: '',
    },
};

export const actionButtons: ActionButton[] = [buyNowButton, contactUsButton, installButton, uninstallButton, downloadButton];

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
