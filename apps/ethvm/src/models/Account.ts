import { common } from '@app/helpers'
import { Address, EthValue, Hash, Hex, HexNumber, HexTime, Tx } from '@app/models'
import { Account as AccountLayout } from 'ethvm-common'

export class Account {
  public readonly id: string
  private readonly address: AccountLayout
  private cache: any

  constructor(address: AccountLayout) {
    this.cache = {}
    this.address = address
    this.id = address.address
  }

  public getBalance() {
    if (!this.cache.balance) {
      this.cache.balance = this.address.balance
    }
    return this.cache.balance
  }

  public getHexAddress() {
    if (!this.cache.hexAddress) {
      this.cache.hexAddress = '0x'+this.address
    }
    return this.cache.hexAddress
  }
}
