pragma solidity ^0.4.16;


contract Owned {
  // Owner variables and functions
  mapping (address => bool) public owners;

  // Has the next action been authorised by another owner
  bool public nextActionIsAuthorised = false;
  address public actionAuthorisedBy;



  function Owned() public {
    owners[msg.sender] = true;
  }



  function isOwner(address addressToCheck) constant public returns (bool) {
    return owners[addressToCheck];
  }



  modifier onlyOwners {
      require(isOwner(msg.sender));
      checkActionIsAuthorisedAndReset();
      _;
  }



  function authoriseNextAction() public {
    require(!nextActionIsAuthorised);
    nextActionIsAuthorised = true;
    actionAuthorisedBy = msg.sender;
  }



  function checkActionIsAuthorisedAndReset() public {
    bool actionIsAuthorised = (nextActionIsAuthorised && actionAuthorisedBy != msg.sender);
    require(actionIsAuthorised);
    nextActionIsAuthorised = false;
  }



}




contract TokenERC20 is Owned {

    // Public variables of the token
    string public name = "BaraToken";
    string public symbol = "BRC";
    uint256 initialSupply = 1600000;
    address secondOwner = 0xAddressHere;

    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint256 public sellPrice;
    address public currentSeller;

    // Are users currently allowed to...
    bool public allowTransfers = false; // transfer their tokens
    bool public allowBurns = false;     // burn their tokens
    bool public allowBuying = false;    // buy tokens

    // This creates an array with...
    mapping (address => uint256) public balanceOf;  // all balances
    mapping (address => bool) public frozenAccounts; // frozen accounts




    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
     
    function TokenERC20() public {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        currentSeller = msg.sender;
        owners[secondOwner] = true;
    }



    /* These generate a public event on the blockchain that will notify clients */
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event FrozenFunds(address target, bool frozen);
    event NewSellPrice(uint256 sellPrice);



    function setTokenName(string tokenName) onlyOwners public {
     name = tokenName;
    }



    function setTokenSymbol(string tokenSymbol) onlyOwners public {
     symbol = tokenSymbol;
    }



    function setDecimals(uint8 _decimals) onlyOwners public {
     decimals = _decimals;
    }



    function ownersTransfer(address _from, address _to, uint256 _amount) onlyOwners public {
      _transfer(_from, _to, _amount);
    }



    function transfer(address _to, uint256 _value) public {
      require(allowTransfers && !isOwner(msg.sender));
      _transfer(msg.sender, _to, _value);
    }



    /* Internal transfer, only can be called by this contract */
    function _transfer(address _from, address _to, uint _value) internal {
      require (_to != 0x0);                               // Prevent transfer to 0x0 address. Use burn() instead
      require (balanceOf[_from] >= _value);               // Check if the sender has enough
      require (balanceOf[_to] + _value > balanceOf[_to]); // Check for overflows
      require(!frozenAccounts[_from]);                     // Check if sender is frozen
      require(!frozenAccounts[_to]);                       // Check if recipient is frozen
      balanceOf[_from] -= _value;                         // Subtract from the sender
      balanceOf[_to] += _value;                           // Add the same to the recipient
      Transfer(_from, _to, _value);
    }



    function mintToken(address target, uint256 mintedAmount) onlyOwners public {
      balanceOf[target] += mintedAmount;
      totalSupply += mintedAmount;
      Transfer(0, this, mintedAmount);
      Transfer(this, target, mintedAmount);
    }



    function burn(uint256 amount) public {
      require(allowBurns);
      require(balanceOf[msg.sender] >= amount);
      balanceOf[msg.sender] -= amount;
      totalSupply -= amount;
      Burn(msg.sender, amount);
    }



    function burnFrom(address from, uint256 amount) onlyOwners public {
      require (balanceOf[from] >= amount);
      balanceOf[from] -= amount;
      totalSupply -= amount;
      Burn(from, amount);
    }



    function freezeAccount(address target, bool freeze) onlyOwners public {
        frozenAccounts[target] = freeze;
        FrozenFunds(target, freeze);
    }



    function setAllowTransfers(bool allow) onlyOwners public {
      allowTransfers = allow;
    }



    function setAllowBurns(bool allow) onlyOwners public {
      allowBurns = allow;
    }



    function setAllowBuying(bool allow) onlyOwners public {
        allowBuying = allow;
    }



    function setSellPrice(uint256 _sellPrice) onlyOwners public {
      sellPrice = _sellPrice;
      NewSellPrice(_sellPrice);
    }



    function addOwner(address owner) onlyOwners public {
      owners[owner] = true;
    }



    function removeOwner(address owner) onlyOwners public {
      owners[owner] = false;
    }



    function buyTokens() payable public {
      require(allowBuying);
      require(!frozenAccounts[msg.sender]);
      require(msg.value > 0);
      uint256 numberOfTokensPurchased = msg.value / sellPrice;
      _transfer(currentSeller, msg.sender, numberOfTokensPurchased);
    }



    function sendContractFundsToAddress(uint256 amount, address recipient) onlyOwners public {
      recipient.transfer(amount);
    }



    function sendFundsToContract() payable public {

    }



    function getContractBalance() constant public returns (uint256) {
      return this.balance;
    }




}
