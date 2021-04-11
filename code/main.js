// Alypsis Synchronization Tool
// Designed with module Express to create an api that can access the other api's databases and return the information




const express = require('express');
const app = express();
const fetch = require('node-fetch');
const Shopify = require('shopify-api-node');
const shopify = new Shopify({
    shopName: 'alypsis',
    apiKey: <insert api key>,
    password: <insert api password>
  });
var apiKeyKat = <katana api key>;


function getKatana(){
    
    var headers = { "Accept": 'application/json', "Authorization": "Bearer " + apiKeyKat};
    var params = {
      'method': 'GET',
      'muteHttpExceptions': true,
      'headers': headers,
      
    };

    // Data Arrays
    var skuIdArray = [];
    var avgCostArray = [];

    // return the total # of pages to paginate through the data
    function returnPages(val){
        var sort = JSON.parse(val, function (key, value) {
            (key == "total_pages") ? callReq(value) : null;

        });


    }
    // receieve the total number of pages from the x-pagination header
    var katanaURL = "https://api.katanamrp.com/v1/inventory";
    fetch(katanaURL, params)
    .then((res) => {
        returnPages(res.headers.get('x-pagination'));
    })
    .catch((err) => console.error('error:' + err));
    
    
    // return data from promise and output to show what is happening
    // function sendData(sku,avgcost,qnty){
    //     for(var i = 0; i < sku.length; i++){
    //         console.log('SKU: ' + sku[i] + ' AVG COST: ' + avgcost[i] + ' QNTY: ' + qnty[i] + '\n # of products retrieved: ' + sku.length);
    //     }
    //     return skuIdArray, avgCostArray, qntyArray;
    // }


    // Receiving katana data and organizing the data within each array
    async function callReq(val){
        for(var i = 1; i < val; i++){
            var katanaURL = "https://api.katanamrp.com/v1/inventory?limit=250&page=" + i;
            const response = await fetch(katanaURL, params);
            const data = await response.json();
          
            var skuKat = JSON.parse(JSON.stringify(data), function (key, value) {
                (key == "variant_id") ? skuIdArray.push(value) : null;
                (key == "average_cost") ? (value != null && value != undefined) ? avgCostArray.push(value): null : null;
                (key == "quantity_in_stock") ? (value != null && value != "0.00000") ? qntyArray.push(value): null : null;
              });
            // To see the data uncomment the line underneath and the function  
            // sendData(skuIdArray, avgCostArray, qntyArray);
            await new Promise(resolve => setTimeout(resolve, 500));
    }
}
    // to keep process going getShopify() function is called at the end to ensure both api's aren't being called at the same time.
    getShopify();
}


function getShopify(){
    
    // data arrays
    var idArray = [];
    var skuArray = [];
    var costArray = [];
    
    // Log this value to see the request information
    // var limit;
    // shopify.on('callLimits', (limits) => limit = limits['current']);


    async function callReq(val){
        let params = {limit:10};
        
        do{
        const products = await shopify.product.list(params);
        var getIds = (JSON.parse(JSON.stringify(products), function(key,value){
            (key == 'id') ? idArray.push(value) : null;
        }));
        // must wait half second between each request or the max requests will be hit
        await new Promise(resolve => setTimeout(resolve, 500));
        params = products.nextPageParameters;
        console.log(idArray.length)
        }while(params !== undefined);
        
        for(var i = 0; i < idArray.length; i++){
            const variants = await shopify.productVariant.list(idArray[i],params)
            console.log('Waiting...');
            await new Promise(resolve => setTimeout(resolve, 500));
            var getSkus = (JSON.parse(JSON.stringify(variants), function(key,value){
                (key == 'sku') ? skuArray.push(value) : null;
                (key == 'price') ? costArray.push(value) : null;
            }));
        }
    }
    callReq();
    
}



app.listen(3000, () => console.log("Listening at 3000"));
app.use(express.static('public'));
app.use(express.json());

app.post('/api', (request, response) => {
    console.log(request);
});


app.get('/api', (request,response) => {
    getKatana();
    response.send("<head> <meta http-equiv='refresh' content='5'; URL='http://127.0.0.1:3000'/> </head> <body> <p> If you are not redirected in five seconds, <a href='https://127.0.0.1:3000'>click here</a>.</p></body>");
    

});











