import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";

import Spinner from "./Spinner";

import { sendEther } from "./helpers/metamaskHelpers";

const Card = ({ recommendation, setAlert }) => {
  const [isLoading, setIsLoading] = useState(false);

  /*  const receiverAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; */

  const formattedUserAddress = `${recommendation.userAddress.slice(
    0,
    4
  )}...${recommendation.userAddress.slice(-4)}`;

  const onTipPressed = async () => {
    setIsLoading(true);
    const result = await sendEther(recommendation.userAddress, 0.001);
    if (!result.status) {
      setAlert({ status: false, alertMessage: result.message });
    } else {
      setAlert({ status: true, alertMessage: result.message });
    }
    setIsLoading(false);
  };

  const button = isLoading ? (
    <button className="" onClick={onTipPressed}>
      <Spinner />
    </button>
  ) : (
    <button className="btn" onClick={onTipPressed}>
      Tip <FontAwesomeIcon icon={faCoins} className="p-1" spin />
    </button>
  );

  return (
    <div className="basis-1/4">
      <div className="card w-64 md:w-72 xl:w-80 max-h-min h-96 bg-primary text-primary-content">
        <div className="card-body text-left overflow-y-auto no-scrollbar">
          <h2 className="card-title">{recommendation.name}</h2>
          <p>Artist: {recommendation.artist}</p>
          <p>Album: {recommendation.album}</p>
          <a
            className="truncate"
            href={recommendation.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Url: {recommendation.url}
          </a>
          <p>Message: {recommendation.message}</p>
          <p>User: {formattedUserAddress}</p>
          <div className="card-actions justify-end flex-nowrap ml-3">
            {button}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
