const cron = require('node-cron');

const { sample, random } = require('lodash');
require("dotenv").config({ path: __dirname + "/./../.env" });

const ethers = require('ethers');
const { getProvider, getSigner } = require('./getSigner');
const { computeFee } = require('./computeFees');
const { swap } = require('./swap');

const feeReceiverAddress = process.env.SWAP_FEE_RECEIVER_ADDRESS;
const privateKeys = [];

const tokenInAndOutAddress = ["0x6B175474E89094C44Da98b954EedeAC495271d0F" , 
                              "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" , 
                              "0xdAC17F958D2ee523a2206206994597C13D831ec7" , 
                              "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" , 
                              "0xD533a949740bb3306d119CC777fa900bA034cd52" , 
                              "0x408e41876cCCDC0F92210600ef50372656052a38" , 
                              "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD" , 
                              "0xE41d2489571d322189246DaFA5ebDe1F4699F498" ,
                              "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ,
                              "0x443459d45c30a03f90037d011cbe22e2183d3b12"]; 
                              //DAI , USDC , USDT , WBTC , CRV , REN , LRC , ZRX , ETH , CONTRACT

const getPrivateKeyRandomly = () => {

    return sample(privateKeys);

}

const getTokenInAddressRandomly = () => {

    return sample(tokenInAndOutAddress);

}

const getTokenOutAddressRandomly = () => {

    return sample(tokenInAndOutAddress);

}

const getRandomAmount = (minAmount, maxAmount) => {

    return random(minAmount, maxAmount, false)

}

const swapToken = async () => {

    const privateKey = getPrivateKeyRandomly();

    let tokenIn, tokenOut, tokenInBalance;

    do {

        tokenIn = getTokenInAddressRandomly();

        tokenOut = getTokenOutAddressRandomly();

        tokenInBalance = getTokenInBalance(privateKey, tokenIn);

        if (tokenInBalance == 0) {
            tokenIn = getTokenInAddressRandomly();
        }

    } while (tokenIn == tokenOut) //generating random addresses till they are same.

    const minAmount = tokenInBalance * BigInt(25) / BigInt(100);

    const maxAmount = tokenInBalance * BigInt(75) / BigInt(100);

    const amount = getRandomAmount(minAmount, maxAmount);

    const fee = await computeFee(amount, privateKey);

    const slippage = 200;

    const signer = await getSigner(privateKey);

    await swap(tokenOut, tokenIn, amount, feeReceiverAddress, fee, signer, slippage);


}

const getTokenInBalance = async (_privatekey, _tokenIn) => {

    const provider = await getProvider();

    const signer = await getSigner(_privatekey);

    if (_tokenIn === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {

        const ethBalance = await provider.getBalance(signer.address);

        return ethBalance;

    }
    else {

        const tokenInContractInstance = new ethers.Contract(_tokenIn, ["function balanceOf(address) view returns(uint)"], userWallet);

        const balanceOfUser = await tokenInContractInstance.balanceOf(userWallet.address);

        return balanceOfUser;

    }

}



const scheduledTask = cron.schedule('* */2 * * *', () => {

    const randomDelay = random(2400000, 6000000, false);

    setTimeout(() => {

        swapToken()

        console.log(`The random delay is of ${randomDelay}`)

    }, randomDelay);

})

scheduledTask.start();

module.exports = { getTokenInBalance }
