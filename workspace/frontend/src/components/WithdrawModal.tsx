import { useState, useEffect } from "react";
import { BaseButton } from "./Buttons";
import { FlexContainer } from "./Containers";

interface WithdrawModalProps {
  show: boolean;
  onHide: () => void;
  contracts: any;
  lpTokenAmount: string;
  setLpTokenAmount: (amount: string) => void;
  isWalletConnected: boolean;
  handleConnectWallet: () => Promise<void>;
  handleWithdrawLiquidity: () => Promise<void>;
  balanceLP: number;
  userRewards?: {
    share: number;
    token0: string;
    token1: string;
  };
}

export function WithdrawModal({
  show,
  onHide,
  contracts,
  lpTokenAmount,
  setLpTokenAmount,
  isWalletConnected,
  handleConnectWallet,
  handleWithdrawLiquidity,
  balanceLP,
  userRewards
}: WithdrawModalProps) {
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
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
  
  // 处理LP代币数量变化
  const handleLpTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLpTokenAmount(value);
  };
  
  // 设置最大金额
  const setMaxAmount = () => {
    setLpTokenAmount(balanceLP.toString());
  };

  if (!isRendered) return null;

  // Format user's share as percentage
  const userSharePercent = userRewards && userRewards.share > 0 
    ? (userRewards.share * 100).toFixed(2) 
    : '0';

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
          Withdraw LQ
        </div>
        
        {/* 关闭按钮 */}
        <div className="absolute top-2 right-2 cursor-pointer" onClick={onHide}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
        
        <div className="mt-4">
          <div className="text-white mb-2">LP Token Amount</div>
          <FlexContainer className="mb-4">
            <div className="w-3/4 pr-2">
              <input
                type="number"
                className="w-full bg-gray-800 text-white p-2 rounded text-lg font-medium"
                placeholder="0"
                value={lpTokenAmount}
                min="0"
                max={balanceLP.toString()}
                onChange={handleLpTokenAmountChange}
              />
            </div>
            <div className="w-1/4">
              <BaseButton
                className="bg-blue-600 text-white p-2 rounded text-lg font-medium w-full"
                onClick={setMaxAmount}
              >
                Max
              </BaseButton>
            </div>
          </FlexContainer>

          <div className="text-gray-300 mb-4 text-sm">
            Available LP Token Balance: {balanceLP}
          </div>

          {/* Rewards Info */}
          {isWalletConnected && userRewards && (
            <div className="bg-gray-800 p-3 rounded mb-4 text-sm">
              <div className="font-semibold border-b border-gray-700 pb-1 mb-2">Rewards to Withdraw</div>
              <div className="flex justify-between mb-1">
                <span>Pool Share:</span>
                <span>{userSharePercent}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Earned ALPHA:</span>
                <span>{userRewards.token0}</span>
              </div>
              <div className="flex justify-between">
                <span>Earned BETA:</span>
                <span>{userRewards.token1}</span>
              </div>
            </div>
          )}

          {/* 说明 */}
          <div className="bg-gray-800/50 p-3 rounded mb-4">
            <p className="text-gray-300 text-sm">
              Withdrawing liquidity will return your ALPHA and BETA tokens from the pool and burn your LP tokens.
              {isWalletConnected && userRewards && Number(userSharePercent) > 0 && 
                " You will also receive your share of accumulated trading fees."}
            </p>
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
                onClick={handleWithdrawLiquidity}
                style={{ opacity: !lpTokenAmount || Number(lpTokenAmount) <= 0 || Number(lpTokenAmount) > balanceLP ? 0.5 : 1, 
                        pointerEvents: !lpTokenAmount || Number(lpTokenAmount) <= 0 || Number(lpTokenAmount) > balanceLP ? 'none' : 'auto' }}
              >
                Withdraw Liquidity
              </BaseButton>
            )}
          </FlexContainer>
        </div>
      </div>
    </div>
  );
} 