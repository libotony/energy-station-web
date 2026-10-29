import { useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
    VeChainKitProvider,
    WalletButton,
    useDAppKitWallet,
    useWallet
} from '@vechain/vechain-kit'
import { store } from '../store'
import { walletNetwork } from './network'
import { createWalletService } from './service'

export const walletService = createWalletService(address => store.setLinkedAddrAction(address))

function WalletControl() {
    const { account, connection } = useWallet()
    const { requestTransaction } = useDAppKitWallet()
    const address = connection.isConnectedWithDappKit ? account?.address : undefined

    useLayoutEffect(() => {
        walletService.update(address ? { address, requestTransaction } : undefined)
    }, [address, requestTransaction])

    useLayoutEffect(() => () => walletService.update(), [])

    return <WalletButton label="Link Account" buttonStyle={{ size: 'sm' }} />
}

export function mountWallet(element: HTMLElement) {
    const root = createRoot(element)
    root.render(
        <VeChainKitProvider
            network={walletNetwork}
            dappKit={{
                allowedWallets: ['veworld', 'sync2'],
                usePersistence: true
            }}
            loginMethods={[
                { method: 'veworld', gridColumn: 4 },
                { method: 'sync2', gridColumn: 4 }
            ]}
            hiddenQuickActions={['send', 'swap', 'receive']}
        >
            <WalletControl />
        </VeChainKitProvider>
    )
    return () => root.unmount()
}
