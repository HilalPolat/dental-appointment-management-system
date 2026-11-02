import React from "react";
import "../../assets/css/services.css";

import data from "../../data/lang/tr.json";

const ServicesTitle = () => {
  return (
    <div className="services d-flex justify-content-center">
      <h1 className="services_1">{data["services-title"]} </h1>
      <h1 className="services_2"> {data["services-title"]} </h1>
      <h1 className="services_1"> {data["services-title"]}</h1>
    </div>
  );
};

export default ServicesTitle;
