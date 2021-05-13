// Load the modules
var express = require('express'); //Express - a web application framework that provides useful utility functions like 'http'
var app = express();
var bodyParser = require('body-parser'); // Body-parser -- a library that provides functions for parsing incoming requests
app.use(bodyParser.json());              // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies
const axios = require('axios');
const qs = require('query-string');

var pgp = require('pg-promise')();

const dev_dbConfig = {
	host: 'db',
	port: 5432,
	database: process.env.POSTGRES_DB,
	user: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD
};


const isProduction = process.env.NODE_ENV === 'production';
const dbConfig = isProduction ? process.env.DATABASE_URL : dev_dbConfig;

if (isProduction) {
	pgp.pg.defaults.ssl = {rejectUnauthorized: false};
}
let db = pgp(dbConfig);
// Set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));// Set the relative path; makes accessing the resource directory easier
app.set('views', __dirname+'/views');


// Home page - DON'T CHANGE
app.get('/', function(req, res) {
  res.render('pages/main', {
    my_title: "Food search",
    items: '',
    error: false,
    message: ''
  });
});

app.post('/get_feed', function(req, res) {
  var title = req.body.title; 
  if(title) {
    axios({
      url: `http://www.themealdb.com/api/json/v1/1/search.php?s=${title}`,
        method: 'GET',
        dataType:'json',
      })
        .then(items => {
          res.render('pages/main', {
             my_title: title,
             items: items.data.meals[0],
             error: false,
             message: ''
           });
        })
        .catch(error => {
          res.render('pages/main',{
            my_title: "Food Reviews",
            items: '',
            error: true,
            message: "Cannnot find food!"
          })
        });


  }
  else {
        res.render('pages/main',{
          my_title: "Food Reviews",
          items: '',
          error: true,
          message: "Cannnot find food!"
        });
  }
});

app.get('/reviews', function(req, res) {
    var allreviews = 'SELECT * FROM food_reviews;';
    db.task('get-everything', task => {
        return task.batch([
            task.any(allreviews)
        ])
    })
    .then(data => {
      console.log("Sending data from database");
      res.render('pages/reviews',{
        my_title:"Food Reviews",
        items: data[0],
        error: false
      })
    })
});

app.post('/get_feed/send_review',function(req,res){
	console.log("Sending data");
	var name = req.body.foodName;
	var review = req.body.review;
	var today = new Date();
	var months = ['Jan', 'Feb', "Mar", 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
	var days = ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"];
	var time = days[today.getDay()] + " " + months[today.getMonth()] + " " + today.getDate() + " " + (today.getHours()-6) + ":" + ("0" + today.getMinutes()).slice(-2) + " MST";

	var insert_statement = "INSERT INTO food_reviews(food_name, food_review, review_date) VALUES('" + name + "','" +
	review + "','" + time + "');";

	var reviews = "SELECT * FROM food_reviews;";


  console.log(reviews);
	db.task('post-data', task => {
    console.log("Connected!");
        return task.batch([
          task.any(insert_statement),
			    task.any(reviews)
        ]);
    })
	.then(data => {
		console.log("Sending data from database");
		res.render('pages/reviews',{
			my_title:"Food Reviews",
			items: data[1],
			error: false
		})
	})
	.catch(err => {
		console.log('No reviews present');
		res.render('pages/reviews',{
			my_title: "Food Reviews",
			reviews: '',
			error: true,
			items: '',
			message: 'No reviews present!'
		})
	});

});

app.post('/get_feed/review/filter',function(req,res){
	console.log("Searching data");
	var name = req.body.name;

	var review = "SELECT * FROM food_reviews WHERE food_name ='" + name + "';";

  var reviews = "SELECT * FROM food_reviews;";


	db.task('post-data', task => {
    console.log("Connected!");
        return task.batch([
			    task.any(review),
          task.any(reviews)
        ])
    })
	.then(data => {
		console.log("Filtering data");
    if(data[0].length){
      res.render('pages/reviews',{
        my_title:"Food Reviews",
        items: data[0],
        error: false
      })
    }else{
      res.render('pages/reviews',{
        my_title:"Food Reviews",
        items: data[1],
        error: false
      })
    }
	})
	.catch(err => {
		console.log('No reviews present');
		res.render('pages/reviews',{
			my_title: "Food Reviews",
			reviews: '',
			error: true,
			items: '',
			message: 'No reviews present!'
		})
	});

});


const server = app.listen(process.env.PORT || 3000, () => {
	console.log(`Express running → PORT ${server.address().port}`);
  });