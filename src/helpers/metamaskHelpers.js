import { ethers } from "ethers";

const getErrorObject = (errorCode) => {
  if (errorCode === 4001) {
    return {
      status: false,
      message: "Please connect your wallet to continue",
    };
  } else {
    return {
      status: false,
      message: "Oops, something went wrong!",
    };
  }
};

const checkIsWalletConnected = async () => {
  const { ethereum } = window;
  try {
    if (!ethereum) {
      return {
        status: false,
        message: "Please install metamask!",
      };
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      return {
        status: true,
        account,
        provider,
        signer,
      };
    } else {
      return {
        status: false,
        message: "",
      };
    }
  } catch (error) {
    return getErrorObject(error.code);
  }
};

const connectWallet = async () => {
  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const network = await provider.getNetwork();

  try {
    if (!ethereum) {
      return {
        status: false,
        message: "Please install metamask!",
      };
    }

    if (network.chainId !== 4) {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x4",
          },
        ],
      });
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected", accounts[0]);
    return {
      status: true,
      account: accounts[0],
    };
  } catch (error) {
    return getErrorObject(error.code);
  }
};

const sendEther = async (receiverAddress, amount) => {
  try {
    const { signer, status } = await checkIsWalletConnected();
    if (!status) {
      return {
        status: false,
        message: "Please connect your wallet to tip!",
      };
    }

    const senderAddress = await signer.getAddress();

    const transactionResponse = await signer.sendTransaction({
      from: senderAddress,
      to: receiverAddress,
      value: ethers.utils.parseEther(amount.toString()),
    });
    await transactionResponse.wait();
    return {
      status: true,
      message: "Tip successful!",
    };
  } catch (error) {
    if (error.code !== 4001) {
      return {
        status: false,
        message: "Oops, something went wrong!",
      };
    } else {
      return {
        status: false,
        message: "",
      };
    }
  }
};

export { connectWallet, checkIsWalletConnected, sendEther };
