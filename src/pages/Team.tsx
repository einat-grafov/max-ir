import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const teamMembers = [
  {
    name: "Dr. Katy Roodenko",
    role: "Founder and CEO",
    image: "/images/team-katy-roodenko.png",
    linkedin: "https://www.linkedin.com/in/katy-r-a2b1705/",
    bio: "Dr. Roodenko is the founder of Max-IR Labs. She has over 20 years of academic, industrial and entrepreneurial experience related with the development of infrared technology for civil and defense applications. She received her MSc degree from Tel-Aviv University in 2004, where she worked on the development of Scanning Near-field Infrared Microscopy in the group of prof. Katzir. She obtained her PhD degree from TU Berlin in Germany, developing novel infrared techniques and optical models for thin-film analysis.\n\nIn 2008 she joined the group of prof. Yves Chabal at UT Dallas and continued to pursue her career in semiconductor materials and the development of infrared technologies for gas sensing and thin-film characterization. In 2012, she joined IntelliEpi to work on industrial production of III-V compound semiconductors for optoelectronic applications using molecular beam epitaxy (MBE). Team leader and business strategist, she drives disruptive technologies to markets. Dr. Roodenko has over 30 publications in leading scientific refereed journals, as well as patents and book chapters.",
  },
  {
    name: "Dr. Dennis I. Robbins",
    role: "Business Development",
    image: "/images/team-dennis-robbins.png",
    linkedin: "https://www.linkedin.com/in/dennis-i-robbins-ph-d-a0b9a2/",
    bio: "Dr. Robbins leads business development efforts for Max-IR. He has over 43 years of experience in the semiconductor and technology industries and has held a variety of management and executives roles, including responsibilities over multiple fabrication facilities for mixed-signal ICs as a Vice President at Texas Instruments.",
  },
  {
    name: "Dr. Kevin Clark",
    role: "Chief Scientist",
    image: "/images/team-kevin-clark.png",
    linkedin: "#",
    bio: "Dr. Kevin Clark is heading Max-IR product development and is an IR and materials specialist. Dr. Clark has worked at IntelliEPI, Inc. as a Senior Scientist in molecular beam epitaxy (MBE) from 2008 to 2016.",
  },
];

const advisors = [
  {
    name: "David Hitt",
    role: "Patent Attorney,\nMember of the Board",
    image: "/images/advisor-david-hitt.png",
    linkedin: "https://www.linkedin.com/in/david-hitt-07900a4/",
    bio: "Mr. David Hitt received his Bachelors of Science degrees in both Physics and Business and Public Administration from the University of Texas at Dallas in 1982. He then received a Master's degree in Taxation at Baylor University in 1983 and his Juris Doctorate from Southern Methodist University in 1987.",
  },
  {
    name: "Dr. John N. Randall",
    role: "CEO of Zyvex Labs & Nanoretina,\nAdvisory Board Member",
    image: "/images/advisor-john-randall.png",
    linkedin: "https://www.linkedin.com/in/john-n-randall-616777/",
    bio: "Dr. John N. Randall, President of Zyvex Labs, Executive VP at NanoRetina, Adjunct Professor at UT Dallas, and Fellow of the AVS and IEEE, has over 35 years of experience in Micro- and Nano- fabrication.",
  },
  {
    name: "Prof. Abraham Katzir",
    role: "Scientific Advisor\nSilver-Halide Fiber Technology Pioneer",
    image: "/images/advisor-abraham-katzir.png",
    linkedin: "https://www.linkedin.com/in/abrahamkatzir/",
    bio: "Prof. Abraham Katzir is a Professor of Physics at Tel Aviv University, holding the Carol and Mel Taub Chair in Applied Medical Physics. Prof. Katzir is an expert in the fields of biomedical optics and infra-red fiber optics.",
  },
];

const publications = [
  {
    title: "Nitrogen sensor based on quantum cascade lasers (QCLs) for wastewater treatment process control and optimization",
    authors: "Katy Roodenko; D. Hinojos; K. Hodges; B.-J. Pandey; J.-F. Veyan; K. P. Clark; D. I. Robbins",
    venue: "Presented at Photonics West 2020, published in SPIE Digital Library on February 2020",
    date: "March 9, 2020",
    url: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11233/112330C/Nitrogen-sensor-based-on-quantum-cascade-lasers-QCLs-for-wastewater/10.1117/12.2553691.short",
  },
  {
    title: "Thermal modeling of quantum cascade lasers with 3D anisotropic heat transfer analysis",
    authors: "Farhat Abbas; Binay J. Pandey; Kevin Clark; Kevin Lascola; Yamac Dikmelik; Dennis Robbins; David Hinojos; Kimari L. Hodges; Katy Roodenko; Qing Gu",
    venue: "Presented at Photonics West 2020, published in SPIE Digital Library on February 2020",
    date: "January 31, 2020",
    url: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11288/2543594/Thermal-modeling-of-quantum-cascade-lasers-with-3D-anisotropic-heat/10.1117/12.2543594.short",
  },
  {
    title: "IR-SNOM on a fork: infrared scanning near-field optical microscopy for thermal profiling of quantum cascade lasers",
    authors: "B.-J. Pandey; K. P. Clark; F. Abbas; E. Fuchs; K. Lascola; Yamac Dikmelik; D. Hinojos; K. Hodges; D. I. Robbins; M. Platkov; A. Katzir; A. Suliman; G. Spingarn; A. Niguès; J.-F. Veyan; Q. Gu; K. Roodenko",
    venue: "Presented at Photonics West 2020, published in SPIE Digital Library on February 2020",
    date: "January 31, 2020",
    url: "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/11288/112881Q/IR-SNOM-on-a-fork--infrared-scanning-near-field/10.1117/12.2543849.short?SSO=1",
  },
  {
    title: "Non-dispersive infrared (NDIR) sensor for real-time nitrate monitoring in wastewater treatment",
    authors: "K. Roodenko; D. Hinojos; K. Hodges; J.-F. Veyan; Y. J. Chabal; K. P. Clark; A. Katzir; D. Robbins",
    venue: "Presented at Photonics West 2019, published in SPIE Digital Library on February 2019",
    date: "February 27, 2019",
    url: "https://spie.org/Publications/Proceedings/Paper/10.1117/12.2506550?SSO=1",
  },
  {
    title: "Max-IR Labs awarded grant for development of nitrate detection sensor",
    authors: "",
    venue: "DALLAS, May 17, 2018 - Max-IR Labs, an optical sensor development company based in Dallas, Texas, today announced it has been awarded a Phase I Small Business Technology Transfer (STTR) grant of $225,000 from the National Science Foundation (NSF).",
    date: "May 17, 2018",
    url: "https://www.newswire.com/news/max-ir-labs-awarded-225k-phase-i-nsf-sttr-grant-for-real-time-20482883",
  },
];

const Team = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[500px] md:h-[600px] flex items-center overflow-x-clip section-dark"
        style={{ '--wave-height': '120px', '--wave-height-md': '180px' } as React.CSSProperties}
      >
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/team-hero-bg.jpg" alt="Lab environment" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-10 w-full">
          <h1 className="text-[40px] md:text-[60px] lg:text-[100px] font-semibold text-maxir-white leading-none text-left">The Team</h1>
        </div>

        {/* Wave SVG divider (flipped horizontally) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[var(--wave-height)] md:h-[var(--wave-height-md)] scale-x-[-1]">
          <svg
            viewBox="0 0 1440 180"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,90 C200,130 400,170 600,160 C800,150 950,20 1100,10 C1250,0 1380,40 1440,70 L1440,180 L0,180 Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-white py-16 lg:py-24 pb-[100px] md:pb-[130px]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="accent-line mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold mb-12 leading-none">Our Story</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <p className="text-foreground text-[24px] font-medium leading-relaxed">
              The areas of expertise at Max-IR Labs cover both instrument development and materials engineering, as is necessary for the development and analysis of the company's patented and patent-pending sensing solutions.
            </p>
            <div>
              <p className="text-foreground text-[18px] font-medium leading-relaxed mb-4">
                Max-IR Labs is a woman-owned business founded in 2017 by Dr. Katy Roodenko in Dallas, Texas. Dr. Roodenko leveraged her experience in infrared (IR) methodology and analytical instrumentation to initiate the development of leading-edge technology and products. Dr. Roodenko gathered an experienced management team to develop a novel sensor for liquids using infrared spectral analysis.
              </p>
              <p className="text-foreground text-[18px] font-medium leading-relaxed">
                The team has developed strong collaborative relationships with leading industrial partners and universities in the fields of infrared optics, analytical chemistry, microbiology and the related characterization metrology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="relative section-dark pt-[80px] md:pt-[120px] pb-[100px] md:pb-[140px]">
        {/* Top wave divider */}
        <div className="absolute top-0 left-0 right-0 z-10 h-[72px] md:h-[108px] -translate-y-full overflow-hidden">
          <svg
            viewBox="0 0 2880 108"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,108 Q1440,0 2880,108 L2880,108 L0,108 Z"
              fill="hsl(var(--maxir-dark))"
            />
          </svg>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="accent-line mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold text-maxir-white mb-12 leading-none">Our Team</h2>
          <div className="space-y-16 md:space-y-20">
            {teamMembers.map((member) => (
              <div key={member.name} className="grid grid-cols-1 md:grid-cols-[minmax(250px,380px)_1fr] gap-8 md:gap-12">
                {/* Photo */}
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale"
                  />
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-0 right-0 bg-primary w-12 h-12 flex items-center justify-center hover:bg-primary/80 transition-colors"
                  >
                    <img src="/images/linkedin-white.svg" alt="LinkedIn" className="w-5 h-5" />
                  </a>
                </div>
                {/* Info */}
                <div className="flex flex-col justify-start pt-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-maxir-white mb-1">{member.name}</h3>
                  <h4 className="text-primary text-base font-semibold mb-6">{member.role}</h4>
                  {member.bio.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="text-maxir-white/70 text-[15px] leading-relaxed mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10 h-[60px] md:h-[90px] translate-y-full">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="absolute top-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C360,0 540,70 900,80 C1150,86 1320,30 1440,0 L1440,0 L0,0 Z"
              fill="hsl(var(--maxir-dark))"
            />
          </svg>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="section-white pt-[100px] md:pt-[130px] pb-16 lg:pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="accent-line mb-6 mx-auto" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold mb-12 leading-none text-center">Advisory Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advisors.map((advisor) => (
              <div key={advisor.name}>
                {/* Photo with LinkedIn overlay */}
                <div className="relative w-full aspect-square overflow-hidden mb-6">
                  <img
                    src={advisor.image}
                    alt={advisor.name}
                    className="w-full h-full object-cover grayscale"
                  />
                  <a
                    href={advisor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-0 right-0 bg-primary w-12 h-12 flex items-center justify-center hover:bg-primary/80 transition-colors"
                  >
                    <img src="/images/linkedin-white.svg" alt="LinkedIn" className="w-5 h-5" />
                  </a>
                </div>
                <h3 className="text-2xl font-bold mb-1">{advisor.name}</h3>
                <h4 className="text-primary text-base font-semibold mb-6 whitespace-pre-line">{advisor.role}</h4>
                <a
                  href={advisor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground text-sm font-medium hover:text-primary transition-colors"
                >
                  <img src="/images/arrow-circle.svg" alt="" className="w-5 h-5" />
                  Read about
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section id="Publications" className="section-dark py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="accent-line mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold text-maxir-white mb-4 leading-none">Publications and announcements</h2>
          <p className="text-maxir-white/60 text-sm mb-12 max-w-3xl">
            The list below is a continuously updated list of papers mentioning Max-IR Labs products and/or written by us. The list contains research works which have gone on record as developments in the optical field and are public domain.
          </p>
          <div className="space-y-8">
            {publications.map((pub, i) => (
              <div key={i} className="border-b border-maxir-white/10 pb-8">
                <h3 className="text-lg font-bold text-maxir-white mb-2">{pub.title}</h3>
                {pub.authors && <p className="text-maxir-white/50 text-sm mb-2">{pub.authors}</p>}
                <p className="text-maxir-white/60 text-sm mb-3">{pub.venue}</p>
                <div className="flex items-center justify-between">
                  <span className="text-maxir-white/40 text-xs">{pub.date}</span>
                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-semibold flex items-center gap-2">
                    Read article
                    <img src="/images/read-arrow.svg" alt="" className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FCOI */}
      <section id="FCOI" className="section-white py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="accent-line mb-6" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold mb-8 leading-none">FCOI</h2>
          <h3 className="font-bold text-lg mb-4">MAX-IR LABS FINANCIAL CONFLICT OF INTEREST POLICY DOCUMENT</h3>
          <h4 className="font-bold mb-4">INTRODUCTION</h4>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            The federal Department of Health and Human Services has developed regulations (42 CFR Part 50 Subpart F and 45 CFR Part 94) on Promoting Objectivity in Research. The regulations were first developed in 1995, and in 2011, the regulations were revised. These regulations describe the actions an individual and an organization must take to promote objectivity in PHS-funded research. The regulations apply to all Public Health Service (PHS) (e.g., National Institutes of Health [NIH])-funded grants, cooperative agreements, and research contracts.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            This policy implements the regulatory requirements for Max-IR Labs.
          </p>
          <h4 className="font-bold mb-4">DEFINITIONS</h4>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>Financial conflict of interest (FCOI)</strong>: a significant financial interest that could directly and significantly affect the design, conduct, or reporting of PHS-funded research.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>Financial Interest</strong>: means anything of monetary value, whether or not the value is readily ascertainable.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>Institutional responsibilities</strong>: are the professional activities an investigator performs on behalf of Max-IR Labs.
          </p>
          <p className="text-foreground text-sm leading-relaxed">
            <strong>The Designated Officials</strong>: is Dr. Katy Roodenko, who have been designated by Max-IR Labs to oversee the financial conflicts of interest process.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Team;
