/**
 * Jimmy's Solution for Bench's RestTest: http://resttest.bench.co/
 *
 * Includes Additional Features
 * 
 * Commands:
 
 * GET /transactions/:page
 * for a standard list of transactions
 *
 * GET /categories/:page
 * for a list of transactions grouped and totaled by category
 *
 * GET /bydate/:page
 * for a running daily balance
 *
 */
 
var http = require('http');

//prompt for user input
process.stdin.resume(); 
process.stdin.setEncoding('utf8');

console.log("");
console.log("Insert a command (Insert 'help' for a list of commands): ");

process.stdin.on('data', function (text) {

    //remove system text from input string
    var command = text.replace('\n', '');  
    command = command.replace('\r', '');
        
    //GET command for transactions list
    if(command.indexOf("GET /transactions/") > -1) 
    {
        var page = command.replace("GET /transactions/", '');
            var options = {
          host: 'resttest.bench.co',
          path: '/transactions/'+page+'.json'
        };
        http.request(options, callback).end();
    } 
    
    //GET command for transactions by category
    else if(command.indexOf("GET /categories/") > -1)  
    {
        var page = command.replace("GET /categories/", '');
            var options = {
          host: 'resttest.bench.co',
          path: '/transactions/'+page+'.json'
        };
        http.request(options, categoriesCallback).end();
    } 
    
    //GET command for running balance by date
    else if(command.indexOf("GET /bydate/") > -1)  
    {
        var page = command.replace("GET /bydate/", '');
            var options = {
          host: 'resttest.bench.co',
          path: '/transactions/'+page+'.json'
        };
        http.request(options, datesCallback).end();
    } 
    
    //quit command
    else if(command === "quit")  
    {
        done();
    } 
    
    //help command
    else if(command === "help")  
    {
        console.log("")
        console.log("'GET /transactions/1' for standard list of transactions and balances"); 
        console.log("'GET /categories/1' for list of transactions by category");       
        console.log("'GET /bydate/1' for running balance by date");  
        console.log("'quit' to exit"); 
    }
    
    //error throw
    else  
    {
        console.log("")
        console.log("Wrong command. Please try again. Enter 'help' for example, 'quit' to exit.");
    }
});

function done() {
    process.exit();
}

//callback for transactions list
callback = function(response) { 
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    var textAsObject = JSON.parse(str);
    
    var totalBalance = 0;
    var filteredBalance= 0;
    
    var savedTransactions = [];
    var filteredTransactions = [];
    var duplicateTransactions = [];

    textAsObject.transactions.forEach(function(individualTransaction) {
        var key = individualTransaction.Amount+individualTransaction.Date+individualTransaction.Company;
        
        //gather unique transactions
        if(!savedTransactions[key])  
        {    
            savedTransactions[key] = true;
            filteredTransactions.push(individualTransaction);
            
            filteredBalance = filteredBalance+parseInt(individualTransaction.Amount);
            
        } 
        
        //gather duplicate transactions
        else  
        {
            duplicateTransactions.push(individualTransaction);
        }
        totalBalance = totalBalance+parseInt(individualTransaction.Amount);
            
        //clean up vendor names
        var filteredTransactionCompanyName = individualTransaction.Company.replace(/(\.+)?(#+)?(x+)?\d+/g,'');  
        filteredTransactionCompanyName = filteredTransactionCompanyName.replace(' @ ', '');
        individualTransaction.Company = filteredTransactionCompanyName;
    });
    
    //output for transactions list
    console.log("");  
    console.log("---Unique Transactions---");
    console.log(filteredTransactions);
    console.log("-------");
    console.log("");
    console.log("---Potential Duplicate Transactions---");
    console.log(duplicateTransactions);
    console.log("-------");
    console.log("");
    console.log("Balance of Transactions on this Page: " + totalBalance);
    console.log("Balance of Transactions on this Page (excluding duplicates): " + filteredBalance);    
    console.log("");    
    console.log("Total Count of Transactions on this Page: " + textAsObject.transactions.length);
    console.log("Total Count of Transactions on this Page (excluding duplicates): " + filteredTransactions.length);
    console.log("Total Count of Transactions on all Pages: " + textAsObject.totalCount);
    console.log("");
    console.log("Current Page Number: " + textAsObject.page);
  });  
}
  
//callback for expenses by category
categoriesCallback = function(response) {  
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    var textAsObject = JSON.parse(str);
    
    var transactionsByCategory = [];
    var balanceByCategory = [];
    
    textAsObject.transactions.forEach(function(individualTransaction) {
        if(!transactionsByCategory[individualTransaction.Ledger])
        {
            transactionsByCategory[individualTransaction.Ledger] = [];
            balanceByCategory[individualTransaction.Ledger] = 0;
        }    
        transactionsByCategory[individualTransaction.Ledger].push(individualTransaction);
        balanceByCategory[individualTransaction.Ledger] += parseInt(individualTransaction.Amount);
        
        //clean up vendor names
        var filteredTransactionCompanyName = individualTransaction.Company.replace(/(\.+)?(#+)?(x+)?\d+/g,'');  
        filteredTransactionCompanyName = filteredTransactionCompanyName.replace(' @ ', '');
        individualTransaction.Company = filteredTransactionCompanyName;
    });
    
    for( var i = 0; i < Object.keys(transactionsByCategory).length; i++)
    {
        //output for transactions by category
        console.log("");  
        var key = Object.keys(transactionsByCategory)[i];
        console.log("Category: "+key+"---");
        transactionsByCategory[key].forEach(function(categoryTransaction) {
            console.log(categoryTransaction)
        });
        console.log("------")
        console.log("Total Category Balance: "+balanceByCategory[key])
        console.log("");
    }
  });
  }
  
//callback for running balance by day
datesCallback = function(response) {  
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    var textAsObject = JSON.parse(str);
    var balanceByDate = [];
    
    textAsObject.transactions.forEach(function(individualTransaction) {
    
        var formatDate = new Date(individualTransaction.Date);
        if(!balanceByDate[individualTransaction.Date])
        {
            balanceByDate[individualTransaction.Date] = 0;
        }    
        balanceByDate[individualTransaction.Date] += parseInt(individualTransaction.Amount);

    });
    
    var orderedKeys = Object.keys(balanceByDate).sort();
    var day = 0;
    var partialBalance = 0;
    
    //output for running balance by day
    console.log("");  
    orderedKeys.forEach(function(key) {
        console.log("Day: "+key);
        day++;
        partialBalance += balanceByDate[key];
        console.log("");
        console.log("Total Balance for "+key+": "+balanceByDate[key]);
        console.log("Accumulated Balance for "+key+" is: "+partialBalance);
        console.log("-----");
        console.log("");
    });
  });
  }