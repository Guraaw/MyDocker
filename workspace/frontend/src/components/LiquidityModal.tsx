import { useState, useEffect } from "react";
import { getRequiredAmount1 } from "../utils/contract";
import { BaseButton } from "./Buttons";
import { FlexContainer } from "./Containers";

interface LiquidityModalProps {
  show: boolean;
  onHide: () => void;
  contracts: any;
  token0Amount: string;
  token1Amount: string;
  setToken0Amount: (amount: string) => void;
  setToken1Amount: (amount: string) => void;
  isWalletConnected: boolean;
  handleConnectWallet: () => Promise<void>;
  handleAddLiquidity: () => Promise<void>;
  feeInfo?: {
    feeRate: number;
    lpRewardShare: number;
    feesCollected: {
      token0: string;
      token1: string;
    }
  };
  userRewards?: {
    share: number;
    token0: string;
    token1: string;
  };
}

export function LiquidityModal({
  show,
  onHide,
  contracts,
  token0Amount,
  token1Amount,
  setToken0Amount,
  setToken1Amount,
  isWalletConnected,
  handleConnectWallet,
  handleAddLiquidity,
  feeInfo,
  userRewards
}: LiquidityModalProps) {
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  // 控制组件显示/隐藏的动画效果
  useEffect(() => {
    if (show) {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);
  
  const handleToken0AmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToken0Amount(value);
    
    if (value && !isNaN(Number(value))) {
      const token1Amount = await calculateToken1Amount(value);
      setToken1Amount(token1Amount);
    } else {
      setToken1Amount('');
    }
  };
  
  const calculateToken1Amount = async (amount0: string) => {
    if (!amount0 || !contracts || isNaN(Number(amount0)) || Number(amount0) <= 0) {
      return '0';
    }

    try {
      const result = await getRequiredAmount1(contracts, amount0);
      return result;
    } catch (error) {
      console.error("Error calculating token1 amount:", error);
      return '0';
    }
  };

  if (!isRendered) return null;

  // Format user's share as percentage
  const userSharePercent = userRewards && userRewards.share > 0 
    ? (userRewards.share * 100).toFixed(2) 
    : '0';
    
  // Format fee rate
  const feeRateFormatted = feeInfo 
    ? (feeInfo.feeRate * 100).toFixed(2) 
    : '0.30';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 背景遮罩 */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onHide}>
      </div>
      
      {/* 模态窗口 */}
      <div className={`bg-dialog-bg relative w-1/3 rounded-md shadow-2xl p-6 text-white transition-all duration-500 transform ${
        isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10'
      }`}>
        {/* 标题 */}
        <div className="bg-voice-bg text-white font-bold shadow-normal absolute z-1 -mt-4 -ml-4 w-32 pl-2 py-1 text-sm">
          Add Liquidity
        </div>
        
        {/* 关闭按钮 */}
        <div className="absolute top-2 right-2 cursor-pointer" onClick={onHide}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
        
        <div className="mt-4">
          {/* First Token */}
          <div className="text-white mb-2">First Token (ALPHA)</div>
          <FlexContainer className="mb-4">
            <div className="w-3/4 pr-2">
              <input
                type="number"
                className="w-full bg-gray-800 text-white p-2 rounded text-lg font-medium"
                placeholder="0"
                value={token0Amount}
                min="0"
                onChange={handleToken0AmountChange}
              />
            </div>
            <div className="w-1/4">
              <select
                className="w-full bg-blue-600 text-white p-2 rounded text-lg font-medium"
                disabled
              >
                <option value="ALPHA">ALPHA</option>
              </select>
            </div>
          </FlexContainer>

          {/* + 符号 */}
          <div className="flex justify-center items-center my-4">
            <span className="text-2xl font-bold">+</span>
          </div>

          {/* Second Token */}
          <div className="text-white mb-2">Second Token (BETA)</div>
          <FlexContainer className="mb-4">
            <div className="w-3/4 pr-2">
              <input
                type="number"
                className="w-full bg-gray-800 text-white p-2 rounded text-lg font-medium"
                placeholder="0"
                value={token1Amount}
                disabled
              />
            </div>
            <div className="w-1/4">
              <select
                className="w-full bg-blue-600 text-white p-2 rounded text-lg font-medium"
                disabled
              >
                <option value="BETA">BETA</option>
              </select>
            </div>
          </FlexContainer>
          
          {/* Fee and Rewards Info */}
          <div className="bg-gray-800 p-3 rounded mb-4 text-sm">
            <div className="mb-2">
              <div className="font-semibold border-b border-gray-700 pb-1 mb-1">Fee Information</div>
              <div className="flex justify-between">
                <span>Exchange Fee Rate:</span>
                <span>{feeRateFormatted}%</span>
              </div>
            </div>
            
            {isWalletConnected && (
              <div>
                <div className="font-semibold border-b border-gray-700 pb-1 mb-1 mt-2">My Rewards</div>
                <div className="flex justify-between">
                  <span>Pool Share:</span>
                  <span>{userSharePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Earned ALPHA:</span>
                  <span>{userRewards?.token0 || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Earned BETA:</span>
                  <span>{userRewards?.token1 || '0'}</span>
                </div>
              </div>
            )}
          </div>

          {/* 按钮 */}
          <FlexContainer className="justify-end gap-2">
            <BaseButton
              className="bg-gray-700 text-white px-6 py-2 font-medium"
              onClick={onHide}
            >
              Cancel
            </BaseButton>
            {!isWalletConnected ? (
              <BaseButton
                className="bg-blue-600 text-white px-6 py-2 font-medium"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </BaseButton>
            ) : (
              <BaseButton
                className="bg-blue-600 text-white px-6 py-2 font-medium"
                onClick={handleAddLiquidity}
              >
                Add Liquidity
              </BaseButton>
            )}
          </FlexContainer>
        </div>
      </div>
    </div>
  );
} 