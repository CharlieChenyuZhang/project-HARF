type Member = {
  name: string;
  role: string;
  photo: string;
  bio: string[];
};

const TEAM: Member[] = [
  {
    name: "Sandra Boccia",
    role: "Founder",
    photo: "/team/sandra-boccia.jpg",
    bio: [
      "Sandra Boccia is an award-winning Brazilian journalist and media executive, currently a Research Fellow at Harvard University’s Weatherhead Center for International Affairs and a Senior Fellow of Harvard’s Advanced Leadership Initiative. Her career has focused on innovation and the impact of technology on society.",
      "Drawing on her journalistic background and experience building platforms for public engagement, she founded HARF to document how artificial intelligence is transforming people’s lives through firsthand narratives. By bringing these experiences together, the platform seeks to reveal patterns in how people experience and relate to AI, offering a human-centered perspective to inform research and public debate.",
    ],
  },
  {
    name: "João Lucas Oliveira Silva",
    role: "Harvard College",
    photo: "/team/joao-lucas-oliveira-silva.jpg",
    bio: [
      "João Lucas Oliveira Silva is a Computer Science and Government student at Harvard College, focusing on political economy, war theory, and applying AI-driven technologies in the public sector. He is a research assistant at Harvard University’s Weatherhead Center for International Affairs and previously worked as a Software Engineer at the largest investment bank in Latin America.",
    ],
  },
  {
    name: "Allison",
    role: "Harvard Graduate School of Education",
    photo: "/team/allison.jpg",
    bio: [
      "Allison is a creative strategist, social entrepreneur, and Ed.M. candidate at Harvard Graduate School of Education. Across education, technology, and the arts, she brings research and creative thinking together to shape ideas, build ventures, and turn ambitious concepts into reality.",
    ],
  },
  {
    name: "Chenyu Zhang",
    role: "AI Researcher, Engineer & Entrepreneur",
    photo: "/team/chenyu-zhang.jpg",
    bio: [
      "Chenyu Zhang is an AI researcher, engineer, and entrepreneur with an interdisciplinary background in education technology from Harvard University and in computer science and artificial intelligence from the University of Toronto. At the MIT Media Lab, Chenyu has conducted research with the Affective Computing, Personal Robots, and Multisensory Intelligence groups, collaborating with scholars including Professor Rosalind Picard, founder of the field of affective computing, and served as a teaching assistant for MIT’s affective computing course. Chenyu has also worked on AI safety and agentic AI at Harvard’s Berkman Klein Center, and on large language models and computational social science at Stanford HAI, with research published at CHI, NeurIPS, AAAI, ACII, and AERA.",
    ],
  },
];

export function TeamSection() {
  return (
    <section id="team" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-24 sm:pt-32">
      <p className="eyebrow">The team</p>
      <h2 className="mt-2 font-serif text-3xl sm:text-4xl">The people behind HARF</h2>
      <ul className="mt-10 grid gap-6 lg:grid-cols-2">
        {TEAM.map((m) => (
          <li
            key={m.name}
            className="flex flex-col gap-6 rounded-lg bg-card p-7 shadow-sm ring-1 ring-rule sm:flex-row sm:items-start"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export: images are served unoptimized */}
            <img
              src={m.photo}
              alt={`Portrait of ${m.name}`}
              loading="lazy"
              className="aspect-square w-28 shrink-0 rounded-full object-cover object-top ring-1 ring-rule sm:w-32"
            />
            <div>
              <h3 className="font-serif text-2xl leading-tight">{m.name}</h3>
              <p className="mt-1 text-sm text-accent">{m.role}</p>
              {m.bio.map((p, i) => (
                <p key={i} className="mt-4 text-sm leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
