# QuizCard Generator / PostSquare Studio

A dark-mode 1:1 square quiz card and LinkedIn Document Carousel generator.

## Features
- **4-Block Grid View**: 1:1 square cards for social media posts (Option A, B, C, D).
- **LinkedIn Document Carousel (8-Slide PDF)**:
  - Slide 1: Hook / Title cover
  - Slide 2: Question scenario & hints
  - Slide 3–6: Individual options (A, B, C, D)
  - Slide 7: Engagement / Reflection prompt
  - Slide 8: Answer reveal (2-Block split: Hero Correct Answer + Traps Breakdown)
- **High-Res Lossless Exports**:
  - 1080×1080px crisp PNG exports
  - Multi-page 1080×1080px PDF exports with exact color matching
- **Smart Paste**: Intelligent parser for questions, options, and explanations with auto-detection of correct answers.
- **Client-Side & Offline Ready**: 100% browser-based with zero external backend dependencies.

## Local Usage
To start the local server:
```bash
./start_server.sh
```
Open [http://localhost:8088](http://localhost:8088) in your browser.

To stop the server:
```bash
./stop_server.sh
```

## GitHub Pages Deployment
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages** > **Deploy from a branch**.
3. Select `main` branch and `/ (root)` folder.
