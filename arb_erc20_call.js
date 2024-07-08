const { BigNumber } = require("bignumber.js");
const { ethers } = require("ethers");
const fs = require('fs');
const privateKey = process.env.PRIVATE_KEY
const infuraNode = process.env.ARB_NODE

const provider = new ethers.JsonRpcProvider(infuraNode);
const wallet = new ethers.Wallet(privateKey, provider);

const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token1",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferERC20",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address payable[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]

// 批量转账合约
const contractAddress = '0x0e52Dc5349EE5da0645Cd340604251cDCb34ce4c';
// ERC20合约地址
const ARBUSDT = '0xB308696B9c3b390A40C4E65D0f38264f4D52CBF8';
// 转账币种额度
const value = 1
// ERC20精度
const decimal = 1e6

const amount = new BigNumber(value).multipliedBy(decimal).toString()
const batchSize = 500;
const addressList = fs.readFileSync('./address_list_arb.txt', 'utf-8').split('\n').filter(Boolean);

async function main(){
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  for (let i = 0; i < addressList.length; i += batchSize) {
    const batch = addressList.slice(i, i + batchSize);
    // 调用智能合约方法
    let tx = await contract.transferERC20(ARBUSDT, batch, amount)
    console.log(`batch ${i}-${i + batch.length-1}:`,tx.hash)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
