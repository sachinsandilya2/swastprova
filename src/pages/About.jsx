import React from "react";

const About = () => {
  const values = [
    {
      icon: "🎯",
      title: "Our Mission",
      text: "To make health awareness, mental wellness and meaningful mentorship accessible to everyone.",
    },
    {
      icon: "🚀",
      title: "Our Vision",
      text: "Building a trusted platform where people can learn, connect, grow and make better decisions for their well-being.",
    },
    {
      icon: "💙",
      title: "Our Values",
      text: "Compassion, trust, accessibility, innovation and community support guide everything we build.",
    },
  ];

  return (
    <main className="about-page">

      {/* HERO */}

      <section className="about-hero">
        <div className="about-badge">
          <span>●</span>
          About Swastprova
        </div>

        <h1>
          Healthier Mind.
          <br />
          <span>Stronger Future.</span>
        </h1>

        <p>
          Swastprova is a health and mentorship platform focused on
          mental wellness, health awareness, personal growth and
          meaningful guidance.
        </p>

        <div className="hero-stats">
          <div>
            <strong>01</strong>
            <span>Health Awareness</span>
          </div>

          <div>
            <strong>02</strong>
            <span>Mental Wellness</span>
          </div>

          <div>
            <strong>03</strong>
            <span>Personal Growth</span>
          </div>
        </div>
      </section>

      {/* STORY */}

      <section className="about-story">

        <div className="story-content">
          <span className="section-label">
            OUR STORY
          </span>

          <h2>
            Technology with a
            <span> human purpose.</span>
          </h2>

          <p>
            Swastprova aims to bring health information, professional
            guidance and personal development resources together in
            one accessible platform.
          </p>

          <p>
            We believe that the right information and the right support
            can help people take better steps toward a healthier and
            stronger future.
          </p>
        </div>

        <div className="story-card">
          <div className="story-icon">
            💙
          </div>

          <h3>
            Your well-being matters.
          </h3>

          <p>
            Learn. Connect. Grow.
          </p>

          <div className="story-line"></div>
        </div>

      </section>

      {/* MISSION / VISION / VALUES */}

      <section className="values-section">

        <div className="section-heading">
          <span className="section-label">
            WHAT WE BELIEVE
          </span>

          <h2>
            Built around
            <span> people.</span>
          </h2>

          <p>
            Our mission, vision and values shape the way we build
            Swastprova.
          </p>
        </div>

        <div className="values-grid">
          {values.map((item, index) => (
            <div
              className="value-card"
              key={item.title}
            >
              <span className="value-number">
                0{index + 1}
              </span>

              <div className="value-icon">
                {item.icon}
              </div>

              <h3>{item.title}</h3>

              <p>{item.text}</p>

              <div className="value-arrow">
                →
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* CTA */}

      <section className="about-cta">

        <div>
          <span className="section-label">
            START YOUR JOURNEY
          </span>

          <h2>
            Take the first step
            <br />
            towards a <span>better you.</span>
          </h2>

          <p>
            Explore health awareness, find guidance and continue
            your journey toward personal growth.
          </p>
        </div>

        <div className="cta-decoration">
          <div className="cta-circle">
            S
          </div>
        </div>

      </section>

      <style>{`

        .about-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #0f172a;
          overflow: hidden;
        }

        /* HERO */

        .about-hero {
          position: relative;
          padding: 110px 20px 90px;
          text-align: center;

          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(59,130,246,.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 20%,
              rgba(236,72,153,.10),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #f8fafc,
              #eff6ff
            );
        }

        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 8px 16px;

          background: rgba(255,255,255,.8);

          border: 1px solid #e2e8f0;

          border-radius: 50px;

          color: #475569;

          font-size: .85rem;
          font-weight: 700;
        }

        .about-badge span {
          color: #10b981;
        }

        .about-hero h1 {
          margin: 25px 0 20px;

          font-size: clamp(
            3rem,
            7vw,
            5.5rem
          );

          line-height: 1;

          letter-spacing: -3px;

          font-weight: 850;
        }

        .about-hero h1 span {
          background: linear-gradient(
            90deg,
            #2563eb,
            #7c3aed,
            #ec4899
          );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-hero > p {
          max-width: 700px;

          margin: 0 auto;

          color: #64748b;

          font-size: 1.08rem;

          line-height: 1.8;
        }

        /* STATS */

        .hero-stats {
          display: flex;

          justify-content: center;

          gap: 0;

          margin: 55px auto 0;

          max-width: 750px;

          background: rgba(255,255,255,.7);

          border: 1px solid #e2e8f0;

          border-radius: 20px;

          overflow: hidden;
        }

        .hero-stats div {
          flex: 1;

          padding: 22px;

          border-right: 1px solid #e2e8f0;
        }

        .hero-stats div:last-child {
          border-right: none;
        }

        .hero-stats strong {
          display: block;

          color: #2563eb;

          font-size: 1.4rem;
        }

        .hero-stats span {
          display: block;

          margin-top: 5px;

          color: #64748b;

          font-size: .8rem;

          font-weight: 600;
        }

        /* STORY */

        .about-story {
          max-width: 1100px;

          margin: auto;

          padding: 100px 20px;

          display: grid;

          grid-template-columns: 1.4fr .8fr;

          gap: 70px;

          align-items: center;
        }

        .section-label {
          color: #2563eb;

          font-size: .75rem;

          font-weight: 800;

          letter-spacing: 2px;
        }

        .story-content h2 {
          margin: 15px 0 20px;

          font-size: clamp(
            2.2rem,
            5vw,
            3.5rem
          );

          line-height: 1.1;

          letter-spacing: -1.5px;
        }

        .story-content h2 span,
        .section-heading h2 span,
        .about-cta h2 span {
          color: #2563eb;
        }

        .story-content p {
          max-width: 650px;

          color: #64748b;

          line-height: 1.8;

          margin-bottom: 15px;
        }

        .story-card {
          position: relative;

          padding: 45px 35px;

          border-radius: 30px;

          background: linear-gradient(
            145deg,
            #2563eb,
            #7c3aed
          );

          color: white;

          box-shadow:
            0 25px 50px rgba(
              37,
              99,
              235,
              .2
            );
        }

        .story-icon {
          width: 65px;
          height: 65px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 20px;

          background: rgba(
            255,
            255,
            255,
            .15
          );

          font-size: 30px;
        }

        .story-card h3 {
          margin: 30px 0 10px;

          font-size: 1.7rem;
        }

        .story-card p {
          margin: 0;

          color: #dbeafe;
        }

        .story-line {
          width: 60px;
          height: 4px;

          margin-top: 30px;

          border-radius: 10px;

          background: white;
        }

        /* VALUES */

        .values-section {
          padding: 100px 20px;

          background: #f1f5f9;
        }

        .section-heading {
          max-width: 700px;

          margin: auto;

          text-align: center;
        }

        .section-heading h2 {
          margin: 15px 0;

          font-size: clamp(
            2.3rem,
            5vw,
            3.5rem
          );

          letter-spacing: -1.5px;
        }

        .section-heading p {
          color: #64748b;

          line-height: 1.7;
        }

        .values-grid {
          max-width: 1100px;

          margin: 55px auto 0;

          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 22px;
        }

        .value-card {
          position: relative;

          padding: 32px;

          min-height: 280px;

          background: white;

          border: 1px solid #e2e8f0;

          border-radius: 24px;

          transition: .3s;

          overflow: hidden;
        }

        .value-card:hover {
          transform: translateY(-8px);

          box-shadow:
            0 20px 45px
            rgba(15,23,42,.1);
        }

        .value-number {
          position: absolute;

          top: 22px;
          right: 25px;

          color: #cbd5e1;

          font-size: .8rem;

          font-weight: 800;
        }

        .value-icon {
          width: 60px;
          height: 60px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background: #eff6ff;

          font-size: 28px;

          margin-bottom: 25px;
        }

        .value-card h3 {
          margin: 0 0 12px;

          font-size: 1.3rem;
        }

        .value-card p {
          color: #64748b;

          line-height: 1.7;

          font-size: .92rem;
        }

        .value-arrow {
          position: absolute;

          bottom: 22px;
          right: 25px;

          color: #2563eb;

          font-size: 1.3rem;

          font-weight: 700;
        }

        /* CTA */

        .about-cta {
          max-width: 1100px;

          margin: 100px auto;

          padding: 55px;

          border-radius: 30px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 30px;

          background:
            linear-gradient(
              135deg,
              #0f172a,
              #1e293b
            );

          color: white;

          box-shadow:
            0 25px 60px
            rgba(15,23,42,.15);
        }

        .about-cta h2 {
          margin: 15px 0;

          font-size: clamp(
            2rem,
            4vw,
            3rem
          );

          line-height: 1.15;

          letter-spacing: -1px;
        }

        .about-cta p {
          max-width: 600px;

          color: #94a3b8;

          line-height: 1.7;
        }

        .cta-decoration {
          flex-shrink: 0;
        }

        .cta-circle {
          width: 130px;
          height: 130px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          font-size: 4rem;

          font-weight: 900;

          box-shadow:
            0 20px 50px
            rgba(37,99,235,.3);
        }

        /* RESPONSIVE */

        @media (max-width: 800px) {

          .about-story {
            grid-template-columns: 1fr;

            gap: 45px;

            padding: 75px 20px;
          }

          .values-grid {
            grid-template-columns: 1fr;
          }

          .about-cta {
            margin: 70px 20px;

            padding: 35px 25px;

            flex-direction: column;

            align-items: flex-start;
          }

          .cta-decoration {
            display: none;
          }
        }

        @media (max-width: 600px) {

          .about-hero {
            padding: 80px 18px 65px;
          }

          .about-hero h1 {
            letter-spacing: -2px;
          }

          .hero-stats {
            flex-direction: column;
          }

          .hero-stats div {
            border-right: none;

            border-bottom: 1px solid #e2e8f0;
          }

          .hero-stats div:last-child {
            border-bottom: none;
          }

          .values-section {
            padding: 75px 18px;
          }
        }

      `}</style>
    </main>
  );
};

export default About;