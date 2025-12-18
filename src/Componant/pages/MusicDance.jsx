import React from "react";
import { useNavigate } from "react-router-dom";
import music1 from "../../media/dance 2.mp4";
import dance1 from "../../media/dance 3.mp4";

import "./MusicDance.css";

const MusicDance = () => {
  const navigate = useNavigate();

  return (
    <section className="musicdance-page">
      {/* BACK BUTTON */}
      <button className="back-button" onClick={() => navigate("/about")}>
        ← Back to About Page
      </button>

      {/* MAIN TITLE */}
      <h2>🎵 Music & Dance Activities</h2>
      <p className="musicdance-subtitle">
        Encouraging rhythm, expression, coordination, and confidence through performing arts.
      </p>

      {/* VIDEOS SECTION */}
      <section className="video-section">
        <div className="video-box">
          <h3>🎹 Music Activities</h3>
          <video controls>
            <source src={music1} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="video-box">
          <h3>💃 Dance Performances</h3>
          <video controls>
            <source src={dance1} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* LINKS TO OTHER PAGES */}
      <section className="links-section">
        <h3>Explore Other Activities</h3>
        <div className="links-buttons">
          <button onClick={() => navigate("/sports")}>🏏 Sports & Athletics</button>
          <button onClick={() => navigate("/artcraft")}>🎨 Art & Craft</button>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="musicdance-info">
        <h3>Benefits of Music & Dance</h3>
        <p>
          Music and dance activities help children develop creativity, rhythm, coordination,
          confidence, teamwork, and emotional expression. They also improve memory, focus,
          and social skills while ensuring fun and enjoyment.
        </p>
      </section>
    </section>
  );
};

export default MusicDance;
