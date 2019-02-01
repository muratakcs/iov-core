import { Address, AtomicSwapQuery, BcpQueryTag } from "@iov/bcp-types";
export declare function bnsNonceTag(addr: Address): BcpQueryTag;
export declare function bnsSwapQueryTags(query: AtomicSwapQuery, set?: boolean): BcpQueryTag;
