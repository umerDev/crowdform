import { Token } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { ethers } from "ethers";

export const MAX_FEE_PER_GAS = 100000000000;
export const MAX_PRIORITY_FEE_PER_GAS = 100000000000;
export const SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const QUOTER_CONTRACT_ADDRESS =
  "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
export const UNISWAP_FACTORY_ADDRESS =
  "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const WETH_ADDRESS = "0x142301666DC68C6902b49e2c2Ffa2228A2da21E5"; //wEth
export const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // usdc
export const chainId = parseInt(process.env.CHAIN_ID!);
export const walletAddress = process.env.WALLET!;
export const endpoint = process.env.ENDPOINT!;
export const privateKey = process.env.PRIVATE_KEY!;
export const inAmountStr = 10; //value to swap
export const provider = new ethers.providers.JsonRpcProvider(endpoint);

export const USDC_TOKEN = new Token(chainId, USDC_ADDRESS, 6, "USDC", "USD//C");
export const WETH_TOKEN = new Token(
  chainId,
  WETH_ADDRESS,
  18,
  "WETH",
  "Wrapped Eth"
);

export interface ExampleConfig {
  rpc: {
    local: string;
    mainnet: string;
  };
  wallet: {
    address: string;
    privateKey: string;
  };
  tokens: {
    in: Token;
    amountIn: number;
    out: Token;
    poolFee: number;
  };
}

export const CurrentConfig: ExampleConfig = {
  rpc: {
    local: endpoint,
    mainnet: "",
  },
  wallet: {
    address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  tokens: {
    in: WETH_TOKEN,
    amountIn: 1,
    out: USDC_TOKEN,
    poolFee: FeeAmount.MEDIUM,
  },
};
