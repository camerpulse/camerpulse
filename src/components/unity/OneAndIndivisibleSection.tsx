import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ancestralMask from '@/assets/ancestral-mask.jpg';
import ancestralPatterns from '@/assets/ancestral-patterns.jpg';
import ancestralVillage from '@/assets/ancestral-village.jpg';

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, className = '' }) => (
  <Card className={`p-8 mb-8 bg-gradient-ancestral shadow-sacred-depth border border-orange-200/30 ${className}`}>
    <div className="flex items-center mb-6">
      <span className="text-4xl mr-4">{icon}</span>
      <h2 className="text-3xl font-bold text-gradient-sacred-unity">{title}</h2>
    </div>
    <div className="prose prose-lg max-w-none text-amber-50">
      {children}
    </div>
  </Card>
);

const HeroSection: React.FC = () => (
  <div className="relative mb-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-heritage opacity-90" />
    <img 
      src={ancestralVillage} 
      alt="Ancestral Cameroonian landscape" 
      className="w-full h-[400px] object-cover"
    />
    <div className="absolute inset-0 flex items-center justify-center text-center p-8">
      <div className="max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold text-amber-100 mb-4 shadow-sacred-depth">
          🛡️ One and Indivisible Cameroon
        </h1>
        <p className="text-xl md:text-2xl text-amber-200 italic">
          Rediscovering Our True Identity
        </p>
        <p className="text-lg text-amber-300 mt-4">
          *Written by Ye Morningstar*
        </p>
      </div>
    </div>
  </div>
);

const ArtifactDisplay: React.FC = () => (
  <div className="grid md:grid-cols-2 gap-8 mb-12">
    <Card className="p-6 bg-gradient-royal-forest shadow-royal-forest">
      <img 
        src={ancestralMask} 
        alt="Sacred Bamileke mask" 
        className="w-full h-64 object-cover rounded-lg mb-4 shadow-ancestral-glow"
      />
      <h3 className="text-xl font-semibold text-amber-100 mb-2">Sacred Ancestral Masks</h3>
      <p className="text-amber-200">
        Traditional Bamileke elephant masks represent wisdom, strength, and royal heritage passed down through generations.
      </p>
    </Card>
    
    <Card className="p-6 bg-gradient-royal-forest shadow-royal-forest">
      <img 
        src={ancestralPatterns} 
        alt="Royal Bamoun patterns" 
        className="w-full h-64 object-cover rounded-lg mb-4 shadow-ancestral-glow"
      />
      <h3 className="text-xl font-semibold text-amber-100 mb-2">Sacred Patterns & Motifs</h3>
      <p className="text-amber-200">
        Royal Bamoun embroidery and traditional designs that connect us to our shared spiritual heritage.
      </p>
    </Card>
  </div>
);

export const OneAndIndivisibleSection: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-sacred-unity">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ArtifactDisplay />
        
        <Section title="Who Were We Before Colonization?" icon="🌳">
          <p className="mb-4">
            Before the colonial ships docked on our shores, before the foreign flags were raised over our sacred soil, 
            we were an interconnected tapestry of vibrant communities, powerful kingdoms, and harmonious societies. 
            Cameroon was not defined by languages forced upon us by colonial invaders; we were defined by kinship, 
            ancestral bonds, shared traditions, and collective spirituality.
          </p>
          <p>
            Our ancestors thrived across the diverse landscapes of Cameroon, united by customs, beliefs, foods, 
            dances, and rituals passed down through generations.
          </p>
        </Section>

        <Section title="Our Ancestral Roots: United Beyond Borders" icon="🌍">
          <p className="mb-4">
            The Tikar people of the Northwest and the Bamileke of the West Region share direct ancestral connections, 
            evident in cultural similarities, traditional attire, language roots, and social structures. Bamenda and 
            Bafoussam are not divided by any true cultural boundary; they share heritage and ancestral lineage, from 
            communal systems of governance to sacred rituals and symbolic artistry.
          </p>
          <p className="mb-4">
            The Douala of the Littoral Region and the Bakweri of the Southwest have historically intermarried, traded, 
            and shared cultural festivities like the Ngondo festival, demonstrating deeply intertwined histories and 
            traditions. From the coastlines of Limbe to the banks of the Wouri River, our shared fishing traditions, 
            canoe-making skills, and maritime festivals have always brought us together.
          </p>
          <p>
            The Fulani and Hausa peoples in the Northern regions have long-standing historical alliances and exchanges 
            with the peoples of the Southern forest regions and Eastern plains. We have always exchanged goods, traditions, 
            and ideas through ancient trade routes that predate any colonial demarcation.
          </p>
        </Section>

        <Section title="The Colonial Agenda: Dividing the Indivisible" icon="⚔️">
          <p className="mb-4">
            Colonial powers arrived, bringing a narrative of division intended to weaken and dominate us. They imposed 
            artificial languages—French and English—labels of "Anglophone" and "Francophone," designed not for our 
            identity but for their convenience and control.
          </p>
          <p className="mb-4">
            These invaders disrespected our forefathers, desecrated our sacred groves, humiliated our elders publicly, 
            mocked our spiritual systems, and systematically stole our resources. They enslaved our people, exploiting 
            our labor and strength to build their empires, while simultaneously undermining our indigenous civilizations 
            and cultural pride.
          </p>
          <p>
            They desecrated the shrines of the Bamoun Kingdom. They outlawed the secret societies of the Bakossi and Ekoi. 
            They burned the totems of the Tikar and rewrote our oral histories. Their aim was not just to rule us—it was 
            to <strong>erase us</strong>.
          </p>
        </Section>

        <Section title="Resistance and Sacrifice: Cameroon's Martyrs and Heroes" icon="🔥">
          <p className="mb-4">Our forefathers and foremothers resisted fiercely:</p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Ruben Um Nyobé</strong>, assassinated for advocating unity and freedom.</li>
            <li><strong>Félix-Roland Moumié</strong>, poisoned abroad for refusing to surrender Cameroon's sovereignty.</li>
            <li><strong>Ernest Ouandié</strong>, executed publicly, yet his spirit demanded unity until his last breath.</li>
            <li><strong>Martin-Paul Samba</strong>, killed for fighting colonial injustice.</li>
            <li><strong>Ndeh Ntumazah</strong>, <strong>Albert Mukong</strong>, <strong>Osende Afana</strong>, and countless others suffered imprisonment, exile, torture, and death, all insisting Cameroon remain one, united, and indivisible.</li>
          </ul>
          <p>
            These were not "Francophones" or "Anglophones." They were <strong>Cameroonians</strong>—guardians of the soul of the land.
          </p>
        </Section>

        <Section title="Cameroonians Shining Globally" icon="🌟">
          <p className="mb-4">
            Our unity has always been our greatest strength. From business and innovation to entertainment and politics, 
            Cameroonians have shown that united we thrive:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li><strong>Rebecca Enonchong</strong>, recognized globally for tech innovation.</li>
            <li><strong>Arthur Zang</strong>, inventor of the CardioPad, celebrated internationally.</li>
            <li><strong>Charlotte Dipanda</strong>, <strong>Stanley Enow</strong>, <strong>Richard Bona</strong>, and <strong>Manu Dibango</strong>, whose music transcends borders.</li>
            <li>Entrepreneurs like <strong>Kate Fotso</strong> and <strong>Baba Danpullo</strong>, who build economic bridges across regions.</li>
            <li>Politicians and statesmen such as <strong>John Ngu Foncha</strong>, <strong>Ahmadou Ahidjo</strong>, <strong>Paul Biya</strong>, <strong>Simon Achidi Achu</strong>, whose leadership spanned regions, languages, and cultural backgrounds.</li>
          </ul>
          <p>They represent what is possible when Cameroonians rise above colonial narratives.</p>
        </Section>

        <Section title="The Pain of Division: A Colonial Legacy" icon="💔">
          <p className="mb-4">
            Today's conflict, driven by the imported and imposed narrative of "Anglophone" versus "Francophone," has cost 
            thousands of innocent lives and devastated families across our country. This division serves the agenda of those 
            who once oppressed and exploited us, weakening our collective power.
          </p>
          <p className="mb-4">
            But remember: We were never born divided.<br />
            We were made to believe we are.
          </p>
          <p>
            We must reject these colonial labels. We must reject any narrative that divides brother from brother, 
            sister from sister.
          </p>
        </Section>

        <Section title="Our Path to Healing and Unity" icon="🕊️">
          <p className="mb-4">
            Cameroon is Africa in miniature, a rich mosaic of cultural diversity and beauty that shines brightest when united. 
            Let us choose dialogue and mutual understanding over separation. Let us remind ourselves and our children that our 
            ancestors did not sacrifice their lives for division but for unity and freedom.
          </p>
          <p className="mb-4">
            Let us weep together.<br />
            Let us dance together.<br />
            Let us forgive each other, and rise together.
          </p>
          <p>
            Let us remember that those calling for separation are not only against the state—they are against their 
            <strong> own brothers</strong>.
          </p>
        </Section>

        <Section title="Embracing Our Shared Future" icon="💚">
          <p className="mb-4">
            Our future generations depend on the choices we make today. Let us forgive each other, heal together, rebuild 
            together, and rise together as one. Let our unity be our legacy, an enduring testament to resilience, strength, 
            and love.
          </p>
          <p>
            For eternity, our children and their children will meet, marry, and share meals together. We must ensure they 
            inherit a Cameroon stronger, more united, and more compassionate than ever before.
          </p>
        </Section>

        <Section title="One Cameroon, Indivisible" icon="🏛️">
          <p className="mb-4">
            We must never again allow artificial colonial boundaries and foreign languages to define our identities. 
            Let us proudly reclaim who we truly are—sons and daughters of a shared soil, guardians of a common destiny.
          </p>
          <p className="mb-4">
            Let our story, "One and Indivisible Cameroon," serve as a living reminder that our strength lies in our unity, 
            our pride in our shared history, and our future in our collective dreams.
          </p>
          <p>
            Together, let us proudly proclaim:
          </p>
        </Section>

        <Card className="p-12 text-center bg-gradient-heritage shadow-lux-celebration border-2 border-amber-400/50">
          <h2 className="text-5xl font-bold text-amber-100 mb-6 shadow-ancestral-glow">
            We are Cameroon. We are One. We are Indivisible.
          </h2>
          <Separator className="my-8 bg-amber-400/30" />
          <p className="text-xl text-amber-200 italic">
            A sacred portal of remembrance, identity, healing, and unity
          </p>
        </Card>
      </div>
    </div>
  );
};