const config = require('./config.arb.json');
const ethBasic = require('./ethBasic');

const eth = new ethBasic(config)

const token = process.argv[2]
eth.transfer(token)