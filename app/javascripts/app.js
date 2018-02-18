// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
// import { default as Web3} from 'web3';
import Web3 from 'web3'
// import { default as contract } from 'truffle-contract'
import contract from 'truffle-contract'

import artifacts from '../../build/contracts/SpringsContract.json'

var SpringsContract = contract(artifacts)
var contractInstance;

let fields = [];
let tokenPrice = null;


$(document).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Web3 detected in external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. Only for local usage");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  SpringsContract.setProvider(web3.currentProvider);
  populateFields();
});

function populateFields() {
  SpringsContract.deployed().then(function(contractInstance) {
    console.log('contractInstance', contractInstance);
    contractInstance.fieldNames.call().then(function(names) {
      console.log('contractInstance', names);
      for(let i=0; i < names.length; i++) {
        fields[i] = {
          id: i,
          name: web3.toUtf8(names[i]),
          tokens: 0
        }
      }
      populateFieldTokens();
      populateGlobalData();

      $('#address-input').val(web3.eth.accounts[0]);

      //TODO вывести таблицу fields с токенами для каждой строки
      //setupFieldRows();
    });
  });
}

function setupFieldRows() {
  Object.keys(fields).forEach(function (field) {
    $("#field-rows").append("<tr><td>" + field + "</td><td id='" + fields[field] + "'></td></tr>");
  });
}

function populateFieldTokens() {
  SpringsContract.deployed().then(function(contractInstance) {
    contractInstance.fieldTokens.call().then(function(tokens) {
      for(let i=0; i < fields.length; i++) {
        fields[i].tokens = tokens[i] ? tokens[i].toString() : 0;
      }
      $.each(fields, function (i, item) {
        var text = item.name + ' (' + item.tokens + ')';
        $('#invest-field').append($('<option>', {
          value: item.id,
          text : text,
        }));
      });
    });
  });
}

function populateGlobalData() {
  SpringsContract.deployed().then(function(contractInstance) {
    contractInstance.totalTokens().then(function(v) {
      $("#tokens-total").attr('data-to', v.toString());
    });
    contractInstance.balanceTokens.call().then(function(v) {
      $("#tokens-sold").attr('data-to', v.toString());

      //TODO share = проданых токенов делить на все токены
      //$("#share").html();
    });
    contractInstance.tokenPrice().then(function(v) {
      tokenPrice = parseFloat(web3.fromWei(v.toString()));
      $("#token-cost").html(tokenPrice);
    });
  });
}

window.buyTokens = function(event) {
  event.preventDefault();
  let tokensToBuy = $("#buy").val();
  let price = tokensToBuy * tokenPrice;
  $("#buy-msg").html('<p>Purchase has been submitted. Please wait until network will handle the transaction.</p>');
  SpringsContract.deployed().then(function(contractInstance) {
    contractInstance.buy({value: web3.toWei(price, 'ether'), from: web3.eth.accounts[0]}).then(function(v) {
      $("#buy-msg").html("");
      populateGlobalData();
    })
  });
}

window.invest = function(event) {
  event.preventDefault();
  let field = $("#invest-field").val();
  let tokens = $("#invest-tokens").val();
  $(".invest-form #successMessage").show();
  $("#invest-tokens").val('');

  SpringsContract.deployed().then(function(contractInstance) {
    contractInstance.invest(field, tokens, {gas: 1400000, from: web3.eth.accounts[0]}).then(function() {
      //TODO update fields tokens
      populateFieldTokens();
      $(".invest-form #successMessage").hide();
    });
  });
}

window.investorInfo = function() {
  let address = $("#address-input").val();
  SpringsContract.deployed().then(function(contractInstance) {
    contractInstance.investorDetails.call(address).then(function(v) {
      console.log(v);
      $("#investor-address").html(address);
      $("#investor-bought").html(v[0].toString());
      $("#investor-invested").html(v[1].toString());
      $("#investor-share").html(v[2].toString());
      //TODO отобразить инвестирование по филдам
      console.log(v[3]);
    });
  });
}