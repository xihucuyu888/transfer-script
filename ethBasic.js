const { ethers } = require('ethers');
const BigNumber = require('bignumber.js');
const { connect } = require('http2');


class ethBasic{
  constructor(config){
    this.localEthers = null
    this.config = config
  }

  async init(){
  }

  getEthers(){
    if(!this.localEthers){
      const wallet = new ethers.Wallet(this.config.privateKey);
      const provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      this.localEthers = wallet.connect(provider);
    }
    return this.localEthers
  }
async sendEth(targets) {
    // 发送ETH转账交易
    const connectedWallet = this.getEthers()
    for (let i = 0; i < targets.length; i++){
        const { address, amount} = targets[i];
        const tx = await connectedWallet.sendTransaction({
          to: address,
          value: ethers.parseEther(amount.toString())
        });
        console.log(`Transfer ${amount} ETH to ${address}. Transaction Hash: ${tx.hash}`);
    }
  }

async sendErc20(token, contract, targets) {
    // 执行ERC20智能合约转账
    for (let i = 0; i < targets.length; i++) {
      const { address, amount } = targets[i];
  
      // 检查转账者余额是否充足
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount.toString(), decimals);
      const balance = await contract.balanceOf(wallet.address);
      if (BigNumber(balance).lt(value)) {
        console.log(`Insufficient balance for transfer to ${address}`);
        continue;
      }
  
      // 发送ERC20智能合约转账交易
      const tx = await contract.transfer(address, value);
      console.log(`Transfer ${amount} ${token} to ${address}. Transaction Hash: ${tx.hash}`);
    }
  }

async transferERC20(token) {
      const connectedWallet = this.getEthers()
      const { address, abi, targets } = this.config.contracts[token];
  
      // 实例化ERC20智能合约
      const contract = new ethers.Contract(address, abi, connectedWallet);
  
      // 执行ERC20智能合约转账
      await this.sendErc20(contract, targets);
    }


async transfer(token) {
    if (token){
      if (token === 'ETH') {
        await this.sendEth(this.config.targets)
      }else {
        await this.transferERC20(token)
      }
    }else{
      console.log("you should input a token name")
    }   
}
}

module.exports = ethBasic