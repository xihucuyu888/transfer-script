const TronWeb = require('tronweb');
const config = require('./config.tron.json');

// 创建TronWeb对象
const tronWeb = new TronWeb({
    fullHost: config.rpcUrl,
    privateKey: config.privateKey
  });
  

// 定义Tron转账函数
async function send_trx(to_address, amount) {
    const transaction = await tronWeb.transactionBuilder.sendTrx(to_address, amount * 1e6, tronWeb.defaultAddress.hex);
    const signedTransaction = await tronWeb.trx.sign(transaction, config.private_key);
    const transactionId = await tronWeb.trx.sendRawTransaction(signedTransaction);
    return transactionId;
  }
  
  // 定义TRC20转账函数
async function send_trc20(to_address, amount, token) {
    const contract_address = token.address;
    const contract = await tronWeb.contract(token.abi, contract_address);
    const decimal = await contract.decimals().call()
    const transactionId = await contract.transfer(to_address, amount * 10 ** decimal).send();
    return transactionId;
  }


  async function transferTRX() { 
    for (let i = 0; i < config.targets.length; i++) {
        const { address, amount } = config.targets[i];
        const transactionId = await send_trx(address, amount);
        console.log(`Transfer ${amount} TRX to ${address}. Transaction Hash: ${transactionId}`);
    }
}

async function transferTRC20(token) {
    const tokeninfo = config.contracts.find(contract => contract.token === token);
    for (let i = 0; i < config.targets.length; i++) {
        const { address, amount } = config.targets[i];
        const transactionId = await send_trc20(address, amount, tokeninfo);
        console.log(`Transfer ${amount} ${tokeninfo.token} to ${address}. Transaction Hash: ${transactionId}`);
    }
  }

async function transfer(token) {
    if (token){
      if (token === 'TRX') {
        await transferTRX()
      }else {
        await transferTRC20(token)
      }
    }else{
      console.log("you should input a token name")
    }   
}

const token = process.argv[2]
transfer(token)
