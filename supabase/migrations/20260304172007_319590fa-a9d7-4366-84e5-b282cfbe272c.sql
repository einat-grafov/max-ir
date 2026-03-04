
UPDATE public.website_content SET content = '{
  "title": "Making Infrared Sense",
  "subtitle": "Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications.",
  "background_image": "/images/hero-bg.png"
}'::jsonb WHERE section_key = 'hero' AND page = 'home';

UPDATE public.website_content SET content = '{
  "title": "The Technology",
  "subtitle": "Max-IR''s patented technology unlocks the plethora of information that exists in the infrared spectra but is difficult to analyze.",
  "paragraphs": [
    "Traditional techniques such as ultraviolet, electrochemical, colorimetric and direct infrared interacting with the analyte liquid suffer from fouling and interferences and are unstable over time. Our technology enables the use of infrared spectroscopy even in the case of thick and opaque liquids where other methods fail.",
    "Based on ground-breaking research by its founder, Max-IR seeks to solve the issue of analyzing the composition of liquids without creating any reaction, with accuracy, in real-time. The non-reactive method of measurement, coupled with a self-calibration technology to avoid measurement drift, ensures a low-maintenance sensor suited for industrial, biomedical, research, and defense/security applications.",
    "An infrared signal is passed down a special optical fiber in contact with the liquid analyte. The electromagnetic field associated with the IR signal penetrates a short distance into the liquid analyte where it is absorbed by target compounds. This generates small changes in the IR signal, which are detected by the sensor."
  ],
  "diagram_image": "/images/diagram.gif",
  "features": [
    {"icon": "/images/icon-analyzes.svg", "title": "Analyzes In Any Liquid"},
    {"icon": "/images/icon-no-interference.svg", "title": "No Liquid Interference"},
    {"icon": "/images/icon-onsite.svg", "title": "Operates On-site"},
    {"icon": "/images/icon-realtime.svg", "title": "Real-time Results"},
    {"icon": "/images/icon-measurements.svg", "title": "Accurate Measurements"}
  ],
  "about_paragraphs": [
    "Founded in 2017, Max-IR Labs develops infrared solutions for industrial process control, medical diagnostics and biochemical analysis. Our R&D is conducted in close coordination with customers, focusing on their application needs, and backed by market analysis.",
    "We are moving infrared technologies from the lab into the field, bridging the gap between laboratory research and real-world application solutions meeting the needs of industrial, biomedical and defense end-users. Max-IR Labs'' intellectual property is protected by a strategic patent portfolio."
  ]
}'::jsonb WHERE section_key = 'technology' AND page = 'home';

UPDATE public.website_content SET content = '{
  "title": "The Sensor",
  "paragraphs": [
    "Max-IR develops infrared (IR) sensors for analysis of compounds in liquids, from clear to thick and murky. Using cutting-edge patented technology, our sensors enable accurate, real-time, continuous measurements, without change or drift over time.",
    "Max-IR''s pioneering industrial grade sensor is based on infrared light passing through an immersed optical fiber.",
    "Implementation of ion-selective material enhances differentiation between various molecules, making it ideal for on-site operations."
  ]
}'::jsonb WHERE section_key = 'sensor' AND page = 'home';

UPDATE public.website_content SET content = '{
  "title": "Applications",
  "items": [
    {
      "key": "water",
      "title": "Water & Wastewater treatment",
      "paragraphs": [
        "Wastewater treatment plants are turning to sensor-based automation to enable inline process control, enhance energy efficiency, and reduce operating costs while improving treatment performance.",
        "The Max-IR sensor measures nitrate and ammonia levels to monitor treatment efficacy, provide an early warning of process drift, and trigger a timely response in case of process failure. In the critical process of aeration, the introduction of air into the treated water uses more than 50% of plant energy consumption. Our sensor allows real-time feedback on the aeration process, reducing energy consumption and lowering overall operational costs.",
        "Our sensor does not require constant maintenance, as is the case with competing sensor technologies (UV and ion-selective electrode). This robust, reliable performance in challenging environments drives cost savings and better water quality."
      ],
      "image": "/images/water-image.png",
      "image_alt": "Cyanophyta on water surface",
      "shadow": "/images/water-shadow.svg",
      "bg_image": "/images/water-bg.png",
      "layout": "image-left"
    },
    {
      "key": "quality",
      "title": "Quality Monitoring and Analysis Services",
      "paragraphs": [
        "Max-IR Labs provides specialized water and industrial fluid analysis services for quality control purposes. Our team is currently in the early stages of service deployment and is seeking pilot study partners to demonstrate our capabilities for monitoring of inorganic carbon, PFAS and nitrate in water and wastewater streams. We offer monitoring and analysis tailored to industry specific needs, helping ensure reliable, actionable results."
      ],
      "image": "/images/quality-monitoring-image.png",
      "image_alt": "Quality monitoring analysis",
      "shadow": "/images/food-shadow.svg",
      "bg_image": "/images/quality-bg.png",
      "layout": "text-left"
    },
    {
      "key": "food",
      "title": "Food and beverage process control",
      "paragraphs": [
        "The Max-IR sensor works accurately in complex environments, such as food safety where there is a constant need for fast, efficient and accurate sensing. Applications include food safety, bacterial contamination, and measurements of antibiotic levels in food products to ensure quality control.",
        "Indicators such as sugar levels, alcohol content, CO2 levels and other parameters can be measured inline, without any interference with flowing liquids. Clean-in-place (CIP) protocols can be improved, for better water and cleaning solution usage efficiency.",
        "Analyzed fluids are not altered or interfered with, making Max-IR''s sensor a great candidate for process control in the food and beverage industry, where flowing liquids require continuous monitoring."
      ],
      "image": "/images/food-image.png",
      "image_alt": "Pathogenic bacteria",
      "shadow": "/images/food-shadow.svg",
      "bg_image": "/images/food-bg.png",
      "layout": "text-left"
    },
    {
      "key": "energy",
      "title": "Energy industry",
      "paragraphs": [
        "In oil and gas and petrochemical industries, real-time chemical analysis is required in a broad range of operations, from fuel-blending to monitoring of biodiesel properties. Infrared spectroscopy allows real-time analysis of hydrocarbon composition such as aromatics content, olefins, benzene, and ethanol, among others.",
        "Another example is monitoring of methanol in subsea methanol reuse and recovery operations, where methanol is used in deep, cold waters to inhibit the formation of hydrates that can block production flow."
      ],
      "image": "/images/energy-image.png",
      "image_alt": "Liquid petrol surface",
      "shadow": "/images/energy-shadow.svg",
      "bg_image": "/images/energy-bg.png",
      "layout": "image-left"
    }
  ]
}'::jsonb WHERE section_key = 'applications' AND page = 'home';

UPDATE public.website_content SET content = '{
  "title": "Awards and Achievements",
  "items": [
    {
      "image": "/images/award-usaf.png",
      "title": "Phase-I USAF DoD STTR",
      "description": "Thermal Monitoring of Quantum Cascade Lasers Using Scanning Near-Field Infrared Radiometry with Sub-Wavelength Resolution, 2017"
    },
    {
      "image": "/images/award-nsf.png",
      "title": "Phase-I NSF STTR",
      "description": "Development of low-cost optical sensor for nitrate detection in agricultural soils and environmental waters, 2018"
    },
    {
      "image": "/images/award-usaf.png",
      "title": "Phase-II USAF DoD STTR",
      "description": "Midwave Infrared (MWIR) Quantum Cascade Lasers (QCL) Thermal Monitoring, 2018-2020"
    },
    {
      "image": "/images/award-patent.png",
      "title": "U.S. Patent #10,458,907",
      "description": "Infrared analytical sensor for soil or water and method of operation thereof, issued May 25, 2018",
      "show_banner": true
    }
  ]
}'::jsonb WHERE section_key = 'awards' AND page = 'home';
