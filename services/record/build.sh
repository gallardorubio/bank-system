#!/usr/bin/bash
mvn clean package -DskipTests
docker build -t record:latest .