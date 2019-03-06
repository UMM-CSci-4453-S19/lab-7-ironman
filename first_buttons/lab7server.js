Promise=require('bluebird')

var express=require('express'),
app = express(),
port = process.env.PORT || 1337;
DBF=require('./ironman.dbf-setups');

var credentials = require('./credentials.json');
var mysql=require("mysql");
credentials.host="ids";
var connection = mysql.createConnection(credentials);
var sql = "select * from ironman.till_buttons";

var buttons;

connection.query(sql,function(err,rows,fields){
    if(err){
        console.log('Error looking up databases');
    } else {
        buttons = rows;
        for(var index in buttons){
            button = buttons[index];
            button.left = button.left_position;
            delete button.left_position;
        }
        //console.log(buttons);
    }
});

/*var queryPromise = DBF.query(sql);
queryPromise=queryPromise.then(
    function(results){return({table:results,dbf:dbf
    })});*/


//var buttons=[{"buttonID":2,"left":110,"top":70,"width":100,"label":"hambugers","invID":2},{"buttonID":3,"left":210,"top":70,"width":100,"label":"bannanas","invID":3},{"buttonID":4,"left":10,"top":120,"width":100,"label":"milkduds","invID":4}]; //static buttons

app.use(express.static(__dirname + '/public')); //Serves the web pages
app.get("/buttons",function(req,res){ // handles the /buttons API
  res.send(buttons);
});

app.listen(port);
connection.end();
