var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_hesstry',
  password        : '3111',
  database        : 'cs290_hesstry',
  dateStrings 	  : true
});

module.exports.pool = pool;