import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";  // Import ethers.js library
import { getAmountOut, getContracts, getPoolInfo, getTokenBalances, getRequiredAmount1, swapTokens, addLiquidity, withdrawLiquidity, getFeeInfo, calculateSwapFee, getUserRewards } from "./utils/contract";  // Import helper functions
import {
  ArchiveButton,
  BaseButton,
  DepotButton,
  FriendsButton,
  SmallButton,
  StoreButton,
  TerminalButton,
} from "./components/Buttons.tsx";
import {
  DatetimeCol,
  ItemsCol,
  NewsCol,
  RecuritCol,
} from "./components/Columns.tsx";
import {
  FlexContainer,
  LargeContainer,
  ThreeDContainer,
} from "./components/Containers.tsx";
import { ChangeIcon, HideIcon, LevelIcon } from "./components/Icons.tsx";
import { SwapModal } from "./components/SwapModal";
import { LiquidityModal } from "./components/LiquidityModal";
import { WithdrawModal } from "./components/WithdrawModal";
import { swapTokens as executeSwap, addLiquidity as executeAddLiquidity, withdrawLiquidity as executeWithdrawLiquidity } from "./utils/contract";

const bgm = new Audio("./bgm.mp3");
bgm.loop = true;

function App() {
  // 处理缩放
  const [scale, setScale] = useState(
    Math.min(window.innerWidth / 1600, window.innerHeight / 900),
  );
  // 处理3D变换跟随鼠标效果
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // 处理主题切换
  const [theme] = useState(localStorage.getItem("theme") || "ocean");

  /* wallet related */
  const [isWalletConnected, setIsWalletConnected] = useState(false); // Track wallet connection
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [provider, setProvider] = useState(null);

  /* balance related */
  const [balance0, setBalance0] = useState(0);
  const [balance1, setBalance1] = useState(0);
  const [balanceLP, setBalanceLP] = useState(0);
  const [poolInfo, setPoolInfo] = useState({ token0Balance: '0', token1Balance: '0' });

  /* fee related */
  const [feeInfo, setFeeInfo] = useState({ feeRate: 0.003, lpRewardShare: 0.7, feesCollected: { token0: '0', token1: '0' } });
  const [userRewards, setUserRewards] = useState({ share: 0, token0: '0', token1: '0' });

  /* swap related */
  const [fromToken, setFromToken] = useState('ALPHA');
  const [toToken, setToToken] = useState('BETA');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  /* add liquidity related */
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  
  /* withdraw liquidity related */
  const [lpTokenAmount, setLpTokenAmount] = useState('');
  
  /* modal control */
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showPoolInfoModal, setShowPoolInfoModal] = useState(false);
  
  const handleConnectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("MetaMask not installed");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        const initializedContracts = await getContracts(signer);
        
        setProvider(provider);
        setAccount(accounts[0]);
        setContracts(initializedContracts);
        setIsWalletConnected(true);

        // get balance
        const balances = await getTokenBalances(initializedContracts, accounts[0]);
        setBalance0(balances.token0);
        setBalance1(balances.token1);
        setBalanceLP(balances.lpToken);

        // get pool info
        const info = await getPoolInfo(initializedContracts);
        setPoolInfo(info);

        // get fee info
        const fees = await getFeeInfo(initializedContracts);
        setFeeInfo(fees);

        // get user rewards
        const rewards = await getUserRewards(initializedContracts, accounts[0]);
        setUserRewards(rewards);

        alert(`Wallet connected!`);
      } catch (error) {
          console.error("Detailed connection error:", error);
          alert(`Failed to connect: ${error.message}`);
      }
  };

  // Auto-refresh pool info every 15 seconds
  useEffect(() => {
    const refreshPoolInfo = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const initializedContracts = await getContracts(signer);
          // get pool info
          const info = await getPoolInfo(initializedContracts);
          setPoolInfo(info);

          // refresh fee info too
          if (isWalletConnected && account) {
            const fees = await getFeeInfo(initializedContracts);
            setFeeInfo(fees);
            
            const rewards = await getUserRewards(initializedContracts, account);
            setUserRewards(rewards);
          }
        }
      } catch (error) {
        console.error("Error refreshing pool info:", error);
      }
    };

    // Call once immediately
    refreshPoolInfo();
    
    // Set up interval to call every 15 seconds
    const intervalId = setInterval(refreshPoolInfo, 15000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [isWalletConnected, account]);

  const handleSwapTokens = async () => {
    if (!contracts || !fromAmount || !isWalletConnected) {
      alert("Please connect wallet and enter amount");
      return;
    }
    
    try {
      const mappedFromToken = fromToken === 'ALPHA' ? 'token0' : 'token1';
      const mappedToToken = toToken === 'ALPHA' ? 'token0' : 'token1';
      
      await executeSwap(contracts, mappedFromToken, fromAmount, mappedToToken);
      
      const balances = await getTokenBalances(contracts, account);
      setBalance0(balances.token0);
      setBalance1(balances.token1);
      setBalanceLP(balances.lpToken);
      
      const newPoolInfo = await getPoolInfo(contracts);
      setPoolInfo(newPoolInfo);
      
      setFromAmount('');
      setToAmount('');
      
      setShowSwapModal(false);
      
      // Update fee info and user rewards after swap
      const fees = await getFeeInfo(contracts);
      setFeeInfo(fees);
      
      const rewards = await getUserRewards(contracts, account);
      setUserRewards(rewards);
      
      alert("Exchange successful!");
    } catch (error) {
      console.error("Exchange failed:", error);
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('invalid block tag')) {
        alert("Block synchronizing, please try again later");
      } else {
        alert(`Exchange failed: ${error && typeof error === 'object' && 'message' in error ? error.message : "Unknown error"}`);
      }
    }
  };

  const handleAddLiquidity = async () => {
    if (!contracts || !account || !token0Amount || !isWalletConnected) {
      alert("Please connect wallet and enter amount");
      return;
    }
    
    try {
      await executeAddLiquidity(contracts, token0Amount);
      
      const balances = await getTokenBalances(contracts, account);
      setBalance0(balances.token0);
      setBalance1(balances.token1);
      setBalanceLP(balances.lpToken);
      
      const newPoolInfo = await getPoolInfo(contracts);
      setPoolInfo(newPoolInfo);
      
      setToken0Amount('');
      setToken1Amount('');
      
      setShowLiquidityModal(false);
      
      // Update fee info and user rewards after adding liquidity
      const fees = await getFeeInfo(contracts);
      setFeeInfo(fees);
      
      const rewards = await getUserRewards(contracts, account);
      setUserRewards(rewards);
      
      alert("Liquidity added successfully!");
    } catch (error) {
      console.error("Failed to add liquidity:", error);
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('invalid block tag')) {
        alert("Block synchronizing, please try again later");
      } else {
        alert(`Failed to add liquidity: ${error && typeof error === 'object' && 'message' in error ? error.message : "Unknown error"}`);
      }
    }
  };

  const handleWithdrawLiquidity = async () => {
    if (!contracts || !account || !lpTokenAmount || !isWalletConnected) {
      alert("Please connect wallet and enter amount");
      return;
    }
    
    try {
      await executeWithdrawLiquidity(contracts, lpTokenAmount);
      
      const balances = await getTokenBalances(contracts, account);
      setBalance0(balances.token0);
      setBalance1(balances.token1);
      setBalanceLP(balances.lpToken);
      
      const newPoolInfo = await getPoolInfo(contracts);
      setPoolInfo(newPoolInfo);
      
      setLpTokenAmount('');
      
      setShowWithdrawModal(false);
      
      // Update fee info and user rewards after withdrawing liquidity
      const fees = await getFeeInfo(contracts);
      setFeeInfo(fees);
      
      const rewards = await getUserRewards(contracts, account);
      setUserRewards(rewards);
      
      alert("Liquidity withdrawn successfully!");
    } catch (error) {
      console.error("Failed to withdraw liquidity:", error);
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('invalid block tag')) {
        alert("Block synchronizing, please try again later");
      } else {
        alert(`Failed to withdraw liquidity: ${error && typeof error === 'object' && 'message' in error ? error.message : "Unknown error"}`);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setScale(Math.min(window.innerWidth / 1600, window.innerHeight / 900));
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: -e.clientY / window.innerHeight + 0.5,
      });
    };

    // 此处重力感应好像没有生效
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null && e.gamma !== null) {
        setMousePosition({
          x: Math.min(Math.max(e.gamma / 45, -0.5), 0.5),
          y: Math.min(Math.max(e.beta / 45, -0.5), 0.5),
        });
      }
    };

    localStorage.setItem("theme", theme);

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("deviceorientation", handleDeviceOrientation);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, [theme]);

  const dialogRef = useRef<HTMLButtonElement>(null);
  const left2DRef = useRef<HTMLDivElement>(null);
  const left3DRef = useRef<HTMLDivElement>(null);
  const right3DRef = useRef<HTMLDivElement>(null);

  return (
    /* 最外层div负责处理页面缩放 */
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center", // 修改为center
        width: "1600px",
        height: "900px",
        position: "absolute", // 添加绝对定位
        left: "50%", // 水平居中
        top: "50%", // 垂直居中
        marginLeft: "-800px", // 向左移动宽度的一半
        marginTop: "-450px", // 向上移动高度的一半
        overflow: "hidden", // 添加溢出隐藏
      }}
    >
      <BaseButton className="absolute -z-1 -left-10 -mt-20 -ml-70 after:hidden" blur={false}>
        <img
          src="./assistant.png"
          className="w-2000 h-auto"
          onClick={() => {
            if (left2DRef.current?.getAttribute("hidden")) {
              left2DRef.current?.removeAttribute("hidden");
              left3DRef.current?.removeAttribute("hidden");
              right3DRef.current?.removeAttribute("hidden");
              /* 强制触发重绘 */
              void left2DRef.current?.offsetWidth;
              void left3DRef.current?.offsetWidth;
              void right3DRef.current?.offsetWidth;
              left2DRef.current?.style.setProperty("opacity", "1");
              left3DRef.current?.style.setProperty("opacity", "1");
              right3DRef.current?.style.setProperty("opacity", "1");
            } else {
              dialogRef.current?.style.setProperty(
                "opacity",
                dialogRef.current.style.opacity == "0" ? "1" : "0",
              );
            }
          }}
        />
      </BaseButton>

      {/* 2D元素 */}
      <LargeContainer className="items-start justify-start" ref={left2DRef}>
        <FlexContainer className="z-2 mt-8 ml-8 gap-8">
          <BaseButton
            className="w-16 shadow-2xl"
            blur={false}
            onClick={() => {
              if (bgm.paused) {
                bgm.play();
              } else {
                bgm.pause();
              }
            }}
          >
            <img src="./icon_svg/settings.svg" />
          </BaseButton>
          <BaseButton className="w-16 shadow-2xl" blur={false}>
            <img src="./icon_svg/notice.svg" />
          </BaseButton>
          <BaseButton className="w-16 shadow-2xl" blur={false}>
            <img src="./icon_svg/mail.svg" />
          </BaseButton>
          <BaseButton className="w-16 shadow-2xl" blur={false}>
            <img src="./icon_svg/calendar.svg" />
          </BaseButton>
        </FlexContainer>

        <LevelIcon level={120} />
        <div className="bg-level-bg -z-1 -mt-12 h-12 w-48" />

        <div className="text-large ml-12 text-center">
          {isWalletConnected ? 'Wallet Connected' : 'Cromemadnd'}
        </div>
        <div className="text-x-small ml-12 text-center">
          {isWalletConnected && account 
            ? `ID: ${typeof account === 'string' ? account.slice(0, 8) + '...' + account.slice(-4) : account}` 
            : 'ID: 000000000'}
        </div>
      </LargeContainer>

      {/* 左侧3D元素 */}
      <LargeContainer className="items-start justify-end" ref={left3DRef}>
        <ThreeDContainer
          rotx={mousePosition.y / 1.8}
          roty={6 + mousePosition.x * 2}
          tranx={-mousePosition.x * 2}
          className="mb-15 ml-12"
        >
          <FlexContainer className="absolute mt-112 ml-68" gap={2}>
            <BaseButton
              className="w-12"
              blur={false}
              onClick={() => {
                left2DRef.current?.style.setProperty("opacity", "0");
                left3DRef.current?.style.setProperty("opacity", "0");
                right3DRef.current?.style.setProperty("opacity", "0");
                setTimeout(() => {
                  left2DRef.current?.setAttribute("hidden", "true");
                  left3DRef.current?.setAttribute("hidden", "true");
                  right3DRef.current?.setAttribute("hidden", "true");
                }, 500);
              }}
            >
              <HideIcon />
            </BaseButton>

            <BaseButton className="w-12" blur={false}>
              <ChangeIcon />
            </BaseButton>

            <div className="-z-1 mt-6 -ml-2 h-0.5 w-36 bg-gradient-to-r from-white to-transparent"></div>
          </FlexContainer>

          <BaseButton
            ref={dialogRef}
            className="bg-dialog-bg mt-140 ml-2 h-32 w-122 flex-col overflow-visible transition-opacity duration-500"
            onClick={() => {
              dialogRef.current?.style.setProperty(
                "opacity",
                dialogRef.current.style.opacity == "0" ? "1" : "0",
              );
            }}
          >
            <div className="bg-voice-bg text-voice-text shadow-normal absolute z-1 -mt-2 -ml-2 w-40 pl-1">
              VOICE
            </div>
            <FlexContainer className="text-small absolute h-32 items-center pr-6 pl-6">
              May all the beauty be blessed.
            </FlexContainer>
            <div className="text-small mt-22 mr-4 text-right">▼</div>
          </BaseButton>
          <FlexContainer>
            <NewsCol />

            <FlexContainer className="-ml-3 flex-col" gap={2}>
              <FriendsButton />
              <ArchiveButton />
            </FlexContainer>
          </FlexContainer>
        </ThreeDContainer>
      </LargeContainer>

      {/* 交换模态窗口 */}
      <SwapModal
        show={showSwapModal}
        onHide={() => setShowSwapModal(false)}
        contracts={contracts}
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        setFromToken={setFromToken}
        setToToken={setToToken}
        setFromAmount={setFromAmount}
        setToAmount={setToAmount}
        swapTokens={handleSwapTokens}
        feeInfo={feeInfo}
      />
      
      {/* 流动性模态窗口 */}
      <LiquidityModal
        show={showLiquidityModal}
        onHide={() => setShowLiquidityModal(false)}
        contracts={contracts}
        token0Amount={token0Amount}
        token1Amount={token1Amount}
        setToken0Amount={setToken0Amount}
        setToken1Amount={setToken1Amount}
        isWalletConnected={isWalletConnected}
        handleConnectWallet={handleConnectWallet}
        handleAddLiquidity={handleAddLiquidity}
        feeInfo={feeInfo}
        userRewards={userRewards}
      />
      
      {/* 提取流动性模态窗口 */}
      <WithdrawModal
        show={showWithdrawModal}
        onHide={() => setShowWithdrawModal(false)}
        contracts={contracts}
        lpTokenAmount={lpTokenAmount}
        setLpTokenAmount={setLpTokenAmount}
        isWalletConnected={isWalletConnected}
        handleConnectWallet={handleConnectWallet}
        handleWithdrawLiquidity={handleWithdrawLiquidity}
        balanceLP={Number(balanceLP)}
        userRewards={userRewards}
      />

      {/* 池信息模态窗口 */}
      {isWalletConnected && (
        <div className={`fixed z-50 bottom-4 right-4 transition-opacity duration-300 ${isWalletConnected ? 'opacity-100' : 'opacity-0'}`}>
          <BaseButton
            className="bg-dialog-bg shadow-lg px-3 py-2 rounded-md text-white"
            onClick={() => setShowPoolInfoModal(true)}
          >
            <div className="flex items-center">
              <span className="mr-2">View Pool Info</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
            </div>
          </BaseButton>
        </div>
      )}
      
      {/* 池信息模态窗口内容 */}
      {showPoolInfoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setShowPoolInfoModal(false)}>
          </div>
          
          <div className="bg-dialog-bg relative w-1/3 rounded-md shadow-2xl p-6 text-white">
            <div className="bg-voice-bg text-white font-bold shadow-normal absolute z-1 -mt-4 -ml-4 w-32 pl-2 py-1">
              Pool Information
            </div>
            
            <div className="absolute top-2 right-2 cursor-pointer" onClick={() => setShowPoolInfoModal(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
            
            <div className="mt-4">
              <div className="bg-gray-800 p-4 rounded mb-4">
                <h3 className="text-lg font-semibold mb-2">Pool Reserves</h3>
                <div className="flex justify-between mb-1">
                  <span>ALPHA:</span>
                  <span>{poolInfo.token0Balance}</span>
                </div>
                <div className="flex justify-between">
                  <span>BETA:</span>
                  <span>{poolInfo.token1Balance}</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded mb-4">
                <h3 className="text-lg font-semibold mb-2">Accumulated Fees</h3>
                <div className="flex justify-between mb-1">
                  <span>ALPHA:</span>
                  <span>{feeInfo?.feesCollected?.token0 || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>BETA:</span>
                  <span>{feeInfo?.feesCollected?.token1 || '0'}</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded mb-4">
                <h3 className="text-lg font-semibold mb-2">Fee Settings</h3>
                <div className="flex justify-between mb-1">
                  <span>Fee Rate:</span>
                  <span>{feeInfo ? (feeInfo.feeRate * 100).toFixed(2) : '0.30'}%</span>
                </div>
                <div className="flex justify-between">
                  <span>LP Reward Share:</span>
                  <span>{feeInfo ? (feeInfo.lpRewardShare * 100).toFixed(0) : '70'}%</span>
                </div>
              </div>
              
              <BaseButton
                className="bg-blue-600 text-white px-6 py-2 font-medium w-full mt-2"
                onClick={() => setShowPoolInfoModal(false)}
              >
                Close
              </BaseButton>
            </div>
          </div>
        </div>
      )}

      {/* 右侧3D元素 */}
      <LargeContainer className="items-end justify-center" ref={right3DRef}>
        <ThreeDContainer
          rotx={mousePosition.y / 1.8}
          roty={mousePosition.x * 2 - 6}
          tranx={-mousePosition.x * 2}
          className="items-end"
        >
          <DatetimeCol />
          <ItemsCol balance0={balance0} balance1={balance1} balanceLP={balanceLP} />

          <TerminalButton onConnect={handleConnectWallet} isWalletConnected={isWalletConnected} />
          <FlexContainer className="-translate-z-10">
            <SmallButton 
              subtitle={<span className="font-sans text-subtitle-dark text-large font-medium">ALPHA</span>}
              tokenBalance={poolInfo.token0Balance}
            />
            <SmallButton 
              subtitle={<span className="font-sans text-subtitle-dark text-large font-medium">BETA</span>}
              tokenBalance={poolInfo.token1Balance}
            />
            <div className="bg-placeholder-bg -mr-16 w-32"></div>
          </FlexContainer>

          <FlexContainer gap={0} className="">
            <StoreButton onClick={() => {
              if (!isWalletConnected) {
                alert("Please connect wallet first");
                return;
              }
              setShowSwapModal(true);
            }} />
            <RecuritCol />
            <div className="w-14" />
          </FlexContainer>

          <FlexContainer className="translate-x-5 translate-y-10 -translate-z-20">
            <SmallButton 
              subtitle="liquidity" 
              title="Add LP"
              onClick={() => {
                if (!isWalletConnected) {
                  alert("Please connect wallet first");
                }
                setShowLiquidityModal(true);
              }}
            />
            <SmallButton 
              subtitle="withdraw" 
              title="Draw LP"
              onClick={() => {
                if (!isWalletConnected) {
                  alert("Please connect wallet first");
                }
                setShowWithdrawModal(true);
              }}
            />
            <DepotButton />
          </FlexContainer>
        </ThreeDContainer>
      </LargeContainer>
    </div>
  );
}

export default App;
