const ethers = require("ethers");
require("dotenv").config({ path: __dirname + "/./../.env" });

const getProvider = async () => {
    const network = "mainnet";
    const apiKey = process.env.ALCHEMY_API_KEY;
    const provider = await new ethers.AlchemyProvider(network, apiKey);
    return provider;
};

const getSigner = async (privateKey) => {
    const provider = await getProvider();
    const signer = new ethers.Wallet(privateKey, provider);
    return signer;
}

module.exports = { getProvider, getSigner };