export const useWithdrawFunds = () => {
  return {
    isLoading: false,
    data: {
      isComplete: false,
      txnLink: 'https://pearl.xyz/transactions',
      message: 'Withdrawal initiated. Preparing your funds...',
    },
  };
};
