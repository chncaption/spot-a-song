import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";

import Spinner from "./Spinner";

import {
  connectWallet,
  checkIsWalletConnected,
} from "./helpers/metamaskHelpers";
import { getAccessToken, getTrackInfo } from "./helpers/spotifyApiHelpers";
import {
  addRecommendation,
  getAllRecommendations,
} from "./helpers/spotASongContractHelpers";
import useDebounce from "./customHooks/useDebounce";

const trackInfoInitialState = {
  status: false,
  artist: "",
  album: "",
  name: "",
  url: "",
};

const Hero = ({
  currentWalletAccount,
  setCurrentWalletAccount,
  setAlert,
  setRecommendations,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState(false);
  const [modalState, setModalState] = useState("");
  const [recommendation, setRecommendation] = useState({
    songUrl: "",
    message: "",
  });
  const [trackInfo, setTrackInfo] = useState({
    ...trackInfoInitialState,
  });
  const debouncedSongUrl = useDebounce(recommendation.songUrl, 1000);

  const onInputChange = async (event) => {
    const { name, value } = event.target;
    setRecommendation({
      ...recommendation,
      [name]: value,
    });
  };

  const onConnectWalletClick = async () => {
    setIsLoading(true);

    const result = await connectWallet();
    if (result.status) {
      setCurrentWalletAccount(result.account);
    } else {
      setAlert({ status: false, alertMessage: result.message });
      setTrackInfo({ ...result });
      setIsLoading(false);
      return;
    }

    const recommendationsResult = await getAllRecommendations();
    if (recommendationsResult.status) {
      setRecommendations(recommendationsResult.recommendations);
    } else {
      setAlert({ status: false, alertMessage: result.message });
    }

    setIsLoading(false);
  };

  const onSubmitClick = async () => {
    setIsLoading(true);
    setModalState("");
    const result = await addRecommendation({
      ...trackInfo,
      message: recommendation.message,
    });
    if (result.status) {
      setAlert({ status: true, alertMessage: result.message });
      setRecommendation({
        songUrl: "",
        message: "",
      });
    } else {
      setAlert({ status: false, alertMessage: result.message });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const initCheckIsWalletConnected = async () => {
      setIsLoading(true);
      const result = await checkIsWalletConnected(setCurrentWalletAccount);
      if (result.status) {
        setCurrentWalletAccount(result.account);
      } else {
        setAlert({ status: false, alertMessage: result.message });
      }
      setIsLoading(false);
    };
    const initAccessToken = async () => {
      const { accessToken } = await getAccessToken();
      setSpotifyAccessToken(accessToken);
    };

    Promise.all([initCheckIsWalletConnected(), initAccessToken()]);
  }, [setCurrentWalletAccount, setAlert]);

  /* Fetches track info from spotify web API after user stops updating the song url for 1 second */
  useEffect(() => {
    const onSpotifyUrlChange = async () => {
      const result = await getTrackInfo(debouncedSongUrl, spotifyAccessToken);
      if (!result.status) {
        setAlert({ status: false, alertMessage: result.message });
        setTrackInfo({ ...trackInfoInitialState });
      } else {
        setAlert({ status: true, alertMessage: "" });
        setTrackInfo({ ...result });
      }
    };
    if (debouncedSongUrl !== "") onSpotifyUrlChange();
    else {
      setAlert({ status: true, alertMessage: "" });
      setTrackInfo({ ...trackInfoInitialState });
    }
  }, [debouncedSongUrl, spotifyAccessToken, setAlert]);

  return (
    <div className="hero ">
      <div className="hero-content text-center">
        <div className="">
          <h1 className="text-5xl font-bold">
            Spot A Song <FontAwesomeIcon icon={faMusic} size="sm" />
          </h1>
          <p className="py-6">
            Spot and recommend a song and stand a chance to be rewarded some
            eth!
          </p>
          {isLoading && <Spinner />}
          {!isLoading && !currentWalletAccount && (
            <button className="btn btn-primary" onClick={onConnectWalletClick}>
              Connect Wallet
            </button>
          )}
          {!isLoading && currentWalletAccount && (
            <label
              htmlFor="modal-RecommendSong"
              className="btn btn-primary modal-button"
              onClick={() => {
                setModalState("modal-open");
              }}
            >
              Recommend A Song
            </label>
          )}
        </div>
      </div>

      {/* Modal */}
      <input
        type="checkbox"
        id="modal-RecommendSong"
        className="modal-toggle"
      />
      <div className={`modal ${modalState}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Recommend a song and feel free to send a message too!
          </h3>
          <form>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Spotify URL</span>
              </label>
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
                value={recommendation.songUrl}
                name="songUrl"
                onChange={(e) => onInputChange(e)}
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Message</span>
              </label>
              <input
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
                value={recommendation.message}
                name="message"
                onChange={(e) => onInputChange(e)}
              />
            </div>
          </form>
          <TrackInfo trackInfo={trackInfo} />
          <div className="modal-action">
            <label
              htmlFor="modal-RecommendSong"
              className="btn"
              onClick={() => {
                setModalState("");
              }}
            >
              Close
            </label>
            <label
              htmlFor="modal-RecommendSong"
              className="btn btn-primary"
              onClick={onSubmitClick}
              disabled={!trackInfo.status}
            >
              Submit
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

const TrackInfo = ({ trackInfo }) => {
  const { status, artist, album, name, url } = trackInfo;

  if (status) {
    return (
      <>
        <div className="divider py-8">Track Information</div>
        <div className="text-left">
          <div className="my-2">
            <p className="text-sm">Song:</p>
            <p className="text-sm text-primary">{name}</p>
          </div>
          <div className="my-2">
            <p className="text-sm">Artist:</p>
            <p className="text-sm text-primary">{artist}</p>
          </div>
          <div className="my-2">
            <p className="text-sm">Album:</p>
            <p className="text-sm text-primary">{album}</p>
          </div>
          <div className="my-2">
            <p className="text-sm">Url:</p>
            <a
              className="text-sm text-primary"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
};
