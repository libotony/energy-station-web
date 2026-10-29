import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createWalletService, WalletSession } from '../src/wallet/service'

const firstAddress = '0x1111111111111111111111111111111111111111'
const secondAddress = '0x2222222222222222222222222222222222222222'
const clauses = [{ to: secondAddress, value: '0', data: '0x', comment: 'Convert' }]
const link = 'https://example.com/#/tx-callback/{txid}'

function session(address = firstAddress): WalletSession {
    return { address, requestTransaction: async () => ({ txid: '0x1234' }) }
}

test('connection, account switching and disconnect update the Vue address', () => {
    const addresses: string[] = []
    const wallet = createWalletService(address => addresses.push(address))
    wallet.update(session())
    wallet.update(session(secondAddress))
    wallet.update()
    assert.deepEqual(addresses, [firstAddress, secondAddress, ''])
})

test('disconnected wallets cannot submit transactions', async () => {
    const wallet = createWalletService(() => {})
    await assert.rejects(wallet.sendTransaction(clauses, 'Convert', link, ''), /connect your wallet/)
    wallet.update(session())
    wallet.update()
    await assert.rejects(wallet.sendTransaction(clauses, 'Convert', link, firstAddress), /connect your wallet/)
})

test('changed accounts cannot submit a conversion reviewed for another account', async () => {
    const wallet = createWalletService(() => {})
    wallet.update({
        address: secondAddress,
        requestTransaction: async () => assert.fail('Must not request a signature')
    })
    await assert.rejects(wallet.sendTransaction(clauses, 'Convert', link, firstAddress), /wallet changed/)
})

test('the Kit wallet receives the active signer, clauses, comment and callback link', async () => {
    const wallet = createWalletService(() => {})
    wallet.update({
        address: firstAddress,
        requestTransaction: async (message, options) => {
            assert.deepEqual(message, clauses)
            assert.deepEqual(options, { signer: firstAddress, comment: 'Convert', link })
            return { txid: '0x1234' }
        }
    })
    assert.deepEqual(await wallet.sendTransaction(clauses, 'Convert', link, firstAddress), { txid: '0x1234' })
})

test('wallet rejection reaches the UI and permits a fresh attempt', async () => {
    const wallet = createWalletService(() => {})
    const rejection = new Error('User rejected the transaction')
    wallet.update({ address: firstAddress, requestTransaction: async () => { throw rejection } })
    await assert.rejects(wallet.sendTransaction(clauses, 'Convert', link, firstAddress), error => error === rejection)
    wallet.update(session())
    assert.deepEqual(await wallet.sendTransaction(clauses, 'Convert', link, firstAddress), { txid: '0x1234' })
})

test('concurrent requests cannot trigger a second signing prompt', async () => {
    const wallet = createWalletService(() => {})
    let finish!: (value: { txid: string }) => void
    wallet.update({
        address: firstAddress,
        requestTransaction: () => new Promise(resolve => { finish = resolve })
    })
    const pending = wallet.sendTransaction(clauses, 'Convert', link, firstAddress)
    await assert.rejects(wallet.sendTransaction(clauses, 'Convert', link, firstAddress), /pending wallet request/)
    finish({ txid: '0x1234' })
    await pending
    wallet.update(session())
    assert.deepEqual(await wallet.sendTransaction(clauses, 'Convert', link, firstAddress), { txid: '0x1234' })
})
