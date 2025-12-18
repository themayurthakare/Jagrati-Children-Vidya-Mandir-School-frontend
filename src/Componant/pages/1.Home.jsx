import React, { useState } from "react";
import "./Home.css";


import Carrom from "../../media/Sportsimage/Carrom.jpeg";
import Criketteam from "../../media/Sportsimage/Criketteam.jpeg";
import gameblune from "../../media/Sportsimage/gameblune.jpeg";
import masti1 from "../../media/Sportsimage/masti1.jpeg";
import member1 from "../../media/Sportsimage/member1.jpeg";
import membar2 from "../../media/Sportsimage/membar2.jpeg";
import Cricketgroup from "../../media/Sportsimage/Cricketgroup.jpeg";
import PrincipalImg from "../../media/principle img .jpeg"; 
import vicprincapal from "../../media/Sportsimage/vicprincapal.png";
// {unform section image}
import winter1 from "../../media/Sportsimage/winter1.jpeg";
import regular1 from "../../media/Sportsimage/regular1.jpeg";



const Home = () => {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>WELCOME TO JAGRATI CHILDREN VIDHYA MANDIR SCHOOL</h1>
          <p>Where Learning is Fun & Every Child Shines Bright!</p>
          <button className="admission-btn" onClick={openPopup}>
            Apply Now
          </button>
        </div>
      </section>

      {/* Popup Form */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Apply for Admission</h2>
            <form>
              <input type="text" placeholder="Full Name" required />
              <input type="email" placeholder="Email" required />
              <input type="tel" placeholder="Phone Number" required />
              <textarea placeholder="Additional Notes" rows="4"></textarea>
              <button type="submit">Submit</button>
            </form>
            <button className="close-btn" onClick={closePopup}>✖</button>
          </div>
        </div>
      )}

      {/* Leadership Section */}
<section className="principal-section">
  <h2>Meet Our Leadership</h2>

  <div className="principal-horizontal">

    {/* Principal */}
    <div className="principal-row">
      <img src={PrincipalImg} alt="Principal" className="principal-photo" />

      <div className="principal-info">
        <h3>Mr. Rajesh Kushwah</h3>
        <p className="leader-role">Principal</p>
        <p>
          Education – BSC, D.El.Ed <br />
          Serving as principal since 2007 with excellence in leadership.<br />
          Awards: Best Principal 2019, Innovative Educator 2022.
        </p>

        <div className="leader-contact">
          <p><strong>Email:</strong> <a href="mailto:Jcvmschool@gmail.com">Jcvmschool@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+919827366274">+91 9827366274</a></p>
        </div>
      </div>
    </div>

  {/* Vice Principal Section */}
<div className="vice-wrapper">

  <div className="vice-image-box">
    <img src={vicprincapal} alt="Vice Principal" className="vice-img" />
  </div>

  <div className="vice-info">
    <h3>Mrs. Anita Kushwah</h3>
    <p className="vice-role">Vice Principal</p>
    <p className="vice-text">
      Supporting academics, discipline and value-based education.  
      Dedicated to student well-being and motivating young learners.
    </p>

    {/* Optional contact line - remove if not needed */}
    <p className="vice-contact">
      Phone: <a href="tel:6267937708">6267937708</a>
    </p>
  </div>
</div>


  </div>
</section>

      {/* Image Slider */}
      <section className="card-slider-container">
        <div className="card-slider">
          {[Carrom, Criketteam, gameblune, masti1, member1, membar2, Cricketgroup].map((img, index) => (
            <div className="card-item" key={index}>
              <img src={img} alt={`slide-${index}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights">
        <h2>Why Choose Us?</h2>
        <div className="highlight-cards">
          <div className="card"><h3>🌟 Creative Learning Hub</h3><p>Where imagination meets learning.</p></div>
          <div className="card"><h3>Expert Faculty</h3><p>Highly skilled educators ensuring strong academics.</p></div>
          <div className="card"><h3>Safe Environment</h3><p>Secure & emotionally supportive classrooms.</p></div>
          <div className="card"><h3>Sports & Arts</h3><p>Balanced growth with extracurricular activities.</p></div>
        </div>
      </section>
<section className="uniform-section">
  <h2>School Uniform</h2>

  <div className="uniform-wrapper">

    {/* Regular Uniform */}
    <div className="uniform-card">
      <h3>Regular School Uniform</h3>
      <img src={regular1} alt="Regular Uniform" className="uniform-img" />
      <p className="uniform-desc">
        This uniform is worn daily. It includes a comfortable shirt, trousers/skirt, and formal shoes.
      </p>
    </div>

    {/* Winter Uniform */}
    <div className="uniform-card">
      <h3>Winter School Uniform</h3>
      <img src={winter1} alt="Winter Uniform" className="uniform-img" />
      <p className="uniform-desc">
        The winter uniform keeps students warm, including a sweater or blazer along with regular attire.
      </p>
    </div>

  </div>
</section>
      {/* CTA Section */}
      <section className="cta">
        <h2>Enroll Your Child Today!</h2>
        <button className="admission-btn" onClick={openPopup}>
          Apply Now
        </button>
      </section>
    </>
  );
};

export default Home;
