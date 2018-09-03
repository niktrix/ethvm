import * as r from 'rethinkdb'
import commander from 'commander'
import Ora from 'ora'


const version = '1.0.0'

const ora = new Ora({
  color: 'yellow'
})

const tx1 = {
  blockHash: Buffer.from(''),
  blockNumber: 2,
  contractAddress: null,
  cumulativeGasUsed: Buffer.from(''),
  from: Buffer.from(''),
  fromBalance: Buffer.from('78'),
  gas: Buffer.from('78'),
  gasPrice: Buffer.from('7'),
  gasUsed: Buffer.from('9'),
  hash: '0xff7ac9e368c483f73d34595780cdee65e8d44c40c26ff8bd3ce53c48035a863e',
  input: Buffer.from(''),
  logsBloom: null,
  nonce: Buffer.from(''),
  pending: true,
  r: Buffer.from(''),
  to: Buffer.from(''),
  toBalance: Buffer.from(''),
  transactionIndex: Buffer.from(''),
  v: Buffer.from(''),
  value: Buffer.from(''),
  status: true,
 timestamp: Buffer.from('')
}


commander
  .command('data')
  .alias('d')
  .action(() => {
	  
r.connect({ host: 'localhost', port: 28015, db: "eth_mainnet" }, function (err, conn) {
    if (err) console.log("err", err);
    connection = conn;
    r.table("transactions").insert(tx1).run(connection,function(err,cursor){
        console.log(err,cursor);
})
	  
	  
 
  })

commander.parse(process.argv)


