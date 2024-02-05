const TypeAITokenContractAddress = process.env.TYPEAI_TOKEN_ADDRESS;
const { getSigner } = require("./getSigner");

const computeFee = async (amount, privateKey) => {

    // Actual Fees logic
    let fee;
    const signer = await getSigner(privateKey);
    const userAddress = signer.address;
    const { getTokenInBalance } = require("./index")
    const { tokenBalance } = await getTokenInBalance(
        userAddress,
        TypeAITokenContractAddress
    );
    const totalSupply = BigInt(10000000000000000000000000);
    const usersTokenPercentage = BigInt(tokenBalance) * BigInt(100) / BigInt(totalSupply);
    console.log(usersTokenPercentage);

    if (usersTokenPercentage > 2) {
        fee = 0;
    } else if (usersTokenPercentage > 1.5 && usersTokenPercentage <= 2) {
        fee = BigInt(amount) / BigInt(200);
    } else if (usersTokenPercentage > 1 && usersTokenPercentage <= 1.5) {
        fee = BigInt(amount) * BigInt(75) / BigInt(10000);
    } else if (usersTokenPercentage > 0.5 && usersTokenPercentage <= 1) {
        fee = BigInt(amount) * BigInt(90) / BigInt(10000);
    } else if (usersTokenPercentage <= 0.5) {
        fee = BigInt(amount) / BigInt(100);
    }

    console.log("Fee: ", fee);
    return fee
}

module.exports = { computeFee }