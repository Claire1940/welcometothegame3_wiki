"use client";

import { useState, Suspense, lazy } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Compass,
  ExternalLink,
  Flag,
  Globe,
  Key,
  Lightbulb,
  ListChecks,
  Lock,
  Newspaper,
  Puzzle,
  Route,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Maps a danger / spoiler level to theme-colored badge classes (no hardcoded colors).
function intensityClasses(level: string): string {
  const l = (level || "").toLowerCase();
  if (l === "extreme" || l === "critical" || l === "major")
    return "bg-[hsl(var(--nav-theme)/0.25)] border-[hsl(var(--nav-theme)/0.6)]";
  if (l === "high" || l === "moderate")
    return "bg-[hsl(var(--nav-theme)/0.18)] border-[hsl(var(--nav-theme)/0.45)]";
  if (l === "medium")
    return "bg-[hsl(var(--nav-theme)/0.12)] border-[hsl(var(--nav-theme)/0.35)]";
  return "bg-[hsl(var(--nav-theme)/0.07)] border-[hsl(var(--nav-theme)/0.25)]"; // low / minor / planning / default
}

// Shared module header (eyebrow badge + plain-text title + lead paragraph).
function ModuleHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <div className="text-center mb-8 md:mb-12 scroll-reveal">
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4 md:mb-5 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
        <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
        <span className="text-xs md:text-sm font-semibold uppercase tracking-wide">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
        {title}
      </h2>
      <p className="mx-auto max-w-3xl text-base md:text-lg text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}

// Bordered context paragraph used below the header for the module intro.
function IntroBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="scroll-reveal mb-8 md:mb-10 p-4 md:p-6 bg-white/[0.03] border border-border rounded-xl">
      <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
        {children}
      </p>
    </div>
  );
}

// Small reusable chip list used inside module cards.
function ChipList({
  items,
  icon: Icon,
}: {
  items: string[];
  icon: LucideIcon;
}) {
  return (
    <ul className="space-y-1.5">
      {items.map((item: string, i: number) => (
        <li key={item} className="flex items-start gap-2">
          <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
          <span className="text-sm text-muted-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  // Kept in the interface for compatibility with the server page wrapper; internal links
  // are intentionally not rendered on the homepage anymore.
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.welcometothegame3.wiki";

  // Accordion state for the puzzle and secret modules.
  const [puzzleExpanded, setPuzzleExpanded] = useState<number | null>(null);
  const [secretExpanded, setSecretExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Welcome to the Game 3 Wiki",
        description:
          "Complete Welcome to the Game 3 Wiki covering release details, beginner tips, deep web puzzles, threats, endings, secrets, and Steam updates for Reflect Studios' deep web horror puzzle game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1280,
          height: 720,
          caption: "Welcome to the Game 3 - Deep Web Horror Puzzle",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Welcome to the Game 3 Wiki",
        alternateName: "Welcome to the Game 3",
        url: siteUrl,
        description:
          "Welcome to the Game 3 Wiki resource hub for release details, beginner tips, deep web puzzles, threats, endings, and secrets",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1280,
          height: 720,
          caption: "Welcome to the Game 3 Wiki - Deep Web Horror Puzzle",
        },
        sameAs: [
          "https://store.steampowered.com/app/3869850/Welcome_to_the_Game_III/",
          "https://www.youtube.com/@ReflectStudios",
          "https://www.reddit.com/r/ReflectStudiosGames/",
          "https://x.com/thewebpro",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Welcome to the Game 3",
        gamePlatform: ["PC", "Steam"],
        applicationCategory: "Game",
        genre: ["Horror", "Puzzle", "Survival", "Mystery"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://store.steampowered.com/app/3869850/Welcome_to_the_Game_III/",
        },
      },
      {
        "@type": "VideoObject",
        name: "Welcome to the Game III - Official Trailer",
        description:
          "Official Welcome to the Game III trailer from Reflect Studios, showcasing the deep web horror investigation gameplay.",
        uploadDate: "2026-06-01",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/a5imsLs3Rko",
        url: "https://www.youtube.com/watch?v=a5imsLs3Rko",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://store.steampowered.com/app/3869850/Welcome_to_the_Game_III/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="a5imsLs3Rko"
              title="Welcome to the Game III - Official Trailer"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Investigation Hub Cards */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionIds = [
                "beginner-guide",
                "walkthrough",
                "puzzles",
                "threats-and-survival",
                "deep-web-sites",
                "endings",
                "secrets",
                "updates-patch-notes",
              ];
              const sectionId = sectionIds[index];

              return (
                <button
                  key={card.title}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                bg-[hsl(var(--nav-theme)/0.1)]
                                flex items-center justify-center
                                group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* ============================================================ */}
      {/* Module 1: Beginner Guide */}
      {/* ============================================================ */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.beginnerGuide.eyebrow}
            title={t.modules.beginnerGuide.title}
            subtitle={t.modules.beginnerGuide.subtitle}
            icon={BookOpen}
          />
          <IntroBlock>{t.modules.beginnerGuide.intro}</IntroBlock>

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={step.title}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                  <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                    <h3 className="text-lg md:text-xl font-bold">{step.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${intensityClasses(
                        step.priority,
                      )}`}
                    >
                      {step.priority}
                    </span>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  {step.actions?.length > 0 && (
                    <div className="mb-3">
                      <ChipList items={step.actions} icon={Check} />
                    </div>
                  )}
                  {step.commonMistake && (
                    <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                      <AlertTriangle className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Common mistake:{" "}
                        </span>
                        {step.commonMistake}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Lightbulb className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.beginnerGuide.quickTips.map((tip: string, index: number) => (
                <li key={tip} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* ============================================================ */}
      {/* Module 2: Walkthrough */}
      {/* ============================================================ */}
      <section id="walkthrough" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.walkthrough.eyebrow}
            title={t.modules.walkthrough.title}
            subtitle={t.modules.walkthrough.subtitle}
            icon={Route}
          />
          <IntroBlock>{t.modules.walkthrough.intro}</IntroBlock>

          <div className="scroll-reveal space-y-4">
            {t.modules.walkthrough.stages.map((stage: any, index: number) => (
              <div
                key={stage.title}
                className="p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.2)] border border-[hsl(var(--nav-theme)/0.5)]">
                    <Route className="w-4 h-4 md:w-5 md:h-5 text-[hsl(var(--nav-theme-light))]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs md:text-sm font-semibold text-[hsl(var(--nav-theme-light))]">
                      Stage {index + 1}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold">{stage.title}</h3>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {stage.preparation && (
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Preparation: </span>
                        {stage.preparation}
                      </p>
                    </div>
                  )}
                  {stage.requiredActions?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                        Required Actions
                      </p>
                      <ChipList items={stage.requiredActions} icon={Check} />
                    </div>
                  )}
                  {stage.majorDangers?.length > 0 && (
                    <div className="p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />
                        Major Dangers
                      </p>
                      <ChipList items={stage.majorDangers} icon={AlertTriangle} />
                    </div>
                  )}
                  {stage.recovery && (
                    <div className="flex items-start gap-2">
                      <Compass className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Recovery: </span>
                        {stage.recovery}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Module 3: Puzzle Guide (accordion) */}
      {/* ============================================================ */}
      <section id="puzzles" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.puzzles.eyebrow}
            title={t.modules.puzzles.title}
            subtitle={t.modules.puzzles.subtitle}
            icon={Puzzle}
          />
          <IntroBlock>{t.modules.puzzles.intro}</IntroBlock>

          <div className="scroll-reveal space-y-3">
            {t.modules.puzzles.items.map((item: any, index: number) => {
              const isOpen = puzzleExpanded === index;
              return (
                <div
                  key={item.title}
                  className="border border-border rounded-xl overflow-hidden bg-white/[0.02]"
                >
                  <button
                    onClick={() => setPuzzleExpanded(isOpen ? null : index)}
                    className="w-full flex items-start justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Puzzle className="w-5 h-5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform text-muted-foreground ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 md:px-5 pb-5 space-y-3 border-t border-border">
                      <div className="flex items-start gap-2 pt-3">
                        <Lightbulb className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Hint: </span>
                          {item.hint}
                        </p>
                      </div>
                      {item.fullSolution?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                            Full Solution
                          </p>
                          <ol className="space-y-1.5">
                            {item.fullSolution.map((s: string, si: number) => (
                              <li key={s} className="flex items-start gap-2">
                                <span className="text-xs font-bold text-[hsl(var(--nav-theme-light))] mt-0.5">
                                  {si + 1}.
                                </span>
                                <span className="text-sm text-muted-foreground">{s}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {item.commonError && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                          <AlertTriangle className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Common error: </span>
                            {item.commonError}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Module 4: Threats and Survival */}
      {/* ============================================================ */}
      <section
        id="threats-and-survival"
        className="scroll-mt-24 px-4 py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.threatsAndSurvival.eyebrow}
            title={t.modules.threatsAndSurvival.title}
            subtitle={t.modules.threatsAndSurvival.subtitle}
            icon={ShieldAlert}
          />
          <IntroBlock>{t.modules.threatsAndSurvival.intro}</IntroBlock>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {t.modules.threatsAndSurvival.threats.map((threat: any, index: number) => (
              <div
                key={threat.name}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    {threat.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${intensityClasses(
                      threat.dangerLevel,
                    )}`}
                  >
                    {threat.dangerLevel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{threat.behavior}</p>

                {threat.warningSigns?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                      Warning Signs
                    </p>
                    <ChipList items={threat.warningSigns} icon={AlertTriangle} />
                  </div>
                )}
                {threat.immediateResponse?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                      Immediate Response
                    </p>
                    <ChipList items={threat.immediateResponse} icon={Check} />
                  </div>
                )}
                {threat.prevention?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                      Prevention
                    </p>
                    <ChipList items={threat.prevention} icon={ShieldAlert} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Emergency Checklist */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <ListChecks className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Emergency Response Checklist</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.threatsAndSurvival.emergencyChecklist.map(
                (item: string, index: number) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Module 5: Deep Web Sites */}
      {/* ============================================================ */}
      <section id="deep-web-sites" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.deepWebSites.eyebrow}
            title={t.modules.deepWebSites.title}
            subtitle={t.modules.deepWebSites.subtitle}
            icon={Globe}
          />
          <IntroBlock>{t.modules.deepWebSites.intro}</IntroBlock>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.deepWebSites.sites.map((site: any, index: number) => (
              <div
                key={site.name}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    {site.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                    {site.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${intensityClasses(
                      site.dangerLevel,
                    )}`}
                  >
                    {site.dangerLevel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{site.description}</p>

                {site.possibleClues?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                      Possible Clues
                    </p>
                    <ChipList items={site.possibleClues} icon={Search} />
                  </div>
                )}
                {site.accessRequirement && (
                  <div className="flex items-start gap-2 mb-3">
                    <Lock className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Access: </span>
                      {site.accessRequirement}
                    </p>
                  </div>
                )}
                {site.warning && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                    <AlertTriangle className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{site.warning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* ============================================================ */}
      {/* Module 6: Endings */}
      {/* ============================================================ */}
      <section id="endings" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.endings.eyebrow}
            title={t.modules.endings.title}
            subtitle={t.modules.endings.subtitle}
            icon={Flag}
          />
          <IntroBlock>{t.modules.endings.intro}</IntroBlock>

          {/* Spoiler notice */}
          <div className="scroll-reveal mb-6 flex items-start gap-2 p-4 rounded-xl bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.3)]">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Spoiler warning: </span>
              This section reveals the major outcome routes of Welcome to the Game 3.
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.endings.endings.map((ending: any, index: number) => (
              <div
                key={ending.name}
                className="p-5 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Flag className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    {ending.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${intensityClasses(
                      ending.spoilerLevel,
                    )}`}
                  >
                    {ending.spoilerLevel}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{ending.description}</p>

                {ending.requirements?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                      Requirements
                    </p>
                    <ChipList items={ending.requirements} icon={ListChecks} />
                  </div>
                )}
                {ending.criticalChoice && (
                  <div className="flex items-start gap-2 mb-3">
                    <Compass className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Critical choice: </span>
                      {ending.criticalChoice}
                    </p>
                  </div>
                )}
                {ending.missableCondition && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                    <Clock className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Missable: </span>
                      {ending.missableCondition}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Module 7: Secrets and Easter Eggs (accordion) */}
      {/* ============================================================ */}
      <section id="secrets" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.secrets.eyebrow}
            title={t.modules.secrets.title}
            subtitle={t.modules.secrets.subtitle}
            icon={Key}
          />
          <IntroBlock>{t.modules.secrets.intro}</IntroBlock>

          <div className="scroll-reveal space-y-3">
            {t.modules.secrets.items.map((item: any, index: number) => {
              const isOpen = secretExpanded === index;
              return (
                <div
                  key={item.title}
                  className="border border-border rounded-xl overflow-hidden bg-white/[0.02]"
                >
                  <button
                    onClick={() => setSecretExpanded(isOpen ? null : index)}
                    className="w-full flex items-start justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Key className="w-5 h-5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.hint}</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform text-muted-foreground ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 md:px-5 pb-5 space-y-3 border-t border-border">
                      <div className="flex items-start gap-2 pt-3">
                        <Search className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Solution: </span>
                          {item.solution}
                        </p>
                      </div>
                      {item.confirmation && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Confirmation: </span>
                            {item.confirmation}
                          </p>
                        </div>
                      )}
                      {item.reward && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                          <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Reward: </span>
                            {item.reward}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Module 8: Updates and Patch Notes (timeline) */}
      {/* ============================================================ */}
      <section
        id="updates-patch-notes"
        className="scroll-mt-24 px-4 py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.updatesAndPatchNotes.eyebrow}
            title={t.modules.updatesAndPatchNotes.title}
            subtitle={t.modules.updatesAndPatchNotes.subtitle}
            icon={Newspaper}
          />
          <IntroBlock>{t.modules.updatesAndPatchNotes.intro}</IntroBlock>

          <div className="scroll-reveal relative pl-6 md:pl-8 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6">
            {t.modules.updatesAndPatchNotes.entries.map(
              (entry: any, index: number) => (
                <div key={entry.title} className="relative">
                  <div className="absolute -left-[1.65rem] md:-left-[2.15rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                  <div className="p-4 md:p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.date}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${intensityClasses(
                          entry.status,
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-1">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{entry.description}</p>
                    {entry.affectedSystems?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-1.5">
                          Affected Systems
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.affectedSystems.map((s: string) => (
                            <span
                              key={s}
                              className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.25)] text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.guideImpact && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.07)] border border-[hsl(var(--nav-theme)/0.25)]">
                        <Lightbulb className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Guide impact: </span>
                          {entry.guideImpact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.reflectstudios.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://x.com/thewebpro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://steamcommunity.com/app/3869850"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/3869850/Welcome_to_the_Game_III/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
