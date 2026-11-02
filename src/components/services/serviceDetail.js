import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import "../../assets/css/services.css";

import { useParams, Link } from "react-router-dom";
import data from "../../data/lang/tr.json";
import Layout from "../../layout";
import Footer from "../../layout/footer/index";
import "../../assets/css/cardDetail.css";

const ServiceDetail = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  const { slug } = useParams();

  const items = [1, 2, 3, 4].map((i) => ({
    slug: data[`card_${i}_slug`] || `service-${i}`,
    bigTitle: data[`card_${i}_big_title`],
    title: data[`card_${i}_title`],
    content: data[`card_${i}_content`],
    content2: data[`card_${i}_content_2`],
    content3: data[`card_${i}_content_3`],
    img: data[`card_${i}_img`],
    imgDetail: data[`card_${i}_img_detail`],
    alt: data[`card_${i}_img_alt`],
  }));

  const item = items.find((x) => x.slug === slug);

  if (!item) return null;

  return (
    <Layout>
    <div className="detail d-flex justify-content-center">
      <h1 className="detail_1">{item.bigTitle}</h1>
      <h1 className="detail_2">{item.bigTitle}</h1>
      <h1 className="detail_1">{item.bigTitle}</h1>
    </div>
  
    <div className="container py-5 content">
      <div className="row g-4 align-items-start">
        {/* Görsel */}
        <div className="col-12 col-md-6">
          <img
            className="img-fluid rounded-4 w-100"
            src={item.imgDetail}
            alt={item.alt || item.title}
          />
        </div>
  
        <div className="col-12 col-md-6">
          <h2 className="mb-3 text-center text-md-start">{item.title}</h2>
          <div className="d-flex flex-column justify-content-center align-items-center" >

          <p className="lead">{item.content}</p>
          <p className="lead">{item.content2}</p>
          <p className="lead">{item.content3}</p>
          </div>
        </div>
  
        <div className="col-12 d-flex justify-content-center">
          <Link to={`/contact`} className="public_btn mt-3">
            <p>randevu al</p>
          </Link>
        </div>
      </div>
    </div>
  
    <Footer />
  </Layout>
  
  );
};

export default ServiceDetail;
