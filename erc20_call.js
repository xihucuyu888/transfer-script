const { BigNumber } = require("bignumber.js");
const { ethers } = require("ethers");
const fs = require('fs');
const privateKey = process.env.PRIVATE_KEY
const infuraNode = process.env.SEPOLIA_NODE

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
const contractAddress = '0x53B99e66a655A9e5953fF19Ffa248154e7e9765b';
// ERC20合约地址
const USDT = '0x0093b27dA6a4A611f31e5c00A89897E874132E66';
const SAND = '0x665F5b021cB0a0ABB52a2F632e94433749E92e69'
const RNDR = '0x96DD014A322295b47dEfEfbAC22baD572A33AA97'
// 转账币种额度
const value = 1
// ERC20精度
const decimal = 1e6

const amount = new BigNumber(value).multipliedBy(decimal).toString()
const batchSize = 500;
const addressList = fs.readFileSync('./address_list_eth.txt', 'utf-8').split('\n').filter(Boolean);

async function main(){
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  for (let i = 0; i < addressList.length; i += batchSize) {
    const batch = addressList.slice(i, i + batchSize);
    // 调用智能合约方法
    tx = await contract.transferERC20(USDT, batch, amount)
    console.log(`batch ${i}-${i + batch.length-1}:`,tx.hash)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
