const express = require('express')
const app = express()
const mysql = require('./dbcon.js')
// const handlebars = require('express-handlebars').create({defaultLayout:'main'});

// app.engine('handlebars', handlebars.engine);
// app.set('view engine', 'handlebars');

app.use(express.static('public'))
app.use(express.json())
app.set('port', 8080)

// Queries
const tableName = "workouts";
const getAllQuery = `SELECT * FROM ${tableName}`;
const insertQuery = `INSERT INTO ${tableName} (\`name\`, \`reps\`, \`weight\`, \`unit\`, \`date\`) VALUES (?, ?, ?, ?, ?)`;
const updateQuery = `UPDATE ${tableName} SET name=?, weight=?, reps=?, unit=?, date=? WHERE id=?`;
const deleteQuery = `DELETE FROM ${tableName} WHERE id=`;
const deleteTableQuery = `DROP TABLE IF EXISTS ${tableName}`;
const createTableQuery = `CREATE TABLE ${tableName}(
	id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(255) NOT NULL,
	reps INT,
	weight INT,
	unit BOOLEAN,
	date DATE
)`;

app.get('/', function(req, res, next){
	let context = {};
	console.log("GET REQUEST QUERY: ",req.query);
	mysql.pool.query(getAllQuery, function(err, rows, fields){
		if(err){
			next(err);
			return;
		}
		console.log("Retrieved data from table");
		context.results = rows;
		console.log("RETRIEVED DATA: ", context);
		res.send(context);
	});
});

app.post('/',function(req,res,next){
	console.log("POST REQUEST BODY: ", req.body);
	console.log("post request received");

	if (req.body.requestType == 'update'){
		// retrieve original data
		mysql.pool.query(getAllQuery+" WHERE id=?", [req.body.update_id], function(err, result){
		    if(err){
		      next(err);
		      return;
		    }
		    let curVals = result[0];
			let context = {};

			// update based on new data
			mysql.pool.query("UPDATE workouts SET name=?, weight=?, reps=?, unit=?, date=? WHERE id=?", 
				[req.body.name || curVals.name, 
				req.body.weight || curVals.weight, 
				req.body.reps || curVals.reps, 
				req.body.unit || curVals.unit, 
				req.body.date || curVals.date, 
				req.body.update_id], 
				function(err, result){
				if(err){
					next(err);
					return;
				}
				// retrieve newly updated table and redisplay it
				mysql.pool.query(getAllQuery, function(err, rows, fields){
					if(err){
						next(err);
						return;
					}
					console.log("Retrieved data from table");
					let context = {};
					context.results = rows;
					console.log("RETRIEVED DATA: ", context.results);
					res.send(context);
				});
			});
		});
	}

	if (req.body.requestType == 'delete'){
		var context = {};
		mysql.pool.query(deleteQuery+"?", [req.body.delete_id], function(err, result){
			if(err){
				next(err);
				return;
			}
			console.log("Deleted Exercise from Workout Log");
			mysql.pool.query(getAllQuery, function(err, rows, fields){
				if(err){
					next(err);
					return;
				}
				console.log("Retrieved data from table");
				let context = {};
				context.results = rows;
				console.log("RETRIEVED DATA: ", context.results);
				res.send(context);
			});
		});
	}

	// if there is a name then it is an insert
	if (req.body.requestType == 'insert'){
		var context = {};
		// if input isn't empty, add to workout log
		mysql.pool.query(insertQuery, [req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date], function(err, result){
			if(err){
				next(err);
				return;
			}
			console.log("Inserted Exercise to Workout Log");
			mysql.pool.query(getAllQuery, function(err, rows, fields){
				if(err){
					next(err);
					return;
				}
				console.log("Retrieved data from table");
				let context = {};
				context.results = rows;
				console.log("RETRIEVED DATA: ", context.results);
				res.send(context);
			});
		});
	}
});

app.get('/reset-table', function(req, res, next) {
	mysql.pool.query(deleteTableQuery, function(err){
		mysql.pool.query(createTableQuery, function (err){
			res.send(`${tableName} TABLE RESET`);
		})
	})
});

app.use(function(req,res){
	res.status(404);
	res.send('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.send('500');
});

app.listen(app.get('port'), function(){
	console.log('Express started on PORT: ' + app.get('port') + '; press Ctrl-C to terminate.');
});
