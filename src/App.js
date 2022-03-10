import { useState } from "react";

import "./App.css";

import Hero from "./Hero";
import RecommendationList from "./RecommendationList";
import ErrorAlert from "./Alert";

function App() {
  const [currentWalletAccount, setCurrentWalletAccount] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [alert, setAlert] = useState({ status: false, alertMessage: "" });

  return (
    <div className="container mx-auto p-4 text-center">
      <ErrorAlert alert={alert} setAlert={setAlert} />
      <Hero
        currentWalletAccount={currentWalletAccount}
        setCurrentWalletAccount={setCurrentWalletAccount}
        setAlert={setAlert}
        setRecommendations={setRecommendations}
      />
      <div className="divider"></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 justify-items-center mt-8">
        <RecommendationList
          setAlert={setAlert}
          recommendations={recommendations}
          setRecommendations={setRecommendations}
        />
      </div>
    </div>
  );
}

export default App;
