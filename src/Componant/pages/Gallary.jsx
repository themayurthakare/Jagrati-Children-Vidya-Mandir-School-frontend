import React, { useState } from "react";

import gallary1 from "../../media/gallary1.jpeg";
import gallary2 from "../../media/gallary2.jpeg";
import gallary3 from "../../media/gallary3.jpeg";
import gallary4 from "../../media/gallary4.jpeg";
import gallary5 from "../../media/gallary5.jpeg";
import gallary6 from "../../media/gallary6.jpeg";
import batsman2 from "../../media//Sportsimage/batsman2.jpeg";
import Carrom from  "../../media/Sportsimage/Carrom.jpeg";
import certificte from"../../media/Sportsimage/certificte.jpeg";
import certificte2 from"../../media/Sportsimage/certificte2.jpeg";
import Cricketgroup from"../../media/Sportsimage/Cricketgroup.jpeg";
import Cricketmembar from"../../media/Sportsimage/Cricketmembar.jpeg";
import Criketteam from"../../media/Sportsimage/Criketteam.jpeg";
import Cricketteam1 from"../../media/Sportsimage/Cricketteam1.jpeg";
import gameblune from"../../media/Sportsimage/gameblune.jpeg";




import "./Gallary.css";

const Gallery = () => {
  const photos = [
    { src: gallary1, name: "" },
    { src: gallary2, name: "" },
    { src: gallary3, name: "" },
    { src: gallary4, name: "" },
    { src: gallary5, name: "" },
    { src: gallary6, name: "" },
    { src: batsman2, name: "" },
    { src: Carrom, name: "" },
    { src: certificte, name: "" },
    { src: certificte2, name: "" },
    { src: Cricketmembar, name: "" },
    { src: Criketteam, name: "" },
    { src: Cricketteam1, name: "" },
    // { src: Cricketteam1, name: "Game" },
    { src: gameblune, name: "Game" },
   
  ];

  const events = [
    { date: "2025-12-10", name: "Science Exhibition" },
    { date: "2025-12-15", name: "Sports Day" },
    { date: "2025-12-20", name: "Cultural Function" },
  ];

  return (
    <div className="events-container">

      {/* ---------------- PHOTO GALLERY ---------------- */}
      <h1 className="section-title">📸 Photo Gallery</h1>
      
      <div className="photo-grid">
        {photos.map((p, index) => (
          <div key={index} className="photo-card">
            <img src={p.src} alt={p.name} />
            <p className="photo-name">{p.name}</p>
          </div>
        ))}
      </div>

      {/* ---------------- UPCOMING EVENTS ---------------- */}
      <h1 className="section-title">📅 Upcoming Events</h1>

      <div className="events-table">
        {events.map((ev, i) => (
          <div className="event-row" key={i}>
            <span className="event-date">{ev.date}</span>
            <span className="event-name">{ev.name}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Gallery;
