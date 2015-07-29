module.exports = function(rawObj, callback) {

    var util = require('util');
    var forEachOf = require('async').forEachOf;
    var map = require('async').map;
    var xss = require('xss');
    var options = {
        //stripIgnoreTag : true
        //stripIgnoreTagBody: true
    };
    
    var myxss = new xss.FilterXSS(options);

    var escapeObject = function (rawObj, callback) {
        var escapedObj = {};
        forEachOf(rawObj, function (item, key, callback) {
            key = myxss.process(key);

                checkString(item, function (err, escapedStuff) {

                    if (err)return callback(err);
                    if (escapedStuff) {

                        try {
                            escapedObj[key] = escapedStuff;
                        } catch (e) {
                            return callback(e);
                        }

                    }
                    callback();
                })

        }, function (err) {
            if (err)console.error(err);
            callback(err, escapedObj);
        })
    };

    var checkString = function (possibleString, callback) {

        if (typeof(possibleString) === "string" || possibleString instanceof String) {

            var escapedString = myxss.process(possibleString);

            callback(null, escapedString);
        } else {
            checkArray(possibleString, function (err, escaped) {
                if (!escaped) {
                    callback(err, possibleString);
                } else {

                    callback(err, escaped);
                }
            })
        }


    };

    var checkArray = function (possibleArray, callback) {

        if (typeof(possibleArray) === 'array' || possibleArray instanceof Array) {

            map(possibleArray, checkString, function (err, result) {
                callback(err, result);
            })
        } else {
            checkObject(possibleArray, function (err, object) {
                if (!object) {
                    callback(err, false);
                } else {
                    callback(err, object);
                }
            })
        }
    };

    var checkObject = function (possibleObject, callback) {
        var escapedObject = {};
        if (typeof(possibleObject) === 'object' || possibleObject instanceof Object) {

            forEachOf(possibleObject, function (item, key, callback) {
                key = myxss.process(key);
                checkString(item, function (err, string) {
                    if (err)return callback(err);
                    if (string) {

                        try {
                            escapedObject[key] = string;
                        } catch (e) {
                            return callback(e);
                        }
                        callback();
                    }
                })
            }, function (err) {
                if (err) console.error(err);

                callback(err, escapedObject);
            })
        } else {
            callback(null, possibleObject);
        }
    };
    escapeObject(rawObj, function(err, escapedObj){
       callback(err, escapedObj);
    });
};
