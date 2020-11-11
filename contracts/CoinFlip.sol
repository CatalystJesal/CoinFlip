import "./Ownable.sol";
import "./Destroyable.sol";
import "./SafeMath.sol";
pragma solidity 0.5.12;


contract CoinFlip is Ownable, Destroyable {


using SafeMath for uint256;

uint private spend = 1 ether;

uint public outcome = 0;

uint public balance;

mapping (address => uint) private stake;

event stakeOutcome(uint value, string outcome);

 modifier minimumCost(uint cost) {
     require(msg.value >= spend, "Must send at least 1 ether to the contract");
     _;
}

 constructor() public{
     balance = 0;
 }


 function random() private returns(uint){
     return outcome = now % 2;
 }


function guess(uint number) public payable minimumCost(spend) {
    require(number == 0 || number == 1, "please pick a a whole number between 0 and 1");
    require(balance >= msg.value, "contract has insufficient funds for a payout in the event of a win");

    stake[msg.sender] = msg.value;

    balance = balance.add(stake[msg.sender]);

    if(number == random()){

        uint winnings = stake[msg.sender].mul(2);

         msg.sender.transfer(winnings);

         balance -= winnings;

         assert(number == random());
         emit stakeOutcome(winnings, "Congratulations! You have doubled your stake!");

    } else {
      assert(number != random());
      emit stakeOutcome(stake[msg.sender], "You have lost your stake!");
    }

    assert(outcome == 0 || outcome == 1);
    assert(balance >= msg.value);

}

function addLiquidity() public payable minimumCost(spend) onlyOwner returns(uint) {

    uint old_balance = balance;

    balance += msg.value;

    assert(balance > old_balance);

    return balance;

}

}
