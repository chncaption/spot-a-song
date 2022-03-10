import axios from "axios";
import { Buffer } from "buffer";
import { parse } from "spotify-uri";

const clientId = "8f7ec687d6d546e49f0078d900ca7c6a";
const clientSecret = "581856d87d914643aa9d70e0d080a373";

const getAccessToken = async () => {
  const { data } = await axios.post(
    "https://accounts.spotify.com/api/token",
    `grant_type=${encodeURIComponent("client_credentials")}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return {
    accessToken: data.access_token,
  };
};

const getTrackInfo = async (songUrl, accessToken) => {
  try {
    const { id } = parse(songUrl);
    const { data } = await axios.get(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      status: true,
      artist: data.artists[0].name,
      album: data.album.name,
      name: data.name,
      url: data.external_urls.spotify,
    };
  } catch (error) {
    if (error instanceof TypeError) {
      const errorMessage = error.message.split(":")[0];
      if (errorMessage === "Could not determine type for")
        return {
          status: false,
          message: "Please enter a valid Spotify URL!",
        };
    }
    if (error instanceof Error) {
      const {
        response: { data },
      } = error;
      if (data.error.status === 400)
        return {
          status: false,
          message: "Song not found!",
        };
    }
  }
};

export { getAccessToken, getTrackInfo };
