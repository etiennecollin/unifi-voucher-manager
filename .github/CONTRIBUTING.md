# 🤝 Contributing

Thank you for considering contributing to this project!
I welcome pull requests, bug reports, feature requests, and documentation improvements.
This guide explains my workflow, coding standards, and how to get started.

<!-- vim-markdown-toc GFM -->

- [🏗 Architecture](#-architecture)
- [📦 Setting Up Locally](#-setting-up-locally)
- [📋 General Workflow](#-general-workflow)
- [🛠 Coding Standards](#-coding-standards)
  - [Language & Frameworks](#language--frameworks)
  - [Responsiveness & Accessibility](#responsiveness--accessibility)
  - [Error Handling & UX](#error-handling--ux)
  - [Code Formatting](#code-formatting)
- [✅ Pull Request Checklist](#-pull-request-checklist)
- [💬 Questions?](#-questions)

<!-- vim-markdown-toc -->

## 🏗 Architecture

This application is built with a clear separation of concerns:

1. **Frontend**: A [Next.js](https://github.com/vercel/next.js/) application ([TypeScript](https://github.com/microsoft/TypeScript) + [Tailwind](https://github.com/tailwindlabs/tailwindcss) CSS) that provides a responsive, touch-friendly UI.
2. **Backend**: A [Rust](https://github.com/rust-lang/rust) service powered by [Axum](https://github.com/tokio-rs/axum) that exposes a JSON API.
3. **UniFi Controller**: The Axum backend securely communicates with your UniFi controller’s API, isolating API keys from the user-facing frontend.

```text
                                    {                          DOCKER                         }
[User Browser] <––– HTTP/HTTPS –––> [Next.js Frontend] <––– HTTP/HTTPS –––> [Axum Rust Backend] <––– HTTPS –––> [UniFi Controller]
```

- The frontend only knows about the backend API endpoint.
- All UniFi credentials and site IDs are stored on the backend.
- This isolation limits the scope of user actions and protects sensitive API keys.

## 📦 Setting Up Locally

Follow the instructions in the readme for [Quick Start - Without Docker](https://github.com/etiennecollin/unifi-voucher-manager#without-docker).

## 📋 General Workflow

1. **Fork** the repository and clone your fork.
2. **Create a branch** for your change:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make your changes** following the guidelines below.
4. **Run tests** and ensure everything passes.
5. **Format your code** with Prettier.
6. **Commit** your changes with a descriptive message.
7. **Push** your branch and **open a Pull Request** (PR).

## 🛠 Coding Standards

### Language & Frameworks

- **All code must be written in TypeScript**.
- For UI styling, follow **existing Tailwind CSS semantic utility patterns** used in the project.

### Responsiveness & Accessibility

- Ensure all components are **touch-friendly** and **responsive**.
- Test on multiple screen sizes before submitting.

### Error Handling & UX

- Implement **clear error handling** for all asynchronous operations.
- Provide **user feedback** for loading states, errors, and successful actions.

### Code Formatting

- Use [Prettier](https://github.com/prettier/prettier) to format your code.
- Do not manually override Prettier formatting in committed files.

## ✅ Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code is TypeScript and compiles without errors.
- [ ] Tailwind CSS utilities follow project conventions.
- [ ] Components are responsive and touch-friendly.
- [ ] Proper error handling and user feedback are implemented.
- [ ] Code is formatted with Prettier.

## 💬 Questions?

If you’re unsure about anything, feel free to open a **Draft PR** or start a **Discussion**.
I'm happy to guide you through the contribution process.
