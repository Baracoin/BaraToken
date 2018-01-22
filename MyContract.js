pragma solidity ^0.4.16;

contract owned {
    address public owner = "0xOwnerAddressHere";

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) onlyOwner public {
        owner = newOwner;
    }
}

contract TokenERC20 is owned {
    // Public variables of the token
    string public name = "BaraToken";
    string public symbol = "BRC";
    uint8 public decimals = 18;
    // 18 decimals is the strongly suggested default, avoid changing it
    uint256 public totalSupply = 160 * (10 ** decimals);

    // Are users currently allowed to transfer their tokens
    bool public allowTransfers = false;
    // Are users currently allowed to burn their tokens
    bool public allowBurns = false;

    // This creates an array with all balances
    mapping (address => uint256) public balanceOf;
    balanceOf[owner] = initialSupply;

    mapping (address => bool) public frozenAccount;


    /**
     * Constrctor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    // function TokenERC20(
    //     uint256 initialSupply,
    //     string tokenName,
    //     string tokenSymbol
    // ) public {
    //     totalSupply = initialSupply * 10 ** uint256(decimals);  // Update total supply with the decimal amount
    //     balanceOf[msg.sender] = totalSupply;                // Give the creator all initial tokens
    //     name = tokenName;                                   // Set the name for display purposes
    //     symbol = tokenSymbol;                               // Set the symbol for display purposes
    // }

    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    // This notifies clients about the amount burnt
    event Burn(address indexed from, uint256 value);

    /* This generates a public event on the blockchain that will notify clients */
    event FrozenFunds(address target, bool frozen);

     function setTokenName(string tokenName) onlyOwner public {
       name = tokenName;
     }

     function setTokenSymbol(string tokenSymbol) onlyOwner public {
       symbol = tokenSymbol;
     }

     function setDecimals(uint8 _decimals) onlyOwner public {
       decimals = _decimals;
     }


    function transfer(address _to, uint256 _value) public {
        _transfer(msg.sender, _to, _value);
    }

    /* Internal transfer, only can be called by this contract */
    function _transfer(address _from, address _to, uint _value) internal {
        require (allowTransfers || msg.sender == owner);
        require (_to != 0x0);                               // Prevent transfer to 0x0 address. Use burn() instead
        require (balanceOf[_from] >= _value);               // Check if the sender has enough
        require (balanceOf[_to] + _value > balanceOf[_to]); // Check for overflows
        require(!frozenAccount[_from]);                     // Check if sender is frozen
        require(!frozenAccount[_to]);                       // Check if recipient is frozen
        balanceOf[_from] -= _value;                         // Subtract from the sender
        balanceOf[_to] += _value;                           // Add the same to the recipient
        Transfer(_from, _to, _value);
    }

    /// @notice Create `mintedAmount` tokens and send it to `target`
    /// @param target Address to receive the tokens
    /// @param mintedAmount the amount of tokens it will receive
    function mintToken(address target, uint256 mintedAmount) onlyOwner public {
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

    function burnFrom(address from, uint256 amount) onlyOwner public {
      require (balanceOf[from] >= amount);
      balanceOf[from] -= amount;
      totalSupply -= amount;
      Burn(from, amount);
    }

    /// @notice `freeze? Prevent | Allow` `target` from sending & receiving tokens
    /// @param target Address to be frozen
    /// @param freeze either to freeze it or not
    function freezeAccount(address target, bool freeze) onlyOwner public {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

    function setAllowTransfers(bool allow) onlyOwner public {
      allowTransfers = allow;
    }

    function setAllowBurns(bool allow) onlyOwner public {
      allowBurns = allow;
    }

    function sendFundsToContract() payable public {

    }
}
