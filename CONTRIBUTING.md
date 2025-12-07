# Contributing Guidelines
Hey, **Frontend Engineer!** We’re thrilled to have you contribute to Open School Portal. We value **collaboration, clarity, and high-quality code**. Please review these guidelines to ensure a smooth contribution process.

**What we’re building:** Open School Portal digitizes school operations—attendance (including NFC check-ins), results, fee management, timetables, communications, and analytics—so every school can run on a private, customizable instance with real-time visibility for admins, teachers, students, and parents.

---

## Table of Contents
* [How to Contribute](#how-to-contribute)
* [Pull Request Process](#pull-request-process)
* [Commit Message Guidelines](#commit-message-guidelines)
* [Coding Standards](#coding-standards)
* [Issue Reporting](#issue-reporting)
* [Branching Model](#branching-model)
* [Testing](#testing)
* [Documentation](#documentation)
* [Additional Resources](#additional-resources)

---

## 1. How to Contribute
We welcome contributions in many forms:
* **Bug Reports:** Submit detailed issues if you encounter a bug (e.g., attendance sync errors, timetable conflicts, fee summaries not loading).
* **Feature Requests:** Suggest enhancements (like new attendance modes, better analytics, parent notifications).
* **Code Contributions:** Fix bugs or implement new features across the app (auth, dashboards, portals, UI).
* **Documentation:** Improve our docs, folder structure explanations, or onboarding guides.

:warning: For significant changes, please open an **issue** first to discuss your idea with the team.

---

## 2. Pull Request Process
* **Base Branch:** Always branch off `dev`. PRs must be raised against `dev`, never against `main`.
* **Small, Focused Changes:** Each PR should solve one issue or implement one feature (e.g., “Add timetable clash validation”).
* **Clear Title & Summary:** Use descriptive titles and explain your changes, rationale, and testing steps.
* **Follow Feedback:** Address review comments and update your PR accordingly.
* **CI/CD Compliance:** Ensure linting, formatting, and tests pass before submission.

:warning: Only the **project lead** can merge `dev` into `main` once stability is verified.

---

## 3. Commit Message Guidelines
We follow the **Conventional Commits** specification.

**Format:**
```
<type>(<scope>): <description>
```

**Types:**
* `feat` — New feature (e.g., timetable clash detection)
* `fix` — Bug fix (e.g., attendance status mismatch)
* `docs` — Documentation changes
* `style` — Code style changes (formatting, UI tweaks)
* `refactor` — Code refactoring without feature/bug changes
* `test` — Adding/updating tests
* `chore` — Build process, tools, dependencies

**Examples:**
```
feat(auth): implement OTP verification for onboarding
fix(attendance): correct NFC check-in status display
docs(readme): update contribution steps
```

---

## 4. Coding Standards
* **Consistency:** Follow the existing folder structure (`app/`, `components/`, `lib/`, etc.).
* **Linting & Formatting:** Code must pass **ESLint + Prettier** before committing.
* **Readability:** Write clean, maintainable, and well-documented code.
* **Security:** Prioritize **secure coding practices**, especially around authentication and role-based access.

---

## 5. Issue Reporting
When reporting an issue:
1. Provide a clear description (e.g., “Teacher attendance not updating after NFC tap”).
2. Include **steps to reproduce**.
3. Add screenshots or logs where relevant.
4. Suggest potential fixes if possible.

---

## 6. Branching Model
* **Feature Branches:** `feat/<short-description>`
* **Bug fix Branches:** `fix/<short-description>`
* **Hotfix Branches:** Reserved for **urgent fixes** directly on `main` (lead only).

**Examples:**
```
feat/improve-fee-dashboard
fix/fix-timetable-overlap
```

Regularly pull from `dev` to keep your branch updated.

---

## 7. Testing
* **Automated Tests:** Add/update tests for new features or bug fixes.
* **Local Testing:** Run all tests locally before PR submission.
* **Manual Verification:** Confirm functionality across relevant browsers/devices (especially for core flows like attendance, fees, and timetables).

---

## 8. Documentation
* Update **README.md** or add documentation when adding/modifying features.
* Add **inline comments** in code where clarity is needed.
* For major features (e.g., attendance modes, fee flows, analytics), update the docs in the respective domain folder.

---

## 9. Additional Resources
* [The Art of Pull Requests](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)
* [Conventional Commits](https://www.conventionalcommits.org/)

---

Thank you for contributing to **Open School Portal** and helping us build a reliable platform for schools, teachers, parents, and students.
