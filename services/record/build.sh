#!/usr/bin/bash
mvn clean install -DskipTests
docker build -t record .