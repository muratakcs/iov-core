import { ReadonlyDate } from "readonly-date";
import { IpPortString, TxBytes, TxHash, ValidatorPubkey, ValidatorSignature } from "./types";
export declare type Response = AbciInfoResponse | AbciQueryResponse | BlockResponse | BlockResultsResponse | BlockchainResponse | BroadcastTxAsyncResponse | BroadcastTxSyncResponse | BroadcastTxCommitResponse | CommitResponse | GenesisResponse | HealthResponse | StatusResponse | TxResponse | TxSearchResponse | ValidatorsResponse;
export interface AbciInfoResponse {
    readonly data?: string;
    readonly lastBlockHeight?: number;
    readonly lastBlockAppHash?: Uint8Array;
}
export interface AbciQueryResponse {
    readonly key: Uint8Array;
    readonly value: Uint8Array;
    readonly height?: number;
    readonly index?: number;
    readonly code?: number;
    readonly log?: string;
}
export interface BlockResponse {
    readonly blockMeta: BlockMeta;
    readonly block: Block;
}
export interface BlockResultsResponse {
    readonly height: number;
    readonly results: ReadonlyArray<TxData>;
    readonly endBlock: {
        readonly validatorUpdates: ReadonlyArray<Validator>;
        readonly consensusUpdates?: ConsensusParams;
        readonly tags?: ReadonlyArray<Tag>;
    };
}
export interface BlockchainResponse {
    readonly lastHeight: number;
    readonly blockMetas: ReadonlyArray<BlockMeta>;
}
/** No data in here because RPC method BroadcastTxAsync "returns right away, with no response" */
export interface BroadcastTxAsyncResponse {
}
export interface BroadcastTxSyncResponse extends TxData {
    readonly hash: TxHash;
}
/**
 * Returns true iff transaction made it sucessfully into the transaction pool
 */
export declare function broadcastTxSyncSuccess(res: BroadcastTxSyncResponse): boolean;
export interface BroadcastTxCommitResponse {
    readonly height?: number;
    readonly hash: TxHash;
    readonly checkTx: TxData;
    readonly deliverTx?: TxData;
}
/**
 * Returns true iff transaction made it sucessfully into a block
 * (i.e. sucess in `check_tx` and `deliver_tx` field)
 */
export declare function broadcastTxCommitSuccess(res: BroadcastTxCommitResponse): boolean;
export interface CommitResponse {
    readonly header: Header;
    readonly commit: Commit;
    readonly canonical: boolean;
}
export interface GenesisResponse {
    readonly genesisTime: ReadonlyDate;
    readonly chainId: string;
    readonly consensusParams: ConsensusParams;
    readonly validators: ReadonlyArray<Validator>;
    readonly appHash: Uint8Array;
    readonly appState: {} | undefined;
}
export declare type HealthResponse = null;
export interface StatusResponse {
    readonly nodeInfo: NodeInfo;
    readonly syncInfo: SyncInfo;
    readonly validatorInfo: Validator;
}
/**
 * A transaction from RPC calls like search.
 *
 * Try to keep this compatible to TxEvent
 */
export interface TxResponse {
    readonly tx: TxBytes;
    readonly hash: TxHash;
    readonly height: number;
    readonly index: number;
    readonly result: TxData;
    readonly proof?: TxProof;
}
export interface TxSearchResponse {
    readonly txs: ReadonlyArray<TxResponse>;
    readonly totalCount: number;
}
export interface ValidatorsResponse {
    readonly blockHeight: number;
    readonly results: ReadonlyArray<Validator>;
}
export interface NewBlockEvent extends Block {
}
export interface NewBlockHeaderEvent extends Header {
}
export interface TxEvent {
    readonly tx: TxBytes;
    readonly hash: TxHash;
    readonly height: number;
    readonly index: number;
    readonly result: TxData;
}
export declare const getTxEventHeight: (event: TxEvent) => number;
export declare const getHeaderEventHeight: (event: NewBlockHeaderEvent) => number;
export declare const getBlockEventHeight: (event: NewBlockEvent) => number;
export interface Tag {
    readonly key: Uint8Array;
    readonly value: Uint8Array;
}
export interface TxData {
    readonly code: number;
    readonly log?: string;
    readonly data?: Uint8Array;
    readonly tags?: ReadonlyArray<Tag>;
}
export interface TxProof {
    readonly data: Uint8Array;
    readonly rootHash: Uint8Array;
    readonly proof: {
        readonly total: number;
        readonly index: number;
        /** Optional because does not exist in Tendermint 0.25.x */
        readonly leafHash?: Uint8Array;
        readonly aunts: ReadonlyArray<Uint8Array>;
    };
}
export interface BlockMeta {
    readonly blockId: BlockId;
    readonly header: Header;
}
export interface BlockId {
    readonly hash: Uint8Array;
    readonly parts: {
        readonly total: number;
        readonly hash: Uint8Array;
    };
}
export interface Block {
    readonly header: Header;
    readonly lastCommit: Commit;
    readonly txs: ReadonlyArray<Uint8Array>;
    readonly evidence?: ReadonlyArray<Evidence>;
}
export interface Evidence {
    readonly type: string;
    readonly validator: Validator;
    readonly height: number;
    readonly time: number;
    readonly totalVotingPower: number;
}
export interface Commit {
    readonly blockId: BlockId;
    readonly precommits: ReadonlyArray<Vote>;
}
/**
 * raw values from https://github.com/tendermint/tendermint/blob/dfa9a9a30a666132425b29454e90a472aa579a48/types/vote.go#L44
 */
export declare enum VoteType {
    PREVOTE = 1,
    PRECOMMIT = 2
}
export interface Vote {
    readonly type: VoteType;
    readonly validatorAddress: Uint8Array;
    readonly validatorIndex: number;
    readonly height: number;
    readonly round: number;
    readonly timestamp: ReadonlyDate;
    readonly blockId: BlockId;
    readonly signature: ValidatorSignature;
}
export interface Header {
    readonly chainId: string;
    readonly height: number;
    readonly time: ReadonlyDate;
    readonly numTxs: number;
    readonly lastBlockId: BlockId;
    readonly totalTxs: number;
    readonly appHash: Uint8Array;
    readonly consensusHash: Uint8Array;
    /** empty when number of transaction is 0 */
    readonly dataHash: Uint8Array;
    /** this can be empty */
    readonly evidenceHash: Uint8Array;
    readonly lastCommitHash: Uint8Array;
    /** this can be empty */
    readonly lastResultsHash: Uint8Array;
    readonly validatorsHash: Uint8Array;
}
export interface NodeInfo {
    readonly id: Uint8Array;
    readonly listenAddr: IpPortString;
    readonly network: string;
    readonly version: string;
    readonly channels: string;
    readonly moniker: string;
    readonly other: Map<string, string>;
    /** Optional because this does not exist in Tendermint 0.25.x */
    readonly protocolVersion?: {
        readonly p2p: number;
        readonly block: number;
        readonly app: number;
    };
}
export interface SyncInfo {
    readonly latestBlockHash: Uint8Array;
    readonly latestAppHash: Uint8Array;
    readonly latestBlockHeight: number;
    readonly latestBlockTime: ReadonlyDate;
    readonly catchingUp: boolean;
}
export interface Validator {
    readonly address?: Uint8Array;
    readonly pubkey: ValidatorPubkey;
    readonly votingPower: number;
    readonly accum?: number;
    readonly name?: string;
}
export interface ConsensusParams {
    readonly blockSize: BlockSizeParams;
    readonly evidence: EvidenceParams;
}
export interface BlockSizeParams {
    readonly maxBytes: number;
    readonly maxGas: number;
}
export interface TxSizeParams {
    readonly maxBytes: number;
    readonly maxGas: number;
}
export interface BlockGossipParams {
    readonly blockPartSizeBytes: number;
}
export interface EvidenceParams {
    readonly maxAge: number;
}
