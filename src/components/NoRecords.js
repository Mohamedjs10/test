import React from "react";
import sad from "../images/sad.svg";
import "./NoRecords.css";

export default function NoRecords(props) {
  return (
    <div className="text-center no-records">
      <div className="image mb-5">
        <img src={sad} alt="Sorry" loading="lazy" />
      </div>
      <h5 className="mt-3">{props.title}</h5>
      {props.type === "home" ? "" : <p>{props.text}</p>}
    </div>
  );
}
