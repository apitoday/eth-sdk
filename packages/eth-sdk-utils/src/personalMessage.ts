import { sign, recover } from 'secp256k1';
import { toBuffer } from './buffer';
import { concatHex, toHex } from './hex';
import { keccak256 } from './keccak';
import { publicKeyToAddress, verifyPublicKey } from './secp256k1';
import { TData } from './types';

export function hashPersonalMessage(message: TData): string {
  return keccak256(
    '\x19Ethereum Signed Message:\n32',
    keccak256(message),
  );
}

export function signPersonalMessage(message: TData, privateKey: string): string {
  const messageHash = hashPersonalMessage(message);

  const { recovery, signature } = sign(toBuffer(messageHash), toBuffer(privateKey));

  return concatHex(
    signature,
    recovery + 27,
  );
}

export namespace signPersonalMessage {
  export interface IResult {
    messageHash: string;
    signature: string;
  }
}

export function recoverPublicKeyFromPersonalMessage(message: TData, signature: string): string {
  const hash = hashPersonalMessage(message);

  const signatureBuff = toBuffer(signature);
  const s = signatureBuff.slice(0, -1);
  const r = signatureBuff[signatureBuff.length - 1] - 27;

  let result: string = null;

  try {
    const publicKey = toHex(recover(
      toBuffer(hash),
      s,
      r,
      false,
    ));

    result = verifyPublicKey(publicKey) ? publicKey : null;
  } catch (err) {
    result = null;
  }

  return result;
}

export function recoverAddressFromPersonalMessage(message: TData, signature: string): string {
  const publicKey = recoverPublicKeyFromPersonalMessage(message, signature);

  return publicKey
    ? publicKeyToAddress(publicKey)
    : null;
}
