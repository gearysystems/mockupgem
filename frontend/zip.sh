#!/bin/bash
FILENAME=mockup_gem_frontend.zip

rm $FILENAME
zip -r $FILENAME * --exclude='*node_modules*'
