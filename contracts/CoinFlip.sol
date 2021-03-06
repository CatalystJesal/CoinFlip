import "./Ownable.sol";
import "./provableAPI.sol";
import "./Destroyable.sol";
import "./SafeMath.sol";
pragma solidity 0.5.12;

contract CoinFlip is Ownable, Destroyable, usingProvable {
    using SafeMath for uint256;

    struct Bet {
        address player;
        uint256 value;
    }

    struct Player {
        uint256 earnings;
        uint256 wins;
        uint256 loss;
        uint256 latestGuess;
        uint256 outcome;
        bool isWaiting;
    }

    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

    uint256 private spend = 0.1 ether;

    uint256 public balance;

    mapping(address => Player) private players;
    mapping(bytes32 => Bet) private waiting;

    event LatestGuess(uint256 guess, address player, bool isWaiting);
    event FlipOutcome(address player, uint256 outcome, uint256 won);
    event LogNewProvableQuery(string description);
    event WithdrawEarnings(address player, uint256 earnings);

    modifier minimumCost(uint256 cost) {
        require(
            msg.value >= spend,
            "Must send at least 0.1 ether to the contract"
        );
        _;
    }

    constructor() public {
        balance = 0;
        provable_setProof(proofType_Ledger);
    }

    function getPlayer()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool
        )
    {
        return (
            players[msg.sender].earnings,
            players[msg.sender].wins,
            players[msg.sender].loss,
            players[msg.sender].latestGuess,
            players[msg.sender].outcome,
            players[msg.sender].isWaiting
        );
    }

    function __callback(
        bytes32 _queryId,
        string memory _result,
        bytes memory _proof
    ) public {
        require(msg.sender == provable_cbAddress());

        if (
            provable_randomDS_proofVerify__returnCode(
                _queryId,
                _result,
                _proof
            ) != 0
        ) {
            players[waiting[_queryId].player].isWaiting = false;
        } else {
            players[waiting[_queryId].player].outcome = SafeMath.mod(
                uint256(keccak256(abi.encodePacked(_result))),
                2
            );

            finaliseOutcome(_queryId);

            delete waiting[_queryId];
        }
    }

    function flip(uint256 guess) public payable minimumCost(spend) {
        require(
            guess == 0 || guess == 1,
            "please pick a a whole number between 0 and 1"
        );
        require(
            balance > 0,
            "contract is empty. Please wait for the contract owner to provide liquidity"
        );
        require(
            players[msg.sender].isWaiting == false,
            "please wait until your current session is complete"
        );

        players[msg.sender].isWaiting = true;
        players[msg.sender].latestGuess = guess;

        uint256 QUERY_EXECUTION_DELAY = 0; // NOTE: The datasource currently does not support delays > 0!
        uint256 GAS_FOR_CALLBACK = 300000;

        balance = balance.add(msg.value);

        //FOR PRODUCTION
        bytes32 queryId =
            provable_newRandomDSQuery(
                QUERY_EXECUTION_DELAY,
                NUM_RANDOM_BYTES_REQUESTED,
                GAS_FOR_CALLBACK
            );

        //FOR LOCAL
        // bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));

        Bet memory b;

        b.player = msg.sender;
        b.value = msg.value;
        waiting[queryId] = b;

        //FOR LOCAL TEST
        // __callback(queryId, "1", bytes("test"));

        emit LatestGuess(guess, msg.sender, true);
        emit LogNewProvableQuery(
            "Provable query was sent, standing by for the answer..."
        );
    }

    function finaliseOutcome(bytes32 _queryId) public payable {
        require(
            players[waiting[_queryId].player].outcome == 0 ||
                players[waiting[_queryId].player].outcome == 1
        );

        uint256 expected = players[waiting[_queryId].player].latestGuess;
        uint256 result = players[waiting[_queryId].player].outcome;

        address sender = waiting[_queryId].player;
        uint256 cost = waiting[_queryId].value;

        uint256 won = 0;

        if (expected == result) {
            won = cost.mul(2);

            players[sender].earnings = players[sender].earnings.add(won);
            players[sender].wins = players[sender].wins.add(1);

            assert(expected == result);
        } else if (expected != result) {
            players[sender].loss = players[sender].loss.add(1);

            assert(expected != result);
        }

        players[sender].isWaiting = false;

        assert(result == 0 || result == 1);

        emit FlipOutcome(
            waiting[_queryId].player,
            players[waiting[_queryId].player].outcome,
            won
        );
    }

    function withdraw_earnings() public {
        require(
            players[msg.sender].earnings > 0,
            "You do not have any winning to withdraw"
        );
        require(
            balance >= players[msg.sender].earnings,
            "Insufficient contract funds for withdrawal. Please wait till the contract has more funds available."
        );

        uint256 tmp_earnings = players[msg.sender].earnings;
        players[msg.sender].earnings = 0;
        balance = SafeMath.sub(balance, tmp_earnings);
        msg.sender.transfer(tmp_earnings);

        assert(balance >= players[msg.sender].earnings);

        emit WithdrawEarnings(msg.sender, tmp_earnings);
    }

    function addLiquidity()
        public
        payable
        minimumCost(spend)
        onlyOwner
        returns (uint256)
    {
        uint256 old_balance = balance;

        balance = SafeMath.add(balance, msg.value);

        assert(balance > old_balance);

        return balance;
    }

    //FOR TESTING PURPOSES ONLY - ISSUES WITH ORACLE NOT RETURNING THE CALLBACK HENCE TO SAVE TIME FOR TESTING...
    function stopWaiting(address player) public onlyOwner {
        players[player].isWaiting = false;
    }
}
