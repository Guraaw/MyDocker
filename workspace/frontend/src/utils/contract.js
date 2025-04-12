import { ethers, MaxUint256 } from 'ethers';
import addresses from './deployed-addresses.json'; // Import addresses from deployed contract addresses
import abis from './contract-abis.json'; // Import ABIs from deployed contract ABIs

// Fee configuration - can be adjusted as needed
const FEE_RATE = 0.003; // 0.3% fee
const LP_REWARD_SHARE = 0.7; // 70% of fees go to LPs

export const getContracts = async (signer) => {
  try {
      if (!signer) {
          throw new Error("No signer provided");
      }

      const signerAddress = await signer.getAddress();
      console.log("Signer address:", signerAddress);

      const token0 = new ethers.Contract(addresses.token0, abis.NewToken, signer);
      const token1 = new ethers.Contract(addresses.token1, abis.NewToken, signer);
      const pool = new ethers.Contract(addresses.pool, abis.Pool, signer);

      const contracts = {
          token0: {
              contract: token0,
              address: addresses.token0
          },
          token1: {
              contract: token1,
              address: addresses.token1
          },
          pool: {
              contract: pool,
              address: addresses.pool
          }
      };

      console.log("Contracts initialized with addresses:", {
          token0: contracts.token0.address,
          token1: contracts.token1.address,
          pool: contracts.pool.address
      });

      return contracts;
  } catch (error) {
      console.error("Error in getContracts:", error);
      throw error;
  }
};

export const getTokenBalances = async (contracts, address) => {
    try {
        const token0Balance = await contracts.token0.contract.balanceOf(address, { blockTag: 'latest' });
        const token1Balance = await contracts.token1.contract.balanceOf(address, { blockTag: 'latest' });
        const lpTokenBalance = await contracts.pool.contract.balanceOf(address, { blockTag: 'latest' });
        
        return {
            token0: ethers.formatEther(token0Balance),
            token1: ethers.formatEther(token1Balance),
            lpToken: ethers.formatEther(lpTokenBalance)
        };
    } catch (error) {
        console.error("Error in getTokenBalances:", error);
        throw error;
    }
};


export const getPoolInfo = async (contracts) => {
  try {
      const token0Balance = await contracts.token0.contract.balanceOf(contracts.pool.address, { blockTag: 'latest' });
      const token1Balance = await contracts.token1.contract.balanceOf(contracts.pool.address, { blockTag: 'latest' });
      
      return {
          token0Balance: ethers.formatEther(token0Balance),
          token1Balance: ethers.formatEther(token1Balance)
      };
  } catch (error) {
      console.error("Error in getPoolInfo:", error);
      throw error;
  }
};

export const getAmountOut = async (contracts, tokenIn, amountIn, tokenOut) => {
    try {
        const amountInWei = ethers.parseEther(amountIn.toString());
        const amountOutWei = await contracts.pool.contract.getAmountOut(
            contracts[tokenIn].address,
            amountInWei,
            contracts[tokenOut].address,
            { blockTag: 'latest' }
        );
        return ethers.formatEther(amountOutWei);
    } catch (error) {
        console.error("Error in getAmountOut:", error);
        throw error;
    }
  };

export const getRequiredAmount1 = async (contracts, amount0) => {
  try {
      const amount0Wei = ethers.parseEther(amount0.toString());
      const amount1Wei = await contracts.pool.contract.getRequiredAmount1(amount0Wei, { blockTag: 'latest' });
      return ethers.formatEther(amount1Wei);
  } catch (error) {
      console.error("Error in getRequiredAmount1:", error);
      throw error;
  }
};


export const swapTokens = async (contracts, tokenIn, amountIn, tokenOut) => {
  try {
      const amountInWei = ethers.parseEther(amountIn.toString());
      
      // Approve tokenIn
      const tokenInContract = contracts[tokenIn].contract;
      await tokenInContract.approve(contracts.pool.address, amountInWei, { blockTag: 'latest' });
      
      // Execute swap
      const tx = await contracts.pool.contract.swap(
          contracts[tokenIn].address,
          amountInWei,
          contracts[tokenOut].address,
          { blockTag: 'latest' }
      );
      await tx.wait();
      return tx;
  } catch (error) {
      console.error("Error in swapTokens:", error);
      throw error;
  }
};

export const addLiquidity = async (contracts, amount0) => {
  try {
      const amount0Wei = ethers.parseEther(amount0.toString());
      
      // Get required amount of token1
      const amount1Wei = await contracts.pool.contract.getRequiredAmount1(amount0Wei, { blockTag: 'latest' });
      
      // Approve both tokens
      await contracts.token0.contract.approve(contracts.pool.address, amount0Wei, { blockTag: 'latest' });
      await contracts.token1.contract.approve(contracts.pool.address, amount1Wei, { blockTag: 'latest' });
      
      // Add liquidity
      const tx = await contracts.pool.contract.addLiquidity(amount0Wei, { blockTag: 'latest' });
      await tx.wait();
      return tx;
  } catch (error) {
      console.error("Error in addLiquidity:", error);
      throw error;
  }
};

export const withdrawLiquidity = async (contracts, lpAmount) => {
  try {
      const lpAmountWei = ethers.parseEther(lpAmount.toString());
      
      // Call withdrawLiquidity function on the Pool contract
      const tx = await contracts.pool.contract.withdrawLiquidity(lpAmountWei, { blockTag: 'latest' });
      await tx.wait();
      
      return tx;
  } catch (error) {
      console.error("Error in withdrawLiquidity:", error);
      throw error;
  }
};

// Updated functions for fee and rewards

export const getFeeInfo = async (contracts) => {
  try {
    // 使用合约的getAccumulatedFees函数获取实际累积的手续费
    const accumulatedFees = await contracts.pool.contract.getAccumulatedFees({ blockTag: 'latest' });
    
    // 使用合约的getPoolInfo函数获取更完整的池信息
    const fullPoolInfo = await contracts.pool.contract.getPoolInfo({ blockTag: 'latest' });
    
    return {
      feeRate: FEE_RATE,  // 0.3%
      lpRewardShare: LP_REWARD_SHARE,  // 70%
      feesCollected: {
        token0: ethers.formatEther(accumulatedFees[0]), 
        token1: ethers.formatEther(accumulatedFees[1])
      }
    };
  } catch (error) {
    console.error("Error in getFeeInfo:", error);
    // 如果合约方法调用失败，回退到简化计算
    try {
      const poolInfo = await getPoolInfo(contracts);
      return {
        feeRate: FEE_RATE,
        lpRewardShare: LP_REWARD_SHARE,
        feesCollected: {
          token0: (parseFloat(poolInfo.token0Balance) * 0.05).toFixed(4),
          token1: (parseFloat(poolInfo.token1Balance) * 0.05).toFixed(4)
        }
      };
    } catch (backupError) {
      console.error("Backup calculation also failed:", backupError);
      throw error;
    }
  }
};

export const calculateSwapFee = async (contracts, amountIn) => {
  // 检查参数类型，不使用 arguments
  if (amountIn === undefined && (typeof contracts === 'string' || typeof contracts === 'number')) {
    amountIn = contracts;
    contracts = null;
  }
  
  try {
    // 仅在提供了 contracts 参数时才尝试调用合约方法
    if (contracts) {
      const amountInWei = ethers.parseEther(amountIn.toString());
      const feeWei = await contracts.pool.contract.calculateFee(amountInWei, { blockTag: 'latest' });
      return ethers.formatEther(feeWei);
    } else {
      throw new Error("Contracts not provided");
    }
  } catch (error) {
    console.error("Error calling contract calculateFee function:", error);
    // 回退到前端计算
    const fee = parseFloat(amountIn) * FEE_RATE;
    return fee.toFixed(6);
  }
};

export const getUserRewards = async (contracts, userAddress) => {
  try {
    // 使用合约的estimateRewards函数
    const rewards = await contracts.pool.contract.estimateRewards(userAddress, { blockTag: 'latest' });
    
    // 获取用户的LP代币余额和总供应量计算份额
    const userBalance = await contracts.pool.contract.balanceOf(userAddress, { blockTag: 'latest' });
    const totalSupply = await contracts.pool.contract.totalSupply({ blockTag: 'latest' });
    
    let userShare = 0;
    if (totalSupply.toString() !== '0') {
      // 计算用户份额，使用BigInt防止精度问题
      const shareRatio = (userBalance * BigInt(1e18)) / totalSupply;
      userShare = Number(shareRatio) / 1e18;
    }
    
    return {
      share: userShare,
      token0: ethers.formatEther(rewards[0]),
      token1: ethers.formatEther(rewards[1])
    };
  } catch (error) {
    console.error("Error in getUserRewards:", error);
    // 如果合约方法调用失败，回退到简化计算
    try {
      const poolInfo = await getPoolInfo(contracts);
      const userBalances = await getTokenBalances(contracts, userAddress);
      
      const totalLPSupply = await contracts.pool.contract.totalSupply({ blockTag: 'latest' });
      const totalLPFormatted = ethers.formatEther(totalLPSupply);
      
      const userShare = totalLPFormatted === '0' ? 0 : parseFloat(userBalances.lpToken) / parseFloat(totalLPFormatted);
      
      const token0Fees = parseFloat(poolInfo.token0Balance) * 0.05 * LP_REWARD_SHARE;
      const token1Fees = parseFloat(poolInfo.token1Balance) * 0.05 * LP_REWARD_SHARE;
      
      return {
        share: userShare,
        token0: (token0Fees * userShare).toFixed(4),
        token1: (token1Fees * userShare).toFixed(4)
      };
    } catch (backupError) {
      console.error("Backup calculation also failed:", backupError);
      throw error;
    }
  }
};