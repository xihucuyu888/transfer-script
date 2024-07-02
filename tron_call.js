const TronWeb = require('tronweb');
const fs = require('fs');

const addressList = fs.readFileSync('./address_list_trx.txt', 'utf-8').split('\n').filter(Boolean);

async function main(){
// 连接到Tron节点
const tronWeb = new TronWeb({
  fullHost: 'https://api.nileex.io',
  solidityNode: 'https://api.nileex.io',
  eventServer: 'https://api.nileex.io',
  privateKey: '2e3dd8060d739ef5fefd45c6b735552fd25e4a629017967d3a99dfd5b1af8d8e'
});

// 读取智能合约ABI
const contractABI = [{"inputs":[{"name":"token","type":"address"},{"name":"recipients","type":"address[]"},{"name":"amount","type":"uint256"}],"name":"transferTRC20","stateMutability":"payable","type":"function"}]

// 智能合约地址
const contractAddress = 'TDvTEuTqS42Hj3wPHm9z3qbXtaJ54UTPa3';

// 创建智能合约实例
const contract = await tronWeb.contract(contractABI, contractAddress);


const USDT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
const amount = 1000000; 
const batchSize = 100

for (let i = 0; i < addressList.length; i += batchSize) {
    const batch = addressList.slice(i, i + batchSize);
    // 调用智能合约方法
    tx = await contract.transferTRC20(USDT, batch, amount).send()
    console.log(tx)
}
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });