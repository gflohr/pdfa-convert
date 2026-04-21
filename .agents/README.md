# Agent Skills

This directory contains structured **skills** used by agents to understand and
work with the `pdf-lab` project.

The goal of these skills is to provide **concise, task-oriented documentation**
that enables agents to:

* understand how to use the API, command-line interface, and REST API  
* generate correct commands and requests  
* avoid common pitfalls  
* follow project-specific conventions  

These skills are **not** a replacement for full documentation. Instead, they
act as a **focused, high-signal layer** optimized for automated reasoning and
execution.

## Structure of a Skill

Each skill follows a consistent structure:

* **Purpose / General Mode of Operation**  
  What the method, command or endpoint does.

* **Prerequisites**  
  Required setup, dependencies, or context.

* **Options/Parameters**  
  Relevant arguments, flags, or request fields.

* **Usage Examples**  
  Typical and recommended usage patterns.

* **Special Notes / Hints**  
  Edge cases, caveats, or important constraints.

* **Key Takeaways for Agents**  
  Actionable rules and guidance for correct usage.

## Scope

Skills in this directory should:

* focus on **how to use** the system  
* provide **practical, minimal examples**  
* highlight **important constraints and defaults**

Skills should **not**:

* duplicate large machine-generated artifacts (e.g. OpenAPI dumps)  
* document internal implementation details  
* replace full user-facing documentation  

## Design Goals

When adding or updating skills, aim for:

* **Clarity over completeness**  
* **Consistency across all skills**  
* **Actionable guidance for agents**  
* **Minimal but sufficient examples**  
