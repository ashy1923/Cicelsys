/**
 * Created with JetBrains WebStorm.
 * User: Heboy
 * Date: 13-9-23
 * Time: 下午11:50
 * To change this template use File | Settings | File Templates.
 */

var conf = require('./config.js');
var utils = require('./utils.js');
var mysql = require('mysql');
var pool = mysql.createPool(conf.local);
/**
 * need userId
 * @param req
 * @param res
 * @param next
 */
exports.courseData = function (req, res, next) {
	var userId = req.body.userId;
	var result = null;
	userId = 1;
	pool.getConnection(function (err, conn) {
		if (err) {
			console.log(err);
		}
		conn.query('CALL pro_getUserCourses2(?)', [userId], function (err, result) {
			result = result[0];
			var courseInfo = [];
			var tmpArr = [];
			for (var i = result.length - 1; i >= 0; i--) {
				tmpArr.push(result[i])
				if(result[i-1]==undefined||result[i].parentpageId != result[i-1].parentpageId){
					courseInfo.push(tmpArr);
					tmpArr = [];
				}
			}
			res.render('course_data', {data: courseInfo});
		})
	});
}

exports.getCourseData = function (req, res, next) {
	var courseID = req.body.courseID;	//
	var startTime = req.body.startTime; //时间戳/1000
	var delay = req.body.delay;	//天数
	courseID = 1;
	startTime = new Date().getTime() / 1000;
	delay = 30;
	var result = null;
	pool.getConnection(function (err, conn) {
		if (err) {
			utils.ReturnResult(res, {data: err});
		}
		else {
			conn.query('CALL pro_getCoursePV4(?,?,?)', [courseID, startTime, delay], function (err, result) {
				if (err) {
					utils.ReturnResult(res, {data: err});
				}
				if (result[0].length > 0) {
					result = result[0];
					for (var i in result) {
						result[i].now_day = new Date(result[i].now_day).getFullYear() + "-" +
							(new Date(result[i].now_day).getMonth() + 1) + "-" + new Date(result[i].now_day).getDate();
					}
				}
				conn.release();
				utils.ReturnResult(res, {data: result});
			});
		}
	});
}