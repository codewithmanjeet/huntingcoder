"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { Observer } from "gsap/Observer";

export default function About() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Flip, Observer);

    let flipCtx;

    const createTween = () => {
      const galleryElement = document.querySelector("#gallery-8");

      if (!galleryElement) return;

      const galleryItems =
        galleryElement.querySelectorAll(".gallery__item");

      flipCtx && flipCtx.revert();

      galleryElement.classList.remove("gallery--final");

      flipCtx = gsap.context(() => {
        galleryElement.classList.add("gallery--final");

        const flipState = Flip.getState(galleryItems);

        galleryElement.classList.remove("gallery--final");

        const flip = Flip.to(flipState, {
          simple: true,
          ease: "expoScale(1, 5)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: galleryElement,
            start: "center center",
            end: "+=100%",
            scrub: true,
            pin: galleryElement.parentNode,
          },
        });

        tl.add(flip);

        return () =>
          gsap.set(galleryItems, {
            clearProps: "all",
          });
      });
    };

    createTween();

    window.addEventListener("resize", createTween);

    // =========================
    // SCROLLING TEXT ANIMATION
    // =========================

    const scrollingText = gsap.utils.toArray(".rail h4");

    const tl = horizontalLoop(scrollingText, {
      repeat: -1,
      paddingRight: 30,
    });

    Observer.create({
      onChangeY(self) {
        let factor = 2.5;

        if (self.deltaY < 0) {
          factor *= -1;
        }

        gsap
          .timeline({
            defaults: {
              ease: "none",
            },
          })
          .to(tl, {
            timeScale: factor * 2.5,
            duration: 0.2,
            overwrite: true,
          })
          .to(
            tl,
            {
              timeScale: factor / 2.5,
              duration: 1,
            },
            "+=0.3"
          );
      },
    });

    function horizontalLoop(items, config) {
      items = gsap.utils.toArray(items);

      config = config || {};

      let tl = gsap.timeline({
          repeat: config.repeat,
          paused: config.paused,
          defaults: { ease: "none" },
          onReverseComplete: () =>
            tl.totalTime(tl.rawTime() + tl.duration() * 100),
        }),
        length = items.length,
        startX = items[0].offsetLeft,
        times = [],
        widths = [],
        xPercents = [],
        curIndex = 0,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap =
          config.snap === false
            ? (v) => v
            : gsap.utils.snap(config.snap || 1),
        totalWidth,
        curX,
        distanceToStart,
        distanceToLoop,
        item,
        i;

      gsap.set(items, {
        xPercent: (i, el) => {
          let w = (widths[i] = parseFloat(
            gsap.getProperty(el, "width", "px")
          ));

          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, "x", "px")) / w) * 100 +
              gsap.getProperty(el, "xPercent")
          );

          return xPercents[i];
        },
      });

      gsap.set(items, { x: 0 });

      totalWidth =
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0);

      for (i = 0; i < length; i++) {
        item = items[i];

        curX = (xPercents[i] / 100) * widths[i];

        distanceToStart = item.offsetLeft + curX - startX;

        distanceToLoop =
          distanceToStart +
          widths[i] * gsap.getProperty(item, "scaleX");

        tl.to(
          item,
          {
            xPercent: snap(
              ((curX - distanceToLoop) / widths[i]) * 100
            ),
            duration: distanceToLoop / pixelsPerSecond,
          },
          0
        )
          .fromTo(
            item,
            {
              xPercent: snap(
                ((curX - distanceToLoop + totalWidth) / widths[i]) *
                  100
              ),
            },
            {
              xPercent: xPercents[i],
              duration:
                (curX - distanceToLoop + totalWidth - curX) /
                pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond
          )
          .add(
            "label" + i,
            distanceToStart / pixelsPerSecond
          );

        times[i] = distanceToStart / pixelsPerSecond;
      }

      function toIndex(index, vars) {
        vars = vars || {};

        Math.abs(index - curIndex) > length / 2 &&
          (index += index > curIndex ? -length : length);

        let newIndex = gsap.utils.wrap(0, length, index),
          time = times[newIndex];

        if (time > tl.time() !== index > curIndex) {
          vars.modifiers = {
            time: gsap.utils.wrap(0, tl.duration()),
          };

          time +=
            tl.duration() * (index > curIndex ? 1 : -1);
        }

        curIndex = newIndex;

        vars.overwrite = true;

        return tl.tweenTo(time, vars);
      }

      tl.next = (vars) => toIndex(curIndex + 1, vars);

      tl.previous = (vars) =>
        toIndex(curIndex - 1, vars);

      tl.current = () => curIndex;

      tl.toIndex = (index, vars) =>
        toIndex(index, vars);

      tl.times = times;

      tl.progress(1, true).progress(0, true);

      if (config.reversed) {
        tl.vars.onReverseComplete();
        tl.reverse();
      }

      return tl;
    }

    return () => {
      window.removeEventListener("resize", createTween);

      ScrollTrigger.getAll().forEach((trigger) =>
        trigger.kill()
      );
    };
  }, []);

  return (
    <>
      <main style={{ fontFamily: "Arial, sans-serif" }}>
        {/* GALLERY */}
        <div className="gallery-wrap">
          <div
            className="gallery gallery--bento gallery--switch"
            id="gallery-8"
          >
            <div className="gallery__item">
              <img src="/manjeet1.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet2.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet3.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet4.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet5.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet6.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet1.jpg" alt="" />
            </div>

            <div className="gallery__item">
              <img src="/manjeet2.jpg" alt="" />
            </div>
          </div>
        </div>

        {/* BIO SECTION */}
        <div className="section">
          <div className="bio-card">
            <span className="bio-tag">ABOUT ME</span>

            <h1 className="bio-title">
              Creative Frontend Developer & Modern Web Designer
            </h1>

            <p>
              My name is <span>Manjeet Panchal</span>. I am a
              passionate frontend developer and creative designer
              from Haryana, India.
            </p>

            <p>
              I love creating visually attractive websites that not
              only look premium but also provide smooth user
              experiences.
            </p>

            <p>
              My main focus is building modern responsive websites,
              animated landing pages, portfolios, dashboards, and
              interactive web experiences.
            </p>
          </div>
        </div>

        {/* SCROLLING TEXT */}
        <div className="scrolling-text">
          <div className="rail">
            <h4>MANJEET</h4>
            <h4>Web-Skills</h4>
            <h4>More Website</h4>

            <h4>Design Tool</h4>
            <h4>Figma</h4>
            <h4>Coreal Draw</h4>
          </div>
        </div>
      </main>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
          background: #050505;
          color: white;
        }

        /* GALLERY */

        .gallery-wrap {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .gallery {
          position: relative;
          width: 100%;
          height: 100%;
          flex: none;
        }

        .gallery__item {
          background-position: 50% 50%;
          background-size: cover;
          flex: none;
          position: relative;
          overflow: hidden;
          border-radius: 18px;
        }

        .gallery__item img {
          object-fit: cover;
          width: 100%;
          height: 100%;
          display: block;
        }

        .gallery--bento {
          display: grid;
          gap: 1vh;
          grid-template-columns: repeat(3, 32.5vw);
          grid-template-rows: repeat(4, 23vh);
          justify-content: center;
          align-content: center;
          padding: 1vh;
        }

        .gallery--final.gallery--bento {
          grid-template-columns: repeat(3, 100vw);
          grid-template-rows: repeat(4, 49.5vh);
          gap: 1vh;
        }

        .gallery--bento .gallery__item:nth-child(1) {
          grid-area: 1 / 1 / 3 / 2;
        }

        .gallery--bento .gallery__item:nth-child(2) {
          grid-area: 1 / 2 / 2 / 3;
        }

        .gallery--bento .gallery__item:nth-child(3) {
          grid-area: 2 / 2 / 4 / 3;
        }

        .gallery--bento .gallery__item:nth-child(4) {
          grid-area: 1 / 3 / 3 / 3;
        }

        .gallery--bento .gallery__item:nth-child(5) {
          grid-area: 3 / 1 / 3 / 2;
        }

        .gallery--bento .gallery__item:nth-child(6) {
          grid-area: 3 / 3 / 5 / 4;
        }

        .gallery--bento .gallery__item:nth-child(7) {
          grid-area: 4 / 1 / 5 / 2;
        }

        .gallery--bento .gallery__item:nth-child(8) {
          grid-area: 4 / 2 / 5 / 3;
        }

        /* BIO */

        .section {
          min-height: 100vh;
          padding: 120px 8%;
          background: #050505;
          position: relative;
          overflow: hidden;
        }

        .bio-card {
          max-width: 1200px;
          margin: auto;
          position: relative;
          z-index: 2;
          padding: 60px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
        }

        .bio-tag {
          display: inline-block;
          padding: 10px 22px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          font-size: 13px;
          letter-spacing: 2px;
          margin-bottom: 25px;
        }

        .bio-title {
          font-size: 70px;
          line-height: 1.1;
          color: white;
          margin-bottom: 40px;
          font-weight: 700;
        }

        .bio-card p {
          font-size: 22px;
          line-height: 2;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 35px;
        }

        .bio-card p span {
          color: white;
          font-weight: 700;
        }

        /* SCROLL TEXT */

        .scrolling-text {
          overflow: hidden;
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          background-color: #000;
        }

        .scrolling-text .rail {
          display: flex;
        }

        .scrolling-text .rail h4 {
          white-space: nowrap;
          font-size: 100px;
          font-weight: 900;
          line-height: 1em;
          margin: 0 30px 0 0;
          color: #fff;
        }

        @media (max-width: 768px) {
          .gallery--bento {
            grid-template-columns: repeat(2, 48vw);
            grid-template-rows: repeat(4, 22vh);
          }

          .bio-title {
            font-size: 42px;
          }

          .bio-card p {
            font-size: 18px;
          }

          .scrolling-text .rail h4 {
            font-size: 50px;
          }
        }
      `}</style>
    </>
  );
}