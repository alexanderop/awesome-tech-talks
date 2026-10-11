---
title: "What is Codemode"
description: "Armin Ronacher explains why Pi added Codemode after he argued for bash over tools: it lets the agent script tool calls in a harness-side JavaScript sandbox, and it makes MCP usable."
url: https://lucumr.pocoo.org/2026/10/6/codemode/
authors:
  - Armin Ronacher
site: "Armin Ronacher's Thoughts and Writings"
siteUrl: https://lucumr.pocoo.org
publishedAt: "2026-10-06"
addedAt: "2026-10-10"
readingMin: 13
level: advanced
tags:
  - ai
  - agentic-coding
  - mcp
  - agent-harness
resources:
  - label: "Cloudflare: Code Mode: the better way to use MCP"
    url: https://blog.cloudflare.com/code-mode/
  - label: "Armin Ronacher: Tools: Code Is All You Need"
    url: https://lucumr.pocoo.org/2025/7/3/tools/
  - label: "Armin Ronacher: Your MCP Doesn't Need 30 Tools: It Needs Code"
    url: https://lucumr.pocoo.org/2025/8/18/code-mcps/
  - label: "Armin Ronacher: Better Models: Worse Tools"
    url: https://lucumr.pocoo.org/2026/7/4/better-models-worse-tools/
  - label: Gondolin sandbox
    url: https://earendil-works.github.io/gondolin/
---

## Summary

A year ago, Armin Ronacher argued that agents need code and CLIs more than custom tools or MCP servers. Pi 1.0 now supports MCP through Codemode. This post explains why that doesn't contradict his earlier position.

Bash composes programs well, but it can only run programs. Some capabilities are native to the harness, like reading images, spawning subagents and calling other models. They run on the trusted "brain" side, not in the sandboxed execution environment (the "hands") where bash runs. Codemode lets the model write JavaScript that orchestrates these harness-side tools. In Pi it runs in QuickJS inside WASM, with no network, no filesystem and no timers. The only way out is calling more tools.

He shows real Pi sessions where the agent uses Codemode for three things. It generates images, sorts GitHub issues by sentiment with a classifier model, and drives a game engine in a 30-step debugging loop. Most MCP servers aren't built for this yet.

## Key takeaways

- **Bash can't reach the harness.** Viewing images, running subagents and calling other models happen in the trusted harness, not in the sandbox where bash runs.
- **Codemode composes tool calls without filling the context.** The agent writes JavaScript that calls tools, runs them concurrently with `Promise.all` and gets structured output back. Only the result returns to the model.
- **Probe first, then script.** Agents look at 5–10 items from a tool to learn its shape, then write a Codemode script for the rest.
- **State can stay outside the context.** `store()` saves results in the session transcript, so a later Codemode call can load them.
- **Hide MCP tools behind Codemode.** Pi gives the model none of the MCP tool definitions. The agent searches for tools from inside Codemode, so they cost no context until it needs them.
- **Codemode inside Codemode is bad.** MCP servers like Cloudflare's run their own code mode, so the agent ends up passing JavaScript inside JavaScript. That means double JSON escaping, and the inner code can't call the outer tools.
- **What MCP servers should change:** return structured content through `outputSchema`, give consistent result shapes regardless of batch size, support large binary data, and allow tool search that works across several servers.
- **Open problems.** Durability needs ideas from durable workflow engines, Starlark may be a better language than JavaScript because it is deterministic, and smaller models still struggle with the pattern.

## Notable quotes

> Bash has one fundamental limitation which is that it can only compose programs that run.

> The MCP ecosystem from my perspective picked up on exactly what we pointed out a year ago works: code.
