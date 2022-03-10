import React, { useState, useEffect } from "react";

import Card from "./Card";

import {
  getAllRecommendations,
  getContract,
} from "./helpers/spotASongContractHelpers";

const RecommendationList = ({
  setAlert,
  recommendations,
  setRecommendations,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initRecommendations = async () => {
      setIsLoading(true);
      const result = await getAllRecommendations();
      if (result.status) {
        setRecommendations(result.recommendations);
      }
      setIsLoading(false);
    };

    const onNewRecommendation = (
      userAddress,
      timestamp,
      message,
      artist,
      album,
      name,
      url
    ) => {
      console.log("newrec", {
        userAddress,
        timestamp,
        message,
        artist,
        album,
        name,
        url,
      });
      setRecommendations((prevState) => [
        ...prevState,
        {
          userAddress,
          timestamp,
          message,
          artist,
          album,
          name,
          url,
        },
      ]);
    };

    const contract = getContract();

    initRecommendations();

    contract.on("NewRecommendation", onNewRecommendation);

    return () => {
      if (contract) contract.off("NewRecommendation", onNewRecommendation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return recommendations.map((recommendation) => (
    <Card
      recommendation={recommendation}
      setAlert={setAlert}
      key={recommendation.url}
    />
  ));
};

export default RecommendationList;
