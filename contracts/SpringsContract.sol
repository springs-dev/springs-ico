pragma solidity ^0.4.18;

contract SpringsContract {

  struct investor {
    address investorAddress; 
    uint tokensBought;
    uint tokensInvested;
    uint totalShare;
    uint[] tokensUsedPerField;
  }
  mapping (address => investor) public investors;

  uint[] public fieldTokens;
  bytes32[] public fieldNames;

  uint public totalTokens;
  uint public balanceTokens;
  uint public tokenPrice;

  function SpringsContract(uint tokens, uint pricePerToken, bytes32[] fields) public {
    totalTokens = tokens;
    balanceTokens = tokens;
    tokenPrice = pricePerToken;
    fieldNames = fields;
    for(uint i = 0; i < fieldNames.length; i++) {
      fieldTokens.push(0);
    }
  }


  function buy() payable public returns (uint) {
    uint tokensToBuy = msg.value / tokenPrice;
    require(tokensToBuy <= balanceTokens);
    investors[msg.sender].investorAddress = msg.sender;
    investors[msg.sender].tokensBought += tokensToBuy;
    investors[msg.sender].totalShare = investors[msg.sender].tokensBought / totalTokens;
    balanceTokens -= tokensToBuy;

    return tokensToBuy;
  }

  function invest(uint fieldKey, uint tokens) public {
    if (investors[msg.sender].tokensUsedPerField.length == 0) {
      for(uint i = 0; i < fieldNames.length; i++) {
        investors[msg.sender].tokensUsedPerField.push(0);
      }
    }

    uint availableTokens = investors[msg.sender].tokensBought - investors[msg.sender].tokensInvested;
    require(availableTokens >= tokens);

    fieldTokens[fieldKey] += tokens;

    // Store how many tokens were used for this field
    investors[msg.sender].tokensUsedPerField[fieldKey] += tokens;
    investors[msg.sender].tokensInvested += tokens;
  }



  function investorDetails(address user) view public returns (uint, uint, uint, uint[]) {
    return (
        investors[user].tokensBought,
        investors[user].tokensInvested,
        investors[user].totalShare,
        investors[user].tokensUsedPerField
    );
  }

  function fieldNames() view public returns (bytes32[]) {
    return fieldNames;
  }

  function fieldTokens() view public returns (uint[]) {
    return fieldTokens;
  }

  /* All the ether sent by investors who purchased the tokens is in this
   contract's account. This method will be used to transfer out all those ethers
   in to another account. *** The way this function is written currently, anyone can call
   this method and transfer the balance in to their account. In reality, you should add
   check to make sure only the owner of this contract can cash out.
   */
  /*function transferTo(address account) public {
    account.transfer(this.balance);
  }*/
}