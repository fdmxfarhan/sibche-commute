var express = require('express');
var path = require('path');
var router = express.Router();
var bodyparser = require('body-parser');
const multer = require('multer');
const mail = require('../config/mail');
const { ensureAuthenticated } = require('../config/auth');
const mkdirp = require('mkdirp');
const fs = require('fs');
const {unrar, list} = require('unrar-promise');
const Log = require('../models/Log');
const dateConvert = require('../config/dateConvert');

router.use(bodyparser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'public/files/' + Date.now().toString();
        mkdirp(dir, err => cb(err, dir));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
});

var upload = multer({ storage: storage });

async function extractRar(fileName){
    await unrar(__dirname + '/../public/log 14000415.rar', './public/log');
};



router.post('/log', ensureAuthenticated, upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    const { title } = req.body;

    if (!file) {
        res.send('no file to upload');
    } else {
        var fileName = file.destination.slice(6) + '/' + file.originalname;
        console.log(fileName);
        unrar(__dirname + '/../public' + fileName, './public/log').then(() => {
            console.log('passed');
            var log1, log2, log3, log4;
            fs.readFile(__dirname + '/../public/log/log 14000415/AGL_001.TXT', function (err, data) {
                if (err) throw err;
                log1 = data.toString('UTF8').split('\r\n');
                for (let i = 0; i < log1.length; i++) {
                    log1[i] = log1[i].split('\t');
                    if(i != 0){
                        log1[i][0] = parseInt(log1[i][0]);
                        log1[i][1] = parseInt(log1[i][1]);
                        log1[i][2] = parseInt(log1[i][2]);
                        log1[i][4] = parseInt(log1[i][4]);
                        log1[i][5] = parseInt(log1[i][5]);
                    }
                }
                // console.log(log1)
                fs.readFile(__dirname + '/../public/log/log 14000415/AGL_002.TXT', function (err, data) {
                    if (err) throw err;
                    log2 = data.toString('UTF8').split('\r\n');
                    for (let i = 0; i < log2.length; i++) {
                        log2[i] = log2[i].split('\t');
                        if(i != 0){
                            log2[i][0] = parseInt(log2[i][0]);
                            log2[i][1] = parseInt(log2[i][1]);
                            log2[i][2] = parseInt(log2[i][2]);
                            log2[i][4] = parseInt(log2[i][4]);
                            log2[i][5] = parseInt(log2[i][5]);
                        }
                    }
                    // console.log(log2)
                    fs.readFile(__dirname + '/../public/log/log 14000415/AGL_003.TXT', function (err, data) {
                        if (err) throw err;
                        log3 = data.toString('UTF8').split('\r\n');
                        for (let i = 0; i < log3.length; i++) {
                            log3[i] = log3[i].split('\t');
                            if(i != 0){
                                log3[i][0] = parseInt(log3[i][0]);
                                log3[i][1] = parseInt(log3[i][1]);
                                log3[i][2] = parseInt(log3[i][2]);
                                log3[i][4] = parseInt(log3[i][4]);
                                log3[i][5] = parseInt(log3[i][5]);
                            }
                        }
                        // console.log(log3)
                        fs.readFile(__dirname + '/../public/log/log 14000415/AGL_004.TXT', function (err, data) {
                            if (err) throw err;
                            log4 = data.toString('UTF8').split('\r\n');
                            for (let i = 0; i < log4.length; i++) {
                                log4[i] = log4[i].split('\t');
                                if(i != 0){
                                    log4[i][0] = parseInt(log4[i][0]);
                                    log4[i][1] = parseInt(log4[i][1]);
                                    log4[i][2] = parseInt(log4[i][2]);
                                    log4[i][4] = parseInt(log4[i][4]);
                                    log4[i][5] = parseInt(log4[i][5]);
                                }
                            }
                            // console.log(log4)
                            greg = new Date(Date.now());
                            day = greg.getDate();
                            month = greg.getMonth() + 1;
                            year = greg.getFullYear();
                            jalali = dateConvert.gregorian_to_jalali(year, month, day);
                            var now = { year: jalali[0], month: jalali[1], day: jalali[2], date: greg};
                            console.log(log1);
                            console.log(log2);
                            console.log(log3);
                            console.log(log4);


                            var newLog = new Log({date: Date().Now, j_date: now, log1, log2, log3, log4, title});
                            newLog.save().then(log => {
                                console.log('log saved :)');
                            }).catch(err => {if(err) console.log(err);});
                            
                            res.redirect(`/dashboard/log-view?logID=${newLog._id}`);
                        });
                    });
                });
            });
            
            
            
            

        }).catch(err => {if(err) console.log(err);});
        
        // var startDate = { day, month, year };
        // var endDate = { day: endDay, month: endMonth, year: endYear };
        // const newCourse = new Course({ title, description, teacher, session, minAge, maxAge, startDate, capacity, price, cover, endDate });
        // newCourse.save()
        //     .then(course => {
        //         res.redirect(req.body.redirect);
        //     }).catch(err => {
        //         if (err) console.log(err);
        //     });
    }
});

module.exports = router;