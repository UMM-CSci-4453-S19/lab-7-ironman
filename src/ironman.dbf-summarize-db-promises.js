Promise=require('bluebird')
mysql=require('mysql');
DBF=require('./ironman.dbf-setups');

var getDatabases=function(){//Returns a promise that can take a handler ready to process the results
    var sql = "SHOW DATABASES";
    return DBF.query(mysql.format(sql)); //Return a promise
}

var processDBFs=function(queryResults){ //Returns a promise that forces ALL dbfPromises to resolve before .thening()
    var dbfs=queryResults;
    return(Promise.all(dbfs.map(dbfToPromise)).then(processTables))
}

var processTables=function(results){ //Returns a promise that forces ALL table description Promises to resolve before .thening()
    var descriptionPromises=results.map(tableAndDbfToPromise);
    var allTables=Promise.all(descriptionPromises).then(function(results){return(results)});
    return(allTables);
}

//Takes an object (as returned by showDatabases) and returns a promise that resolves
// to an array of objects containing table names for the dbf in dbfObj
var dbfToPromise=function(dbfObj){
    var dbf=dbfObj.Database
    var sql = mysql.format("SHOW TABLES IN ??",dbf);
    var queryPromise=DBF.query(sql)
    queryPromise=queryPromise.then(function(results){return({table:results,dbf:dbf})});
    return(queryPromise);
}

//Takes an object (as returned by showDatabases) and returns a promise that resolves
// to an array of objects containing table descriptions.
// This function creates helper functions:
//     describeTable()
//  which contains its own helper function printer(), for writing the output to console
var tableAndDbfToPromise=function(obj){
    var dbf=obj.dbf;
    var tableObj=obj.table;
    var key = "Tables_in_"+dbf;

    var tables=tableObj.map(function(val){return(val[key])})

    var describeTable=function(val,index){
        var table=dbf+"."+val;
        var printer=function(results){
            var desc=results;
            if(index==0){console.log("---|",dbf,">")};
            console.log(".....|"+table,">");
            desc.map(function(field){ // show the fields nicely
                console.log("\tFieldName: `"+field.Field+"` \t("+field.Type+")");
            })
        }

        var describeSQL=mysql.format("DESCRIBE ??",table);
        var promise=DBF.query(describeSQL).then(printer);
        return(promise);
    }
    var describePromises = tables.map(describeTable);
    return(Promise.all(describePromises))
}

var dbf=getDatabases()
    .then(processDBFs)
    .then(DBF.releaseDBF)
    .catch(function(err){console.log("DANGER:",err)});