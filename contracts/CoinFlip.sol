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
uint earnings;
uint wins;
uint loss;
uint latestGuess;
uint outcome;
bool isWaiting;
}

uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

uint private spend = 0.1 ether;

uint public balance;

mapping (address => Player) private players;
mapping (bytes32 => Bet) private waiting;


event FlipOutcome(address player, uint outcome);
event LogNewProvableQuery(string description);

 modifier minimumCost(uint cost) {
     require(msg.value >= spend, "Must send at least 0.1 ether to the contract");
     _;
}

 constructor() public {
     balance = 0;
     provable_setProof(proofType_Ledger);
 }


function getPlayer() public view returns(uint, uint, uint, uint, uint, bool){
    return(players[msg.sender].earnings, players[msg.sender].wins, players[msg.sender].loss, players[msg.sender].latestGuess, players[msg.sender].outcome, players[msg.sender].isWaiting);
}


 function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
  require(msg.sender == provable_cbAddress());

   if (provable_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
            players[waiting[_queryId].player].isWaiting = false;
        } else {

            players[waiting[_queryId].player].outcome = uint256(keccak256(abi.encodePacked(_result))) % 2;


            finaliseOutcome(_queryId);

            emit FlipOutcome(waiting[_queryId].player, players[waiting[_queryId].player].outcome);

            delete waiting[_queryId];

      }
}

function flip(uint guess) public payable minimumCost(spend)
{
  require(guess == 0 || guess == 1, "please pick a a whole number between 0 and 1");
  require(balance > 0, "contract is empty. Please wait for the contract owner to provide liquidity");
  require(players[msg.sender].isWaiting == false, "please wait until your current session is complete");


  players[msg.sender].latestGuess = guess;
  balance = balance.add(msg.value);

  uint256 QUERY_EXECUTION_DELAY = 0; // NOTE: The datasource currently does not support delays > 0!
  uint256 GAS_FOR_CALLBACK = 300000;

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
  players[msg.sender].isWaiting = true;

  emit LogNewProvableQuery("Provable query was sent, standing by for the answer...");

}


function finaliseOutcome(bytes32 _queryId) public payable {
  require(players[waiting[_queryId].player].outcome == 0 || players[waiting[_queryId].player].outcome == 1);

  uint expected = players[waiting[_queryId].player].latestGuess;
  uint result = players[waiting[_queryId].player].outcome;

  address sender = waiting[_queryId].player;
  uint cost = waiting[_queryId].value;

  if(expected == result){
     uint won = cost.mul(2);

      players[sender].earnings = players[sender].earnings.add(won);
      players[sender].wins = players[sender].wins.add(1);

      assert(expected == result);


  } else if(expected != result) {

     players[sender].loss = players[sender].loss.add(1);

     assert(expected != result);

  }

  players[sender].isWaiting = false;

  assert(result == 0 || result == 1);

}


function withdraw_earnings() public {
    require(players[msg.sender].earnings > 0, "You do not have any winning to withdraw");
    require(balance >= players[msg.sender].earnings, "Insufficient contract funds for withdrawal. Please wait till the contract has more funds available.");

     msg.sender.transfer(players[msg.sender].earnings);
     balance -= players[msg.sender].earnings;
     players[msg.sender].earnings = 0;


     assert(balance >= players[msg.sender].earnings);
}

function addLiquidity() public payable minimumCost(spend) onlyOwner returns(uint) {

    uint old_balance = balance;

    balance += msg.value;

    assert(balance > old_balance);

    return balance;

}


}
