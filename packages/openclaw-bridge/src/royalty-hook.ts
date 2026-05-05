/**
 * Thin client for the on-chain RoyaltyHook contract.
 *
 * Spec: ../../../openclaw-0g-hackathon/architecture/openclaw-bridge.md (royalty-hook.ts)
 * Contract: ../../packages/contracts/src/RoyaltyHook.sol
 */

import { Contract, type Signer, type ContractTransactionResponse, type EventLog } from 'ethers';

const ABI = [
  'function payAndRun(uint256 tokenId, uint256 fee) external payable returns (bool)',
  'event InferenceRun(uint256 indexed tokenId, address indexed runner, uint256 fee, uint256 royaltyPaid, address royaltyReceiver)',
];

export interface RoyaltyResult {
  txHash: string;
  royaltyPaid: bigint;
  royaltyReceiver: string;
}

export class RoyaltyClient {
  private readonly contract: Contract;

  constructor(address: string, signer: Signer) {
    this.contract = new Contract(address, ABI, signer);
  }

  async payAndRun(tokenId: bigint, fee: bigint): Promise<RoyaltyResult> {
    const tx: ContractTransactionResponse = await this.contract.payAndRun(tokenId, fee, { value: fee });
    const receipt = await tx.wait();
    if (!receipt) throw new Error('Royalty tx receipt missing');

    const event = receipt.logs.find((l): l is EventLog => 'eventName' in l && l.eventName === 'InferenceRun');
    if (!event) throw new Error('InferenceRun event missing');

    return {
      txHash: receipt.hash,
      royaltyPaid: event.args.royaltyPaid as bigint,
      royaltyReceiver: event.args.royaltyReceiver as string,
    };
  }
}
