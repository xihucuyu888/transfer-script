const _ = require('lodash')
const bitcoin = require('bitcoinjs-lib');
const BigNumber = require('bignumber.js');
const coinSelect = require('coinselect')
const axios = require('axios')
const fs = require('fs');

const privateKey = process.env.PRIVATE_KEY
const BASE_URL = 'https://testnet-node.nbltrust.com/btc/api/BTC/testnet'

const get = async  (url) => {
  return (await axios.get(BASE_URL+ url)).data
}

const post = async (url, data) => {
  return (await axios.post(BASE_URL + url, data)).data
}

const getAddressUtxo = async (address) => {
  const result = await get(`/address/${address}?unspent=true&limit=1000`)
  return utxoMapper(result)
}

const utxoMapper = (utxos) => {
  utxos = utxos.map(utxo => {
    const out = {}
    const amount = new BigNumber(utxo.value).div(1e8).toNumber()
    _.set(out, 'address', utxo.address)
    _.set(out, 'txid', utxo.mintTxid)
    _.set(out, 'txId', utxo.mintTxid)
    _.set(out, 'vout', utxo.mintIndex)
    _.set(out, 'scriptPubKey', utxo.script)
    _.set(out, 'amount', amount)
    _.set(out, 'satoshis', utxo.value)
    _.set(out, 'height', utxo.mintHeight)
    _.set(out, 'confirmations', utxo.confirmations)
    return _.assign(utxo, out)
  })
  return utxos
}

const getfeeRate = async () => {
  const result = await get('/fee/7')
  return result.feerate
}

const sendTx = async (rawtx) => {
  let result
  try {
    result = await post('/tx/send', { rawTx: rawtx })
  } catch (err) {
    console.log(err)
    throw new Error('broadcast tx failed ')
  }
  return result
}

const getUtxos = async (priKey) => {
  const network = bitcoin.networks.testnet
  const keyPair = bitcoin.ECPair.fromWIF(priKey, network)
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network })
  const addrs = [address]

  const utxoSet = new Set();

  for (const address of addrs) {
    const utxos = await getAddressUtxo(address)
    utxos.forEach(utxo => {
      utxoSet.add(JSON.stringify(utxo))
    });
  }
  const uniqueUTXOs = Array.from(utxoSet).map(utxoString => JSON.parse(utxoString))
  return uniqueUTXOs
}

function generateTargets(addresses, value) {
  return addresses.map(address => ({
    address,
    value
  }));
}


const sendBTC = async (addresses, amount) => {
  const feePrice = await getfeeRate()
  const feeRate = new BigNumber(feePrice).times(1e8).dividedBy(100).integerValue(BigNumber.ROUND_DOWN).toNumber()
  const value = new BigNumber(amount).times(1e8).toNumber()
  const targets = generateTargets(addresses, value);

  const utxos = await getUtxos(privateKey)
  const { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate)
  if (inputs && outputs) {
    //build tx
    const filledOutputs = outputs.map(output => {
      if (!output.address) {
        output.address = inputs[0].address; // 在这里设置默认值
      }
      return output;
    })
    const network = bitcoin.networks.testnet
    const tx = new bitcoin.TransactionBuilder(network)
    inputs.forEach((e) => tx.addInput(e.txid, e.vout))
    filledOutputs.forEach((e) => tx.addOutput(e.address, e.value))

    //sign tx
    let signer
    for (let i = 0; i < inputs.length; i++) {
      signer = bitcoin.ECPair.fromWIF(privateKey, network)
      tx.sign(i, signer)
    }

    //send tx
    const rawtx = tx.build().toHex()
    const hash = await sendTx(rawtx)
    return hash.txid

  } else {
    console.log(inputs, outputs, fee)
    throw new Error('not enough utxos!!!')
  }
}

async function main(){
   const amount = 0.0001
   const addressList = fs.readFileSync('./address_list_btc.txt', 'utf-8').split('\n').filter(Boolean);
   const batchSize = 500
   for (let i = 0; i < addressList.length; i += batchSize) {
    const batch = addressList.slice(i, i + batchSize);
    const tx = await sendBTC(batch,amount)
    console.log(`batch ${i}-${i + batch.length-1}:`,tx)
  }

}

main().catch((err) => console.log(err)).finally(() => { })
