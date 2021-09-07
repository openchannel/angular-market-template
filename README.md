# Template3-marketsite
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=openchannel_template3-marketsite&metric=alert_status&token=09ecb76af06050dd9ee59a4ada98a9e937517fbf)](https://sonarcloud.io/dashboard?id=openchannel_template3-marketsite)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=openchannel_template3-marketsite&metric=coverage&token=09ecb76af06050dd9ee59a4ada98a9e937517fbf)](https://sonarcloud.io/dashboard?id=openchannel_template3-marketsite)
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Installation](#installation)
  * [Configure dashboard](#configure-dashboard)
* [Usage](#usage)
* [Contact](#contact)

## About The Project

The goal of a marketplace template site is to allow users to browse and install actual applications. This app represents the market site.

Functional for User:
- Native or SSO login.
- Search approved applications. 
- Work with applications (install/uninstall, preview).
- Updating profile and organization data.
- Managing users from your organization. Invite new users.

Note: Unauthorized users can browse Applications.

### Built With
* [Bootstrap](https://getbootstrap.com) v. 4.4.1
* [Angular](https://angular.io) v. 11.2.3

## Getting Started

### Installation

- Install [node.js and npm](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/):
```
sudo apt install nodejs
```
- Install the [Angular CLI](https://angular.io/cli) using the npm package manager:
```
npm install -g @angular/cli
```
- Install NPM packages
```
npm install
```

2. Optional. Dependency with @openchannel/angular-common-services.
```
npm install file:<absolute path to common service project dist/angular-common-services>
```

3. Optional. Dependency with @openchannel/angular-common-components.
```
npm install file:<absolute path to common component project dist/angular-common-components>
```

### Configure dashboard
- dev1 on the [https://dev1-dashboard.openchannel.io/](https://dev1-dashboard.openchannel.io/)
- stage1 on the [https://stage1-dashboard.openchannel.io/](https://stage1-dashboard.openchannel.io/)
- us1(production) on the [https://us1-dashboard.openchannel.io/](https://us1-dashboard.openchannel.io/)


Step 1. Setup OAuth
- Google [guide](https://developers.google.com/identity/protocols/oauth2/openid-connect)
- Okta guide : [guide](https://developer.okta.com/docs/guides/implement-oauth-for-okta/overview)

Step 2. (Optional) (#type) Note: Dashboard already have default type.  
- Follow the link to the dashboard and sign in.
- On the left sidebar menu, find 'Settings' and open.
- Then open 'Field Settings'.
- You must create a new types for tabs:  
  *'USER'  
  *'USER ACCOUNT'  
  *'DEVELOPER'  
  *'DEVELOPER ACCOUNT'

Step 3. (Optional) (#roles) Note: Dashboard already have default roles.
- Follow the link to the dashboard and sign in.
- On the left sidebar menu, find 'Users' and open.
- Then open 'Roles' and click by 'ADD ROLE.
- Fill name.
- Then click by 'ADD PERMISSIONS'
- Select all available permissions.
- Save.

Step 4. Creating site template, it is portal or market.
- Follow the link to the dashboard and sign in.
- On the left sidebar menu, find 'Sites' and open.
- Click by 'CREATE SITE'.
- In the opened modal fill fields :  
    1. Name* - just site name.  
    2. Type* - now has two parameters ('Self Hosted' and 'Fully Hosted')  
       Fully Hosted - the site will be created from scratch.  
       Self Hosted - you already have your site and want to link it by site domain.  
    3) Template* ('Fully Hosted') - select your template type: portal(for developers) or market(for users)

Step 5. Configure site authorization type SSO or Native login.
- Follow the link to the dashboard and sign in.
- On the left sidebar menu find 'Sites' and open.
- Find your site and open. (This page configures your site)
- Find and click by 'SSO'.
- Find and click by 'ADD IDENTITY CONFIGURATION'.
  >Google config  
  *Name : Google  
  *Validation Mode : Authorization Code  
  *Client ID : 45823498-349823hfjnlfna98r722903470.apps.googleusercontent.com   
  *Client Secret : AGSdaskjqASJFnsdfal  
  *Issuer : https://accounts.google.com   
  *Grant Type : authorization_code  
  *Scope : openid profile email  
  *Classification : USER | DEVELOPER  
  *Developer Organization Type (#type): admin  
  *Developer Account Type (#type): admin  
  *Developer Account Roles (#roles):dev-admin
  >>Google claims mappings :  
  *accountId : {{sub}}  
  *organizationName : {{use your custom JWT claim or for test '{{aud}}'  
  *email : {{email}}  
  *name : {{given_name}} {{family_name}}  
  *username : {{name}}  
  *organizationId :{{aud}}

  >Okta config  
  *Name : Okta  
  *Validation Mode : Authorization Code
  Note: ('Authorization Code' - signup used special endpoints, but 'Introspect'
  and 'Public key' use all CAP endpoints)  
  *Client ID : OAuth clientId  
  *Client Secret : OAuth client secret  
  *Issuer : https://dev-2468217.okta.com (use your ID into domain)  
  *Grant Type : authorization_code  
  *Scope : openid profile email  
  *Classification : USER | DEVELOPER  
  *Developer Organization Type (#type): default  
  *Developer Account Type (#type): default  
  *Developer Account Roles (#roles): dev-admin
  >>Okta claims mappings :  
  *accountId : {{sub}}  
  *organizationId : {{idp}}  
  *organizationName : {{name}}-company  
  *email : {{email}}  
  *name : {{name}}

### Usage

#### Run project with the remote site configs (dev1, stage1):

- Open file:
```
/etc/hosts
```
- Add to file two lines:
```
127.0.0.1 stage1-template-market.openchannel.io
127.0.0.1 dev1-template-market.openchannel.io
```
- Run project with the stage1 environment:
```
sudo npm run start-stage1
```
- Run project with the dev1 environment:
```
sudo npm run start-dev1
```

####  Run project with the Moesif plugin for Chrome (dev1, stage1, us1):

- Install [Moesif](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc/related) CORS plugin for Chrome
- Submit your work email address there
- Open advanced settings
- Fill in the 'Access-Control-Allow-Credentials'<br>
  ``
  true
  ``
- Fill in the 'Response headers' field: <br>
  ``
  http://localhost:4200
  ``
- Fill in the 'Request Headers' field:<br>
  Example for dev1 environment: <br>
  ``
  https://dev1-template-market.openchannel.io
  ``<br>
  Example for stage1 environment: <br>
  ``
  https://stage1-template-market.openchannel.io
  ``  
  *Or just set url from your site:  
  ``
  https://my-site-portal-or-market.io
  ``
- Then start project with command:<br>
  Example for dev1 environment: <br>
  ``
  ng serve -c dev1
  ``  
  Example for stage1 environment: <br>
  ``
  ng serve -c stage1
  ``    
  Example for us1 environment: <br>
  ``
  ng serve -c production
  ``

####  Run project with the remote site configs (us1):
Note: replace <font color="red">YOUR_SITE_DOMAIN</font> with your market domain.

- Open file:
```
/etc/hosts
```
- Add to file this line:
```
127.0.0.1 YOUR_SITE_DOMAIN
```
- Run project with the us1 environment:
```
sudo npm run start-us1 YOUR_SITE_DOMAIN
```
## Search engine discoverability

Project contains the `robots.txt` file. This file tells search engine crawlers which URLs the crawler can
access on your site. This is used mainly to avoid overloading your site with requests. Access is disallowed to the whole
site by default. If you want to allow access, change property:
```
Disallow: /
```
to
```
Allow: /
```

Documentation: [https://developers.google.com/search/docs/advanced/robots/create-robots-txt?hl=en](https://developers.google.com/search/docs/advanced/robots/create-robots-txt?hl=en)

## Documentation Compodoc
Compodoc shows project structure. (modules, components, routes etc.)

- Install NPM packages:
```
npm install
```
- Generate Documentation:
```
npm run create-compodoc
```
- Run Compodoc:
```
npm run start-compodoc
```

- Documentation [http://localhost:8804](http://localhost:8804)

## Contact

Website: [https://openchannel.io](https://openchannel.io)

## Designs

App Store Designs: [https://support.openchannel.io/guides/app-store-designs/](https://support.openchannel.io/guides/app-store-designs/)
