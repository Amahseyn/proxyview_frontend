import Image from 'next/image';
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="about">
      <div className="about-inner">
        {/* Left image */}
        <div className="about-image">
          <Image
            src="/images/Untitled-design-38.png"
            alt="ProxyView independent reviews"
            width={560}
            height={560}
          />
        </div>

        {/* Right content */}
        <div className="about-content">
          {/* SVG icon from source */}
          <div className="about-icon">
            <svg width="60" height="44" viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip_about)">
                <path d="M38.4167 31.3751L38.4167 43.7448C44.2194 43.7448 49.7845 41.4397 53.8876 37.3365C57.9908 33.2334 60.2959 27.6683 60.2959 21.8656C60.2959 16.0628 57.9908 10.4978 53.8876 6.39461C49.7845 2.29146 44.2194 -0.0136726 38.4167 -0.0136728L38.4167 12.3695C36.6646 8.73872 33.9438 5.66234 30.5543 3.47965C27.1649 1.29696 23.2384 0.0927623 19.208 -0.000138953L19.208 12.3695C17.456 8.73872 14.7352 5.66234 11.3457 3.47965C7.95624 1.29696 4.02982 0.0927615 -0.000560761 -0.000139792L-0.000562674 43.7583C4.02981 43.6654 7.95624 42.4612 11.3457 40.2785C14.7352 38.0958 17.456 35.0195 19.208 31.3887L19.208 43.7448C23.2384 43.6519 27.1649 42.4477 30.5543 40.265C33.9438 38.0823 36.6646 35.0059 38.4167 31.3751Z" fill="#D2E6D8"/>
              </g>
              <defs>
                <clipPath id="clip_about">
                  <rect width="43.7404" height="59.8002" fill="white" transform="translate(59.7998) rotate(90)"/>
                </clipPath>
              </defs>
            </svg>
          </div>

          <h2 className="headline-bar about-title">
            Independent Proxy Reviews and Comparisons That You Can Trust
          </h2>
          <p className="about-text">
            We focus on real-world testing to help you find the best proxy and anti-detect tools
            for your business use cases. From web scraping to account management, our reviews
            highlight what actually works so you can choose with confidence based on performance,
            reliability, and compatibility.
          </p>
          <Link href="/contact_us" className="btn btn-primary">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
