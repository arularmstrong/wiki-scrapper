var express = require("express");
var bodyParser = require("body-parser");
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/xy";
var app = express();


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendfile("search.html");
});

app.post('/save', function(req, res) {
	console.log("hit");
    res.setHeader("Access-Control-Allow-Origin","*");
  var search = req.body.search; //getting name from ajax post
  var tsearch = search;
  var f=0;
  var date = new Date();
var r;
//console.log(search);
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var query = {
      question: search
    };
    db.collection("query").find(query).toArray(function(err, result) {
      if (err) throw err;
	  //if(result!=NULL)
		  //r=result[0].answer;
	 r=result[0];
	// console.log(r);
	 if (typeof r != 'undefined')
	 {
		 r=result[0].answer;	 
	 if(r.indexOf("time")!=-1)
		  { r=r+date.getHours();
      console.log(r);
  
		  } else
	   console.log(r);
   res.end(r); 
	 }
	 else {
		 r="wait few seconds";
		 console.log(r);
		 update();
	 }
	 
	  db.close();
	   
    });
  });
  
  
  function update()
  {
	 console.log("gonna search");
	 search = search.replace(/is|the|are|some|spots|your|it|who|what|define/g,"blah");
	
var words = search.split(" ");
	//console.log(search);
	for(let i=0;i<words.length;i++)
	{
		if(words[i]!=="blah")
			var temp=words[i];
		console.log(temp);
			console.log(words[i]);			
	}
		
	request('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+temp, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        
		var obj = JSON.parse(body);
		 
	var str=JSON.stringify(obj.query.pages);
    //console.log(str);
	var tmpStr  = str.match('{"(.*)":{');
	var newStr = tmpStr[1];
	
	var ostr=JSON.stringify(obj.query.pages[newStr].extract);
	console.log(ostr);
	
	MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var myobj = {
      question: tsearch,
      answer: ostr 
    };
    db.collection("query").insertOne(myobj, function(err, res) {
      if (err) throw err;
      console.log("1 record inserted");
      db.close();
    });
  });
	
	
    
	res.end(ostr);
	}
	})
	
	//res.end();
	}
	
});
app.listen(3000, function() {
  console.log("Started on PORT 3000");
})
