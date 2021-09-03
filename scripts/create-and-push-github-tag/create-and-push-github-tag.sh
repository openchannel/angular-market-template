#!/usr/bin/env sh

# Create git tag by custom name or package.json version.
# Can push tags with --force flag.

CUSTOM_TAG_NAME=$1
PATH_TO_PACKAGE_JSON_FILE=$2
PUSH_TAG_FORCE=$3

# Get TAG name from property or package.json file.
tagName=${CUSTOM_TAG_NAME:=$(node -e "console.log('v' + require('$PATH_TO_PACKAGE_JSON_FILE').version)")}
echo "The current TAG name is $tagName"
# TAG name validation
if ! ([[ $tagName == v+([0-9]).+([0-9]).+([0-9]) ]] || [[ $tagName == Release-[A-Z]*-+([0-9]) ]])
then
  echo 'Error. Your TAG name must be like v123.123.123 or Release-August-123'
  exit 1
fi

git tag $tagName

# push tag with --force flag only when is 'true'
if [ $PUSH_TAG_FORCE == true ]
then
  git push origin --force $tagName
  else git push origin $tagName
fi

