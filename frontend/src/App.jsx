import React, { useEffect, useState } from "react";
import "./App.css";
import { BeatLoader } from "react-spinners";
import { FiCopy } from "react-icons/fi";
import { HiSpeakerWave } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import Languages from "./Languages";
import axios from "axios";
import { MdManageHistory } from "react-icons/md";
import { TbHistoryOff } from "react-icons/tb";
import History from "./History"; // Ensure you import the History component

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const App = () => {
  const [language, setLanguage] = useState("Afrikaans");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [translation, setTranslation] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const getHistory = async () => {
      try {
        const response = await axios.get("/get-history");
        const history = response.data;
        setHistory(history);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    getHistory();
  }, []);

  const handleInputChange = (e) => {
    setLanguage(e.target.value);
    setError("");
  };

  const translate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/get-translation?language=${language}&message=${message}`
      );

      const translatedText =
        response.data?.translation ||
        response.data ||
        "Translation not available";

      const correctedText = response.data?.corrected_sentence;

      setTranslation(translatedText);
      setCorrectedText(correctedText);
    } catch (error) {
      console.error("Error translating:", error);
      setError("Error occurred while translating. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    if (!message) {
      setError("Please enter the message.");
      return;
    }
    translate();
  };

  const handleCopy = (textToCopy) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => displayNotification())
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const displayNotification = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const speakTranslation = async (textToSpeak) => {
    try {
      const response = await axios.get(
        `/get-translation-speech?translation=${textToSpeak}`,
        {
          responseType: "arraybuffer",
        }
      );

      const audioBuffer = await audioContext.decodeAudioData(response.data);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  return (
    <div className="container">
      <h1>Translation</h1>
      <p>Powered by Gemini</p>

      {!showHistory ? (
        <div>
          <div className="language-choice-history">
            <Languages handleInputChange={handleInputChange} />
            <MdManageHistory
              className="history-icon"
              onClick={() => setShowHistory(true)}
            />
          </div>

          <form className="translation-text-form">
            {message && (
              <RxCross2
                className="translation-text-removal-icon"
                onClick={() => setMessage("")}
              />
            )}
            <textarea
              name="message"
              placeholder="Type your message here.."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>

            {error && <div className="error">{error}</div>}
          </form>

          {translation && (
            <div className="translation">
              {isLoading ? <BeatLoader size={12} color={"red"} /> : translation}
              {translation ? (
                <div className="translation-handle-buttons">
                  <HiSpeakerWave
                    className="speaker-button"
                    onClick={() => speakTranslation(translation)}
                  />
                  <FiCopy
                    className="copy-button"
                    onClick={() => handleCopy(translation)}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          )}

          {correctedText && correctedText !== message ? (
            <div className="corrected_text">
              <p>
                Correction:{" "}
                <span className="corrected-sentence">{correctedText}</span>
              </p>
              <div className="translation-handle-buttons">
                <HiSpeakerWave
                  className="speaker-button"
                  onClick={() => speakTranslation(correctedText)}
                />
                <FiCopy
                  className="copy-button"
                  onClick={() => handleCopy(correctedText)}
                />
              </div>
            </div>
          ) : (
            ""
          )}

          <button
            type="submit"
            onClick={handleOnSubmit}
            className="translation-button"
          >
            Translate
          </button>

          <div className={`notification ${showNotification ? "active" : ""}`}>
            Copied to clipboard!
          </div>
        </div>
      ) : (
        <div className="history-container">
          <TbHistoryOff
            className="history-icon history-icon-close"
            onClick={() => setShowHistory(false)}
          />
          <div>
            {history.map((translation, index) => (
              <History key={index} translation={translation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
