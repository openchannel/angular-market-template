export const editUserConfig = {
  signup: {
    forms: [
      {
        name: 'Default Sign UP',
        organization: {
          type: 'default',
          includeFields: ['customData.company']
        },
        account: {
          type: 'default',
          includeFields: ['name', 'email']
        }
      },
      {
        name: 'Custom Sign UP',
        organization: {
          type: 'custom-user-type',
          includeFields: ['name', 'customData.about-my-company']
        },
        account: {
          type: 'custom-account-type',
          includeFields: ['name', 'username', 'email']
        }
      }
    ]
  }
};
