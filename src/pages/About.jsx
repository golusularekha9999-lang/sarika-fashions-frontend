import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import './About.css'

export default function About() {
  return (
    <div className="about-page">

      {/* HERITAGE HERO */}
      <section
        className="about-hero-full"
        style={{
          backgroundImage: "url('/editorial.jpg')",
        }}
      >

        <div className="about-hero-overlay"></div>

        <div className="about-hero-full-content">

          <div className="about-hero-copy">

            <span className="eyebrow">
              OUR HERITAGE
            </span>

            <h1>
              Woven With <em>Stories.</em>
            </h1>

            <p>
              I am building this brand with passion, dedication,
              and a commitment to offering carefully selected
              collections that blend tradition with modern style.
              Every saree you see here is chosen with the hope
              of making someone feel special.

              <br />
              <br />

              This is more than a business. It is a journey of
              empowering women through elegance, one saree at a time.

              <br />
              <br />

              Thank you for being part of our story.
            </p>

            <Link
              to="/shop"
              className="btn"
            >
              <span>EXPLORE SAREES</span>
              <ArrowUpRight size={14} />
            </Link>

          </div>

        </div>

      </section>

    </div>
  )
}