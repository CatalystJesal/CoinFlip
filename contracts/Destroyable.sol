import "./Ownable.sol";
pragma solidity 0.5.12;


contract Destroyable is Ownable {


function destroy() public onlyOwner() {
  selfdestruct(address(uint160(owner)));

}



}
