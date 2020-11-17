import "./Ownable.sol";
import "./provableAPI.sol";
import "./Destroyable.sol";
import "./SafeMath.sol";
pragma solidity 0.5.12;


contract CoinFlip is Ownable, Destroyable, usingProvable {


using SafeMath for uint256;

struct Bet {
address player;
uint value;
}

struct Player {
uint winnings;
uint wins;
uint loss;
uint latestGuess;
uint outcome;
bool isWaiting;
}

uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

uint private spend = 0.1 ether;

uint public balance;

string public outcomeMessage;

mapping (address => Player) private players;
mapping (bytes32 => Bet) private waiting;


event playersOutcome(uint value, string outcome);
event LogNewProvableQuery(string description);
event playerStats(uint winnings, uint wins, uint loss);

 modifier minimumCost(uint cost) {
     require(msg.value >= spend, "Must send at least 1 ether to the contract");
     _;
}

 constructor() public {
     balance = 0;
     provable_setProof(proofType_Ledger);
 }


function getPlayer() public view returns(uint, uint, uint, uint, uint){
    return(players[msg.sender].winnings, players[msg.sender].wins, players[msg.sender].loss, players[msg.sender].latestGuess, players[msg.sender].outcome);

}


 function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
  require(msg.sender == provable_cbAddress());

   if (provable_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
            /**
             * @notice  The proof verification has failed! Handle this case
             *          however you see fit.
             */
        } else {

            players[waiting[_queryId].player].outcome = uint256(keccak256(abi.encodePacked(_result))) % 2;


              //FOR TESTING ONLY
            /* emit generatedRandomNumber(players[waiting[_queryId].player].outcome); */

            delete waiting[_queryId];



      }
}

function update(uint guess) payable public
{
  uint256 QUERY_EXECUTION_DELAY = 0; // NOTE: The datasource currently does not support delays > 0!
  uint256 GAS_FOR_CALLBACK = 200000;

  //FOR PRODUCTION
  bytes32 queryId = provable_newRandomDSQuery(
      QUERY_EXECUTION_DELAY,
      NUM_RANDOM_BYTES_REQUESTED,
      GAS_FOR_CALLBACK
  );


  Bet memory b;

  b.player = msg.sender;
  b.value = msg.value;
  waiting[queryId] = b;

  players[msg.sender].latestGuess = guess;


  assert(
      keccak256(
          abi.encodePacked(b.player, b.value))
          ==
          keccak256(
              abi.encodePacked(waiting[queryId].player, waiting[queryId].value))
        );

  //FOR TESTING ONLY
//   bytes32 queryId = testRandom();


  emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");

}

// //FOR TESTING ONLY
// function testRandom() public returns(bytes32){
//   bytes32 queryId = bytes32(keccak256("test"));
//   __callback(queryId, "1", bytes("test"));
//   return queryId;

// }

function flip(uint guess) public payable minimumCost(spend) {
    require(guess == 0 || guess == 1, "please pick a a whole number between 0 and 1");
    require(balance > 0, "contract is empty. Please wait for the contract owner to provide liquidity");
    require(!players[msg.sender].isWaiting, "please wait until your current session is complete");

    balance = balance.add(msg.value);

    update(guess);
    finaliseOutcome(msg.sender, msg.value);


}


function finaliseOutcome(address sender,uint cost) public payable {

  uint expected = players[sender].latestGuess;
  uint result = players[sender].outcome;

  if(expected == result){
     uint won = cost.mul(2);

      players[sender].winnings = players[sender].winnings.add(won);
      players[sender].wins = players[sender].wins.add(1);

      assert(expected == result);

      outcomeMessage = "Congratulations! You have doubled your stake!";
      emit playersOutcome(won, "Congratulations! You have doubled your stake!");


  } else if(expected != result) {

     players[sender].loss = players[sender].loss.add(1);

     assert(expected != result);

    outcomeMessage =  "You have lost your stake!";
    emit playersOutcome(cost , "You have lost your stake!");
  }

  emit playerStats(players[sender].winnings, players[sender].wins, players[sender].loss);

  assert(result == 0 || result == 1);
}


function withdraw_Winnings() public {
    require(players[msg.sender].winnings > 0, "You do not have any winning to withdraw");
    require(balance >= players[msg.sender].winnings, "Insufficient contract funds for withdrawal. Please wait till the contract has more funds available.");

     msg.sender.transfer(players[msg.sender].winnings);
     balance -= players[msg.sender].winnings;
     players[msg.sender].winnings = 0;


     assert(balance >= players[msg.sender].winnings);
}

function addLiquidity() public payable minimumCost(spend) onlyOwner returns(uint) {

    uint old_balance = balance;

    balance += msg.value;

    assert(balance > old_balance);

    return balance;

}


}
