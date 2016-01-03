#!/bin/bash

if [ $# == 0 ];
then
    name=$(( $(basename $(find content -type f -name '*.md' | awk -F/ '{print $5}' | sort -nr | head -n1) .md) + 1 ))
else
    name=$1
fi;

hugo new -k post $(date +%Y/%m/%d)/$name.md
