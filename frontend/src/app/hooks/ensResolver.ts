import { useEnsName } from 'wagmi';

export function useEnsResolver(address?: `0x${string}`) {
  const {
    data: ensName,
    isLoading,
    isError,
    error,
  } = useEnsName({
    address,
    chainId: 1, // Mainnet chain ID
  });

  return {
    ensName,
    isLoading,
    isError,
    error,
  };
}

//const { ensName, isLoading, isError, error } = useEnsResolver('0x225f137127d9067788314bc7fcc1f36746a3c3B5');