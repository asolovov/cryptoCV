import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying OnchainCV contract with the account:", deployer.address);

    const OnchainCV = await ethers.getContractFactory("OnchainCV");
    const gasPrice = await OnchainCV.signer.getGasPrice();
    console.log(`Current gas price: ${gasPrice}`);
    const estimatedGas = await OnchainCV.signer.estimateGas(
        OnchainCV.getDeployTransaction(),
    );
    console.log(`Estimated gas: ${estimatedGas}`);
    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await OnchainCV.signer.getBalance();
    console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    console.log(`Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
    if (Number(deployerBalance) < Number(deploymentPrice)) {
        throw new Error("You dont have enough balance to deploy.");
    }

    const cv = await OnchainCV.deploy();

    await cv.deployed();

    console.log("OnchainCV contract deployed to address:", cv.address);

    // Comment the following code if you want to deploy contract on local node
    console.log("Waiting 30 seconds before etherscan verification...");
    await new Promise(f => setTimeout(f, 30000));

    await hre.run("verify:verify", {
        address: cv.address,
    });
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Error:", error);
        process.exit(1);
    });