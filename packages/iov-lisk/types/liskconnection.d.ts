import { Stream } from "xstream";
import { Account, AccountQuery, AddressQuery, BlockchainConnection, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Fee, Nonce, PostableBytes, PostTxResponse, PubkeyQuery, Token, TokenTicker, TransactionQuery, UnsignedTransaction } from "@iov/bcp";
/**
 * Encodes the current date and time as a nonce
 */
export declare function generateNonce(): Nonce;
export declare class LiskConnection implements BlockchainConnection {
    static establish(baseUrl: string): Promise<LiskConnection>;
    private readonly baseUrl;
    private readonly myChainId;
    constructor(baseUrl: string, chainId: ChainId);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(bytes: PostableBytes): Promise<PostTxResponse>;
    getToken(searchTicker: TokenTicker): Promise<Token | undefined>;
    getAllTokens(): Promise<ReadonlyArray<Token>>;
    getAccount(query: AccountQuery): Promise<Account | undefined>;
    getNonce(_: AddressQuery | PubkeyQuery): Promise<Nonce>;
    getNonces(_: AddressQuery | PubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>>;
    watchAccount(query: AccountQuery): Stream<Account | undefined>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    searchTx(query: TransactionQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: TransactionQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    liveTx(query: TransactionQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    getFeeQuote(tx: UnsignedTransaction): Promise<Fee>;
    withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T>;
    private waitForTransaction;
    private searchTransactions;
}
