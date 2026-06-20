@echo off
title Food Saver Platform Backend
echo Starting Spring Boot Backend...
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.11
cd backend
"C:\Food Management\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
pause
