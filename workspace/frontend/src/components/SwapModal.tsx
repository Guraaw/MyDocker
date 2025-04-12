import { useState, useEffect } from "react";
import { getAmountOut, calculateSwapFee } from "../utils/contract";
import { BaseButton } from "./Buttons";
import { FlexContainer } from "./Containers";

interface SwapModalProps {
  show: boolean;
  onHide: () => void;
  contracts: any;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  setFromToken: (token: string) => void;
  setToToken: (token: string) => void;
  setFromAmount: (amount: string) => void;
  setToAmount: (amount: string) => void;
  swapTokens: () => Promise<void>;
  feeInfo?: {
    feeRate: number;
    lpRewardShare: number;
    feesCollected: {
      token0: string;
      token1: string;
    }
  };
}

export function SwapModal({
  show,
  onHide,
  contracts,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  setFromToken,
  setToToken,
  setFromAmount,
  setToAmount,
  swapTokens,
  feeInfo
}: SwapModalProps) {
  
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [swapFee, setSwapFee] = useState('0');
  
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
  
  const handleFromAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    
    if (value && !isNaN(Number(value))) {
      const output = await calculateOutputAmount(value, fromToken, toToken);
      setToAmount(output);
      
      // Calculate fee - 使用 await 处理异步函数
      try {
        const fee = await calculateSwapFee(contracts, value);
        setSwapFee(fee);
      } catch (error) {
        console.error("Error calculating swap fee:", error);
        setSwapFee('0');
      }
    } else {
      setToAmount('');
      setSwapFee('0');
    }
  };
  
  const handleTokenSwitch = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setToAmount('');
    setSwapFee('0');
  };
  
  const calculateOutputAmount = async (inputAmount: string, tokenIn: string, tokenOut: string) => {
    if (!inputAmount || !contracts || !tokenIn || !tokenOut) {
      return '0';
    }

    try {
      const mappedTokenIn = tokenIn === 'ALPHA' ? 'token0' : 'token1';
      const mappedTokenOut = tokenOut === 'ALPHA' ? 'token0' : 'token1';

      const result = await getAmountOut(
        contracts,
        mappedTokenIn,
        inputAmount,
        mappedTokenOut
      );
      return result;
    } catch (error) {
      console.error("Error calculating output amount:", error);
      return '0';
    }
  };

  if (!isRendered) return null;

  const feeRate = feeInfo ? (feeInfo.feeRate * 100).toFixed(2) : '0.30';
  const lpShare = feeInfo ? (feeInfo.lpRewardShare * 100).toFixed(0) : '70';

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
        <div className="bg-voice-bg text-white font-bold shadow-normal absolute z-1 -mt-4 -ml-4 w-40 pl-2 py-1">
          Trade Terminal
        </div>
        
        {/* 关闭按钮 */}
        <div className="absolute top-2 right-2 cursor-pointer" onClick={onHide}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
        
        <div className="mt-4">
          {/* From */}
          <FlexContainer className="mb-4">
            <div className="w-3/4 pr-2">
              <input
                type="number"
                className="w-full bg-gray-800 text-white p-2 rounded text-lg font-medium"
                placeholder="0"
                value={fromAmount}
                min="0"
                onChange={handleFromAmountChange}
              />
            </div>
            <div className="w-1/4">
              <select
                className="w-full bg-blue-600 text-white p-2 rounded text-lg font-medium"
                value={fromToken}
                onChange={(e) => {
                  setFromToken(e.target.value);
                  if (e.target.value === toToken) {
                    setToToken(fromToken);
                  }
                  setFromAmount('');
                  setToAmount('');
                  setSwapFee('0');
                }}
              >
                <option value="ALPHA">ALPHA</option>
                <option value="BETA">BETA</option>
              </select>
            </div>
          </FlexContainer>

          {/* 切换按钮 */}
          <div className="flex justify-center mb-4">
            <div style={{cursor: 'pointer'}} onClick={handleTokenSwitch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" className="bi bi-arrow-down-up" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.5 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L11 2.707V14.5a.5.5 0 0 0 .5.5m-7-14a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L4 13.293V1.5a.5.5 0 0 1 .5-.5"/>
              </svg>
            </div>
          </div>

          {/* To */}
          <FlexContainer className="mb-4">
            <div className="w-3/4 pr-2">
              <input
                type="number"
                className="w-full bg-gray-800 text-white p-2 rounded text-lg font-medium"
                placeholder="0"
                value={toAmount}
                disabled
              />
            </div>
            <div className="w-1/4">
              <select
                className="w-full bg-blue-600 text-white p-2 rounded text-lg font-medium"
                value={toToken}
                onChange={(e) => {
                  setToToken(e.target.value);
                  if (e.target.value === fromToken) {
                    setFromToken(toToken);
                  }
                  if (fromAmount) {
                    calculateOutputAmount(fromAmount, fromToken, e.target.value)
                      .then(output => setToAmount(output));
                  }
                }}
              >
                <option value="ALPHA">ALPHA</option>
                <option value="BETA">BETA</option>
              </select>
            </div>
          </FlexContainer>

          {/* Fee Information */}
          <div className="bg-gray-800 p-3 rounded mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span>Swap Fee ({feeRate}%):</span>
              <span>{swapFee} {fromToken}</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-1">
              <span>{lpShare}% of fees go to liquidity providers</span>
            </div>
            {feeInfo && feeInfo.feesCollected && (
              <div className="pt-1 mt-1 border-t border-gray-700">
                <div className="text-xs font-semibold mb-1">Accumulated Fees:</div>
                <div className="flex justify-between text-xs">
                  <span>ALPHA:</span>
                  <span>{feeInfo.feesCollected.token0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>BETA:</span>
                  <span>{feeInfo.feesCollected.token1}</span>
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
            <BaseButton
              className="bg-blue-600 text-white px-6 py-2 font-medium"
              onClick={swapTokens}
            >
              Exchange
            </BaseButton>
          </FlexContainer>
        </div>
      </div>
    </div>
  );
} 