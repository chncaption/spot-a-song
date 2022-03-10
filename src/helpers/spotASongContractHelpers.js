import { ethers } from "ethers";
import abi from "../utils/SpotASong.json";
import { checkIsWalletConnected } from "./metamaskHelpers";

const contractAddress = "0xFd10F50bFb724c83dC705D764EaED1133C3ca2a2";
const contractABI = abi.abi;

const getContract = () => {
  try {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const spotASongContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      return spotASongContract;
    }
  } catch (error) {
    return {
      status: false,
      message: "Oops something went wrong!",
    };
  }
};

const addRecommendation = async ({ message, artist, album, name, url }) => {
  try {
    const { signer, status } = await checkIsWalletConnected();
    if (!status) {
      return {
        status: false,
        message: "Please connect your wallet to add new recommendation!",
      };
    }
    const spotASongContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    const transaction = await spotASongContract.addRecommendation(
      message,
      artist,
      album,
      name,
      url
    );
    await transaction.wait();

    return {
      status: true,
      message: "Successfully recommended a song!",
    };
  } catch (error) {
    if (error.error.code === -32603) {
      return {
        status: false,
        message: `${error.error.message.split(":")[1]}`,
      };
    }
    return {
      status: false,
      message: "Oops something went wrong!",
    };
  }
};

const getAllRecommendations = async () => {
  try {
    const { signer, status } = await checkIsWalletConnected();
    if (!status) {
      return {
        status: false,
        message: "",
      };
    }
    const spotASongContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    const recommendations = await spotASongContract.getAllRecommendations();
    const formattedRecommendations = recommendations.map((recommendation) => {
      return {
        userAddress: recommendation.user,
        timestamp: new Date(recommendation.timestamp * 1000),
        message: recommendation.message,
        artist: recommendation.artist,
        name: recommendation.name,
        album: recommendation.album,
        url: recommendation.url,
      };
    });

    return {
      status: true,
      recommendations: formattedRecommendations,
    };
  } catch (error) {
    return {
      status: false,
      message: "Oops something went wrong!",
    };
  }
};

export { getContract, addRecommendation, getAllRecommendations };
