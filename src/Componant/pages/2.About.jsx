import React from "react";
import background1 from "../../media/background1.jpeg";
import Cricket from "../../media/Sportsimage/Cricket.jpeg";
import { Link } from "react-router-dom";
import "./About.css"; 

const About = () => {
  return (
    <div className="about-container">

      {/* --- Hero Section --- */}
      <section className="about-hero">

      </section>

      {/* --- About School Section --- */}
      <section className="about-section">
        <section className="about-section">
          <h2>About JAGRATI  CHILDREN VIDHYA MANDIR</h2>
          <p>
            JAGRATI  CHILDREN VIDHYA MANDIR, located in <strong>Shankar Colony, Gol Phadiya, Lashkar, Gwalior, Madhya Pradesh</strong>,
            is a school committed to nurturing young minds with care, creativity, and curiosity. Our institution provides a safe and
            supportive environment where students can grow academically, socially, and emotionally.
          </p>
          <p>
            The school caters to students from <strong>Grade 1 to Grade 10</strong>, offering a balanced curriculum that integrates
            core academics with arts, sports, and moral education. We emphasize holistic development, encouraging students to
            explore their talents, develop critical thinking skills, and build strong character.
          </p>
          <p>
            At JAGRATI  CHILDREN VIDHYA MANDIR, we believe that learning extends beyond the classroom. Our dedicated faculty fosters
            teamwork, discipline, creativity, and confidence through extracurricular activities, including cultural programs,
            sports events, and community projects. Students are guided to become responsible, respectful, and motivated individuals
            ready to face future challenges with a positive mindset.
          </p>
          <p>
            <strong>Address:</strong> Shankar Colony, Gol Phadiya, Lashkar, Gwalior, Madhya Pradesh
          </p>
        </section>

      </section>

      <section className="about-section">
        <h2>Our Programs & Activities</h2>
        <div className="activity-grid">

          <div className="activity-card">
            <Link to="/Sports">Sports & Athletics</Link>
          </div>
           <div className="activity-card">
            <Link to="/ArtCraft" className="activity-link">
              ArtCraft Sport
            </Link>
          </div>
          <div className="activity-card">
            <Link to="/musicdance" className="activity-link">
              🎵 Music & Dance
            </Link>
          </div>
         
        </div>
      </section>

      {/* --- Mission & Vision Section --- */}
      <section className="about-section">
        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            At JAGRATI  CHILDREN VIDHYA MANDIR, our mission is to provide a safe, inspiring, and inclusive
            learning environment where students develop academically, socially, and emotionally.
            We aim to nurture curiosity, creativity, and critical thinking, ensuring that every child
            discovers and develops their unique talents.
          </p>
          <p>
            Through a balanced curriculum that combines academics, arts, sports, and moral education,
            we encourage students to grow into responsible, confident, and compassionate individuals.
            Our dedicated teachers guide children to build strong character, leadership skills, and
            lifelong learning habits that prepare them to face future challenges with courage and resilience.
          </p>
          <p>
            Beyond the classroom, we promote teamwork, empathy, and community engagement through
            extracurricular activities, cultural programs, and social initiatives.
            Our goal is to create well-rounded students who not only excel academically but also contribute
            positively to society and lead fulfilling lives.
          </p>
        </section>

        <section className="vision-section">
          <h2>Our Vision</h2>
          <p>
            At JAGRATI  CHILDREN VIDHYA MANDIR, our vision is to shape responsible, confident, and creative
            individuals who are equipped with the knowledge, skills, and values to make a positive impact
            in the world. We aspire to create a learning environment where every student feels encouraged,
            valued, and inspired to reach their full potential.
          </p>
          <p>
            We aim to cultivate lifelong learners who are not only academically proficient but also possess
            strong character, empathy, and social awareness. By promoting curiosity, innovation, and
            collaboration, we prepare students to face challenges with resilience, solve problems with
            creativity, and contribute meaningfully to society.
          </p>
          <p>
            Our vision extends beyond the classroom, encouraging students to engage in cultural, social,
            and community initiatives. We strive to nurture individuals who are compassionate, ethical,
            and motivated to lead positive change, ensuring a brighter and better future for themselves
            and the community.
          </p>
        </section>

      </section>

    </div>
  );
};

export default About;
