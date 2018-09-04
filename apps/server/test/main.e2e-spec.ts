import config from '@app/config'
import { RethinkDbStreamer, Streamer } from '@app/server/core/streams'
import { EthVMServer } from '@app/server/ethvm-server'
import { BlocksService, Block,BlocksServiceImpl, RethinkBlockRepository } from '@app/server/modules/blocks'
import { ChartService, ChartsServiceImpl } from '@app/server/modules/charts'
import { ExchangeService, MockExchangeServiceImpl } from '@app/server/modules/exchanges'
import { Tx, TxsRepository, TxsService, TxsServiceImpl, RethinkTxsRepository } from '@app/server/modules/txs'
import { VmService } from '@app/server/modules/vm'
import { RedisCacheRepository } from '@app/server/repositories'
import { expect } from 'chai'
import * as io from 'socket.io-client'
import { mock, when } from 'ts-mockito'
import * as r from 'rethinkdb'


// Increase Jest timeout for safety
jest.setTimeout(10000)



class VmServiceImpl implements VmService {
  public setStateRoot(hash: Buffer): Promise<boolean> {
    return Promise.resolve(true)
  }
  public getCurrentStateRoot(): Promise<Buffer> {
    return Promise.resolve(Buffer.from(''))
  }
  public getAccount(): Promise<any> {
    return Promise.resolve(Buffer.from(''))
  }
  public getBalance(address: string): Promise<any> {
    return Promise.resolve(10)
  }
  public getTokensBalance(address: string): Promise<any> {
    return Promise.resolve(Buffer.from(''))
  }
  public call(args: any): Promise<any> {
    return Promise.resolve(Buffer.from(''))
  }
}



function callEvent(ev, payload, client): Promise<any> {
  return new Promise((resolve, reject) => {
    client.emit(ev, payload, (err, d) => {
      if (err) {
        reject(err)
        return
      }
      resolve(d)
    })
  })
}

describe('ethvm-server-events', () => {
  let server: EthVMServer
  let client: any

  beforeAll(async () => {
    // Create mocks

    const ds = mock(RedisCacheRepository)

    const rethinkOpts = {
      host: config.get('rethink_db.host'),
      port: config.get('rethink_db.port'),
      db: config.get('rethink_db.db_name'),
      user: config.get('rethink_db.user'),
      password: config.get('rethink_db.password'),
      ssl: {
        cert: config.get('rethink_db.cert_raw')
      }
    }

    if (!rethinkOpts.ssl.cert) {
      delete rethinkOpts.ssl
    }
    const rConn = await r.connect(rethinkOpts)

    // Blocks
  const blocksRepository = new RethinkBlockRepository(rConn, rethinkOpts)
  const blockService = new BlocksServiceImpl(blocksRepository, ds)

  // Txs
  const txsRepository = new RethinkTxsRepository(rConn, rethinkOpts)
  const txsService = new TxsServiceImpl(txsRepository, ds)



    const chartsService: ChartService = mock(ChartsServiceImpl)
    const exchangeService: ExchangeService = new MockExchangeServiceImpl()
    const vmService: VmService = new VmServiceImpl()
    const streamer: Streamer = mock(RethinkDbStreamer)


    client = io.connect(`http://${config.get('server.host')}:${config.get('server.port')}`)

    // Create server
    server = new EthVMServer(blockService, txsService, chartsService, exchangeService, vmService, streamer, ds, 1)
    await server.start()
  })

  afterAll(async () => {
    await server.stop()
    client.stop()
  })

  describe('getTxsEvent', () => {
    it('should return Promise<Tx[]>', async () => {
      const inputs = [
        {
          address: '0xd9ea042ad059033ba3c3be79f4081244f183bf03',
          limit: 0,
          page: 0
        }
      ]

      for (const input of inputs) {
        const data = await callEvent('getTxs', input, client)
        expect(data).to.have.lengthOf(0)
      }
    })

    it('should return err ', async () => {
      const inputs = [
        '',
        '0x',
        '0x0',
        10,
        {},
        {
          address: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238'
        },
        {
          address: '0xd9ea042ad059033ba3c3be79f4081244f183bf03',
          limit: '1',
          page: 1
        },
        {
          number: 1
        }
      ]

      for (const  input of  inputs) {
        try {
          const data = await callEvent('getTxs', input, client)
        } catch (e) {
          expect(e).to.not.be.undefined
        }
      }
    })
  })

  describe('getBalance', () => {
    it('should return Promise<string>', async () => {
      const inputs = [
        {
          address: '0xd9ea042ad059033ba3c3be79f4081244f183bf03'
        }
      ]

      for (const input of inputs) {
        const data = await callEvent('getBalance', input, client)
        expect(data).to.equal(10)
      }
    })

    it('should return err ', async () => {
      const inputs = [
        '',
        '0x',
        '0x0',
        10,
        {},
        {
          address: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238'
        },
        {
          address: '0xd9ea042ad059033ba3c3be79f4081244f183bf03',
          limit: '1',
          page: 1
        },
        {
          number: 1
        }
      ]

      for (  const input of inputs ) {
        try {
          const data = await callEvent('getBalance', input, client)
        } catch (e) {
          expect(e).to.not.be.undefined
        }
      }
    })
  })

  // describe('getBlockTransactions', () => {
  //   it('should return Promise<Tx[]>', async () => {
  //     const inputs = [
  //       {
  //         hash: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238',
  //         limit: 1,
  //         page: 1
  //       }
  //     ]

  //     for (const input of inputs) {
  //       const data = await callEvent('getBlockTransactions', input, client)
  //       expect(data).to.have.lengthOf(2)
  //     }
  //   })

  //   it('should return err ', async () => {
  //     const inputs = [
  //       '',
  //       '0x',
  //       '0x0',
  //       10,
  //       {},
  //       {
  //         address: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238'
  //       },
  //       {
  //         address: '0xd9ea042ad059033ba3c3be79f4081244f183bf03',
  //         limit: '1',
  //         page: 1
  //       },
  //       {
  //         number: 1
  //       }
  //     ]

  //     for (const input of inputs) {
  //       try {
  //         const data = await callEvent('getBlockTransactions', input, client)
  //       } catch (e) {
  //         expect(e).to.not.be.undefined
  //       }
  //     }
  //   })
  // })

  describe('getBlock', () => {
    it('should return Promise<Block>', async () => {
      const inputs = [
        {
          hash: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238'
        }
      ]

      for (const input of inputs) {
        const data = await callEvent('getBlock', input, client)
        expect(data).to.be.not.undefined
      }
    })

    it('should return err ', async () => {
      const inputs = [
        '',
        '0x',
        '0x0',
        10,
        {},
        {
          address: '0xb903239f8543d04b5dc1ba6579132b143087c68db1b2168786408fcbce568238'
        },
        {
          address: '0xd9ea042ad059033ba3c3be79f4081244f183bf03',
          limit: '1',
          page: 1
        },
        {
          number: 1
        }
      ]

      for (const input of inputs) {
        try {
          const data = await callEvent('getBlock', input, client)
        } catch (e) {
          expect(e).to.not.be.undefined
        }
      }
    })
  })
})

