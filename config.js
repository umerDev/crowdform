"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentConfig = exports.WETH_TOKEN = exports.USDC_TOKEN = exports.provider = exports.inAmountStr = exports.privateKey = exports.endpoint = exports.walletAddress = exports.chainId = exports.USDC_ADDRESS = exports.WETH_ADDRESS = exports.UNISWAP_FACTORY_ADDRESS = exports.QUOTER_CONTRACT_ADDRESS = exports.SWAP_ROUTER_ADDRESS = exports.MAX_PRIORITY_FEE_PER_GAS = exports.MAX_FEE_PER_GAS = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const ethers_1 = require("ethers");
exports.MAX_FEE_PER_GAS = 100000000000;
exports.MAX_PRIORITY_FEE_PER_GAS = 100000000000;
exports.SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
exports.QUOTER_CONTRACT_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
exports.UNISWAP_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
exports.WETH_ADDRESS = "0x142301666DC68C6902b49e2c2Ffa2228A2da21E5"; //wEth
exports.USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // usdc
exports.chainId = parseInt(process.env.CHAIN_ID);
exports.walletAddress = process.env.WALLET;
exports.endpoint = process.env.ENDPOINT;
exports.privateKey = process.env.PRIVATE_KEY;
exports.inAmountStr = 10; //value to swap
exports.provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.endpoint);
exports.USDC_TOKEN = new sdk_core_1.Token(exports.chainId, exports.USDC_ADDRESS, 6, "USDC", "USD//C");
exports.WETH_TOKEN = new sdk_core_1.Token(exports.chainId, exports.WETH_ADDRESS, 18, "WETH", "Wrapped Eth");
exports.CurrentConfig = {
    rpc: {
        local: exports.endpoint,
        mainnet: "",
    },
    wallet: {
        address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
        privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
    tokens: {
        in: exports.WETH_TOKEN,
        amountIn: 1,
        out: exports.USDC_TOKEN,
        poolFee: v3_sdk_1.FeeAmount.MEDIUM,
    },
};
