# Liveleaf User Onboarding & Subscription UI/UX Plan

## 1. User Journey & State Flow

```text
App Launch
   ↓
Auth Landing / Login
   ├─ Login success → Dashboard
   └─ Login failure → Account recovery / sign-up redirect

Sign Up Wizard
   ├─ Step 1: Credentials
   ├─ Step 2: Personal Profile
   ├─ Step 3: Planting Goal
   └─ Complete → Project Brief

Project Brief
   └─ Continue → Subscription Plans

Subscription Plans
   ├─ Premium selected → Dashboard
   └─ Free selected → Dashboard

Dashboard
   └─ Personalized greeting + user metadata / plan badge
```

## 2. Screen Specifications

### Auth Landing

- Full-page soft green background matched to the dashboard aesthetic
- Centered card with white background, rounded corners, and subtle shadow
- Header includes the compact Liveleaf logo and a login/sign-up switcher

### Login Form

- Email + password fields with icon-led input styling
- Validation for empty or incorrect credentials
- Recover flow: if login fails, show an account-recovery banner with actions for sign-up and email verification

### Sign Up Wizard

- Multi-step flow with 3 steps and progress indicator
- Step 1: name, email, password
- Step 2: age and experience level
- Step 3: planting goal radio cards
- Educational callout explaining AI personalization impact

### Project Brief

- Animated green atmospheric background with falling leaf motion
- 3-step carousel or slide content focused on sensor monitoring, AI diagnosis, and offline sync
- CTA button to proceed to plans

### Subscription Plans

- Side-by-side card layout for Free vs Premium
- Premium plan priced at `$5.00 / month`
- Buttons for selecting premium or continuing free

### Dashboard Header

- Personalized greeting: `Welcome back, {user.name}! 🌿`
- metadata chips for planting goal, subscription status, and account info

## 3. Implementation Sequence

1. Create app-level flow state and onboarding data model.
2. Build reusable compact Liveleaf logo and auth landing shell.
3. Build login form with validation and recovery actions.
4. Implement multi-step signup wizard.
5. Add animated project brief screen.
6. Implement pricing and plan selection screens.
7. Update dashboard header to include personalized greeting and user metadata.
8. Verify state transitions and build the app.

## 4. AI Prompt Guide

### Prompt 1

"Create a `LoginForm` component for the Liveleaf app with a centered card, Liveleaf branding, email and password fields, and a validation flow. Include an error banner on failed login that offers a sign-up redirect and a send-code-to-email action. Use Tailwind CSS and a modern white card / green accent design."

### Prompt 2

"Build a 3-step `SignUpWizard` component for Liveleaf with fields for name, email, password; age and experience level; and a planting-goal selection using radio cards. Include a progress indicator and an informational note connecting the goal to Gemini AI diagnosis."

### Prompt 3

"Create an animated `ProjectBriefScreen` component with a soft green background, falling-leaf animation, and a 3-slide overview of Liveleaf sensor monitoring, AI diagnosis, and offline resilience. Include a CTA to continue to subscription plans."

### Prompt 4

"Build a `SubscriptionPlansScreen` with two pricing cards: Free ($0) and Premium ($5/month). Show premium features clearly and include actions for selecting premium or continuing with free."

### Prompt 5

"Update the app-level state flow to switch between auth landing, signup wizard, project brief, subscription plans, and dashboard screens. Store user details such as name, email, age, plantingGoal, and planTier, and personalize the dashboard greeting on success."
