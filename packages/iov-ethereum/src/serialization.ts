import BN = require("bn.js");

import { Address, isSendTransaction, Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

import { Abi } from "./abi";
import { isValidAddress } from "./address";
import { BlknumForkState, Eip155ChainId, eip155V, toRlp } from "./encoding";
import { encodeQuantity, encodeQuantityString, fromBcpChainId, normalizeHex } from "./utils";

const { fromHex } = Encoding;

export class Serialization {
  public static serializeGenericTransaction(
    nonce: Nonce,
    gasPriceHex: string,
    gasLimitHex: string,
    recipient: Address,
    value: string,
    data: Uint8Array,
    v: string,
    r?: Uint8Array,
    s?: Uint8Array,
  ): Uint8Array {
    if (!isValidAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    // Last 3 items are v, r and s values. Are present to encode full structure.
    return toRlp([
      Serialization.encodeNonce(nonce),
      fromHex(normalizeHex(gasPriceHex)),
      fromHex(normalizeHex(gasLimitHex)),
      fromHex(normalizeHex(recipient)),
      Serialization.encodeValue(value),
      data,
      fromHex(normalizeHex(v)),
      r || new Uint8Array([]),
      s || new Uint8Array([]),
    ]);
  }

  public static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array {
    if (isSendTransaction(unsigned)) {
      const chainIdHex = encodeQuantity(fromBcpChainId(unsigned.creator.chainId));
      if (!unsigned.fee || !unsigned.fee.gasPrice) {
        throw new Error("fee.gasPrice must be set");
      }
      const gasPriceHex = encodeQuantityString(unsigned.fee.gasPrice.quantity);
      if (!unsigned.fee.gasLimit) {
        throw new Error("fee.gasLimit must be set");
      }
      const gasLimitHex = encodeQuantityString(unsigned.fee.gasLimit.quantity);

      if (!isValidAddress(unsigned.recipient)) {
        throw new Error("Invalid recipient address");
      }

      if (unsigned.contractAddress) {
        if (unsigned.memo) {
          throw new Error("Memo cannot be serialized in a smart contract based token transfer.");
        }

        // we assume that all send transactions with contract address set are ERC20 compatible

        const erc20TransferCall = new Uint8Array([
          ...Abi.calculateMethodId("transfer(address,uint256)"),
          ...Abi.encodeAddress(unsigned.recipient),
          ...Abi.encodeUint256(unsigned.amount.quantity),
        ]);

        return Serialization.serializeGenericTransaction(
          nonce,
          gasPriceHex,
          gasLimitHex,
          unsigned.contractAddress,
          "0", // ETH value
          erc20TransferCall,
          chainIdHex,
        );
      } else {
        // native ETH send
        const memoData = unsigned.memo ? Encoding.toUtf8(unsigned.memo) : new Uint8Array([]);
        return Serialization.serializeGenericTransaction(
          nonce,
          gasPriceHex,
          gasLimitHex,
          unsigned.recipient,
          unsigned.amount.quantity,
          memoData,
          chainIdHex,
        );
      }
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  public static serializeSignedTransaction(signed: SignedTransaction): Uint8Array {
    const unsigned = signed.transaction;

    if (isSendTransaction(unsigned)) {
      if (!unsigned.fee || !unsigned.fee.gasPrice) {
        throw new Error("fee.gasPrice must be set");
      }
      const gasPriceHex = encodeQuantityString(unsigned.fee.gasPrice.quantity);
      if (!unsigned.fee.gasLimit) {
        throw new Error("fee.gasLimit must be set");
      }
      const gasLimitHex = encodeQuantityString(unsigned.fee.gasLimit.quantity);

      if (!isValidAddress(unsigned.recipient)) {
        throw new Error("Invalid recipient address");
      }

      const sig = ExtendedSecp256k1Signature.fromFixedLength(signed.primarySignature.signature);
      const r = sig.r();
      const s = sig.s();
      const chainId = fromBcpChainId(unsigned.creator.chainId);
      const chain: Eip155ChainId =
        chainId > 0
          ? { forkState: BlknumForkState.Forked, chainId: chainId }
          : { forkState: BlknumForkState.Before };
      const v = eip155V(chain, sig.recovery);

      if (unsigned.contractAddress) {
        if (unsigned.memo) {
          throw new Error("Memo cannot be serialized in a smart contract based token transfer.");
        }

        const erc20TransferCall = new Uint8Array([
          ...Abi.calculateMethodId("transfer(address,uint256)"),
          ...Abi.encodeAddress(unsigned.recipient),
          ...Abi.encodeUint256(unsigned.amount.quantity),
        ]);

        return Serialization.serializeGenericTransaction(
          signed.primarySignature.nonce,
          gasPriceHex,
          gasLimitHex,
          unsigned.contractAddress,
          "0", // ETH value
          erc20TransferCall,
          encodeQuantity(v),
          r,
          s,
        );
      } else {
        const data = Encoding.toUtf8(unsigned.memo || "");
        return Serialization.serializeGenericTransaction(
          signed.primarySignature.nonce,
          gasPriceHex,
          gasLimitHex,
          unsigned.recipient,
          unsigned.amount.quantity,
          data,
          encodeQuantity(v),
          r,
          s,
        );
      }
    } else {
      throw new Error("Unsupported kind of transaction");
    }
  }

  /**
   * Nonce 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeNonce(nonce: Nonce): Uint8Array {
    const checkedNonce = new Int53(nonce);

    if (checkedNonce.toNumber() === 0) {
      return new Uint8Array([]);
    } else {
      return fromHex(normalizeHex(encodeQuantity(checkedNonce.toNumber())));
    }
  }

  /**
   * Value 0 must be represented as 0x instead of 0x0 for some strange reason
   */
  private static encodeValue(value: string): Uint8Array {
    if (!value.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }
    const numericValue = new BN(value, 10);

    if (numericValue.isZero()) {
      return new Uint8Array([]);
    } else {
      return numericValue.toArrayLike(Uint8Array, "be");
    }
  }
}
