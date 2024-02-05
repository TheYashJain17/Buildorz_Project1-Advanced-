const cron = require('node-cron');

const { sample, random } = require('lodash');

const ethers = require('ethers');

const TypeAITokenContractAddress = process.env.TYPEAI_TOKEN_ADDRESS;

const { getProvider, getSigner } = require('./getSigner');


const privateKeys = [];

const tokenInAddresses = ["0x6B175474E89094C44Da98b954EedeAC495271d0F" , "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" , "0xdAC17F958D2ee523a2206206994597C13D831ec7" , "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"]; //DAI , USDC , USDT , WBTC

const tokenOutAddresses = ["0xD533a949740bb3306d119CC777fa900bA034cd52" , "0x408e41876cCCDC0F92210600ef50372656052a38" , "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD" , "0xE41d2489571d322189246DaFA5ebDe1F4699F498"]; //CRV , REN , LRC , ZRX

const getPrivateKeyRandomly = () => {

    return sample(privateKeys);

}

const getTokenInAddressRandomly = () => {

    return sample(tokenInAddresses);

}

const getTokenOutAddressRandomly = () => {

    return sample(tokenOutAddresses);

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

const computeFee = async(amount , userAddress) => {

    let fee;

    const tokenBalance = getTokenInBalance(userAddress , TypeAITokenContractAddress);

    const totalSupply = BigInt(10000000000000000000000000);

    const userTokenPercentage = BigInt(tokenBalance) * BigInt(100) / BigInt(totalSupply);

    console.log(userTokenPercentage);

    if (userTokenPercentage > 2){

        fee = 0;

    }else if(userTokenPercentage > 1.5 && userTokenPercentage <= 2){

        fee = BigInt(amount)/BigInt(200);

    }else if(userTokenPercentage > 1 && userTokenPercentage <= 1.5){


        fee = BigInt(amount) * BigInt(75) / BigInt(10000);

    }else if(userTokenPercentage > 0.5 && userTokenPercentage <= 1){

        fee = BigInt(amount) * BigInt(90) / BigInt(10000);

    }else if(userTokenPercentage <= 0.5){

        fee = BigInt(amount) / BigInt(100);

    }

    console.log("Calculated Fee is:" , fee)

    return fee

}



const scheduledTask = cron.schedule('* */2 * * *', () => {

    const randomDelay = random(2400000, 6000000, false);

    setTimeout(() => {

        // swapToken()

        console.log(`The random delay is of ${randomDelay}`)

        console.log("Its Working");

    }, randomDelay);

})

scheduledTask.start();





