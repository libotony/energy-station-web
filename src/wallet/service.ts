export interface WalletClause {
    to: string | null;
    value: string;
    data: string;
    comment?: string;
}

export interface WalletTransactionOptions {
    signer: string;
    comment: string;
    link: string;
}

export interface WalletSession {
    address: string;
    requestTransaction: (
        clauses: WalletClause[],
        options: WalletTransactionOptions
    ) => Promise<{ txid: string }>;
}

export function createWalletService(onAddressChange: (address: string) => void) {
    let session: WalletSession | undefined
    let pending = false

    return {
        update(next?: WalletSession) {
            session = next
            onAddressChange(next ? next.address : '')
        },
        async sendTransaction(clauses: WalletClause[], comment: string, link: string, expectedAddress: string) {
            if (!session || !expectedAddress) {
                throw new Error('You need to connect your wallet using Link Account before converting.')
            }
            if (session.address.toLowerCase() !== expectedAddress.toLowerCase()) {
                throw new Error('Your wallet changed. You need to review the conversion and try again.')
            }
            if (pending) {
                throw new Error('You need to finish the pending wallet request first.')
            }

            pending = true
            try {
                return await session.requestTransaction(clauses, {
                    signer: session.address,
                    comment,
                    link
                })
            } finally {
                pending = false
            }
        }
    }
}
