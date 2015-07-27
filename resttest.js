var http = require('http');

process.stdin.resume();
process.stdin.setEncoding('utf8');

console.log("");
console.log("Insert a command (Insert 'help' for a list of commands): ");

process.stdin.on('data', function (text) {

    var command = text.replace('\n', '');
    command = command.replace('\r', '');
        
    if(command.indexOf("GET /transactions/") > -1) // 0
    {
        var page = command.replace("GET /transactions/", '');
            var options = {
          host: 'resttest.bench.co',
          path: '/transactions/'+page+'.json'
        };
        http.request(options, callback).end();
    } 
    else if(command.indexOf("GET /categories/") > -1)
    {
        var page = command.replace("GET /categories/", '');
            var options = {
          host: 'resttest.bench.co',
          path: '/transactions/'+page+'.json'
        };
        http.request(options, categoriesCallback).end();
    } 
    else if(command.indexOf("GET /bydate/") > -1)
    {
        var page = command.replace("GET /bydate/", '');
            var options = {
          host: 'resttest.bench.co',
          path: '/transactions/'+page+'.json'
        };
        http.request(options, datesCallback).end();
    } 
    else if(command === "quit")
    {
        done();
    } 
    else if(command === "help")
    {
        console.log("")
        console.log("'GET /transactions/1' for standard list of transactions and balances"); 
        console.log("'GET /categories/1' for list of transactions by category");       
        console.log("'GET /bydate/1' for running balance by date");  
        console.log("'quit' to exit"); 
    }
    else
    {
        console.log("")
        console.log("Wrong command. Please try again. Enter 'help' for example, 'quit' to exit.");
    }
});

function done() {
    process.exit();
}

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
        
        if(!savedTransactions[key])
        {    
            savedTransactions[key] = true;
            filteredTransactions.push(individualTransaction);
            
            filteredBalance = filteredBalance+parseInt(individualTransaction.Amount);
            
        } else
        {
            duplicateTransactions.push(individualTransaction);
        }
        totalBalance = totalBalance+parseInt(individualTransaction.Amount);
            
        var filteredTransactionCompanyName = individualTransaction.Company.replace(/(\.+)?(#+)?(x+)?\d+/g,'');
        filteredTransactionCompanyName = filteredTransactionCompanyName.replace(' @ ', '');
        individualTransaction.Company = filteredTransactionCompanyName;
    });
    
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
        
        var filteredTransactionCompanyName = individualTransaction.Company.replace(/(\.+)?(#+)?(x+)?\d+/g,'');
        filteredTransactionCompanyName = filteredTransactionCompanyName.replace(' @ ', '');
        individualTransaction.Company = filteredTransactionCompanyName;
    });
    
    for( var i = 0; i < Object.keys(transactionsByCategory).length; i++)
    {
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