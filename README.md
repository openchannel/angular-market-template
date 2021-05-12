# Template3-marketsite

## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Contact](#contact)

## About The Project

The goal of a marketplace template site is to allow users to browse and install actual applications. This app represents the market site.

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
- Optional. Dependency with oc-ng-common-service.
```
npm install file:<absolute path to common service project dist/oc-ng-common-service>
```
- Optional. Dependency with oc-ng-common-components.
```
npm install file:<absolute path to common component project dist/oc-ng-common-components>
```

### Usage

#### Run project with the remote site configs (dev1, stage1):

- Open file:
```
/etc/hosts
```
- Add to file two lines:
```
127.0.0.1 stage1-local-template-market.openchannel.io
127.0.0.1 dev1-local-template-market.openchannel.io
```
- Run project with the stage1 environment:
```
sudo npm run start-stage1
```
- Run project with the dev1 environment:
```
sudo npm run start-dev1
```

####  Run project with the Moesif plugin for Chrome:
 
- Install [Moesif](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc/related) CORS plugin for Chrome
- Submit your work email address there
- Open advanced settings
- Fill in the 'Request Headers' field:
```
https://stage1-local-template-market.openchannel.io/
```
or:
```
https://dev1-local-template-market.openchannel.io/
```
- Fill in the 'Response headers' field:
```
http://localhost:4200/
```
- Run project using:
```
sudo ng serve
```

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

#### Run project with the local site configs:

##### Run <font color="red">ONE</font> of this:

- Project with the Okta SSO
```
npm run start-okta
```
- Project with Google SSO
```
npm run start-google
```

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

### Sonarcloud code quality badge

SonarCloud Quality Gate Status [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=openchannel_template3-marketsite&metric=alert_status&token=09ecb76af06050dd9ee59a4ada98a9e937517fbf)](https://sonarcloud.io/dashboard?id=openchannel_template3-marketsite)

## Contact

Project Link: [https://bitbucket.org/openchannel/template3-portal-frontend/src/develop/](https://bitbucket.org/openchannel/template3-portal-frontend/src/develop/)

## Designs

Project Designs: [https://app.zeplin.io/project/5fad60184ae36d25530c9843/screen/6059dd1ed61d2e07c233929e](https://app.zeplin.io/project/5fad60184ae36d25530c9843/screen/6059dd1ed61d2e07c233929e)
