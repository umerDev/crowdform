import JSBI from "jsbi";

import "dotenv/config";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { ethers } from "ethers";
import {
  CurrentConfig,
  endpoint,
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  provider,
  QUOTER_CONTRACT_ADDRESS,
  SWAP_ROUTER_ADDRESS,
  UNISWAP_FACTORY_ADDRESS,
  walletAddress,
} from "./config";

import {
  computePoolAddress,
  Pool,
  Route,
  SwapOptions,
  SwapQuoter,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";
import { fromReadableAmount, wallet } from "./helper";

export async function getPoolInfo() {
  if (!provider) {
    throw new Error("No provider");
  }
  const currentPoolAddress = computePoolAddress({
    factoryAddress: UNISWAP_FACTORY_ADDRESS,
    tokenA: CurrentConfig.tokens.in,
    tokenB: CurrentConfig.tokens.out,
    fee: CurrentConfig.tokens.poolFee,
  });

  const poolContract = new ethers.Contract(
    currentPoolAddress,
    IUniswapV3PoolABI.abi,
    provider
  );

  const [token0, token1, fee, tickSpacing, liquidity, slot0] =
    await Promise.all([
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
}

const createPool = async () => {
  const poolInfo = await getPoolInfo();

  const pool = new Pool(
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out,
    CurrentConfig.tokens.poolFee,
    String(poolInfo?.sqrtPriceX96),
    String(poolInfo?.liquidity),
    poolInfo?.tick!
  );

  const swapRoute = new Route(
    [pool],
    CurrentConfig.tokens.in,
    CurrentConfig.tokens.out
  );

  return swapRoute;
};

const getOutputQuote = async (swapRoute: Route<Token, Token>) => {
  const { calldata } = SwapQuoter.quoteCallParameters(
    swapRoute,
    CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      )
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  );
  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  });

  return ethers.utils.defaultAbiCoder.decode(["uint256"], quoteCallReturnData);
};

const uncheckedTrade = (
  swapRoute: Route<Token, Token>,
  amountOut: string | number | boolean | object
) => {
  const trade = Trade.createUncheckedTrade({
    route: swapRoute,
    inputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.in,
      fromReadableAmount(
        CurrentConfig.tokens.amountIn,
        CurrentConfig.tokens.in.decimals
      )
    ),
    outputAmount: CurrencyAmount.fromRawAmount(
      CurrentConfig.tokens.out,
      JSBI.BigInt(amountOut)
    ),
    tradeType: TradeType.EXACT_INPUT,
  });
  return trade;
};

const executeTrade = async (
  uncheckedTrade: Trade<Token, Token, TradeType.EXACT_INPUT>
) => {
  const options: SwapOptions = {
    slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
    deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
    recipient: walletAddress,
  };
  const methodParameters = SwapRouter.swapCallParameters(
    [uncheckedTrade],
    options
  );

  const tx = {
    data: methodParameters.calldata,
    to: SWAP_ROUTER_ADDRESS,
    value: methodParameters.value,
    from: walletAddress,
    maxFeePerGas: MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
  };

  const res = await wallet.sendTransaction(tx);
  return res;
};

const main = async () => {
  const swap = await createPool();
  const amountOut = await getOutputQuote(swap);

  const uTrade = uncheckedTrade(swap, amountOut);

  const executeSwap = await executeTrade(uTrade);

  console.log(executeSwap);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
