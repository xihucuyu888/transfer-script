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


  for (let i = 0; i < ToAddresses.length; i++) {
    const amount = BigNumber(value).times(1e6).toNumber()
    const addr = ToAddresses[i]

    try {
      let tx = await tronWeb.trx.sendTransaction(addr, amount);
      console.log(tx.txid)
    } catch (err) {
      console.log('send error addr: ', addr, err)
    }
  }
}




main().catch((err) => console.log(err)).finally(() => { })