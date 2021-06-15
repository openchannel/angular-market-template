#!/usr/bin/env sh

# required
JIRA_EMAIL=$1
JIRA_API_KEY=$2
JIRA_FIX_VERSION=$3

# optional
NPM_REPOSITORY_VERSION=$4
NPM_LIBS_VERSION=$5

GIT_REPOSITORY_NAME='template3-portal-frontend'

#local variables
isAmendCommit=false
commitMessage=""

echo "JIRA_FIX_VERSION ${JIRA_FIX_VERSION}"
echo "NPM_LIBS_VERSION ${NPM_LIBS_VERSION}"
echo "NPM_REPOSITORY_VERSION ${NPM_LIBS_VERSION}"

# ==== Get latest changes
git pull

# ==== To project directory ====
cd ../..
projectDirectory=$(pwd);

# ==== Utils ====
function whenError() {
  # $1 - message
  if [ $? == 1 ]; then
    echo "$1" && exit 1
  fi
}

# ==== Up main repository version ====
function upPackageJsonVersion() {
  # $1 - it is path to library
  cd $1 && npm version ${NPM_REPOSITORY_VERSION}
  whenError "Can't update package.json version $1"
  echo "${result} Up package.json version to ${NPM_REPOSITORY_VERSION} (path: $1)"
}

## => (Optional) In main package.json (create a new commit with version + creat a changelog.file)
if [ ! -z ${NPM_REPOSITORY_VERSION} ];
  then
    # => Up repository version
    echo "Up (repository) version to ${NPM_REPOSITORY_VERSION}"
    isAmendCommit=true
    upPackageJsonVersion "${projectDirectory}"
    commitMessage="Up repository version to ${NPM_REPOSITORY_VERSION}."

    # => Create changelog.md file
    echo 'Creating a new changelog.md from JIRA issues.'
    cd ${projectDirectory}/scripts/up-version/jira-changelog
    npm i
    EMAIL=${JIRA_EMAIL} API_KEY=${JIRA_API_KEY} FIX_VERSION=${JIRA_FIX_VERSION} NPM_VERSION=${NPM_REPOSITORY_VERSION} GIT_REPOSITORY_NAME=${GIT_REPOSITORY_NAME} node jira-changelog-builder.js
    whenError "Can't create changelog.md file"
    commitMessage="${commitMessage} Added changelog.md."
fi

# ==== (Optional) Up service and components dependencies version ====
if [ ! -z ${NPM_LIBS_VERSION} ];
  then
    cd ${projectDirectory}
    echo "Up (services) version to ${NPM_LIBS_VERSION}"
    npm i @openchannel/angular-common-services@${NPM_LIBS_VERSION}
    whenError "Can't up service version to ${NPM_LIBS_VERSION}"
    npm i @openchannel/angular-common-components@${NPM_LIBS_VERSION}
    echo "Up (components) version to ${NPM_LIBS_VERSION}"
    whenError "Can't up components version. to ${NPM_LIBS_VERSION}"
    commitMessage="${commitMessage} Up service and components version to ${NPM_LIBS_VERSION}."
fi

cd ${projectDirectory}
npm i

# ==== Build project. Commit changes. Push changes.
echo "Build project."
npm run build
whenError "Error: Build failed."

echo "Commit changes ${commitMessage}"
git add 'package.json'
git add 'package-lock.json'
git add 'changelog.md'

if [ ${isAmendCommit} == true ];
  then git commit --amend -m "${commitMessage}"
  else git commit -m "${commitMessage}"
fi

echo "Push commit"
git push
