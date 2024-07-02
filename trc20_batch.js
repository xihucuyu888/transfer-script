const TronWeb = require('tronweb')
const BigNumber = require('bignumber.js').default
const fs = require('fs');

const ToAddresses = fs.readFileSync('./address_list_trx.txt', 'utf-8').split('\n').filter(Boolean);

const webUrl = 'https://api.nileex.io'
const privateKey = process.env.PRIVATE_KEY
const value = 10
async function main() {
  
  const option = {
    fullNode: webUrl,
    solidityNode: webUrl
  }
  const tronWeb = new TronWeb(option)
  tronWeb.setPrivateKey(privateKey)
  const address = tronWeb.address.fromPrivateKey(privateKey)
  console.log('from address:',tronWeb.address.fromPrivateKey(privateKey))
  const balance = await tronWeb.trx.getBalance(TronWeb.address.toHex(address))
  console.log('TRX balance:', BigNumber(balance).div(1e6).toString())

  const USDT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj'
  const contract = await tronWeb.contract().at(USDT)
  const tr = await contract.balanceOf(address).call()
  console.log('Token balance:', tr.div(1e6).toString())
  for (let i = 0; i < ToAddresses.length; i++) {
    const amount = BigNumber(value).times(1e6).toNumber()
    const functionSelector = 'transfer(address,uint256)';
    const addr = ToAddresses[i]
    const parameter = [{ type: 'address', value: addr }, { type: 'uint256', value: amount }]
    try {
      const tx = await tronWeb.transactionBuilder.triggerSmartContract(USDT, functionSelector, {}, parameter);
      const signedTx = await tronWeb.trx.sign(tx.transaction);
      const result1 = await tronWeb.trx.sendRawTransaction(signedTx);
      console.log(result1.txid)
    } catch (err) {
      console.log('send error addr: ', addr,err)
    }
  }
}




main().catch((err) => console.log(err)).finally(() => { })