#!/bin/bash


wget https://github.com/enKryptIO/ethvm/blob/master/provisioners/docker/config/mongo/ethvm_sample.archive?raw=true
mongorestore -h 127.0.0.1 --port 27017 ethvm_sample.archive?raw=true
