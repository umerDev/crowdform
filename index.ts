import "dotenv/config";
import {
  createPool,
  getOutputQuote,
  uncheckedTrade,
  executeTrade,
} from "./src/pool";

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
