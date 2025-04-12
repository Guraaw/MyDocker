import { Button } from "@headlessui/react";
import { FlexContainer } from "./Containers";

// eslint-disable-next-line react-refresh/only-export-components
export const clickSound = new Audio("./click.wav");

export function BaseButton({
  children,
  className = "",
  onClick,
  style = {},
  ref,
  blur = true,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLButtonElement>;
  blur?: boolean;
}) {
  return (
    <Button
      className={`${className} pointer-events-auto relative flex justify-start overflow-hidden text-left ${blur ? "backdrop-blur-xs" : ""} after:pointer-events-none after:absolute after:inset-0 after:transition-colors active:after:bg-black/20`}
      style={style}
      ref={ref}
      onClick={(event) => {
        clickSound.currentTime = 0;
        clickSound.play();

        if (onClick !== undefined) {
          onClick(event);
        }
      }}
    >
      {children}
    </Button>
  );
}

export function SmallButton({ 
  title = "", 
  subtitle = "", 
  onClick,
  tokenBalance
}: { 
  title?: string | React.ReactNode; 
  subtitle?: string | React.ReactNode; 
  onClick?: () => void;
  tokenBalance?: string;
}) {
  // 如果提供了tokenBalance，就显示余额，否则显示原来的title
  const displayTitle = tokenBalance ? Number(tokenBalance).toFixed(2) : title;
  
  return (
    <BaseButton className="bg-button-dark h-40 w-85 items-center pl-2" onClick={onClick}>
      <div className="border-l-border-dark h-32 flex-col border-l-8 pl-4">
        <div className="font-primary text-title-dark text-xx-large mt-1 w-fit">
          {displayTitle}
        </div>
        <div className="font-secondary text-subtitle-dark text-large -mt-4 font-bold">
          {subtitle}
        </div>
      </div>
    </BaseButton>
  );
}

export function StoreButton({ onClick }: { onClick?: () => void }) {
  return (
    <BaseButton className="bg-button-light h-35 w-60 items-center pl-2" onClick={onClick}>
      <div className="h-30 flex-col pl-2">
        <div className="font-primary text-title-light text-x-large mt-3 w-fit">
          Exchange Center
        </div>
        <div className="font-secondary text-subtitle-light text-large -mt-4 font-bold">
          store
        </div>
      </div>
    </BaseButton>
  );
}

export function RecruitButton({ title = "", subtitle = "" }) {
  return (
    <BaseButton className="h-22 w-53 flex-col items-center" blur={false}>
      <div className="font-secondary text-subtitle-light text-large font-bold">
        {title}
      </div>
      <div className="font-primary text-title-light text-large -mt-3">
        {subtitle}
      </div>
    </BaseButton>
  );
}

export function TerminalButton({ 
  onConnect,
  isWalletConnected = false
}: { 
  onConnect?: () => void;
  isWalletConnected?: boolean;
}) {
  return (
    <BaseButton 
      className="bg-button-dark -mt-6 h-55 w-220 translate-x-30 -translate-z-10 overflow-hidden"
      onClick={onConnect}
    >
      <FlexContainer
        gap={0}
        className="text-title-light m-5 w-58 flex-col text-right"
      >
        <div className={`text-huge ${isWalletConnected ? 'bg-purple-500/50' : 'bg-red-500/50'} text-shadow-large flex justify-center items-center h-12`}>
          {isWalletConnected ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          )}
        </div>
        <div className="bg-sanity-dark text-large pr-6 text-center">
          {isWalletConnected ? "Wallet Bound" : "No Wallet Bound"}
        </div>
      </FlexContainer>

      <FlexContainer gap={0} className="ml-2 flex-col">
        <div className="font-secondary text-huge text-subtitle-dark font-bold">
          terminal
        </div>
        <div className="bg-current-wrapper text-title-very-dark -mt-6 size-fit rounded-md px-2.5 pt-0.5 pb-1 text-normal">
          Wallet Status
        </div>
        <div className="text-title-dark size-fit text-normal">
          {isWalletConnected ? "Connected" : "Click to Connect"}
        </div>
      </FlexContainer>
    </BaseButton>
  );
}

export function FriendsButton() {
  return (
    <BaseButton className="bg-button-friends h-17 w-48 flex-col items-end pr-2">
      <div className="font-secondary text-subtitle-mid text-normal">
        friends
      </div>
      <div className="font-primary text-title-light text-large -mt-3 w-fit">
        Friends
      </div>
    </BaseButton>
  );
}

export function ArchiveButton() {
  return (
    <BaseButton className="bg-button-archive h-17 w-48 flex-col items-end pr-2">
      <div className="font-secondary text-subtitle-mid text-normal">
        archive
      </div>
      <div className="font-primary text-title-light text-large -mt-3 w-fit">
        Archives
      </div>
    </BaseButton>
  );
}

export function DepotButton() {
  return (
    <BaseButton className="bg-button-depot -ml-6 w-24 flex-col pt-6 pl-1">
      <div className="font-primary text-title-dark text-x-large">X</div>
      <div className="font-secondary text-title-very-dark text-large -mt-3">
        depot
      </div>
    </BaseButton>
  );
}
