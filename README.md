# transfer-script

## batch transfer with smart contract

### 1. batch transfer ETH

确保合约地址有足够的 ERC20 和 ETH

合约地址：0x53B99e66a655A9e5953fF19Ffa248154e7e9765b


PRIVATE_KEY=0x00 SEPOLIA_NODE=https://xxx node erc20_call.js

PRIVATE_KEY=0x00 SEPOLIA_NODE=https://xxx node eth_call.js

### 2. batch transfer Tron

PRIVATE_KEY=0x00 node trc20_batch.js

PRIVATE_KEY=0x00 node trx_batch.js

### 3. batch transfer ARB

确保合约地址有足够的 ERC20 和 ETH

合约地址：0x0e52Dc5349EE5da0645Cd340604251cDCb34ce4c

PRIVATE_KEY=0x00 ARB_NODE=https://xxx node arb_erc20_call.js

PRIVATE_KEY=0x00 SEPOLIA_NODE=https://xxx node arb_eth_call.js