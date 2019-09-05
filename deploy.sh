#!/bin/bash

set -e

npm run build

cd dist

git init
git add -A
git commit -m 'deploy'


git push -f https://github.com/RoyShen12/royshen12.github.io.git master

cd -
