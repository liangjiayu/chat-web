---
name: grilling
description: Grill the user relentlessly about a plan, design, or ambiguous request until the decisions are clear enough to act on. Use when the user wants to stress-test a plan before building, uses any 'grill' trigger phrases, or gives underspecified requirements where moving straight to implementation would likely create rework or lock in the wrong behavior.
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

When the user's request is ambiguous, use this skill to clarify the decisions that materially affect implementation, scope, behavior, or user experience. Do not invoke it for trivial missing details that can be resolved by inspecting the codebase or making a low-risk conventional assumption.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering.

If a _fact_ can be found by exploring the codebase, look it up rather than asking me. The _decisions_, though, are mine — put each one to me and wait for my answer.

Do not enact the plan until I confirm we have reached a shared understanding.
