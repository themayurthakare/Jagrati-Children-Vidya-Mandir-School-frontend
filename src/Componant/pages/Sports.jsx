import React from "react";
import { useNavigate } from "react-router-dom"; 
import Cricket from "../../media/Sportsimage/Cricket.jpeg";
import Carrom from "../../media/Sportsimage/Carrom.jpeg";
import batsman2 from "../../media/Sportsimage/batsman2.jpeg";
import certificte from "../../media/Sportsimage/certificte.jpeg";
import Cricketgroup from "../../media/Sportsimage/Cricketgroup.jpeg";
import Criketteam from "../../media/Sportsimage/Criketteam.jpeg";
import gameblune from "../../media/Sportsimage/gameblune.jpeg";
import masti1 from "../../media/Sportsimage/masti1.jpeg";
import member1 from "../../media/Sportsimage/member1.jpeg";
import membar2 from "../../media/Sportsimage/membar2.jpeg";

import "./Sports.css";

const Sports = () => {
  const navigate = useNavigate(); 

  const cricketImages = [Cricket, batsman2, Cricketgroup, Criketteam];
  const balloonImages = [gameblune];
  const funImages = [masti1, member1, membar2, certificte, Carrom];

  return (
    <>
      {/* MAIN TITLE */}
      <section className="sports-page">
        <h2>Sports & Athletics</h2>
        <p className="sports-subtitle">
          Encouraging physical fitness, teamwork, discipline and confidence.
        </p>
        {/* BACK BUTTON */}
        <button className="back-button" onClick={() => navigate("/about")}>
          ← Back to About Page
        </button>
      </section>

      {/* ---- CRICKET SECTION ---- */}
      <section className="sports-group-section">
        <h3 className="group-title">🏏 Cricket Activities</h3>

        <div className="sports-gallery">
          {cricketImages.map((img, i) => (
            <img key={i} src={img} alt={`Cricket ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ---- BALLOON GAME SECTION ---- */}
      <section className="sports-group-section">
        <h3 className="group-title">🎈 Balloon Burst Game</h3>

        <div className="sports-gallery">
          {balloonImages.map((img, i) => (
            <img key={i} src={img} alt={`Balloon Game ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ---- FUN TIME SECTION ---- */}
      <section className="sports-group-section">
        <h3 className="group-title">😊 Fun & Enjoyment Moments</h3>

        <div className="sports-gallery">
          {funImages.map((img, i) => (
            <img key={i} src={img} alt={`Fun ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ---- INFO SECTION ---- */}
      <section className="sports-info-section">
        <h3>Fun & Learning Through Sports</h3>

        <div className="sports-info-box">
          <h4>🎈 Balloon Burst Game</h4>
          <p>
            The Balloon Game helps children improve focus, balance, and quick
            reflexes while having fun. Kids enjoy competing and bursting each
            other's balloons.
          </p>
        </div>

        <div className="sports-info-box">
          <h4>🏏 Cricket – Team Spirit & Skills</h4>
          <p>
            Children learn teamwork, discipline, coordination and sportsmanship
            through cricket matches and practice drills.
          </p>
        </div>

        <div className="sports-info-box">
          <h4>😊 Fun & Enjoyment Time</h4>
          <p>
            These fun activities help children relax, laugh, and build happy
            memories with friends.
          </p>
        </div>
      </section>
    </>
  );
};

export default Sports;
