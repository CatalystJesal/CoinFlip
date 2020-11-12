var web3 = new Web3(Web3.givenProvider);
var contractInstance;

$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi,  "0xB819Bd17bFf8211e14D99a9aF4044b8f669EBa0F", {from: accounts[0]});
      console.log(contractInstance);
    });


});
