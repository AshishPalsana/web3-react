import React from "react";
import AlldataLogo from "./MultiLogoApi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Multilogo() {
  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: false,
        },
      },
      {
        breakpoint: 668,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
          initialSlide: 2,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
          initialSlide: 2,
          infinite: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          margin: 20,
        },
      },
    ],
  };

  return (
    <>
      <div className="multi-logo-div">
        <div className="container">
          <Slider {...settings}>
            {AlldataLogo.map((curElem, i) => {
              const { id, name, img } = curElem;
              return (
                <div className="items-l text-center" key={i}>
                  <figure className="m-auto comon-logo">
                    <img src={img} alt={name} />
                  </figure>
                </div>
              );
            })}
          </Slider>
        </div>
      </div>
    </>
  );
}
export default Multilogo;
