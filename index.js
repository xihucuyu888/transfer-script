const config = require('./config.json');
const { ethers } = require('ethers');
const BigNumber = require('bignumber.js')


// 定义钱包
const wallet = new ethers.Wallet(config.privateKey);

// 连接到以太坊网络
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const connectedWallet = wallet.connect(provider);


// 定义转账目标地址和金额
const batchtransferData = config.targets.map(target => ({
  address: target.address,
  amount: ethers.parseEther(target.amount.toString())
}));


async function sendEth(targets) {
    // 发送ETH转账交易
    for (let i = 0; i < targets.length; i++){
        const { address, amount} = targets[i];
        const tx = await connectedWallet.sendTransaction({
          address,
          value: ethers.parseEther(amount.toString())
        });
        console.log('ETH Transaction Hash:', tx.hash);
    }
  }

async function sendErc20(token, contract, targets) {
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

async function transferERC20(token) {
      const { address, abi, targets } = config.contracts[token];
  
      // 实例化ERC20智能合约
      const contract = new ethers.Contract(address, abi, connectedWallet);
  
      // 执行ERC20智能合约转账
      await sendErc20(contract, targets);
    }


async function transferETH() { 
      await sendEth(config.targets)
  }

async function transferERC20(token) {
    const tokeninfo = config.contracts.find(contract => contract.token === token);
    const address = tokeninfo.address;
    const abi = tokeninfo.abi;
    const contract = new ethers.Contract(address, abi, connectedWallet);
 
    await sendErc20(token, contract, config.targets)
}

//transferETH()
transferERC20('HSK')