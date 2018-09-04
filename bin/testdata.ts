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

const tx2 = {
  blockHash: Buffer.from('0x983e535f45911199e74bec284b258b643392855eeb27e812aae902d149061dd7'),
  blockNumber: 3,
  contractAddress: null,
  cumulativeGasUsed: Buffer.from(''),
  from: Buffer.from(''),
  fromBalance: Buffer.from(''),
  gas: Buffer.from(''),
  gasPrice: Buffer.from(''),
  gasUsed: Buffer.from(''),
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

const blockStat = {
  blockTime: '',
  failed: '',
  success: '',
  avgGasPrice: '',
  avgTxFees: '',
  pendingTxs: 8
}

const block1 = {
  number: 2,
  hash: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238',
  parentHash: Buffer.from('0xb903239f8543d04b5dc1ba6519132b143087c68db1b2168786408fcbce568238'),
  miner: Buffer.from('0xd9ea042ad059033ba3c3be79f4081244f183bf03'),
  timestamp: Buffer.from(''),
  // transactions: [tx1, tx2],
  transactionHashes: [
    '0xff7ac9e368c483f73d34595780cdee65e8d44c40c26ff8bd3ce53c48035a863e',
    '0xff7ac9e368c483f73d34595780cdee65e8d44c40c26ff8bd3ce53c48035a863e'
  ],
  transactionCount: 2,
  isUncle: false
  // blockStats: blockStat
}

const block2 = {
  number: 2,
  hash: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238',
  parentHash: Buffer.from('0xb903239f8543d04b5dc1ba6519132b143087c68db1b2168786408fcbce568238'),
  miner: Buffer.from('0xd9ea042ad059033ba3c3be79f4081244f183bf03'),
  timestamp: Buffer.from(''),
  //transactions: [tx1, tx2],
  transactionHashes: [
    '0xff7ac9e368c483f73d34595780cdee65e8d44c40c26ff8bd3ce53c48035a863e',
    '0xff7ac9e368c483f73d34595780cdee65e8d44c40c26ff8bd3ce53c48035a863e'
  ],
  transactionCount: 2,
  isUncle: false
  // blockStats: blockStat
}

commander
  .command('data')
  .alias('d')
  .action(() => {
    ora.info('----------')
    r.connect(
      { host: 'localhost', port: 28015 },
      function(err, conn) {
        if (err) {
          console.log('err', err)
          ora.info(`Error Connecting database `)
        }
// TODO resolve this callback hell
        r.dbCreate('eth_mainnet').run(conn, function(err, cursor) {
          ora.info(`err creating db ${JSON.stringify(err)}`)
          r.db('eth_mainnet')
            .tableCreate('transactions')
            .run(conn, function(err, cursor) {
              ora.info(`err creating tables ${JSON.stringify(err)}`)
              r.db('eth_mainnet')
                .table('transactions')
                .insert([tx1, tx2])
                .run(conn, function(err, cursor) {
                  ora.info(`err inserting -- tx ${JSON.stringify(err)}`)
                  r.db('eth_mainnet')
                    .tableCreate('blocks')
                    .run(conn, function(err, cursor) {
                      ora.info(`err creating block tables ${JSON.stringify(err)}`)
                      r.db('eth_mainnet')
                        .table('blocks')
                        .insert([block1, block2])
                        .run(conn, function(err, cursor) {
                          ora.info(`err inserting block  ${JSON.stringify(err)}`)
                          process.exit(0)
                        })
                    })
                })
            })
        })
      }
    )
  })

commander.parse(process.argv)
