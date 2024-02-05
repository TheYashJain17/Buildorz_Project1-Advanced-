const axios = require("axios");
const { ethers } = require("ethers");

const getRouteSummary = async (
    tokenOutContractAddress,
    tokenInContractAddress,
    amountToSwap,
    feeReceiver,
    feeAmount
) => {
    try {
        console.log("Getting Route...");
        const getRoute = await axios.get(
            "https://aggregator-api.kyberswap.com/ethereum/api/v1/routes",
            {
                params: {
                    tokenIn: tokenInContractAddress,
                    tokenOut: tokenOutContractAddress,
                    amountIn: amountToSwap,
                    saveGas: true,
                    gasInclude: true,
                    feeReceiver: feeReceiver,
                    feeAmount: `${feeAmount}`,
                    isInBps: false,
                    chargeFeeBy: "currency_in",
                },
            }
        );
        console.log("Get Route successful...");
        return getRoute;
        // return getRoute.data.data.routeSummary;
    } catch (error) {
        console.error(error);
        result = {
            response: `Getting route summary failed. Please adjust your swap parameters and try again.`,
        };
        return JSON.stringify(result);
    }
};

const postRouteSummary = async (userAddress, routeSummary, slippage) => {
    try {
        console.log("Posting Route...");
        const swapData = await axios.post(
            "https://aggregator-api.kyberswap.com/ethereum/api/v1/route/build",
            {
                recipient: userAddress,
                sender: userAddress,
                routeSummary: routeSummary,
                slippageTolerance: slippage ? slippage : 100,
            }
        );
        console.log("Post Route Successful...");
        return swapData;
        // return swapData.data.data;
    } catch (error) {
        console.error(error);
        result = {
            response: `Posting route summary failed, please adjust your swap parameters`,
        };
        return JSON.stringify(result);
    }
};

const swap = async (tokenOutContractAddress, tokenInContractAddress, amount, feeReceiverAddress, feeAmount, signer, slippage) => {
    const userAddress = signer.address;
    const routeResponse = await getRouteSummary(
        tokenOutContractAddress,
        tokenInContractAddress,
        Number(amount).toString(),
        feeReceiverAddress,
        feeAmount
    );
    if (routeResponse.status !== 200) return JSON.stringify(routeResponse);
    const routeSummary = routeResponse.data.data.routeSummary;
    const postRouteResponse = await postRouteSummary(
        userAddress,
        routeSummary,
        slippage
    );
    if (postRouteResponse.status !== 200)
        return JSON.stringify(postRouteResponse);
    const { data, routerAddress } = postRouteResponse.data.data;

    let value = 0;
    if (tokenInContractAddress == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        value = amount;
    }
    // Write the logic to fetch a value in such a way that it's 0 if the token is NOT eth,
    // For ETH, the value should be the expected amount to be transferred, remember to format properly in wei.
    const tx = {
        from: signer.address,
        to: routerAddress,
        data: data,
        value: value,
        gas: 4500000,
    };

    const sendtx = await signer.sendTransaction(tx);
    console.log(`https://etherscan.io/tx/${sendtx.hash}`);
    // Waiting for the transaction to be mined
    const receipt = await sendtx.wait();
    console.log(`Mined in block ${receipt.blockNumber}`);
}

module.exports = { swap };