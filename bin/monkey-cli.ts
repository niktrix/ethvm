#!/usr/bin/env node

import * as rpc from '@enkrypt.io/json-rpc2'
import commander from 'commander'
import { simpleEncode } from 'ethereumjs-abi'
import EthereumTx from 'ethereumjs-tx'
import { bufferToHex, generateAddress, toBuffer } from 'ethereumjs-util'
import Ora from 'ora'
import * as utils from 'web3-utils'
import data from './accounts.json'

const { accounts, tokencontract, from } = data

const version = '1.0.0'

const ora = new Ora({
  color: 'yellow'
})
const r = rpc.Client.$create(8545, 'localhost')

interface Txp {
  from: string
  to: string
  nonce?: string
  gas?: string
  data?: any
  gasPrice?: string
  value?: string
}

interface Result {
  res: string
  contractAddress: string
}

const txParams = {
  from: from.address,
  to: '0x53d5f815e1ffb43297cdDf1E4C94950ae464c912',
  nonce: '0x00',
  gas: '0x7B0C',
  data: null,
  gasPrice: '0x430E23400',
  value: '0x1'
}

commander.description('Ethereum utility that helps to create random txs to aid in development').version(version, '-v, --version')

function send(txP: Txp, privateKey: Buffer): Promise<Result> {
  return new Promise((resolve, reject) => {
    r.call(
      'eth_getTransactionCount',
      [txP.from, 'pending'],
      (e: Error, res: any): void => {
        const nonce = parseInt(res)
        txP.nonce = '0x' + nonce.toString(16)
        const ca = generateAddress(toBuffer(txP.from), toBuffer(txP.nonce))
        const tx = new EthereumTx(txP)
        tx.sign(privateKey)
        const serializedTx = '0x' + tx.serialize().toString('hex')
        ora.info(`Tx:  Value: ${txP.value}  To: ${txP.to} From: ${txP.from} GAS: ${txP.gas}  Nonce:  ${txP.nonce} `)
        r.call(
          'eth_sendRawTransaction',
          [serializedTx],
          (err: Error, r: any): void => {
            if (err) {
              reject(err)
              return
            }
            resolve({ res: r, contractAddress: bufferToHex(ca) })
          }
        )
      }
    )
  })
}

function estimateGas(txParams: Txp): Promise<any> {
  txParams.nonce = ''
  return new Promise((resolve, reject) => {
    r.call(
      'eth_estimateGas',
      [{ txParams }],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve({ res })
      }
    )
  })
}

function txpoolStatus(): Promise<any> {
  return new Promise((resolve, reject) => {
    r.call(
      'txpool_status',
      ['pending'],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve({ res })
      }
    )
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function keepfilling(txParams: Txp, contractAddress: string, runcontractTxs: boolean) {
  let res: any
  while (true) {
    try {
      res = await txpoolStatus()
      ora.warn(`Pending transactions in txpool: ${JSON.stringify(utils.hexToNumber(res.res.pending))}`)
      // Max txpool pending is 223
      if (utils.hexToNumber(res.res.pending) >= 223) {
        ora.info('Txpool is full wait ')
        try {
          await sleep(3000)
        } catch (s) {
          ora.warn(`Error while sleeping: ${JSON.stringify(s)}`)
        }
      }
    } catch (e) {
      ora.warn(`Error while getting txpool status: ${JSON.stringify(e)}`)
    }

    txParams.from = from.address

    await fillAccountsWithEther(txParams)
    if (runcontractTxs) {
      await contractTxs(txParams, contractAddress)
    }
  }
}

async function fillAccountsWithEther(txParams: Txp): Promise<any> {
  let gp = '0x7B0C'
  for (const account of accounts) {
    txParams.to = account.address
    txParams.value = '0x2000000000000000'
    const privateKey = Buffer.from(from.key, 'hex')
    try {
      const r = await estimateGas(txParams)
      gp = r.res
    } catch (e) {
      gp = '0x7B0C'
      ora.warn(`Error getting gas: ${JSON.stringify(e)} `)
    }
    txParams.gas = gp
    try {
      const done = await send(txParams, privateKey)
      ora.info(`Tx hash: ${JSON.stringify(done.res)}`)
    } catch (error) {
      ora.fail(JSON.stringify(error))
    }
  }

  ora.succeed('Filled accounts with ether')
  ora.stopAndPersist()

  return Promise.resolve()
}

async function sendRandomTX(txParams: Txp, iter: number = 10): Promise<any> {
  let sent = 0
  let i = 0
  while (i < iter) {
    const to = Math.floor(Math.random() * (accounts.length - 1))
    const from = Math.floor(Math.random() * (accounts.length - 1))

    // Double check we're not sending to the same address
    if (from === to) {
      continue
    }

    const privateKey = Buffer.from(accounts[from].key, 'hex')
    txParams.to = accounts[to].address
    txParams.from = accounts[from].address

    try {
      ora.info(`Sending tx to: ${JSON.stringify(txParams.to)}`)
      const done = await send(txParams, privateKey)
      ora.info(`Tx hash: ${JSON.stringify(done.res)}`)
    } catch (error) {
      ora.fail(JSON.stringify(error))
    }

    i++
    sent++
  }

  ora.info(`Random txs sent: ${sent}`)
  ora.stopAndPersist()

  return Promise.resolve()
}

async function fillAndSend(txParams: Txp, amount: number = 10): Promise<any> {
  const balance = await checkBalance(txParams.from)
  ora.info(`Balance ${utils.fromWei(balance)}`)

  if (parseInt(balance, 16) < utils.toWei('1')) {
    ora.warn(`Not enough balance in account: ${txParams.from}`)
    return Promise.reject()
  }

  await sendRandomTX(txParams, amount)
  return Promise.resolve()
}

async function deployContract(txParams: Txp): Promise<Result> {
  // change from of deploy and sendcontractTx
  const privateKey = Buffer.from('d069c15e0df2e63ee62342c5c1983cb0c4ea50a915fceeaaeacf0865f63424be', 'hex')
  txParams.to = ''
  txParams.value = ''
  txParams.from = '0x9319b0835c2DB1a31E067b5667B1e9b0AD278215'
  txParams.data = tokencontract.data
  txParams.gas = '0x47B760'
  return send(txParams, privateKey)
}

async function contractTxs(txParams: Txp, address: string): Promise<any> {
  const privateKey = Buffer.from('d069c15e0df2e63ee62342c5c1983cb0c4ea50a915fceeaaeacf0865f63424be', 'hex')
  txParams.to = ''
  txParams.value = ''
  txParams.from = '0x9319b0835c2DB1a31E067b5667B1e9b0AD278215'
  txParams.data = tokencontract.data
  txParams.gas = '0x47B760'
  txParams.to = address
  try {
    await sleep(3000)
  } catch (s) {
    ora.warn(`Error while sleeping: ${JSON.stringify(s)}`)
  }

  // send token to all accounts
  for (const account of accounts) {
    let gas: string = ''

    txParams.data = bufferToHex(simpleEncode('transfer(address,uint256):(bool)', account.address, 6000))

    try {
      const r = await estimateGas(txParams)
      gas = r.res
    } catch (e) {
      gas = '0x7B0C'
      ora.warn(`Error getting gas: ${JSON.stringify(e)} `)
    }
    txParams.gas = gas
    try {
      ora.info(`Calling transfer of contract address: ${JSON.stringify(txParams.to)}`)
      const done = await send(txParams, privateKey)
      ora.info(`Tx hash: ${JSON.stringify(done.res)}`)
    } catch (error) {
      ora.fail(JSON.stringify(error))
      return Promise.reject(error)
    }
  }

  return Promise.resolve()
}

async function checkBalance(addr): Promise<any> {
  return new Promise((resolve, reject) => {
    r.call(
      'eth_getBalance',
      [addr, 'latest'],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve(res)
      }
    )
  })
}

async function txDetails(txhash): Promise<any> {
  return new Promise((resolve, reject) => {
    r.call(
      'eth_getTransactionByHash',
      [txhash],
      (e: Error, res: any): void => {
        if (e) {
          reject(e)
          return
        }
        resolve(res)
      }
    )
  })
}

commander
  .command('random')
  .alias('r')
  .option('-n, --number <amount>', 'amount of random txs')
  .action(options => {
    ora.info('Randomizing txs...').start()
    fillAndSend(txParams, options.number || 10)
  })

commander
  .command('start')
  .option('-a, --address <contract address>', 'contract address')
  .alias('s')
  .action(options => {
    let contractAddress: string = ''
    let runcontractTxs: boolean = false

    if (options.address) {
      runcontractTxs = true
      contractAddress = options.address || false
      if (contractAddress) {
        if (!utils.isAddress(contractAddress)) {
          ora.fail(`${JSON.stringify(contractAddress)} is not a valid address`)
          return
        }
      }
    }

    ora.info('Filling accounts with ether...').start()
    keepfilling(txParams, contractAddress, runcontractTxs)
  })

commander
  .command('deploy')
  .alias('d')
  .action(() => {
    ora.info('Deploying token contract...').start()
    deployContract(txParams).then(
      (value: Result): void => {
        ora.info(`Deploying contract... tx hash: ${JSON.stringify(value.res)}`)
        ora.info(`yarn monkey txdetail <txhash>`)
      }
    )
  })

commander
  .command('txdetail')
  .alias('tx')
  .action(tx => {
    ora.info('Getting TX details...').start()
    txDetails(tx)
      .then(
        (detail): void => {
          if (detail.blockNumber == null) {
            ora.info(`Wait let contract TX is get confirmed `)
          } else {
            const ca = generateAddress(toBuffer(detail.from), toBuffer(detail.nonce))
            ora.succeed(`Contract deployed, address is: ${JSON.stringify(bufferToHex(ca))}`)
            ora.info(`yarn monkey start  ${JSON.stringify(bufferToHex(ca))}`)
          }
        }
      )
      .catch(err => {
        ora.fail(`Error while getting txdetail: ${JSON.stringify(err)}`)
      })
  })

commander
  .command('balance')
  .alias('b')
  .action(address => {
    ora.info(`Obtaining balance of address: ${address}`)
    r.call(
      'eth_getBalance',
      [address, 'latest'],
      (e: Error, res: any): void => {
        if (e) {
          ora.clear()
          ora.fail(JSON.stringify(e))
          ora.stopAndPersist()
          return
        }
        ora.clear()
        ora.succeed(`Current balance: ${utils.fromWei(res, 'ether')} ether`)
        ora.stopAndPersist()
      }
    )
  })

commander.parse(process.argv)
