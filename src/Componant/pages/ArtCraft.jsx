import React from "react";
import { useNavigate } from "react-router-dom";
import "./ArtCraft.css";

// Example images/videos
import gallary1 from "../../media/gallary1.jpeg";
import gallary2 from "../../media/gallary2.jpeg";
// import gallary3 from "../../media/gallary3";
import video from "../../media/Sportsimage/video.mp4"

const ArtCraft = () => {
  const navigate = useNavigate();

  return (
    <div className="artcraft-page">
      <button className="back-button" onClick={() => navigate("/about")}>
        ← Back to About Page
      </button>

      <h2>Art & Craft Activities</h2>
      <p>
        Our Art & Craft program encourages creativity, imagination, and fine motor skills.
        Students from Grade 1 to 10 participate in drawing, painting, paper crafts, clay modeling,
        and other hands-on activities.
      </p>

      {/* IMAGE GALLERY */}
      <section className="artcraft-gallery">
        <img src={gallary1} alt="gallar1" />
        <img src={gallary2} alt="gallary2" />
      </section>

      {/* VIDEO */}
      <section className="artcraft-video">
        <h3>Craft Video Tutorial</h3>
        <video controls width="600">
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </section>

      {/* INFO */}
      <section className="artcraft-info">
        <h3>Benefits of Art & Craft</h3>
        <ul>
          <li>Improves creativity and imagination</li>
          <li>Enhances focus and concentration</li>
          <li>Develops fine motor skills</li>
          <li>Encourages self-expression and confidence</li>
        </ul>
      </section>
    </div>
  );
};

export default ArtCraft;
