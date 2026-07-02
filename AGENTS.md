<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Wallie Development Guide

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- lucide-react

## UI

- Gebruik altijd bestaande shadcn/ui componenten.
- Gebruik het bestaande customized theme.
- Maak nooit eigen Button/Card/Input componenten.
- Gebruik design tokens uit globals.css.
- Responsive first.
- Minimalistisch, veel witruimte.
- Gebruik alleen lucide-react iconen.
- Lege staten moeten een duidelijke vervolgstap hebben met bestaande shadcn/ui Buttons of Cards.
- Toastmeldingen lopen via `components/ui/sonner.tsx` en niet direct via de Sonner `Toaster`.
- Spaarpotten staan op mobiel in een 2-koloms grid; houd kaarten compact en scanbaar op smalle schermen.
- Dashboard (homepage) is een samenvatting, geen kopie van de losse pagina's: gebruik één uitgelichte hero-card voor het belangrijkste getal (bv. `DashboardHero`) en compacte previews per sectie (`preview`/`compact` props, zoals in `SavingsJarGrid`, `ActivitySection`, `SavingsRulesSection`, `AnalyticsSection`) met een "Alles bekijken"-link naar de volledige pagina. Dupliceer nooit een volledige sectie (sorteer-opties, alle items, alle grafieken) op het dashboard.
- Toon een getal (zoals "Nog te verdelen" of het totaalsaldo) maar op één plek per pagina; de sidebar-footer is de uitzondering omdat dat persistente navigatie-chrome is, geen paginacontent.

## Code Style

- Kleine componenten.
- Server Components waar mogelijk.
- Client Components alleen indien nodig.
- Geen inline styles.
- Geen CSS modules.
- Tailwind utilities gebruiken.

## Structuur

/components
/features
/lib
/hooks
/types

## Database

Later Supabase.

## Functionaliteit

Wallie is een digitale spaarpot-app.

Gebruikers kunnen:
- spaarpotten maken
- geld verdelen
- spaardoelen instellen
- automatisch sparen instellen
- totaal spaargeld per rekening of als totaal invullen
- geld tussen potten en Nog te verdelen verplaatsen

Nog geen bankkoppelingen.

## Productregels

- Gebruik in de UI de term "Automatisch sparen" of "automatisering", niet "spaarregels".
- Rekeningen zijn de bron van het totale spaargeld.
- Spaarpotten zijn toewijzingen binnen dat totale spaargeld.
- "Nog te verdelen" is altijd afgeleid: totaal op rekeningen min totaal in potten.
- Sta niet toe dat potten samen meer saldo hebben dan het totaal op rekeningen.
- Nieuwe gebruikers moeten snel naar Rekeningen en Nieuwe spaarpot kunnen.
- Activiteit is klikbaar en toont detailinformatie in een shadcn/ui Dialog.
