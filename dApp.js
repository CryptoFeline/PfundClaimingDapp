const untracerAbi = [
    "function WITHDRAW() external",
    "function LOCK(address _finalUser, uint256 _amountToStake, uint timeToWaitBeforeWithdrawal) external",
    "function getStakedToken() external view returns(address)",
    "function getBalanceOfWalletForToken(address addressToCheck) public view returns (uint256)",
    "function getCurrentTimestamp() public view returns (uint256)",
    "function getTimeForAccount(address addressToCheck) public view returns (uint)",
    "function getBalanceStakedForAccount(address addressToCheck) public view returns (uint256)",
    "function timeLeft(address addressToCheck) public view returns (uint256)",
    "function isWithdrawable(address addressToCheck) public view returns (bool)"
]

const erc20StandardInterface =  [
    "function approve(address _spender, uint256 _value) public returns (bool success)"
]

// Retrieve all data from the HTML form
const btnConnect = document.getElementById('connect');
const btnConnectWithdraw = document.getElementById('connectWithdrawPanel');
const lockingPeriod = document.getElementById('lockingPeriod');
const amountToStake = document.getElementById('amountToStake');
const finalUserAddress = document.getElementById('finalUser');

const stakedTokenINFO = document.getElementById('stakedToken');
const amountStakedForAccountINFO = document.getElementById('amountStakedForAccount');
const requestedTimelockINFO = document.getElementById('requestedTimelock');
const timeLeftINFO = document.getElementById('timeLeft');

const buttonApprove = document.getElementById('approveButton');
const buttonStake = document.getElementById('lockTokensButton');


// Wallet connected to dApp
let userAddress = ""

// Web3 provider
let provider = new ethers.providers.Web3Provider(window.ethereum)

// Address of the smart contract in ETH Chain
//const contractAddress = '0x5864c6A9cFdEBc8652DC576e4087c100B1F96E40' // address given while deploying the smart contract       
const contractAddress = '0xfBC6bE3A4aDd5f47F2d95B73A9dF8ff7D7f0eF2d' // address given while deploying the smart contract               


/* Function for DEPOSIT */

async function lockFunds() {
    commitDeposit(amountToStake.value)
};



async function approveSpending() {

    // Get the STAKED token from contract
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);
    // Get address of the staked token
    const stakedToken = await numberContract.connect(signer).getStakedToken()

    // Approve spending of the token
    const amountAuthorized = amountToStake.value

    // ETH WEI Conversion of amount
    const amountAuthorizedETH = ethers.utils.parseUnits(amountAuthorized,"ether")

    var tokenContract = new ethers.Contract(stakedToken, erc20StandardInterface, provider);
    tokenContract.connect(signer).approve(contractAddress, amountAuthorized, {gasLimit: 1000000})
}

// Execute DEPOSIT inside the smartcontract. As @parameter we have the amount to send, called from buttons
async function commitDeposit(amountToSend) {
  
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);
    // ETH WEI Conversion of amount
    const amountAuthorizedETH = ethers.utils.parseUnits(amountToStake.value,"ether")

    // Stake the token approved
    const txResponse = await numberContract.connect(signer).LOCK(finalUser.value, amountAuthorizedETH,lockingPeriod.value , {gasLimit: 5000000, nonce: undefined,})
    await txResponse.wait()
    
  }


// Execute WITHDRAW
async function withdrawFunds() {
    const mioContratto = new ethers.Contract(contractAddress, untracerAbi, provider);
    const signer = provider.getSigner()   
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);
    const txResponse = await numberContract.connect(signer).WITHDRAW({ gasLimit: 5000000, nonce: undefined,})
    await txResponse.wait()
  }
  
/* Function to connect or disconnect Metamask */
async function connectWallet() {
    // If a connection is active, button will disconnect wallet. If not, execute a connect
    if (userAddress == "")    {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const address = await signer.getAddress(),
        balance = await provider.getBalance(address),
        formattedBalance = ethers.utils.formatEther(balance)
        // Get the first 3 and the last 5 letters and numbers of the wallet connected
        var lastCharacterOfWalletConnected = address.substr(address.length - 5);
        var firstCharacterOfWalletConnected = address.slice(0, 3);
        // Print a message on the button  
        btnConnect.innerHTML ="Connected with " + firstCharacterOfWalletConnected + "..." + lastCharacterOfWalletConnected
        btnConnectWithdraw.innerHTML ="Connected with " + firstCharacterOfWalletConnected + "..." + lastCharacterOfWalletConnected
        // Set the address as a global variable
        userAddress = address
        // Check the presence of the STAKED TOKEN needed to use this service
        // Hide the default message 
        const mioContratto = new ethers.Contract(contractAddress, untracerAbi, provider);
        // Get some info from position

        // Get address of the staked token
        // Get the STAKED token from contract
        const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);
        stakedTokenINFO.innerHTML = await numberContract.connect(signer).getStakedToken()
        requestedTimelockINFO.innerHTML = await numberContract.connect(signer).getTimeForAccount(userAddress)
        amountStakedForAccountINFO.innerHTML = (await numberContract.connect(signer).getBalanceStakedForAccount(userAddress)) / 10 **18
        timeLeftINFO.innerHTML = await numberContract.connect(signer).timeLeft(userAddress)
        
        return signer
    }
    
    else    {
        // Disconnect wallet refreshing page
        connect.innerHTML ="Connect your wallet"
        location.reload();
        return false;
    }
}

/* On windows loading, load this function */
window.addEventListener("load", function(){
})

