const { ethers } = require("ethers");

const privateKey = process.env.PRIVATE_KEY
const infuraNode = process.env.SEPOLIA_NODE

const provider = new ethers.JsonRpcProvider(infuraNode);
const wallet = new ethers.Wallet(privateKey, provider); // 使用你的私钥

async function sendERC20Transaction() {
  const tokenAddress = "0x6c4d635e5EeC0C0c8D0d5a74980F081C79Da54Ae";
  const abi = ["function transfer(address to, uint256 amount) public returns (bool)"];
  const recipientAddress = "0x04e98D7A5ca93d3DdcF88DbB0f9Dde1E2910061f";
  const amount = 100;

  // 创建 ERC20 代币合约实例
  const tokenContract = new ethers.Contract(tokenAddress, abi, wallet);

  // 设置交易的 gasLimit
  const gasLimit = 22000; // 设置你希望的 gasLimit 值

  // 发送 ERC20 代币交易
  const tx = await tokenContract.transfer(recipientAddress, amount, { gasLimit });

  console.log("Transaction hash:", tx.hash);
  console.log("Gas used:", tx.gasLimit.toString());
}

sendERC20Transaction();
