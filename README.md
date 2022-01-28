# Sibche Commute Web Application
Commute management systom for sibche. This app is based on `node.js` framework and it's easy to install/use. To install and run this web app in a Linux OS just fallow the instruction below. 
# Requirements 
2. Install **nodejs** using the command below. for checking the version you installed use `node -v`.
```
sudo apt-get update
sudo apt-get -y install curl dirmngr apt-transport-https lsb-release ca-certificates vim
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get -y install nodejs
```
5. Install **mongodb-org** using the command below.
```
sudo apt-get install mongodb
```
6. Install **nodemon** and **forever** globaly using `npm` and the command below.
```
npm i -g nodemon
npm i -g forever
```
7. Clone this repo using the command below. Then go to its directory.
```
git clone https://github.com/fdmxfarhan/sibche-commute.git
cd sibche-commute
```
# Run and Use
1. Run the command below to start http server forever on OS.
```
forever start index.js
```
