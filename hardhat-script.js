async function main() {
  const NewToken = await hre.ethers.getContractFactory("NewToken");
  const Alpha = NewToken.attach('0x5FbDB2315678afecb367f032d93F642f64180aa3');
  const Beta = NewToken.attach('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512');
  const Pool = await hre.ethers.getContractFactory("Pool");
  const pool = Pool.attach('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0');

  console.log("Approving Alpha token...");
  await Alpha.approve('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', ethers.parseEther("1000000"));
  
  console.log("Approving Beta token...");
  await Beta.approve('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', ethers.parseEther("1000000"));
  
  console.log("Adding liquidity to pool...");
  await pool.addLiquidity(ethers.parseEther("1000"));
  
  console.log("All operations completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 