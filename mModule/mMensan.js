var moment = require("moment")

var crypto = require('crypto')
var fs = require('fs')
var momentformat = "YYYY.MM.DD HH:mm:ss"

module.exports = {}
var getTime = function (m) {
    if (m)
        return moment().add(9, 'hours').valueOf();
    else
        return moment().add(9, 'hours').format(momentformat);
}
module.exports.getTime = getTime
module.exports.getPassTime = function (value, tag = "day") {
    return moment().add(9, 'hours').subtract(value, tag).format(momentformat);
}
module.exports.delblank = function (t) {
    var txt = ""
    for (var i = 0; i < t.length; i++)
        if (t[i] != ' ')
            txt += t[i]
    return txt
}

module.exports.toLongSlice = function (t, n) {
    return t.length > n ? t.slice(0, n) + '...' : t
}

module.exports.loginTest = function (req, res) {
    var tmp = {}
    if (!req.session.email)
        tmp.user = {}
    else {

        tmp = req.session

        if (req.session.kakao == "danger") {
            addLog(req.session.email, req.session.nic, "redirect KAKAO")
            res.redirect('/kakao');
            return false
        }

    }
    var grade = 4;
    if (mnullTest(req.session, 'grade')) {
        grade = req.session.grade
    }
    tmp['grade'] = grade
    return tmp
}
module.exports.removeTags = function (t) {
    return t.replace(/>/gi, '〉').replace(/</gi, '〈')
}
module.exports.generate16 = function (n) {
    var t = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'a', 'b', 'c', 'd', 'e', 'f']
    var rs = ""
    for (var i = 0; i < n; i++)
        rs += t[parseInt(Math.floor(Math.random() * 16))]
    return rs
}

var mEncoder = function (data, type) {
    var pw = data.key
    var id = data.value
    var encrypted = crypto.createHash('sha512').update(pw).digest('base64');
    return encrypted;
}
module.exports.encoder = mEncoder;

var login = function (data, session, dbUSER, res, callback) {
    // console.log(data)
    var result;
    if (typeof callback == "function")
        result = callback;
    else
        result = function (res, err, data) { };
    var cipherd = mEncoder({
        key: data.pw,
        value: data.id
    }, true)
    dbUSER.findOne({ email: data.id }).populate('userData').exec(function (err, dbdata) {
        if (err) { }
        if (!dbdata) {
            result(false, "ID를 확인 하여 주세요")
            return false;
        }
        else if (dbdata.logincount == 5) {
            result(false, "PW가 5회 이상 틀렸습니다. 암호 변경 후 로그인 가능 합니다.")
            return false;
        }
        else if (cipherd != dbdata.pw) {
            dbdata.logincount += 1;
            dbdata.save();
            result(false, "잘못된 pw입니다." + dbdata.logincount + "번 틀렸습니다. 5회 이상이면 로그인이 제한 됩니다.")
            return false;
        }
        else if (dbdata.grade == 5) {
            result(false, "정상적으로 접근 가능하지 않은 계정입니다. 관리자에게 문의해주세요", null, "BAN LOGIN : " + dbdata.email + " NIC : " + dbdata.nic, true)
            return false;
        }
        else if (dbdata.grade == 6) {
            result(false, "정상적으로 탈퇴된 계정입니다.", null, "BAN LOGIN : " + dbdata.email + " NIC : " + dbdata.nic, true)
            return false;
        }
        else {
            dbdata.logincount = 0;
            dbdata.save(function () {
                result(true, null, dbdata, null, res = res)
                return false;
            });
        }
    })
}
module.exports.login = login;

function createDIR(t) {
    try { fs.mkdirSync(t); }
    catch (e) {
        if (e.code != 'EEXIST') throw e;
    }
}
var addLog = function (t) {
    var ln = arguments.length;
    var txt = ""
    if (ln == 1)
        txt = t
    else {
        for (var i = 0; i < ln; i++)
            txt += arguments[i] + " "
    }
    var dir = __dirname + '\\Log\\'
    var filename = getTime().split(' ')[0] + '.txt'
    var fn = dir + filename
    var options = { encoding: 'utf8', flag: 'a' };
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir)
    fs.appendFile(fn, "[" + getTime() + "]  " + txt + "\n", options, function (err) {
        if (err) {
            console.log("Create", fn, err)
            fs.writeFile(fn, txt, 'utf-8', function () { })
        }

    });
    console.log("[" + getTime() + "]  " + txt)
}
module.exports.addLog = addLog
module.exports.datePass = function (t) {
    return moment(getTime(), "YYYY.MM.DD").diff(moment(t, "YYYY.MM.DD"), 'days')
}

module.exports.milliPass = function (t) {
    return moment(getTime(), momentformat) - moment(t, momentformat)
}

var mnullTest = function (obj, name) {
    var tag = false;
    for (var o in obj) {
        if (o == name) {
            tag = true
        }
    }
    return tag
}
module.exports.nullTest = mnullTest;
