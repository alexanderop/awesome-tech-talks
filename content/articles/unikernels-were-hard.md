---
title: "unikernels were hard. key word: were."
description: "Geoffrey Huntley argues that AI removed the friction that made unikernels impractical: the OS is design debt, missing libraries can be ported in a loop, and for security they beat hardening Linux."
url: https://ghuntley.com/unikernels/
authors:
  - Geoffrey Huntley
site: Geoffrey Huntley
siteUrl: https://ghuntley.com
publishedAt: "2026-10-10"
addedAt: "2026-10-10"
readingMin: 13
level: advanced
tags:
  - unikernels
  - security
  - agentic-coding
  - ocaml
  - programming-languages
resources:
  - label: "Unikernels in 2026: Justin Cormack in conversation with Geoffrey Huntley (video)"
    url: https://www.youtube.com/watch?v=DOjHBwdfBpA
  - label: "Unikernels in 2026 part 1: Geoffrey Huntley (edited transcript)"
    url: https://buttondown.com/justincormack/archive/unikernels-in-2026-part-1-geoffrey-huntley/
  - label: Welcome to MirageOS
    url: https://mirage.io/
  - label: "porting software has been trivial for a while now. here's how you do it."
    url: https://ghuntley.com/porting/
  - label: "the world hasn't figured out yet that you can literally just fix everything with a Nix overlay"
    url: https://ghuntley.com/nix/
  - label: "don't waste your back pressure"
    url: https://ghuntley.com/pressure/
  - label: "i ran Claude in a loop for three months, and it created a genz programming language called cursed"
    url: https://ghuntley.com/cursed/
  - label: "TigerBeetle: Three Clocks are Better than One"
    url: https://tigerbeetle.com/blog/2021-08-30-three-clocks-are-better-than-one/
  - label: The seL4 Microkernel
    url: https://sel4.systems/
---

## Summary

Justin Cormack worked on MirageOS. He is running a series of conversations about why unikernels are coming back, and Geoffrey Huntley was his first guest. This post is Huntley's write-up of that conversation.

A unikernel makes the application the operating system: there is no userland, so DNS, HTTP and storage have to be libraries inside your app. That missing ecosystem made unikernels hard to use. Huntley argues the barrier is gone, because agents can port a missing library from another language in a loop, using the original as a test oracle. Cormack had an agent rewrite `mkfs.xfs` in Rust with byte-identical output in a few hours.

The security argument is that a multi-user OS is design debt from the days of human operators. A compromised app on Linux hands the attacker a shell, and models already know what to do with a shell. A unikernel has no shell or interpreter to hand over. Huntley backs the claim with Spaceleans, a port of Microsoft Orleans to an OCaml unikernel, built in a week and never released. The post also covers Nix, which languages work well for agents, and his AI-built language Cursed.

## Key takeaways

- **The OS is design debt.** Multi-user operating systems exist because people once sat in front of them. For a single application, that layer is mostly attack surface.
- **No shell means no next hop.** A typical remote-code-execution bug gives the attacker a shell, and models know how to exploit one. A unikernel turns that into a targeted attack that needs your source code. Cormack pushes back that "attack surface" is fuzzy and memory-safety gadgets still exist.
- **Port missing libraries with an oracle.** Have an agent translate the Go Stripe client to OCaml, or rebuild `mkfs.xfs` in Rust. Diffing its output against the original tool turns porting into a test loop.
- **Use S3 for storage.** S3 serves as primary storage, with a local NVMe cache for hot data, following the turbopuffer approach. That covers the storage gap unikernels always had.
- **Fix upstream with Nix overlays.** NixOS machine tests run whole fleets in a test. Overlays patch broken dependencies instead of waiting on a maintainer.
- **Fast compiles help agents.** Each wrong guess costs a compile, so slow Rust builds mean fewer tries per minute. Huntley praises OCaml's `.mli` interface files as compact context for agents. He sees dependent types as the next step, because the more the type system checks, the faster the agent learns it was wrong.
- **New languages are cheap now.** Cursed cost about US$6,000 per attempt. Give the model the grammar and lexical structure in its context window and it can write a language that isn't in its training data.
- **For security: seL4 or unikernels.** Use seL4 if you build satellites. Everyone else should consider unikernels instead of hardening Linux with weekly kernel patches.

## Notable quotes

> These hard concepts are now in the model weights. All you've got to do is prompt for them and, cognitively, get rid of the dogma that they're hard.

> Someone pops the userland application and gets a shell. That shell is a VIP butler service for exfiltration.
