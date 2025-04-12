// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LPToken.sol";

contract Pool is LPToken, ReentrancyGuard {

    IERC20 immutable i_token0;
    IERC20 immutable i_token1;

    address immutable i_token0_address;
    address immutable i_token1_address;

    uint256 constant INITIAL_RATIO = 2; //token0:token1 = 1:2
    
    // Fee set (0.3%)
    uint256 constant FEE_RATE = 3;
    uint256 constant FEE_DENOMINATOR = 1000;

    mapping(address => uint256) tokenBalances;
    
    uint256 public accumulatedFee0;
    uint256 public accumulatedFee1;

    // Events
    event AddedLiquidity(
        uint256 indexed lpToken,
        address token0,
        uint256 indexed amount0,
        address token1,
        uint256 indexed amount1
    );

    event Swapped(
        address tokenIn,
        uint256 indexed amountIn,
        address tokenOut,
        uint256 indexed amountOut,
        uint256 fee
    );

    
    event RemovedLiquidity(
        uint256 indexed lpTokenAmount,
        address token0,
        uint256 indexed amount0,
        address token1,
        uint256 indexed amount1,
        uint256 fee0,
        uint256 fee1
    );

    // Constructor
    constructor(address token0, address token1) LPToken("LPToken", "LPT") {

        i_token0 = IERC20(token0);
        i_token1 = IERC20(token1);

        i_token0_address = token0;
        i_token1_address = token1;

    }

    // Help Functions
    function getAmountOut(address tokenIn, uint256 amountIn, address tokenOut) public view returns (uint256) {
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_RATE) / FEE_DENOMINATOR;
        
        uint256 balanceOut = tokenBalances[tokenOut];
        uint256 balanceIn = tokenBalances[tokenIn];
        uint256 amountOut = (balanceOut * amountInWithFee) / (balanceIn + amountInWithFee);
        
        return amountOut;
    }
    
    function calculateFee(uint256 amount) public pure returns (uint256) {
        return amount * FEE_RATE / FEE_DENOMINATOR;
    }

    function swap(address tokenIn, uint256 amountIn, address tokenOut) public nonReentrant {
        
        // input validity checks
        require(tokenIn != tokenOut, "Same tokens");
        require(tokenIn == i_token0_address || tokenIn == i_token1_address, "Invalid token");
        require(tokenOut == i_token0_address || tokenOut == i_token1_address, "Invalid token");
        require(amountIn > 0, "Zero amount");

        uint256 fee = calculateFee(amountIn);
        uint256 amountInWithFee = amountIn - fee;
        
        uint256 amountOut = getAmountOut(tokenIn, amountIn, tokenOut);

        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Swap Failed");
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "Swap Failed");
        
        tokenBalances[tokenIn] += amountInWithFee;
        tokenBalances[tokenOut] -= amountOut;
        
        if(tokenIn == i_token0_address) {
            accumulatedFee0 += fee;
        } else {
            accumulatedFee1 += fee;
        }

        emit Swapped(tokenIn, amountIn, tokenOut, amountOut, fee);
    }

    function getRequiredAmount1(uint256 amount0) public view returns(uint256) {

        uint256 balance0 = tokenBalances[i_token0_address];
        uint256 balance1 = tokenBalances[i_token1_address];
        
        if (balance0 == 0 || balance1 == 0) {
            return amount0 * INITIAL_RATIO;
        }
        return (amount0 * balance1) / balance0;

    }

    function getReserves() public view returns (uint256, uint256) {
        return (
            tokenBalances[i_token0_address],
            tokenBalances[i_token1_address]
        );
    }
    
    function getAccumulatedFees() public view returns (uint256, uint256) {
        return (accumulatedFee0, accumulatedFee1);
    }


    // Add and Withdraw liquidity
    function addLiquidity(uint256 amount0) public nonReentrant {
    
        // input validity check
        require(amount0 > 0, "Amount must be greater than 0");
        
        // calculate and mint liquidity tokens
        uint256 amount1 = getRequiredAmount1(amount0);
        uint256 amountLP;
        if (totalSupply() > 0) {
            amountLP = (amount0 * totalSupply()) / tokenBalances[i_token0_address];
        } else {
            amountLP = amount0;
        }
        _mint(msg.sender, amountLP);

        // deposit token0
        require(i_token0.transferFrom(msg.sender, address(this), amount0), "Transfer Alpha failed");
        tokenBalances[i_token0_address] += amount0;
        
        // deposit token1
        require(i_token1.transferFrom(msg.sender, address(this), amount1), "Transfer Beta failed");
        tokenBalances[i_token1_address] += amount1;
        
        emit AddedLiquidity(amountLP, i_token0_address, amount0, i_token1_address, amount1);

    }

    function withdrawLiquidity(uint256 lpAmount) public nonReentrant {
        // Input validity check
        require(lpAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= lpAmount, "Insufficient LP tokens");
        
        uint256 totalLP = totalSupply();
  
        uint256 amount0 = (lpAmount * tokenBalances[i_token0_address]) / totalLP;
        uint256 amount1 = (lpAmount * tokenBalances[i_token1_address]) / totalLP;
        
        uint256 feeReward0 = (accumulatedFee0 * lpAmount) / totalLP;
        uint256 feeReward1 = (accumulatedFee1 * lpAmount) / totalLP;
        
        if (lpAmount == totalLP) {
            feeReward0 = accumulatedFee0;
            feeReward1 = accumulatedFee1;
        }
        
        accumulatedFee0 -= feeReward0;
        accumulatedFee1 -= feeReward1;
        
        amount0 += feeReward0;
        amount1 += feeReward1;
        
        _burn(msg.sender, lpAmount);
        
        tokenBalances[i_token0_address] -= amount0 - feeReward0; 
        tokenBalances[i_token1_address] -= amount1 - feeReward1;
        
        require(i_token0.transfer(msg.sender, amount0), "Transfer token0 failed");
        require(i_token1.transfer(msg.sender, amount1), "Transfer token1 failed");
        
        emit RemovedLiquidity(lpAmount, i_token0_address, amount0, i_token1_address, amount1, feeReward0, feeReward1);
    }
    
    function getPoolInfo() public view returns (uint256, uint256, uint256, uint256, uint256) {
        return (
            totalSupply(),
            tokenBalances[i_token0_address],
            tokenBalances[i_token1_address],
            accumulatedFee0,
            accumulatedFee1
        );
    }
    
    function estimateRewards(address user) public view returns (uint256, uint256) {
        uint256 userBalance = balanceOf(user);
        uint256 totalLP = totalSupply();
        
        if (userBalance == 0 || totalLP == 0) {
            return (0, 0);
        }
        
        uint256 reward0 = (accumulatedFee0 * userBalance) / totalLP;
        uint256 reward1 = (accumulatedFee1 * userBalance) / totalLP;

        if (userBalance == totalLP) {
            reward0 = accumulatedFee0;
            reward1 = accumulatedFee1;
        }
        
        return (reward0, reward1);
    }
} 