var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const { now } = require('mongoose');
const User = require('../models/User');
const mail = require('../config/mail');
const fs = require('fs');
const path = require('path');
const {unrar, list} = require('unrar-promise');
const dateConvert = require('../config/dateConvert');
const Log = require('../models/Log');
const Commute = require('../models/Commute');
const bcrypt = require('bcryptjs');
var excel = require('excel4node');

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

var sortAlgorithm = (a, b) => {
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
}

var deltaTime = (time1, time2) => {
    sec1 = (time1.hour * 60 * 60) + (time1.minute * 60) + (time1.second);
    sec2 = (time2.hour * 60 * 60) + (time2.minute * 60) + (time2.second);
    result = Math.abs(sec1 - sec2);
    hour = Math.floor(result/3600);
    minute = Math.floor((result%3600) / 60);
    second = result - (hour*3600 + minute*60)
    return {hour, minute, second};
}

var sumTime = (time1, time2) => {
    sec1 = (time1.hour * 60 * 60) + (time1.minute * 60) + (time1.second);
    sec2 = (time2.hour * 60 * 60) + (time2.minute * 60) + (time2.second);
    result = Math.abs(sec1 + sec2);
    hour = Math.floor(result/3600);
    minute = Math.floor((result%3600) / 60);
    second = result - (hour*3600 + minute*60)
    return {hour, minute, second};
}

var getSec = (time) => {
    return((time.hour * 60 * 60) + (time.minute * 60) + (time.second));
}

var getNow = () => {
    greg = new Date(Date.now());
    day = greg.getDate();
    month = greg.getMonth() + 1;
    year = greg.getFullYear();
    jalali = dateConvert.gregorian_to_jalali(year, month, day);
    return({ year: jalali[0], month: jalali[1], day: jalali[2], date: greg});
}

router.get('/', ensureAuthenticated, (req, res, next) => {
    greg = new Date(Date.now());
    day = greg.getDate();
    month = greg.getMonth() + 1;
    year = greg.getFullYear();
    jalali = dateConvert.gregorian_to_jalali(year, month, day);
    var now = { year: jalali[0], month: jalali[1], day: jalali[2], date: greg};
    

    if(req.user.role == 'user')
    {
        Commute.find({personelID: req.user.idNumber}, (err, commutes) => {
            commutes.sort(sortAlgorithm);
            var thisMonth = [];
            for(var i=0; i<dateConvert.j_days_in_month[now.month-1]; i++){
                var j_year = now.year;
                var j_month = now.month;
                var j_day = i+1;
                var j_date = dateConvert.jalali_to_gregorian(j_year, j_month, j_day);
                var j_d = new Date(j_date[0], j_date[1]-1, j_date[2], 12, 0, 0, 0);
                var thisCommutes = [];
                for (let j = 0; j < commutes.length; j++) {
                    if(commutes[j].j_date.year == j_year && commutes[j].j_date.month == j_month && commutes[j].j_date.day == j_day)
                        thisCommutes.push(commutes[j]);
                }
                thisMonth.push({year: j_year, month: j_month, day: j_day, date: j_d, commutes: thisCommutes});
            }
            res.render('./dashboard/user-dashboard', {
                user: req.user,
                login: req.query.login,
                now,
                thisMonth,
                get_persian_month: dateConvert.get_persian_month,
                day_in_week: dateConvert.day_in_week,
                j_days_in_month: dateConvert.j_days_in_month,
                month: now.month,
                deltaTime,
                sumTime,
                personelID: req.user.idNumber,
            });
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
                    if(logElement[1] == 2 || logElement[1] == 3) enter = true;
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
                        logID: req.query.logID,
                    });
                    newCommute.save().then().catch(err => {if(err) console.log(err);});
                }
            });

            Log.updateMany({_id: req.query.logID}, {$set: {accepted: true}},(err, log) => {
                Commute.find({}, (err, commutes) => {
                    users = [];
                    for (let i = 0; i < commutes.length; i++) {
                        if(users.indexOf(commutes[i].personelID) == -1)
                            users.push(commutes[i].personelID);
                    }
                    // console.log(users);
                    users.forEach(user => {
                        User.findOne({idNumber: user}, (err, found) => {
                            if(!found){
                                var newUser = new User({
                                    idNumber: user, 
                                    password: '1234', 
                                    fullname: `پرسنل ${user}`, 
                                    firstName: `پرسنل`, 
                                    lastName: `${user}`,
                                    role: 'user',
                                });
                                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                                    if(err) throw err;
                                    newUser.password = hash;
                                    newUser.save().then(user => {}).catch(err => console.log(err));
                                }));
                            }
                        });
                    });
                    res.redirect('/dashboard');
                });
            });
        });
    }
});

router.get('/admin-view-user', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        greg = new Date(Date.now());
        day = greg.getDate();
        month = greg.getMonth() + 1;
        year = greg.getFullYear();
        jalali = dateConvert.gregorian_to_jalali(year, month, day);
        var now = { year: jalali[0], month: jalali[1], day: jalali[2], date: greg};
        var monthNum = now.month;
        if(req.query.month) monthNum = req.query.month;
        Commute.find({personelID: req.query.personelID}, (err, commutes) => {
            commutes.sort(sortAlgorithm);
            var monthData = [];
            for(var i=0; i<dateConvert.j_days_in_month[monthNum-1]; i++){
                var j_year = now.year;
                var j_month = monthNum;
                var j_day = i+1;
                var j_date = dateConvert.jalali_to_gregorian(j_year, j_month, j_day);
                var j_d = new Date(j_date[0], j_date[1]-1, j_date[2], 12, 0, 0, 0);
                var thisCommutes = [];
                for (let j = 0; j < commutes.length; j++) {
                    if(commutes[j].j_date.year == j_year && commutes[j].j_date.month == j_month && commutes[j].j_date.day == j_day)
                        thisCommutes.push(commutes[j]);
                }
                monthData.push({year: j_year, month: j_month, day: j_day, date: j_d, commutes: thisCommutes});
            }
            res.render('./dashboard/commute-month', {
                user: req.user,
                now,
                monthData,
                get_persian_month: dateConvert.get_persian_month,
                day_in_week: dateConvert.day_in_week,
                j_days_in_month: dateConvert.j_days_in_month,
                month: monthNum,
                deltaTime,
                sumTime,
                personelID: req.query.personelID,
            });
            // res.render('./dashboard/admin-view-user', {
            //     user: req.user,
            //     commutes,
            //     personelID: req.query.personelID,
            // });
        });
    }
});

router.get('/commute-month', ensureAuthenticated, (req, res, next) => {
    var monthNum = req.query.month;
    if(monthNum == 0)  res.redirect(`/dashboard/commute-month?month=${12}`);
    if(monthNum == 13) res.redirect(`/dashboard/commute-month?month=${1}`);
    greg = new Date(Date.now());
    day = greg.getDate();
    month = greg.getMonth() + 1;
    year = greg.getFullYear();
    jalali = dateConvert.gregorian_to_jalali(year, month, day);
    var now = { year: jalali[0], month: jalali[1], day: jalali[2], date: greg};
    Commute.find({personelID: req.user.idNumber}, (err, commutes) => {
        commutes.sort(sortAlgorithm);
        var monthData = [];
        for(var i=0; i<dateConvert.j_days_in_month[monthNum-1]; i++){
            var j_year = now.year;
            var j_month = monthNum;
            var j_day = i+1;
            var j_date = dateConvert.jalali_to_gregorian(j_year, j_month, j_day);
            var j_d = new Date(j_date[0], j_date[1]-1, j_date[2], 12, 0, 0, 0);
            var thisCommutes = [];
            for (let j = 0; j < commutes.length; j++) {
                if(commutes[j].j_date.year == j_year && commutes[j].j_date.month == j_month && commutes[j].j_date.day == j_day)
                    thisCommutes.push(commutes[j]);
            }
            monthData.push({year: j_year, month: j_month, day: j_day, date: j_d, commutes: thisCommutes});
        }
        res.render('./dashboard/commute-month', {
            user: req.user,
            now,
            monthData,
            get_persian_month: dateConvert.get_persian_month,
            day_in_week: dateConvert.day_in_week,
            j_days_in_month: dateConvert.j_days_in_month,
            month: monthNum,
            deltaTime,
            sumTime,
        });
    });
});

router.get('/admin-clear-data', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        User.deleteMany({role: 'user'}, err => {
            if(err) console.log(err);
            Commute.deleteMany({}, err => {
                if(err) console.log(err);
                Log.updateMany({}, {$set: {accepted: false}}, (err, doc) => {
                    if(err) console.log(err);
                    res.redirect('/dashboard/log-list');
                })
            })
        })
    }
});

router.get('/remove-commute', ensureAuthenticated, (req, res, next) => {
    if(req.user.role == 'admin'){
        Commute.deleteOne({_id: req.query.id1}, err => {
            Commute.deleteOne({_id: req.query.id2}, err => {
                res.redirect(`/dashboard/admin-view-user?personelID=${req.query.personelID}&month=${req.query.month}`)
            });
        });
    }
});

router.post('/edit-commute', ensureAuthenticated, (req, res, next) => {
    var {date, Dday, Dmonth, Dyear, month, personelID, enterCommuteID, exitCommuteID, enterDeviceID, exitDeviceID, enterMinute, enterHour, exitMinute, exitHour} = req.body;
    var accepted = false;
    if(req.user.role == 'admin') accepted = true;
    var role = req.user.role;
    if (role == 'user') personelID = req.user.idNumber;
    if(exitCommuteID == 'undefined'){
        enterTime = {hour: enterHour, minute: enterMinute, second: 0};
        exitTime = {hour: exitHour, minute: exitMinute, second: 0};
        Commute.updateMany({_id: enterCommuteID}, {$set: {time: enterTime, deviceID: enterDeviceID}}, (err, doc) => {
            var newCommute = new Commute({
                personelID,
                // date: new Date(date),
                j_date: {day: Dday, month: Dmonth, year: Dyear, date},
                time: exitTime,
                deviceID: exitDeviceID,
                Enter: false,
                logID: 'edit',
                accepted,
            });
            newCommute.save().then(doc => {
                if(role == 'admin') res.redirect(`/dashboard/admin-view-user?personelID=${personelID}&month=${month}`)
                else                res.redirect(`/dashboard/commute-month?personelID=${personelID}&month=${month}`)
            }).catch(err => {if(err) console.log(err);});
        });
    }else if(enterCommuteID == 'undefined'){
        enterTime = {hour: enterHour, minute: enterMinute, second: 0};
        exitTime = {hour: exitHour, minute: exitMinute, second: 0};
        Commute.updateMany({_id: exitCommuteID}, {$set: {time: exitTime, deviceID: exitDeviceID}}, (err, doc) => {
            var newCommute = new Commute({
                personelID,
                // date: new Date(date),
                j_date: {day: Dday, month: Dmonth, year: Dyear, date: date},
                time: enterTime,
                deviceID: enterDeviceID,
                Enter: true,
                logID: 'edit',
                accepted,
            });
            newCommute.save().then(doc => {
                if(role == 'admin') res.redirect(`/dashboard/admin-view-user?personelID=${personelID}&month=${month}`)
                else                res.redirect(`/dashboard/commute-month?personelID=${personelID}&month=${month}`)
            }).catch(err => {if(err) console.log(err);});
        });
    }else{
        enterTime = {hour: enterHour, minute: enterMinute, second: 0};
        exitTime = {hour: exitHour, minute: exitMinute, second: 0};
        Commute.updateMany({_id: enterCommuteID}, {$set: {time: enterTime, deviceID: enterDeviceID}}, (err, doc) => {
            if(err) console.log(err);
            Commute.updateMany({_id: exitCommuteID}, {$set: {time: exitTime, deviceID: exitDeviceID}}, (err, doc) => {
                if(err) console.log(err);
                if(role == 'admin') res.redirect(`/dashboard/admin-view-user?personelID=${personelID}&month=${month}`)
                else                res.redirect(`/dashboard/commute-month?personelID=${personelID}&month=${month}`)
            });
        });
    }
});

router.get('/delete-incorrect-commutes', ensureAuthenticated, (req, res, next) => {
    var {personelID, month} = req.query;
    Commute.find({personelID: req.query.personelID}, (err, commutes) => {
        commutes.sort(sortAlgorithm);
        deleteCommutesID = [];
        for (let i = 0; i < commutes.length; i++) {
            if(commutes[i].j_date.month != req.query.month)
                commutes.splice(i, 1);
        }
        for(var j=0; j<commutes.length-1; j+=2){
            if(commutes[j].Enter && !commutes[j+1].Enter ) {
                
            }
            else if(!commutes[j].Enter){
                if(commutes[j-1] && commutes[j-1] != 'undefined')
                {
                    if(getSec(deltaTime(commutes[j].time, commutes[j-1].time)) < 60 && commutes[j].deviceID == commutes[j-1].deviceID)
                        deleteCommutesID.push(commutes[j]._id);
                }
                if(commutes[j+1] && commutes[j+1] != 'undefined')
                {    
                    if(getSec(deltaTime(commutes[j].time, commutes[j+1].time)) < 60 && commutes[j].deviceID == commutes[j+1].deviceID)
                        deleteCommutesID.push(commutes[j]._id);
                }
                commutes.splice(j  , 0, 'undefined');
            }
            else if(commutes[j+1].Enter){
                if(commutes[j+1] && commutes[j+1] != 'undefined')
                {
                    if(getSec(deltaTime(commutes[j].time, commutes[j+1].time)) < 60 && commutes[j].deviceID == commutes[j+1].deviceID)
                        deleteCommutesID.push(commutes[j]._id);
                }
                if(commutes[j-1] && commutes[j-1] != 'undefined')
                {
                    if(getSec(deltaTime(commutes[j].time, commutes[j-1].time)) < 60 && commutes[j].deviceID == commutes[j-1].deviceID)
                        deleteCommutesID.push(commutes[j]._id);
                }
                commutes.splice(j+1, 0, 'undefined');
            }
        }
        deleteCommutesID.forEach(del => {
            Commute.deleteOne({_id: del}, (err) => {
                console.log('deleted ' + del);
            });
        });
        if(req.user.role == 'admin') 
            res.redirect(`/dashboard/admin-view-user?personelID=${personelID}&month=${month}`)
        else                
            res.redirect(`/dashboard/commute-month?personelID=${personelID}&month=${month}`)
    });
});

router.get('/report', ensureAuthenticated, (req, res, next) => {
    if(req.user.role = 'admin')
    {
        Commute.find({}, (err, commutes) => {
            users = [];
            for (let i = 0; i < commutes.length; i++) {
                if(users.indexOf(commutes[i].personelID) == -1)
                    users.push(commutes[i].personelID);
            }
            users.sort(function(a, b){return a-b});
            commutes.sort(sortAlgorithm);
            var usersTime = [];
            for (let i = 0; i < users.length; i++) {
                sum = {hour: 0, minute: 0, second: 0}
                // for(var j=0; j<commutes.length-1; j+=2){
                //     if(commutes[j].personelID == users[i] && commutes[j+1].personelID == users[i]){
                //         if(commutes[j].Enter && !commutes[j+1].Enter ) {
                //             sum = sumTime(sum, deltaTime(commutes[j].time, commutes[j+1].time))
                //         }
                //         else if(!commutes[j].Enter)   
                //             commutes.splice(j  , 0, 'undefined');
                //         else if(commutes[j+1].Enter)  
                //             commutes.splice(j+1, 0, 'undefined');
                //     }
                // }
                usersTime.push(sum);
            }
            // console.log(usersTime);
            res.render('./dashboard/admin-report', {
                user: req.user,
                login: req.query.login,
                users,
                usersTime,
            });
        });
    }
});

router.get('/admin-report-user', ensureAuthenticated, (req, res, next) => {
    var now = getNow();
    if(req.user.role == 'admin')
    {
        Commute.find({personelID: req.query.personelID}, (err, commutes) => {
            commutes.sort(sortAlgorithm);
            report = [];
            for(var monthNum=1; monthNum<=12; monthNum++){
                var workbook = new excel.Workbook();
                var worksheet = workbook.addWorksheet(dateConvert.get_persian_month(monthNum) + ' ' + now.year);
                var style = workbook.createStyle({
                    font: {
                    color: '#111111',
                    size: 12
                    },
                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                });
                var styleGreen = workbook.createStyle({
                    font: {
                    color: '#00AA00',
                    size: 12
                    },
                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                });
                var styleBlue = workbook.createStyle({
                    font: {
                    color: '#0000AA',
                    size: 12
                    },
                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                });
                var styleRed = workbook.createStyle({
                    font: {
                    color: '#AA0000',
                    size: 12
                    },
                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                });
                worksheet.cell(1,1).string(`ردیف`).style(style);
                worksheet.cell(1,2).string(`دستگاه ورود`).style(style);
                worksheet.cell(1,3).string(`دستگاه خروج`).style(style);
                worksheet.cell(1,4).string(`ساعت ورود`).style(style);
                worksheet.cell(1,5).string(`ساعت خروج`).style(style);
                worksheet.cell(1,6).string(`تاریخ`).style(style);
                worksheet.cell(1,7).string(`زمان حضور`).style(style);
                worksheet.cell(1,8).string(`مجموع روز`).style(style);
                worksheet.cell(1,9).string(`مجموع ماه`).style(style);
                monthData = [];
                cnt = 2;
                for(var i=0; i<dateConvert.j_days_in_month[monthNum-1]; i++){
                    var j_year = now.year;
                    var j_month = monthNum;
                    var j_day = i+1;
                    var j_date = dateConvert.jalali_to_gregorian(j_year, j_month, j_day);
                    var j_d = new Date(j_date[0], j_date[1]-1, j_date[2], 12, 0, 0, 0);
                    var thisCommutes = [];
                    for (let j = 0; j < commutes.length; j++) {
                        if(commutes[j].j_date.year == j_year && commutes[j].j_date.month == j_month && commutes[j].j_date.day == j_day)
                            thisCommutes.push(commutes[j]);
                    }
                    monthData.push({year: j_year, month: j_month, day: j_day, date: j_d, commutes: thisCommutes});
                }
                monthSum = {hour: 0, minute: 0, second: 0};
                colorCnt = 0;
                for(var i=0; i<monthData.length; i++){
                    var correct = 0, incorrect = 0, sum = {hour: 0, minute: 0, second: 0}, total = {hour: 0, minute: 0, second: 0};
                    for(var j=0; j<monthData[i].commutes.length-1; j+=2){
                        if(monthData[i].commutes[j].Enter && !monthData[i].commutes[j+1].Enter ) {
                            correct++; 
                            sum = sumTime(sum, deltaTime(monthData[i].commutes[j].time, monthData[i].commutes[j+1].time))
                            delta = deltaTime(monthData[i].commutes[j].time, monthData[i].commutes[j+1].time);
                            if(colorCnt%2 == 0){
                                style = workbook.createStyle({
                                    font: {
                                    color: '#111111',
                                    size: 12
                                    },
                                    fill: {
                                        type: 'pattern',
                                        patternType: 'solid',
                                        bgColor: '#dff7ff',
                                        fgColor: '#dff7ff',
                                    },
                                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                                });
                            }else{
                                style = workbook.createStyle({
                                    font: {
                                    color: '#111111',
                                    size: 12
                                    },
                                    fill: {
                                        type: 'pattern',
                                        patternType: 'solid',
                                        bgColor: '#ffe2df',
                                        fgColor: '#ffe2df',
                                    },
                                    numberFormat: '$#,##0.00; ($#,##0.00); -'
                                });
                            }
                            worksheet.cell(cnt,1).string(`${cnt - 1}`).style(style);
                            worksheet.cell(cnt,2).string(`${monthData[i].commutes[j].deviceID}`).style(style);
                            worksheet.cell(cnt,3).string(`${monthData[i].commutes[j+1].deviceID}`).style(style);
                            worksheet.cell(cnt,4).string(`${monthData[i].commutes[j].time.hour}:${monthData[i].commutes[j].time.minute}:${monthData[i].commutes[j].time.second}`).style(style);
                            worksheet.cell(cnt,5).string(`${monthData[i].commutes[j+1].time.hour}:${monthData[i].commutes[j+1].time.minute}:${monthData[i].commutes[j+1].time.second}`).style(style);
                            worksheet.cell(cnt,6).string(`${monthData[i].commutes[j].j_date.year}/${monthData[i].commutes[j].j_date.month}/${monthData[i].commutes[j].j_date.day}`).style(style);
                            worksheet.cell(cnt,7).string(`${delta.hour}:${delta.minute}:${delta.second}`).style(styleGreen);
                            cnt++;
                        }
                        else if(!monthData[i].commutes[j].Enter)    {incorrect++;monthData[i].commutes.splice(j  , 0, 'undefined');}
                        else if(monthData[i].commutes[j+1].Enter)   {incorrect++;monthData[i].commutes.splice(j+1, 0, 'undefined');}
                        else incorrect++;
                    }
                    if(monthData[i].commutes.length != 0){
                        worksheet.cell(cnt-1,8).string(`${sum.hour}:${sum.minute}:${sum.second}`).style(styleBlue);
                        colorCnt++;
                    }
                    monthSum = sumTime(monthSum, sum);                    
                }
                worksheet.cell(2,9).string(`${monthSum.hour}:${monthSum.minute}:${monthSum.second}`).style(styleRed);
                if(!fs.existsSync(path.join(__dirname, "/../public/output")))
                    fs.mkdirSync(path.join(__dirname, "/../public/output"));
                if(!fs.existsSync(path.join(__dirname, '/../public/output/personel-' + req.query.personelID.toString())))
                    fs.mkdirSync(path.join(__dirname, '/../public/output/personel-' + req.query.personelID.toString()));
                workbook.write(`./public/output/personel-${req.query.personelID}/${dateConvert.get_persian_month(monthNum)}_${now.year}.xlsx`);
                report.push({
                    name: `${dateConvert.get_persian_month(monthNum)} ${now.year}`,
                    out: `/output/personel-${req.query.personelID}/${dateConvert.get_persian_month(monthNum)}_${now.year}.xlsx`,
                    monthData: monthData,
                    monthSum: monthSum,
                });
            }
            res.render('./dashboard/admin-user-report', {
                user: req.user,
                report,
                personelID: req.query.personelID,
            });
        });
    }
});

module.exports = router;
