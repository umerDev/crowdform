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
exports.sendTransaction = exports.TransactionState = exports.fromReadableAmount = exports.toReadableAmount = exports.wallet = void 0;
const jsbi_1 = __importDefault(require("jsbi"));
const ethers_1 = require("ethers");
const config_1 = require("./config");
exports.wallet = createWallet();
function toReadableAmount(rawAmount, decimals) {
    return jsbi_1.default.divide(jsbi_1.default.BigInt(rawAmount), jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(decimals))).toString();
}
exports.toReadableAmount = toReadableAmount;
function countDecimals(x) {
    if (Math.floor(x) === x) {
        return 0;
    }
    return x.toString().split(".")[1].length || 0;
}
function fromReadableAmount(amount, decimals) {
    const extraDigits = Math.pow(10, countDecimals(amount));
    const adjustedAmount = amount * extraDigits;
    return jsbi_1.default.divide(jsbi_1.default.multiply(jsbi_1.default.BigInt(adjustedAmount), jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(decimals))), jsbi_1.default.BigInt(extraDigits));
}
exports.fromReadableAmount = fromReadableAmount;
var TransactionState;
(function (TransactionState) {
    TransactionState["Failed"] = "Failed";
    TransactionState["New"] = "New";
    TransactionState["Rejected"] = "Rejected";
    TransactionState["Sending"] = "Sending";
    TransactionState["Sent"] = "Sent";
})(TransactionState || (exports.TransactionState = TransactionState = {}));
function createWallet() {
    const _provider = new ethers_1.ethers.providers.JsonRpcProvider(config_1.CurrentConfig.rpc.local);
    return new ethers_1.ethers.Wallet(config_1.CurrentConfig.wallet.privateKey, _provider);
}
function sendTransactionViaWallet(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (transaction.value) {
            transaction.value = ethers_1.BigNumber.from(transaction.value);
        }
        const txRes = yield exports.wallet.sendTransaction(transaction);
        let receipt = null;
        if (!config_1.provider) {
            return TransactionState.Failed;
        }
        while (receipt === null) {
            try {
                receipt = yield config_1.provider.getTransactionReceipt(txRes.hash);
                if (receipt === null) {
                    continue;
                }
            }
            catch (e) {
                console.log(`Receipt error:`, e);
                break;
            }
        }
        // Transaction was successful if status === 1
        if (receipt) {
            return TransactionState.Sent;
        }
        else {
            return TransactionState.Failed;
        }
    });
}
function sendTransaction(transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (transaction.value) {
            transaction.value = ethers_1.BigNumber.from(transaction.value);
        }
        return sendTransactionViaWallet(transaction);
    });
}
exports.sendTransaction = sendTransaction;
