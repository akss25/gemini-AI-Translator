import React from "react";
import { CgArrowsExchangeAlt } from "react-icons/cg";
import "./History.css"; // Create a separate CSS file for styling

const History = ({ translation }) => {
  return (
    <div className="translation-card">
      <div className="translation-card-date-language">
        <p className="translation-date">{translation.date}</p>
        {/* <p>
          {translation.translate_from_language} <CgArrowsExchangeAlt />{" "}
          {translation.translated_to_language}
        </p> */}
      </div>
      <div className="translation-text">
        <p>
          {translation.translate_from_language}:{" "}
          {translation.translate_from_text}
        </p>
        <p>
          {translation.translated_to_language}: {translation.translated_to_text}
        </p>
      </div>
    </div>
  );
};

export default History;
