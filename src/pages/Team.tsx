import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PublicationsCarousel from "@/components/PublicationsCarousel";
import CareersForm from "@/components/CareersForm";

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
                    <p key={idx} className="text-maxir-white text-[15px] leading-relaxed mb-4">{paragraph}</p>
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
              <div key={advisor.name} className="flex flex-col">
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
                <h4 className="text-primary text-base font-semibold whitespace-pre-line">{advisor.role}</h4>
                <div className="mt-auto pt-6">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications */}
      <section id="Publications" className="section-white py-16 lg:py-24 relative" style={{ backgroundImage: 'url(/images/publications-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="accent-line mb-6 mx-auto" />
          <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold mb-4 leading-none text-center">Publications and announcements</h2>
          <p className="text-foreground text-base mb-12 max-w-3xl mx-auto text-center">
            The list below is a continuously updated list of papers mentioning Max-IR Labs products and/or written by us. The list contains research works which have gone on record as developments in the optical field and are public domain. For more information, please contact us using our form.
          </p>
        </div>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-16">
          <PublicationsCarousel />
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
            <strong>Institutional responsibilities</strong>: are the professional activities an investigator performs on behalf of Max-IR Labs (e.g., administration, research, or consulting).
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>The Designated Officials</strong>: is Dr. Katy Roodenko, who have been designated by Max-IR Labs to oversee the financial conflicts of interest process, including solicitation and review of disclosures of significant financial interests and identifying FCOIs per the regulatory criteria provided in 42 CFR 50.604(f) and as stated within the policy below.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>Investigator</strong>: the project director or principal Investigator and any other person, regardless of title or position, who is responsible for the design, conduct, or reporting of research funded by award or proposed for such funding, which may include, for example, collaborators or consultants. Max-IR Labs's Principal Investigator/Project Director (PI/PD), upon consideration of the individual's role and degree of independence in carrying out the work, will determine who is responsible for the design, conduct, or reporting of the research.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>Research</strong>: means a systematic investigation, study, or experiment designed to develop or contribute to generalizable knowledge relating broadly to public health, including behavioral and social sciences research. The term encompasses basic and applied research (e.g., a published article, book, or book chapter) and product development (e.g., a diagnostic test or drug). For PHS-Funded Research, the term includes any such activity for which research funding is available from a PHS Awarding Component through a grant, cooperative agreement, or contract, whether authorized under the PHS Act or other statutory authority.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>PHS</strong>: the Public Health Service of the U.S. Department of Health and Human Services, and any components of the PHS to which the authority involved may be delegated, including the National Institutes of Health (NIH).
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>NIH</strong>: the biomedical research agency of the PHS.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            <strong>Senior/key personnel</strong>: means the PD/PI and any other person identified as senior/key personnel by the Institution in the grant application, progress report, or any other report submitted to the PHS/NIH by the Institution. This term is defined only as it relates to the public accessibility requirements described under the section labeled "Public Accessibility to Information Related to Financial Conflict of Interest".
          </p>

          <h4 className="font-bold mb-4">SIGNIFICANT FINANCIAL INTEREST MEANS:</h4>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>(1)</strong> A financial interest consisting of one or more of the following interests of the Investigator (and those of the Investigator's spouse and dependent children) that reasonably appear to be related to the Investigator's institutional responsibilities performed on behalf of Max-IR Labs. (i) With regard to any publicly traded entity, a significant financial interest exists if the value of any remuneration received from the entity in the twelve months preceding the disclosure and the value of any equity interest in the entity as of the date of disclosure, when aggregated, exceeds $5,000. For purposes of this definition, remuneration includes salary and any payment for services not otherwise identified as salary (e.g., consulting fees, honoraria, paid authorship); equity interest includes any stock, stock option, or other ownership interest, as determined through reference to public prices or other reasonable measures of fair market value. (ii) With regard to any non-publicly traded entity, a significant financial interest exists if the value of any remuneration received from the entity in the twelve months preceding the disclosure, when aggregated, exceeds $5,000, or when the Investigator (or the Investigator's spouse or dependent children) holds any equity interest (e.g., stock, stock option, or other ownership interest); or (iii) With regard to intellectual property rights and interests (e.g., patents, copyrights), a significant financial interest exists upon receipt of income of greater than $5,000 related to such rights and interests.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>(2)</strong> The term significant financial interest DOES NOT include any of the following types of financial interests: (i) Salary, royalties, or other remuneration paid by Max-IR Labs to the Investigator if the Investigator is currently employed or otherwise appointed by Max-IR Labs, including intellectual property rights assigned to Max-IR Labs and agreements to share in royalties related to such rights, any ownership interest in Max-IR Labs held by the Investigator since Max-IR Labs is a commercial or for-profit organization and such interest is excluded in the SFI definition of the regulation. (ii) Income from investment vehicles, such as mutual funds and retirement accounts, as long as the Investigator does not directly control the investment decisions made in these vehicles. (iii) Income from seminars, lectures, or teaching engagements sponsored by a federal, state, or local government agency located in the United States (U.S.), a U.S. Institution of higher education, an academic teaching hospital, a medical center, or a research institute that is affiliated with a U.S. Institution of higher education. (iv) Income from service on advisory committees or review panels for a federal, state, or local government agency located in the United States (U.S.), a U.S. Institution of higher education, an academic teaching hospital, a medical center, or a research institute that is affiliated with a U.S. Institution of higher education.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            <strong>(3)</strong> Investigators must disclose the occurrence of any foreign or domestic reimbursed or sponsored travel that exceeds $5,000 (i.e., that which is paid on behalf of the Investigator and not reimbursed to the Investigator so that the exact monetary value may not be readily available) related to the Investigator's institutional responsibilities. The initial disclosure of reimbursed or sponsored travel should include income received over the previous twelve months. The details of this disclosure will include, at a minimum, the purpose of the trip, the identity of the sponsor/organizer, the destination, and the duration. The disclosure requirement does not apply to travel that is reimbursed or sponsored by the following:
          </p>
          <ul className="text-foreground text-sm leading-relaxed mb-6 list-disc pl-6 space-y-1">
            <li>a federal, state, or local government agency located in the United States,</li>
            <li>a United States Institution of higher education,</li>
            <li>an academic teaching hospital,</li>
            <li>a medical center, or</li>
            <li>a research institute affiliated with a United States Institution of Higher Education.</li>
          </ul>

          <p className="text-foreground text-sm leading-relaxed mb-6">
            <strong>Foreign Financial Interests:</strong> Investigators must disclose all foreign financial interests (which includes income from seminars, lectures, or teaching engagements, income from service on advisory committees or review panels, and reimbursed or sponsored travel) received from any foreign entity, including foreign Institutions of higher education or a foreign government (which includes local, provincial, or equivalent governments of another country) when such income meets the threshold for disclosure (e.g., income in excess of $5,000).
          </p>

          <h4 className="font-bold mb-4">DISCLOSURE REQUIREMENTS</h4>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            At the time of application, the Principal Investigator and all other individuals who meet the definition of "Investigator" must disclose their SFIs to Max-IR Labs's designated official, Dr. Katy Roodenko. Any new Investigator who, after applying to NIH for funding from NIH or during the course of the research project, plans to participate in the project must similarly disclose their SFI(s) to the designated officials promptly and prior to participation in the project. Each Investigator who is participating in research under an NIH award must submit an updated disclosure of SFI at least annually, during the period of the award. Such disclosure must include any information that was not disclosed initially to Max-IR Labs pursuant to this Policy or in a subsequent disclosure of SFI (e.g., any financial conflict of interest identified on an NIH-funded project directly as an NIH Grantee and/or indirectly through a sub-award that was transferred from another Institution), and must include updated information regarding any previously disclosed SFI (e.g., the updated value of a previously disclosed equity interest).
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            Each Investigator participating in PHS/NIH-funded research must submit an updated disclosure of SFI within thirty (30) days of discovering or acquiring a new SFI (e.g., through purchase, marriage, or inheritance). In addition, Investigators must submit an updated disclosure of reimbursed or sponsored travel within 30 days of each occurrence.
          </p>

          <p className="text-foreground text-sm leading-relaxed mb-6">
            <strong>Review of SFI Disclosures by Max-IR Labs's Designated Officials.</strong> The designated official, Dr. Katy Roodenko, will conduct reviews of SFI disclosures. They will review any SFI that has been identified in a disclosure; these interests will be compared to each PHS/NIH research application and/or award on which the Investigator is identified as responsible for the design, conduct, or reporting of the research to determine if the SFI is related to the PHS/NIH-funded research and, if so, whether the SFI creates a Financial Conflict of Interest (FCOI) related to that research award.
          </p>

          <p className="text-foreground text-sm leading-relaxed mb-4">
            <strong>Guidelines for Determining "Relatedness" of SFI to PHS/NIH-funded Research and a Financial Conflict of Interest.</strong> The designated officials will determine whether an Investigator's SFI is related to the research under an NIH award and, if so, whether the SFI is a financial conflict of interest. An Investigator's SFI is related to the research when the designated officials reasonably determine the SFI:
          </p>
          <ul className="text-foreground text-sm leading-relaxed mb-4 list-disc pl-6 space-y-1">
            <li>could be affected by the PHS/NIH-funded research; or</li>
            <li>is in an entity whose financial interest could be affected by the PHS/NIH-funded research.</li>
          </ul>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            The designated officials may involve the Investigator in determining whether an SFI is related to the research supported by the award. A financial conflict of interest exists when the designated officials reasonably determine that the SFI could directly and significantly affect the design, conduct, or reporting of the PHS/NIH-funded research. ("Significantly" means that the financial interest would have a material effect on the research).
          </p>

          <p className="text-foreground text-sm leading-relaxed mb-4">
            <strong>Management of Significant Financial Interests that Pose Financial Conflict(s) of Interest.</strong> If a conflict of interest exists, the designated officials will determine what management conditions and/or strategies will be put in place to manage the FCOI. Examples of conditions that might be imposed to manage a financial conflict of interest include, but are not limited to:
          </p>
          <ol className="text-foreground text-sm leading-relaxed mb-4 list-[lower-alpha] pl-6 space-y-2">
            <li>Public disclosure of financial conflicts of interest (e.g., when presenting or publishing the research, to research personnel working on the study, to the Institution's Institutional Review Board, Institutional Animal Care and Use Committee, Data Safety and Monitoring Board, etc.);</li>
            <li>For research projects involving human subjects research, disclosure of financial conflicts of interest directly to human participants in the informed consent document;</li>
            <li>Appointment of an independent monitor capable of taking measures to protect the design, conduct, and reporting of the research against bias resulting from the financial conflict of interest;</li>
            <li>Modification of the research plan;</li>
            <li>Change of personnel or personnel responsibilities, or disqualification of personnel from participation in all or a portion of the research;</li>
            <li>Reduction or elimination of the financial interest (e.g., sale of an equity interest);</li>
            <li>Severance of relationships that create financial conflicts.</li>
          </ol>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            If the designated officials determine that a conflict exists, they will communicate their determination and the means they have developed for managing the FCOI. No expenditures on an NIH award will be permitted until the Investigator has complied with the Disclosure requirements of this Policy and has agreed, in writing, to comply with any plans determined by the designated officials necessary to manage the Financial Conflict of Interest. The designated FCOI SO of Max-IR Labs will submit the FCOI report to NIH via the eRA Commons FCOI Module.
          </p>

          <p className="text-foreground text-sm leading-relaxed mb-4">
            <strong>Public Accessibility to Information Related to Financial Conflicts of Interest.</strong> Prior to the expenditure of any funds under an NIH award, Max-IR Labs will ensure public accessibility by written response to any requestor within five business days of a request of information concerning any SFI disclosed that meets the following three criteria:
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-2">(i) The SFI was disclosed and is still held by the senior/key personnel;</p>
          <p className="text-foreground text-sm leading-relaxed mb-2">(ii) Max-IR Labs has determined that the SFI is related to the research funded through an award; and</p>
          <p className="text-foreground text-sm leading-relaxed mb-4">(iii) Max-IR Labs has determined that the SFI is a financial conflict of interest.</p>
          <p className="text-foreground text-sm leading-relaxed mb-2">The information that Max-IR Labs will make available via a publicly accessible Web site or in a written response to any requestor within five days of request will include, at a minimum, the following:</p>
          <p className="text-foreground text-sm leading-relaxed mb-2">(i) The Investigator's name;</p>
          <p className="text-foreground text-sm leading-relaxed mb-2">(ii) The Investigator's title and role with respect to the research project;</p>
          <p className="text-foreground text-sm leading-relaxed mb-2">(iii) The name of the entity in which the Significant Financial Interest is held;</p>
          <p className="text-foreground text-sm leading-relaxed mb-2">(iv) The nature of the Significant Financial Interest; and</p>
          <p className="text-foreground text-sm leading-relaxed mb-6">(v) The approximate dollar value of the Significant Financial Interest in the following ranges: $0–$4,999; $5,000–$9,999; $10,000–$19,999; amounts between $20,000–$100,000 by increments of $20,000; amounts above $100,000 by increments of $50,000), or a statement that the interest is one whose value cannot be readily determined through reference to public prices or other reasonable measures of fair market value.</p>

          <p className="text-foreground text-sm leading-relaxed mb-6">
            The policy will be posted and available via Max-IR Labs' public website to comply with the public disclosure requirements of the NIH regulations, the information posted will be updated at least annually and within sixty days of receipt or identification of information concerning any additional Significant Financial Interest of the senior/key personnel for the NIH-funded research project that had not been previously disclosed, or upon the disclosure of a Significant Financial Interest of senior/key personnel new to the NIH-funded research project, if it is determined by the designated officials that the Significant Financial Interest is related to the research and is a financial conflict of interest.
          </p>

          <h4 className="font-bold mb-4">Reporting of Financial Conflicts of Interest</h4>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Prior to the expenditure of any funds under an award funded by NIH, Max-IR Labs will provide to NIH an FCOI report compliant with NIH regulations regarding any Investigator's Significant Financial Interest found to be conflicting and will ensure that the Investigator has agreed to and implemented the corresponding management plan.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Max-IR Labs will assign an institutional official to serve as the FCOI SO within the eRA Commons FCOI Module. The FCOI SO has the authority to submit FCOI reports to the NIH. The FCOI Module User Guide is available at{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/tutorial2018/story_html5.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Financial Conflict of Interest User Guide</a>.
            {" "}While the award is ongoing (including any extensions with or without funds), Max-IR Labs will provide NIH with an annual FCOI report that addresses the status of the FCOI (i.e., an indication whether the FCOI is still being managed or if it no longer exists) and any changes in the management plan, if applicable.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            For any Significant Financial Interest that is identified as conflicting subsequent to an initial FCOI report during an ongoing NIH-funded research project (e.g., a new SFI is identified for an Investigator who is participating in the NIH-funded research, upon the participation of an Investigator who is new to the research project, etc.), Max-IR Labs will provide to NIH within 60 days of identifying an FCOI, an FCOI report regarding the financial conflict of interest and ensure that Max-IR Labs has implemented a management plan and the Investigator has agreed to the relevant management plan.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            The Original (initial) FCOI report will include the information required in the regulation at 42 CFR Part 50.605(b)(3) or as outlined in NIH's FAQ H.5. at{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/tutorial2018/story_html5.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Frequently Asked Questions (FAQs)</a>. Additional information on FCOI reporting can be found under this reference:{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/required_FCOI_reports_through_era_commons.docx" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Types of FCOI Reports Summary Chart for NIH</a>.
          </p>

          <h4 className="font-bold mb-4">Training Requirements</h4>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Each Investigator will be informed about Max-IR Labs' Financial Conflict of Interest Policy and be trained on the Investigator's responsibility to disclose foreign and domestic SFIs per this policy and of the FCOI regulation at 42 CFR Part 50 Subpart F. FCOI training will occur prior to an Investigator engaging in PHS/NIH-funded research, at least every four years and immediately (as defined below) when any of the following circumstances apply:
          </p>
          <ol className="text-foreground text-sm leading-relaxed mb-4 list-decimal pl-6 space-y-2">
            <li>Max-IR Labs revises this Policy, or procedures related to this Policy, in any manner that affects the requirements of Investigators;</li>
            <li>An Investigator is new to Max-IR Labs research under an NIH award (training is to be completed prior to his/her participation in the research); or</li>
            <li>Max-IR Labs finds that an Investigator is not in compliance with this Policy or a management plan issued under this Policy (training is to be completed within 30 days in the manner specified by the designated official).</li>
          </ol>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            In fulfillment of the FCOI training requirement of the FCOI regulation, Max-IR Labs requires its investigators to complete the National Institutes of Health's Financial Conflict of Interest tutorial located at:{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/tutorial2018/story_html5.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NIH FCOI Tutorial</a>. All investigators must print a certification of completion at the end of training and retain it for audit purposes.
          </p>

          <h4 className="font-bold mb-4">Failure to Comply with Max-IR Labs' Conflict of Interest Policy Applicable to Public Health Service Funded Award</h4>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            When an FCOI is not identified or managed in a timely manner, including failure by the Investigator to disclose a significant financial interest that is determined by the Institution to constitute a FCOI, failure by the Institution to review or manage such an FCOI; and failure by the Investigator to comply with a management plan; Max-IR Labs will within 120 days:
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-3">
            a) Complete a retrospective review of the Investigator's activities and the PHS/NIH-funded research project to determine whether any NIH-funded research, or portion thereof, conducted during the period of the noncompliance was biased in the design, conduct, or reporting of research;
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            b) Document the retrospective review consistent with the regulation at 42 CFR 50.605(a)(3)(ii)(B) or as described in NIH's FAQ I.2. at{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/tutorial2018/story_html5.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Frequently Asked Questions (FAQs)</a>.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            If bias is found, Max-IR Labs shall notify NIH promptly and submit a mitigation report to NIH via the eRA Commons FCOI Module that shall address the following: impact of the bias on the research project, and Max-IR Labs' plan of action or actions taken to eliminate or mitigate the effect of the bias. Thereafter, Max-IR Labs shall submit FCOI reports annually to NIH in accordance with the regulations and terms and conditions of the award agreement. If bias is not found, no further action is required.
          </p>

          <h4 className="font-bold mb-4">Clinical Research Requirements</h4>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            If HHS determines that one of its funded clinical research projects whose purpose is to evaluate the safety or effectiveness of a drug, medical device, or treatment, has been designed, conducted, or reported by an Investigator with a Financial Conflict of Interest that was not managed or reported by Max-IR Labs, Max-IR Labs shall require the Investigator involved to disclose the Financial Conflict of Interest in each public presentation of the results of the research and to request an addendum to previously published presentations.
          </p>

          <h4 className="font-bold mb-4">Subrecipient Requirements</h4>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            A subrecipient relationship is established when federal funds flow down from or through Max-IR Labs to another individual or entity, and the subrecipient will be conducting a substantive portion of a PHS-funded research project and is accountable to Max-IR Labs for programmatic outcomes and compliance matters. Subrecipients, who include but are not limited to collaborators, consortium members, consultants, contractors, subcontractors, and sub-awardees, are subject to Max-IR Labs terms and conditions, and as such, Max-IR Labs will take reasonable steps to ensure that any subrecipient Investigator is in compliance with the federal FCOI regulation at 42 CFR Part 50 Subpart F.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            Max-IR Labs will incorporate, as part of a written agreement with the subrecipient, terms that establish whether Max-IR Labs FCOI Policy or that of the subrecipient's institution will apply to the subrecipient Investigator(s). See the NIH Grants Policy Statement Section 15.2.1 Written agreement at{" "}
            <a href="https://grants.nih.gov/grants/policy/nihgps/HTML5/section_15/15.2_administrative_and_other_requirements.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NIH Grants Policy Statement</a>.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            If the subrecipient's FCOI policy applies to the subrecipient Investigator, the subrecipient institution will certify as part of the agreement with Max-IR Labs that its policy is in compliance with the federal FCOI regulation. In this situation, the agreement shall specify the time period for the subrecipient to report all identified FCOIs to Max-IR Labs in sufficient time to enable Max-IR Labs to provide timely FCOI reports, as necessary, to the PHS/NIH as required by the regulation. The Max-IR Labs assigned FCOI SO will submit the FCOI report (subrecipient report) to the NIH via the eRA Commons FCOI Module.
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            If the subrecipient cannot provide the certification of compliance with the FCOI regulation, the agreement shall state that the subrecipient Investigator is subject to Max-IR Labs' FCOI Policy for disclosing SFI(s) that are directly related to the subrecipient's work for Max-IR Labs. Therefore, Max-IR Labs will require the submission of all Investigator disclosures of SFIs to Max-IR Labs.
          </p>

          <h4 className="font-bold mb-4">Maintenance of Records</h4>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            The Institution will keep all records of all Investigator disclosures of financial interests and the Institution's review of, or response to, such disclosure (whether or not a disclosure resulted in the Institution's determination of a Financial Conflict of Interest), and all actions under the Institution's policy or retrospective review, if applicable. Records of financial disclosures and any resulting action will be maintained by the Institution for at least three years from the date of submission of the final expenditures report or, where applicable, from other dates specified in 45 C.F.R. 75.361 for different situations. Max-IR Labs will retain records for each competitive segment as provided in the regulation.
          </p>

          <h4 className="font-bold mb-4">Failure to Comply with This Policy</h4>
          <p className="text-foreground text-sm leading-relaxed mb-6">
            Compliance with this policy is a condition of employment and/or participation for all applicable Investigators. Therefore, such Investigators who fail to comply with this policy are subject to discipline, including letters of reprimand, restriction on the use of funds, termination of employment, or disqualification from further participation in any PHS/NIH-funded research, etc., as may be deemed appropriate.
          </p>

          <h4 className="font-bold mb-4">USEFUL FCOI AND NIH RESOURCES</h4>
          <p className="text-foreground text-sm leading-relaxed mb-2">
            <strong>FCOI Regulation</strong> 42 CFR Part 50 Subpart F at{" "}
            <a href="https://www.ecfr.gov/current/title-42/chapter-I/subchapter-D/part-50/subpart-F" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">eCFR :: 42 CFR Part 50 Subpart F</a>
          </p>
          <p className="text-foreground text-sm leading-relaxed mb-2">
            <strong>FCOI Training Webpage</strong> at{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/tutorial2018/story_html5.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FCOI Training | grants.nih.gov</a>
          </p>
          <p className="text-foreground text-sm leading-relaxed">
            <strong>FCOI FAQs</strong> at{" "}
            <a href="https://grants.nih.gov/grants/policy/coi/tutorial2018/story_html5.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Frequently Asked Questions (FAQs) | grants.nih.gov</a>
          </p>
        </div>
      </section>

      {/* Careers */}
      <section id="Careers" className="relative py-16 lg:py-24" style={{ background: 'linear-gradient(to right, hsl(var(--background)), hsl(0 0% 85%))' }}>
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Text */}
            <div>
              <div className="accent-line mb-6" />
              <h2 className="text-[40px] md:text-[60px] lg:text-[80px] font-semibold mb-8 leading-none text-primary">Careers</h2>
              <p className="text-foreground text-[18px] font-medium leading-relaxed mb-6">
                Looking for a job in a dynamic startup? Addicted to lab-work and dreaming in the Infrared spectral range? Can't wait to develop new chemometrics approaches to interpret complex infrared spectra?
              </p>
              <p className="text-foreground text-[18px] font-medium leading-relaxed">
                We are always eager to hear from recent (and not so recent) MSc/PhD graduates who are familiar with QCL technology and will help us drive its applications in gas and fluid analysis!
              </p>
            </div>

            {/* Right: Form */}
            <div className="bg-background rounded-2xl p-8 shadow-lg">
              <p className="font-bold text-foreground mb-6">
                Send us your details by filling out the form.<br />
                We'd be happy to get back to you:
              </p>
              <CareersForm />
            </div>
          </div>
        </div>
      </section>

      <div style={{ backgroundColor: '#F4F3F3' }} className="pt-[120px] md:pt-[180px] -mt-[120px] md:-mt-[180px]">
        <Footer />
      </div>
    </div>
  );
};

export default Team;
