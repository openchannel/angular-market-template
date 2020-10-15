export interface Page<L> {
    list: L[];
    totalCount: number;
    pageSize: number;
    page: number;
    extraDetails: any;
}

export interface DeveloperSearchPage extends Page<Developer> {
}

export interface BasicAppsPage extends Page<BasicApp> {
}

export interface AllAppFields {
    list: AppField [];
}

export interface Developer {
    developerId: string;
    type: any;
}

export interface BasicApp {
    id: string;
    label: string;
    description: string;
}

export interface AppField {
    label: string;
    fieldDefinition: FieldDefinition;
    defOnlyField: boolean;
    extraField: boolean;
}

export interface FieldDefinition {
    id: string;
    label: string;
    defaultValue?: string;
    description?: string;
    type: FieldType;
    attributes?: FiledAttributes;
    subFieldDefinitions?: FieldDefinition [];
    options?: any [];
    deleteable: boolean;
}

export interface FiledAttributes {
    required?: boolean;
    minCount?: number;
    maxCount?: number;

    // text field
    maxChars?: number;
    minChars?: number;

    // image field
    width?: string;
    height?: string;
    hash?: string;
    accept?: string;

    // tags field (minCount, maxCount)

    // dynamic field
    ordering?: string;
    rowLabel?: string;

    // number field
    min?: number;
    max?: number;
}

export interface AppType extends BasicApp {
    fieldDefinitions: FieldDefinition [];
}

export enum FieldType {
    // String Types
    text = 'text',
    // longText = 'longText',
    richText = 'richText',
    // color = 'color',
    dropdownList = 'dropdownList',
    // Numeric Types
    // number = 'number',
    // Collection Types
    multiFile = 'multiFile',
    // multiPrivateFile = 'multiPrivateFile',
    multiImage = 'multiImage',
    // numberTags = 'numberTags',
    // booleanTags = 'booleanTags',
    // multiselectList = 'multiselectList',
    // dynamicFieldArray = 'dynamicFieldArray',
    tags = 'tags',
    // URL Types
    // websiteUrl = 'websiteUrl',
    // videoUrl = 'videoUrl',
    // singleFile = 'singleFile',
    // singleImage = 'singleImage',
    // Email Types
    // emailAddress = 'emailAddress'
}
