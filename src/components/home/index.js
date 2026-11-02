import { useEffect } from "react";
import "../../assets/css/home.css";
import data from "../../data/lang/tr.json";
import Layout from "../../layout";
import Footer from "../../layout/footer";
import { Link } from "react-router-dom";

const Home = () => {
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
  return (
    <>
      <section className="home_img  d-flex position-relative justify-content-center">
        <div className="button_div">
          <Link to="/contact" className="public_btn mt-3">
            <p>Randevu Al</p>
          </Link>
        </div>
      </section>
      <section className="home_content_1 container my-5">
        <div className="row align-items-center">
          <div className="col-12 col-md-5 px-4 mb-4">
            <img
              className="img-fluid rounded-4"
              src="/assets/img/home/ic-mekan-2.png"
              alt="ic_mekan_foto"
            />
          </div>
          <div className="col-12 col-md-7">
            <p>{data.home_content_1}</p>
            <p>{data.home_content_2}</p>
            <p>{data.home_content_3}</p>
          </div>
        </div>
      </section>
      <div className="home_title d-flex justify-content-center">
        <h1 className="home_1"> {data["home_big"]}</h1>
        <h1 className="home_1"> {data["home_big"]}</h1>
        <h1 className="home_1"> {data["home_big"]}</h1>
      </div>
      <section
        style={{ marginBottom: "300px" }}
        className="home_content_1 container mt-5"
      >
        <div className="row align-items-center">
          <div className="col-12 col-md-7">
            <p>{data.home_content_4}</p>
            <p>{data.home_content_5}</p>
            <p>{data.home_content_6}</p>
          </div>
          <div className="col-12 col-md-5 px-4 mb-4">
            <img
              className="img-fluid rounded-4"
              src="/assets/img/home/home_img_2.jpg"
              alt="dıs_foto"
            />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Home;
