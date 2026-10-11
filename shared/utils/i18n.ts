export const t = {
  nav: {
    home: "Home",
    talks: "Talks",
    articles: "Articles",
    feed: "Feed",
    channels: "Channels",
    people: "People",
    tags: "Tags",
    about: "About",
    goBack: "Go back",
    backToTop: "Back to top",
    search: "Search",
  },
  talks: {
    newThisWeek: "New this week",
    allTalks: "All talks",
    filterTag: "Tag",
    filterLevel: "Level",
    filterConference: "Conference",
    filterSpeaker: "Speaker",
    filterChannel: "Channel",
    filterSearch: "Search talks",
    filterSearchPlaceholder: "Title, speaker, conference…",
    moreFilters: "More filters",
    filteredBySpeaker: "Speaker: {{name}}",
    filteredByChannel: "Channel: {{name}}",
    clear: "clear",
    filterAny: "All",
    clearFilters: "Clear filters",
    noResults: "No talks match these filters.",
    resultsCount: "{{count}} of {{total}} talks",
    minutes: "{{count}} min",
    watchOnYouTube: "Watch on YouTube",
    talkCount: "{{count}} talks",
    talkCountOne: "1 talk",
    viewTalks: "View talks",
    youtubeLink: "YouTube ↗",
    followed: "followed",
    noTalksYet: "no talks yet",
    resources: "Resources",
    playVideo: "Play video: {{title}}",
    thumbnailAlt: "Thumbnail of the talk {{title}}",
    addedOn: "Added",
  },
  tags: {
    moreTags: "{{count}} more tags",
  },
  levels: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
  articles: {
    allArticles: "All articles",
    kicker: "Article",
    filterTag: "Tag",
    filterLevel: "Level",
    filterAuthor: "Author",
    filteredByAuthor: "Author: {{name}}",
    clear: "clear",
    filterAny: "All",
    clearFilters: "Clear filters",
    noResults: "No articles match these filters.",
    resultsCount: "{{count}} of {{total}} articles",
    readingTime: "{{count}} min read",
    readOriginal: "Read the original on {{site}} ↗",
    articleCount: "{{count}} articles",
    articleCountOne: "1 article",
    viewArticles: "View articles",
    resources: "Resources",
  },
  feed: {
    updated: "Updated",
    today: "Today",
    yesterday: "Yesterday",
    undated: "Undated",
    filterSource: "Source",
    filterAny: "All",
    clearFilters: "Clear filters",
    resultsCount: "{{count}} of {{total}} posts",
    noResults: "No posts match this filter.",
    empty: "No posts could be loaded right now. The feed refreshes with the next daily update.",
    sources: "Sources",
    sourcesFailed: "{{count}} failed",
    feedLink: "RSS ↗",
    failedMarker: "Feed could not be loaded",
  },
  home: {
    socialLinks: "Social Links",
    featuredTalks: "Featured talks",
    latestTalks: "Latest talks",
    latestArticles: "Latest articles",
    fromTheFeed: "From the feed",
    fullFeed: "Full feed",
    allTalks: "All talks",
    allArticles: "All articles",
    browseByTag: "Browse by tag",
    statTalks: "{{count}} talks",
    statTalk: "1 talk",
    statChannels: "{{count}} channels",
    statChannel: "1 channel",
    statArticles: "{{count}} articles",
    statArticle: "1 article",
    statPeople: "{{count}} people",
    statPerson: "1 person",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  socials: {
    emailTo: "Send an email to {{site}}",
    onPlatform: "{{site}} on {{platform}}",
  },
  search: {
    oneResultFound: "{{count}} result for “{{query}}”",
    manyResultsFound: "{{count}} results for “{{query}}”",
  },
  pages: {
    tagsTitle: "Tags",
    tagsDesc: "Every topic tag used on talks and articles. Pick one to see the matching talks or articles.",

    talksTitle: "Talks",
    talksDesc: "Conference talks worth your time, summarized and tagged.",

    channelsTitle: "Channels",
    channelsDesc:
      "The YouTube channels this site follows for new conference talks. New talks are picked from these channels.",

    articlesTitle: "Articles",
    articlesDesc: "Blog posts and essays worth reading, summarized and tagged.",

    peopleTitle: "People",
    peopleDesc:
      "Everyone who gave a talk or wrote an article on this site, plus speakers we follow for new talks.",

    feedTitle: "Feed",
    feedDesc: "Latest posts from blogs I read. Collected automatically, not curated.",

    aboutTitle: "About",

    searchTitle: "Search",
    searchDesc: "Search talks and articles ...",
  },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    noResults: "No results found",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
  },
  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
};

export function tplStr(template: string, params: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? "");
}

/** "github" -> "Github", for use in social link titles. */
export function platformLabel(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
