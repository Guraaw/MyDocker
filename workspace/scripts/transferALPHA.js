const { ethers } = require("hardhat");
const addresses = require("/usr/app/workspace/frontend/src/utils/deployed-addresses.json"); 

async function main() {
  // Connect to the Hardhat network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Replace with the address of the recipient account
  const recipientAddress = "0x5Ab1eC604B1A8cff4e50d339863006989d375185"; // My address (from MetaMask)

  const NewToken = await hre.ethers.getContractFactory("NewToken");
  const Alpha = NewToken.attach(addresses.token0);

  const amount = ethers.parseEther("500000");
  await Alpha.transfer(recipientAddress, amount)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });