---
title: "The state of the tech industry in 2026"
description: "Gergely Orosz reports from inside OpenAI, Anthropic, Cursor, Linear, Ramp and Uber: what AI changed in software engineering, what stayed the same, what broke, and what comes next."
youtubeId: Ru99FGJ_yuE
speakers:
  - Gergely Orosz
conference: LDX3 New York 2026
channel: The Pragmatic Engineer
channelId: UCPbwhExawYrn9xxI21TFfyw
publishedAt: "2026-10-06"
addedAt: "2026-10-10"
durationMin: 30
level: beginner
tags:
  - ai
  - agentic-coding
  - engineering-leadership
  - industry-trends
resources:
  - label: "Inside OpenAI's agentic software factory"
    url: https://newsletter.pragmaticengineer.com/p/openai-software-factory
  - label: "How building software is changing at Anthropic, in 2026"
    url: https://newsletter.pragmaticengineer.com/p/inside-anthropic
  - label: "When AI writes almost all code, what happens to software engineering?"
    url: https://newsletter.pragmaticengineer.com/p/when-ai-writes-almost-all-code-what
  - label: "The Pulse: a new trend of CPU shortages"
    url: https://blog.pragmaticengineer.com/the-pulse-a-new-trend-of-cpu-shortages/
---

## Summary

Gergely Orosz writes The Pragmatic Engineer. He gave this keynote at LDX3 New York in September 2026, after visiting OpenAI, Anthropic, Cursor, Ramp, Linear and Uber. He sorts what he saw into four groups: what changed, what didn't change, what broke, and what comes next.

A lot changed within twelve months. Engineers rarely write code by hand. Many run five to ten agents in parallel, and IDEs are giving way to agent interfaces. Large companies build their own coding harnesses. Linear now gets more tickets from agents than from humans, and migrations that used to take years now take months.

Some things stayed the same. The team is still the unit of work, complex work still needs planning, and test effort still matches code effort. Non-engineers still don't ship production code. Code review, software quality, infrastructure capacity, developer focus and engineering leadership are all under strain.

## Key takeaways

- **Parallel agents are normal now.** Engineers at Anthropic, Linear and Cockroach Labs run five to ten agent sessions at once, often in separate git worktrees.
- **IDEs are fading.** Cursor moved to an agent-first interface, and JetBrains is pivoting to Air. OpenAI chose not to fork VS Code for Codex. Cursor's team calls its IDE a legacy product that enterprises still need.
- **Every serious company builds its own harness.** Examples include Ramp, Stripe, Uber, Shopify and Block. The main reason is plugging in internal data sources. Work often starts in Slack by tagging an agent.
- **Migrations take months, not years.** OpenAI is about 90% through moving its API from Python to Rust in roughly five months. Airbnb moved from Enzyme to React Testing Library in six weeks, and Uber moved millions of lines from JUnit 4 to 5 in four months.
- **Teams and testing don't change.** Two-pizza teams still own software and on-call. Jarred Sumner (Bun) says AI writes almost all the code and the tests, and the time spent on tests compared to code is the same as before.
- **Code review is turning into theater.** Agent-only pull requests rose about 10x in 2026. People approve without reading, and Ramp now skips required reviews for non-critical code.
- **Infrastructure is short of more than GPUs.** Memory and CPUs are scarce too. Server orders went from 1–2 weeks to up to 6 months, and some cloud regions take no new CPU reservations.
- **Leaders: stay hands-on.** Build team-level agent systems, don't hand your learning to AI, and expect less people management for now. With AI covering the "how", Titus Winters argues that wisdom (knowing what to do) and charisma (convincing others) matter more.

## Chapters

- 00:00 Introduction
- 00:53 What changed: AI writes the code, parallel agents
- 02:00 IDEs fade, everyone builds a harness
- 05:01 Slack-driven work and agentic software factories
- 06:01 Migrations in months instead of years
- 08:00 Agent-created issues and pull requests overtake humans
- 09:00 AI cost under control, specializations disappear
- 11:02 One- and two-engineer projects, smaller teams
- 12:29 What's not changed: teams, planning, testing
- 15:01 Old patterns rediscovered for prompting
- 16:14 What broke: code volume and zombie code reviews
- 18:02 Quality, CPU shortages and lost focus
- 20:00 Why engineering leaders are leaving
- 22:53 What's next: cloud agents, AI infra, not reading code
- 27:01 How to thrive as an engineering leader
