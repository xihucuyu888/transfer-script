const { ethers } = require("ethers");

const privateKey = process.env.PRIVATE_KEY
const privateKey2 = process.env.PRIVATE_KEY2
const infuraNode = process.env.SEPOLIA_NODE

const provider = new ethers.JsonRpcProvider(infuraNode);
const wallet = new ethers.Wallet(privateKey, provider); // 使用你的私钥
const wallet2 = new ethers.Wallet(privateKey2, provider); 
// ERC20合约地址
const tokenAddress = "0x697107AAA429D734158e91d697a1571Bb2E95058"
const tokenName = 'APE'
// 转账接受地址
const recipientAddress = "0xEc67A59e54A393b702c7EcCe1faca731E4f0e601";

async function sendERC20Transaction() {
  const abi = ["function transfer(address to, uint256 amount) public returns (bool)"];
  const amount = 100;
  
  // 创建 ERC20 代币合约实例
  const tokenContract = new ethers.Contract(tokenAddress, abi, wallet);
  
  // 设置交易的 gasLimit
  const gasLimit = 22000; // 设置你希望的 gasLimit 值
  
  // 发送 ERC20 代币交易
  const tx = await tokenContract.transfer(recipientAddress, amount, { gasLimit });
  
  console.log("Transfer Transaction hash:", tx.hash);
  console.log("Gas used:", tx.gasLimit.toString());
}



async function transferFromERC20Transaction() {
  const abi = ["function transferFrom(address from, address to, uint256 amount) public returns (bool)"];
  const from = wallet.address
  const amount = 100;
  
  const tokenContract = new ethers.Contract(tokenAddress, abi, wallet2);
  const gasLimit = 100000; 
  const tx = await tokenContract.transferFrom(from, recipientAddress, amount, { gasLimit });
  
  console.log("TransferFrom Transaction hash:", tx.hash);
  console.log("Gas used:", tx.gasLimit.toString());
}

async function approve() {
  const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
  const spender = wallet2.address
  const amount = 100;
  
  const tokenContract = new ethers.Contract(tokenAddress, abi, wallet);
  const tx = await tokenContract.approve(spender, amount);
  
  console.log("Approve Transaction hash:", tx.hash);
  console.log("Gas used:", tx.gasLimit.toString());
}

async function permit() {
  const abi = ['function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)',
    'function nonces(address owner) view returns (uint256)',
    'function DOMAIN_SEPARATOR() view returns (bytes32)'
  ];
  const tokenContract = new ethers.Contract(tokenAddress, abi, wallet2);
  
  // 设置授权参数
  const owner = wallet.address;
  const spender = wallet2.address;
  const value = ethers.parseUnits('100', 18); // 授权的代币数量
  const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 有效期为24小时
  
  // 构造 permit 签名
  const nonce = await tokenContract.nonces(owner);
  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline
  };

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  }

  const chainId = (await provider.getNetwork()).chainId

  const domain = {
    name: tokenName, // 替换为你的代币名称
    version: '1',
    chainId, // 替换为目标链的链 ID
    verifyingContract: tokenAddress, // 替换为你的代币合约地址
  }

  
  const signature = await wallet.signTypedData(domain, types, message);
  const { v, r, s } = ethers.Signature.from(signature);
  
  // 调用 permit 函数
  const gaslimit = 1000000
  const tx = await tokenContract.permit(message.owner, message.spender, message.value, message.deadline, v, r, s,{ gaslimit });
  

  console.log("Approve Transaction hash:", tx.hash);
  console.log("Gas used:", tx.gasLimit.toString());
}




//sendERC20Transaction();
//transferFromERC20Transaction();
//approve()
permit()
