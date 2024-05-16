"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolInfo = void 0;
const jsbi_1 = __importDefault(require("jsbi"));
require("dotenv/config");
const IUniswapV3Pool_json_1 = __importDefault(require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json"));
const ethers_1 = require("ethers");
const config_1 = require("./config");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const helper_1 = require("./helper");
function getPoolInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_1.provider) {
            throw new Error("No provider");
        }
        const currentPoolAddress = (0, v3_sdk_1.computePoolAddress)({
            factoryAddress: config_1.UNISWAP_FACTORY_ADDRESS,
            tokenA: config_1.CurrentConfig.tokens.in,
            tokenB: config_1.CurrentConfig.tokens.out,
            fee: config_1.CurrentConfig.tokens.poolFee,
        });
        const poolContract = new ethers_1.ethers.Contract(currentPoolAddress, IUniswapV3Pool_json_1.default.abi, config_1.provider);
        const [token0, token1, fee, tickSpacing, liquidity, slot0] = yield Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
            poolContract.tickSpacing(),
            poolContract.liquidity(),
            poolContract.slot0(),
        ]);
        return {
            token0,
            token1,
            fee,
            tickSpacing,
            liquidity,
            sqrtPriceX96: slot0[0],
            tick: slot0[1],
        };
    });
}
exports.getPoolInfo = getPoolInfo;
const createPool = () => __awaiter(void 0, void 0, void 0, function* () {
    const poolInfo = yield getPoolInfo();
    const pool = new v3_sdk_1.Pool(config_1.CurrentConfig.tokens.in, config_1.CurrentConfig.tokens.out, config_1.CurrentConfig.tokens.poolFee, String(poolInfo === null || poolInfo === void 0 ? void 0 : poolInfo.sqrtPriceX96), String(poolInfo === null || poolInfo === void 0 ? void 0 : poolInfo.liquidity), poolInfo === null || poolInfo === void 0 ? void 0 : poolInfo.tick);
    const swapRoute = new v3_sdk_1.Route([pool], config_1.CurrentConfig.tokens.in, config_1.CurrentConfig.tokens.out);
    return swapRoute;
});
const getOutputQuote = (swapRoute) => __awaiter(void 0, void 0, void 0, function* () {
    const { calldata } = v3_sdk_1.SwapQuoter.quoteCallParameters(swapRoute, sdk_core_1.CurrencyAmount.fromRawAmount(config_1.CurrentConfig.tokens.in, (0, helper_1.fromReadableAmount)(config_1.CurrentConfig.tokens.amountIn, config_1.CurrentConfig.tokens.in.decimals)), sdk_core_1.TradeType.EXACT_INPUT, {
        useQuoterV2: true,
    });
    const quoteCallReturnData = yield config_1.provider.call({
        to: config_1.QUOTER_CONTRACT_ADDRESS,
        data: calldata,
    });
    return ethers_1.ethers.utils.defaultAbiCoder.decode(["uint256"], quoteCallReturnData);
});
const uncheckedTrade = (swapRoute, amountOut) => {
    const trade = v3_sdk_1.Trade.createUncheckedTrade({
        route: swapRoute,
        inputAmount: sdk_core_1.CurrencyAmount.fromRawAmount(config_1.CurrentConfig.tokens.in, (0, helper_1.fromReadableAmount)(config_1.CurrentConfig.tokens.amountIn, config_1.CurrentConfig.tokens.in.decimals)),
        outputAmount: sdk_core_1.CurrencyAmount.fromRawAmount(config_1.CurrentConfig.tokens.out, jsbi_1.default.BigInt(amountOut)),
        tradeType: sdk_core_1.TradeType.EXACT_INPUT,
    });
    return trade;
};
const executeTrade = (uncheckedTrade) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        slippageTolerance: new sdk_core_1.Percent(50, 10000), // 50 bips, or 0.50%
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
        recipient: config_1.walletAddress,
    };
    const methodParameters = v3_sdk_1.SwapRouter.swapCallParameters([uncheckedTrade], options);
    const tx = {
        data: methodParameters.calldata,
        to: config_1.SWAP_ROUTER_ADDRESS,
        value: methodParameters.value,
        from: config_1.walletAddress,
        maxFeePerGas: config_1.MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: config_1.MAX_PRIORITY_FEE_PER_GAS,
    };
    const res = yield helper_1.wallet.sendTransaction(tx);
    return res;
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const swap = yield createPool();
    const amountOut = yield getOutputQuote(swap);
    const uTrade = uncheckedTrade(swap, amountOut);
    const executeSwap = yield executeTrade(uTrade);
    console.log(executeSwap);
});
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});