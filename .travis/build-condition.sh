#!/bin/bash

echo "deb http://repo.mongodb.org/apt/ubuntu precise/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start
wget https://github.com/enKryptIO/ethvm/blob/master/provisioners/docker/config/mongo/ethvm_sample.archive?raw=true
mongorestore -h 127.0.0.1 --port 27017 ethvm_sample.archive
