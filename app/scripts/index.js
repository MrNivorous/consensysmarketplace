// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI({host: 'localhost', port: '5001', protocol: 'http'});

// Import our contract artifacts and turn them into usable abstractions.
import market_place_artifacts from '../../build/contracts/MarketPlace.json'

var MarketPlace = contract(market_place_artifacts);

var reader;

window.App = {
 start: function() {
  var self = this;

  MarketPlace.setProvider(web3.currentProvider);

  if($("#product-details").length > 0) {
    let productId = new URLSearchParams(window.location.search).get('id');
    renderProductDetails(productId);
  } else {
    renderStore();
  }

  $("#product-image").change(function(event) {
    const file = event.target.files[0]
    reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
  });

  $("#add-item-to-store").submit(function(event) {
    const req = $("#add-item-to-store").serialize();
    let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    let decodedParams = {}
    Object.keys(params).forEach(function(v) {
      decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
    });
    console.log(decodedParams);
    saveProduct(decodedParams);
    event.preventDefault();
  });

  $("#buy-now").submit(function(event) {
    var sendAmount= $("#buy-now-price").val();
    var productId = $("#product-id").val();
    MarketPlace.deployed().then(function(i) {
      i.buy(productId, {value: sendAmount, from: web3.eth.accounts[0], gas: 440000}).then( function() {
        $("#msg").show();
        $("#msg").html("You have successfully purchased the property!");
      })
    });
    event.preventDefault();
  });
 }
};

function renderProductDetails(productId) {
  MarketPlace.deployed().then(function(f) {
    f.getProduct.call(productId).then(function(p) {
      $("#product-name").html(p[1]);
      $("#product-image").html("<img width='100' src='http://localhost:8080/ipfs/" + p[3] + "' />");
      $("#product-price").html(displayPrice(p[6]));
      $("#product-id").val(p[0]);
      $("#buy-now-price").val(p[6]);
      ipfs.cat(p[4]).then(function(file) {
        var content = file.toString();
        $("#product-desc").append("<div>" + content + "</div>");
      })
    });
  })
}

function saveProduct(product) {
  // 1. Upload image to IPFS and get the hash
  // 2. Add description to IPFS and get the hash
  // 3. Pass the hashes to addProductToStore


  var imageId;
  var descId;
  saveImageonIpfs(reader).then(function(id) {
    imageId = id;
    saveTextBlobOnIpfs(product["product-description"]).then(function(id) {
      descId = id;
      MarketPlace.deployed().then(function(f) {
        return f.addProductToStore(product["product-name"], product["product-category"], imageId, descId, Date.parse(product["product-start-time"]) / 1000, web3.toWei(product["product-price"], 'ether'), product["product-condition"], {from: web3.eth.accounts[0], gas: 4700000});
      }).then(function(f) {
        alert("Property added to marketplace!");
      });
    });
  });
}

function saveImageonIpfs(reader) {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer)
    .then((response) => { console.log(response)
    resolve(response[0].hash);
  }).catch((err) => {
    console.error(err)
    reject(err);
  })
  })
}

function saveTextBlobOnIpfs(blob) {
  return new Promise(function(resolve, reject) {
    const descBuffer = Buffer.from(blob, 'utf-8');
    ipfs.add(descBuffer)
    .then((response) => {
      console.log(response)
    resolve(response[0].hash);
  }).catch((err) => {
    console.error(err)
    reject(err);
  })
  })
}

function renderStore() {
  // Get the product count
  // Loop through and fetch all products by id
  var instance

  return MarketPlace.deployed().then(function(f) {
    instance = f;
    return instance.productIndex.call();
  }).then(function(count){
    for(var i=1; i<= count; i++) {
      renderProduct(instance, i);
    }
  });
}

function renderProduct(instance, index) {
  instance.getProduct.call(index).then(function(f) {
    let node = $("<div/>");
    console.log(f);
    node.addClass("col-sm-3 text-center col-margin-bottom-1 product");
    node.append("<img src='http://localhost:8080/ipfs/" + f[3] + "' />");
    node.append("<div class ='title'>" + f[1] + "</div>");
    node.append("<div> Price: " + displayPrice(f[6]) +"</div>");
    node.append("<a href='product.html?id=" + f[0] + "'>Details</div>");
    if (f[8] === '0x0000000000000000000000000000000000000000') {
      $("#product-list").append(node);
    } else {
      $("#product-purchased").append(node);
    }
  });
}

function displayPrice(amt) {
  return "&Xi;" + web3.fromWei(amt, 'ether');
}


window.addEventListener('load', function() {
 // Checking if Web3 has been injected by the browser (Mist/MetaMask)
 if (typeof web3 !== 'undefined') {
  console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
  // Use Mist/MetaMask's provider
  window.web3 = new Web3(web3.currentProvider);
 } else {
  console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
  // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
 }

 App.start();
});
