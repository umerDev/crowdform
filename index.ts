import "dotenv/config";
import {
  createPool,
  getOutputQuote,
  uncheckedTrade,
  executeTrade,
} from "./src/pool";

const main = async () => {
  const pool = await createPool();
  const amountOut = await getOutputQuote(pool);

  const uTrade = uncheckedTrade(pool, amountOut);

  const executeSwap = await executeTrade(uTrade);

  console.log(executeSwap);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
