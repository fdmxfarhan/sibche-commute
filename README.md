# Sibche Commute Web Application
Commute management systom for sibche. This app is based on `node.js` framework and it's easy to install/use. To install and run this web app in a Linux OS just fallow the instruction below. 
# Requirements 
2. Install **nodejs** using the command below. for checking the version you installed use `node -v`.
```
sudo apt install nodejs
```
3. Install **npm** using the command below. for checking the version you installed use `npm -v`.
```
sudo apt install npm
```
5. Install **mongodb-org** using the command below.
```
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
apt-key list
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt update
sudo apt install mongodb-org
sudo systemctl start mongod.service
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
