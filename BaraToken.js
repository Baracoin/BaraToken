pragma solidity ^0.4.16;



contract Request {

  address public owner;



  function Request() public {
    owner = msg.sender;
  }



}



contract TransferRequest is Request {

  address public from;
  address public to;
  uint256 public value;

  bool public authorised = false;



  function TransferRequest(address _to, uint256 _value) public {
    from = msg.sender;
    to = _to;
    value = _value;
  }



  function authorise() public {
    authorised = true;
  }



}



contract BurnRequest is Request {

  address public from;
  uint256 public amount;



  function BurnRequest(address _from, uint256 _amount) public {
    from = _from;
    amount = _amount;
  }



}



contract MintRequest is Request  {

  address target;
  uint256 public amount;



  function MintRequest(address _target, uint256 _amount) public {
    target = _target;
    amount = _amount;
  }



}



contract FreezeRequest is Request  {

  address public target;
  bool public freeze;



  function FreezeRequest(address _target, bool _freeze) public {
    target = _target;
    freeze = _freeze;
  }



}



contract SetAllowTransfersRequest is Request  {

  bool public allow;



  function SetAllowTransfersRequest(bool _allow) public {
    allow = _allow;
  }



}



contract SetAllowBurnsRequest is Request  {

  bool public allow;



  function SetAllowBurnsRequest(bool _allow) public {
    allow = _allow;
  }



}



contract SetAllowBuyingRequest is Request  {

  bool public allow;



  function SetAllowBuyingRequest(bool _allow) public {
    allow = _allow;
  }



}



contract AddNewOwnerRequest is Request  {

  address public newOwner;



  function AddNewOwnerRequest(address _newOwner) public {
    newOwner = _newOwner;
  }



}



contract RemoveOwnerRequest is Request  {

  address public ownerToRemove;



  function RemoveOwnerRequest(address _ownerToRemove) public {
    ownerToRemove = _ownerToRemove;
  }



}



contract Requests {

  // Each request type is given a map/array to be stored in
  TransferRequest[500] public transferRequests;
  BurnRequest[] public burnRequests;
  MintRequest[] public mintRequests;
  FreezeRequest[] public freezeRequests;
  SetAllowTransfersRequest[] public setAllowTransfersRequests;
  SetAllowBurnsRequest[] public setAllowBurnsRequests;
  SetAllowBuyingRequest[] public setAllowBuyingRequests;
  AddNewOwnerRequest[] public addNewOwnerRequests;
  RemoveOwnerRequest[] public removeOwnerRequests;



  // Total of number of each request type
  uint32 public totalTransferRequests = 0;
  uint32 public totalBurnRequests = 0;
  uint32 public totalMintRequests = 0;
  uint32 public totalFreezeRequests = 0;
  uint32 public totalSetAllowTransfersRequests = 0;
  uint32 public totalSetAllowBurnsRequests = 0;
  uint32 public totalSetAllowBuyingRequests = 0;
  uint32 public totalAddNewOwnerRequests = 0;
  uint32 public totalRemoveOwnerRequests = 0;




  /*** Functions for adding requests ***/

  function addTransferRequest(TransferRequest transferRequest) public returns (uint32) {
    transferRequests[totalTransferRequests] = transferRequest;
    totalTransferRequests++;
    return (totalTransferRequests - 1);
  }



  function addBurnRequest(BurnRequest burnRequest) public returns (uint32) {
    burnRequests[totalBurnRequests] = burnRequest;
    totalBurnRequests++;
    return (totalBurnRequests - 1);
  }



  function addMintRequest(MintRequest mintRequest) public returns (uint32) {
    mintRequests[totalMintRequests] = mintRequest;
    totalMintRequests++;
    return (totalMintRequests - 1);
  }



  function addFreezeRequest(FreezeRequest freezeRequest) public returns (uint32) {
    freezeRequests[totalFreezeRequests] = freezeRequest;
    totalFreezeRequests++;
    return (totalFreezeRequests - 1);
  }



  function addSetAllowTransfersRequest(SetAllowTransfersRequest setAllowTransfersRequest) public returns (uint32) {
    setAllowTransfersRequests[totalSetAllowTransfersRequests] = setAllowTransfersRequest;
    totalSetAllowTransfersRequests++;
    return (totalSetAllowTransfersRequests - 1);
  }



  function addSetAllowBurnsRequest(SetAllowBurnsRequest setAllowBurnsRequest) public returns (uint32) {
    setAllowBurnsRequests[totalSetAllowBurnsRequests] = setAllowBurnsRequest;
    totalSetAllowBurnsRequests++;
    return (totalSetAllowBurnsRequests - 1);
  }



  function addSetAllowBuyingRequest(SetAllowBuyingRequest setAllowBuyingRequest) public returns (uint32) {
    setAllowBuyingRequests[totalSetAllowBuyingRequests] = setAllowBuyingRequest;
    totalSetAllowBuyingRequests++;
    return (totalSetAllowBuyingRequests - 1);
  }



  function addAddNewOwnerRequest(AddNewOwnerRequest addNewOwnerRequest) public returns (uint32) {
    addNewOwnerRequests[totalAddNewOwnerRequests] = addNewOwnerRequest;
    totalAddNewOwnerRequests++;
    return (totalAddNewOwnerRequests - 1);
  }



  function addRemoveOwnerRequest(RemoveOwnerRequest removeOwnerRequest) public returns (uint32) {
    removeOwnerRequests[totalAddNewOwnerRequests] = removeOwnerRequest;
    totalRemoveOwnerRequests++;
    return (totalRemoveOwnerRequests - 1);
  }



}



contract Owned {

    address[] public owners;

    uint256 totalOwners;



    function Owned() public {
        owners[0] = msg.sender;
        totalOwners = 1;
    }



    function isOwner(address addressToCheck) internal returns (bool) {
      for (uint16 ownerId = 0; ownerId < owners.length; ownerId++) {
        if (owners[ownerId] == addressToCheck) {
          return true;
        }
      }
      return false;
    }



    modifier onlyOwners {
        require(isOwner(msg.sender));
        _;
    }



}



contract TokenERC20 is Owned {
    // Public variables of the token
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    address currentSeller;
    // 18 decimals is the strongly suggested default, avoid changing it

    // Total number of tokens in circulation
    uint256 public totalSupply;

    // Current price
    uint256 buyPrice = 10;

    // Are users currently allowed to..

    // transfer their tokens
    bool public allowTransfers = false;
    // burn their tokens
    bool public allowBurning = false;
    // buy tokens
    bool public allowBuying = false;

    // Class/contract to keep track of requests made by owners
    // which can then be authorised by a different owner
    Requests requests;

    // This creates an array with all balances
    mapping (address => uint256) public balanceOf;
    mapping (address => bool) public frozenAccounts;



    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    function TokenERC20(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol,
        address secondOwner
    ) public {
        totalSupply = initialSupply * 10 ** uint256(decimals);  // Update total supply with the decimal amount
        balanceOf[msg.sender] = totalSupply;                // Give the creator all initial tokens
        name = tokenName;                                   // Set the name for display purposes
        symbol = tokenSymbol;                               // Set the symbol for display purposes
        requests = new Requests();                          // Initialise our Requests class
        currentSeller = msg.sender;                         // Set from which account to sell tokens
        owners[1] = secondOwner;                            // Set the second owner of the contract
        totalOwners++;                                      // Update the total number of owners
    }



    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);
    // This notifies clients about the amount burnt
    event Burn(address indexed from, uint256 value);
    /* This generates a public event on the blockchain that will notify clients */
    event FreezeAccount(address target, bool frozen);

    function setTokenName(string tokenName) onlyOwners public {
      name = tokenName;
    }



    function setTokenSymbol(string tokenSymbol) onlyOwners public {
      symbol = tokenSymbol;
    }



    function makeTransferRequest(address _to, uint256 _value) onlyOwners public returns (uint32) {
      TransferRequest transferRequest = new TransferRequest(_to, _value);
      uint32 requestId = requests.addTransferRequest(transferRequest);
      return requestId;
    }



    function makeBurnRequest(address from, uint256 value) onlyOwners public returns (uint32) {
      BurnRequest burnRequest = new BurnRequest(from, value);
      uint32 requestId = requests.addBurnRequest(burnRequest);
      return requestId;
    }



    function makeFreezeRequest(address target, bool freeze) onlyOwners public returns (uint32) {
      FreezeRequest freezeRequest = new FreezeRequest(target, freeze);
      uint32 requestId = requests.addFreezeRequest(freezeRequest);
      return requestId;
    }



    function makeMintRequest(address target, uint256 amount) onlyOwners public returns (uint32) {
      MintRequest mintRequest = new MintRequest(target, amount);
      uint32 requestId = requests.addMintRequest(mintRequest);
      return requestId;
    }



    function makeSetAllowTransfersRequest(bool allow) onlyOwners public returns (uint32) {
      SetAllowTransfersRequest setAllowTransfersRequest = new SetAllowTransfersRequest(allow);
      uint32 requestId = requests.addSetAllowTransfersRequest(setAllowTransfersRequest);

      return requestId;
    }



    function makeSetAllowBurnsRequest(bool allow) onlyOwners public returns (uint32) {
      SetAllowBurnsRequest setAllowBurnsRequest = new SetAllowBurnsRequest(allow);
      uint32 requestId = requests.addSetAllowBurnsRequest(setAllowBurnsRequest);
      return requestId;
    }



    function makeSetAllowBuyingRequest(bool allow) onlyOwners public returns (uint32) {
      SetAllowBuyingRequest setAllowBuyingRequest = new SetAllowBuyingRequest(allow);
      uint32 requestId = requests.addSetAllowBuyingRequest(setAllowBuyingRequest);
      return requestId;
    }



    function makeAddNewOwnerRequest(address newOwner) onlyOwners public returns (uint32) {
      AddNewOwnerRequest addNewOwnerRequest = new AddNewOwnerRequest(newOwner);
      uint32 requestId = requests.addAddNewOwnerRequest(addNewOwnerRequest);
      return requestId;
    }



    function makeRemoveOwnerRequest(address ownerToRemove) onlyOwners public returns (uint32) {
      RemoveOwnerRequest removeOwnerRequest = new RemoveOwnerRequest(ownerToRemove);
      uint32 requestId = requests.addRemoveOwnerRequest(removeOwnerRequest);
      return requestId;
    }



    function completeTransferRequest(uint256 requestId) onlyOwners public returns (bool) {
      require(requests.transferRequests[requestId].authorised() == false);
      require(requests.transferRequests[requestId].owner() != msg.sender);
      requests.transferRequests[requestId].authorise();
      _transfer(requests.transferRequests[requestId].from, requests.transferRequests[requestId].to, requests.transferRequests[requestId].value);
      return true;
    }



    function completeBurnRequest(uint256 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.burnRequests[requestId].authorise();
      _burnFrom(requests.burnRequests[requestId].target, requests.burnRequests[requestId].amount);
      return true;
    }



    function _burnFrom(address target, uint256 amount) internal {
      require(balanceOf[target] >= amount);
      balanceOf[target] -= amount;
      totalSupply -= amount;
      Burn(target, amount);
    }



    function completeFreezeRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.freezeRequests[requestId].authorise();
      _freezeAccount(requests.burnRequests[requestId].target, requests.burnRequests[requestId].freeze);
      return true;
    }



    function _freezeAccount(address target, bool freeze) internal {
      frozenAccounts[target] = freeze;
      FreezeAccount(target, freeze);
    }



    function completeMintRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.mintRequests[requestId].authorise();
      _mint(requests.mintRequests[requestId].target, requests.mintRequests[requestId].amount);
      return true;
    }



    function _mint(address target, uint256 amount) internal {
      balanceOf[target] += amount;
      totalSupply += amount;
      Transfer(0, this, amount);
      Transfer(this, target, amount);
    }



    function completeSetAllowTransfersRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.setAllowTransfersRequests[requestId].authorise();
      _setAllowTransfers(requests.setAllowTransfersRequests[requestId].allow);
      return true;
    }



    function _setAllowTransfers(bool allow) internal {
      allowTransfers = allow;
    }



    function completeSetAllowBurningRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.setAllowBurningRequests[requestId].authorise();
      _setAllowBurning(requests.setAllowBurningRequests[requestId].allow);
      return true;
    }



    function _setAllowBurning(bool allow) internal {
      allowBurning = allow;
    }



    function completeSetAllowBuyingRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.setAllowBuyingRequests[requestId].authorise();
      _setAllowBuying(requests.setAllowBuyingRequests[requestId].allow);
      return true;
    }



    function _setAllowBuying(bool allow) internal {
      allowBuying = allow;
    }



    function completeAddNewOwnerRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.addNewOwnerRequests[requestId].authorise();
      _addNewOwner(requests.addNewOwnerRequests[requestId].newOwner);
      return true;
    }



    function _addNewOwner(address newOwner) internal {
      owners[totalOwners] = newOwner;
      totalOwners++;
    }



    function completeRemoveOwnerRequest(uint32 requestId) onlyOwners public returns (bool) {
      require(requests.freezeRequests[requestId].authorised == false);
      require(requests.freezeRequests[requestId].owner != msg.sender);
      requests.removeOwnerRequests[requestId].authorise();
      _removeOwner(requests.removeOwnerRequests[requestId].ownerToRemove);
      return true;
    }



    function _removeOwner(address ownerToRemove) internal {
      for (uint256 currentOwnerId; currentOwnerId < owners.length; currentOwnerId++) {
        if (owners[currentOwnerId] == ownerToRemove) {
          owners[currentOwnerId] = false;
          return true;
        }
      }
    }



    function burn(uint256 amount) public {
      require(!isOwner(msg.sender));
      require(allowBurning);
      require(balanceOf[msg.sender] >= amount);
      balanceOf[msg.sender] -= amount;
      totalSupply -= amount;
      Burn(msg.sender, amount);
    }



    function buyTokens() payable public {
      require(allowBuying);
      require(!frozenAccounts[msg.sender]);
      require(msg.value > 0);
      uint256 numberOfTokensPurchased = msg.value / buyPrice;
      _transfer(currentSeller, msg.sender, numberOfTokensPurchased);
    }



    function transfer(address _to, uint256 _value) public {
      require(!isOwner(msg.sender));
      require(allowTransfers);
      _transfer(msg.sender, _to, _value);
    }



    /* Internal transfer, only can be called by this contract */
    function _transfer(address _from, address _to, uint256 _value) internal {
      require (_to != 0x0);                               // Prevent transfer to 0x0 address. Use burn() instead
      require (balanceOf[_from] >= _value);               // Check if the sender has enough
      require (balanceOf[_to] + _value > balanceOf[_to]); // Check for overflows
      require(!frozenAccounts[_from]);                     // Check if sender is frozen
      require(!frozenAccounts[_to]);                       // Check if recipient is frozen
      balanceOf[_from] -= _value;                         // Subtract from the sender
      balanceOf[_to] += _value;                           // Add the same to the recipient
      Transfer(_from, _to, _value);
    }



}
