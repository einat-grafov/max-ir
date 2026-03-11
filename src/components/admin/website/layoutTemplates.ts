// Layout template definitions for the page builder

export interface LayoutTemplate {
  id: string;
  name: string;
  category: "hero" | "content" | "social_proof" | "collections";
  fields: LayoutField[];
}

export interface LayoutField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "items";
  itemFields?: { key: string; label: string; type: "text" | "textarea" | "image" }[];
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: "hero_center",
    name: "Hero Heading Center",
    category: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button URL", type: "text" },
    ],
  },
  {
    id: "hero_left",
    name: "Hero Heading Left",
    category: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button URL", type: "text" },
    ],
  },
  {
    id: "hero_right",
    name: "Hero Heading Right",
    category: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button URL", type: "text" },
    ],
  },
  {
    id: "hero_stack",
    name: "Hero Stack",
    category: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "image" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button URL", type: "text" },
    ],
  },
  {
    id: "hero_no_image",
    name: "Hero Without Image",
    category: "hero",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button URL", type: "text" },
    ],
  },
  {
    id: "testimonial_slider",
    name: "Testimonial Slider",
    category: "social_proof",
    fields: [
      {
        key: "items",
        label: "Testimonials",
        type: "items",
        itemFields: [
          { key: "quote", label: "Quote", type: "textarea" },
          { key: "author_name", label: "Author Name", type: "text" },
          { key: "author_role", label: "Author Role", type: "text" },
          { key: "author_image", label: "Author Image URL", type: "image" },
          { key: "image", label: "Side Image URL", type: "image" },
        ],
      },
    ],
  },
  {
    id: "metrics",
    name: "Features Metrics",
    category: "content",
    fields: [
      {
        key: "items",
        label: "Metrics",
        type: "items",
        itemFields: [
          { key: "value", label: "Value (e.g. 87%)", type: "text" },
          { key: "description", label: "Description", type: "text" },
        ],
      },
    ],
  },
  {
    id: "logos",
    name: "Logos Without Title",
    category: "social_proof",
    fields: [
      {
        key: "items",
        label: "Logos",
        type: "items",
        itemFields: [
          { key: "name", label: "Company Name", type: "text" },
          { key: "image", label: "Logo Image URL", type: "image" },
        ],
      },
    ],
  },
  // === CTA / Content layouts ===
  {
    id: "cta_banner",
    name: "CTA Banner",
    category: "content",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "button_text", label: "Button Text", type: "text" },
      { key: "button_url", label: "Button URL", type: "text" },
      { key: "image", label: "Background Image URL", type: "image" },
    ],
  },
  {
    id: "full_width_image",
    name: "Full-Width Image",
    category: "content",
    fields: [
      { key: "image", label: "Image URL", type: "image" },
      { key: "alt", label: "Alt Text", type: "text" },
      { key: "caption", label: "Caption (optional)", type: "text" },
    ],
  },
  {
    id: "faq_accordion",
    name: "FAQ Accordion",
    category: "content",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "items",
        itemFields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "text_block",
    name: "Text Block",
    category: "content",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
    ],
  },
  // === Inspired by existing website sections ===
  {
    id: "two_col_text",
    name: "Two-Column Text",
    category: "content",
    fields: [
      { key: "title", label: "Title (optional)", type: "text" },
      {
        key: "items",
        label: "Paragraphs / Columns",
        type: "items",
        itemFields: [
          { key: "body", label: "Paragraph", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "icon_feature_grid",
    name: "Icon Feature Grid",
    category: "content",
    fields: [
      { key: "title", label: "Section Title (optional)", type: "text" },
      {
        key: "items",
        label: "Features",
        type: "items",
        itemFields: [
          { key: "icon", label: "Icon URL", type: "image" },
          { key: "title", label: "Feature Title", type: "text" },
          { key: "description", label: "Description (optional)", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "dark_centered_text",
    name: "Dark Centered Section",
    category: "content",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Body", type: "textarea" },
      { key: "image", label: "Image / Diagram URL (optional)", type: "image" },
    ],
  },
  {
    id: "split_title_text",
    name: "Split Title + Text",
    category: "content",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "description", label: "Body Paragraphs", type: "textarea" },
      { key: "image", label: "Diagram / Image URL (optional)", type: "image" },
    ],
  },
  {
    id: "alternating_image_text",
    name: "Alternating Image + Text",
    category: "collections",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      {
        key: "items",
        label: "Rows",
        type: "items",
        itemFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image", label: "Image URL", type: "image" },
          { key: "bg_image", label: "Background Image URL (optional)", type: "image" },
          { key: "layout", label: "Layout (image-left / text-left)", type: "text" },
        ],
      },
    ],
  },
  {
    id: "publication_cards",
    name: "Publication Cards",
    category: "collections",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      {
        key: "items",
        label: "Publications",
        type: "items",
        itemFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "body", label: "Body / Summary", type: "textarea" },
          { key: "date", label: "Date", type: "text" },
          { key: "link", label: "Link URL", type: "text" },
        ],
      },
    ],
  },
  // === Collection layouts ===
  {
    id: "card_grid",
    name: "Card Grid",
    category: "collections",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      { key: "columns", label: "Columns (2-4)", type: "text" },
      {
        key: "items",
        label: "Cards",
        type: "items",
        itemFields: [
          { key: "image", label: "Image URL", type: "image" },
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "link", label: "Link URL", type: "text" },
          { key: "link_text", label: "Link Text", type: "text" },
        ],
      },
    ],
  },
  {
    id: "card_carousel",
    name: "Card Carousel",
    category: "collections",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      {
        key: "items",
        label: "Cards",
        type: "items",
        itemFields: [
          { key: "image", label: "Image URL", type: "image" },
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "link", label: "Link URL", type: "text" },
          { key: "link_text", label: "Link Text", type: "text" },
        ],
      },
    ],
  },
  {
    id: "image_text_list",
    name: "Image + Text List",
    category: "collections",
    fields: [
      { key: "title", label: "Section Title", type: "text" },
      {
        key: "items",
        label: "Entries",
        type: "items",
        itemFields: [
          { key: "image", label: "Image URL", type: "image" },
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role / Subtitle", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "link", label: "Link URL (e.g. LinkedIn)", type: "text" },
        ],
      },
    ],
  },
];

export function getDefaultContent(templateId: string): Record<string, any> {
  const template = LAYOUT_TEMPLATES.find((t) => t.id === templateId);
  if (!template) return {};
  const content: Record<string, any> = { layout: templateId };
  for (const field of template.fields) {
    if (field.type === "items") {
      content[field.key] = [];
    } else {
      content[field.key] = "";
    }
  }
  return content;
}
