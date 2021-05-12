# template3-marketsite

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Contact](#contact)

<!-- ABOUT THE PROJECT -->
## About The Project

This application represents the market site. It allows to users view and purchases actual apps.

Note: Unauthorized Users can browse Apps.

### Built With
* [Bootstrap](https://getbootstrap.com) v. 4.4.1
* [Angular](https://angular.io) v. 9.1.1

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
Install node.js and npm [Guide](https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/)

### Installation

1. Install NPM packages
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

<!-- USAGE EXAMPLES -->
### Usage

####  Run project with the remote site configs (dev1, stage1) :
1. Update hosts:
    * Open file :<br>
      ```/etc/hosts```
    * Add to file two lines:<br>
      ``
      127.0.0.1 stage1-local-template-market.openchannel.io
      ``<br>
      ``
      127.0.0.1 dev1-local-template-market.openchannel.io
      ``

2. Run project:
    * Run project with the stage1 environment:<br>
      ``
      sudo npm run start-stage1
      ``
    * Run project with the dev1 environment:<br>
      ``
      sudo npm run start-dev1
      ``

####  Run project with the remote site configs (us1) :
Note: replace  <font color="red">YOUR_SITE_DOMAIN</font> with your market domain.

1. Update hosts:
    * Open file :<br>
      ```/etc/hosts```
    * Add to file this line:<br>
      ``
      127.0.0.1 YOUR_SITE_DOMAIN
      ``
2. Run project:
    * Run project with the us1 environment:<br>
      ``
      sudo npm run start-us1 YOUR_SITE_DOMAIN
      ``

#### Run project with the local site configs :

1. Run <font color="red">ONE</font> of this :
    * Project with the Okta SSO <br>
      ``npm run start-okta``
    * Project with Google SSO <br>
      ``npm run start-google``

## Documentation Compodoc
Compodoc show project structure. (modules, components, routes and etc.)

* Install NPM packages :<br>
  ``npm install``

* Generate Documentation :<br>

  ``npm run create-compodoc``

* Run Compodoc :<br>

  ``npm run start-compodoc``
  
* Documentation [http://localhost:8804](http://localhost:8804)

<!-- CONTACT -->
## Contact

Project Link: [https://bitbucket.org/openchannel/template3-portal-frontend/src/develop/](https://bitbucket.org/openchannel/template3-portal-frontend/src/develop/)
