import React, { useEffect } from "react";
import "../../assets/css/about.css";
import data from "../../data/lang/tr.json";
import Footer from "../../layout/footer";

const AboutSection = () => {
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
      <div className="about d-flex justify-content-center">
        <h1 className="about_1">{data["about-big-title"]} </h1>
        <h1 className="about_2"> {data["about-big-title"]} </h1>
        <h1 className="about_1"> {data["about-big-title"]}</h1>
      </div>

      <section id="aboutSection">
        <div className="content mt-5">
          <h2>{data["about_title"]}</h2>
          <br />
          <p>{data["about_content_1"]}</p>
          <p>{data["about_content_2"]}</p>
          <p>{data["about_content_3"]}</p>
          <p>{data["about_content_4"]}</p>
        </div>

        {/*  */}
        <div className="content container mt-5">
          <div className="row g-4 align-items-center my-5">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="d-flex align-items-center">
                <div className="d-flex justify-content-center align-items-center me-3"></div>
                <div>
                  <h5>{data["misyon"]}</h5>
                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {data["misyon_content"]}
                  </a>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="d-flex align-items-center">
                <div className="d-flex justify-content-center align-items-center me-3"></div>
                <div>
                  <h5>{data["vizyon"]}</h5>
                  <a>{data["vizyon_content"]}</a>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <div className="d-flex align-items-center">
                <div className="d-flex justify-content-center align-items-center me-3"></div>
                <div>
                  <h5>{data["deger"]}</h5>
                  <a>{data["deger_content"]}</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  */}
        <section class="wrapper h-50 mb-5">
          <div class="grup_1">
            <img
              src="/assets/img/about/grup_1.png"
              alt="grup_1"
              class="img-fluid rounded-3"
            />
          </div>
          <div className="grup_2">
            <img
              src="/assets/img/about/grup_2.png"
              alt="grup_2"
              class="img-fluid rounded-3"
            />
          </div>
          <div className="grup_3 ">
            <img
              src="/assets/img/about/grup_3.png"
              alt="grup_3"
              class="img-fluid rounded-3"
            />
          </div>
        </section>
      </section>
      <Footer />
    </>
  );
};

export default AboutSection;
