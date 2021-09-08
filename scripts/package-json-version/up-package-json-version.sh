#!/bin/bash
# 1. Update package.json version.
# 2. Update @openchannel/angular-common-components and @openchannel/angular-common-services version.
# 3. Commit and push changes.

PROJECT_VERSION=$1
SERVICES_AND_COMPONENTS_VERSION=$2
commitMessage='';

echo "Options :"
echo "PROJECT_VERSION = $PROJECT_VERSION"
echo "SERVICES_AND_COMPONENTS_VERSION = $SERVICES_AND_COMPONENTS_VERSION"

# --- Utils ---
function whenError() {
  # $1 - message
  if [ $? == 1 ]; then
    echo "$1" && exit 1
  fi
}

# (Optional step)
# --- Up package.json version ---
if [[ -z $PROJECT_VERSION ]]
then
  echo 'Skipped updating package.json version. Because input property PROJECT_VERSION is blank ...'
elif ([[ $PROJECT_VERSION == +([0-9]).+([0-9]).+([0-9]) ]] || [[ $PROJECT_VERSION == +([0-9]).+([0-9]).+([0-9])-+([0-9]) ]])
then
  echo "Updating package.json to $PROJECT_VERSION version."
  npm version $PROJECT_VERSION --no-git-tag-version --allow-same-version
  whenError "Error. Unknown."
  commitMessage+="Up project version to $PROJECT_VERSION."
else
  echo "Error. Can't update package.json to $PROJECT_VERSION version. Because new version is invalid, must be like 1.1.1 or 1.1.1-1 ."
  exit 1
fi


# (Optional step)
# --- Up services and components version
if [[ -z $SERVICES_AND_COMPONENTS_VERSION ]]
then
  echo "Skipped updating 'angular-common-components' and 'angular-common-services' version. Because input property PROJECT_VERSION is blank ..."
elif ([[ $SERVICES_AND_COMPONENTS_VERSION == +([0-9]).+([0-9]).+([0-9]) ]] || [[ $SERVICES_AND_COMPONENTS_VERSION == +([0-9]).+([0-9]).+([0-9])-+([0-9]) ]])
then
  echo "Updating 'angular-common-components' and 'angular-common-services' version to $SERVICES_AND_COMPONENTS_VERSION version."
  npm i "@openchannel/angular-common-services@$SERVICES_AND_COMPONENTS_VERSION"
  whenError "Can't up service version to $SERVICES_AND_COMPONENTS_VERSION"
  npm i "@openchannel/angular-common-components@$SERVICES_AND_COMPONENTS_VERSION"
  echo "Up (components) version to $SERVICES_AND_COMPONENTS_VERSION"
  whenError "Can't up components version. to $SERVICES_AND_COMPONENTS_VERSION"
  commitMessage+=" Up libs version to $SERVICES_AND_COMPONENTS_VERSION."
else
  echo "Error. Can't 'angular-common-components' and 'angular-common-services' to $SERVICES_AND_COMPONENTS_VERSION version. Because new version is invalid, must be like 1.1.1 or 1.1.1-1 ."
  exit 1
fi

# (Optional step)
# --- Push changes to git ---
if [[ ! -z commitMessage ]] && [[ ! -z $(git status --porcelain) ]]
then
  git add .
  git commit -m "$commitMessage"
  git push
fi
