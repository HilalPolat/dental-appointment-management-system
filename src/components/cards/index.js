import React, { useEffect } from "react";
import data from "../../data/lang/tr.json";
import Footer from "../../layout/footer";
import "../../assets/css/card.css";
import "../../assets/css/button.css";
import { Link } from "react-router-dom";

const Card = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const items = [1, 2, 3, 4]
    .map((i) => ({
      slug: data[`card_${i}_slug`] || `service-${i}`,
      title: data[`card_${i}_title`],
      content: data[`card_${i}_content`],
      img: data[`card_${i}_img`],
      alt: data[`card_${i}_img_alt`],
    }))
    .filter((item) => item && (item.title || item.content));

  return (
    <>
      <div className="container my-4 card-div mb-5">
        <div className="row g-4  ">
          {items.map((item, idx) => (
            <div className="col-12 col-md-6 p-4 " key={idx}>
              <CardItem
                slug={item.slug}
                title={item.title}
                content={item.content}
                img={item.img}
                alt={item.alt}
              />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

function CardItem({ slug, title, content, img, alt }) {
  return (
    <div className="card h-100 card-item">
      {img && (
        <img
          src={img}
          className="card-img-top img-fluid rounded-4"
          alt={alt || title || "image"}
        />
      )}
      <div className="card-body d-flex flex-column">
        {title && <h5 className="card-title">{title}</h5>}
        {content && (
          <p className="card-text" style={{ height: "60%" }}>
            {content}
          </p>
        )}
        <Link to={`/services/${slug}`} className="public_btn mt-auto">
          <p>detay</p>
        </Link>
      </div>
    </div>
  );
}

export default Card;
