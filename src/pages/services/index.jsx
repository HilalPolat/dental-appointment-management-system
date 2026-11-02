import React from "react";
import Cards from "../../components/cards";
import Layout from "../../layout";
import ServicesTitle from "../../components/services/index";
import Detail from "../../components/services/serviceDetail";

const Services = () => {
  return (
    <Layout>
      <ServicesTitle />
      <Cards />
      <Detail />
    </Layout>
  );
};

export default Services;
