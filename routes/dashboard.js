var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { now } = require('mongoose');
const User = require('../models/User');
const mail = require('../config/mail');
const fs = require('fs');
const {unrar, list} = require('unrar-promise');
const dateConvert = require('../config/dateConvert');
const Log = require('../models/Log');
const Commute = require('../models/Commute');

// async function main(){

//     await unrar(__dirname + '/../public/log 14000415.rar', './public/log');
// };
// fs.readFile(__dirname + '/../public/log/log 14000415/AGL_001.TXT', function (err, data) {
//     if (err) throw err;
//     var log1 = data.toString('UTF8').split('\r\n');
//     for (let i = 0; i < log1.length; i++) {
//         log1[i] = log1[i].split('\t');
//         log1[i][0] = parseInt(log1[i][0]);
//         log1[i][1] = parseInt(log1[i][1]);
//         log1[i][2] = parseInt(log1[i][2]);
//         log1[i][4] = parseInt(log1[i][4]);
//         log1[i][5] = parseInt(log1[i][5]);
//     }
//     console.log(log1)
// })








router.get('/', ensureAuthenticated, (req, res, next) => {
    greg = new Date(Date.now());
    day = greg.getDate();
    month = greg.getMonth() + 1;
    year = greg.getFullYear();
    jalali = dateConvert.gregorian_to_jalali(year, month, day);
    var now = { year: jalali[0], month: jalali[1], day: jalali[2], date: greg};
    var thisMonth = [];
    for(var i=0; i<dateConvert.j_days_in_month[now.month]; i++){
        var j_year = now.year;
        var j_month = now.month;
        var j_day = i+1;
        var j_date = dateConvert.jalali_to_gregorian(j_year, j_month, j_day);
        var j_d = new Date(j_date[0], j_date[1]-1, j_date[2], 12, 0, 0, 0);
        // console.log(j_date, j_d)
        thisMonth.push({year: j_year, month: j_month, day: j_day, date: j_d});
    }

    if(req.user.role == 'user')
    {
        res.render('./dashboard/user-dashboard', {
            user: req.user,
            login: req.query.login,
            now,
            thisMonth,
            get_persian_month: dateConvert.get_persian_month,
            day_in_week: dateConvert.day_in_week,
            j_days_in_month: dateConvert.j_days_in_month,
            
        });
    }
    else if(req.user.role = 'admin')
    {
        Commute.find({}, (err, commutes) => {
            users = [];
            for (let i = 0; i < commutes.length; i++) {
                if(users.indexOf(commutes[i].personelID) == -1)
                    users.push(commutes[i].personelID);
            }
            users.sort(function(a, b){return a-b});
            res.render('./dashboard/admin-dashboard', {
                user: req.user,
                login: req.query.login,
                users,

            });
        });
    }
});

router.get('/log-list', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Log.find({}, (err, logs) => {
            res.render('./dashboard/admin-log-list', {
                user: req.user,
                logs,
            });
        });
    }
});

router.get('/log-view', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Log.findById(req.query.logID, (err, log) => {
            if(err) console.log(err);
            res.render('./dashboard/admin-log-view', {
                user: req.user,
                log,
            });
        });
    }
});

router.get('/accept-log', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Log.findById(req.query.logID, (err, log) => {
            if(err) console.log(err);
            var logs = [];
            logs = logs.concat(log.log1);
            logs = logs.concat(log.log2);
            logs = logs.concat(log.log3);
            logs = logs.concat(log.log4);
            // console.log(logs);
            logs.forEach(logElement => {
                if(logElement.length == 7 && !isNaN(parseInt(logElement[0]))){
                    var enter = false;
                    if(logElement[1]%2 == 0) enter = true;
                    var dateTime = logElement[6].split(' ');
                    year = parseInt(dateTime[0].slice(0, 4));
                    month = parseInt(dateTime[0].slice(5, 7));
                    day = parseInt(dateTime[0].slice(8, 10));
                    var date = new Date(year, month - 1, day, 12, 0, 0, 0);
                    var jalali = dateConvert.gregorian_to_jalali(year, month, day);
                    var j_date = {year: jalali[0], month: jalali[1], day: jalali[2], date: date};
                    hour   = parseInt(dateTime[1].slice(0, 2));
                    minute = parseInt(dateTime[1].slice(3, 5));
                    second = parseInt(dateTime[1].slice(6, 8));
                    var time = {hour, minute, second};
                    var newCommute = new Commute({
                        personelID: logElement[2],
                        date: date,
                        j_date: j_date,
                        time: time,
                        deviceID: logElement[1],
                        Enter: enter,
                    });
                    newCommute.save().then().catch(err => {if(err) console.log(err);});
                }
            });

            Log.updateMany({_id: req.query.logID}, {$set: {accepted: true}},(err, log) => {
                res.redirect('/dashboard');
            });

        });
    }
});

router.get('/admin-view-user', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Commute.find({personelID: req.query.personelID}, (err, commutes) => {
            commutes.sort(function (a, b) {
                if(a.j_date.year == b.j_date.year){
                    if(a.j_date.month == b.j_date.month){
                        if(a.j_date.day == b.j_date.day){
                            if(a.time.hour == b.time.hour){
                                if(a.time.minute == b.time.minute){
                                    return a.time.second - b.time.second;
                                }
                                return a.time.minute - b.time.minute;
                            }
                            return a.time.hour - b.time.hour;
                        }
                        return a.j_date.day - b.j_date.day;
                    }
                    return a.j_date.month - b.j_date.month;
                }
                return a.j_date.year - b.j_date.year;
            });
            res.render('./dashboard/admin-view-user', {
                user: req.user,
                commutes,
                personelID: req.query.personelID,
            });
        });
    }
});

module.exports = router;
