import { readFileSync } from 'node:fs';

const stylesheet = readFileSync(new URL('./style.css', import.meta.url), 'utf-8');

const designVariants = [
  {
    id: 'noctilux',
    label: 'Noctilux Glow',
    description: 'Electric indigo, cyan flares, and midnight glass.',
    mode: 'dark',
    layout: 'split-glass',
    layoutLabel: 'Split Glass Showcase',
    aliases: ['default', 'sleek', 'macchiato', 'neon'],
  },
  {
    id: 'aurora',
    label: 'Aurora Drift',
    description: 'Glacial teals and violets with luminous shimmer.',
    mode: 'dark',
    layout: 'stacked-spotlight',
    layoutLabel: 'Stacked Spotlight Columns',
    aliases: ['teal', 'northern-lights'],
  },
  {
    id: 'velvet',
    label: 'Velvet Bloom',
    description: 'Plum gradients with iridescent magenta notes.',
    mode: 'dark',
    layout: 'gallery-panels',
    layoutLabel: 'Gallery Cascade Grid',
    aliases: ['plum', 'magenta'],
  },
  {
    id: 'obsidian',
    label: 'Obsidian Haze',
    description: 'Charcoal layers accented by mint neon piping.',
    mode: 'dark',
    layout: 'offset-ribbon',
    layoutLabel: 'Offset Ribbon Columns',
    aliases: ['charcoal', 'graphite'],
  },
  {
    id: 'ember',
    label: 'Ember Pulse',
    description: 'Molten ambers and copper-gold illumination.',
    mode: 'dark',
    layout: 'timeline-pillars',
    layoutLabel: 'Timeline Pillar Spine',
    aliases: ['amber', 'sunset-dark'],
  },
  {
    id: 'solstice',
    label: 'Solstice Glow',
    description: 'Soft sunrise peaches with refined neutrals.',
    mode: 'light',
    layout: 'sunrise-columns',
    layoutLabel: 'Sunrise Twin Columns',
    aliases: ['sunrise', 'warm-light'],
  },
  {
    id: 'glacier',
    label: 'Glacier Frost',
    description: 'High-key whites with lucid arctic blues.',
    mode: 'light',
    layout: 'single-flow',
    layoutLabel: 'Single Flow Narrative',
    aliases: ['ice', 'cool-light'],
  },
  {
    id: 'sage',
    label: 'Sage Whisper',
    description: 'Herbal greens and airy natural linen.',
    mode: 'light',
    layout: 'botanical-frame',
    layoutLabel: 'Botanical Framed Ledger',
    aliases: ['green-light', 'botanical'],
  },
  {
    id: 'cobalt',
    label: 'Cobalt Current',
    description: 'Deep marine blues and sharp glass edges.',
    mode: 'dark',
    layout: 'precision-grid',
    layoutLabel: 'Precision Grid Stack',
    aliases: ['blue', 'marine'],
  },
  {
    id: 'lumen',
    label: 'Lumen Quartz',
    description: 'Minimal ivory slate with coral energy.',
    mode: 'light',
    layout: 'minimal-strata',
    layoutLabel: 'Minimal Strata Boards',
    aliases: ['minimal', 'coral-light'],
  },
];

const variantIndex = new Map(
  designVariants.flatMap((variant) => {
    const pairs = [[variant.id, variant]];
    (variant.aliases || []).forEach((alias) => {
      if (!alias) return;
      const key = alias.trim().toLowerCase();
      if (key) pairs.push([key, variant]);
    });
    return pairs;
  }),
);

const normalizeVariantKey = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const variantMetadata = designVariants.map((variant) => {
  const layoutKey = variant.layout ? normalizeVariantKey(variant.layout) : '';
  const aliases = Array.isArray(variant.aliases)
    ? variant.aliases.filter(Boolean).map((alias) => alias.trim())
    : [];

  return {
    id: variant.id,
    label: variant.label,
    description: variant.description,
    mode: variant.mode,
    layout: layoutKey,
    layoutLabel: variant.layoutLabel || variant.layout || '',
    layoutSource: variant.layout || '',
    aliases,
  };
});

const layoutMetadata = Array.from(
  variantMetadata.reduce((map, entry) => {
    if (!entry.layout) return map;
    if (!map.has(entry.layout)) {
      map.set(entry.layout, {
        id: entry.layout,
        label: entry.layoutLabel || entry.layoutSource || entry.layout,
        source: entry.layoutSource,
      });
    }
    return map;
  }, new Map()).values(),
);

const selectVariant = (resume = {}, options = {}) => {
  const candidates = [
    options?.variant,
    options?.themeVariant,
    options?.design,
    options?.palette,
    options?.themeSettings?.variant,
    options?.themeSettings?.design,
    options?.themeSettings?.palette,
    resume?.meta?.themeVariant,
    resume?.meta?.variant,
    resume?.meta?.design,
    resume?.meta?.palette,
  ]
    .flat()
    .filter((value) => value != null);

  for (const candidate of candidates) {
    const normalized = normalizeVariantKey(candidate);
    const match = variantIndex.get(normalized);
    if (match) return match;
  }

  return designVariants[0];
};

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const escapeHtml = (value) => {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatDate = (value) => {
  if (!value) return '';
  const [year, month] = String(value).split('-');
  if (year && month) {
    const monthIndex = Number.parseInt(month, 10) - 1;
    const label = monthNames[monthIndex];
    return label ? `${label} ${year}` : `${month}/${year}`;
  }
  if (year) return year;
  return value;
};

const formatDateRange = (start, end) => {
  const startLabel = formatDate(start);
  const endLabel = end ? formatDate(end) : 'Present';

  if (!startLabel && !endLabel) return '';
  if (!startLabel) return endLabel;
  return `${startLabel} — ${endLabel}`;
};

const renderList = (items, wrapperClass) => {
  if (!items?.length) return '';
  return `<ul class="${wrapperClass}">${items.join('')}</ul>`;
};

const renderHero = (basics = {}) => {
  const name = basics.name ? `<h1 class="hero__title">${escapeHtml(basics.name)}</h1>` : '';
  const label = basics.label ? `<p class="hero__subtitle">${escapeHtml(basics.label)}</p>` : '';

  const locationParts = [basics.location?.city, basics.location?.region, basics.location?.countryCode]
    .filter(Boolean)
    .map(escapeHtml);
  const location = locationParts.length
    ? `<span class="hero__chip">${locationParts.join(', ')}</span>`
    : '';

  const website = basics.website || basics.url;
  const url = website
    ? `<a class="hero__chip" href="${escapeHtml(website)}" target="_blank" rel="noreferrer">${escapeHtml(
        website.replace(/(^https?:\/\/)?(www\.)?/, ''),
      )}</a>`
    : '';

  const contactChips = [location, url];

  const profileChips = (basics.profiles || [])
    .filter((profile) => profile?.url)
    .map((profile) => {
      const label = profile.network ? escapeHtml(profile.network) : 'Profile';
      return `<a class="hero__chip" href="${escapeHtml(profile.url)}" target="_blank" rel="noreferrer">${label}</a>`;
    })
    .join('');

  const chips = contactChips.filter(Boolean).join('') + profileChips;

  return `
    <header class="hero">
      <div>
        ${name}
        ${label}
      </div>
      ${chips ? `<div class="hero__chips">${chips}</div>` : ''}
    </header>
  `;
};

const renderSummary = (basics = {}) => {
  const summary = basics.summary;
  if (!summary) return '';
  const paragraphs = summary
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
  if (!paragraphs) return '';
  return `
    <section class="section">
      <div class="section__heading">
        <h2>Profile</h2>
        <p>Seasoned perspective, distilled into crisp narrative.</p>
      </div>
      <div class="section__body">${paragraphs}</div>
    </section>
  `;
};

const renderWork = (work = []) => {
  if (!work.length) return '';
  const items = work
    .map((role) => {
      const position = role.position ? `<h3>${escapeHtml(role.position)}</h3>` : '';
      const company = role.company ? `<span class="timeline__company">${escapeHtml(role.company)}</span>` : '';
      const dateRange = formatDateRange(role.startDate, role.endDate);
      const metaParts = [];
      if (dateRange) metaParts.push(`<span>${escapeHtml(dateRange)}</span>`);
      if (role.location) metaParts.push(`<span>${escapeHtml(role.location)}</span>`);
      const meta = metaParts.length
        ? `<div class="timeline__meta">${metaParts.join('<span class="timeline__bullet"></span>')}</div>`
        : '';
      const summary = role.summary ? `<p class="timeline__summary">${escapeHtml(role.summary)}</p>` : '';
      const highlights = renderList(
        (role.highlights || [])
          .filter(Boolean)
          .map((item) => `<li>${escapeHtml(item)}</li>`),
        'timeline__list',
      );
      const keywords = (role.keywords || [])
        .filter(Boolean)
        .map((keyword) => `<span>${escapeHtml(keyword)}</span>`)
        .join('');
      const skills = keywords ? `<div class="tag-row">${keywords}</div>` : '';
      const link = role.website
        ? `<a class="inline-link" href="${escapeHtml(role.website)}" target="_blank" rel="noreferrer">${escapeHtml(
            role.website.replace(/(^https?:\/\/)?(www\.)?/, ''),
          )}</a>`
        : '';

      return `
        <article class="timeline__item">
          <header class="timeline__header">
            <div>
              ${position}
              ${company}
            </div>
            ${meta}
          </header>
          ${summary}
          ${highlights}
          ${skills}
          ${link ? `<div class="timeline__link">${link}</div>` : ''}
        </article>
      `;
    })
    .join('');

  return `
    <section class="section">
      <div class="section__heading">
        <h2>Experience</h2>
        <p>High-impact roles where strategy met execution.</p>
      </div>
      <div class="timeline">${items}</div>
    </section>
  `;
};

const renderProjects = (projects = []) => {
  if (!projects.length) return '';
  const cards = projects
    .map((project) => {
      const title = project.name ? `<h3>${escapeHtml(project.name)}</h3>` : '';
      const description = project.description
        ? `<p>${escapeHtml(project.description)}</p>`
        : '';
      const highlights = renderList(
        (project.highlights || [])
          .filter(Boolean)
          .map((item) => `<li>${escapeHtml(item)}</li>`),
        'card__list',
      );
      const keywords = (project.keywords || [])
        .filter(Boolean)
        .map((keyword) => `<span>${escapeHtml(keyword)}</span>`)
        .join('');
      const tags = keywords ? `<div class="tag-row">${keywords}</div>` : '';
      const link = project.url || project.website;
      const action = link
        ? `<a class="inline-link" href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${escapeHtml(
            link.replace(/(^https?:\/\/)?(www\.)?/, ''),
          )}</a>`
        : '';

      return `
        <article class="card">
          ${title}
          ${description}
          ${highlights}
          ${tags}
          ${action ? `<div class="card__link">${action}</div>` : ''}
        </article>
      `;
    })
    .join('');

  return `
    <section class="section">
      <div class="section__heading">
        <h2>Projects</h2>
        <p>Selected initiatives that shipped polish and measurable value.</p>
      </div>
      <div class="card-grid">${cards}</div>
    </section>
  `;
};

const renderEducation = (education = []) => {
  if (!education.length) return '';
  const items = education
    .map((entry) => {
      const title = entry.institution ? `<h3>${escapeHtml(entry.institution)}</h3>` : '';
      const degreeParts = [entry.studyType, entry.area].filter(Boolean).map(escapeHtml);
      const degree = degreeParts.length ? `<p class="stack__subtitle">${degreeParts.join(' · ')}</p>` : '';
      const dateRange = formatDateRange(entry.startDate, entry.endDate);
      const metaParts = [];
      if (dateRange) metaParts.push(dateRange);
      if (entry.gpa) metaParts.push(`GPA ${escapeHtml(entry.gpa)}`);
      const meta = metaParts.length ? `<div class="stack__meta">${metaParts.map(escapeHtml).join(' · ')}</div>` : '';
      return `<li>${title}${degree}${meta}</li>`;
    })
    .join('');

  return `
    <section class="section">
      <div class="section__heading">
        <h2>Education</h2>
        <p>Foundations in theory, enriched with real-world application.</p>
      </div>
      <ul class="stack">${items}</ul>
    </section>
  `;
};

const renderVolunteer = (volunteer = []) => {
  if (!volunteer.length) return '';
  const items = volunteer
    .map((entry) => {
      const role = entry.position ? `<h3>${escapeHtml(entry.position)}</h3>` : '';
      const org = entry.organization ? `<span class="stack__subtitle">${escapeHtml(entry.organization)}</span>` : '';
      const dateRange = formatDateRange(entry.startDate, entry.endDate);
      const summary = entry.summary ? `<p>${escapeHtml(entry.summary)}</p>` : '';
      const highlights = renderList(
        (entry.highlights || [])
          .filter(Boolean)
          .map((item) => `<li>${escapeHtml(item)}</li>`),
        'card__list',
      );
      return `<article class="card">${role}${org}${dateRange ? `<div class="stack__meta">${escapeHtml(
        dateRange,
      )}</div>` : ''}${summary}${highlights}</article>`;
    })
    .join('');

  return `
    <section class="section">
      <div class="section__heading">
        <h2>Leadership & Service</h2>
        <p>Communities and missions that mattered.</p>
      </div>
      <div class="card-grid">${items}</div>
    </section>
  `;
};

const renderAwards = (awards = []) => {
  if (!awards.length) return '';
  const items = awards
    .map((award) => {
      const title = award.title ? `<h3>${escapeHtml(award.title)}</h3>` : '';
      const awarder = award.awarder ? `<span class="stack__subtitle">${escapeHtml(award.awarder)}</span>` : '';
      const date = formatDate(award.date);
      const summary = award.summary ? `<p>${escapeHtml(award.summary)}</p>` : '';
      return `<li>${title}${awarder}${date ? `<div class="stack__meta">${escapeHtml(date)}</div>` : ''}${summary}</li>`;
    })
    .join('');

  return `
    <section class="panel">
      <h2>Awards</h2>
      <ul class="stack">${items}</ul>
    </section>
  `;
};

const renderPublications = (publications = []) => {
  if (!publications.length) return '';
  const items = publications
    .map((pub) => {
      const name = pub.name ? `<h3>${escapeHtml(pub.name)}</h3>` : '';
      const publisher = pub.publisher ? `<span class="stack__subtitle">${escapeHtml(pub.publisher)}</span>` : '';
      const release = formatDate(pub.releaseDate);
      const summary = pub.summary ? `<p>${escapeHtml(pub.summary)}</p>` : '';
      const link = pub.url
        ? `<a class="inline-link" href="${escapeHtml(pub.url)}" target="_blank" rel="noreferrer">${escapeHtml(
            pub.url.replace(/(^https?:\/\/)?(www\.)?/, ''),
          )}</a>`
        : '';
      return `<li>${name}${publisher}${release ? `<div class="stack__meta">${escapeHtml(
        release,
      )}</div>` : ''}${summary}${link}</li>`;
    })
    .join('');

  return `
    <section class="panel">
      <h2>Publications</h2>
      <ul class="stack">${items}</ul>
    </section>
  `;
};

const renderReferences = (references = []) => {
  if (!references.length) return '';
  const items = references
    .map((reference) => {
      const name = reference.name ? `<h3>${escapeHtml(reference.name)}</h3>` : '';
      const referenceText = reference.reference
        ? `<p>${escapeHtml(reference.reference)}</p>`
        : '';
      return `<li>${name}${referenceText}</li>`;
    })
    .join('');

  return `
    <section class="panel">
      <h2>References</h2>
      <ul class="stack">${items}</ul>
    </section>
  `;
};

const renderSkills = (skills = []) => {
  if (!skills.length) return '';
  const items = skills
    .map((skill) => {
      if (!skill?.name) return '';
      const keywords = (skill.keywords || [])
        .filter(Boolean)
        .map((keyword) => `<span>${escapeHtml(keyword)}</span>`)
        .join('');
      const tags = keywords ? `<div class="tag-row">${keywords}</div>` : '';
      const level = skill.level ? `<span class="badge">${escapeHtml(skill.level)}</span>` : '';
      return `<li><div class="skill__header"><h3>${escapeHtml(skill.name)}</h3>${level}</div>${tags}</li>`;
    })
    .filter(Boolean)
    .join('');

  if (!items) return '';

  return `
    <section class="panel">
      <h2>Expertise</h2>
      <ul class="skill-stack">${items}</ul>
    </section>
  `;
};

const renderLanguages = (languages = []) => {
  if (!languages.length) return '';
  const items = languages
    .map((language) => {
      if (!language?.language) return '';
      const level = language.level ? `<span>${escapeHtml(language.level)}</span>` : '';
      return `<li>${escapeHtml(language.language)}${level}</li>`;
    })
    .filter(Boolean)
    .join('');
  if (!items) return '';
  return `
    <section class="panel">
      <h2>Languages</h2>
      <ul class="pill-list">${items}</ul>
    </section>
  `;
};

const renderInterests = (interests = []) => {
  if (!interests.length) return '';
  const items = interests
    .map((interest) => {
      if (!interest?.name) return '';
      const keywords = (interest.keywords || [])
        .filter(Boolean)
        .map((keyword) => `<span>${escapeHtml(keyword)}</span>`)
        .join('');
      return `<li><span>${escapeHtml(interest.name)}</span>${keywords ? `<small>${keywords}</small>` : ''}</li>`;
    })
    .filter(Boolean)
    .join('');

  if (!items) return '';

  return `
    <section class="panel">
      <h2>Interests</h2>
      <ul class="interest-list">${items}</ul>
    </section>
  `;
};

const renderContact = (basics = {}) => {
  const contactItems = [];

  if (basics.email) {
    contactItems.push(
      `<li><span>Email</span><a href="mailto:${encodeURIComponent(basics.email)}">${escapeHtml(basics.email)}</a></li>`,
    );
  }

  if (basics.phone) {
    const phone = String(basics.phone).replace(/\s+/g, '');
    contactItems.push(
      `<li><span>Phone</span><a href="tel:${encodeURIComponent(phone)}">${escapeHtml(basics.phone)}</a></li>`,
    );
  }

  const website = basics.website || basics.url;
  if (website) {
    contactItems.push(
      `<li><span>Website</span><a href="${escapeHtml(website)}" target="_blank" rel="noreferrer">${escapeHtml(
        website.replace(/(^https?:\/\/)?(www\.)?/, ''),
      )}</a></li>`,
    );
  }

  const profiles = (basics.profiles || [])
    .filter((profile) => profile?.url)
    .map((profile) => {
      const label = profile.network ? escapeHtml(profile.network) : 'Profile';
      return `<li><span>${label}</span><a href="${escapeHtml(profile.url)}" target="_blank" rel="noreferrer">${escapeHtml(
        profile.url.replace(/(^https?:\/\/)?(www\.)?/, ''),
      )}</a></li>`;
    });

  const locationParts = [basics.location?.city, basics.location?.region, basics.location?.countryCode]
    .filter(Boolean)
    .map(escapeHtml);
  if (locationParts.length) {
    contactItems.unshift(`<li><span>Location</span><p>${locationParts.join(', ')}</p></li>`);
  }

  const items = [...contactItems, ...profiles];
  if (!items.length) return '';

  return `
    <section class="panel">
      <h2>Contact</h2>
      <ul class="contact-list">${items.join('')}</ul>
    </section>
  `;
};

const renderSidebar = (resume) => {
  const basics = resume.basics || {};
  const skills = renderSkills(resume.skills);
  const languages = renderLanguages(resume.languages);
  const interests = renderInterests(resume.interests);
  const awards = renderAwards(resume.awards);
  const publications = renderPublications(resume.publications);
  const references = renderReferences(resume.references);

  const pieces = [renderContact(basics), skills, languages, interests, awards, publications, references]
    .filter(Boolean)
    .join('');

  if (!pieces) return '';

  return `<aside class="sidebar">${pieces}</aside>`;
};

export function render(resume = {}, options = {}) {
  const basics = resume.basics || {};
  const variant = selectVariant(resume, options);
  const variantMeta =
    variantMetadata.find((entry) => entry.id === variant.id) ||
    (() => {
      const layout = variant.layout ? normalizeVariantKey(variant.layout) : '';
      return {
        id: variant.id,
        label: variant.label,
        description: variant.description,
        mode: variant.mode,
        layout,
        layoutLabel: variant.layoutLabel || variant.layout || '',
        layoutSource: variant.layout || '',
        aliases: [],
      };
    })();
  const titleParts = [];
  if (basics.name) titleParts.push(escapeHtml(basics.name));
  if (basics.label) titleParts.push(escapeHtml(basics.label));
  const title = titleParts.length ? titleParts.join(' — ') : 'Resume';

  const availableVariants = variantMetadata.map((entry) => entry.id).join(',');
  const availableLayouts = layoutMetadata.map((entry) => entry.id).join(',');
  const layoutClass = variantMeta.layout;
  const layoutLabel = variantMeta.layoutLabel || variantMeta.layoutSource || '';
  const aliasList = variantMeta.aliases.join(',');
  const bodyClasses = ['theme', `theme--${variant.id}`];
  if (layoutClass) bodyClasses.push(`theme--layout-${layoutClass}`);
  if (variant.mode) bodyClasses.push(`theme--mode-${variant.mode}`);
  const bodyAttributes = [
    `class="${bodyClasses.join(' ')}"`,
    `data-theme-variant="${variant.id}"`,
    `data-theme-label="${escapeHtml(variant.label)}"`,
    `data-theme-mode="${variant.mode}"`,
    `data-theme-description="${escapeHtml(variant.description)}"`,
    aliasList ? `data-theme-aliases="${escapeHtml(aliasList)}"` : null,
    layoutClass ? `data-theme-layout="${layoutClass}"` : null,
    layoutLabel ? `data-theme-layout-label="${escapeHtml(layoutLabel)}"` : null,
    availableVariants ? `data-theme-variants="${escapeHtml(availableVariants)}"` : null,
    availableLayouts ? `data-theme-layouts="${escapeHtml(availableLayouts)}"` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const bodySections = [
    renderSummary(basics),
    renderWork(resume.work),
    renderProjects(resume.projects),
    renderEducation(resume.education),
    renderVolunteer(resume.volunteer),
  ]
    .filter(Boolean)
    .join('');

  const mainContent = bodySections ? `<section class="content">${bodySections}</section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Barlow:wght@500;600;700&family=Red+Hat+Display:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Lexend:wght@400;500;600;700&family=Fira+Sans:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <meta name="sleek:theme-variant" content="${variant.id}" />
    <meta name="sleek:theme-variant-label" content="${escapeHtml(variant.label)}" />
    <meta name="sleek:theme-mode" content="${variant.mode}" />
    <meta name="sleek:theme-variant-aliases" content="${escapeHtml(aliasList)}" />
    <meta name="sleek:theme-layout" content="${layoutClass}" />
    <meta name="sleek:theme-layout-label" content="${escapeHtml(layoutLabel)}" />
    <meta name="sleek:theme-variants" content="${availableVariants}" />
    <meta name="sleek:theme-layouts" content="${availableLayouts}" />
    <style>${stylesheet}</style>
  </head>
  <body ${bodyAttributes}>
    <main class="page">
      ${renderHero(basics)}
      <div class="layout">
        ${renderSidebar(resume)}
        ${mainContent}
      </div>
    </main>
  </body>
</html>`;
}

const themeMetadata = {
  defaultVariant: designVariants[0]?.id ?? null,
  variants: variantMetadata.map((entry) => ({
    id: entry.id,
    label: entry.label,
    description: entry.description,
    mode: entry.mode,
    layout: entry.layout,
    layoutLabel: entry.layoutLabel,
    layoutSource: entry.layoutSource,
    aliases: [...entry.aliases],
  })),
  layouts: layoutMetadata.map((entry) => ({
    id: entry.id,
    label: entry.label,
    source: entry.source,
    variants: variantMetadata.filter((variant) => variant.layout === entry.id).map((variant) => variant.id),
  })),
};

render.metadata = themeMetadata;
render.variants = themeMetadata.variants;
render.layouts = themeMetadata.layouts;
render.stylesheet = stylesheet;
render.designVariants = designVariants;
render.selectVariant = selectVariant;

export const metadata = themeMetadata;
export const variants = themeMetadata.variants;
export const layouts = themeMetadata.layouts;

export default { render };
