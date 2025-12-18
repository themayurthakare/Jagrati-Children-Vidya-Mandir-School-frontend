// Academics.js

import React from "react";
import "./academics.css";

const Academics = () => {
  return (
    <div className="academics-container">
      <h1 className="academics-title">Academics</h1>
      <p className="academics-subtitle">
        At Jagrati Children Vidhya Mandir, we provide a strong academic foundation from 
        Class 1 to Class 10 through structured learning, modern teaching methods, and 
        personalized attention for every child.
      </p>

      {/* --- Clip-Path Highlight Section --- */}
      <section className="clip-section">
        <div className="clip-content">
          <h2>Why Choose Our School?</h2>
          <p>
            Our school focuses on holistic development—academics, discipline, 
            values, creativity, and physical growth. We aim to shape confident, 
            responsible, and knowledgeable students for the future.
          </p>

          <ul>
            <li>Highly qualified and experienced teachers</li>
            <li>Smart classrooms with digital learning tools</li>
            <li>Strong base in Maths, Science & Languages</li>
            <li>Dedicated attention to every student</li>
            <li>Activity-based, practical and value-based education</li>
          </ul>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="academics-section">
        <h2 className="section-title">Our Curriculum</h2>
        <p className="section-desc">
          Our curriculum is designed to support progressive learning from 
          foundational classes to higher grades:
        </p>

        <ul className="section-list">
          <li>
            <strong>Primary Classes (1 – 5):</strong>  
            Focus on basics of English, Hindi, Mathematics, EVS, Reading, Writing, and moral values.
          </li>

          <li>
            <strong>Middle School (6 – 8):</strong>  
            Strong emphasis on advanced Mathematics, Science, Social Science, Computer Basics, and Communication Skills.
          </li>

          <li>
            <strong>High School (9 – 10):</strong>  
            Detailed subject learning with exam-oriented preparation in  
            Science, Mathematics, English, Hindi, Social Studies, and Computer Applications.
          </li>

          <li>Weekly assessments and chapter revision tests</li>
          <li>Project-based & activity-based learning</li>
          <li>Sports, Physical Education, Arts, Music & Yoga classes</li>
        </ul>
      </section>

      {/* Departments Section */}
      <section className="cards-section">
        <h2 className="section-title">Departments</h2>
        <div className="card-grid">

          <div className="academics-card">
            <h3>Science Department</h3>
            <p>
              Well-equipped labs and concept-based teaching for Physics, Chemistry, and Biology, 
              helping students develop curiosity and scientific temperament.
            </p>
          </div>

          <div className="academics-card">
            <h3>Mathematics Department</h3>
            <p>
              Focus on problem-solving, logical reasoning, and real-life 
              application of mathematical concepts from basic to advanced levels.
            </p>
          </div>

          <div className="academics-card">
            <h3>Computer Science</h3>
            <p>
              Coding basics, digital learning, MS Office, Internet safety, 
              and introduction to modern technologies to prepare students for a tech-friendly world.
            </p>
          </div>

          <div className="academics-card">
            <h3>Arts & Humanities</h3>
            <p>
              Creative subjects like Drawing, Craft, Literature, and History 
              to improve imagination, expression, and cultural understanding.
            </p>
          </div>

          <div className="academics-card">
            <h3>Sports & Physical Education</h3>
            <p>
              Daily physical training, sports competitions, and yoga to build teamwork, strength, and discipline.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Academics;
