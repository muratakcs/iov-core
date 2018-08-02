import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { KeyringEntry, KeyringEntryImplementationIdString, KeyringEntrySerializationString, LocalIdentity, PublicIdentity, ValueAndUpdates } from "@iov/keycontrol";
import { ChainId, SignatureBytes } from "@iov/tendermint-types";
export declare class LedgerKeyringEntry implements KeyringEntry {
    private static identityId;
    readonly label: ValueAndUpdates<string | undefined>;
    readonly canSign: ValueAndUpdates<boolean>;
    readonly implementationId: KeyringEntryImplementationIdString;
    private readonly labelProducer;
    private readonly identities;
    private readonly simpleAddressIndices;
    constructor();
    setLabel(label: string | undefined): void;
    createIdentity(): Promise<LocalIdentity>;
    setIdentityLabel(identity: PublicIdentity, label: string | undefined): void;
    getIdentities(): ReadonlyArray<LocalIdentity>;
    createTransactionSignature(identity: PublicIdentity, transactionBytes: SignableBytes, prehashType: PrehashType, _: ChainId): Promise<SignatureBytes>;
    serialize(): KeyringEntrySerializationString;
    clone(): KeyringEntry;
    private simpleAddressIndex;
}
